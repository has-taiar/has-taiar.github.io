---
id: 3611
title: Azure ApplicationsInsights for Xamarin iOS
date: 2015-08-06T09:27:02+00:00
author: has
layout: post
guid: http://www.hasaltaiar.com.au/?p=3611
permalink: /azure-applicationsinsights-for-xamarin-ios-2/
categories:
  - .NET
  - Android
  - Azure
  - 'C#'
  - Cloud
  - Code Quality
  - iOS
tags:
  - application-insights
  - azure
  - debugging
  - instrumentation
  - quality
---
Azure ApplicationInsights (AI) is a great instrumentation tool that can help you learn about how your application is doing during run-time. It is currently in Preview mode, so bear that in mind when developing production ready apps. It gives you the ability to log lots of different kinds of information like tracing, page views, custom events, metrics and more. 

Azure AI supports multiple platforms, but unfortunately they have not released a Xamarin package yet. There is <a href="https://github.com/Microsoft/ApplicationInsights-Xamarin" target="_blank">one library</a> which is for Xamarin.Forms since it uses the DependencyResolver. I have taken that and removed that dependency to make it compatible with Xamarin.iOS. You could do the same thing to use it for Xamarin.Android too if you like.

It&#8217;s very simple to use, all you need is your instrumentationkey which you can get from your Azure portal. Follow the steps from the MSDN tutorial as you can see <a href="https://azure.microsoft.com/en-us/documentation/articles/app-insights-get-started/" target="_blank">here</a> to create the Azure AI instance and get your key. Once done, you could download and reference the repository that I have created on GitHub, as you can find it <a href="https://github.com/has-taiar/Azure.ApplicationInsight.Xamarin" target="_blank">here</a>. 

To start Azure AI on your Xamarin iOS app, you could do:

<pre class="brush: csharp; title: ; notranslate" title="">AzureAIManager.Setup();

	AzureAIManager.Configure("my-user-or-device-name");

	AzureAIManager.Start();

</pre>

The implementation of the AzureAIManager is as follows:

<pre class="brush: csharp; title: ; notranslate" title="">public static class AzureAIManager
	{
		public static void Setup(string appKey = "your-azure-AI-instrumentation-key")
		{
			AI.Xamarin.iOS.ApplicationInsights.Init();

			var ai = new AI.Xamarin.iOS.ApplicationInsights ();
			ApplicationInsights.Init (ai);

			TelemetryManager.Init(new AI.Xamarin.iOS.TelemetryManager());
			ApplicationInsights.Setup(appKey);

		}

		public static void Start()
		{
			ApplicationInsights.Start();
		}

		public static void Configure(string userId = "" )
		{
			ApplicationInsights.SetAutoPageViewTrackingDisabled(true);

			if (string.IsNullOrEmpty(userId))
				ApplicationInsights.SetUserId(userId);
		}

		public static void RenewSession()
		{
			ApplicationInsights.StartNewSession();
		}
	}

</pre>

I have not put this as a Nuget package because I am sure Microsoft will release one very soon, so until that happens, you can use this bindings to play around with Azure AI and you could even use it on your small projects.