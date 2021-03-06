---
id: 501
title: Barcode scanning on MonoForAndroid
date: 2014-01-20T09:04:23+00:00
author: has
layout: post
guid: http://www.hasaltaiar.com.au/?p=501
permalink: /barcode-scanning-on-monoforandroid/
categories:
  - .NET
  - Android
  - 'C#'
---
After doing a little search around, I found that <a href=" https://github.com/Redth/ZXing.Net.Mobile/" target="_blank">ZXing.Net.Mobile</a> the best candidate.
  
I need to implement this feature on multiple platform and this scanning framework seems to address this issue well enough.
  
The library is very simple and quite well designed.

The code below shows the usage of the library.

<pre class="brush: csharp; title: ; notranslate" title="">using System;
using Android.App;
using Android.Content.PM;
using Android.OS;
using Android.Views;
using Android.Widget;
using ZXing.Mobile;

namespace SampleApp.Screens
{
	[Activity(ScreenOrientation = ScreenOrientation.Portrait)]
	public class MainScreen : Activity, IActivity
	{
		protected override void OnCreate(Bundle bundle)
		{
			base.OnCreate(bundle);

			// more code is omitted here

			_BarcodesLabel = view.FindViewById(Resource.Id.BrowserScreenBarcodesLabel);
            _ScanButton = view.FindViewById&lt;button&gt;(Resource.Id.BrowserScreenScanButton);
			_ScanButton.Click += StartHelpScanSession;
		}

		private MobileBarcodeScanner _ZxingBarcodeScanner;
        private Button _ScanLayoutFlashButton;
        private Button _ScanLayoutDoneButton;
        private View _ZxingOverlay;
		private bool IsInScanningSession = false;
        private bool MultiScanSessionsEnabledWfp = true;
        private TextView _BarcodesLabel;
		private Button _ScanButton;

        public async void StartScanSession(ScanSessionEventArgs e)
        {
            EnsureLoadingZxingOverlay(e);
            EnsureStartingZxingBarcodeScanner();
            var zxingOptions = GetZxingScanningOptions(e.ScanOptions);
            SetScannerViewText(_ZxingBarcodeScanner, e.ScanOptions);

            var result = await _ZxingBarcodeScanner.Scan(zxingOptions);
            HandleScanResult(result, e);
        }

		#region Implementation

        private void HandleScanResult(ZXing.Result result, ScanSessionEventArgs e)
        {
            if (result != null && e.OnFinishCallBack != null)
            {
                var scanResult = new ScanResult { ShouldStopScanning = false, BarcodeText = result.Text, ScanTime = result.Timestamp, BarcodeFormat = result.BarcodeFormat.ToString(), RawBytes = result.RawBytes };
                DisposeZxingScanComponents();
                e.OnFinishCallBack(scanResult);
            }
        }

        private void EnsureLoadingZxingOverlay(ScanSessionEventArgs e)
        {
            if (_ZxingOverlay == null)
            {
                _ZxingOverlay = LayoutInflater.FromContext(this).Inflate(Resource.Layout.scan_custom_layout, null);
                _ScanLayoutFlashButton = _ZxingOverlay.FindViewById&lt;/button&gt;&lt;button&gt;(Resource.Id.ScanLayoutFlashButton);
                _ScanLayoutDoneButton = _ZxingOverlay.FindViewById&lt;/button&gt;&lt;button&gt;(Resource.Id.ScanLayoutDoneButton);

                UnhookZxingLayoutButtons();
                _ScanLayoutFlashButton.Click += HandleTorchButtonOnZxingScanLayout;
                _ScanLayoutDoneButton.Click += (sender, args) =&gt; HandleDoneButtonOnZxingScanLayout(e);
            }
        }

        private MobileBarcodeScanningOptions GetZxingScanningOptions(ScanOptions options)
        {
            var scanOptions = MobileBarcodeScanningOptions.Default;
            scanOptions.AutoRotate = options.AutoRotate;
            scanOptions.InitialDelayBeforeAnalyzingFrames = 600;

            if (options.DelayBetweenAnalysingFrames.HasValue)
            {
                scanOptions.DelayBetweenAnalyzingFrames = options.DelayBetweenAnalysingFrames.Value;
            }
            return scanOptions;
        }

