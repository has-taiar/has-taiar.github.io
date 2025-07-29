---
id: 1911
title: TDD for Mobile Development
date: 2014-06-29T10:44:24+00:00
author: has
layout: post
guid: http://www.hasaltaiar.com.au/?p=1911
permalink: /tdd-for-mobile-development-2/
categories:
  - .NET
  - Android
  - 'C#'
  - Code Quality
  - iOS
  - Testing
---
[<img src="https://i2.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2014/06/jenkins-tests.jpg?resize=525%2C258" alt="jenkins-tests" width="525" height="258" class="aligncenter size-full wp-image-2051" data-recalc-dims="1" />](https://i2.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2014/06/jenkins-tests.jpg)
  
This post aims at exploring the best practices in terms of code quality and testability for mobile development.
  
It is part of a series that talks about Unit and Integration Testing in the Mobile space. In particular, I focus on Android and iOS. 

TDD in Mobile Development &#8211; Part 1
  
1. <a href="http://www.hasaltaiar.com.au/tdd-for-mobile-development/" target="_blank">Unit Testing of Platform-Specific Code in Mobile Development.</a>
  
2. <a href="k: http://www.hasaltaiar.com.au/portable-tiny-…rtable-tinyioc/" target="_blank">Portable IoC (Portable.TinyIoC) for Mobile Development</a>
  
3. <a href="http://www.hasaltaiar.com.au/mobile-test-driven-development-part-3-running-your-unit-tests-from-your-ide/" target="_blank">Cross-Platform Unit Testing &#8211; in progress. </a>

For many developers, testing is an after thought, and it is a task that ’s not well considered. But, there ’s heaps of research out there that shows you how much you could save and how test-first could improve your design. I am not going to go into the details of this, but I would assume that you are a test-first kind of person since you are reading this, so let’s get started. 

## NUnit Lite

In this post, I will show NUnit Lite for Xamarin.Android and Xamarin.iOS. NUnitLite as the name indicates is a cut-down version of NUnit. There are versions (builds) for testing iOS apps and for Android. The iOS comes out of the box when installing Xamarin, and it allows you to create a project from a template of NUnit Lite (MonoTouch) project. 

This approach is good when you have a platform-specific code that has to be placed in the platform-specific or inside the app project. You could reference your MonoTouch or MonoDroid projects from the NUnitLite project and start your testing. 

For Android, there are few versions of NUnitLite, I have worked with <a href="https://github.com/SpiritMachine/NUnitLite.MonoDroid" target="_blank">this one</a>. 

Sometimes, you are developing a component that needs to behave the same way on the two different platforms, but the internal implementation could be platform-specific. To test the platform specific, you put your code into your testing project as normal. But you could also **Reference** the same NUnitLite test file from both platforms to test both platforms, since it is the same expected behaviour on both platforms. Some developers do not like to have referenced files (me included), so you could create different versions for the two platforms if you wish to do so. 

Sample of iOS platform-specific code

<pre class="brush: csharp; title: ; notranslate" title="">public class TestableController : UIViewController
	{
		public TestableController ()
		{
		}

		public int GetTotal(int first, int second)
		{
			return first + second;
		}

	}
</pre>

Sample of Android platform-specific code

<pre class="brush: csharp; title: ; notranslate" title="">namespace Tdd.Mobile.Android
{
	public class TestableController : Fragment
	{
		protected override void OnCreate (Bundle savedInstanceState)
		{
			base.OnCreate (savedInstanceState);
		}

		public int GetTotal(int first, int second)
		{
			return first + second;
		}

	}
}
</pre>

Please note that I am not suggesting that you write your code this way or put your login into the UIViewControlloer or Activity classes. The only reason I am doing it this way is to show you how you could test anything inside these platform-specific classes. Ideally, you would put your logic into ViewModels or other form of container that are injected into the controllers. Anyway, assuming that we have some platform-specific logic inside these classes, this is how I would test it.

<pre class="brush: csharp; title: ; notranslate" title="">[TestFixture]
	public class TestableControllerTest
	{
		[Test]
		public void GetTotalTest()
		{
			// arrange
			var controller = new TestableController ();

			// act
			var result = controller.GetTotal (2, 3);


			// assert
			Assert.AreEqual (5, result);
		}
	}
</pre>

The screenshot below shows the structure of my solution. I have also put the code on GitHub in case you are interested in playing with the code. I would love to hear what you have to say, get in touch if you have any comments or questions. <figure id="attachment_1931" style="width: 839px" class="wp-caption aligncenter">

[<img src="https://i2.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2014/06/Tdd-Mobile-Development-Code-Structure.png?resize=525%2C388" alt="Tdd Mobile Development Code Structure" width="525" height="388" class="size-full wp-image-1931" data-recalc-dims="1" />](https://i2.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2014/06/Tdd-Mobile-Development-Code-Structure.png)<figcaption class="wp-caption-text">Tdd Mobile Development Code Structure</figcaption></figure> 

In the next blog post, I will show how most of the code could be placed into testable libraries, and could be easily tested from your IDE (VS or Xamarin Studio), without the need to run an emulator/simulator. 

TDD in Mobile Development &#8211; Part 1
  
1. <a href="http://www.hasaltaiar.com.au/tdd-for-mobile-development/" target="_blank">Unit Testing of Platform-Specific Code in Mobile Development.</a>
  
2. <a href="k: http://www.hasaltaiar.com.au/portable-tiny-…rtable-tinyioc/" target="_blank">Portable IoC (Portable.TinyIoC) for Mobile Development</a>
  
3. <a href="http://www.hasaltaiar.com.au/mobile-test-driven-development-part-3-running-your-unit-tests-from-your-ide/" target="_blank">Cross-Platform Unit Testing &#8211; in progress. </a>