---
id: 3901
title: Why you should use Git over TFS
date: 2016-03-08T10:18:53+00:00
author: has
layout: post
guid: http://www.hasaltaiar.com.au/?p=3901
permalink: /why-you-should-use-git-over-tfs-2/
categories:
  - .NET
  - Azure
  - Code Quality
  - Development Practices
  - entrepreneurship
tags:
  - git
  - tfs
  - visual studio
---
<figure id="attachment_3911" style="width: 551px" class="wp-caption aligncenter">[<img class="size-full wp-image-3911" src="https://i0.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2016/03/git-or-vs.png?resize=525%2C229" alt="Git || TFS (Source: VisualStudio.com)" width="525" height="229" data-recalc-dims="1" />](https://i0.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2016/03/git-or-vs.png)<figcaption class="wp-caption-text">Git || TFS (Source: VisualStudio.com)</figcaption></figure> 

I have been an advocate of git for long time now and I might be biased a little bit, but take a moment to read this and judge for yourself whether git is the way to go or not.

If you are starting a new greenfield project, then you should consider putting your code on a git repository instead of TFS. There are many reasons why git is better suited, but the two main ones in my perspective are:

## Cross-Platform Support

Git tools are available for all platforms and there are many great (and FREE) GUI tools like GitExtensions or SourceTree. In today&#8217;s development world, there is guaranteed to be multiple set of technologies, languages, frameworks, and platform-support in the same solution/project. Think of using NodeJS with Windows Phone app. Or building apps for Windows, Android, and iOS. These are very common solutions today and developers should be given the freedom of choosing the development platform of their choice. Do not limit your developers to use Visual Studio on Windows. One might argue that TFS Everywhere (which is an add-on to Eclipse) is available for other platforms, but you should try it and see how buggy it is and how slow it is in finding pending changes. Having used TFS Everywhere, I would not really recommend it to anyone, unless it is your last resort.

> #### _</p> 
> 
> Developers should be able to do their work any time and anywhere
> 
> </i></h4> </blockquote> 
> 
> ## Work Offline
> 
> Developers should be able to do their work any time and anywhere. Having TFS relying on internet connection to commit, shelf, or pull is just not good enough. I have even had many instances where TFS was having availability problems, which meant that I was not able to push/pull changes for an hour. This is not good. Git is great when it comes to working offline, and this is due to the inherent advantage of being a fully distributed source control system. Git gives you the ability to a) Have full history of the repo locally. This enables you to review historical changes, review commits, and merge with other branches all locally. b) Work and commit changes to your branch locally c) Stash changes locally. d) Create local tags. e) Change repo history locally before pushing. And many other benefits that come out of the box. 
> 
> > #### _Having TFS relying on internet connection to commit, shelf, or pull changes is just not good enough_
> 
> ## Hosting Freedom
> 
> With TFS, you are pretty much stuck with Microsoft TFS offering. With git however, it is widely available and many providers offer free hosting for git, including VSTF, GitHub, and Bitbucket. With Visual Studio Online itself offering you to host your code in git repositories, there is really no reason why not take full advantage of git.
> 
> > #### _With VSO itself offering to host your code in git repositories, there is really no reason why not take full advantage of git_
> 
> I have introduced git in many development teams so far, and I must say that I did get resentment and reluctance from some people at the start, but when people start using it and enjoying the benefits, everything settles in place.
> 
> Some developers are afraid of command-line tools or the complexity of push/pull/ and fetch and they want to stay simple with TFS, but this does not fit today&#8217;s development environment style. Last month, I was working at this client site where they were using Visual Studio to develop, debug, and deploy to iOS devices, and it was ridiculously slow. As a final resort, I opted to using Eclipse with TFS Everywhere plugin with my Xamarin Studio, and it was a lot better. I still had to suffer the pain of Eclipse-TFS not seeing my changes every now and then but compared to the time I was saving by choosing my own development IDE (Xamarin Studio), I was happy with that.
> 
> > #### _If you are starting a new project, or if you&#8217;re looking for a way to improve your team practices, then do yourself a favour and move to Git_
> 
> So to summarise, if you are starting a new project, or if you are looking for a way to improve your team practices, then do yourself a favour and move to Git. You will be in a good company, especially if you enjoy contributing to open source project :). Teams that use VSTS as their ALM platform can still use VSTS, but host their code in git repositories on VSTS to take advantage of git and TFS together.
> 
> Finally, if you have any questions or thoughts, I would love to hear from you.