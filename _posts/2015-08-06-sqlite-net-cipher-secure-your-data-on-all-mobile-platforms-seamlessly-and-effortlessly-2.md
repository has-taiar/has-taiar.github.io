---
id: 3641
title: 'SQLite.Net.Cipher: Secure your data on all mobile platforms seamlessly and effortlessly'
date: 2015-08-06T15:19:34+00:00
author: has
layout: post
guid: http://www.hasaltaiar.com.au/?p=3641
permalink: /sqlite-net-cipher-secure-your-data-on-all-mobile-platforms-seamlessly-and-effortlessly-2/
categories:
  - .NET
  - Android
  - Azure
  - 'C#'
  - Code Quality
  - iOS
  - Security
  - Windows Phone
tags:
  - apps
  - cipher
  - database
  - encrypt
  - mobile
  - Security
  - sqlite
---
SQLite database have become the first choice for storing data on mobile devices. SQLite databases are just files that are stored on the file system. Other apps, or processes **can** read/write data to this database file. This is true for almost all platforms, you could root/jailbreak the device and get the database file to do with it whatever you like. That&#8217;s why it is very important that you start looking into securing your data as much as possible. 

In a <a href="http://www.hasaltaiar.com.au/lets-hack-it-securing-data-on-the-mobile-the-what-why-and-how/" target="_blank">previous blog post</a>, I talked broadly about how you could secure your data on mobile apps from an architectural point of view. In this post, I will show you how you can use SQLite.Net.Cipher to encrypt/decrypt data when stored/accessed in/from your database. This library helps you secure the data and do all the work for you seamlessly. All you need to do it annotate the columns that you want to encrypt with one attribute. The library will do the rest for you. 

### The Model

<pre class="brush: csharp; title: ; notranslate" title="">public class SampleUser : IModel
	{
		public string Id { get; set; }

		public string Name { get; set; }

		[Secure] 
		public string Password { get; set; }
	}
</pre>

Notice above that we have decorated our Password property with [Secure] attribute. This will tell the SQLite.Net.Cipher to encrypt the password property whenever storing data into the database, and it will decrypt it when reading out of the database. 

The model needs to implement IModel, which enforces the contract of having a property with the name Id as a primary key. This is a common standard, and you could use other columns for PrimaryKey if you want and use backing properties to satisfy this requirement if you like. 

### The Connection

Your database connection entity needs to extend the SecureDatabase, which is provided to you by the SQLite.Net.Cipher as below:

<pre class="brush: csharp; title: ; notranslate" title="">public class MyDatabase : SecureDatabase
	{
		public MyDatabase(ISQLitePlatform platform, string dbfile) : base(platform, dbfile)
		{
		}

		protected override void CreateTables()
		{
			CreateTable&lt;SampleUser&gt;();
		}
	}
</pre>

You can use the CreateTable() method to create whatever tables you need. There is also another constructor that allows you to pass your own implementation of the ICryptoService if you like. This is the entity that is responsible for all encryption and decryption tasks. 

### See it in Action

Now to see the library in action, you could establish a connection to the database, insert some data and retrieve it:

<pre class="brush: csharp; title: ; notranslate" title="">var dbFilePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments), "mysequredb.db3");
	var platform = new SQLite.Net.Platform.XamarinIOS.SQLitePlatformIOS();
	ISecureDatabase database = new MyDatabase(platform, dbFilePath);
	var keySeed = "my very very secure key seed. You should use PCLCrypt strong random generator";

	var user = new SampleUser()
	{
		Name = "Has AlTaiar", 
		Password = "very secure password :)", 
		Id = Guid.NewGuid().ToString()
	};

	var inserted = database.SecureInsert&lt;SampleUser&gt;(user, keySeed);
		
	// you could use any desktop to inspect the database and you will find the Password column encrypted (and converted base64)

	var userFromDb = database.SecureGet&lt;SampleUser&gt;(user.Id, keySeed);

</pre>

And that&#8217;s all 🙂 Assuming that you have installed the Nuget Package.<figure id="attachment_3642" style="width: 738px" class="wp-caption aligncenter">

[<img src="https://i0.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2015/08/sqlite.png?resize=525%2C60" alt="SQLite.Net.Cipher" width="525" height="60" class="size-full wp-image-3642" data-recalc-dims="1" />](https://i0.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2015/08/sqlite.png)<figcaption class="wp-caption-text">SQLite.Net.Cipher</figcaption></figure> 

### Dependencies

Please note that this library relies on the following great projects:
  
<a href="https://github.com/oysteinkrog/SQLite.Net-PCL" target="_blank">SQLite.Net-PCL</a>
  
<a href="https://github.com/aarnott/pclcrypto" target="_blank">PCLCrypto</a>

Both of these projects are really great and they support all major platforms, including builds for PCL libraries, so I would highly encourage your to look into them if you have not seen them before. 

You could find the library on Nuget <a href="https://www.nuget.org/packages/sqlite.net.cipher" target="_blank">here</a>, and the source code is on GitHub <a href="https://github.com/has-taiar/SQLite.Net.Cipher" target="_blank">here</a>, feel free to fork, change, and do whatever you like 🙂 I hope you find the library useful and I would love to hear any comments, questions, or feedback.