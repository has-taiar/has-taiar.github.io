---
id: 3071
title: 'Announcing KeyChain.NET: a unified API for using KeyChain on many platforms'
date: 2015-05-06T10:44:32+00:00
author: has
layout: post
guid: http://www.hasaltaiar.com.au/?p=3071
permalink: /announcing-keychain-net-a-unified-api-for-using-keychain-on-many-platforms-2/
categories:
  - .NET
  - Android
  - 'C#'
  - Code Quality
  - iOS
tags:
  - Android
  - iOS
  - keychain
  - keystore
  - password
  - privatekey
  - Security
  - xamarin
---
### Updated &#8211; 16-May-2015

The latest version of KeyChain.Net (0.0.4) now available and it supports Windows Phone, thanks to the contribution of <a href="https://github.com/IlSocio" target="_blank">Marco</a>

Storing and accessing private keys and passwords can be a tricky task. How far do you need to go to protect your (and the user&#8217;s) data? This is where KeyChain on iOS comes in handy. It allows you to store keys in a (arguably) secure database. This has seen great improvements since iOS 8 and iOS devices (since iPhone 5S) equipped with a special A7 chip designed particularly for holding your keys. More on iOS KeyChain can be found on Apple&#8217;s website <a href="https://developer.apple.com/library/mac/documentation/Security/Conceptual/keychainServConcepts/01introduction/introduction.html" target="_blank">here</a>. Android, on the other side has its KeyStore, which also gives you some level of protection, but leaves a major part of the implementation to your (the developer). Details of Android KeyStore can be found on Android SDK <a href="https://developer.android.com/training/articles/keystore.html" target="_blank">here</a>. 

While working on recent projects, I found myself needing to have a unified way of accessing the KeyChain on both platforms. I implemented the generic library and it&#8217;s been working very well, so I thought it would be nice to share the love with the community, so here it comes 🙂

KeyChain.Net offers developers a unified, simple-to-use api for storing, accessing, and deleting keys from the keyChain (or KeyStore). It also offers further customisation capabilities based on what the platform supports. For instance, iOS KeyChain supports seamless sync (of your private keys) with other iOS devices using iCloud. This can be achieved using KeyChain.Net by turning ON the autoSyncToiCloud setting. 

The package is open source and it is hosted on GitHub <a href="https://github.com/has-taiar/KeyChain.Net" target="_blank">here</a>. Currently, I am supporting Xamarin iOS and Xamarin Android. I might add Windows Phone depending on the feedback I get.<figure id="attachment_3081" style="width: 737px" class="wp-caption aligncenter">

[<img src="https://i2.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2015/05/keychain-nuget.png?resize=525%2C61" alt="Keychain nuget package" width="525" height="61" class="size-full wp-image-3081" data-recalc-dims="1" />](https://i2.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2015/05/keychain-nuget.png)<figcaption class="wp-caption-text">Keychain nuget package</figcaption></figure> 

The library can be found on Nuget [here](https://www.nuget.org/packages/KeyChain.Net/). I have put some sample code on the <a href="https://github.com/has-taiar/KeyChain.Net/blob/master/README.mdown" target="_blank">read.me</a> file on GitHub, and you could also look at the unit tests for information on how to use it. Tests are also available on Github. 

Feel free to fork the repo on github and use it in any way you like or simply pull the nuget package to your project and enjoy it :). I would appreciate all feedback and if you have any issues or feature requests then please log them on Github.