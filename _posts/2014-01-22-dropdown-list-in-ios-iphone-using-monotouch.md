---
id: 851
title: Dropdown list in iOS (iPhone) using MonoTouch
date: 2014-01-22T10:23:32+00:00
author: has
layout: post
guid: http://www.hasaltaiar.com.au/?p=851
permalink: /dropdown-list-in-ios-iphone-using-monotouch/
categories:
  - .NET
  - 'C#'
  - iOS
---
When shifting from a Windows background to an iOS, you start appreciating how easy .NET had made it to add a list control or a drop down to your screen.
  
In iOS, there is no dropDownList, so you need to make your own implementation.

Luckily, I found <a href="http://thirteendaysaweek.com/2012/09/19/combobox-type-input-with-ios-and-monotouch/" target="_blank">this post</a>, where it talks about adding your own custom view for display when the user attempts to add input to a textbox. This was great news.
  
The reason is that you can alternate between keyboard (to allow manual data entry), and a list of options to use your textbox as a dropdown list.

Therefore, You would only need a textbox, and you in your code alternate the type of view that the app should display to allow the use to enter a value to your text box.
  
Once you grasp this concept the rest is easy. You need to implement a Model that will tell your view what is the list and how many are there and so on. First, let&#8217;s look at the screen that has this magic TextBox, see below:

<pre class="brush: csharp; title: ; notranslate" title="">using System;
using MonoTouch.Foundation;
using MyApp.Mobile.Business.Controller;
using MyApp.Mobile.Controls.Models;
using MonoTouch.UIKit;
using PickerModel = MyApp.Mobile.Controls.Models.PickerModel;
using System.Collections.Generic;
using System.Linq;
using MyApp.Mobile.Controls;
using MyApp.Mobile.Business.Spots;
using MyApp.Interfaces;

namespace MyApp.Mobile.Screens
{
	[Register("DropDownListScreen")]
	public partial class DropDownListScreen : UIControl
	{
		public DropDownListScreen(IntPtr handle) : base(handle)
		{
			ComboBoxDataModel = new PickerModel(new List&lt;SearchListParams&gt;());
			InitialisePickerWheel();
		}

		protected override void OnBind(IController controller)
		{
			base.OnBind(controller);
			Controller = controller as ICommonMessagesController;
			if (Controller != null)
			{
				UnhookEvents();
				HookEvents();

				ScreenTitle = StringResourceManager.GetString(Controller.GetSearchHeaderName());
				if (!string.IsNullOrEmpty(Controller.WaterMarkText))
				{
					CommonMessagesTextBox.Placeholder = Controller.WaterMarkText;
				}
				var stringController = Controller as IStringController;
				if (stringController != null)
				{
					CommonMessagesTextBox.Text = stringController.DefaultValue;
				}
				Controller.Refresh();
				_AllowEditing = Controller.AllowEditing;
				DefaultToFirstOptionInList();
				if (!_IsMessageDisplayModeSet)
				{
					SetMessageDisplayMode(Controller.MessageDisplayMode);
				}

				SetDefaultInputMethod();
			}
		}

		protected override void UnhookEvents()
		{
			base.UnhookEvents();
			if (Controller != null)
			{
				Controller.SearchListChanged -= HandleSearchListChanged;
				Controller.SearchListItemSelected -= HandleSearchListItemSelected;
				Controller.Reloaded -= HandleReloaded;
				ComboBoxDataModel.PickerChanged -= ComboBoxSelectedIndexChanged;
				ShowSelectorWheelButton.TouchUpInside -= AddImageTouched;
				CommonMessagesTextBox.ShouldReturn -= ShouldTextFieldReturn;

				if (_CommonMessagesTextBoxTextChangedObserver != null)
				{
					NSNotificationCenter.DefaultCenter.RemoveObserver(_CommonMessagesTextBoxTextChangedObserver);
					_CommonMessagesTextBoxTextChangedObserver = null;
				}
			}
		}

