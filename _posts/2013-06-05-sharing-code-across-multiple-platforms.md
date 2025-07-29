---
id: 4125
title: Sharing Code across multiple platforms
date: 2013-06-05T21:53:00+00:00
author: has
layout: post
guid: http://taytechs.com/blog/?p=32
permalink: /sharing-code-across-multiple-platforms/
categories:
  - .NET
  - Android
  - 'C#'
  - iOS
tags:
  - featured
---
Recently I have been working on a project to port the code pool of a mobile Logistic product to Android and iOS from its current base (Windows 5.0, 6.0). We spent quite sometime looking for options around and what are the approaches available. Finally we decided to go with Xamarin MonoTouch and MonoDroid. I must say, I have been working with Xamarin products for almost 6 months now, and I find it quite reliable, except the times when it screws up and u need to trace lots of things to find it was a bug in Mono and u reported. But truth to be told, I find MonoDroid a lot better than Developing for Android on Eclipse using ADT. That was a real pain for me 🙁

Now to get to the fun part, sharing the code directly was not possible. The reason was because the DLL libraries would be bulit for Windows 5.0 or 6.0 and you cannot take them the same way to use them on Android or iOS. I was happy to reference one of my dll libraries and get the code to compile, yet once you run it, it blows up. 🙁

So what you need to do is to create a new project (using MonoTouch, MonoDroid) with the same details on each new platform (Android, iOS) and add your code.
  
When it comes to adding your files, you could just add these files `As Link` This means that you do not need to re-write your code. All you need is to create a skeleton project (class library) and add your code (`As Link`) and you should be able to compile, build and use your code the same way as you do on Windows.

If you have your code written in a way that respect the separation of concerns (I am grateful that I am lucky to work with such code), then porting the business logic of your code should be a breeze.