---
id: 2241
title: How I reduced the Worker Role time from above 5 hrs to less than 1 hour
date: 2014-08-10T20:15:03+00:00
author: has
layout: post
guid: http://www.hasaltaiar.com.au/?p=2241
permalink: /how-i-reduced-the-worker-role-time-from-above-5-hrs-to-less-than-1-hour-2/
categories:
  - .NET
  - Azure
  - 'C#'
  - Cloud
  - Code Quality
tags:
  - featured
---
This post talks about my experience in reducing the execution time of the Worker Role from above 5 hours to under 1 hour. This Worker Role is set up to call some external APIs to get a list of items with their promotions and store them locally. A typical batch update process that you would see in many apps. Our client was only interested in quick fixes that would help them reduce the time it is taking the Worker Role to run. We were not allowed to change the architecture or make a big change as they had a release deadline in few weeks. So here is what I have done. 

## Profiling

Before I start doing any changes, I started by profiling the application to see where the bottleneck is. Quite often you find people doing &#8220;optimisations and bug fixes&#8221; without pre-defined metrics. This is a big mistake as you cannot measure what you cannot see. You need to quantify the issue first then start applying your changes. 

## Database

As we started to see the statistics of how slow the worker role was running, we started to understand that there is problem in the way we are interacting with the database. The worker role **deletes** all items and then inserts them again. Do not ask me why delete and insert again, that &#8216;s a question to the solution architect/developer of the worker role to answer. Data insertion is happening in huge volumes (millions of records). To reduce the time it is taking for these db transactions, I did the following changes:

1. Disabling Entity Framework Changes Tracking
  
Entity Framework keeps track of all changes to any entity object in memory to facilitate inserting/updating/deleting records from the database. While this is a good thing when you are using one/few objects, it is a killer when you dealing with millions of records simultaneously. To do that, you just need to configure your EF context to disable changes tracking:

<pre class="brush: csharp; title: ; notranslate" title="">dbContext.Configuration.AutoDetectChangesEnabled = false;
</pre>

2. Disabling Entity Framework Validation feature
  
Similar to the first change, we do not need to add extra overhead just for validating if we are certain of our data. So we switched off EF validation:

<pre class="brush: csharp; title: ; notranslate" title="">dbContext.Configuration.ValidateOnSaveEnabled = false;
</pre>

**3. Individual Insert vs Bulk Insert**
  
One of the things I found in the worker role is that it is inserting the records one by one in a foreach statement. This could work fine for few items and you would not notice the difference, but when it comes to huge volumes, this kills the performance. So I thought of building an extension for EF context to insert data in bulk, but fortunately I found that somebody has already done that. <a href="https://efbulkinsert.codeplex.com/" target="_blank">EF.BulkInsert</a> is an extension for EF that allows you to insert in bulk. It is basically a group of extension methods to your EF context. It is a very lightweight and it works great. The authors show on the project home page that having bulk insert is _more than 20 times faster than individual inserts_. When using such extension, make sure to configure the settings properly. Things like BatchSize, Timeout, DataStreaming, etc. 

**4. Transactions**
  
I see this quite often that developers surround their db code with a transaction, and it might be a good thing on paper, but you need to understand the implication of this transaction. Such transactions slow down the whole process, add a huge overload on the db server and the app server, and makes even rolling back or committing harder. Moreover, EF 6 and above already adds a transaction scope for your changes when committing them, so you will either have your changes committed or rolled back, so we there was no need for such a transaction scope, I got rid off it. 

## Computing

Another bottleneck that I found was in the way we are generating tags. This is just meta data about items and their grouping. It was taking a huge amount of time to loop through all items and create these tags, categories, groups, etc. This was all happening in memory. The change I made to this was very simple but substantial, just made it run in parallel, like this:

<pre class="brush: csharp; title: ; notranslate" title="">Parallel.ForEach(products, (product) =&gt;
	{
		// code for generating tags, categories, etc
	});
</pre>

If you are trying this, make sure that your code is thread-safe. I had to fix few issues here or there as in my case the code was not thread-safe, but this was a small change. Also, if you are using a shared list among threads, then you might want to consider using a <a href="http://msdn.microsoft.com/en-us/library/dd997305(v=vs.110).aspx" target="_blank">thread-safe collection</a> like ConcurrentDictionary or ConcurrentBag. 

## External Resources

The list of items and promotions was accessed from an external API. The worker role was accessing this list for 7 main api endpoints (7 different stores) before starting to process the data. This was very slow. To speed this up, I had to fire multiple request in parallel, similar to what I have done with generating tags, as below:

<pre class="brush: csharp; title: ; notranslate" title="">var endPoints = new[] {1, 2, 3, 4, 5, 6};            
	Parallel.ForEach(endPoints, (apiEndpoint) =&gt;
	{
		// code for calling external API
	});
</pre>

Also, we started caching some of the info that we were accessing from the API locally, this saved us a lot of time too. 

Doing these small changes above took me less than a day but it had made a huge impact on the way the worker role is running. Having an app running for such a long time in the cloud could cost you lots of money, which my client did not mind. What they really hated was the fact that it is failing so many times. The fact that you need to wait 5 hours means that it is more error-prone, connections could drop, database would timeout, etc. Plus, whenever developers are making any changes, they had to wait for a long time when testing the worker role locally or on the server. 

In conclusion, making small changes have benefited my client significantly and they were very satisfied. I hope you find these tips useful, and I would love to hear your thoughts. If you are struggling with a long running process, then get in touch and we will happily help you out.