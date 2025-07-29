---
id: 2271
title: 'Mobile Test-Driven Development Part (3) &#8211; Running your unit tests from your IDE'
date: 2014-08-15T12:35:40+00:00
author: has
layout: post
guid: http://www.hasaltaiar.com.au/?p=2271
permalink: /mobile-test-driven-development-part-3-running-your-unit-tests-from-your-ide-2/
categories:
  - .NET
  - Android
  - 'C#'
  - Code Quality
  - iOS
  - Testing
---
TDD in Mobile Development &#8211; Part 3
  
1. <a href="http://www.hasaltaiar.com.au/tdd-for-mobile-development/" target="_blank">Unit Testing of Platform-Specific Code in Mobile Development.</a>
  
2. <a href="k: http://www.hasaltaiar.com.au/portable-tiny-…rtable-tinyioc/" target="_blank">Portable IoC (Portable.TinyIoC) for Mobile Development</a>
  
3. <a href="http://www.hasaltaiar.com.au/mobile-test-driven-development-part-3-running-your-unit-tests-from-your-ide/" target="_blank">Cross-Platform Unit Testing &#8211; in progress. </a>

This is the third post in my TDD for Mobile Development series. This post shows how we can have test driven development for mobile. We will look at options for running our tests from within our IDE and finding the right test runner for our development env without the need to launch an emulator or deploy to a device every time we want to run the tests. 

In the <a href="http://www.hasaltaiar.com.au/tdd-for-mobile-development/" target="_blank">Previous post</a> I showed how to use NUnitLite to write unit/integration tests on Android and iOS. This post shows how you could write your unit tests with NUnit framework and running them from your IDE. 

## Problems with NUnitLite

NUnitLite does not have a test runner that could be used outside of the mobile OS. This holds true for both Android and iOS. That’s why every time we need to run the tests, we have to deploy into a real device or a simulator/emulator to run the tests.
  
Now this could be ok and necessary for some platform-specific logic. However, in most cases, we do not have to test the code on the exact platform. Take the example that we had in the previous post, 

<pre class="brush: csharp; title: ; notranslate" title="">public int GetTotal(int first, int second)
    {
        return first + second;
    }
</pre>

This code is just plain c# code that could be placed outside of the platform specific code and could be used on multiple platforms, and could then be tested conveniently using NUnit. 

## Portable Class Library (PCL)

This brings us to using PCL (Portable Class Libraries). _The beauty of using PCLs is not only in sharing code across multiple platforms, but it also enables us to test our code using full frameworks like NUnit or Microsoft Test_ (although I would really stick with NUnit 🙂 ).
  
Bear in mind that PCLs are evolving and everyday there are quite few packages for PCLs are coming up. 

Some developers might argue that it is trouble-some to write your code in PCLs since it adds restrictions and only allows you to use a subset of .net that is supported on all configured platforms. 

This could be true, but you could get around it by three ways:

**1- Only support the platforms that you really need.**
  
I normally use PCL profile 78 or 158. This gives me the two main platforms that I am working on Android and iOS, plus some later versions of Windows phone (8.1), and Silver light. You do not have to use a profiles that tries to support older versions, and you will have less limitations by following this approach. 

**2- Make use of Nuget Packages.** 
  
Installing Nuget packages is a great way of going PCL. Whenever I am trying to do something that is not supported in the .NET subset, I look up the Nuget store and most of the time I would find that somebody has already developed a package that I could just use directly. The other nice thing about Nuget packages, Nuget supports distributing multiple platforms libraries. This means that sometimes you get a package that could support Android, and iOS. In this case you would find two separate folders under /lib (inside the Nuget package) one folder for each platform (Android, iOS). In some other cases, Nuget could give you a portable library where you would get folders (under /lib) like portable-win81+net54+ etc. This means that the dlls inside this folder could be used and referenced from within this kind of profiles (Platforms). This is great news because you could just use the code without worrying about changing anything. Examples of such package are: 

a. SQLite.NET-PCL
  
b. PCLWebUtility
  
c. Microsoft.Bcl
  
d. Microsfot.Bcl.Build
  
e. Microsoft.Bcl.Async
  
e. Newtonsoft.Json

**3. Abstract your platform specific logic and use a platform specific implementation.** 
  
Sometimes your logic has to have a platform specific version, let’s say you are doing something with animation, or cryptography where you need to use the platform specific libraries.
  
The best way to go about this is to have an abstraction that gets injected into the libraries/classes that depends on these (platform-specific) components. This means that your classes/libraries does not have any dependency on the platform specific code. It is only dependent on abstraction. During run-time, you could inject your platform specific implementation via any IoC container or even manually. I have a full post on <a href="http://www.hasaltaiar.com.au/portable-tiny-inversion-of-control-container-portable-tinyioc/" target="_blank">IoC in Cross-platform here</a>. Also it is worth looking at <a href="https://github.com/oysteinkrog/SQLite.Net-PCL" target="_blank">SQLite.NET-PCL</a> implementation as it follows exactly this approach. 

## MVVM

<a href="http://en.wikipedia.org/wiki/Model_View_ViewModel" target="_blank">MVVM </a>is a great approach for developing software because it ensures that your business logic is not coupled into any presentation layer/component.
  
