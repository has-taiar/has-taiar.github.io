---
id: 791
title: Capturing Signatures on iphones (iOS) using MonoTouch
date: 2014-01-22T10:03:23+00:00
author: has
layout: post
guid: http://www.hasaltaiar.com.au/?p=791
permalink: /capturing-signatures-on-iphones-ios-using-monotouch/
categories:
  - .NET
  - 'C#'
  - iOS
---
In the <a href="http://www.hasaltaiar.com.au/capturing-signatures-on-android-devices-monoforandroid/" target="_blank">previous post</a>, I demonstrated how to capture a signature on Android devices.
  
In this post, we will look at how to do the same thing on iOS devices (iPhones, iPads, etc).

Basically, the idea is very simple, we create a custom view and we listen to touches on that view. This includes TouchBegins(), TouchMoved(), and TouchEnds().
  
Then with each touch we update our list of points. In <a href="http://www.hasaltaiar.com.au/capturing-a-signature-as-a-string-of-points-on-the-mobile-and-redrawing-it-on-the-server/" target="_blank">another previous post</a> I showed how to stringify a two dim array of points to a string. Then use this to reconstruct the signature on the server side.
  
However, we could also capture the signature as an image on the mobile device and take that to the server if you wish to get an image directly instead of the list of points.

The code below shows the SignatureView.

<pre class="brush: csharp; title: ; notranslate" title="">using MonoTouch.CoreGraphics;
using MonoTouch.UIKit;
using System.Drawing;
using System;
using MyApp.Interfaces;
using MonoTouch.Foundation;
using MyApp.Core.Signature;
using MyApp.Core.Drawing;
using MyApp.Interfaces.Drawing;
using MyApp.Interfaces.Screens.Controls;
using System.Linq;
using System.Collections.Concurrent;

namespace MyApp.Controls
{
	public class SignatureView : UIControl, ISignatureView
	{
		public SignatureView (RectangleF frame) : base(frame)
		{
			base.Frame = frame;
			ViewFrame = new MyFrame {
				X = (int)frame.X,
				Y = (int)frame.Y,
				Width = frame.Width,
				Height = frame.Height
			};
			_DrawPath = new CGPath();
			SetupAppearance();
			_ScalingFactor = new MyFrame { Width = 1, Height = 1 };
			DrawWatermarks();
		}

		public void Initialise(int penWidth, WatermarkSettings watermarks, string backgroundImageFileName)
		{
			PenWidth = penWidth;
			Watermarks = watermarks;
			BackgroundImageFileName = backgroundImageFileName;

			var dimensions = new MyFrame
			{
				Width = Frame.Width,
				Height = Frame.Height
			};

			_SignatureData = new SignatureData(dimensions, _ScalingFactor, watermarks);
		}

		public void Clear ()
		{
			_DrawPath.Dispose();
			_DrawPath = new CGPath();
			_FingerDraw = false;
			_TouchLocation = new PointF(0, 0);
			_PrevTouchLocation = new PointF(0, 0);
			SetNeedsDisplay();
			_SignatureData.Clear();
			DrawWatermarks();
			_TouchsQueue = new ConcurrentQueue&lt;TouchsQueue&gt;();
		}

		public override void TouchesBegan(NSSet touches, UIEvent evt)
		{
			base.TouchesBegan (touches, evt);

			UITouch touch = touches.AnyObject as UITouch;
			this._FingerDraw = true;
			this._TouchLocation = touch.LocationInView (this);
			this._PrevTouchLocation = touch.PreviousLocationInView (this);
			_SignatureData.AddPoint(SignatureState.Start, (int)this._TouchLocation.X, (int)this._TouchLocation.Y);
		}

		public override void TouchesEnded(NSSet touches, UIEvent e)
		{
			base.TouchesEnded(touches, e);
			if (this._FingerDraw)
			{
				UITouch touch = touches.AnyObject as UITouch;
				_TouchLocation = touch.LocationInView(this);
				_PrevTouchLocation = touch.PreviousLocationInView(this);
				_FingerDraw = false;
				_TouchsQueue.Enqueue(new TouchsQueue {TouchLocation = _TouchLocation, PrevTouchLocation = _PrevTouchLocation });
				_SignatureData.AddPoint(SignatureState.End, (int)this._TouchLocation.X, (int)this._TouchLocation.Y);
				this.SetNeedsDisplay ();
			}
		}