		protected override void HookEvents()
		{
			base.HookEvents();
			if (Controller != null)
			{
				Controller.SearchListChanged += HandleSearchListChanged;
				Controller.SearchListItemSelected += HandleSearchListItemSelected;
				Controller.Reloaded += HandleReloaded;
				ComboBoxDataModel.PickerChanged += ComboBoxSelectedIndexChanged;
				ShowSelectorWheelButton.TouchUpInside += AddImageTouched;
				CommonMessagesTextBox.ShouldReturn += ShouldTextFieldReturn;

				_CommonMessagesTextBoxTextChangedObserver = NSNotificationCenter.DefaultCenter.AddObserver
					(UITextField.TextFieldTextDidChangeNotification, (notification) =&gt;
					 {
						if (notification.Object == CommonMessagesTextBox)
						{
							Controller.TextBoxTextChanged(CommonMessagesTextBox.Text);
						}
					});
			}
		}

		protected override string ScreenTitle
		{
			get { return _ScreenTitle;  }
			set { _ScreenTitle = value; }
		}

		public override void OnScreenTouched(object sender, EventArgs e)
		{
			if (ComboBoxDataModel != null && ComboBoxDataModel.SelectedItem != null && !_AllowEditing)
			{
				CommonMessagesTextBox.Text = ComboBoxDataModel.SelectedItem.Description;
			}
			ApplyAllowEditing();
			this.EndEditing(true);
		}

		protected override void ClearButtonClick(object sender, EventArgs e)
		{
			CommonMessagesTextBox.Text = string.Empty;
			ComboBoxDataModel.SelectedItem = null;
			if (Controller != null && Controller.MessageDisplayMode != MessageDisplayMode.MultipleLinesSentenceBuilder)
			{
				if (_AllowEditing && !string.IsNullOrEmpty(Controller.WaterMarkText))
				{
					CommonMessagesTextBox.Placeholder = Controller.WaterMarkText;
				}
				else
				{
					DefaultToFirstOptionInList();
				}
			}
		}

		public void Clear()
		{
			PickerWheel.Select(-1, 0, false);
			if (ComboBoxDataModel != null)
			{
				ComboBoxDataModel.SelectedIndex = -1;
				CommonMessagesTextBox.Text = string.Empty;
			}
		}

		protected override void AlphaKeyboardButtonClick(object sender, EventArgs e)
		{
			SwitchToKeyboard(UIKeyboardType.Default);
		}

		protected override void KeyPadButtonClick(object sender, EventArgs e)
		{
			SwitchToKeyboard(UIKeyboardType.NumberPad);
		}

		protected override void CaptureValueButtonClick(object sender, EventArgs e)
		{
			HandleNextButton();
		}

		#region Implementation

		private void DefaultToFirstOptionInList()
		{
			// check for Back (previeously selectedItem)
			if (ComboBoxDataModel != null && ComboBoxDataModel.SelectedItem != null)
			{
				CommonMessagesTextBox.Text = ComboBoxDataModel.SelectedItem.Description;
				return;
			}

			if (!Controller.DefaultToFirstElementInList)
				return;

			var controller = Controller as PrecannedMessageController;
			if (controller == null || string.IsNullOrEmpty(controller.MessageGroupName) || controller.MessageGroup == null)
				return;

			var messageGroup = controller.MessageGroup.FirstOrDefault(m =&gt; m.Name == controller.MessageGroupName);
			if (messageGroup == null || messageGroup.Message == null)
				return;

			var firstItem = messageGroup.Message.FirstOrDefault(m =&gt; !string.IsNullOrEmpty(m.Code) && !string.IsNullOrEmpty(m.Value));
			if (firstItem == null)
				return;

			CommonMessagesTextBox.Text = firstItem.Value;
		}

		private void AddImageTouched (object sender, EventArgs e)
		{
			var currentText = CommonMessagesTextBox.Text;
			CommonMessagesTextBox.ResignFirstResponder();
			CommonMessagesTextBox.UserInteractionEnabled = true;

			if (string.IsNullOrEmpty(currentText))
				Clear();

			CommonMessagesTextBox.InputView = PickerWheel;
			CommonMessagesTextBox.BecomeFirstResponder();
			PickerWheel.SetNeedsDisplay();
		}