There is even <a href="https://github.com/MvvmCross/MvvmCross" target="_blank">MVVMCross</a> which allows you to build apps in a cross-platform fashion. However, I do not prefer to go with MVVMCross because it adds much more complexity than I need and in case I need to develop and change something out of the framework, then I would need to invest a lot in learning and building workarounds. Therefore, what I do is just stick with my _ViewModels_.
  
This means I take advantage of the MVVM pattern by having my ViewModels holding all my business logic code and injecting these viewmodels into my controllers/presenters.
  
The viewModels could also have other services, factories, repositories injected into them (using IoC container or manually) and that way our code is all cross platform and very testable. 

<pre class="brush: csharp; title: ; notranslate" title="">public class CalculatorViewModel : ViewModelBase 
	{
		public int GetTotal(int first, int second)
		{
			return first + second;
		}
	}

        //iOS Controller
	public class CalculatorController : UIViewController
	{
		private readonly CalculatorViewModel _viewModel;

		public CalculatorController (CalculatorViewModel viewModel)
		{
			_viewModel = viewModel;
		}
	}

        //android Controller
        public class CalculatorController : Fragment
	{
		private readonly CalculatorViewModel _viewModel;

		public CalculatorController (CalculatorViewModel viewModel)
		{
			_viewModel = viewModel;
		}
	}
</pre>

## Writing Tests

As you can see from above, our logic is now sitting in the ViewModel and it is all testable regardless of the platform. This also make it easy for us to use any test farmework and test runners. This includes NUnit or Microsoft Test. It gets even better, we could even have our test libraries targetting .NET 4.0 or 4.5, which means we could use all the goodness of .NET in writing our tests. This includes using <a href="https://github.com/FakeItEasy/FakeItEasy" target="_blank">FakeItEasy </a>and <a href="https://www.nuget.org/packages/RhinoMocks/" target="_blank">RhinoMock</a>. 

## Running the Tests

Now that we have all this great setup, then we could look at running our tests. For using Microsoft Test, this comes out of the box so no need to install anything extra. If you prefer using NUnit like me, then you could either install the latest version of NUnit (this includes the adapter and the runner). However, there is even a better way, you could just install NUnit Adapter (with Runner) from the Nuget store. This will make the NUnit adapter and runner part of your solution and you would need to install the framework on all developers machines and your build server (as we will see in the Continuous Integration Server setup later).
  
To start writing your test, you could create a class library that targets .NET 4.0 or .NET 4.5, and install <a href="https://www.nuget.org/packages/NUnitTestAdapter/" target="_blank">NUnit Adapter Nuget package</a>, and start writing your tests like below:<figure id="attachment_2281" style="width: 701px" class="wp-caption aligncenter">

[<img src="https://i0.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2014/08/Tdd-Mobile-Common-Tests-Visual_Studio.png?resize=525%2C268" alt="dd Mobile Common Tests Visual_Studio" width="525" height="268" class="size-full wp-image-2281" data-recalc-dims="1" />](https://i0.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2014/08/Tdd-Mobile-Common-Tests-Visual_Studio.png)<figcaption class="wp-caption-text">dd Mobile Common Tests Visual_Studio</figcaption></figure> <figure id="attachment_2291" style="width: 837px" class="wp-caption aligncenter">[<img src="https://i0.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2014/08/Running-Mobile-TDD-Tests-Visual_Studio.png?resize=525%2C204" alt="Running Mobile TDD Tests Visual Studio" width="525" height="204" class="size-full wp-image-2291" data-recalc-dims="1" />](https://i0.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2014/08/Running-Mobile-TDD-Tests-Visual_Studio.png)<figcaption class="wp-caption-text">Running Mobile TDD Tests Visual Studio</figcaption></figure> <figure id="attachment_2351" style="width: 474px" class="wp-caption aligncenter">[<img src="https://i0.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2014/08/Tdd-Mobile-Common-Tests-in-Xamarin_Studio-1024x319.png?resize=474%2C147" alt="Tdd Mobile Common Tests in Xamarin Studio" width="474" height="147" class="size-large wp-image-2351" data-recalc-dims="1" />](https://i0.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2014/08/Tdd-Mobile-Common-Tests-in-Xamarin_Studio.png)<figcaption class="wp-caption-text">Tdd Mobile Common Tests in Xamarin Studio</figcaption></figure> 

## Conclusions

In Conclusion, I have demoed in the last three posts (1, 2, and 3) how to have a mobile test-driven development. I hope this motivates you to start looking at improving your code quality and employ some of the tacktics we talked about here. If you have any comments and questions, I would love to hear them so get in touch. 

TDD in Mobile Development &#8211; Part 3
  
1. <a href="http://www.hasaltaiar.com.au/tdd-for-mobile-development/" target="_blank">Unit Testing of Platform-Specific Code in Mobile Development.</a>
  
2. <a href="k: http://www.hasaltaiar.com.au/portable-tiny-…rtable-tinyioc/" target="_blank">Portable IoC (Portable.TinyIoC) for Mobile Development</a>
  
3. <a href="http://www.hasaltaiar.com.au/mobile-test-driven-development-part-3-running-your-unit-tests-from-your-ide/" target="_blank">Cross-Platform Unit Testing &#8211; in progress. </a>