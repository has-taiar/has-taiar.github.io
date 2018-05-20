---
id: 4171
title: Using Confluence as Architecture/Documentation Repository
date: 2017-08-08T09:52:56+00:00
author: has
layout: post
guid: https://www.hasaltaiar.com.au/?p=4171
permalink: /using-confluence-as-architecturedocumentation-repository/
categories:
  - Agile
  - Architecture
  - Azure
  - Communications
  - Development Practices
tags:
  - Architecture
  - Confluence
  - Documentation
  - TOGAF
---
I&#8217;m starting on a new project so I need to document the decisions that I am making in the design and processes. After evaluating a number of platforms or methods, I have concluded that using Confluence was a good fit, so here I summarise my reasons for this, I hope you find it useful: 

### Permission Management

One of the main things for me was making sure that only authorised people can view and change these documents so permission management is very important to me. Confluence gives you the ability to lock a whole **Space** to a group of users or individual pages. I used the first approach so I created a team in Confluence and gave this team a **Edit** permission on the whole **Space**, everybody else (who is authorised) can **view**
  
It&#8217;s always better to be inclusive, so if a team member have some ideas to propose or want to change something, they can add a comment on the document and one of the authorised users would make the change. This way we have all the discussions around what went in and the rational behind it. <figure id="attachment_4177" style="width: 300px" class="wp-caption alignnone">

<img src="https://i0.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2017/08/page-edit-restrict.png?resize=300%2C119&#038;ssl=1" alt="Page Edit Restrict" width="300" height="119" class="size-medium wp-image-4177" srcset="https://i0.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2017/08/page-edit-restrict.png?resize=300%2C119&ssl=1 300w, https://i0.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2017/08/page-edit-restrict.png?resize=768%2C304&ssl=1 768w, https://i0.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2017/08/page-edit-restrict.png?resize=1024%2C405&ssl=1 1024w, https://i0.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2017/08/page-edit-restrict.png?w=1575&ssl=1 1575w" sizes="(max-width: 300px) 100vw, 300px" data-recalc-dims="1" /><figcaption class="wp-caption-text">Page Edit Restrict</figcaption></figure> <figure id="attachment_4178" style="width: 300px" class="wp-caption alignnone"><img src="https://i2.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2017/08/space-permissions.png?resize=300%2C92&#038;ssl=1" alt="Space Permissions" width="300" height="92" class="size-medium wp-image-4178" srcset="https://i2.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2017/08/space-permissions.png?resize=300%2C92&ssl=1 300w, https://i2.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2017/08/space-permissions.png?resize=768%2C235&ssl=1 768w, https://i2.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2017/08/space-permissions.png?resize=1024%2C313&ssl=1 1024w, https://i2.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2017/08/space-permissions.png?w=1576&ssl=1 1576w" sizes="(max-width: 300px) 100vw, 300px" data-recalc-dims="1" /><figcaption class="wp-caption-text">Space Permissions</figcaption></figure> 

### Versioning Management

Changes to pages and posts are saved in Confluence with their history of changes. This makes it very easy to look up any page and see how it was changed? by whom? and at what time? I have also installed this plugin (need to pay for it) which allows me to keep multiple versioning of the same page. This is very important for documenting API/Contracts so that you have all the documentation of all versions in one place. <figure id="attachment_4176" style="width: 300px" class="wp-caption alignnone">

<img src="https://i0.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2017/08/versioning.png?resize=300%2C196&#038;ssl=1" alt="Confluence Page Versioning" width="300" height="196" class="size-medium wp-image-4176" srcset="https://i0.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2017/08/versioning.png?resize=300%2C196&ssl=1 300w, https://i0.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2017/08/versioning.png?resize=768%2C502&ssl=1 768w, https://i0.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2017/08/versioning.png?w=1000&ssl=1 1000w" sizes="(max-width: 300px) 100vw, 300px" data-recalc-dims="1" /><figcaption class="wp-caption-text">Confluence Page Versioning</figcaption></figure> 

### Search-ability

Search is a built-in function of Confluence so you get that out of the box<figure id="attachment_4175" style="width: 300px" class="wp-caption alignnone">

<img src="https://i2.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2017/08/search.png?resize=300%2C173&#038;ssl=1" alt="Confluence Search" width="300" height="173" class="size-medium wp-image-4175" srcset="https://i2.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2017/08/search.png?resize=300%2C173&ssl=1 300w, https://i2.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2017/08/search.png?w=505&ssl=1 505w" sizes="(max-width: 300px) 100vw, 300px" data-recalc-dims="1" /><figcaption class="wp-caption-text">Confluence Search</figcaption></figure> 

### Users (stakeholders) accounts

This was a big plus for us as the organisation already has Confluence and they already use it for other areas of the business, so it made it easier to adopt by the team. You could use the cloud-hosted version of Confluence, in which case Atlassian would charge you per user account. Or you could host the application locally and you can manage and create/remove your users. 

### Ease-of-Use

There are really 2 things that I enjoy using in Confluence.
  
1. a Markdown-like interface for editing and formatting your document.
  
2. You can export document to other formats like a word document, which sometimes important when you trying to communicate a document to any stakeholder who is not a tech savvy and would not want to touch Confluence 🙂

### Extensibility

Plenty of plugins (free and paid) to choose from, so most of the time you would fine what you are looking for as somebody has already developed a plugin for it. 

That&#8217;s it for me, I would love to hear what you are using, so do let me know in the comments.