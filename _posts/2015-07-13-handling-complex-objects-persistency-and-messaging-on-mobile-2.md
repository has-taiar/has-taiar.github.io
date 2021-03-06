---
id: 3401
title: Handling Complex objects Persistency and Messaging on Mobile
date: 2015-07-13T18:07:01+00:00
author: has
layout: post
guid: http://www.hasaltaiar.com.au/?p=3401
permalink: /handling-complex-objects-persistency-and-messaging-on-mobile-2/
categories:
  - .NET
  - Android
  - Azure
  - 'C#'
  - Code Quality
  - iOS
  - Uncategorized
  - Windows Phone
---
## Introduction

Data persistency and messaging is a very common task that you almost certainly need it almost all of your apps. Mobile platforms have come a long way in supporting data persistency mostly through the SQLite engine. It has become the standard on all mobile platforms. However, it is still a very light weight engine and does not give you all the capabilities like an SQL server. This should not even be the case on a mobile device where persisting data is intended to be mostly for caching till the data reaches its ultimate destination on a server somewhere. With this in mind, how do we go about persisting complex objects on the mobile platform? How do we handle complex objects messaging? And this is exactly what we will discuss in this blog post. This is not an introduction on how to use an ORM to store some objects in the database, it is rather how to do handle the complex relationships between a data object and its children or siblings when storing or messaging that piece of data. 

## SQLite.NET PCL

I have been developing for mobile platforms for quite sometime, and I have been really enjoying the use of <a href="https://github.com/oysteinkrog/SQLite.Net-PCL" target="_blank">SQLite.Net PCL</a>. This is a very simple, light-weight ORM that was built on the initial SQLite.NET with the added support for PCLs (Portable Class Library). This library has made it very easy to store data in the database on a mobile device and it gives you a unified API on all platforms to do all data persistency related tasks. So if you have not used this before, I would highly encourage you to have a look at it, and this blog post will assume the use of this framework for storing data locally. 

## Versioning

If your mobile application is intended for building a to-do list, then it might not be a trouble thing to loose one entry here or there, or to resolve conflicting items by taking the latest one, I am saying this and knowing that you might loose some users if you do that :). However, what if your mobile app was concerned emergency management, or used by health practitioners. This makes it a requirement to pre-define the logic for how items are stored, conflict is resolved, and you are required to always keep all bits of information on all devices. I had a similar requirement where I needed to maintain the versioning of all items and define how a conflict will be resolved. Thus, I decided to use versioning for my data objects. This design makes the following decisions:

  1. Any change will be applied to the data objects as a change log. 
  2. Change logs are globally and uniquely identifiable via unique IDs. 
  3. Data objects will have a VERSION attribute, which is unique. This VERSION attribute will refer to the most recent Change Log Id. 
  4. Each data object will have a list of Change Logs in an ordered list. The ordering of these logs represents the timeline of when these change logs were applied.
  5. For the sake of simplicity, we will assume that a data object has a list of properties/attributes that will be represented as table of key/value pairs. 
  6. Other deicsions/assumptions of the design will be ignored for the sake of this blog post. Such decision could include storing the type of change logs (change created by a user, result of data merge, etc), storing other security (authentication/authorisation) data on each data item, storing other meta data on each data object like who changed what and when.

With that in mind, our data object diagram should looks something like the following:<figure id="attachment_3531" style="width: 672px" class="wp-caption aligncenter">

