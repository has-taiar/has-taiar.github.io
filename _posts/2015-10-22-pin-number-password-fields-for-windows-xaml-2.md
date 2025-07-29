---
id: 3761
title: PIN Number Password Fields for Windows Xaml
date: 2015-10-22T11:48:45+00:00
author: has
layout: post
guid: http://www.hasaltaiar.com.au/?p=3761
permalink: /pin-number-password-fields-for-windows-xaml-2/
categories:
  - .NET
  - 'C#'
  - Windows Phone
tags:
  - password
  - textbox
  - ui
  - WindowsPhone
  - xaml
---
In Windows Xaml world, a bad design decision was made to have the passwordBox and the TextBox different, meaning that the PasswordBox does not inherit common properties from the TextBox. As a consequence, you cannot do many of the things that you normally do with a textbox like customising the appearance of the password textbox (say you want to make the text centre-aligned, or you want to bind the number key pad instead of the alpha keyboard). I had this exact requirement 2 weeks ago and I had to solve it, so this blog talks about the approach I took to make this happen. 

Basically all I needed to do was to switch from using password boxes to normal textbox and then wire the key up event in the background to hide the entered password. You need to be careful though when handling these events, because you could end up making your text fields unusable. In my scenario, I needed the textbox to act like a PIN number (Password) field, so I only accepted numbers as you can see in the code below. Here is the code snippet: 

<pre class="brush: xml; title: ; notranslate" title="">&lt;TextBox x:Name="PinNumberTextBox" HorizontalAlignment="Center" 
Margin="0,200,0,0" VerticalAlignment="Top" MinWidth="300" 
PlaceholderText="Enter 4-8 digits PIN no" 
InputScope="Number" KeyUp="PinNumberTextBox_KeyUp" 
TextAlignment="Center" /&gt;
</pre>

As you can see above, I am using a TextBox in the Xaml for the PIN number and using normal TextAlignment to centre the text and InputScope for binding the Number Key pad instead of the default alpha keyboard. Also, notice that I am wiring the KeyUp event. Here is the code of the keyUp event. 

<pre class="brush: csharp; title: ; notranslate" title="">     string _enteredPin = ""; 
     string _confirmPin = ""; 
     string _passwordChar = "*"; 

     private void PasswordTextBox_KeyUp(object sender, KeyRoutedEventArgs e, TextBox field, ref string pinCode) 
     {     
         //modify new passcode according to entered key     
         pinCode = GetNewPasscode(ref pinCode, e);              
         //replace text by *     
         field.Text = Regex.Replace(pinCode, @".", _passwordChar);      
         //take cursor to end of string     
         field.SelectionStart = field.Text.Length;     
         
         // stop the event from propagating further 
         e.Handled = true;
     } 

      private string GetNewPasscode(ref string oldPasscode, KeyRoutedEventArgs keyEventArgs) 
    {     
        string newPasscode = string.Empty;     
        switch (keyEventArgs.Key)     
        {         
            case VirtualKey.Number0:
            case VirtualKey.Number1:         
            case VirtualKey.Number2:         
            case VirtualKey.Number3:                     
            case VirtualKey.Number4:         
            case VirtualKey.Number5:         
            case VirtualKey.Number6:         
            case VirtualKey.Number7:         
            case VirtualKey.Number8:         
            case VirtualKey.Number9:              
                var numKey = keyEventArgs.Key.ToString();             
                var number = numKey.Substring(numKey.Length - 1, 1);             
                newPasscode = oldPasscode + number;              
                break;         

            case VirtualKey.Back:             
                if (oldPasscode.Length &gt; 0)                 
                    newPasscode = oldPasscode.Substring(0, oldPasscode.Length - 1);             
                break; 
        
            default:             
                //others             
                newPasscode = oldPasscode;             
                break;     
          }
     
          return newPasscode; 
     }

</pre>

Because I had two Textboxes (PinNumberTextBox and ConfirmPinNumberTextBox), I have the handling of the event in a method called GetNewPasscode() and that takes the relevant text box and updates the pinNumber (entered value). 

As you can see, it is fairly simple, we listen to keys when the user types something, then we only accept numbers (this could be changed based on your requirements) and update the enteredPin that we hold in an instance property. We then use RegEx to mask the display of the PIN on the screen. Also, notice how we listen to back key press to clear the last char. 

Hope this helps someone, and please do get in touch if you have any comments or questions.  