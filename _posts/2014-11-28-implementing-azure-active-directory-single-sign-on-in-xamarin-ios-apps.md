---
id: 2541
title: Implementing Azure Active Directory SSO (Single Sign on) in Xamarin iOS apps
date: 2014-11-28T09:12:58+00:00
author: has
layout: post
guid: http://www.hasaltaiar.com.au/?p=2541
permalink: /implementing-azure-active-directory-single-sign-on-in-xamarin-ios-apps/
categories:
  - .NET
  - Android
  - Azure
  - 'C#'
  - Cloud
  - iOS
tags:
  - Access Control
  - Android
  - Authentication
  - azure
  - azure active directory
  - iOS
  - Mobile Apps
  - Security
  - Single SignOn
---
This blog post is the first in a series that cover Azure Active Directory SSO Authentication in native mobile apps. 

  1. **Authenticating iOS app users with Azure Active Directory. (this post)**
  2. [How to Best handle AAD access tokens in native mobile apps](http://www.hasaltaiar.com.au/how-to-best-handle-aad-access-tokens-in-native-mobile-apps/)
  3. [Using Azure SSO tokens for Multiple AAD Resources From Native Mobile Apps](http://www.hasaltaiar.com.au/using-azure-ad-sso-tokens-for-multiple-aad-resources-from-native-mobile-apps/)
  4. [Sharing Azure SSO access tokens across multiple native mobile apps.](http://www.hasaltaiar.com.au/sharing-azure-active-directory-sso-access-tokens-across-multiple-native-mobile-apps/)

### Brief Start

2 weeks ago the Azure team released the ADAL (ActiveDirectory Authentication Library) library to enable developers implement a SSO (single sign on) functionality to Azure AD. This was great news for me as I have few clients who are keen on having this feature in their apps. In this blog post, I will share my experience in implementing Azure AD SSO on Xamarin.iOS apps. 

### Mobile Service Auth vs AAD Auth

First things first, if you are using Azure mobile services, then the authentication could be handled for you by Azure Mobile Services library itself. All you need to do is to pass a reference of your **RootViewController** to the library and call **LoginAsync()** as follows:

<pre class="brush: csharp; title: ; notranslate" title="">// Initialize the Mobile Service client with your URL and key
client = new MobileServiceClient (applicationURL, applicationKey, this);
user = client.LoginAsync (_controller, MobileServiceAuthenticationProvider.WindowsAzureActiveDirectory);

</pre>

This will give you a user object (after it authenticates the user with Azure) and you could use that user for your future calls. This is slightly different from what we are going to talk about in this blog post. For further details on handling Azure Mobile Services authentication, you could check out <a href="http://azure.microsoft.com/en-us/documentation/articles/mobile-services-windows-store-dotnet-get-started-users/" target="_blank">this tutorial</a> from the MSDN library. 

### Azure AD Auth

This blog post is to show you how you could authenticate users against Azure AD. This could be useful in many cases. Say you have a mobile app and you only want users in a certain Active Directory (local or on Azure[1]) to use this app. Or you might have an API, a Website, etc on Azure and you share some functionality with your mobile users using a native mobile app. In both cases, you could use ADAL library to enable Azure AD to handle the user authentication for you. This is quite handy for the following reasons:

1. Less code development and maintenance for you as Azure handles it by itself.
  
2. Guaranteed functionality and less bugs as it is a well structured/tested library from a trusted source (Azure team)
  
3. No need to further update your apis when Azure api/sdks get changed.
  
4. Extra features and goodness like token caching and token refresh operations. 

### Lack of Documentation

At the time of writing this blog, I have had few issues with the documentation on Azure, when trying to implement SSO on Xamarin iOS. The docs (as shown <a href="http://azure.microsoft.com/en-us/documentation/articles/mobile-services-dotnet-backend-xamarin-ios-adal-sso-authentication/" target="_blank">here</a>) refers to classes and methods that do not exist in the ADAL library. This tutorial seems to be taken from the native iOS implementation of Azure SSO (as can be seen <a href="https://github.com/AzureADSamples/NativeClient-iOS" target="_blank">here</a>) without any update to match the release of ADAL. Anyway, enough complaining, for this reason we have this blog post. 🙂 

### Implementation

To implement the SSO, I will assume that I have a native app, and I want to authenticate users against my AAD before they can use this app. For that, I would need to first create a native app in Azure AD. The screenshots below shows that. <figure id="attachment_2671" style="width: 300px" class="wp-caption aligncenter">

[<img src="https://i0.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2014/11/Adding-an-App-to-Azure-AD-300x195.png?resize=300%2C195" alt="Adding an App to Azure AD" width="300" height="195" class="size-medium wp-image-2671" data-recalc-dims="1" />](https://i2.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2014/11/Adding-an-App-to-Azure-AD.png)<figcaption class="wp-caption-text">Adding an App to Azure AD</figcaption></figure> 

Note that the name of the app does not really matter, you could give it any name. However the **RedirectUrl** has to be a valid URI and must be unique. In fact, this is what Azure uses to do the authentication for your mobile app. These settings could be changed later after you create the mobile app. So assume that we have created our app in the AAD. Before we proceed, let&#8217;s get the following details:

**Authority**
  
This represents the authority of your AAD, and it follows the format of https://login.windows.net/your-tenant-name. Where your tenant name could be something.onmicrosoft.com

**ClientId**
  
This is the client Id of the native mobile app that we just created on AAD. See the screenshot below. <figure id="attachment_2681" style="width: 300px" class="wp-caption aligncenter">

[<img src="https://i1.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2014/11/Azure-AD-app-configurations-300x180.png?resize=300%2C180" alt="Azure AD app configurations" width="300" height="180" class="size-medium wp-image-2681" data-recalc-dims="1" />](https://i2.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2014/11/Azure-AD-app-configurations.png)<figcaption class="wp-caption-text">Azure AD app configurations</figcaption></figure> 

**Redirect Uri**
  
This is the unique redirect Id of the app that we just created as shown in the screenshot above.

**Resource Id**
  
Resource id represents the resource Uri of the app that we are trying to access. So if we are trying to access some functionality of a web API that is also registered with AAD, then this resourceId would be the client id of this web api app. 

Once we have the app registered with AAD and we get all the info above, then all we need is just write few lines of code. We would also need to install the ADAL Nuget Package to our app. At the time of writing this post, the nuget package version is 3.0.1102&#8230; And it is in **Pre-Release**. Notice that it is pre-release, so it will not be listed in your Nuget package search by default. You would need to explicitly tell your IDE (Xamarin Studio or VS) to show pre-release packages. 

Time to write some code. The small snippet below shows how to authenticate the user and get a token.
  
For the sake of this blog post, we only need to authenticate the user to azure. We will get the token and save it for future use, I have another post that talks about using this token. You can find it here. 

<pre class="brush: csharp; title: ; notranslate" title="">const string authority = "https://login.windows.net/your-tenant-name";
	 const string resourceId = "your-resource-id";
	 const string clientId = "your-native-app-client-id-on-AAD";
	const string redirectUrl = "your-awsome-app-redirect-url-as-on-AAD";

        QSTodoService ()
        {
              // this line if very important as it enables the ADAL library to do all 
              // IoC injection and other magic based on the platform that you are in. 
              AdalInitializer.Initialize ();
        }

        public async Task AsyncInit(UIViewController controller, MySimpleStorage storage)
        {
            _storage = storage;
            _controller = controller;

            _authContext = new AuthenticationContext (authority);
        }

        public async Task&lt;string&gt; RefreshTokens()
        {
            var refreshToken = _storage.Get&lt;string&gt; (Constants.CacheKeys.RefreshToken);
            AuthenticationResult authResult = null;
            var result = "Acquired a new Token"; 

            if (string.IsNullOrEmpty (refreshToken)) {
                authResult = await _authContext.AcquireTokenAsync (
                    resourceId, clientId, new Uri (redirectUrl), new AuthorizationParameters (_controller), UserIdentifier.AnyUser, null);

            } else {
                authResult = await _authContext.AcquireTokenByRefreshTokenAsync (refreshToken, clientId);
                result = "Refreshed an existing Token";
            }

            if (authResult.UserInfo != null)
                _storage.Save&lt;string&gt; (Constants.CacheKeys.Email, authResult.UserInfo.DisplayableId);

            _storage.Save&lt;string&gt; (Constants.CacheKeys.Token, authResult.AccessToken);
            _storage.Save&lt;string&gt; (Constants.CacheKeys.RefreshToken, authResult.RefreshToken);

            return result;
        }
</pre>

As you can see, it is very simple. You could keep a reference to your AuthenticationContext in your app. In fact, it is recommended that you do so, for later use as the aggressive GC on Monotouch might dispose of it quickly. 

Note that I am storing the token and the refresh token as I mentioned above, but you do not need to do that if you only using the library to authenticate once. In the <a href="http://www.hasaltaiar.com.au/how-to-best-handle-aad-access-tokens-in-native-mobile-apps/" target="_blank">next blog post</a>, I will show how you could manage these tokens for further interaction with another app that is also using AAD for authentication. 

Hope you find this useful and would love to hear from you if you have any feedback. I will try to upload the source code of this sample to GitHub and share the link. 

This blog post is the first in a series that cover Azure Active Directory SSO Authentication in native mobile apps. 

  1. **Authenticating iOS app users with Azure Active Directory. (this post)**
  2. [How to Best handle AAD access tokens in native mobile apps](http://www.hasaltaiar.com.au/how-to-best-handle-aad-access-tokens-in-native-mobile-apps/)
  3. [Using Azure SSO tokens for Multiple AAD Resources From Native Mobile Apps](http://www.hasaltaiar.com.au/using-azure-ad-sso-tokens-for-multiple-aad-resources-from-native-mobile-apps/)
  4. [Sharing Azure SSO access tokens across multiple native mobile apps.](http://www.hasaltaiar.com.au/sharing-azure-active-directory-sso-access-tokens-across-multiple-native-mobile-apps/)