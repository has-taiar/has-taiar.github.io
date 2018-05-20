---
id: 1561
title: Getting started with Service Bus (Azure and Windows Server) with Samples
date: 2014-04-16T22:38:46+00:00
author: has
layout: post
guid: http://www.hasaltaiar.com.au/?p=1561
permalink: /getting-started-with-service-bus-azure-and-windows-server-with-samples-2/
categories:
  - Uncategorized
tags:
  - featured
---
Getting Started with Service Bus

&#8211; Getting started with Service Bus for Windows Server
  
&#8211; Getting started with Azure Service Bus
  
&#8211; Sample code for sending and receiving messages over Service Bus (both Azure and local)
  
&#8211; Service Bus Consideration (What you need to know before you start using Service Bus)

Recently, I was tasked to look into an alternative for our aging MSMQ infrastructure. We use MSMQ to asynchronously deliver
  
events (and messages) across different components of the app. MSMQ works well for high volume data messaging. However, we have had
  
some complains from the Production Support team where few messages ended up in the dead lettering queue and they had to look after them out of the process.
  
Also, with our plans to migrate into the cloud, MSMQ is not supported (at least not at the time of writing this post) on Azure. You could create a VM on Azure and then install MSMQ
  
there, but that is still not the ultimate goal of migrating to Azure. 

Therefore, I started investigating Service Bus, and in the [next post](#) I will blog about the result of my investigation of the effort and consideration to migrate from MSMQ to Service Bus. 

## Windows Server Server Bus vs Azure Service Bus

What most people are familiar with is **Azure** Service Bus, and they are reluctant to try it because they think that you need an Azure account and so on.
  
However, there is a package for Windows Server which can be installed on local servers and it can be used just like Azure Service Bus.
  
The advantages of using Windows Server Service Bus over Azure Service Bus are:

1. Symmetric API to that of Azure Service Bus
  
2. Great for Development as you only need a local machine to start (you could even install it on the Developer machine)
  
3. Brings cloud benefits (load balancing, redundency, etc) to your on-premise servers.
  
4. It has Azure Service Bus features (guaranteed message delivery, messages order, dead message lettering, etc)

To install and configure Service Bus for Windows Server, you could follow the blog on the MSDN blog here (http://msdn.microsoft.com/en-US/library/jj193021(v=azure.10).aspx ).
  
When the Service Bus package is installed, you would need to start the configuration as shown in the MSDN Blog.
  
The Service Bus configuration tool will ask you to start a web farm or join on (if you have any). Once that is done, you are ready to roll. 

The sample code for sending and receiving messages using Service Bus could be found on GitHub (https://github.com/has-taiar/ServiceBusSample), basically you have two solutions (Sender and Receiver). Currently, the sender and the receiver only send/receive a basic message,
  
but you could update that to be any serialised object. 

The sender has:

<pre class="brush: csharp; title: ; notranslate" title="">var messageFactory = MessagingFactory.CreateFromConnectionString(connectionStringBuilder.ToString());
	var namespaceManager = NamespaceManager.CreateFromConnectionString(connectionStringBuilder.ToString());

	if (namespaceManager.QueueExists(QueueName))
	{
		namespaceManager.DeleteQueue(QueueName);
	}
	namespaceManager.CreateQueue(QueueName);
	QueueClient queueClient = messageFactory.CreateQueueClient(QueueName);
	</pre>

As it can be seen, we create a messageFactory and a nameSpaceManager, these would be used to check the existence of the NameSpace and the existence of the Queue. If the queue does not exist, then we would recreate it.
  
Be aware that your NameSpaces have to be unique (whether on Azure or on your local Servers). A namespace just what its name implies, a name space to group and logically separate queues.
  
Once we have the Queue, then we create a queueClient to send and receive messages like below. 

<pre class="brush: csharp; title: ; notranslate" title="">var sendMessage = new BrokeredMessage(payLoad);
	queueClient.Send(sendMessage);  
	</pre>

Now, the beauty is, once you have finished developing your app, you could host it locally on your Windows Server infrastructure on-premise, or you could deploy to Azure Service Bus.
  
Because the api is symmetric (Windows Server Service Bus vs Azure Service Bus), you could just replace the Nuget Package as in the picture below, and the connection string, and that is it, you could then just deploy your app to Azure.
  
This is a tremendous advantage of using Windows Server Service Bus, especially in our case we still need to pass through lots of approval and compliance stuff before we are ready to go to Azure cloud, so this enables us to be Azure ready
  
while we are developing and working on-premise. 

The source code for the Sender and Receiver is on GitHub (can be found here), feel free to add/update/use as you need.
  
If you have any questions, suggestion, or recommendation, I would love to hear from you.