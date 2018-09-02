---
title: High Availability for Azure IoT Edge Devices
date: 2018-09-01T19:30:00+00:00
author: has
layout: post
permalink: /high-availability-for-azure-iot-edge-devices
tags:
  - Azure
  - IoT
  - IoTEdge
  - Architecture
  - Resilience
  - High Availability
---

<img src="/wp-content/uploads/2018/09/sensor-cloud.png" alt="High Availability for Azure IoT Edge" height="150" class="img_center" /> <br />

# Introduction
Azure IoT Edge is a great service from Microsoft Azure that enables us to push analytics and intelligence compute to the Edge. In previous posts, I wrote about [how we can develop modules to run on the edge](https://www.hasaltaiar.com.au/melbourne-azure-nights-the-age-of-azure-iot-edge/) as well as [how to architect and design such solutions](https://www.hasaltaiar.com.au/pushing-micro-services-principles-to-the-azure-iot-edge). Essentially this will help us in [operationalising machine learning models](https://www.hasaltaiar.com.au/pushing-micro-services-principles-to-the-azure-iot-edge) and deliver value faster to any Operation Technology team to provide them with intelligence where it matters -on site-. 

# Why High Availability 
Ok so now we know what Azure IoT Edge is and how to use it, why is it so important to have High Availability for Azure IoT Edge devices? To answer this question, we first need to understand what is the **compute workload** that we are pushing to the Edge. If our compute workload involves interacting with heavy machineries and `controlling` (directly via means of integration or indirectly by providing advisory dashboards) heavy machineries, then we certainly cant afford to have system breakdown. Such breakdown could impair safety for site workers and in no doubt will cost the business big bucks. This is exactly the case I have with one of my clients where I talked about the design of the solution in a [previous post](or provide advisory dashboard to assist in controlling these). In that post, I showed how we push the outcome of our predictive models to our [DCS systems](https://en.wikipedia.org/wiki/Distributed_control_system)

## Azure support for HA on Edge devices
Microsoft is spending big money on the Internet of Things technology and tools. Thus, it would be a fair assumption that support for High Availability is coming soon (although the [Azure Roadmap website](https://azure.microsoft.com/en-gb/roadmap/azure-iot-edge/) does not mention HA yet). However, if you are hoping to push such systems to production now -like me- then you need to roll out your own solution. And this is why we have this blog post :)

# Proposed solution 
Before we delve into the details of the solution, it's worth re-iterating what our solution architecture is. Below, is the solution design diagram I borrowed from my [previous post](https://www.hasaltaiar.com.au/pushing-micro-services-principles-to-the-azure-iot-edge) on how to operationalise machine learning models on the Azure IoT Edge. 

<a href="https://www.hasaltaiar.com.au/pushing-micro-services-principles-to-the-azure-iot-edge" target="_blank"><img src="/wp-content/uploads/2018/08/microservices-arch-iot-edge.png" alt="Micro-Services on Azure IoT Edge" height="250" class="img_center"/></a> <br />
<span>My Solution design from <a href="https://www.hasaltaiar.com.au/pushing-micro-services-principles-to-the-azure-iot-edge" target="_blank">last</a> design on how to operationalise machine learning models on the Edge</span>

To be able to have High Availability, we need to have mutliple Azure IoT Edge devices. These devices will have _identical_ workload so that they can replace each other at any point. The remaining issue is how do we ensure that only device is running the compute workload at any point in time? For this reason, we have one device serving as the `primary` Edge device which is active by default and running the workload. If the `primary` Edge device goes down, then one of the `secondary` devices will come up to compensate and run the workload. 
It's worth mentioning that these devices do not have awareness of this High Availability jazz. This is controlled externally. What the devices see is a `flag` that controls whether they are active in processing the workload or not. This `flag` is set in the `device twin` and controlled remotely using Azure IoT hub. 


<img src="/wp-content/uploads/2018/09/azure-iot-edge-high-availability.png" alt="High Availability for Azure IoT Edge" /><br />
<span>High Availability for Azure IoT Edge</span>


## High Availability Controller
The next piece of the buzzle is having a controller that can manage which device(s) are actively running the workload. For this, we can use an Azure Function. The main use of the Function is to check every `N` minutes if the `primary` IoT Edge device is running or not. If the device is not running then it will instruct the `secondary` device to run by setting its `flag`. Once the `flag` of the `secondary` IoT Edge device is set, then this device will start running the compute workload. That's it simple :)
For checking the device status, the Azure Function uses the following Azure IoT Hub api: 


```
# https://docs.microsoft.com/en-us/rest/api/iothub/service/getdevice
# the returned results: 
{
  # among other things, we get the followings: 
  "connectionState": Connected | Disconnected
  "connectionStateUpdatedTime: 	string
  "etag": string	
  "lastActivityTime": string
  "status": disabled | enabled
  "statusReason": string
  "statusUpdatedTime": string
}
```


# Routing Incoming messages 
An important thing to mention here is that we are not changing the routing of messages to the `primary` IoT Edge device. This is because in our case here we are using the Edge device for running intelligence workload only. Our IoT Edge device is not serving as a `gateway`. However, in some senarios, you would need to change the routing of messages to go to the `active` IoT Edge device. By `active` here I mean the device that is currently handling the intelligence workload. This can be done with the routing rules in the Azure IoT Hub ([docs can be found here](https://docs.microsoft.com/en-us/azure/iot-hub/tutorial-routing))

# Consistent Deployment
For this High Availability approach to work, we need to make sure that our pool of IoT Edge devices are running identical (the same) deployment of IoT Edge modules and configuration. This is to ensure that when we switch from one device to the other we would not have any surprises. This can be easily achieved by having all deployments going through a Continous Integration and Delievery (CI/CD) server like VSTS. There is a very good documentation and support for configuring CI/CD for IoT Edge modules that you can find on [MSDN docs](https://docs.microsoft.com/en-us/azure/iot-edge/how-to-ci-cd). Again it's important to emphasis that both devices need to have the same deployment that means that the CD builds need to be deploying to a pool of devices (filtered by tag). 


# Conculsion
We have looked at what IoT Edge gives us, why do we need High Availability and how can we achieve that in the absense of HA support from Azure. I hope you find this helpful and I would love to hear your feedback and comments if you have any :) 
