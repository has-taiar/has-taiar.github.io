---
id: 281
title: Detecting Network Connectivity Status changes on Android (MonoForAndroid)
date: 2014-01-10T14:32:56+00:00
author: has
layout: post
guid: http://www.hasaltaiar.com.au/?p=281
permalink: /detecting-network-connectivity-status-changes-on-android-monoforandroid/
categories:
  - .NET
  - Android
  - 'C#'
---
In the previous <a href="http://www.hasaltaiar.com.au/reading-battery-level-and-status-on-android-programmatically-in-monoforandroid" target="_blank">post</a>, I explained how we can read the battery status and read Android Battery level, Scale, and Status programmatically.

In this post, I will show how to detect and show the status of the Network connectivity. First, I developed a class that gives me the Connectivity status of Wifi, and of the Mobile Gprs (2G, 3G, 4G) connection. This one is blow:

<pre class="brush: csharp; title: ; notranslate" title="">using Android.App;
using Android.Content;
using Android.Net;

namespace MyApp.HAL.Android
{
     public class AndroidNetworkHelper
     {
           public static AndroidNetworkStatus GetWifiConnectivityStatus()
           {
                return GetConnectivityStatus(ConnectivityType.Wifi);
           }

           public static AndroidNetworkStatus GetMobileConnectivityStatus()
           {
                return GetConnectivityStatus(ConnectivityType.Mobile);
           }

          #region Implementation

          private static AndroidNetworkStatus GetConnectivityStatus(ConnectivityType connectivityType)
          {
               var connectivityManager = (ConnectivityManager)Application.Context.GetSystemService(Context.ConnectivityService);
               var wifiNetworkInfo = connectivityManager.GetNetworkInfo(connectivityType);
               var result = GetNetworkStatus(wifiNetworkInfo);
                return result;
          }

          private static AndroidNetworkStatus GetNetworkStatus(NetworkInfo wifiNetworkInfo)
          {
               var result = AndroidNetworkStatus.Unknown;
               if (wifiNetworkInfo != null)
               {
                    if (wifiNetworkInfo.IsConnected)
                    {
                         result = AndroidNetworkStatus.Connected;
                    }
                    else if (wifiNetworkInfo.IsAvailable)
                    {
                         result = AndroidNetworkStatus.Available;
                    }
                    else
                    {
                          result = AndroidNetworkStatus.Disconnected;
                    }
                }
                return result;
          }

          #endregion
      }

     public enum AndroidNetworkStatus
     {
           Connected,
           Disconnected,
           Available,
           Unknown
      }
}

</pre>

The above class makes use of the ConnectivityManager of Android to work out whether we have a network connection or not. In my case, I did not want to keep a reference to the Activity or its Context, so I created a class that is called Application and this holds the App Context for the lifetime of the application. This can be seen in Application.Context. More details about this <a href="http://stackoverflow.com/questions/9928386/custom-application-child-class-in-mono-for-android" target="_blank">here</a>

The AndroidNetworkHelper above is quite helpful for getting information about the connectivity status. However, sometimes we need to listen to the changes in the connection status. Say we connected to Wifi, diconnected, or connected to 3G, etc. in order to detect NetworkStatusChanges, we need to implement a broadcastReceiver. Below is an example of that.

<pre class="brush: csharp; title: ; notranslate" title="">[BroadcastReceiver]
    public class NetworkChangesReceiver : BroadcastReceiver
    {
         public override void OnReceive(Context context, Intent intent)
         {
             if (NetworkStatusChanged != null)
             {
                 NetworkStatusChanged(this, EventArgs.Empty);
             }
         }

        public EventHandler NetworkStatusChanged;
     }

</pre>

The trick here is instead of getting all the extras from the intent when we get this callback, I use the AndroidNetworkHelp (above) to see the new changes. I find this way more reliable.
  
I have created an AndroidWifiConnectivity that register this broadcast receiver and de-register. You can use this WifiConnectivity to listen to the NetworkStatusChanged events and to get an indicator whether wifi connection is available or not.

