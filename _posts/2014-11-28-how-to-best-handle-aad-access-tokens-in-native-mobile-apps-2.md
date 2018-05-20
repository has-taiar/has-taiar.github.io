---
id: 2651
title: How to Best handle AAD access tokens in native mobile apps
date: 2014-11-28T15:00:51+00:00
author: has
layout: post
guid: http://www.hasaltaiar.com.au/?p=2651
permalink: /how-to-best-handle-aad-access-tokens-in-native-mobile-apps-2/
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
  - Cloud
  - iOS
  - Mobile Apps
  - Single SignOn
  - SSO
---
This blog post is the second in a series that cover Azure Active Directory SSO Authentication in native mobile apps. 

  1. [Authenticating iOS app users with Azure Active Directory](http://www.hasaltaiar.com.au/implementing-azure-active-directory-single-sign-on-in-xamarin-ios-apps/ "Implementing Azure Active Directory SSO (Single Sign on) in Xamarin iOS apps")
  2. **How to Best handle AAD access tokens in native mobile apps. (this post)**
  3. [Using Azure SSO tokens for Multiple AAD Resources From Native Mobile Apps](http://www.hasaltaiar.com.au/using-azure-ad-sso-tokens-for-multiple-aad-resources-from-native-mobile-apps/)
  4. [Sharing Azure SSO access tokens across multiple native mobile apps.](http://www.hasaltaiar.com.au/sharing-azure-active-directory-sso-access-tokens-across-multiple-native-mobile-apps/)

In the <a href="http://www.hasaltaiar.com.au/implementing-azure-active-directory-single-sign-on-in-xamarin-ios-apps/" target="_blank">previous post</a>, we talked about authenticating mobile app users using Azure AD SSO. In this post, we explore how to take this login further to persist the access token to interact with Azure AD. Let&#8217;s assume that we have a web api app and a mobile app that consumes this web api. In order to secure this interaction between our mobile app and the web api, we could register both apps with Azure AD and let Azure handle the authentication for us. Azure AD is well suited for such tasks and it could sync to your on-premise AD too. This makes it very suitable for enterprise-like apps. 

## Securing the Web App

To start with, we will implement an authentication mechanism in our Web Api. We could create a vanilla Web Api in Visual Studio and implement Azure AD authentication on that. This is a straight-forward process and I assume that you could get this far on your own. For a good reference, Taiseer Joudeh has a good detailed tutorial, you could find it <a href="http://bitoftech.net/2014/09/12/secure-asp-net-web-api-2-azure-active-directory-owin-middleware-adal/" target="_blank">here</a>. 

## Securing the Mobile App

In the previous post, we talked about how we could use Azure AD along with Microsoft ADAL (ActiveDirectory Authentication Library) to authenticate users on native mobile apps. Thus, we will assume that you have followed the previous post and you have this part ready. If you are not sure, please revisit my <a href="http://www.hasaltaiar.com.au/implementing-azure-active-directory-single-sign-on-in-xamarin-ios-apps/" target="_blank">previous post</a>. 

## Setting up the Permissions in AAD

We have seen how to secure our apps with AAD, now we need to authorise the mobile app to access our Web App in AAD. To do this, we first need to _expose the webApi permissions_ on Azure AD. We can navigate to AAD/Applications/our-web-app, then click on _download manifest_. This will give us a copy of the configuration of this app in AAD (simple Json file). We need to modify the permission section. We just need to add the following section to tell Azure AD that this web app can be accessed by other AAD apps. <figure id="attachment_2691" style="width: 300px" class="wp-caption aligncenter">

[<img src="https://i0.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2014/11/AAD-app-manifest-configuration-300x217.png?resize=300%2C217" alt="AAD app manifest configuration" width="300" height="217" class="size-medium wp-image-2691" data-recalc-dims="1" />](https://i2.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2014/11/AAD-app-manifest-configuration.png)<figcaption class="wp-caption-text">AAD app manifest configuration</figcaption></figure> 

<pre class="brush: jscript; title: ; notranslate" title="">appPermissions": [
    {
      "claimValue": "user_impersonation",
      "description": "Allow the application full access to the service on behalf of the signed-in user",
      "directAccessGrantTypes": [],
      "displayName": "Have full access to the service",
      "impersonationAccessGrantTypes": [
        {
          "impersonated": "User",
          "impersonator": "Application"
        }
      ],
      "isDisabled": false,
      "origin": "Application",
      "permissionId": "place a NEW GUID here",
      "resourceScopeType": "Personal",
      "userConsentDescription": "Allow the application full access to the service on your behalf",
      "userConsentDisplayName": "Have full access to the service"
    }
  ]
</pre>

We can update the manifest file then upload it. Azure will verify the file and update the permissions setting. This will enable AAD to offer accessing this web api just like any other permissions that it manages. You could read more on Azure AD impersonation and permission settings on <a href="http://msdn.microsoft.com/en-us/library/azure/dn132599.aspx" target="_blank">MSDN</a>. Note that you need to choose a NEW GUID for the permission id. 

Now, we need to configure our native mobile app in Azure AD to have access to our web api app. This is very simple as in the screenshot below. In the list of permissions on the left, now we have more permissions that we can grant to the mobile app. Whatever name you gave to your app would appear there along with the type of permissions that you have configured. In my case, I have named it MobileServices1 and that is what is appearing there. <figure id="attachment_2701" style="width: 300px" class="wp-caption aligncenter">

[<img src="https://i2.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2014/11/Azure-AD-app-permission-settings-300x124.png?resize=300%2C124" alt="Azure AD app permission settings" width="300" height="124" class="size-medium wp-image-2701" data-recalc-dims="1" />](https://i2.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2014/11/Azure-AD-app-permission-settings.png)<figcaption class="wp-caption-text">Azure AD app permission settings</figcaption></figure> 

Azure now knows to allow access from our native mobile app to the web app. 

Setting the permissions and configuration above would allow our mobile app to authenticate users and manage the access of the web app. This access is managed by the token that Azure would give when a user logs in. The trick now is how often do we need to ask for a token? If the mobile app interacts with the web api frequently, then we need to always have a valid token for all our requests. The question is then how to keep a valid request token all the times on a native mobile app? 

The answer is certainly dependent on what you are doing. If you are implementing a highly secure app (ie: banking), you might want to always check with Azure and maybe ask the user to login every time the token expires. _By Default, AAD access token expires in_ **one hour**. This means that you might want to ask the user to login every one hour. This might be OK for some mobile apps, but it is certainly not convenient and not the normal flow you see in most apps. So what should we do if we wanted to only ask the user to login once, or once a while (ie: 3 months). To do that, we would then need to manage the access tokens and refresh seamlessly. 

ADAL comes with **TokenCache**, this is designed to help in caching tokens so that ADAL libray does not need to go back to Azure every time the mobile app asks for a token. Unfortunately, however, persistent caching of tokens is not supported in this release (ADAL 3.0.11..). This means that ADAL will only cache the token in memory, meaning that once the app restarts, or goes to the background in iOS, you might loose your access token. Therefore, we need to manage the token, and refresh it on our own in the background. 

There are many ways that you could do this, a simple way is to always check before we access the api, and see if we have a valid token or not. If we do, then great. If not, then we could check for the **Refresh Token**. Azure AD gives us a refresh token to use when our access token is about to expire. As the name indicates, it is used to refresh tokens. This means that when we ask Azure for a new token and provide this refresh token, Azure will give us a new token without asking the user to re-login. 

By Default, **Azure AD refresh tokens are valid for about 14 days**. This means as long as we refresh the token (even if once in this period of time), then we would have a valid token and we do not need to re-authenticate. Another security constraint that Azure AD imposes is that the **access token can only be refreshed for a maximum period of 90 days**
   
(i.e. 90 days after the initial issuance of the access and refresh tokens, the end user will have to sign themselves in again). This is done by Azure AD to enforce a better security measures and it still gives a convenient access to mobile users. Currently, these settings are not configurable in Azure AD, so we just go with the default ones. 

Alright, time to write some code. The code snippet below shows how you could structure your web api calls from your mobile app. Notice that we always call either _AcquireToken()_ or </i>AcquireTokenByRefreshToken()</i> before every call. This is to ensure that we always have a valid token before we send a request to the web api. This could even be optimised further by checking if the access token still valid, then we skip the token refreshing call. I will leave this as an exercise for you to implement. In the next release of ADAL hopefully the **TokenCache** would be implemented, and then we would not need to do this. 

<pre class="brush: csharp; title: ; notranslate" title="">public async Task&lt;string&gt; GetResultFromWebApi(string apiCallPath)
{
	var token = await AcquireOrRefreshToken ();
	using (var httpClient = new HttpClient())
	{
		httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
		HttpResponseMessage response = await httpClient.GetAsync(apiBaseAddress + apiCallPath);
		return await response.Content.ReadAsStringAsync();
	}
}

private async Task&lt;string&gt; AcquireOrRefreshToken()
{
	var refreshToken = _storage.Get&lt;string&gt; (Constants.CacheKeys.RefreshToken);
	AuthenticationResult authResult = null;

	if (string.IsNullOrEmpty (refreshToken)) 
	{
		authResult = await _authContext.AcquireTokenAsync (
			resourceId, clientId, new Uri (redirectUrl), new AuthorizationParameters (_controller), UserIdentifier.AnyUser, null);

	} 
        else 
        {
		authResult = await _authContext.AcquireTokenByRefreshTokenAsync (refreshToken, clientId);
	}

	// when calling refresh token, the UserInfo would be null
	if (authResult.UserInfo != null)
		_storage.Save&lt;string&gt; (Constants.CacheKeys.Email, authResult.UserInfo.DisplayableId);

	_storage.Save&lt;string&gt; (Constants.CacheKeys.Token, authResult.AccessToken);
	_storage.Save&lt;string&gt; (Constants.CacheKeys.ExpireOn, authResult.ExpiresOn.ToString("dd MMM HH:mm:ss"));
	_storage.Save&lt;string&gt; (Constants.CacheKeys.RefreshToken, authResult.RefreshToken);

	return authResult.AccessToken;
}
</pre>

That&#8217;s it, now your mobile app would keep interacting with the web api using a valid token. And if you are concerned about what happens when the user account is disabled, or the password is changed, then well done, you are following the topic properly. Azure AD, would either try to re-authenticate the user again (by showing the login screen), or gives an error. So we need to add some error handling to our code to catch these types of exceptions and handle them properly on the mobile app.

Hope you find this blog post useful and would love to hear from you if you have a question or comment. In the next blog post, we will look at how we could use the same token for accessing multiple resources on Azure AD. 

This blog post is the second in a series that cover Azure Active Directory SSO Authentication in native mobile apps. 

  1. [Authenticating iOS app users with Azure Active Directory](http://www.hasaltaiar.com.au/implementing-azure-active-directory-single-sign-on-in-xamarin-ios-apps/ "Implementing Azure Active Directory SSO (Single Sign on) in Xamarin iOS apps")
  2. **How to Best handle AAD access tokens in native mobile apps. (this post)**
  3. [Using Azure SSO tokens for Multiple AAD Resources From Native Mobile Apps](http://www.hasaltaiar.com.au/using-azure-ad-sso-tokens-for-multiple-aad-resources-from-native-mobile-apps/)
  4. [Sharing Azure SSO access tokens across multiple native mobile apps.](http://www.hasaltaiar.com.au/sharing-azure-active-directory-sso-access-tokens-across-multiple-native-mobile-apps/)