[<img src="https://i2.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2015/07/RegisterItem-UML.jpg?resize=525%2C378" alt="UML Diagram of our basic Item (versioning) design" width="525" height="378" class="size-full wp-image-3531" data-recalc-dims="1" />](https://i2.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2015/07/RegisterItem-UML.jpg)<figcaption class="wp-caption-text">UML Diagram of our basic Item (versioning) design</figcaption></figure> 

## Enforcing Version-based Changes

Now that we have put together our basic design, we need to implement it in a way that is safe for a team of developers to work on. We cannot assume that we will ask the team members &#8220;hey, can you please use this method when you try to apply some changes, because it is necessary&#8221;, think that would work? :). I know you must be thinking now this is absurd, but I have seen this in some teams. Or if they do not say it this way, they would rely on some comments in the code or some other wiki/documentation. My approach is to make it fool-proof and to let the design document itself. I should not be required to explain this for people. Developers (my team members) should be able to use this without worrying about the internal implementation. So to do that we need the following:

#### 1. Read Only Properties 

To ensure that we are not going to change any property of our data object with out using change logs, properties need to be read-only. This makes sure that we cannot create a new version of the item without either using the applyChangeLog(log) method or using a constructor. 

#### 2. Fully defined constructor(s)

We cannot provide a constructor that would allow the consumer of our framework to create/instantiate a data object without specifying all its attributes. Therefore, our constructors should define all properties of an object at the creation time. 

#### 3. Easy composition

Our framework (data-object) need to have an easy way to construct objects from a serialised version or from another version of the item. This is very necessary for when storing these data objects to the database or when trying to message them over the network. 

With all that out of the way, our basic object implementation could look something like this:

<pre class="brush: csharp; title: ; notranslate" title="">// our change log first
  public class ChangeLog 
  {
     public string Id {get;set;}
     public int Order {get;set;}
     public string CreatedBy {get;set;}
     public ChangeLogType Type {get;set;}
     public DateTime CreatedOn {get;set;}
     public string ParentId { get; set; }
     public Dictionary&lt;string, object&gt; ChangingAttributes {get;set;}
   }

   public class RegisterItem : ModelBase
   {
     public RegisterItem (string id, string name) 
             : this(id, name, string.Empty, new Dictionary&lt;string,object&gt;(), new List&lt;ChangeLog&gt;())
     {
     }

     public RegisterItem (string id, string name, 
                          string version, Dictionary&lt;string, object&gt; attributes, List&lt;ChangeLog&gt; changeLogs)
     {
        Id = id;
        name = name;
        _version = version;
        _attributes = attributes;
        _changeLogs = changeLogs;
     }

     // This is needed for the internal use (serialisation/De-serialisation, and db storage).
     // Bcoz this ctor is Obsolete, it will through a warning and the warn will be escalated to an error if used.     
     [Obsolete(&quot;This ctor is only for the deserialiser and the db layer. Use other ctor with full params&quot;)]
     public RegisterItem ()
     {			
     }

     public string Version { get {return _version;} private set { _version = value;}  }
     private string _version {get; set;}

     public string Name { get{ return _name; } private set { _name = value;}  }
     private string _name { get; set; }

     [Ignore]
     public List&lt;ChangeLog&gt; ChangeLogs { get { return _changeLogs; } private set { _changeLogs = value;}  }
     private List&lt;ChangeLog&gt; _changeLogs { get; set; }

     [Ignore]
     public Dictionary&lt;string, object&gt; Attributes {get{return _attributes; } private set { _attributes = value;}}
     private Dictionary&lt;string, object&gt; _attributes { get; set;}
   }

</pre>

So far so good, this far we have implemented our data objects with its basic versioning its children objects. Now the question is how do we store this in the database and how to serialise/deserialise the object to send it over the network. This is actually the second tricky part 🙂 because if you have worked with SQLite.Net before you would know that it is designed to enable mobile developers to store simple objects and basic typed attributes to the database. For our scinario, we have complex objects with children objects and other complex attributes (Dictionary<string,object>). 

### Storing in the SQLite database

Our database will store basic information about the data objects (name, id, version) along with a full copy of the object that is serialised to a basic type like string (or could be a binary if you like). To make this smooth and simple to our consumers (developers who use this api), we added a property to the data object that is called **AsJson**. This property will serialise and store the full copy of the object when the object is stored to the database, and when the object is constructed from its basic attributes, it will populate the other properties (like children objects and other complex properties (ie Dictionary<string,object>). A simple implementation of this property could be something like this:

<pre class="brush: csharp; title: ; notranslate" title="">[JsonIgnore]
public string AsJson 
{
  get
  {
     var json = MySerialiser.ToJson(this);
     return json;
  } 
  set
  {
     var json = value;
     if (!string.IsNullOrEmpty(json))
     {
         var originalObject = MySerialiser.LoadFromJson&lt;RegisterItem&gt;(json);
         if (originalObject != null)
         {
            //We could use something like AutoMapper here
            _changeLogs = originalObject.ChangeLogs;
            _attributes = originalObject.Attributes;
         }
      }									
  }
}

</pre>

As you can see the property itself (AsJson) is ignored when serialising to Json because it will be a circular-dependency and it would not work. Plus, our developers would need to do anything when storing or pulling from to/from the database. Our AsJson property would do the work and get our items saved/constructed to/from the database. Also, notice how we had the [Ignore] attribute on our complex children objects. This belongs to our ORM (SQLite.Net) which will be understood as no need to store these objects to the database. 

### Messaging

A couple of months ago, I gave a talk at DDD Melbourne regarding messaging in Peer-2-Peer scenarios on mobile devices, you can find the slides deck <a href="http://www.hasaltaiar.com.au/forget-about-the-internet-and-sync-locally/" target="_blank">here</a>. And for this exact project, I needed to be able to serialise/deserialise my data object to send them over my P2P connections to the other party. This has been made much easier by the property that we discussed earlier which is called **AsJson**. The only tricky part is that when serialising, you need to modify the default settings of your Json serialiser as it needs to be able to serialise/deserialise _private_ properties of the data objects. Assuming that we use something like Newtowonsoft.Json, our serialiser will be something like this:

<pre class="brush: csharp; title: ; notranslate" title="">var resolver = new PrivateSetterContractResolver();
   var settings = new JsonSerializerSettings{ ContractResolver = resolver };
   var obj = JsonConvert.DeserializeObject&lt;T&gt;(input, settings);
</pre>

And that&#8217;s it. Hope you find this useful and you have picked few ideas on how to handle storing and messaging of complex data objects on mobile. If you have a question, comments, or maybe a suggestion to do things in a different/better way, I would love to hear from you, so get in touch.