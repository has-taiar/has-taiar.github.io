---
id: 2151
title: Portable Tiny Inversion of Control Container (Portable-TinyIoc)
date: 2014-07-04T07:07:51+00:00
author: has
layout: post
guid: http://www.hasaltaiar.com.au/?p=2151
permalink: /portable-tiny-inversion-of-control-container-portable-tinyioc-2/
categories:
  - .NET
  - Android
  - Azure
  - 'C#'
  - Cloud
  - Code Quality
  - iOS
  - Testing
---
TDD in Mobile Development &#8211; Part 2

This post is the second in a series that talks about TDD in Mobile Development, the links below show the other parts of the series. 

1. <a href="http://www.hasaltaiar.com.au/tdd-for-mobile-development/" target="_blank">Unit Testing of Platform-Specific Code in Mobile Development.</a>
  
2. <a href="k: http://www.hasaltaiar.com.au/portable-tiny-…rtable-tinyioc/" target="_blank">Portable IoC (Portable.TinyIoC) for Mobile Development</a>
  
3. <a href="http://www.hasaltaiar.com.au/mobile-test-driven-development-part-3-running-your-unit-tests-from-your-ide/" target="_blank">Cross-Platform Unit Testing &#8211; in progress. </a>

##### [Update Date = 3rd July 2015]

I wrote this post sometime back when TinyIoC was the only one that I know that worked well on Xamarin. Since then, many IoC containers have added/implemented support to Xamarin platforms and some of them are even better than TinyIoC. Therefore I would suggest that you look into using one of these IoCContainers. <a href="http://arteksoftware.com/ioc-containers-with-xamarin/" target="_blank">This blog post</a> has a good list of few and have code samples and comparisons. At the moment, I am using AutoFac on Xamarin and it works great 🙂

##### [/Update]

In a <a href="http://www.hasaltaiar.com.au/tdd-for-mobile-development/" target="_blank">previous post</a>, we looked at writing unit and integration tests for platform-specific code in Android and iOS. Also, I promised to show you in the next post how to write cross platform unit tests that would assert your logic once and for many platforms. However in order to do that, you need to first consider how **testable** is your code. 

## Testability

In order to write good unit tests and have a good test coverage around your code, you need to first consider Code Testability. There are many books and blogs that talks about <a href="http://en.wikipedia.org/wiki/Software_testability" target="_blank">Testability</a>, I find these posts good in demoing and communicating the basics of what is needed <a href="http://misko.hevery.com/code-reviewers-guide/" target="_blank">1</a>, and <a href="http://www.methodsandtools.com/archive/archive.php?id=103" target="_blank">2</a>. 

Basically, your classes/libraries need to declare upfront what dependencies they have. It is not acceptable to have classes that just instantiate (using _new_ keyword or otherwise) other classes, or invoke static methods/fields from other entities. You might ask why? and I am glad you asked. That&#8217;s because such classes/libs are not testable. You cannot mock/fake/change their internal behaviours. To make things worse, some of these external dependencies or static classes might be platform dependent or might require certain environment context to return certain output, which means such code would be only testable in few small scenario cases. Yet worse, using static methods gives you more head-ache when it comes to thread safety, which is another topic by itself.
  
Therefore, your code should be clean enough and declare its dependancies upfront, so that we could test it in separation of other dependencies. For that, the concept of Inversion of Control (<a href="http://en.wikipedia.org/wiki/Inversion_of_control" target="_blank">IoC</a>) was introduced. IoC containers enables developers to register dependencies at the start of the application in a central point to have a better visibility of dependencies and to allow for a better testability. 

There are many IoC containers out there, but very few of them are fit for mobile development. Also, many of these containers are more geared towards large projects with lots of features that are not relevant to mobile apps. I found <a href="http://stackoverflow.com/questions/2515124/whats-the-simplest-ioc-container-for-c" target="_blank">this question and answers</a> on StackOverFlow which talks about the popularity and suitability of the latest IoC containers. In our case, we have been glad using <a href="https://github.com/grumpydev/TinyIoC" target="_blank">TinyIoC</a>. 

## TinyIoC

TinyIoC is a great light container that allows you to register your entities for the whole app domain. It&#8217;s light enough to be included in most small projects, yet feature-rich to offer convenience and flexibility to developers. We have been using it for quite a while now and previously my colleague Mark T. has blogged about it <a href="http://mtrinder.wordpress.com/2010/03/31/an-ioc-that-follows-you-around/" target="_blank">here</a>. TinyIoC comes with mainly two files, the container itself and a small light-weight messengerHub that could be used for communicating messages across different entities/libraries. The bad news for me was that TinyIoC is a platform specific so I had to include a different library in Android and a different one in iOS too. Plus, I could not take that part of my code to my **Portable** class libraries. So I started thinking about getting this into the next level. 