		private void HandleSearchListItemSelected(object sender, SearchItemEventArgs args)
		{
			if ((args.SearchItem != null) && !(args.SearchItem.Description.Equals(String.Empty)))
			{
				CommonMessagesTextBox.Text = args.SearchItem.Description;
			}
		}

		private void HandleSearchListChanged(object sender, SearchListEventArgs args)
		{
			if (args.SearchList.Any() && (ComboBoxDataModel.DataSource != args.SearchList))
			{
				ComboBoxDataModel.SetDataSource(args.SearchList);
				PickerWheel.ReloadAllComponents();

				if (CommonMessagesTextBox.Text == "Message" && args.SearchList.Length == 2)
				{
					HandleSearchListItemSelected(sender, new SearchItemEventArgs(new SearchListParams() {
						Description = args.SearchList[1].Description,
						Id = args.SearchList[1].Id
					}));
				}
			}
		}

		private void ComboBoxSelectedIndexChanged(object sender, PickerChangedEventArgs e)
		{
			SearchListParams selected = ComboBoxDataModel.SelectedItem;
			if ((selected != null) && !string.IsNullOrEmpty(selected.Description))
			{
				CommonMessagesTextBox.Text = selected.Description;
				if (Controller != null)
				{
					if (Controller.Filter == null)
					{
						Controller.Filter = string.Empty;
					}
					else
					{
						if (!string.IsNullOrEmpty(selected.Id))
						{
							Controller.ListItemSelected(selected.Id);
						}
					}
				}
			}
		}

		private UIPickerView PickerWheel
		{
			get
			{
				if (_PickerWheel == null)
				{
					InitialisePickerWheel();
				}
				return _PickerWheel;
			}
			set { _PickerWheel = value;}
		}

		private void HandleNextButton()
		{
			if (Controller != null)
			{
				if (!String.IsNullOrEmpty(CommonMessagesTextBox.Text) && !CommonMessagesTextBox.Text.Equals(Controller.WaterMarkText))
				{
					if (Controller.IsValid(CommonMessagesTextBox.Text))
					{
						UnhookEvents();
						Controller.Next(CommonMessagesTextBox.Text);
					}
				}
				else
				{
					Controller.OnNoInput("Please enter an input.");
				}
			}
		}

		private void ApplyAllowEditing()
		{
			CommonMessagesTextBox.InputView = _AllowEditing ? null : PickerWheel;
			CommonMessagesTextBox.UserInteractionEnabled = _AllowEditing;
			CommonMessagesTextBox.BackgroundColor = _AllowEditing ? UIColor.White : UIColor.LightGray;
			FooterButtons[1].Visible = _AllowEditing;
			FooterButtons[3].Visible = _AllowEditing;
		}

		private void SetDefaultInputMethod()
		{
			ApplyAllowEditing();
			CommonMessagesTextBox.BecomeFirstResponder();
		}

		private void InitialisePickerWheel()
		{
			_PickerWheel = new UIPickerView();
			_PickerWheel.ShowSelectionIndicator = true;
			_PickerWheel.Model = ComboBoxDataModel;
		}

		private string _ScreenTitle = "Enter Value";
		private ICommonMessagesController Controller {get;set;}
		private PickerModel ComboBoxDataModel = null;
		private UIPickerView _PickerWheel = null;
		private List&lt;HeaderFooterButton&gt; _CommonMessagesFooterButton;
		private bool _AllowEditing = true;
		private bool _IsMessageDisplayModeSet = false;
		private NSObject _CommonMessagesTextBoxTextChangedObserver = null;

		#endregion
	}
}
</pre>

Notice that we pass the Model to the screen when we instantiate it the first time, then we bind our Textbox to this Model.
  
In this screen, I have few modes:

