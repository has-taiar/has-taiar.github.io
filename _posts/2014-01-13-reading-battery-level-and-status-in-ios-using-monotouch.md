---
id: 351
title: Reading Battery Level and Status in iOS using MonoTouch
date: 2014-01-13T09:27:14+00:00
author: has
layout: post
guid: http://www.hasaltaiar.com.au/?p=351
permalink: /reading-battery-level-and-status-in-ios-using-monotouch/
categories:
  - .NET
  - 'C#'
  - iOS
---
In a previous post, I showed how to read the Battery level (and other attributes on Android). In this post, I will demo how to do the same thing on iOS.

I had the same requirements from the previous post, which is to update the screen on my app with information about the iOS resources. This included Battery Level and Status, Wifi Connectivity, Gprs Connectivity, Gps locations update, and Bluetooth. In this post, I will demo reading the battery attributes on iOS, and in the next few posts I will demo the remaining parts.

So to start with, I have created an iOSBattery class which is similar to the one I showed on Android. This reads the Battery Level and Status and makes them available for higher levels of the app.

<pre class="brush: csharp; title: ; notranslate" title="">using System;
using MonoTouch.UIKit;

namespace MyApp.HAL.Battery
{
	public class IOSBattery
	{
		public IOSBattery()
		{
			_Battery = new Battery();
			Update();
		}

		private Battery _Battery { get; set; }

		public int BatteryLevel
		{
			get
			{
				return _Battery.Level;
			}
		}

		public BatteryStatus BatteryStatus
		{
			get
			{
				return GetBatteryStatus(_Battery.Status);
			}
		}

		public void Update()
		{
			try
			{
				UIDevice.CurrentDevice.BatteryMonitoringEnabled = true;
				_Battery.Level = (int)(UIDevice.CurrentDevice.BatteryLevel * IOSBatteryLevelScalingFactor);
				_Battery.State = UIDevice.CurrentDevice.BatteryState;
			}
			catch (Exception e)
			{
				ExceptionHandler.HandleException(e, "BatteryState.Update");
				throw new BatteryUpdateException();
			}
			finally
			{
				UIDevice.CurrentDevice.BatteryMonitoringEnabled = false;
			}
		}

		private BatteryStatus GetBatteryChargeStatus()
		{
			var result = BatteryStatus.Unknown;
			if (_Battery != null)
			{
				switch (_Battery.State)
				{
					case UIDeviceBatteryState.Charging:
						result = BatteryStatus.Charging;
						break;
					case UIDeviceBatteryState.Full:
						result = BatteryStatus.Full;
				}
			}
			return result;
		}

		// iOS returns the values as percetages like 0.85
		private const int IOSBatteryLevelScalingFactor = 100;

		#region Nested types

		public class BatteryUpdateException : Exception
		{
		}

		public class Battery
		{
			public Battery()
			{
				Level = 0;
				State = UIDeviceBatteryState.Unknown;
			}

			public int Level { get; set; }
			public UIDeviceBatteryState State { get; set; }
		}

		#endregion

		#region Battery Status Enums

		public enum BatteryStatus
		{
			Charging = 0,
			Full = 1,
			Unknown = 2,
		}

		#endregion
	}
}
</pre>

Similar to the AndroidBattery that I have demonstrated in the previous post, we have iOSBattery here where we it makes the Battery Level and the status available for other components of the app. Two things to notice:

  1. The battery level returned by the iOS is a decimal percentage (ie 0.85) and hence we need to multiply that by 100, because our business logic expects the battery level to be of range 1-100 and that is shared across multiple platform.
  2. We set the EnableBatteryMonitoring before we read and then we set it to false once we finish with reading the battery properties.

I hope you find this post useful. Feel free to use all or parts of it, and would love to hear your feedback.