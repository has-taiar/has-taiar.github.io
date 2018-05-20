---
id: 891
title: Loading Drawables by name during runtime on MonoForAndroid
date: 2014-01-25T12:55:38+00:00
author: has
layout: post
guid: http://www.hasaltaiar.com.au/?p=891
permalink: /loading-drawables-by-name-during-runtime-on-monoforandroid/
categories:
  - .NET
  - Android
  - 'C#'
---
In Android, When trying to load any Drawable, or Layout on Android, you need to previously know the ResourceID.
  
The Resource Ids are auto-generated during compile time when you build the app. This all works nicely when you are setting on Image drawable or one static layout.
  
However, the issue arise when you are trying to change a drawable or a layout file during run-time. Sometimes you do not know what the name of the file might, or it could be something that is configurable and could change.

I had this issue when I working on my app where we have a header that shows all the hardware components indicators in the header (like Bluetooth, Gps, Gprs, Network Connectivity, etc). For these, I would need to change the content
  
or the drawable during runtime.

Android does allow loading the images by name but it is a very fiddly process that requires the Activity.Context (which I do not like to pass around in my app), also this method just did not work for me on MonoDroid.
  
In my situation, I have these drawables in a class library somewhere else so not in the same start-up project (the app project). During runtime I need to change the drawable of the images based on the hardware status.

After trying the Android approach of trying to get the Id by its Drawable name, I could not get that to work. Interestingly, MonoDroid/Android changes the names of my images/drawables from capital to small letters. I can understand that Android does not allow mixing of casing, but it should not change the name without notifying me. It &#8216;s very confusing.
  
At the end, I came up with my solution, which is to load the ResourceId via reflection and it works much nicer :). See the code below.

<pre class="brush: csharp; title: ; notranslate" title="">protected void UpdateImageDrawable(ImageView indicatorImage, string imageName)
{
	if (indicatorImage != null)
	{				
		var fileName = imageName.Substring(0, imageName.IndexOf('.')); // ex: battery_on.png
		int imageResourceId = GetDrawableResourceIdViaReflection(fileName);
		if (imageResourceId != 0)
		{
			var drawable = Application.Context.Resources.GetDrawable(imageResourceId);
			indicatorImage.SetImageDrawable(drawable);
			indicatorImage.Invalidate();
		}				
	}
}

private int GetDrawableResourceIdViaReflection(string fileName)
{
	var result = 0;
	var drawablesType = typeof (Resource.Drawable); // this is the Resource.Drawable in the project where the drawables are (could be a code lib)
	var resourceIdField = drawablesType.GetField(fileName, BindingFlags.Public | BindingFlags.Static);
	if (resourceIdField != null)
	{
		result = (int) resourceIdField.GetValue(null);
	}
	return result;
}
</pre>