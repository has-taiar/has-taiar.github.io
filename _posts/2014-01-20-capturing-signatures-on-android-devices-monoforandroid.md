---
id: 561
title: Capturing Signatures on Android Devices (Xamarin.Android)
date: 2014-01-20T11:55:34+00:00
author: has
layout: post
guid: http://www.hasaltaiar.com.au/?p=561
permalink: /capturing-signatures-on-android-devices-monoforandroid/
categories:
  - .NET
  - Android
  - 'C#'
tags:
  - featured
---
In this post, I will demo how to capture signatures on Android devices to allow users to use their fingers or a stylus to enter a signature on the Screen.

## Update: 7th May 2015

I wrote this blog post a long time back and it still works nicely. However, if you come here looking for a simple way to implement capturing signatures on your app, I would recommend looking at the SignaturePad Xamarin component first before you get into creating your own :). The SignaturePad Xamarin component can be found <a href="https://components.xamarin.com/view/signature-pad" target="_blank">here</a>. 



The view above can be used to capture signature on Android devices using MonoForAndroid. Basically we catch all major touch events on the view (TouchStart, Move, and TouchEnd). With each touch we force a redraw of the view to update the drawing of the signature on the screen. At the end of the capturing of the Signature, we can have two ways of capturing (keeping) this signature. We could use the object _bitmap, which will have the image of the view, OR we could just capture all the coordinates of all the points send it to the server and reconstruct the signature (This is the option that I use). The second option gives more control on how to reconstruct the signature and how to use it. It also gives the ability to add Watermarks, change size and type of image and more.

The SignatureData class can be seen above holds a two dimensional array of all the points (moves) that compose the whole signature.

In the <a href="http://www.hasaltaiar.com.au/capturing-a-signature-as-a-string-of-points-on-the-mobile-and-redrawing-it-on-the-server/" target="_blank">next post</a>, I will show how to capture the signature as a list of points to use it on the server to redraw the signature. Meanwhile, feel free to reuse this code and shot me any comments or suggestions that you might have