---
id: 401
title: Reading GPS locations updates on iOS in MonoTouch
date: 2014-01-13T10:19:45+00:00
author: has
layout: post
guid: http://www.hasaltaiar.com.au/?p=401
permalink: /reading-gps-locations-updates-on-ios-in-monotouch/
categories:
  - .NET
  - 'C#'
  - iOS
---
In previous <a href="http://www.hasaltaiar.com.au/reading-battery-level-and-status-in-ios-using-monotouch/" target="_blank">post</a>, I showed how to read the battery level and status on iOS in MonoTouch. In this post, I will demo a simple way of reading GPS Locations updates in MonoTouch.

In iOS, in order to read LocationUpdates, you need to extend CLLocationManagerDelegate, which will get a callback whenever the phone&#8217;s location changes.

Below, I wrap this delegate with other necessary settings that you need to provide to the iOS in one entity that I call iOSLocationManager.

<pre class="brush: csharp; title: ; notranslate" title="">using System;
using MonoTouch.Foundation;
using MonoTouch.CoreLocation;

namespace MyApp.HAL.GPS
{
	public class IOSLocationManager : IIOsLocationManager
	{
		private readonly GpsFilters GpsFilters;
		private bool Started = false;
		private static CLLocationManager _LocationManager;

		public IOSLocationManager(GpsFilters filters)
		{
			GpsFilters = filters;
		}

		public void Start(Action&lt;CLLocation&gt; callback)
		{
			Inititalise(callback);
		}

		public void Stop()
		{
			if (_LocationManager != null && Started)
			{
				LogHandler.LogInfo("IOSLocationManager was stopped");
				_LocationManager.StopUpdatingLocation();
				_LocationManager = null;
				Started = false;
			}
		}

		private void Inititalise(Action&lt;CLLocation&gt; callback)
		{
			LogHandler.LogFunction("IOSLocationManager.Initialise() started");
			if (_LocationManager == null)
			{
				_LocationManager = new CLLocationManager
				{
					DesiredAccuracy = GpsFilters.Accuracy,
					DistanceFilter = GpsFilters.DistanceInMeters,
					ActivityType = GpsFilters.Activity,
					Delegate = new MyLocationDelegate(callback)
				};

				if (CLLocationManager.LocationServicesEnabled)
				{
					_LocationManager.StartUpdatingLocation();
					Started = true;
				}
				else
				{
					LogHandler.LogError("Cannot monitor LocaitonUpdates because LocationService is not Enabled");
				}
			}
			LogHandler.LogFunction("IOSLocationManager.Initialise() finished");
		}
	}

	#region Nested Types

	public interface IIOsLocationManager
	{
		void Start(Action&lt;CLLocation&gt; callback);
		void Stop();
	}

	internal class MyLocationDelegate : CLLocationManagerDelegate
	{
		Action&lt;CLLocation&gt; Callback;

		public MyLocationDelegate (Action&lt;CLLocation&gt; callback)
		{
			this.Callback = callback;
		}

		public override void UpdatedLocation (CLLocationManager manager, CLLocation newLocation, CLLocation oldLocation)
		{
			Callback (newLocation);
		}

		public override void Failed (CLLocationManager manager, NSError error)
		{
			LogHandler.LogError("MyLocationDelegate.Failed: error: " + error.LocalizedDescription);
			Callback (null);
		}
	}

	#endregion
}

</pre>

As you can see from above, the iOSLocationManager can be instantiated by passing an instance of GpsFilters which would have inside it all the settings in relation to Accuracy, Type of tracking and soon. Then, to start monitoring the location updates, we need to call Start() and we need to pass a callback to receive these updates. Also, it is worth noting that we need to stop this monitoring once we finish using it. The iOSLocatoinManager creates an instance of the CLLocationManager and passes it an instance of the CCLocationManagerDelegate to receive these updates. 

A simple implementation of the GpsFilter can be similar to the one below:

<pre class="brush: csharp; title: ; notranslate" title="">using System;
using MonoTouch.CoreLocation;
using MyApp.Configuration;

namespace MyApp.HAL.GPS
{
	public class GpsFilters  
	{
		public GpsFilters()
		{
			// default values
			DistanceInMeters = 50;
			Accuracy = CLLocation.AccuracyNearestTenMeters; 
			Activity = CLActivityType.AutomotiveNavigation;
			MaxAge = TimeSpan.Zero;
			EnableGpsDevice = false;
		}

		public int DistanceInMeters {get;set;}
		public CLActivityType Activity {get;set;}
		public double Accuracy {get;set;}
		public TimeSpan MaxAge {get;set;}
		public bool EnableGpsDevice { get; set; }

		public static GpsFilters LoadGpsFiltersFromConfig()
		{
			var gpsFilters = new GpsFilters();

			var setting = GetConfigString(Constants.iOS.GpsMinimumDistanceInMeters);
			if (!string.IsNullOrEmpty(setting))
			{
				int settingValue;
				gpsFilters.DistanceInMeters = int.TryParse(setting, out settingValue) ? settingValue : gpsFilters.DistanceInMeters;
			}

			setting = GetConfigString(Constants.iOS.GpsAccuracyLevel);
			if (!string.IsNullOrEmpty(setting))
			{
				int level;
				int.TryParse(setting, out level);
				switch (level)
				{
					case 0 : 
						gpsFilters.Accuracy = CLLocation.AccuracyHundredMeters;
						break;
					case 1 : 
						gpsFilters.Accuracy = CLLocation.AccuracyNearestTenMeters;
						break;
					case 2 : 
					default:
						gpsFilters.Accuracy = CLLocation.AccuracyBest;
						break;
				}
			}

			setting = GetConfigString(Constants.iOS.GpsMaxAgeTime);
			if (!string.IsNullOrEmpty(setting))
			{
				TimeSpan settingValue;
				TimeSpan.TryParse(setting, out settingValue);
				gpsFilters.MaxAge = settingValue;
			}

			setting = GetConfigString(Constants.iOS.GpsDeviceEnabled);
			if (!string.IsNullOrEmpty(setting) && setting == Constants.BooleanTrueString)
			{
				gpsFilters.EnableGpsDevice = true;
			}

			return gpsFilters;
		}

		private static string GetConfigString(string name)
		{
			var result = string.Empty;
			if (Config.ConfigurationManager.AppSettings[name] != null)
			{
				result = Config.ConfigurationManager.AppSettings[name];
			}
			return result;
		}
	}
}
</pre>

Another important thing to notice is that starting this iOSLocationManager from a background thread would not work. iOS expects the instantiation of any location updates listener to be on the main UI thread. Otherwise, we would not receive any updates. This can be done as follows:

<pre class="brush: csharp; title: ; notranslate" title="">private void StartIOSLocationManagerOnMainThread()
{
	MonoTouch.UIKit.UIApplication.SharedApplication.Delegate.InvokeOnMainThread(
		() =&gt;  {
		IOSLocationManager = new IOSLocationManager(GpsFilters);
		IOSLocationManager.Start(UpdateLocationOniOS);
	});
}

private void UpdateLocationOniOS(CLLocation location)
{
	if (location != null && GpsInfoReceived != null)
	{
		// The following line sets up the GpsInfo in the way my application is expecting them
                // this is because my Gps calculation and storing logic is the same across all platforms 
                var gpsInfo = GpsTranslator.GetGpsInfo(location, GpsFilters);
		GpsInfoReceived(this, new GpsInfoEventArgs(gpsInfo));
	}
}
</pre>