---
id: 1631
title: Getting Tooltip Element in UI Automation Tests using TestStack (White) framework
date: 2014-05-01T11:01:39+00:00
author: has
layout: post
guid: http://www.hasaltaiar.com.au/?p=1631
permalink: /getting-tooltip-element-in-ui-automation-tests-using-teststack-white-framework-2/
categories:
  - .NET
  - 'C#'
  - Code Quality
  - Testing
tags:
  - featured
---
We use TestStack (White) UI Automation framework for our UI Automation tests, we have few tests that requires getting the error message from the tooltip to validate what is being displayed to the user. These tests were running fine but failing on the Build Server

## The Problem

When trying to get the ToolTip using TestStack (White) framework <a href="http://docs.teststack.net/White/Windows.html" target="_blank">documented way</a>, we get null. Increasing the timeout setting (as documented <a href="http://docs.teststack.net/White/Advanced%20Topics/Waiting.html" target="_blank">here</a>) did not help. 

## The Solution

Adding retrial mechanisms, and few other attempts did not work. After doing some reading about Windows Forms and Tooltips, I found that Windows says a tooltip will only shown when the user hover over a UI Element **and pause** and that is what was missing. 

I started looking at the source code of TestStack (White) and how it tries to get the tooltip text, and apparently it was only trying to get the mouse over the ui element, then get the tooltip directly after moving the tooltip, **without any wait**, and this was the problem.
  
The other thing that I found was, the source code moves the mouse over the UI element and reads the tooltip. This might work if the course (mouse pointer) was somewhere else, but if the pointer was already over the UI ELement, then it would not work. You would need to move the mouse away and move it back on top of the UI Element. This was another issue that we had with our retrial mechanism. 

In the end, I ended up creating a custom UI element and overriding the ErrorProviderMessage() method as below. 

<pre class="brush: csharp; title: ; notranslate" title="">[ControlTypeMapping(CustomUIItemType.Text)]
    public class MyAutomationLabel : CustomUIItem
    {
        public MyAutomationLabel(AutomationElement automationElement, ActionListener actionListener) : base(automationElement, actionListener)
        {
        }

        protected MyAutomationLabel()
        { 
        }

        public override string ErrorProviderMessage(Window window)
        {

            // 1. Hover away from the label
            window.Mouse.Location = new Point(this.Location.X -20, this.Location.Y - 20);

            // 2. move the mouse on top of the label
            window.Mouse.Location = new Point(this.Bounds.Right + 10, this.Bounds.Top + 10);
            this.actionListener.ActionPerformed(White.Core.UIItems.Actions.Action.WindowMessage);

            // 3. Wait for tooltip to show up
            Thread.Sleep(300);

            return window.ToolTip.Text;
        }
    }
</pre>

Then you could use this when you poll the form for a label (with an ErrorProvider/tooltip) and that should work 🙂

Hope you find this useful, would love to hear from you if you have any questions or concerns.