        private void HandleDoneButtonOnZxingScanLayout(ScanSessionEventArgs e)
        {
            var result = new ScanResult { ShouldStopScanning = true };
            if (e.OnFinishCallBack != null )
            {
                ZxingActivity.RequestCancel();
                DisposeZxingScanComponents();
                e.OnFinishCallBack(result);
            }
        }

        private void DisposeZxingScanComponents()
        {
            if (_ZxingOverlay != null)
            {
                _ZxingOverlay.Dispose();
                _ZxingOverlay = null;
            }
            if (_ScanLayoutDoneButton != null)
            {
                _ScanLayoutDoneButton.Dispose();
                _ScanLayoutDoneButton = null;
            }
            if (_ScanLayoutFlashButton != null)
            {
                _ScanLayoutFlashButton.Dispose();
                _ScanLayoutFlashButton = null;
            }

            _ZxingBarcodeScanner = null;
        }

        private void EnsureStartingZxingBarcodeScanner()
        {
            if (_ZxingBarcodeScanner == null)
            {
                _ZxingBarcodeScanner = new MobileBarcodeScanner(this)
                {
                    UseCustomOverlay = true,
                    CustomOverlay = _ZxingOverlay
                };
            }
        }

        protected override void OnStop()
        {
            base.OnStop();

            DisposeZxingScanComponents();
        }

        private void UnhookZxingLayoutButtons()
        {
            _ScanLayoutFlashButton.Click -= HandleTorchButtonOnZxingScanLayout;
            //ScanLayoutDoneButton.Click -= HandleDoneButtonOnZxingScanLayout;
        }

        private void HandleTorchButtonOnZxingScanLayout(object sender, EventArgs e)
        {
            if (_ZxingBarcodeScanner != null)
            {
                _ZxingBarcodeScanner.ToggleTorch();
            }
        }

        private void SetScannerViewText(MobileBarcodeScanner scanner, ScanOptions options)
        {
            if (scanner == null) return;

            if (!string.IsNullOrEmpty(options.TopText))
            {
                scanner.TopText = options.TopText;
            }
            if (!string.IsNullOrEmpty(options.BottomText))
            {
                scanner.BottomText = options.BottomText;
            }
        }

		#endregion

	}
}
</pre>

</button>
  
The above code shows how we can initialise the Scanner and the custom overlay on Android. It is quite straightforward and it follows the examples from provided in the sample code.
  
Notice that the handling of starting a scan session is placed inside an event. This way other screens can listen or interact with this screen (Activity) without knowing much about each other through the use of Events.

To start a scan session the following code snippet can be used.

<pre class="brush: csharp; title: ; notranslate" title="">#region Start Scan Session

private void StartHelpScanSession(object sender, EventArgs e)
{
	IsInScanningSession = true;
	OnStartScanSession(this, new ScanSessionEventArgs(new ScanOptions (), HandleScanResult));
}

private void HandleScanResult(ScanResult result)
{
	if (result != null && !result.ShouldStopScanning)
	{
		IsInScanningSession = !result.ShouldStopScanning;
		// for Demo only
		_BarcodesLabel.Text += result.BarcodeText;
		RestartScanSessionWhenInMultiScanMode();
	}
	else
	{
		// if we get a null result OR the ShouldStopScanning == true, it means that the user wants to stop scanning
		IsInScanningSession = false;
	}
}

private void RestartScanSessionWhenInMultiScanMode()
{
	if (MultiScanSessionsEnabledWfp && IsInScanningSession)
	{
		StartHelpScanSession(this, EventArgs.Empty);
	}
}

#endregion
</pre>

Notice that We are trying to simulate a Multi scan session. Zxing.Net.Mobile scan library does not support scanning multi barcode at the same time. It gives the callback after each session.
  
However, in my case I need to allow the user to scan as many barcodes as they need (maybe 100s) before finishing a start session. Therefore, to achive that, I set my IsInScanSession field on the start of handling the starting of scan session.
  
Then we keep checking for this everytime we finish a scan and if it is still true, we go back to the scan screen (activity). This will only be false if the User tabs on the &#8220;Done/Cancel&#8221; button. That way the user is telling us that he/she does not want to scan any more, then we stop the scanning session.

I hope you find this useful, feel free to copy and or use any part of this code. I would appreciate any comment on how I have done and if there&#8217;s anything that I could do better in the future