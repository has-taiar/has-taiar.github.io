---
title: Azure Monthly News Summary - September 2018
date: 2018-08-08T18:30:47+00:00
author: has
layout: post
permalink: /azure-monthly-news-summary-september-2018
tags:
  - Azure
  - Meetup
  - News
---

<img src="/wp-content/uploads/2018/08/Azure-news.png" alt="Azure News" /> <br />
<span>Azure Monthly News - Sept 2018 (from Melbourne Azure Meetup)</span>

<blockquote><p>The Azure Monthly News Summary is a monthly post and slide deck that we prepare for our community at the Azure Melbourne Meetup. I am a co-organiser of this meetup and it happens monthly on the second Wednesday of each month. If you missed last month, you can check out the news update <a href="https://www.hasaltaiar.com.au/azure-monthly-news-summary-aug-2018">here</a></p></blockquote>

Hi again, here is the summary of Azure news from the last four weeks. This is brought to you by Melbourne Azure Meetup, which I am a co-organiser of :) There is a lot to cover, so let's get started. 

Before we go through the news, I have a special section this month for Training opprtunties. This is a great way of learning and having good quality training from Microsfot in full day catered sessions all for FREE. Here are the sessions: 



# Events & Training Opportunities

### Microsoft AI & Data Discovery Days 
These are really good opportunities to get full day FREE training that is offered by Microsoft. The training is really good for people who are wanting to jump into the AI and Data space. Find a session near you [here](https://blogs.msdn.microsoft.com/premier_developer/2018/09/04/ai-discovery-days-at-a-microsoft-location-near-you/)

### Open Source Virtual Conference
Happening on 13th Sept. This is a virtual conference you can registr and read the details [here](https://info.microsoft.com/ca-azureoss-wbnr-fy19-07jul-24-01oss-conference-master-virtual-event-program.html?wt.mc_id=AID728332_QSG_SCL_262562&_lrsc=d8e42e05-a93c-4021-89c8-b66a82061998) 

### Azure Discovery Day - Melbourne 
This is happening on the 17th of Sept. If you are not in Melbourne, I am sure there is a session close to you, so just need to check it out :) [Registration and details](https://www.microsoftevents.com/profile/form/index.cfm?PKformID=0x4569463abcd)

### Microsoft Advanced Analytics - Melbourne 
This is a full day training from Microsoft and it will be held on 26th of Sept. Again if you are somewhere else, check out the main page as I am sure they have other sessions in other cities too. [Registration and details](https://www.microsoftevents.com/profile/form/index.cfm?PKformID=0x4833354abcd)

### Microsoft Ignite
Finally the big event, Microsoft Ignite. This will run on 24th-28th Sept. If you are like me and you have not got a ticket for the conference you can watch it all online by registering through the website. here is the [website](https://www.microsoft.com/en-us/ignite) for more details.  



# Dev News

### Goodbye VSTS – Hello Azure DevOps
Microsoft has rebranded Visual Studio Team Services and broken that down to four different offerings on Azure: Azure Pipelines, Azure Boards, Azure Artifacts, Azure Repos, Azure Test Plans. 
As you might have guessed, these four services actually match the previous offering from VSTS, but now they are available as Azure services. Follow the annoucement for details [here](https://azure.microsoft.com/en-us/blog/introducing-azure-devops/)


### Python in VS Code gets a new Debugger (ptvsd 4)
The Python extension for Visual Studio Code is getting a new version of the debugger ptvsd 4. The previous version was 3.0 and it was not very performant. This new version 4.11 promises faster, more reliable debugging experience as well as better remote debugging. You can read more about this [here](https://blogs.msdn.microsoft.com/pythonengineering/2018/09/05/python-in-visual-studio-code-august-2018-release/)


### Visual Studio Tooling: Library Manager Released
The New Library Manager in Visual Studio has now been released. It aims at helping developers managing front-end libraries. This includes Javascript files and CSS. The new LibMan has a CLI interface and full integrates with Visual Studio. It also supports loading files from local File System, from CDN, and from UnPkg (which is basically loading from npm). Read the details [here](https://blogs.msdn.microsoft.com/webdev/2018/08/31/library-manager-release-in-15-8/)


### New Azure Go SDK Packages 
There is a new Azure Go SDK with support for more web development frameworks to jumpstart your development with Go. Read the details [here](https://azure.microsoft.com/en-us/blog/helping-go-developers-build-better-cloud-apps-faster/)

### New Azure CosmosDB JavaScript SDK 2.0 now in public preview
The CosmosDB team has released a new JS SDK 2.0. This comes with lots of goodness like new Object model which means completely new api to interact with the CosmosDB service.
It also provides support for containers and items, very similar to folders and files.This new versio of the SDK a
also supports javascript promises to enable better concurrency. Details can be found [here](https://azure.microsoft.com/en-us/blog/new-azure-cosmosdb-javascript-sdk-2-0-now-in-public-preview/)

### ASP.NET Core 2.2.0 – Preview 1 is now available (Link to details)
The ASP.NET Core 2.2 Preview 1 is now out. It includes some new features like API Controller conventions, Endpiont Routing, and a whole new Health Checks service. Probably one of the outstanding new features is the support for HTTP2 in Kestrel. You can read the details [here](https://blogs.msdn.microsoft.com/webdev/2018/08/22/asp-net-core-2-2-0-preview1-now-available/)



# App Service

### Public preview of Windows Container Support in Azure App Service
Azure App Service now supports Windows Container in Public Preview. The App service team has introduced a new SKU for Windows Containers. This Public preview supports multiple base images like aspnet core, aspnet, windows servers, and windows nano server images. Read the details [here](https://azure.microsoft.com/en-us/blog/announcing-the-public-preview-of-windows-container-support-in-azure-app-service/)

### Azure App Service – SSL Settings Revamp
The Azure App Service team has identified the SSL Settings as one of the most used features of App Service. Therefore, they listend to the community feedback and redsigned the UX for SSL Settings. This included introducing new tabs, allowing the user to edit SSL Bindings, seeing Private Cert Details, and improving the UX when it comes to uploading Certs. You can read the details [here](https://blogs.msdn.microsoft.com/appserviceteam/2018/08/23/devtalk-app-service-ssl-settings-revamp/)



# Data Stuff

### Public Preview: Azure SQL Database Online Migration in Azure DMS (Link to details)
The Azure SQL Database Online Migration is now in Public Preview. This service allows us to migrate databases from a varity of supported database engines online. 
This ensure less downtime and help in migrating the database while applicaitons are running. In the end, this should help 
in reducing downtime and improving migration experience. You can start using it today in the US (not available in Australia yet, but worth taking it for a test drive). You can migrate your database services from AWS and on-prem to Azure :) Read the detalis [here](https://blogs.msdn.microsoft.com/datamigration/2018/08/30/announcing-public-availability-of-azure-sql-database-online-migration-in-azure-database-migration-service/)

### VNet Service endpoints for MySQL and PostgreSQL are now in GA 
Azure MySQL and PostreSQL now support integration with VNet Services. This is great for Enterprise compliance and security. Read the details [here](https://azure.microsoft.com/en-us/blog/vnet-service-endpoints-for-azure-database-services-for-mysql-and-postgresql-ga/)

### Azure SQL Data Warehouse Gen2 now generally available in France and Australia 
The new version of Azure SQL Data Warehouse (2.0) is now Publicly Available in more regions. Microsoft evaluation says that this is a market leading in terms of performance. They promise for this version to be 5 times faster (for average queries) and 4 times better in terms of concurrency. It's worth reading the details [here](https://azure.microsoft.com/en-us/blog/azure-sql-data-warehouse-gen2-now-generally-available-in-france-and-australia/)



# IT Pro Azure News

### Avere vFXT for Microsoft Azure now in public preview
Avere vFXT enables easily connecting on-premises infrastructure to Azure compute or “lift and shift” file-based workloads in Azure. Microsoft is aiming with software service offering to reduce the barrier for oganisations that are wanting to use HPC in Azure while keeping their data on-prem. Read the details [here](https://azure.microsoft.com/en-us/blog/avere-vfxt-for-microsoft-azure-now-in-public-preview/)



# Azure IoT News

### GA of Azure IoT Hub Integration with Event Grid
The integration of Azure IoT Hub with Event Grid has come to General Availability. This enable lots of great integration scenarios and reduce design complexity. For instance, we can start wiring serverless and logic apps to messages from IoT Hub. This will help alot in triggering business processes in CRM, ERP from messages coming from the IoT Hub (ie: device life-cycle messages). For more info, check the annoucement [here](https://azure.microsoft.com/en-us/blog/announcing-general-availability-of-azure-iot-hub-s-integration-with-azure-event-grid/)

### Azure IoT Toolkit supports C#, Go, Java, Node.js, PHP, Python and Ruby
There is a new version of the Azure IoT Toolkit extension for Visual Studio Code. This latest extension allows us to develop apps for IoT using any language of your choice inlcuding Java, C#, Node, Go, PHP, Python, and Ruby. The extention also enables us to generate Code, Send C2D & D2C messages, Build & Run code, as well as work with IoT Hub devices form within VS Code. Read the details [here](https://blogs.msdn.microsoft.com/iotdev/2018/08/31/c-go-java-node-js-php-python-or-ruby-choose-your-favorite-language-to-develop-azure-iot-application-in-vs-code/)

### The Azure IoT Weekly is now out
This is not from Microsoft Azure, but rather from myself :) I have created a new online weekly newsletter for all links and contents for Azure IoT. If you like Azure IoT, Advanced Analytics, Big Data, and AI, you can subscribe at [AzureIotWeekly.com](http://azureiotweekly.com) or you can follow the twitter handle at [@IoTAzure]() to get all the latest and greatest about Azure IoT :)



# Azure Misc News

### Azure Starter Pack for Gov 
Microsfot is trying to reduce the barrier for Goverment agencies to join Azure. They have introduced a new way of procurring Azure services through this new offering Azure Service Pack. The benefits of this include: Flexibility, Streamline procurement, and built-in implementation guidance. The service pack include a number of services like Data Centre migration, Dev and Test effort, Web Apps, IoT PoC, etc. To read more about this, check the [msdn blog post](https://blogs.msdn.microsoft.com/azuregov/2018/09/06/new-azure-starter-packs-now-available/)

### The new Xbox Adaptive Controller is on the Microsoft Store for $99
The new Xbox Adaptive Controller is dubbed as the most inclusive and creative design of a gaming controller. It's worth having a look at. Check the details [here](https://blogs.msdn.microsoft.com/accessibility/2018/09/04/xbox-adaptive-controller-available-today-at-microsoft-stores/)
 
 
