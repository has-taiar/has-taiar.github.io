---
id: 3801
title: 'Universal Links: The Natural Evolution of Custom Scheme URI on the Mobile'
date: 2015-11-03T10:19:56+00:00
author: has
layout: post
guid: http://www.hasaltaiar.com.au/?p=3801
permalink: /setting-up-universal-links-on-xamarin-ios-mobile-apps/
categories:
  - .NET
  - Azure
  - 'C#'
  - iOS
tags:
  - iOS
  - mobile
  - scheme uri
  - universal links
  - xamarin
---
## What is Scheme URI?

In the context of mobile apps, Scheme URIs are used for communicating between mobile apps. Mobile developers can register a unique URI for each app in the application manifest (info.plist). The operating system would then use that to launch your application once the user clicks on a link that matches your uri. For instance, I could have my-cool-app:// as my scheme uri. I could then generate links (should start with my-cool-app://) to send in my email to my app&#8217;s users and once clicked, my app will be launched. These have become standard and they are widely supported on iOS, Windows, and Android. 

## What is Universal Links?

Universal Links is a new feature that was introduced by Apple in iOS 9. The idea is instead of registering a scheme Uri, you could use your own website domain name (which is inherently unique) and associate this domain name with your mobile app. Once the user clicks on a http/https link that links to your domain name, iOS would then launch your mobile application instead of opening the link in Safari. More details about Universal Links could be found in WWDC session <a href="https://developer.apple.com/videos/play/wwdc2015-509/" target="_blank">here</a> and Apple&#8217;s Docs <a href="https://developer.apple.com/library/prerelease/ios/documentation/General/Conceptual/AppSearch/UniversalLinks.html" target="_blank">here</a>.

## Why Do we need Universal Links?

If you have used Scheme URIs before to open your mobile apps, you would have felt the pain of trying to keep your links valid to open your app (when installed) and fallback to the web links when your app is not installed. But this was not a simple task, and there was no guarantee that this would work exactly the way you want. Therefore, Apple has introduced Universal Links, which is great. Imagine how many times you get url link via email and you click it to end up in the browser asking you for username and password. Most people do not remember their accounts (at least not for all accounts), or they want to see this content on the mobile app instead of Safari. This new feature (Universal Links) solves this problem. 

## How Can we Enable Universal Links?

To enable Universal Links, you need to follow the following steps:

1. Enable &#8220;Associated Domains&#8221; on your Application Id (in Apple Developer portal). <figure id="attachment_3831" style="width: 1352px" class="wp-caption aligncenter">

