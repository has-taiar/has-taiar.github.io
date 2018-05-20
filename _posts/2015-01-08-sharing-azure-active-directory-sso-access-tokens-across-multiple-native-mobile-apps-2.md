---
id: 2911
title: Sharing Azure Active Directory SSO access tokens across multiple native mobile apps
date: 2015-01-08T08:28:59+00:00
author: has
layout: post
guid: http://www.hasaltaiar.com.au/?p=2911
permalink: /sharing-azure-active-directory-sso-access-tokens-across-multiple-native-mobile-apps-2/
categories:
  - .NET
  - Android
  - Azure
  - 'C#'
  - Cloud
  - Code Quality
  - iOS
tags:
  - AAD
  - Access Control
  - Android
  - Apple
  - Authentication
  - azure
  - azure active directory
  - Cloud
  - iOS
  - Mobile Apps
  - Security
  - Single SignOn
  - SSO
---
This blog post is the forth and final in the series that cover Azure Active Directory Single Sign-On (SSO) authentication in native mobile applications.

  1. [Authenticating iOS app users with Azure Active Directory](http://www.hasaltaiar.com.au/implementing-azure-active-directory-single-sign-on-in-xamarin-ios-apps/ "Implementing Azure Active Directory SSO (Single Sign on) in Xamarin iOS apps")
  2. <a href="http://www.hasaltaiar.com.au/how-to-best-handle-aad-access-tokens-in-native-mobile-apps/" title="How to best handle azure AD access-tokens on native mobile apps" target="_blank">How to Best handle AAD access tokens in native mobile apps</a> 
  3. [Using Azure SSO tokens for Multiple AAD Resources From Native Mobile Apps](http://www.hasaltaiar.com.au/using-azure-ad-sso-tokens-for-multiple-aad-resources-from-native-mobile-apps/)
  4. **Sharing Azure SSO access tokens across multiple native mobile apps.(this post)**

### Introduction

Most enterprises have more than one mobile app and it&#8217;s not unusual for these mobile apps to interact with some back-end services or APIs to fetch and update data. In the previous posts of this series we looked at how to manage access to APIs and share tokens as a way to enable a mobile app to interact with multiple AAD-secured resources.

This post will cover how to share access tokens to AAD resources _across multiple mobile apps_. This is very useful if the enterprise (or any mobile app vendor) wants to provide convenience for the users by not asking them to authenticate on every mobile app the user has.

Once a mobile user logs into Azure AD and gets a token we want to reuse the same token with other apps. This is suitable for some scenarios, but it might not be ideal for apps and resources that deal with sensitive data &#8211; the judgement is yours.

### Sharing Tokens Across Multiple Mobile Apps

Moving on from previous posts it is now time to enable our mobile apps to share the access token. In this scenario we are covering iOS devices (iOS 6 and above), however other mobile platforms provide similar capabilities too. So what are the options for sharing data on iOS:

### KeyChain Store

iOS offers developers a simple utility for storing and sharing keys, this is called SecKeyChain. The API has been part of the iOS platform since before iOS 6, but in iOS 6 Apple integrated this tool with iCloud, to make it even easier to push any saved passwords and keys to Apple iCloud, and then share them on multiple devices.

We could use iOS SecKeyChain to store the token (and the refreshToken) once the user logs in on any of the apps. When the user starts using any of the other apps, we check the SecKeyChain first before attempting to authenticate the user. 

<pre class="brush: csharp; gutter: false; title: ; notranslate" title="">public async Task AsyncInit(UIViewController controller, ITokensRepository repository)
{
	_controller = controller;
	_repository = repository;
	_authContext = new AuthenticationContext(authority);
}

public async Task&lt;string&gt; RefreshTokensLocally()
{
	var refreshToken = _repository.GetKey(Constants.CacheKeys.RefreshToken, string.Empty);
	var authorizationParameters = new AuthorizationParameters(_controller);

	var result = "Refreshed an existing Token";
	bool hasARefreshToken = true;

	if (string.IsNullOrEmpty(refreshToken)) 
	{
		var localAuthResult = await _authContext.AcquireTokenAsync(
			resourceId1, clientId, 
                        new Uri (redirectUrl), 
                        authorizationParameters, 
                         UserIdentifier.AnyUser, null);

		refreshToken = localAuthResult.RefreshToken;
		_repository.SaveKey(Constants.CacheKeys.WebService1Token, localAuthResult.AccessToken, null);


		hasARefreshToken = false;
		result = "Acquired a new Token"; 
	} 

	var refreshAuthResult = await _authContext.AcquireTokenByRefreshTokenAsync(refreshToken, clientId, resourceId2);
	_repository.SaveKey(Constants.CacheKeys.WebService2Token, refreshAuthResult.AccessToken, null);

	if (hasARefreshToken) 
	{
		// this will only be called when we try refreshing the tokens (not when we are acquiring new tokens. 
		refreshAuthResult = await _authContext.AcquireTokenByRefreshTokenAsync(refreshAuthResult.RefreshToken,  clientId,  resourceId1);
		_repository.SaveKey(Constants.CacheKeys.WebService1Token, refreshAuthResult.AccessToken, null);
	}

	_repository.SaveKey(Constants.CacheKeys.RefreshToken, refreshAuthResult.RefreshToken, null);

	return result;
}
</pre>

Some of the above code will be familiar from previous posts, but what has changed is that now we are passing **ITokenRepository** which would save any tokens (and refreshTokens) once the user logs in to make them available for other mobile apps.

I have intentionally passed an interface (ITokenRepository) to allow for different implementations, in case you opt to use a different approach for sharing the tokens. The internal implementation of the concrete TokenRepository is something like this:

<pre class="brush: csharp; gutter: false; title: ; notranslate" title="">public interface ITokensRepository 
{
	bool SaveKey(string key, string val, string keyDescription);
	string GetKey(string key, string defaultValue);
	bool SaveKeys(Dictionary&lt;string,string&gt; secrets);
}

public class TokensRepository : ITokensRepository
{
	private const string _keyChainAccountName = "myService";

	public bool SaveKey(string key, string val, string keyDescription)
	{
		var setResult = KeychainHelpers.SetPasswordForUsername(key, val, _keyChainAccountName, SecAccessible.WhenUnlockedThisDeviceOnly, false );

		return setResult == SecStatusCode.Success;
	}

	public string GetKey(string key, string defaultValue)
	{
		return KeychainHelpers.GetPasswordForUsername(key, _keyChainAccountName, false) ?? defaultValue;
	}
		
	public bool SaveKeys(Dictionary&lt;string,string&gt; secrets)
	{
		var result = true;
		foreach (var key in secrets.Keys) 
		{
			result = result && SaveKey(key, secrets [key], string.Empty);
		}

		return result;
	}
}
</pre>

### iCloud

We could use Apple iCloud to push the access tokens to the cloud and share them with other apps. The approach would be similar to what we have done above with the only difference being in the way we are storing these keys. Instead of storing them locally, we push them to Apple iCloud directly. As the SecKeyChain implementation above does support pushing data to iCloud, I won&#8217;t go through the implementation details here and simply note the option is available for you. 

### Third Party Cloud Providers (ie Azure)

Similar to the previous option, but offer more flexibility. This is a very good solution if we already are already using [Azure Mobile Services](http://azure.microsoft.com/en-us/services/mobile-services/) for our mobile app. We can create one more table and then use this table to store and share access tokens. The implementation of this could be similar to the following:

<pre class="brush: csharp; gutter: false; title: ; notranslate" title="">public async Task&lt;string&gt; RefreshTokensInAzureTable()
{
	var tokensListOnAzure = await tokensTable.ToListAsync();
	var tokenEntry = tokensListOnAzure.FirstOrDefault();
	var authorizationParameters = new AuthorizationParameters(_controller);

	var result = "Refreshed an existing Token";
	bool hasARefreshToken = true;

	if (tokenEntry == null) 
	{
		var localAuthResult = await _authContext.AcquireTokenAsync(resourceId1, clientId, new Uri (redirectUrl),  authorizationParameters, UserIdentifier.AnyUser, null);

		tokenEntry = new Tokens {
			WebApi1AccessToken = localAuthResult.AccessToken,
			RefreshToken = localAuthResult.RefreshToken,
			Email = localAuthResult.UserInfo.DisplayableId,
			ExpiresOn = localAuthResult.ExpiresOn
		};
		hasARefreshToken = false;
		result = "Acquired a new Token"; 
	} 
		
	var refreshAuthResult = await _authContext.AcquireTokenByRefreshTokenAsync(tokenEntry.RefreshToken, 
                                                                                    clientId, 
                                                                                    resourceId2);
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

	if (hasARefreshToken)
		await tokensTable.UpdateAsync (tokenEntry);
	else
		await tokensTable.InsertAsync (tokenEntry);

	return result;
}
</pre>

### Other Local Means

There are many other options that are available for storing and sharing data between apps on iOS. We could create a reminder, a contact, etc. Many of these entries could even be hidden from the user. For instance, &#8220;DONE&#8221; reminders are hidden from the Reminders app list. So we would need to to worry about the keys visibility, but I would still warn you to thing 10 times before go into storing your keys this way. 

### Words of Warning

#### Bearer Tokens

Developers need to understand **Bearer Tokens** when using Azure AD authentication. Bearer Tokens mean anybody who has the token (bearer of the token) could access and interact with your AAD resource. This offers high flexibility but it could also be a security risk if your key was exposed somehow. This needs to be thought of when implementing any token sharing mechanism. 

#### iOS SecKeyChain is &#8220;Secure&#8221;

iOS SecKeyChain is &#8220;Secure&#8221;, right? No, not at all. Apple calls it secure, but on jail-broken devices, you could see the key store as a normal file. Thus, I would highly recommend encrypting these access tokens and any key that you might want to store before persisting it. The same goes for iCloud, Azure, or any of the other approaches we went through above. 

#### Apple AppStore Verification

If you intend on submitting your app to Apple AppStore, then you need to be extra careful with what approach you take to share data between your apps. For enterprises (locally deployed apps), you have the control and you make the call based on your use case. However, Apple has a history of rejecting apps (ie PastePane) for using some of iOS APIs in &#8220;an unintended&#8221; manner. 

I hope you found this series of posts useful, and as usual, if there is something not clear or you need some help with similar projects that you are undertaking, then [get in touch](mailto:has.altaiar@gmail.com?subject=FromBlog-AzureADSsoOnMobile), and we will do our best to help. I have pushed the sample code from this post and the previous ones to GitHub, and can be found <a href="https://github.com/has-taiar/Azure-AD-SSO-Mobile" target="_blank">here</a>

This blog post is the forth and final in the series that cover Azure Active Directory Single Sign-On (SSO) authentication in native mobile applications.

  1. [Authenticating iOS app users with Azure Active Directory](http://www.hasaltaiar.com.au/implementing-azure-active-directory-single-sign-on-in-xamarin-ios-apps/ "Implementing Azure Active Directory SSO (Single Sign on) in Xamarin iOS apps")
  2. <a href="http://www.hasaltaiar.com.au/how-to-best-handle-aad-access-tokens-in-native-mobile-apps/" title="How to best handle azure AD access-tokens on native mobile apps" target="_blank">How to Best handle AAD access tokens in native mobile apps</a> 
  3. [Using Azure SSO tokens for Multiple AAD Resources From Native Mobile Apps](http://www.hasaltaiar.com.au/using-azure-ad-sso-tokens-for-multiple-aad-resources-from-native-mobile-apps/)
  4. **Sharing Azure SSO access tokens across multiple native mobile apps.(this post)**