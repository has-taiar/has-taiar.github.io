---
title: Importing & Exporting Build Config in VSTS using YAML files
date: 2018-07-07T18:30:47+00:00
author: has
layout: post
permalink: /import-and-export-build-config-in-vsts-using-yaml-files/
tags:
  - DevOps
  - VSTS
  - Azure
---

<img src="/wp-content/uploads/2018/07/yaml-on-vsts.png" alt="YAML on VSTS" /> <br />
<span>YAML on VSTS </span>

Visual Studio Online (VSTS) has a great feature that allows users to use YAML files for exporting or defining their builds. This feature was introduced not long ago, you can find lots of documentation [here](https://docs.microsoft.com/en-us/vsts/pipelines/build/yaml?view=vsts). 

## Why use YAML?
First, A few reasons for why you should use YAML files for defining your builds: 

- It gives a great insight on the health of the build pipeline. You can see who made a change, what change, and at what point in time. This is essential for ensuring a healthy build pipeline. 
- This also gives us the advantage of applying coding best practices (like pull request and code review) to control anything that goes into the build definition before its changed/merged. 
- Another benefit of using YAML for build definition is that it makes your build **portable** across multiple accounts of VSTS. And, this is the main reason for this blog post. 

Let me explain, assume you have done some work on a particular project. I do work for many clients, and when I start developing I just use my VSTS account and Azure subscription to get things done quickly. When the project finished, we hand over the code and all other artefacts to the client. 
Before the support of YAML, you would have to re-create the build manually step-by-step on the new VSTS account. However, now you can use YAML to export your build config and import this YAML on the other (client's) VSTS account. 

Here is a great comparison from the docs on how does using YAML compares with using the web portal (from the [VSTS docs](https://docs.microsoft.com/en-us/vsts/pipelines/build/yaml?view=vsts#how-do-yaml-builds-compare-to-web-interface-builds))

The docs in the link above go into great details on how you can create, import, and export build configs using YAML, so I am not going to repeat that. Instead, I will share some of the issues that I faced when started using the YAML feature. 

## Preview Feature
At the time of this writing (Jul 2018), the YAML build config is still a preview feature. This means that you have to enable the feature on your account before you can use it. A common gotcha here is that the feature is only available on the list of Preview Features on the Account level and not the individual User level. The screenshot below shows both. 

<img src="/wp-content/uploads/2018/07/individual-preview-features-on-vsts.PNG" alt="individual preview features on vsts" /> <br />
<span>Individual User view of Preview Features in VSTS </span>

<img src="/wp-content/uploads/2018/07/account-level-preview-features-on-vsts.PNG" alt="account level preview features on vsts" /> <br />
<span>Account level view of Preview Features in VSTS </span>

## Use of Parameters
Another thing that you need to watch out for is the use of Parameters. If you have done the right thing and parameterised your build steps, then watch out for these parameters when your build is exported. This is because VSTS does not export the build parameters yet. This is true at the time of writing this post. 

## Service Endpoint Names
If your build config like most builds and deploys something to Azure, then you must have configured a Service Endpoint connect your VSTS account (and its build/deployments) to your Azure subscription. When you try to import your YAML it will fail if VSTS does not find a Service Endpoint that **exactly** matches the name. This can be painful and sometimes not easy to decipher what the error is trying to say, but once you create Service Endpoint with similar name to what you used on the source build, it should be all good. 

## No CD yet
Using YAML is great and can save you lots of time, but unfortunately it does not support Continuous Deployment yet. This means what you export/import your builds, you will only be able to do that for CI but not CD. 

## CI Build shows up as ONE step
When you create a CI build using YAML, VSTS will show it as one-step build only. That's because from VSTS perspective it's actually only one step, even though this one step has many build steps underneath. This really has no impact on the build but just sometime to be aware of. 

And that's it, now go and export and import some YAML build files :) 