		public override void TouchesMoved (NSSet touches, UIEvent evt)
		{
			base.TouchesMoved (touches, evt);

			UITouch touch = touches.AnyObject as UITouch;
			_TouchLocation = touch.LocationInView(this);
			_PrevTouchLocation = touch.PreviousLocationInView(this);
			_TouchsQueue.Enqueue(new TouchsQueue {TouchLocation = _TouchLocation, PrevTouchLocation = _PrevTouchLocation });
			_SignatureData.AddPoint(SignatureState.Move, (int)this._TouchLocation.X, (int)this._TouchLocation.Y);
			SetNeedsDisplay();
		}

		public override void Draw (RectangleF rect)
		{
			base.Draw (rect);
			if (_DrawPath != null)
			{
				using (CGContext context = UIGraphics.GetCurrentContext())
				{
					if (context != null)
					{
						DrawBackgroundImage(context);
						DrawSignatureLines(context);
					}
				}
			}
		}

		private void DrawSignatureLines(CGContext context)
		{
			TouchsQueue queueElement = null;
			while(_TouchsQueue.TryDequeue(out queueElement))
			{
				if (queueElement != null)
				{
					context.SetStrokeColor(UIColor.Black.CGColor);
					context.SetLineWidth(PenWidth);
					context.SetLineJoin(CGLineJoin.Round);
					context.SetLineCap(CGLineCap.Round);
					_DrawPath.MoveToPoint(queueElement.PrevTouchLocation);
					_DrawPath.AddLineToPoint(queueElement.TouchLocation);
					context.AddPath(_DrawPath);
					context.DrawPath(CGPathDrawingMode.Stroke);
				}
			}
		}

		public string GetSignatureData()
		{
			var result = string.Empty;
			if (_SignatureData != null)
			{
				try
				{
					result = _SignatureData.ExtractAsString();
				}
				catch (Exception exception)
				{
					OnFailedWithException(exception);
				}
			}
			return result;
		}

		#region Implementation

		private PointF _TouchLocation;
		private PointF _PrevTouchLocation;
		private CGPath _DrawPath;
		private bool _FingerDraw;
		private ConcurrentQueue&lt;TouchsQueue&gt; _TouchsQueue = new ConcurrentQueue&lt;TouchsQueue&gt;();
		private IMyFrame _ScalingFactor;
		private SignatureData _SignatureData { get; set; }
		private UIImage _BackgroundImage;

		public SignatureData SignatureData { get { return _SignatureData; } }
		public event SignatureFailedWithExceptionHandler SignatureFailedWithException;
		public string BackgroundImageFileName { get; set; }
		public int PenWidth { get; set; }
		public IMyFrame BackgroundImageFrame { get; set; }
		public WatermarkSettings Watermarks {get;set;}
		public IMyFrame ViewFrame { get; set; }

		private void OnFailedWithException(Exception exception)
		{
			if (SignatureFailedWithException != null)
			{
				SignatureFailedWithException(exception);
			}
		}

		private void SetupAppearance ()
		{
			BackgroundColor = UIColor.White;
			Layer.BorderWidth = 5f;
			Layer.BorderColor = UIColor.Orange;
		}

		#endregion
	}

	public class TouchsQueue
	{
		public PointF TouchLocation {get;set;}
		public PointF PrevTouchLocation { get; set; }
	}
}
</pre>

The main thing to notice is that after the end of each touch event, we invalidate the view to cause the app to call Draw() method. Then in the Draw() method we use our two dimensional list of points and draw the signature.
  
You could notice that I am drawing Watermarks as well, but that is another topic by itself that I would try to blog about another time.

The other thing is that we have a TouchQueue. This is used because iOS sometimes defensively skip some requests to invalidate (redraw) the view if there are multiple touches in a short time-frame. This will cause the signature line to be segmented with gaps in between.

If you prefer to get an image directly instead of collecting the images and passing them to the server, you could do so easily using the Graphics context of the view as below:

<pre class="brush: csharp; title: ; notranslate" title="">public UIImage GetDrawingImage ()
{
	UIImage returnImg = null;
	UIGraphics.BeginImageContext (this.Bounds.Size);

	using (CGContext context = UIGraphics.GetCurrentContext()) {
		context.SetStrokeColor (UIColor.Black.CGColor);
		context.SetLineWidth (5f);
		context.SetLineJoin (CGLineJoin.Round);
		context.SetLineCap (CGLineCap.Round);
		context.AddPath (this._DrawPath);
		context.DrawPath (CGPathDrawingMode.Stroke);
		returnImg = UIGraphics.GetImageFromCurrentImageContext ();
	}

	UIGraphics.EndImageContext ();
	return returnImg;
}
</pre>

Again, I hope you find this useful, and please do let me know if you have any questions or comments.