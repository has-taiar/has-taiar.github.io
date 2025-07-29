---
id: 4107
title: MassTransit approach for handling errors
date: 2016-07-28T12:23:57+00:00
author: has
layout: post
guid: http://www.hasaltaiar.com.au/?p=4107
permalink: /masstransit-approach-for-handling-errors-when-consuming-messages-2/
categories:
  - .NET
  - Azure
  - 'C#'
  - Cloud
  - Development Practices
tags:
  - azure
  - masstransit
  - resilience
  - servicebus
---
<img class="aligncenter" src="https://i2.wp.com/docs.masstransit-project.com/en/latest/_images/mt-logo.png?w=525" alt="MassTransit" data-recalc-dims="1" />

## What&#8217;s MassTransit?

It&#8217;s an awesome, open-source framework for delivering messages. From their <a href="http://masstransit.readthedocs.io/en/master/" target="_blank">docos</a>:

MassTransit is a free, open source, lightweight message bus for creating distributed applications using the .NET framework. MassTransit provides an extensive set of features on top existing message transports, resulting in a developer friendly way to asynchronously connect services using message-based conversation patterns. Message-based communication is a reliable and scalable way to implement a service oriented architecture.

## Why error-handling is so important here?

Let&#8217;s face it, things are going to fail, and bad things happen. One would hope that it would not happen often, but it would happen :). So what&#8217;s going to happen when message fails to be consumed properly? Should it be retried, should it be ignored, etc. For most systems, a retry is required.

## MassTransit 3.0 Approaches

The design of MassTransit&#8217;s approach to handling errors seems to be influenced by <a href="http://docs.particular.net/nservicebus/" target="_blank">NServiceBus </a>way of handling errors. In NServiceBus, the coin the terms <a href="http://docs.particular.net/nservicebus/errors/automatic-retries" target="_blank">First Level Error Handling, and Second Level Retry</a>. Similarly in MassTransit, there are basically 2 main approaches out-of-the-box to handle retrial:

### First Level Retry (Global Retry Policy)

This is the global setting that you set when you create your transport channels and should be part of your global bus settings. There is a number of extension methods to help you set the retry polices based on the underlying transport you are using (RabbitMQ, Azure Service Bus, etc). In my case, I am using Azure Service Bus, so here is how we set up our global level retries:

<pre class="brush: csharp; title: ; notranslate" title="">MassTransit.Bus.Factory.CreateUsingAzureServiceBus(cfg =&gt;
{
	// needs this to enable MassTransit to reschedule the delivery of messages 
	cfg.UseServiceBusMessageScheduler();
	var a = 3;
	var b = 5;
	var c = 30;
	var d = 10;
	var retryPolicy = new ExponentialRetryPolicy(new AllPolicyExceptionFilter(), a , TimeSpan.FromSeconds(b), TimeSpan.FromSeconds(c),TimeSpan.FromSeconds(d));
	cfg.UseRetry(retryPolicy);
				
	IServiceBusHost host = cfg.Host(SendEndpointUri, h =&gt;
	{
		// Configuring the SAS here
	});

	cfg.ReceiveEndpoint(host, ec =&gt; { ec.LoadFrom(ctx);});
});
</pre>

In this scenario, MassTransit will retry for the specified number of retries if handling a message failed. This means when MassTransit calls the Consume() method on the EventConsumer the method does not complete properly (ie throws an exception). Thus, if you are using this approach, you need to make sure that you bobble up your exceptions when consuming events, to allow MassTransit to redeliver the message again.

The good thing about this is that you do not need to check for how many times we tried or adding some waiting time between these retries. This is already done for us by Mass-transit retrial config extension. If you look at the code above where we configure the retrial policy, we tell MassTransit the following:

1. If a message failed to be consumed, then redeliver it for the max no of a.
  
2. If a message failed to be delivered, wait a period of time between b and c, with an interval value of d.

This is very useful as it gives our system (event consumers) a time to recover from transient failures before redelivering the message again. However, be warned, there are major implications to handling messages this way because your messages might end up being out of order, which could be critical for some systems. Thus, if this is the case, this approach might not be the best fit for your system.

### Second Level Retry: (Explicit use of Context.Redeliver())

MassTransit provides another <a href="http://docs.masstransit-project.com/en/master/scheduling/redeliver.html?highlight=second%20level%20retry" target="_blank">approach for redelivering</a> (failed-to-consume) messages. This is more explicit and leaves it to the consumer to decide whether it wants to redeliver the message or not. this can be done like:

<pre class="brush: csharp; title: ; notranslate" title="">public class TestEventsConsumer : IConsumer&lt;SomeImportantEvent&gt;
{
	public Task Consume(ConsumeContext&lt;SomeImportantEvent&gt; context)
	{
		try
		{
			await someActionHere();
		}
		catch (Exception exception)
		{
			context.Redeliver(TimeSpan.FromSeconds(5));

			// some more logging and stuff here
		}			
	}
}
</pre>

As you can see, in this approach, we are calling Redeliver() directly, so we are making the decision when a message should be retried. The good thing about this approach is that we decide what is retried and when. This could be important as you might not be able to find one-size-fits-all kind of solution, which would prevent you from using the global approach above.

On the other hand, the Redeliver() method does not check for any maximum number of retries. Therefore, if you do it like I did above, you will end up with a faulty message that just keeps being redelivered over and over again, until it&#8217;s time to live expires. This might be describable behavior for some systems (not in my case 🙂 ) but it is not really the norm in most cases that I have seen. Therefore, you would want to have a maximum number of retries, in which you can call the redeliver() method. We can modify the code above to do that like this:

<pre class="brush: csharp; title: ; notranslate" title="">public class TestEventsConsumer : IConsumer&lt;SomeImportantEvent&gt;
{
	const int MAX_NO_OF_SECOND_LEVEL_RETRY = 5;
	const int NO_OF_SECONDS_TO_WAIT_BEFORE_REDELIVERING = 5;
	public Task Consume(ConsumeContext&lt;SomeImportantEvent&gt; context)
	{
		try
		{
			await someActionHere();
		}
		catch (Exception exception)
		{
			int n;
			var redeliverCount = context.Headers.Get("MT-Redelivery-Count", "-1");
			if (int.TryParse(redeliverCount, out n) && n &lt;= MAX_NO_OF_SECOND_LEVEL_RETRY)
				context.Redeliver(TimeSpan.FromSeconds(NO_OF_SECONDS_TO_WAIT_BEFORE_REDELIVERING));

			// some more logging and stuff here
		}
	}
}
</pre>

Note, if you using RabbitMQ, then you might need to deploy and start the QuartzService service to enable MassTransit to schedule the redelivery of messages. More details can be found <a href="https://groups.google.com/forum/#!msg/masstransit-discuss/fcm_2nGRHfI/2nP7qhypCQAJ" target="_blank">here</a>. I hope you find this useful and I would love to hear your comment, if you have something to say 🙂