## Portable TinyIoC

I forked TinyIoC on <a href="https://github.com/has-taiar/TinyIoC" target="_blank">github</a>, and simply enough, I got it to compile as a portable library (profile 102) that could be used on the following platforms.
  
1. Xamarin.Android
  
2. Xamarin.iOS
  
3. Windows Phone 8.1+
  
4. .NET 4.0.3+
  
All I needed to do was to separate the library into two different parts, a TinyIoC.Core which targets .NET 4.0 (old Reflection API), and a Portable Wrapper that targets Portable profile (102), and now we have a Portable TinyIoC, you can find it on my github <a href="https://github.com/has-taiar/TinyIoC" target="_blank">account here</a>. I am still working on making it a Nuget Package or submitting a pull request, but so far I have it working in a stable condition and I have all unit tests passing. 

## Examples of Using TinyIoC on iOS

Like with most IoC containers, you need to register your dependencies (or set auto-discovery to on 🙂 ), so on the start of the app, we register like this:

<pre class="brush: csharp; title: ; notranslate" title="">public static class Bootstrap
{
	public static void BuckleUp (AppDelegate appDelegate)
	{
			TinyIoCContainer.Current.Register&lt;ITinyMessengerHub, TinyMessengerHub&gt;();
			TinyIoCContainer.Current.Register&lt;AppDelegate&gt; (appDelegate);

			TinyIoCContainer.Current.Register&lt;ILogger&gt; (TinyIoCContainer.Current.Resolve&lt;Logger&gt; ());
			TinyIoCContainer.Current.Register&lt;ICloudMobileDataService&gt; (TinyIoCContainer.Current.Resolve&lt;AzureMobileService&gt; ());

			TinyIoCContainer.Current.Register&lt;IUserRepository&gt; (TinyIoCContainer.Current.Resolve&lt;UserRepository&gt; ());
	}
}		
</pre>

As you can see, this Bootstrap class gets called from the main AppDelegate, passing it a reference to the app delegate, and it will register all dependencies. Remember that you need to register your dependencies in order, otherwise you might end up with exceptions. The great thing about this is, not only you could mock pretty much everything and test however way you want, but you also do not need to repeat instantiate all dependencies to get a certain entity. As an example, if your viewModel takes 3 parameters in the constructor, all of these are other entities (cloud service, repository, etc), you only need to user container.Resolve<ViewModel>() and it will get you your entity with all its dependencies, bingo 🙂
  
Also, TinyIoC manages any disposable objects and dispose of them properly. 

## Examples of Using TinyIoC on Android

On Android, you would not notice much difference, except in the placement of the entry point (BuckleUp()), which in this case gets called from within the MainLauncher activity. Our Android bootstrap would look like this:

<pre class="brush: csharp; title: ; notranslate" title="">public static class Bootstrap
{
        public async static Task BuckleUp(IActivity activity)
        {
            TinyIoCContainer.Current.Register&lt;ITinyMessengerHub, TinyMessengerHub&gt;();
            TinyIoCContainer.Current.Register&lt;IApplication&gt;((IApplication)Android.App.Application.Context);
            TinyIoCContainer.Current.Register&lt;IActivity&gt;(activity);
            // more code is omitted 
        }
}
          
</pre>

## Conclusions

In Conclusions, I have shown how simple and elegant it is to use an IoC containers. I prefer TinyIoC because it is very light and now we have a portable version of it, so you have no excuse no more. Start looking at integrating TinyIoC.Portable into your next mobile project and I would love to hear your thoughts. In the next post, we will look at Corss-Platform Unit Testing

TDD in Mobile Development &#8211; Part 2
  
1. <a href="http://www.hasaltaiar.com.au/tdd-for-mobile-development/" target="_blank">Unit Testing of Platform-Specific Code in Mobile Development.</a>
  
2. <a href="k: http://www.hasaltaiar.com.au/portable-tiny-…rtable-tinyioc/" target="_blank">Portable IoC (Portable.TinyIoC) for Mobile Development</a>
  
3. <a href="http://www.hasaltaiar.com.au/mobile-test-driven-development-part-3-running-your-unit-tests-from-your-ide/" target="_blank">Cross-Platform Unit Testing &#8211; in progress. </a>