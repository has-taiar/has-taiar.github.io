---
id: 1721
title: How to install Magento on Azure websites
date: 2014-05-22T08:22:44+00:00
author: has
layout: post
guid: http://www.hasaltaiar.com.au/?p=1721
permalink: /how-to-install-magento-on-azure-websites-2/
categories:
  - .NET
  - Azure
  - Cloud
  - Code Quality
tags:
  - featured
---
This blog explains in a step-by-step how to install (fresh install or migrate) a Megento package into Azure websites

## Background

**1. What is Magento?** 
  
Magento is the eCommerce software and platform trusted by the world’s leading brands. Grow your online business with Magento!
  
More details could be found <a href="http://magento.com/" target="_blank">here on Magento </a>
  


**2. Why install Magento on Azure** 
  
There is a long list of reasons of why would somebody wants to migrate to the cloud, but few of these reasons could be 1) Cost saving 2)Load Balance 3) Scalability 4) Less manintenance. And many other reasons. 

## The Problem

Why do we need to install Magento on **Azure Websites**
  
The current Gallery of applications on Azure websites has a limit number of apps that could be installed out-of-the-box.
  
This means that a  <a href="http://azure.microsoft.com/en-us/community/open-source-software/" target="_blank">long list of apps</a> cannot be installed directly from the  <a href="http://cloudinteropelements.cloudapp.net/Windows-Azure-web-sites-gallery.aspx" target="_blank">Azure App Gallery</a>.
  
To get around this, the current solution is to install these apps on their own VMs. A VM for Magento is posted by the Microsoft Open Technology team could be  <a href="http://vmdepot.msopentech.com/List/Index?sort=Featured&#038;search=magento" target="_blank">found here</a>.
  

  
However, having a dedicated VM means that you would need to consider the maintenance that comes with it, and you need to consider the security of the VM, and many other factors that makes VMs cost more to maintain than Azure websites.
  
So, what should we do, how can we install Magento on Azure Websites?

## The Solution

You could do the installation manually. Azure websites have PHP 5.4, Python, Java and other languages setup and enabled for you by default. See image below<figure id="attachment_1771" style="width: 817px" class="wp-caption aligncenter">

[<img src="https://i0.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2014/05/Azure-websites-languages-enabled-by-default.png?resize=525%2C355" alt="Azure-websites-languages-enabled-by-default" width="525" height="355" class="size-full wp-image-1771" data-recalc-dims="1" />](https://i0.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2014/05/Azure-websites-languages-enabled-by-default.png)<figcaption class="wp-caption-text">Azure-websites-languages-enabled-by-default</figcaption></figure> 

This means that you could install most of the Open Source software packages and they should work fine. One thing that you need to consider is whether the package or the framework was designed to work in a cloud environment or not.
  
For instance, if a framework relies heavily on the Linux file system and stores files for sessions and stuff, this app might not work properly in a cloud based env.
  
The good news is that Magento and most other open source apps are designed to work in the cloud. So to install an open source package (Magento), you could follow the steps below:

1. Create an Azure Website
  
There are many tutorials and blogs that talks about creating a website on Azure, so I will not go to the details but I would assume that you have a subscription and you have an Azure website created. 

2. Check the (Open Source package) Magento requirements on Azure websites
  
Each framework or tool has certain dependencies, and so does Magento. Magento has a small PHP page that checks the specs of your server and reports back on whether your server is Magento-capable or not.
  
This page could be found on the Magento installation guide <a href="http://www.magentocommerce.com/wiki/1_-_installation_and_configuration/magento_installation_guide" target="_blank">here</a>. Download this page, then install it on your Azure website root directory and navigate to the webpage like (magentoTest.azurewebsites.net/test.php) assuming that you named your php page as test.php.
  
This web page should report back that all packages are there, except MySQL server, because it expects the database on the same server. If you need to add extensions or libraries for other Open Source packages, you could do that, see this page. 

3. Download and Unzip Magento package files
  
Magento supports downloading the files directly to Azure Websites via the downloader (see the installation guide), but for this tutorial, we are going to download the package (you could get the download from <a href="http://www.magentocommerce.com/download" target="_blank">here</a>), unzip it locally, then upload the files to the Azure websites via FTP.
  
If you have not done that before, again there are heaps of tutorials there that shows how to deploy a site to Azure via FTP. Azure websites provides you with a Publish Profile, you could use that to ftp-connect to your site. 

4. Create MySQL database on Windows Azure
  
We need to create a MySQL database for Magento. If you are migrating to Azure, you might want to back up your database and restore it on Azure. The bottom line is that we need a MySQL database that is accessible from the azure website.
  
Have the Host name, Username, and passowrd handy for the installation wizard. 

5. Install Magento through the Wizard
  
Once you have the Magento package deployed, and you have your MySQL database ready, all we need is to go through Magento installation wizard. Once navigate into the base url (ie: magentoTests.azurewebsites.net/) then Magento is going to detect that you have done the installation yet, and you will be taken to the installation wizard. See the screenshot below.
  
Follow the wizard and provide the database details, and you should be done. <figure id="attachment_1781" style="width: 474px" class="wp-caption aligncenter">

[<img src="https://i1.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2014/05/magento1-1024x638.png?resize=474%2C295" alt="magento install wizard" width="474" height="295" class="size-large wp-image-1781" data-recalc-dims="1" />](https://i2.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2014/05/magento1.png)<figcaption class="wp-caption-text">magento install wizard</figcaption></figure> 

## Conclusions

Although this post shows how to install Magento on Azure Websites, you could effective use this same approach to install most of other install Open source packages on Azure websites, provided that they were designed to work on the cloud and Azure supports them.
  
I hope this would help somebody out there, and please do let me know via the comments if you have any questions.