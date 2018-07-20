---
id: 431
title: 'Push Notifications to all platforms using a web Api (c# and .Net)'
date: 2014-01-13T14:50:10+00:00
author: has
layout: post
guid: http://www.hasaltaiar.com.au/?p=431
permalink: /push-notifications-to-all-platforms-using-a-web-api-c-and-net/
categories:
  - .NET
  - Android
  - 'C#'
  - Cloud
  - Code Quality
  - iOS
---
## UPDATE 07/01/2015

This blog post was written a long time back. At the time, I could not find a free platform for sending push notifications to multiple mobile platforms. Thus, I forked PushSharp and started wrapping it in a web app. Since then, many similar services have come light. Microsoft Azure does currently provide a similar platform and the cost is quite reasonable. The content here still valid if you are interested in building your own notification server to save on cost. For more info about Azure Push Notifications, see <a href="http://azure.microsoft.com/en-us/documentation/articles/mobile-services-dotnet-backend-ios-get-started-push/" title="Azure Documentation - Mobile Services .NET backend and iOS Get Started with Push Notifications" target="_blank">this on MSDN</a>

This post shows how to use <a href="https://github.com/has-taiar/PushSharp.Web" target="_blank">PushSharp.Web</a> to send push notifications from anywhere using a Web Api wrapper around lovely <a href="https://github.com/Redth/PushSharp" target="_blank">PushSharp</a>.

<img class="size-full wp-image-441" alt="PushSharp" src="https://www.hasaltaiar.com.au/wp-content/uploads/2014/01/PushSharp-Diagram.png" width="501" height="386" /><br />
<span>PushSharp library</span> 

Recently, I was tasked to implement a Push Notification teir on our Server end when certain conditions are met.
  
I needed to send Push Notifications to iOS, Android, and Windows Phones.

After doing some investigation, I found that <a href="https://github.com/Redth/PushSharp" target="_blank">PushSharp </a>was the best candidate available to help me send to multiple platforms in one languages.

The Problem was my sever application was using .NET 3.5 CF, and we cannot update just yet. We still support lots of apps that are operating on Windows Mobile 6, and that was the catch. PushSharp needs .Net either 4.0 or 4.5 to work, that is because it uses many of .NET 4.0 libraries such as TPL (Task Parallel Library). I thought of few other solutions like making the PushSharp a windows phone and getting my app to talk to it via some interop channels, but I thought that was going back.

Thus, I ended up creating a new WebApi that acts as a wrapper around PushSharp. That way, the PushNotifications can be separate and I can use the same WebApi to build more functionality that is not available for me in .NET 3.5. Having said that, This WebApi can be used with any other platform or language. The fact that it exposes the sending of Push Notifications as a webApi service makes it available for any platform or language that you are using.
  
You could use it from PHP, Ruby, etc.

The whole source code is available under <a href="https://github.com/has-taiar/PushSharp.Web" target="_blank">GitHub</a>, have a look and feel free to fork and do whatever you like with it.

Few things to note:

1. Apple Certificate settings need to be set in the Web.Config before hand. (if you plan to send to iOS devices)
  
2. Google Api key needs to be set in the Web.Config (if you intend to send to Android Devices)
  
3. Same with other platforms like Windows Phone, and Windows Store settings.
  
4. The WebApi app makes use of NLog, so the config file is separate from the Web.Config and you could update it to your needs.

I would love to hear your thoughts about how great or terrible job I have done. If you like it, please do get in touch by leaving a comment down this page.
