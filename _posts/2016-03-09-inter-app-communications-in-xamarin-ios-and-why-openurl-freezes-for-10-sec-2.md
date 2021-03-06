---
id: 4061
title: Inter-App Communications in Xamarin.iOS and Why OpenUrl Freezes for 10+ sec
date: 2016-03-09T13:23:07+00:00
author: has
layout: post
guid: http://www.hasaltaiar.com.au/?p=4061
permalink: /inter-app-communications-in-xamarin-ios-and-why-openurl-freezes-for-10-sec-2/
categories:
  - 'C#'
  - iOS
tags:
  - iOS
  - scheme uri
  - xamarin
---
## Inter-App Communications

Mobile apps are meant to communicate using multiple channels, but the most popular, recommended, and widely used is using <a href="https://developer.apple.com/library/ios/featuredarticles/iPhoneURLScheme_Reference/Introduction/Introduction.html" target="_blank">Scheme Uri</a>. If you have not used Scheme URI then you should consider adding them to your app, it takes less than a minute to add support to your app, and it provides you a great way to get users to your app. 

## Setting the Stage

One scenario that I had was App A was launching App B and querying data, App B was in turn looking up the request, and returning data to App A. This is a common practice and can be seen in the diagram below. <figure id="attachment_4071" style="width: 1054px" class="wp-caption aligncenter">

<a href="https://i1.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2016/03/scheme-uri-ios.png" rel="attachment wp-att-4071"><img src="https://i1.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2016/03/scheme-uri-ios.png?resize=525%2C222" alt="Scheme uri ios" width="525" height="222" class="size-full wp-image-4071" data-recalc-dims="1" /></a><figcaption class="wp-caption-text">Scheme uri ios</figcaption></figure> 

## The Investigation

The problem here was that App B was freezing for up to 10+ sec before returning the result to App A. At first, I thought that this might be because the app initialisation or the data lookup taking long time, so I added diagnostic trace statements like below to time the operation and see where the time is spent. 

<pre class="brush: csharp; title: ; notranslate" title="">public class AppDelegate
{
	...
	
	public override bool FinishedLaunching(UIApplication app, NSDictionary options)
	{
		Console.WriteLine("FinishedLaunching started: " + DateTime.Now.ToString("F"));

		...
		
		Console.WriteLine("FinishedLaunching complete: " + DateTime.Now.ToString("F"));
	}

	public override bool OpenUrl(UIApplication application, NSUrl url, string sourceApplication, NSObject annotation)
	{
		Console.WriteLine("OpenUrl started: " + DateTime.Now.ToString("F"));

		...
		

		Console.WriteLine("OpenUrl complete: " + DateTime.Now.ToString("F"));
	}
}

</pre>

I found that my app was starting in less than 1 Sec, which is quite impressive, and I am very happy about 🙂 but the problem was in returning the data to the launching app (App A). The traces were like these: <figure id="attachment_4081" style="width: 1098px" class="wp-caption aligncenter">

<a href="https://i0.wp.com/has-blog.azurewebsites.net/wp-content/uploads/2016/03/Launch-Services-application-launch-failed-timeout-waiting-Trace-logs.png" rel="attachment wp-att-4081"><img src="https://i0.wp.com/has-blog.azurewebsites.net/wp-content/uploads/2016/03/Launch-Services-application-launch-failed-timeout-waiting-Trace-logs.png?resize=525%2C78" alt="Launch Services application launch failed - timeout waiting - Trace logs" width="525" height="78" class="size-full wp-image-4081" data-recalc-dims="1" /></a><figcaption class="wp-caption-text">Launch Services application launch failed &#8211; timeout waiting &#8211; Trace logs</figcaption></figure> 

This is telling me that App B was not able to launch App A to return back the data, which was quite surprising. I found that if you move that code to your pages/viewControllers things work fine. I thought that this was a bizarre situation, then I found <a href="http://stackoverflow.com/questions/19356488/openurl-freezes-app-for-over-10-seconds/35861848#35861848" target="_blank">this StackOverflow post</a>, which explained the problem. 

## The Solution

Apparently, the iOS was having a race-condition like in trying to launch an app while the app itself was not fully launched. So the suggested solution was to add some delay or run it on another thread. Running the launch of App A on another thread would not work as it needs to be on the mainUiThread, so here is the solution I came up with:

<pre class="brush: csharp; title: ; notranslate" title="">public class AppDelegate
{
	...
	
	public override bool OpenUrl(UIApplication application, NSUrl url, string sourceApplication, NSObject annotation)
	{
		// handle opening url and look up data

		...

		Task.Delay(500).ContinueWith(_ =&gt; 
				{									
					this.InvokeOnMainThread( () =&gt; 
					{			
						var uri = NSUrl.FromString(callbackUri);
						UIApplication.SharedApplication.OpenUrl(uri);
									
					});

				});

		return true;
		
	}
}

</pre>

> **_<Warning>: LaunchServices: application launch failed &#8211; timeout waiting for launch._**

This works like a charm :). First, we got rid off the launch service error (see below). Second, App B is now returning the results to App A in less than 3 sec. If App B is in the background then it would return the data in less than 1 sec. Otherwise, it would take up to 3 sec to return the data. yayyy 🙂