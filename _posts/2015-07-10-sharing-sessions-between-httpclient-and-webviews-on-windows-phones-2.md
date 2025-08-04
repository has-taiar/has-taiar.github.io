---
id: 3461
title: Sharing Sessions between HttpClient and WebViews on Windows Phones
date: 2015-07-10T18:50:23+00:00
author: has
layout: post
guid: http://www.hasaltaiar.com.au/?p=3461
permalink: /sharing-sessions-between-httpclient-and-webviews-on-windows-phones-2/
categories:
  - .NET
  - 'C#'
  - Security
  - Windows Phone
---
## Introduction

Before we can dive into the details of the blog post, it would be helpful to give some context of what we are trying to achieve, agree? 🙂 I have been working on a hybrid mobile application that requires displaying/containing a few mobile apps in a WebView control. In the background, some Http requests need to go through to collect data and do further processing. We need to maintain the same session in all of the web requests going through the mobile app. This means all web (http) requests originated by the Webview as well as our background (httpClient) requests need to share cookies, cache, etc. So how do we do that? This is what I will show you in this blog post. 

### System.Net.Http.HttpClient

HttpClient has become the go-to library for all things Http, especially with the support of HttpClient in PCLs (Portable Class Library), who can resist that. So my first thought when I considered this requirement was to use HttpClient with a HttpClientHandler, preserve the session cookies and share them with the WebView. I started my initial googling, and I found that somebody has done exactly that, you can find it <a href="http://blog.rajenki.com/2015/01/winrt-shared-cookies-between-webview-and-httpclient/" target="_blank">here</a>. This gave me some more confidence that it is doable and it worked for somebody, so this is the first approach that I could take. 

This first approach would mean using HttpClient (along with a HttpClientHandler) to hold cookies and share them with the webview. However, this would be error-prone because I will need to continously monitor both cookies and update the other group of requets. Plus, sharing data cache between the WebView and HttpClient would still be an issue that I was not sure how to address. 

### Windows.Web.HttpClient

Before going further, I thought I would look for an alternative, and I found <a href="https://msdn.microsoft.com/library/windows/apps/dn298639" target="_blank">Windows.Web.HttpClient</a>. This one seemed very similar to <a href="https://msdn.microsoft.com/en-us/library/system.net.http.httpclient%28v=vs.118%29.aspx" target="_blank">System.Net.Http.HttpClient</a>, but the implementation is quite different, regardless of the exact matching of the name :). I found this video (below) from Microsoft //Build confernece, and it talks in details about this implementation of HttpClient which is more geared towards Windows Development as the name indicates. 



Appearantly Windows implementation of HttpClient gives you the ability customise all aspects your http requests. The video above lists the following five reasons for why you should use Windows.Web.HttpClient:

  1. Shared Cookies, Cache, and Credentails (I was thinking this is too good to be true 🙂 )
  2. Strongly Typed headers => fewer bugs 
  3. Access to Cookies and Shared Cookies
  4. Control over Cache and Sahred Cache 
  5. Inject your code modules into the processing pipe-line => cleaner integration 

When I read the first statement above, I really though that this is too good to be true, just exactly what I am looking for. So I decided to give it a go. As you can see some of the features listed for this HttpClient (Windows implementation) are similar to what we have in the System.Net world, but this gives us extra capabilities. 

### HttpClientHandlers vs HttpBaseProtocolFilter

It is worth mentioning that Windows.Web library does not have HttpClientHandlers that we are familiar with in System.Net, instead it gives you the ability do more with HttpBaseProtocolFilter, and this is the key point. HttpBaseProtocolFilter enables us developers to customise/manipulate the http requests (headers, cookies, cache, etc) and the changes will be applied across the board in your application. This applies whether you are making a http request programmatically using httpClient or via the user interface (using a webView for instance). 

### Code Time

<pre class="brush: csharp; title: ; notranslate" title="">// creating the filter
  var myFilter = new HttpBaseProtocolFilter();
  myFilter.AllowAutoRedirect = true;
  myFilter.CacheControl.ReadBehavior = HttpCacheReadBehavior.Default;
  myFilter.CacheControl.WriteBehavior = HttpCacheWriteBehavior.Default;

  // get a reference to the cookieManager (this applies to all requests)
  var cookieManager = myFilter.CookieManager;

  // make the httpRequest
  using (var client = new HttpClient()) 
  {
     HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Get, "your-url-address"); 
     
     // add any request-specific headers here
     // more code been omitted

     var result = await client.SendRequstAsync(request);
     result.EnsureSuccessStatusCode();

     var content = await result.Content.ReadAsStringAsync();

     // now we can do whatever we need with the html content we got here 🙂
     // Debug.WriteLine(content);
  }

  // assuming that the previous request created a session (set cookies, cached some data, etc)
  // subsequent requests in the webview will share this data
  myWebView.Navigate(new Uri("your-url-address"));
  
</pre>

Hopefully this short code snippet gives you a good idea of what you can do with Windows Implementation of HttpClient. 

### Other Apps?

One might ask about how will this impact other apps? and the answer is it would not. As you will see in the video (if you watch it :)), the Windows.Web library was designed to work across all requests _in one app_. Therefore, you do not need to be concerned about impacting other apps or leaking your data to other external request. 

### Conclusions

<a href="https://en.wikiquote.org/wiki/Stan_Lee" target="_blank">Someone</a> wise once said &#8220;with great power, comes great responsibility&#8221;. This should be remembered when using <a href="https://msdn.microsoft.com/en-us/library/windows.web.http.filters.httpbaseprotocolfilter.aspx" target="_blank">HttpBaseProtocolFilter</a> in your http requests as this can impact all your subsequent requests. Hope you found this useful and would love to hear your comments and feedback. 

#### References:

  * https://channel9.msdn.com/Events/Build/2013/4-092
  * https://social.msdn.microsoft.com/Forums/windowsapps/en-US/6aa75d2f-05bd-4e8d-a435-0aa3407b73e6/set-cookies-to-webview-control?forum=winappswithcsharp
  * http://blog.rajenki.com/2015/01/winrt-shared-cookies-between-webview-and-httpclient/
  * http://blogs.msdn.com/b/wsdevsol/archive/2012/10/18/nine-things-you-need-to-know-about-webview.aspx#AN7