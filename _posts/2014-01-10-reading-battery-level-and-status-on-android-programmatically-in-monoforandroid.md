---
id: 211
title: Reading Battery Level and Status on Android (MonoForAndroid)
date: 2014-01-10T13:50:09+00:00
author: has
layout: post
guid: http://www.hasaltaiar.com.au/?p=211
permalink: /reading-battery-level-and-status-on-android-programmatically-in-monoforandroid/
categories:
  - .NET
  - Android
  - 'C#'
---
I was tasked to implement a new feature that involves reading the Battery level and other properties and update the Header for an Android App. The idea was to be able to give a regular indicator to the user (using some icons) about the state of different hardware components and how we are using them in the app. This involves things like (Battery, GPS, Network Connectivities, etc).

So in this Post, I will show how to read the battery level and other attributes. In the next post I will show how to detect and listen to Network connectivity status changes.

The class below AndroidBattery can be used for reading all the attributes of the battery, you can even read more if you like, but then you would need to use the Update() method to make sure that you are getting these Extras from the intent

<pre class="brush: csharp; title: ; notranslate" title="">using System;
using Android.App;
using Android.Content;
using Android.OS;
using MyApp.Core.Exceptions;

public class AndroidBattery
{
    public AndroidBattery()
    {
         _Battery = new Battery(0, BatteryStatus.Unknown);
         Update();
    }

    private readonly Battery _Battery;

    public int Level
    {
       get
       {
           return _Battery.Level;
       }
    }

    public int Scale
    {
       get
       {
          return _Battery.Scale;
       }
    }

    public BatteryStatus Status
    {
       get
       {
          return _Battery.Status;
       }
    }

    private void Update()
    {
        try
        {
            var ifilter = new IntentFilter(Intent.ActionBatteryChanged);
            Intent batteryStatusIntent = Application.Context.RegisterReceiver(null, ifilter);
            _Battery = GetBatteryValuesFromIntent(batteryStateIntent);
        }
        catch (Exception exception)
        {
            ExceptionHandler.HandleException(exception, "BatteryState.Update");
            throw new BatteryUpdateException();
        }
    }

    private Battery GetBatteryValuesFromIntent(Intent intent)
    {
        var statusExtra = intent.GetIntExtra(BatteryManager.ExtraStatus, -1);
        var status = GetBatteryStatus(statusExtra);

        return new Battery {
                               Level = intent.GetIntExtra(BatteryManager.ExtraLevel, 0),
                               Scale = intent.GetIntExtra(BatteryManager.ExtraScale, -1),
                               Status = status
                           };
    }

    private BatteryStatus GetBatteryStatus(int status)
    {
        var result = BatteryStatus.Unknown;
        if (Enum.IsDefined(typeof(BatteryStatus), status))
        {
             result = (BatteryStatus)status;
        }
        return result;
     }
 }

#region Internals

public class Battery
{
     public Battery(int level, int scale, BatteryStatus status)
     {
          Level = level;
          Scale = scale;
          Status = status;
     }

     public int Level { get; set; }
     public int Scale { get; set; }
     public BatteryStatus Status { get; set; }
}

public class BatteryUpdateException : Exception
{

}

#endregion

</pre>

The implementation above is quite simple. The AndroidBattery has a method Update() that will be called in the constructor. Once this is called, then we will read the values from the instructor. One might ask why are we calling registerReciever() and passing null. This is because the BatteryBroadcast receiver is &#8220;Sticky&#8221; as Google calls it in the documentation, and thus we can just call this and read the info from the intent without worrying about registering a broadcast receiver then de-registering it 🙂

Once the AndroidBattery is initialised, then we can just read the battery attributes such as Level, Scale, and Statue. All these values are readOnly.

If you enjoyed this article, I would love to hear from you. I would be more than happy to see people reusing this code (if you like, or need to). I would also be more than happy to hear your thoughts in case I missed something or in case you think there is a better way of doing it 🙂