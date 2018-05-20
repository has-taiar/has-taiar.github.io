---
id: 3311
title: What You need to know before you start developing Windows Phone apps
date: 2015-07-02T20:33:00+00:00
author: has
layout: post
guid: http://www.hasaltaiar.com.au/?p=3311
permalink: /what-you-need-to-know-before-you-start-developing-windows-phone-apps-2/
categories:
  - .NET
  - 'C#'
  - Windows Phone
tags:
  - mobile
  - Silverlight
  - WindowsPhone
  - WinRT
---
<figure id="attachment_3331" style="width: 640px" class="wp-caption aligncenter">[<img src="https://i2.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2015/07/windowsPhone.jpg?resize=525%2C297" alt="Windows Phone" width="525" height="297" class="size-full wp-image-3331" data-recalc-dims="1" />](https://i2.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2015/07/windowsPhone.jpg)<figcaption class="wp-caption-text">Windows Phone</figcaption></figure> 

To start Windows Phone development, it is very easy and there are so many tutorials out there that show you what you need to do. However, soon after starting, you will realise that there are many platforms, SDKs, and different assemblies. This means that you will often find ways to doing certain things (in blogs, tutorials, etc) that would not work in your environment, and the reason for that is the difference between these platforms. In all honesty, it is a big mess that Microsoft is currently trying to clean up by unifying the teams and bringing up a universal platform. 

This makes it extremely essential that you learn about the different platforms and options available for you before you start developing for Window Phone. This not only impacts what devices and platforms you are targeting, but it also impact how you do things. To give you an example, when you search for a simple task such as getting the name of a device (or its unique Id), you will find few sample code snippets that would allow you to do that on Windows Phone 7 and Windows Phone 8. However, when you try to do the same things on Windows Phone RT (Xaml/Universal apps), you will soon hit a block to find that these SDKs/DLLs do not exist. Thus, you need to learn about the differences in the platforms and the SDKs that you are using. 

Fortunately, there is a very nice and visual list of all the libraries and the differences in the SDK, you can find it <a href="http://firstfloorsoftware.com/Media/DiffLists/Windows%20Phone%208.1%20%28Silverlight%29-vs-Windows%20Phone%208.1.html" target="_blank">here</a>. This shows you the differences between the 2 main different SDKs in Windows Phone 8. <figure id="attachment_3321" style="width: 756px" class="wp-caption aligncenter">

[<img src="https://i1.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2015/07/WindowsPhone_Silverlight-vs-WindowsPhone_RT_Universal.png?resize=525%2C490" alt="WindowsPhone (Silverlight) vs WindowsPhone RT (Universal)" width="525" height="490" class="size-full wp-image-3321" data-recalc-dims="1" />](https://i1.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2015/07/WindowsPhone_Silverlight-vs-WindowsPhone_RT_Universal.png)<figcaption class="wp-caption-text">WindowsPhone (Silverlight) vs WindowsPhone RT (Universal)</figcaption></figure> 

### Example

To give you an example of how things are radically different, let&#8217;s take a simple task of finding the device Name and unique Id. 

#### In Windows Phone 8.1 (Silverlight)

Here is how you do that in Windows Phone 8.1 (Silverlight) and its predecessor Windows Phone 7. 

<pre class="brush: csharp; title: ; notranslate" title="">byte[] myDeviceID = (byte[])Microsoft.Phone.Info.DeviceExtendedProperties.GetValue("DeviceUniqueId");
  string DeviceIDAsString = Convert.ToBase64String(myDeviceID);
  MessageBox.Show(DeviceIDAsString);
</pre>

#### In Windows Phone 8.1 (RT/Universal/Store Apps)

Here is how you do the same thing in Windows Phone 8.1 RT/Universal/Store Apps. 

<pre class="brush: csharp; title: ; notranslate" title="">private string GetHardwareId()
  {
    var token = HardwareIdentification.GetPackageSpecificToken(null);
    var hardwareId = token.Id;
    var dataReader = Windows.Storage.Streams.DataReader.FromBuffer(hardwareId);

    byte[] bytes = new byte[hardwareId.Length];
    dataReader.ReadBytes(bytes);

    return BitConverter.ToString(bytes);
  }
</pre>

As you can see, the code is totally different for doing the same task, plus the libraries that you would expect to call would not be there in Windows Phone 8.1 RT. To make things more tricky, if you search &#8220;How to get a unique device id in Windows Phone 8.1&#8221; you will get these results in Google, which all leads you to how to do these tasks on Windows Phone 8.1 Silverlight. Example of the results <a href="http://stackoverflow.com/questions/23321484/device-unique-id-in-windows-phone-8-1" target="_blank">here</a> and <a href="http://stackoverflow.com/questions/27601993/windows-phone-8-1-deviceextendedproperties-or-devicestatus-for-device-unique-id" target="_blank">here</a>. <figure id="attachment_3332" style="width: 803px" class="wp-caption aligncenter">

[<img src="https://i1.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2015/07/How-To-Get-Device-Unique-Id-in-Windows-Phone-8.1.png?resize=525%2C375" alt="How To Get Device Unique Id in Windows Phone 8.1" width="525" height="375" class="size-full wp-image-3332" data-recalc-dims="1" />](https://i1.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2015/07/How-To-Get-Device-Unique-Id-in-Windows-Phone-8.1.png)<figcaption class="wp-caption-text">How To Get Device Unique Id in Windows Phone 8.1</figcaption></figure> 

Moving forward, you should not attempt to write things in Silverlight, as it is a dying technology. You should always aim at targeting Universal apps in Windows Phone 8.1 and Windows 10. This not only gives you the ability to work on the latest tools/SDKs, but it also enables you can to reach a wider audience by giving you the ability to support other platforms (Windows PC, Xbox, etc). 

So in conclusion, if you are starting to develop for Windows Phone, please please do have a look at the SDKs and learn the differences before you start diving in. And, when you are developing and you need to find how to do certain things in Windows Phone&#8217;s world, be sure to search for the SDK/Platform that you are using. As of now, most of the search results on StackOverflow or the results in Google Search show you how to do things in Windows Phone 7/8 Silverlight, which would not work for you mostly likely (if you are targeting Win RT/Universal/Store Apps).