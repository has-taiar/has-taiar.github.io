---
id: 151
title: Listenening to GPS updates events on MonoForAndroid
date: 2014-01-10T10:54:36+00:00
author: has
layout: post
guid: http://www.hasaltaiar.com.au/?p=151
permalink: /listenening-to-gps-updates-events-without-a-reference-to-the-activity-in-background-on-monoforandroid/
categories:
  - .NET
  - Android
  - 'C#'
tags:
  - featured
---
In the previous <a href="http://www.hasaltaiar.com.au/reading-battery-level-and-status-on-android-programmatically-in-monoforandroid/" target="_blank">post</a>, I showed the details of the requirements I had about reading Android OS resources info and updating the screen in my Android app. In this post, we will look at reading and listening to the GPS events updates on Android.

<span style="line-height: 1.5;">In my solution architecture, I have the Hardware related elements separated in a different layer (</span><code style="line-height: 1.5;">HAL Hardware Abstraction Layer</code><span style="line-height: 1.5;">) which is at the bottom of the appÂ </span>hierarchy<span style="line-height: 1.5;">. This is something that I love about my app, and it keeps things simple, testable and neat. Also, this helps me share lots of logic that controls how often we read these events, what do we do with them, etc.Â </span>

I started by following the example onÂ MonoForAndroid (receipe)Â [http://docs.xamarin.com/recipes/android/os\_device\_resources/gps/get\_current\_device_location/](http://docs.xamarin.com/recipes/android/os_device_resources/gps/get_current_device_location/)

However, this assumes that theÂ `Activity`Â is theÂ `Listener`.

Two major issues arise from this,

  1. 1. My GpsDevice Component in the HAL has no awareness of the Activity. Thus, I need to listen to the GPS events without having a reference to the Activity (or its context). So I started searching for How can I implement theÂ `ILocationListener`Â without anÂ `Activity`. I found that`ILocationListener`Â has aÂ `Dispose()`Â method and aÂ `Handle`Â field that I need to implement!! When I try just creating a class that implementsÂ `ILocationListener`Â and pass it to`LocationManager.RequestLocationUpdates()`Â I getÂ `InvalidArgumentException`. I am assuming that my implementation ofÂ `ILocationListener`Â is not valid.
  2. 2. Android keeps throwing `SystemRunTimeException` when I try to listen to these events.

I even posted the questions on <a href="http://stackoverflow.com/questions/21034359/listenening-to-gps-updates-events-without-a-reference-to-the-activity-in-backgr/21034360#21034360" target="_blank">StackOverflow</a>, but did not get an answer. Then, I found the Answers.

`First:` The class that implements `ILocationListener` needs to inherit from `Java.Lang.Object` rather than from `System.Object`
  
This is because the `LocationListener` needs to exist in both Java Delvik and the .NET env. I got this tip from http://johnclaytonmoore.com/blog/monodroid-gps-listening
  
Once you inherit from `Java.Lang.Object`, you do not need to implement the Handle property and the Dispose() method

`Second:` The `SystemRunTimeException` was being thrown because Android expects the set up to happen on the the `MainLooper` thread.
  
I used the `Applicatoin.Context` to do that without a need to reference the Activity as follows:

<pre class="brush: csharp; title: ; notranslate" title="">&lt;/pre&gt;
var handler = new Handler(Application.Context.MainLooper);
handler.Post(SetupLocationUpdatesListener);

private void SetupLocationUpdatesListener()
{
   _AndroidLocationUpdatesReceiver = new AndroidLocationListener();
   _LocationManager.RequestLocationUpdates(LocationManager.GpsProvider, GpsFilters.MinimumGpsUpdatesTimeIntervalInMiliSeconds, GpsFilters.DistanceInMeters,     _AndroidLocationUpdatesReceiver);
    _LocationManager.RequestLocationUpdates(LocationManager.NetworkProvider, GpsFilters.MinimumGpsUpdatesTimeIntervalInMiliSeconds, GpsFilters.DistanceInMeters, _AndroidLocationUpdatesReceiver);
    HookGpsEvents();
}
&lt;pre&gt;
</pre>

Here is the Full Code of the `AndroidLocationListener`

<pre class="brush: csharp; title: ; notranslate" title="">&lt;/pre&gt;
using System;
using Android.Locations;
using Android.OS;

namespace MyApp.Hal.GPS
{
	public class AndroidLocationListener : Java.Lang.Object, ILocationListener
	{
		 private Location _Location;
		 public event EventHandler LocationChanged;
		 public event EventHandler LocationStatusChanged;

		 public void OnLocationChanged(Location location)
		 {
			_Location = location;
			if (LocationChanged != null)
			{
				LocationChanged(this, new AndroidLocationChangedEventArgs(true,_Location));
			}
		 }

		public void OnProviderDisabled(string provider)
		{
			if (LocationStatusChanged != null)
			{
				LocationStatusChanged(this, new AndroidLocationChangedEventArgs(false, null));
			}
		}

		public void OnProviderEnabled(string provider)
		{
			if (LocationStatusChanged != null)
			{
				LocationStatusChanged(this, new AndroidLocationChangedEventArgs(true, _Location));
			}
		}

		public void OnStatusChanged(string provider, Availability status, Bundle extras)
		{
			if (LocationStatusChanged != null)
			{
				var hasFix = status == Availability.Available;
				LocationStatusChanged(this, new AndroidLocationChangedEventArgs(hasFix, _Location));
			}
		}
	}

	public class AndroidLocationChangedEventArgs : EventArgs
	{
		public AndroidLocationChangedEventArgs(bool hasFix, Location location)
		{
			HasFix = hasFix;
			Location = location;
		}

		public Location Location { get; set; }
		public bool HasFix { get; set; }
	}

}
&lt;pre&gt;
</pre>