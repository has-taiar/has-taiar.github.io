---
id: 3011
title: 'Reachability.Net: A unified API for reachability (network connectivity) on Xamarin Android and iOS'
date: 2015-05-04T12:29:34+00:00
author: has
layout: post
guid: http://www.hasaltaiar.com.au/?p=3011
permalink: /reachability-net-a-unified-api-for-reachability-network-connectivity-on-xamarin-android-and-ios-2/
categories:
  - .NET
  - Android
  - 'C#'
  - Code Quality
  - iOS
---
Do you need to check for internet connection on your mobile app? Don&#8217;t we all do it often and on many platforms (and for almost all apps)?
  
I found myself implementing it on iOS and on Android and then pulling my implementation to almost all the mobile apps that I write. This is not efficient, and can be done better, right? 🙂 

I have created a Nuget package for everything related to network connectivity and called it Reachability.Net. The package is open source and it is hosted on GitHub <a href="https://github.com/has-taiar/Reachability.Net" target="_blank">here</a>. Currently, I am supporting Xamarin iOS and Xamarin Android. I might add Windows Phone support and .NET 4.5 depending on the feedback I get.

The library can be found on Nuget [here](https://www.nuget.org/packages/Reachability.Net/). I have put some sample code on the <a href="https://github.com/has-taiar/Reachability.Net/blob/master/README.mdown" target="_blank">read.me</a> file on GitHub, and created few samples that are included in the package. 

The library provides a unified API across all platforms. The implementation of the library is based on Xamarin Recipe on iOS, which can be found <a href="http://developer.xamarin.com/recipes/ios/network/reachability/" target="_blank">here</a>. This is a good implementation and well tested. On Android, the Xamarin recipe, which could be found <a href="http://developer.xamarin.com/recipes/android/networking/networkinfo/detect_network_connection/" target="_blank">here</a>, is not really great. The Xamarin Android recipe is based on the examples from the <a href="http://developer.android.com/training/monitoring-device-state/connectivity-monitoring.html" target="_blank">Android SDK docs</a>, but it only checks whether the device is capable of connecting to the internet (or to wifi) or not. It does not indicate the current connection status. Therefore, I had to combine the Xamarin recipe with another check for connectivity to ensure correct results. More details on Reachability on Android could be found in this <a href="http://stackoverflow.com/questions/8919083/checking-host-reachability-availability-in-android" target="_blank">StackOverflow discussion</a>. 

OK, that&#8217;s all for me and I hope you enjoy using the library. Feel free to log any issues or feature requests on Github and would love to hear your feedback.