1. AllowEditing: This will allow the user to Enter any value using the keyboard if the user chooses to do so. Users can just touch the TextBox to cause the keyboard to show up.
  
2. DisAllowEditing: This will only allow the user to select an item from the DropDownList. By default we select the first one to be in the textbox. Once the User touches the [+] button, then we show up the list.

I find this to work really nicely and Users are loving it. It was a challenge bringing our Users, testers and managers with their long lived experience with Windows and Windows Mobile to Android and iOS, but this seemed to work nicely.

Finally the Model itself can be seen below

<pre class="brush: csharp; title: ; notranslate" title="">using System;
using MonoTouch.UIKit;
using System.Collections.Generic;
using System.Linq;
using MyApp.Mobile.Business.Controller;

namespace MyApp.Mobile.Controls.Models
{
	public class PickerModel : UIPickerViewModel
	{
		public SearchListParams SelectedItem { get; set; }
		public IEnumerable&lt;SearchListParams&gt; DataSource { get { return _DataSource;} }
		private IEnumerable&lt;SearchListParams&gt; _DataSource { get; set; }
		public event EventHandler&lt;PickerChangedEventArgs&gt; PickerChanged;

		public int SelectedIndex
		{
			get
			{
				var result = -1;
				if (_DataSource != null && SelectedItem != null && _DataSource.Contains(SelectedItem))
				{
					result = Array.FindIndex(_DataSource.ToArray(), i =&gt; i.Id == SelectedItem.Id);
				}
				return result;
			}
			set
			{
				if (value == -1)
				{
					SelectedItem = null;
					return;
				}

				if (_DataSource != null && _DataSource.Count() &gt; value)
				{
					SelectedItem = _DataSource.ToArray()[value];
				}
			}
		}

		public PickerModel(IEnumerable&lt;SearchListParams&gt; sentences)
		{
			_DataSource = sentences;
		}

		public void SetDataSource(IEnumerable&lt;SearchListParams&gt; sentences)
		{
			_DataSource = sentences;
		}

		public override int GetComponentCount (UIPickerView picker)
		{
			return 1;
		}

		public override int GetRowsInComponent (UIPickerView picker, int component)
		{
			return _DataSource.Count();
		}

		public override string GetTitle (UIPickerView picker, int row, int component)
		{
			string result = string.Empty;
			if ((row &gt;= 0) && (row &lt; _DataSource.Count()))
			{
				var selectedRow = _DataSource.ToArray()[row];
				result = selectedRow.Description;
			}
			return result;
		}

		public override float GetRowHeight (UIPickerView picker, int component)
		{
			return 35f;
		}

		public void Selected (UIPickerView picker, SearchListParams item)
		{
			Selected(picker, item, 0);
		}

		public void Selected (UIPickerView picker, SearchListParams item, int component)
		{
			SelectedItem = item;
			Selected(picker, SelectedIndex, component);
		}

		public override void Selected (UIPickerView picker, int row, int component)
		{
			var arrayOfItems = _DataSource.ToArray();
			if ((row &gt;= 0) && (arrayOfItems != null) && (arrayOfItems.Length &gt; row))
			{
				SelectedItem = arrayOfItems[row];
			}

			if ((picker != null) && (picker.SelectedRowInComponent(component) != SelectedIndex))
			{
				picker.Select(SelectedIndex, component, false);
			}

			if (PickerChanged != null)
			{
				PickerChanged(this, new PickerChangedEventArgs(SelectedItem));
			}
		}
	}

	public class PickerChangedEventArgs : EventArgs
	{
		public PickerChangedEventArgs(SearchListParams selected)
		{
			SelectedValue = selected;
		}

		public SearchListParams SelectedValue { get; set; }
	}

	public class SearchListParams
	{
		public SearchListParams()
		{
		}

		public SearchListParams(string id, string description)
		{
			Id = id;
			Description = description;
		}

		public string Id { get; set;}
		public string Description { get; set; }
	}
}
</pre>

I would love to hear any comments, suggestions, or anything that I can consider for future development.