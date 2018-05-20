---
id: 2831
title: Using Azure AD SSO tokens for Multiple AAD Resources From Native Mobile Apps
date: 2014-12-10T13:40:15+00:00
author: has
layout: post
guid: http://www.hasaltaiar.com.au/?p=2831
permalink: /using-azure-ad-sso-tokens-for-multiple-aad-resources-from-native-mobile-apps-2/
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
This blog post is the third in a series that cover Azure Active Directory Single Sign-On (SSO) authentication in native mobile applications.

  1. [Authenticating iOS app users with Azure Active Directory](http://www.hasaltaiar.com.au/implementing-azure-active-directory-single-sign-on-in-xamarin-ios-apps/ "Implementing Azure Active Directory SSO (Single Sign on) in Xamarin iOS apps")
  2. <a href="http://www.hasaltaiar.com.au/how-to-best-handle-aad-access-tokens-in-native-mobile-apps/" title="How to best handle azure AD access-tokens on native mobile apps" target="_blank">How to Best handle AAD access tokens in native mobile apps</a> 
  3. **Using Azure SSO tokens for Multiple AAD Resources From Native Mobile Apps. (this post)**
  4. [Sharing Azure SSO access tokens across multiple native mobile apps.](http://www.hasaltaiar.com.au/sharing-azure-active-directory-sso-access-tokens-across-multiple-native-mobile-apps/)

## Brief Start

In an enterprise context, it is highly likely that you would have multiple web services that your native mobile app needs to consume. I had exactly this scenario, where one of my clients had asked if they could maintain the same token in the background in the mobile app to use it for accessing multiple web services. I spent some time digging through the documentation and conducting some experiments to confirm some points. Therefore, this post is to share my findings on accessing multiple Azure AD resources from native mobile apps using ADAL.

In the previous two posts, we looked at [implementing Azure AD SSO login on native mobile apps](http://www.hasaltaiar.com.au/how-to-best-handle-aad-access-tokens-in-native-mobile-apps/ "Implementing Azure Active Directory SSO (Single Sign on) in Xamarin iOS apps"), then we looked at <a href="http://www.hasaltaiar.com.au/how-to-best-handle-aad-access-tokens-in-native-mobile-apps/" title="How to best handle azure AD access-tokens on native mobile apps" target="_blank">how to best maintain these access tokens</a>. This post discusses how to use Azure AD SSO tokens to manage access to **multiple** AAD resources. Let&#8217;s assume that we have 2 web services sitting in Azure (ie WebApi1, and WebApi2), both of which are set to use Azure AD authentication. Then, we have the native mobile app, which needs access to both web services (WebApi1, and WebApi2). Let&#8217;s look at what we can and cannot do. 

## Cannot Use the Same Azure AD Access-Token for Multiple Resources

The first thing that comes to mind is to use the same access token for multiple Azure AD resources, and that is what the client asked about. However, this is not allowed. Azure AD issues a token for certain resource (which is mapped to an Azure AD app). When we call _AcquireToken()_, we need to provide a resourceID, only ONE resourceID. The result would have a token that can only be used for the supplied resource (id). There are ways where you could use the same token (as we will see later in this post), but it is not recommended as it complicates operations logging, authentication process tracing, etc. Therefore it is better to look at the other options provided by Azure and the ADAL library. 

## Use the Refresh-Token to Acquire Tokens for Multiple Resources

The ADAL library supports acquiring multiple access-Tokens for multiple resources using a refresh token. This means once a user is authenticated, the ADAL&#8217;s authentication context, would be able to generate an access-token to multiple resources without authenticating the user again. This was mentioned briefly by the MSDN documentation <a href="http://msdn.microsoft.com/en-us/library/azure/dn499820.aspx" target="_blank">here</a>. 

> The refresh token issued by Azure AD can be used to access multiple resources. For example, if you have a client application that has permission to call two web APIs, the refresh token can be used to get an access token to the other web API as well. (MSDN documentation) 

<pre class="brush: csharp; gutter: false; title: ; notranslate" title="">public async Task&lt;string&gt; RefreshTokens()
{
	var tokenEntry = await tokensRepository.GetTokens();
	var authorizationParameters = new AuthorizationParameters (_controller);

	var result = "Refreshed an existing Token";
	bool hasARefreshToken = true;

	if (tokenEntry == null) 
	{

		var localAuthResult = await _authContext.AcquireTokenAsync (
			resourceId1, clientId, new Uri (redirectUrl), authorizationParameters, UserIdentifier.AnyUser, null);

		tokenEntry = new Tokens {
			WebApi1AccessToken = localAuthResult.AccessToken,
			RefreshToken = localAuthResult.RefreshToken,
			Email = localAuthResult.UserInfo.DisplayableId,
			ExpiresOn = localAuthResult.ExpiresOn
		};
		hasARefreshToken = false;
		result = "Acquired a new Token"; 
	} 

	var refreshAuthResult = await _authContext.AcquireTokenByRefreshTokenAsync(tokenEntry.RefreshToken, clientId, resourceId2);
	tokenEntry.WebApi2AccessToken = refreshAuthResult.AccessToken;
	tokenEntry.RefreshToken = refreshAuthResult.RefreshToken;
	tokenEntry.ExpiresOn = refreshAuthResult.ExpiresOn;

	if (hasARefreshToken) 
	{
		// this will only be called when we try refreshing the tokens (not when we are acquiring new tokens. 
		refreshAuthResult = await _authContext.AcquireTokenByRefreshTokenAsync (refreshAuthResult.RefreshToken, clientId, resourceId1);
		tokenEntry.WebApi1AccessToken = refreshAuthResult.AccessToken;
		tokenEntry.RefreshToken = refreshAuthResult.RefreshToken;
		tokenEntry.ExpiresOn = refreshAuthResult.ExpiresOn;
	}


	await tokensRepository.InsertOrUpdateAsync (tokenEntry);

	return result;
}
</pre>

As you can see from above, we check if we have an access-token from previous runs, and if we do, we refresh the access-tokens for both web services. Notice how the _authContext.AcquireTokenByRefreshTokenAsync() provides an overloading parameter that takes a resourceId. This enables us to get multiple access tokens for multiple resources without having to re-authenticate the user. The rest of the code is similar to what we have seen in the previous two posts. 

## ADAL Library Can Produce New Tokens For Other Resources

In the previous two posts, we looked at ADAL library and how it uses **TokenCache**. Although ADAL does not support persistent caching of tokens _yet_ on mobile apps, it still uses the TokenCache for in-memory caching. This enables ADAL library to generate new access-tokens if the context (AuthenticationContext) still exists from previous authentications. Remember in the previous post we said it is recommended to keep a reference to the authentication-context? Here it comes in handy, as it enables us to generate new access-tokens for accessing multiple Azure AD resources. 

<pre class="brush: csharp; gutter: false; title: ; notranslate" title="">var localAuthResult = await _authContext.AcquireTokenAsync (
			resourceId2, clientId, new Uri (redirectUrl), authorizationParameters, UserIdentifier.AnyUser, null);

</pre>

Calling AcquireToken() (even with no refresh-token) would give us a new access-token to webApi2. This is due to ADAL great goodness where it checks if we have a refresh-token in-memory (managed by ADAL), then it uses that to generate a new access-token for webApi2. 

## An alternative

The third alternative option is the simplest, but not necessarily the best. In this option, we could use the same access token to consume multiple Azure AD resources. To do this, we need to use the same Azure AD app ID when setting the web application&#8217;s authentication. This requires some understanding of how the Azure AD authentication happens on our web apps. If you refer to <a href="http://bitoftech.net/2014/09/12/secure-asp-net-web-api-2-azure-active-directory-owin-middleware-adal/" title="Secure ASP.NET Web API 2 using Azure Active Directory, Owin Middleware, and ADAL" target="_blank">Taiseer Joudeh’s tutorial</a>, which we mentioned before, you will see that in our web app, we need to tell the authentication framework what&#8217;s our Authority and the Audience (Azure AD app Id). If we set up both of our web apps, to use the same Audience (Azure AD app Id), meaning that we link them both into the same Azure AD application, then we could use the same access-token to use both web services.

<pre class="brush: plain; title: ; notranslate" title="">// linking our web app authentication to an Azure AD application
private void ConfigureAuth(IAppBuilder app)
{
	app.UseWindowsAzureActiveDirectoryBearerAuthentication(
		new WindowsAzureActiveDirectoryBearerAuthenticationOptions
		{
			Audience = ConfigurationManager.AppSettings["Audience"],
			Tenant = ConfigurationManager.AppSettings["Tenant"]
		});
}
</pre>

<pre class="brush: plain; title: ; notranslate" title="">&lt;appSettings&gt;
    &lt;add key="Tenant" value="hasaltaiargmail.onmicrosoft.com" /&gt;
    &lt;add key="Audience" value="http://my-Azure-AD-Application-Id" /&gt;	
&lt;/appSettings&gt;
</pre>

As we said before, this is very simple and requires less code, but could cause complications in terms of security logging and maintenance. At the end of the day, it depends on your context and what you are trying to achieve. Therefore, I thought it would be worth mentioning and I will leave the judgement for you on which option you choose. 

## Conclusions

We looked at how we could use Azure AD SSO with ADAL to access multiple resources from native mobile apps. As we saw, there are three main options, and the choice could be made based on the context of your app. I hope you find this useful and if you have any questions or you need help with some development that you are doing, then just <a href="mailto:info@kloud.com.au" title="info@kloud.com.au" target="_blank">get in touch</a>. 

This blog post is the third in a series that cover Azure Active Directory Single Sign-On (SSO) authentication in native mobile applications.

  1. [Authenticating iOS app users with Azure Active Directory](http://www.hasaltaiar.com.au/implementing-azure-active-directory-single-sign-on-in-xamarin-ios-apps/ "Implementing Azure Active Directory SSO (Single Sign on) in Xamarin iOS apps")
  2. <a href="http://www.hasaltaiar.com.au/how-to-best-handle-aad-access-tokens-in-native-mobile-apps/" title="How to best handle azure AD access-tokens on native mobile apps" target="_blank">How to Best handle AAD access tokens in native mobile apps</a> 
  3. **Using Azure SSO tokens for Multiple AAD Resources From Native Mobile Apps. (this post)**
  4. [Sharing Azure SSO access tokens across multiple native mobile apps.](http://www.hasaltaiar.com.au/sharing-azure-active-directory-sso-access-tokens-across-multiple-native-mobile-apps/)