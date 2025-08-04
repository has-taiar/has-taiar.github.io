---
id: 4124
title: Cross Platform Xml File Reading/Writing
date: 2013-05-08T22:26:31+00:00
author: has
layout: post
guid: http://taytechs.com/blog/?p=25
permalink: /cross-platform-xml-file-reading-writing/
categories:
  - .NET
  - Android
  - 'C#'
  - iOS
---
Recently, I was working on a project where I needed to have a great deal of c# libraries ported to MonoDroid and MonoTouch (for Android and iOS), so that is what I have been spending my time on.

In these libraries in many places I needed to read/write files or load types from Reflection, so I ended up having a (string) extension that is called 

> CorrectPath()

. This method can be called from everywhere in my application. In this method I check for on which platform the application is running and then based on that I remove the file prefix 

> (file:\, file:, etc)

so that it fits Android and iOS file systems. I will include the code for 

> CorrectPath()

at the end of this article.

Also, I found that MonoDroid does not support including files as 

> Contents

. MonoDroid encourages the usage of Resources or Assets. Therefore, and for that reason, reading files on Android and on other platforms became different. So in order to avoid that. I created an entity called FileHelper, this has a method called ReadAllText() and can be called from everywhere in the application. The implementation of this ReadAllText() method is different on Android since it needs to read the files as `EmbededResources`. However the same code could be used on iOS and Windows Mobile. The code below. I have also posted about this on StackOverflow, please see it <a title="Reading XML in a unified way on different platforms" href="http://stackoverflow.com/questions/15942871/cross-platform-reading-of-xml-files" target="_blank">here</a>

Parts of the code is below. Please feel free to leave me a comment if I missed anything or if you have any idea/suggestion

**Windows Mobile and iOS**

<pre class="brush: csharp; title: ; notranslate" title="">public class FileHelper
{
     public static string ReadAllText(string filePath)
     {
          var path = filePath.GetFullPath();
          if (!File.Exists(path))
          {
               Logging.LogHandler.LogError("File " + path + " does not exists");
               return string.Empty;
          }
          using (var reader = new StreamReader(filePath))
          {
               return reader.ReadToEnd();
          }
     }
}
</pre>

**Android version**

<pre class="brush: csharp; title: ; notranslate" title="">public class FileHelper : BaseFileHelper
{
     public static string ReadAllText(string filePath)
     {
          var entryAssemblyPath = Path.Combine(Path.GetDirectoryName(Assembly.GetExecutingAssembly().GetName().CodeBase).Replace("file:", ""), "MyExecutableAssemblyName.dll");
          // This is because Assembly.GetEntryAssembly() returns null on Android... Booohhh
          var assembly = Assembly.LoadFrom(entryAssemblyPath);
          using (var stream = assembly.GetManifestResourceStream(filePath.GetFullPath()))
          {
               using (var reader = new StreamReader(stream))
               {
                    return reader.ReadToEnd();
               }
          }
     }
}
</pre>

I had a shared code for Constants and an extention method for paths as below

**Constants.cs**

<pre class="brush: csharp; title: ; notranslate" title="">public static Class Constants
{
     private static string _RootPath;
     private static string _iOSRootPath;
     private static string _AndroidResourcePath;
     
     public static string RootPath
     {
          get
          {
               if (string.IsNullOrEmpty(_RootPath))
               {
                    _RootPath = Path.GetDirectoryName(Assembly.GetExecutingAssembly().GetName().CodeBase).Replace(FileURIPrefix, "") + "\My Documents\Business";
               }
               return _RootPath;
          }
     }

     public static string iOSRootPath
     {
          get
          {
               if (!string.IsNullOrEmpty(_iOSRootPath))
               {
                    _iOSRootPath = Path.Combine(Path.GetDirectoryName(Assembly.GetExecutingAssembly().GetName().CodeBase).Replace(FileURIPrefix, "").Replace("file:", ""), Path.Combine("My_Documents", "Business"));
               }
               return _iOSRootPath;
          }
     }

     public static string AndroidResourcePath
     {
          get
          {
               if (string.IsNullOrEmpty(_AndroidResourcePath))
               {
                    _AndroidResourcePath = "MyAppMainDllName.MyFolderName.";
               }
               return _AndroidResourcePath;
          }
     }
}
</pre>

**PathExtentions.cs**

<pre class="brush: csharp; title: ; notranslate" title="">public static class PathExtensions
{
     public static string GetFullPath(this string filePath)
     {
          if (Platform.IsAndroid) // platform is a class that I have to tell me which platfrom I am at 🙂
          {
               return Constants.AndroidResourcePath + filePath;
          }
          if (Platform.IsIOS)
          {
               return Path.Combine(Constants.iOSRootPath, filePath);
          }
          return Path.Combine(Constants.RootPath, filePath);
     }
}
</pre>

After setting this up, I am using my `FileHelper` just as easy as below

> string configuratinContents = FileHelper.ReadAllText(configruationPath);

To whoever using this code, remember to set the build action to 

> EmbededResources

on Android, and to 

> Content 

on iOS and Windows Mobile.
  
The Advantage of this is that my code does not need to know about which platform it is running or how to load a file. That is dealt with in the 

> FileHelper 

the rest of the libraries can focus on the business logic
  
Enjoy..