---
id: 2431
title: Managing Certificates in Azure, How Bad can it be?
date: 2014-11-05T09:30:13+00:00
author: has
layout: post
guid: http://www.hasaltaiar.com.au/?p=2431
permalink: /managing-certificates-in-azure-how-bad-can-it-be-2/
categories:
  - .NET
  - Azure
  - 'C#'
  - Cloud
---
Azure and I have been friends for quite some time now, and I love the power that Azure gives me. He enables me to spin up a whole enterprise-like infrastructure in seconds. However, when it comes to managing certificates, Azure disappoints me. In a recent project that I have worked on, I got frustrated with some of Azure gotchas when it comes to managing security keys. In this blog post, I will share my experience on these issues. 

## Supported File

When uploading a certificate to Azure, you see the window as in the screenshot below. It says you can only upload files (certificates) of types **.cer** and **.pfx**. 

Azure validates the file extensions _literally_ and with _case-sensitivity_. I got a certificate from the security team to upload to our staging env. and I was surprised that the uploading failed twice. When changing the file extension from (**.CER** to **.cer**), it worked properly. One would expect a better sort of validations from the Azure team. <figure id="attachment_2441" style="width: 595px" class="wp-caption aligncenter">

[<img src="https://i2.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2014/11/Azure-Certificates-Upload-error-1.png?resize=525%2C385" alt="Azure Certificates Upload error 1" width="525" height="385" class="size-full wp-image-2441" data-recalc-dims="1" />](https://i2.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2014/11/Azure-Certificates-Upload-error-1.png)<figcaption class="wp-caption-text">Azure Certificates Upload gives an error when the case (upper-case/lower) of the file extension does not match.</figcaption></figure> 

To make things more interesting, when I needed to upload a certificate of type **.p12** (Personal Information Exchange), Azure did not accept it -as expected-. So what I did was trying to change the file extension and re-upload, and interestingly enough it worked fine. I had to change the name to be **.pfx** (instead of **.p12**), so that it would allow me to add the passphrase for importing this private key. 

## Viewing Uploaded Certificates:

It was Friday afternoon and I was tasked to deploy the latest code into the staging env. I can see the look on your face (duh?), why not have an automated deployment with a CI server. And Yes I totally agree, except that this client did not have a CI server nor did they want it setup. They actually agreed that we setup a CI and automated deployment in the last week of the project since it was a requirement from the DevOps/Support team :). Anyway, I deployed the package fine to the Azure Cloud Service, yet Azure kept failing to start the service. It was throwing a _null reference exception_ when calling _StartUp()_ method of the worker role. Both environments Test and Staging were created by the same engineer and he said that he followed the same doco, yet our app was only working on Test env. but not on the staging. When comparing all aspects of the env, they seemed identical. Looking at the certificates, they seemed identical too, and that is the catch. After some debugging, I found that that the staging env did not have the **private key** (which our app uses to encrypt/decrypt certain data) alongside of the cert (public key). It appeared that the staging env. only had the public key. However, because _Azure does not show any indicator of the private key existence_ it was hard to trace. One would expect something like the Keychain Access that Apple has on Mac where it lists the public and the private key (see screenshot). Of course you cannot access/view the private key contents, but at least it tell you that the private key does exist. <figure id="attachment_2451" style="width: 788px" class="wp-caption aligncenter">

[<img src="https://i2.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2014/11/Azure-Certificates-list.png?resize=525%2C281" alt="Certificates list in Azure Cloud Service" width="525" height="281" class="size-full wp-image-2451" data-recalc-dims="1" />](https://i2.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2014/11/Azure-Certificates-list.png)<figcaption class="wp-caption-text">Certificates list in Azure Cloud Service</figcaption></figure> <figure id="attachment_2461" style="width: 977px" class="wp-caption aligncenter">[<img src="https://i0.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2014/11/Apple-keyChain-Assistant-certificate-list.png?resize=525%2C286" alt="Apple keyChain Assistant certificate list" width="525" height="286" class="size-full wp-image-2461" data-recalc-dims="1" />](https://i0.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2014/11/Apple-keyChain-Assistant-certificate-list.png)<figcaption class="wp-caption-text">Apple keyChain Assistant certificate list</figcaption></figure> 

## Management Certificates

When interacting with Azure, we are basically interacting with the Management API. This goes true for most tasks of service/storage management in Azure. For doing that, Azure adds a management certificate when the user logs-in the first time to establish this connection. This only applies for connections from outside the portal (using IDE, Storage management tools, etc). These certificates can be found under **Settings** in your portal. The problem is, Azure keeps on creating these certificates when you do something from a machine and _does not keep any indicator on which machine/session/user that certificate belongs to_. The issue we had was when we were trying to get the sign-off of the security team, they told us what are all these certificates? To whom do they belong? As always, people come and go, and some developers and testers left the team, so the security guys were concerned that these people might still have access since these certificates still exist. Plus, because Azure does not keep any details with these certificates, it is very hard to trace them down. We had to start playing some guess game and start eliminating them based on the creation date/time and comparing it with the date people joined the team. 

## Fine-grained Access Control

Azure allows us to create/add users/admins to a subscription. Once a user is &#8220;admin&#8221; in a subscription, they can do whatever the real admin (the one who created the account) could do. This works alright for small teams. However when you have multiple services in your subscription and you have teams from different discipline this could be tricky. I can understand that you could create multiple subscriptions to control and separate your operations. However, there could be multiple people who need to work on the same project/subscription, but not necessarily all of them need to be admin. Take the network guy for instance. He was helping us in setting up the VPN tunnel between Azure and the on-primes cloud, but he could (inadvertently) change settings of the cloud services and/or their security configuration. This could be dangerous and should not be allowed in the first place. So far, I do not really have a solution for it except trying to manage the account better and would hope that the Azure team would address this in future iterations 

So, after all this rambling, I hope this post helps somebody else who might face these little gotchas and if you found some other interesting ones or you have a better solution to what I have listed, I would love to hear from you.