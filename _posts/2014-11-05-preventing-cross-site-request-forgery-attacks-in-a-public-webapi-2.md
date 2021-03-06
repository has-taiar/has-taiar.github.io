---
id: 2481
title: Preventing Cross-Site Request Forgery Attacks in a public webApi
date: 2014-11-05T10:25:46+00:00
author: has
layout: post
guid: http://www.hasaltaiar.com.au/?p=2481
permalink: /preventing-cross-site-request-forgery-attacks-in-a-public-webapi-2/
categories:
  - .NET
  - Azure
  - 'C#'
  - Cloud
  - Code Quality
---
Cross-Site Request Forgery (<a href="http://en.wikipedia.org/wiki/Cross-site_request_forgery" target="_blank">CSRF</a> or Session Riding) is the invocation of unauthorised commands that are triggered by a trusted user. A malicious website could make use of the fact that a user is logged in to a vulnerable website to then ride that session and forge requests. CSRF is a very common type of attack and ASP.NET has had the AntiForgery library for a long time. What’s interesting is when you have a private/public API that your website is using and it is also used by other clients like Powershell, Mobile, etc. In this blog post, I will share my experience in a recent project where a client has engaged us to the address Cross-Site Request Forgery vulnerability. 

## The Problem

ASP.NET AntiForgery implementation works based on assuming that the views and the controllers are both served by the same server (in the same app) and it is very simple to implement. All the developer needs to do is to add the [ValidateAntiForgeryToken] attribute to the actions or the controller and add the @Html.AntiForgeryToken() to the views. This in return adds a token as a hidden html element with its value set into a token, and adds a cookie on the client side. This is all nice and good. But hold on, how would this work on a Powershell client that is using the api? Or from a mobile app that is consuming the app? And heres is the trouble 🙂
  
AntiForgery library implementation assumptions makes it not suitable for public/hybrid APIs that are consumed by external clients (like Powershell, Mobile, etc). 

## Our Solution

#### Customising The Use of Asp.Net AntiForgery

My solution was based on customising the use of ASP.NET AntiForgery to fit the challenges that I have. In order for a solution to fit our scenario, it needs to work with the following:

1. The MVC app that is bundled with the WebAPI solution
  
2. The Ajax calls made by the app views.
  
3. The external clients (powershell, mobile, etc). 

Therefore, to solve the CSRF vlunerability for this client, we have to create a compsite folution of few things:

1. First, we can just apply the AntiForgery out-of-the-box to solve the issue for the internal MVC app. This includes adding the [ValidateAntiForgeryToken] to the controllers and calling the AntiForgery helper on the client side. This was easy. Now when you tap into the data transmission (through fiddler or so) and look at the requests and responses, you would see that along with all requests, two new things were added a new cookie \_\_RequestVerificationToken and a new form element \_\_RequestVerificationToken. 

2. There are quite few tutorials on how to handle AntiForgery in Ajax calls, including <a href="http://www.asp.net/web-api/overview/security/preventing-cross-site-request-forgery-%28csrf%29-attacks" target="_blank">this one</a> from the MSDN library. Applying the concepts from this tutorial to our ajax calls was also easy. However, to mitigate the risks of making too much changes to the prod app, we created an extension that would check for the existence of the anti-forgery token, and if it does not exist, then we request a token from the server. My Jquery extension looked like this:

<pre class="brush: jscript; title: ; notranslate" title="">var kloudSecurityPlugin = new function() {

	var secureAjax = function(url, options) {

		    options = ensureAjaxOptions(url, options);

		    var needsAntiForgeryToken = doesRequestNeedAntiForgeryToken(options);
		    if (needsAntiForgeryToken) {

			    console.log("Need to get anti-forgery token for: " + options.url);

			    $.ajax({
				    // code to get a valid antiforgery token
			    }).done(function(token) {
				    var headers = options['headers'];
				    headers = headers || {};
				    headers['X-XSRF-Token'] = token;
				    options['headers'] = headers;

				    callAjax(url, options);

			    }).fail(function (jqXhr) {
			    	console.log("Failed to get a valid Anti-Forgery token");
			    	options.callback.fail(jqXhr);
			    });

		    } else {
			    callAjax(url, options);
		    }
	    },

		doesRequestNeedAntiForgeryToken = function(options) {

			// only require Anti-Forgery tokens if the request is POST/PUT/DELETE methods
			var antiForgeryTokenRequired = options["type"] !== undefined
				&& (options["type"] == "POST" || options["type"] == "PUT" || options["type"] == "DELETE");
			return antiForgeryTokenRequired;
		},

		ensureAjaxOptions = function(url, options) {
			if (typeof url === "object") {
				options = url;
				url = undefined;
			}

			// Force options to be an object
			options = options || {};


			// forcing callbacks (done & fail) to be methods to make it easy to set up the ajax calls. 
			options['callbacks'] = options.callbacks || {};
			options.callbacks['done'] = options.callbacks.done || function() {};
			options.callbacks['fail'] = options.callbacks.fail || function () { };
			return options;
		},
		callAjax = function(url, options) {
			$.ajax(url, options)
				.done(options.callbacks.done)
				.fail(options.callbacks.fail)
		};
	return {
		secureAjax: secureAjax,		
	}
};

$.kloud = kloudSecurityPlugin;

</pre>

This was very handy, as I do not need to change much to fix all ajax calls through the website. All I needed to do was call $.Kloud.SecureAjax() instead of $.ajax(). Under the hood, this was able to check for the Antiforgery library requirements (token/cookie). This meant that most of the existing javascript code stays the same. This extension (secureAjax()) would check and if AntiForgery Required, it would then set/update the antiforgery token and cookie. The extension also checks if the antiforgery is not required, it just sends the ajax request as usual without any extra processing/modification to ensure no unnecessary load/processing or time wasted. 

3. For the external api clients (Powershell, mobile, etc), I had to do a very small change too. I was lucky enough that the guys who developed the api clients on the Powershell for instance they had organised the code neatly and they had one domain class called apiClient that processes all calls to the api. This enabled me to localise the change to only one place (apiClient) and leave everything as it was. Basically the powershell client implements a handshake at the start of the cmdlet session, and keeps the cookieContainer for the rest of the session. Therefore, it was very easy to setup one small call to get an antiforgery token (and cookie) and keep them alongside with the cookieContainer. From there on, whenever we send a request to the api, the apiClient internally just adds the xcsrf header. The cookie would be added to the requests automatically since it is already in the cookie container. And that is it, it all worked nicely from there on. 

Doing the small changes above has enabled us to address the cross-site request forgery vulnerability, with a very minimal amount of effort with a good deal of security. I hope this could help somebody else how might have a similar issue.
  
Have you had a similar issue, or do you think we could do this a little better, I would love to hear your thoughts.