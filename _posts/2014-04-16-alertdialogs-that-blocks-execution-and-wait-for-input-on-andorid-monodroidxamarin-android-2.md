---
id: 1521
title: AlertDialogs that Blocks Execution and Wait for input on Andorid (MonoDroid/Xamarin.Android)
date: 2014-04-16T21:37:37+00:00
author: has
layout: post
guid: http://www.hasaltaiar.com.au/?p=1521
permalink: /alertdialogs-that-blocks-execution-and-wait-for-input-on-andorid-monodroidxamarin-android-2/
categories:
  - .NET
  - Android
  - 'C#'
tags:
  - featured
---
This blog post aims at addressing the following:

1. Why is blocking the UI and waiting for the User&#8217;s input is sometimes required?
  
2. How to have an Alert Modal that waits for the user&#8217;s input on Android using MonoDroid (Xamarin.Android) 

## Problem

I have some business logic (controllers), which assume that showing a confirmation box (alertDialog) is a blocking call on the UI. This need not change
  
while I need to fulfill the requirement and show the screens with a confirm box. 

### Problem Details

I have seen all the arguments (<a href="http://stackoverflow.com/questions/6120567/android-how-to-get-a-modal-dialog-or-similar-modal-behavior" target="_blank">here</a> and <a href="http://stackoverflow.com/questions/2028697/dialogs-alertdialogs-how-to-block-execution-while-dialog-is-up-net-style" target="_blank">here</a>) and in many other places about how bad is Blocking the UI to wait for a feedback, and I cannot agree more.
  
However, being good or a bad is one thing and having a requirement for a particular feature (blocking UI alert dialog) is another. 

I developed an app on Android using MonoDroid (Xamarin.Android), and it uses MVC design pattern. All the screens are designed to be dummy fragments (classes) that are bound to the Controllers.
  
The Controllers are the core part of the business for this client. These Controllers were developed on Windows but they only have Business Logic, the requirement for me was to produce similar app in Android (similar to the windows one)
  
which would use MVC and makes use of these controllers with no changes (or the minimum possible).
  
This is understandable, considering the fact that these Controllers (including algorithms, libraries, etc) that have been tested, used and trusted. 

I developed the app well enough without the need to change any of the controllers and all worked well, UNTIL I need to have a confirmation box.
  
Windows style of MessageBox or Confirm Box is all synchronous, meaning that it blocks the UI and wait for the user to click Yea/No. This was an assumption that sneaked into these controllers and I need to find a way to comply with that.
  
Even when I ported the app to iOS, I did not have any issue with this, since iOS uses UI-Blocking mechanism of showing Alert/Confirm dialog boxes (Modal).
  
However, Android uses Asynch approach to deal with anything that is UI related. This is great news in terms of the user experience, but it is terrible news to me, that I promised to do this app and bring the app as close as possible to Windows and iOS &#8220;without changing the controllers&#8221;. 

I started looking for options, I found Q&A mentioned above on SO and other sites, and they all talk about the same thing were you need to pass a callback to the alertDialog. This is not an option for me because the Controllers assume that we have a blocking call to the UI when we require confirmation from the user.
  
To Demo this, let&#8217;s look at the Logout Button event handler. 

<pre class="brush: csharp; title: ; notranslate" title="">// logout call on Windows/iOS
	public void Logout()
	{
		var args = new ConfirmEventArgs("Are you sure you want to logout?", "Logout?");
		OnConfirmUser(args);
		if (!args.Cancel)
		{
			DataManager.IsUserLoggingOff = true;
			OnApplyWorkflow(new StimulusEventArgs(DataObject as IWorkflowDomain, Constants.Stimuli.Logout));
		}
	}
	</pre>

I found (http://stackoverflow.com/questions/2028697/dialogs-alertdialogs-how-to-block-execution-while-dialog-is-up-net-style#10358260 ) this answer on SO, which some people say it works on Android using Java, but this did not work on Xamarin.Android. The reason was that this approach assumed that we send messages at a lower level between threads and then we throw an exception from one and then catch that exception in the other thread.
  
This did not work on Xamarin.Android, and when asked Xamarin team for help, all they did was showing me the sample code where you need to provide a callback to the messageBox, as if I have not seen it before. 

## The Solution

After a lots of fiddling around, I ended up coming up with my approach, which basically creates a thread to do the confirmation on, and WAIT for the user&#8217;s input.
  
The reason why we need the new thread is that to avoid blocking the main UI thread while we are waiting for the user input.
  
The final result was something like this:

<pre class="brush: csharp; title: ; notranslate" title="">// In the BaseController, I added this method, which checks for platform and creats a new thread on Android only 
	// (since the controllers code is shared cross-platforms)
	protected void RunConfirmAction(Action runnableAction)
	{
		if (runnableAction != null)
		{
			if (Core.Platform.IsAndroid)
			{
				var confirmThread = new Thread(() =&gt; runnableAction());
				confirmThread.Start();
			}
			else
			{
				runnableAction();
			}
		}
	}
	
	// The call to the logout method has now changed like this:
	RunConfirmAction(Logout);
	
	// the implemtation of the MessageBox waiting is like this:
	public DialogResult MessageBoxShow(string message, string caption, MessageBoxButtons buttons, MessageBoxIcon icon, MessageBoxDefaultButton defaultButton)
	{
		if (_CurrentContext != null && _CurrentContext.Screen != null && MainForm.MainActivity != null)
		{
			Action&lt;bool&gt; callback = OnConfirmCallBack;
			_IsCurrentlyInConfirmProcess = true;
			Action messageBoxDelegate = () =&gt; MessageBox.Show(((Activity)MainForm.MainActivity), callback, message, caption, buttons);
			RunOnMainUiThread(messageBoxDelegate);
			while (_IsCurrentlyInConfirmProcess)
			{
				Thread.Sleep(1000);
			}				
		}
		else
		{
			LogHandler.LogError("Trying to display a Message box with no activity in the CurrentContext. Message was: " + message);
		}
		return _ConfirmBoxResult ? DialogResult.OK : DialogResult.No;

	}

	private void OnConfirmCallBack(bool confirmResult)
	{
		_ConfirmBoxResult = confirmResult;
		_IsCurrentlyInConfirmProcess = false;
	}

	private bool _ConfirmBoxResult = false;
	private bool _IsCurrentlyInConfirmProcess = false;
	</pre>

The code for the MessageBox class can be found <a href="http://stackoverflow.com/questions/10696769/messagebox-for-android-mono/14593853#14593853" target="_blank">here</a>, I have created this long time ago and it works nicely for green-field projects where you can post callbacks to the confirmation box. 

And that is all, after all this fiddling, I got something that satisfy the requirements, and my client was very happy that they do not need to change their Controllers (which means, less bugs, less testing, quicker delivery).
  
Thus, I hope I have demo-ed good grounds for why it is sometimes necessary to have a blocking UI alertDialog on Android, and how it can be done.
  
If you have any questions, or you think this could be done nicer, better or simpler, I would love to hear from you.