<pre class="brush: csharp; title: ; notranslate" title="">&lt;pre&gt;
using System;
using Android.App;
using Android.Content;
using Android.Net;
using MyApp.Core;
using MyApp.HAL.Connectivities;
using MyApp.HAL.Constants;

namespace MyApp.HAL.Android.Connectivities
{
	public class AndroidWifiConnectivity : Connectivity, IWirelessConnectivity
	{
		private bool _WifiConnected;
		private ConnectionStatus _Connection = ConnectionStatus.Unknown;
		private NetworkChangesReceiver _NetworkChangesBroadcastReceiver;
		public event EventHandler NetworkStatusChanged;

		public override bool Connected
		{
			get
			{
				UpdateCurrentConnectionStatus();
				return _WifiConnected;
			}
		}

		#region Implementation

		protected virtual void OnNetworkStatusChanged(object sender, EventArgs e)
		{
			if (NetworkStatusChanged != null)
			{
				NetworkStatusChanged(sender, e);
			}
		}

		#endregion

		protected void NotifySpots()
		{
			OnNetworkStatusChanged(this, EventArgs.Empty);
		}

		public override void OnStartUp()
		{
			if (_NetworkChangesBroadcastReceiver == null)
			{
				_NetworkChangesBroadcastReceiver = new NetworkChangesReceiver();
			}

			HookNetworkEvents();
			_WifiConnected = AndroidNetworkHelper.GetWifiConnectivityStatus() == AndroidNetworkStatus.Connected;
		}

		private void HookNetworkEvents()
		{
			_NetworkChangesBroadcastReceiver.NetworkStatusChanged += NetworkStatusChangedHandler;
			Application.Context.RegisterReceiver(_NetworkChangesBroadcastReceiver, new IntentFilter(ConnectivityManager.ConnectivityAction));
		}

		private void UnhookNetworkEvents()
		{
			_NetworkChangesBroadcastReceiver.NetworkStatusChanged -= NetworkStatusChangedHandler;
			Application.Context.UnregisterReceiver(_NetworkChangesBroadcastReceiver);
		}

		private void NetworkStatusChangedHandler(object sender, EventArgs e)
		{
			UpdateCurrentConnectionStatus();
			NotifySpots();
		}

		public override void OnStop()
		{
			CleanUp();
		}

		public override void CleanUp()
		{
			if (_NetworkChangesBroadcastReceiver != null)
			{
				UnhookNetworkEvents();
				_NetworkChangesBroadcastReceiver.Dispose();
			}
		}

		public ConnectionStatus CurrentConnectionStatus()
		{
			return UpdateCurrentConnectionStatus();
		}

		private ConnectionStatus UpdateCurrentConnectionStatus()
		{
			var wifiConnectivityStatus = AndroidNetworkHelper.GetWifiConnectivityStatus();
			if (wifiConnectivityStatus == AndroidNetworkStatus.Connected)
			{
				_Connection = ConnectionStatus.Connected;
				_WifiConnected = true;
				SignalStrength = 100;
			}
			else if (wifiConnectivityStatus == AndroidNetworkStatus.Disconnected)
			{
				_Connection = ConnectionStatus.Disconnected;
				_WifiConnected = false;
				SignalStrength = 0;
			}
			else
			{
				_Connection = ConnectionStatus.Unknown;
				_WifiConnected = false;
				SignalStrength = 0;
			}
			return _Connection;
		}
	}
}
&lt;/pre&gt;

</pre>

The AndroidWifiConnectivity above can be used for detecting any changes in the Network connectivity on an Android device and it will register and de-register the broadcast receiver for you. Remember to call OnStartUp() and OnStop() methods in your app. Ideally you could do that in your OnCreate() and OnStop() in the activity or you could do that somewhere else if you have a separate implementation for the HAL layer like me. 

Again, If you enjoyed this article, I would love to hear from you. I would be more than happy to see people reusing this code (if you like, or need to). I would also be more than happy to hear your thoughts in case I missed something or in case you think there is a better way of doing it