[<img src="https://i0.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2015/11/Apple-Account-Associated-Domains.png?resize=525%2C198" alt="Enable Associated Domains in your App Identifier settings - Apple Dev Portal" width="525" height="198" class="size-full wp-image-3831" data-recalc-dims="1" />](https://i0.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2015/11/Apple-Account-Associated-Domains.png)<figcaption class="wp-caption-text">Enable Associated Domains in your App Identifier settings &#8211; Apple Dev Portal</figcaption></figure> 

2. Create an **apple-app-site-association** file on your domain. This is just a text file that contains a JSON object to describe your universal links. You could associate multiple link paths with multiple apps. notice that your app id need to have your full app identifier (TeamName.Appid). Sample of the JSON content is here:

<pre class="brush: csharp; title: ; notranslate" title="">{
        “applinks”: {
            “apps”: [],
            “details”: [
                {
                    “appID”: “ABC-Team-Id.com.my.bundle.id“,
                    “paths”: [ “/”, “*” ]
                }
            ]
        }
    }
</pre>

The content of this file need to be served over HTTPS and notice that there is no extension. The name would have to match too (apple-app-site-association). Apple will try to retrieve this file from your domain before it launches your app for the first time. This is to verify the authenticity of your domain ownership before starting the app. If you are hosting this file on an azure website, you might also need to add a static content mapping in your web.config. The bottom line is you need to make sure that you can navigate to this file as https://your-domain.com/apple-app-site-association. There is also a small app that helps you verify your apple association file, you could find it <a href="https://limitless-sierra-4673.herokuapp.com/" target="_blank">here</a>. Do not worry about the last 2 errors that it displays concerning signing your file. I have my Universal Links work without signing the association file, but this web page is still good to verify other aspects of the association file. 

3. Add the Universal Links Entitlement to your info.plist. This can be done very simply by navigating to your Entitlements.plist and add the new applinks as follows:<figure id="attachment_3841" style="width: 1902px" class="wp-caption aligncenter">

[<img src="https://i1.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2015/11/Applinks-in-Entitlments-plist-file.png?resize=525%2C363" alt="Applinks in Entitlments-plist file" width="525" height="363" class="size-full wp-image-3841" data-recalc-dims="1" />](https://i1.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2015/11/Applinks-in-Entitlments-plist-file.png)<figcaption class="wp-caption-text">Applinks in Entitlments-plist file</figcaption></figure> 

4. Regenerate your provisioning profiles. This is very important since we changed our app id entitlements. Otherwise, you will get an error message when trying to build the app saying that you have entitlements that are not permitted by your provisioning profile. 

5. OPTIONAL: Override this method (ContinueUserActivity) in your app&#8217;s delegate to capture the url link that the user clicked on. This is necessary when you want to take the user into the particular screen that they are after. For instance, if the user clicked on a link to view a product on your website, you could capture the link in this method and once your app opens up, view the details of that product on your mobile app. 

<pre class="brush: csharp; title: ; notranslate" title="">public override bool ContinueUserActivity (UIApplication application, NSUserActivity userActivity, UIApplicationRestorationHandler completionHandler)
{
	Console.WriteLine ("ContinueUserActivity method has been called............");
	// you can get the url that the user clicked on here.		
	return true;
}
</pre>

Once all the above is done, you can build and deploy to your device. I have tested my implementation by creating a link to my associated domain and sent it via email to the device. When I click on the link, I get redirected to my app directly (without going through Safari). <figure id="attachment_3871" style="width: 637px" class="wp-caption aligncenter">

[<img src="https://i2.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2015/11/Applinks-in-the-mobile-app-screenshot.png?resize=525%2C134" alt="Applinks in the mobile app - screenshot" width="525" height="134" class="size-full wp-image-3871" data-recalc-dims="1" />](https://i2.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2015/11/Applinks-in-the-mobile-app-screenshot.png)<figcaption class="wp-caption-text">Applinks in the mobile app &#8211; screenshot</figcaption></figure> 

Notice that Apple give the user the option to stay on my app or go directly the browser (upper right link) or go back to the email that launched my app. I really like this design because it keeps the user in charge. Also, there are few posts that suggest once the user taps on the link to go to the browser, Apple would then bypass your app for this link and take the user directly to the website in the future. I have not verified this but you could find the details <a href="http://stackoverflow.com/questions/32751225/ios9-universal-links-does-not-work#32751734" target="_blank">here</a>. 

## How about devices that are still using older versions of iOS?

What we have seen above is very cool stuff and I have been hoping for this for years. However, this only solves the problem on a subset of devices. Remember there are still lots of devices out there that are not using iOS 9. If you are like me and required to support iPhone 4, then you need to have a fallback mechanism on devices that do not support Universal Links. For this scenario, we could have a simple JavaScript code that helps us redirect to our mobile app, if this redirection fails, then we assume that the app is not installed and we redirect the user to our web url. A sample of this is below, and more details can be found <a href="http://stackoverflow.com/questions/1108693/is-it-possible-to-register-a-httpdomain-based-url-scheme-for-iphone-apps-like" target="_blank">here</a>:

<pre class="brush: jscript; title: ; notranslate" title="">// this could needs to sit in your website page
setTimeout(function() {
  window.location = "http://my-domain-app"; // or your could put  link to your app on iTunes
}, 25);

// If "my-cool-app://" is installed the app will launch immediately and the above
// timer won't fire. If it's not installed, you'll get an ugly "Cannot Open Page"
// dialogue prior to the App Store application launching
window.location = "my-cool-app://";

</pre>

## Future-Proofing

It would be very interesting to see how apple will use this to integrate apps more with the web. Apple has already done a great work in terms of search and user activity that is bridging the gap between web and native apps. Universal Links is another step in the right direction. 

## How about Android?

Although most of the contents of this post is related to iOS, Android implementation is quite similar. Google Introduced this in Android M and more details could be found in the documentation <a href="https://developer.android.com/training/app-links/index.html" target="_blank">here</a>.