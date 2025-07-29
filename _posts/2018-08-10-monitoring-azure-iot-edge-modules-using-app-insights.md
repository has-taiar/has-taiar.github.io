---
title: Monitoring Azure IoT Edge Modules Using Azure App Insights
date: 2018-08-10T22:10:47+00:00
author: has
layout: post
permalink: /monitoring-azure-iot-edge-modules-using-app-insights
tags:
  - Azure
  - IoT
  - IoTEdge
  - App-Insight
  - Performance
  - DevOps
---

<img src="/wp-content/uploads/2018/08/azure-iot-edge-modules.png" alt="Monitoring of Azure IoT Edge Modules" /> <br />
<span>Monitoring of Azure IoT Edge Modules</span>

# Azure IoT Edge Modules
The Azure IoT Edge offering is a great way of shifting the load from the cloud to the Edge of the network, closer to the source of the data. Azure IoT Edge offering allows us to run code and data pipeline close to where the data is originated to improve performance, security, and privacy. The Azure IoT Edge provides the flexibility to deploy and run these modules as docker containers. 

One main challenge however is how do we stay on top of what's happening on our IoT Edge device and how do we stay up-to-date with the status of our IoT Edge modules. This is what we try to cover in this blog post. 

We will use Azure Application Insights to monitor the health of our Azure IoT Edge device as well as our modules in near real-time. 

# Create an Azure App Insights instance
There is enough documentation on the Microsoft [MSDN](https://docs.microsoft.com/en-us/azure/application-insights/app-insights-create-new-resource) on how to create an App insights resource, so we do not need to cover it here. 
All we need is to ensure that we have a resource up and running and we need to copy the `instrumentationKey` for later use. 

# Deploying The Azure App Insight Docker Image
Once we have a resource in our Azure subscription, we can then deploy the Azure App Insights docker image either via the Azure IoT Hub or directly via the command line. The end command should look like this: 

```
# need to replace the instrumentation key here
docker run -v /var/run/docker.sock:/docker.sock -d microsoft/applicationinsights ikey=your-instrumentation-key
```

This will tell docker to pull the docker image `microsoft/applicationinsights` and gives it the parameter `ikey`. This will taka a minute or so before it starts sending telemetry to our Azure App Insights Instance. 

# Configuring the Reports
Previously, we used to be able to configure our App Insights dashboard to have whatever reports that we wanted. This was recently changed to show certain reports only. However, we can still configure our main dashboard to produce whatever reports we want. 

The first thing we will need to do is to `create a new dashboard` in the Azure portal. This's to allow us to add the new reports that Azure App Insights comes with out-of-the-box. Once we do that, we can then pull the reports we want. I have pulled three reports in the screenshot below. These are `Docker Overview`, `Servers`, and `Performance Timeline`. 

<img src="/wp-content/uploads/2018/08/docker-report-dashboard.png" alt="Azure App Insights - Docker Overview Reports" /> <br />
<span>Azure App Insights - Docker Overview Reports</span>

# The Reports
There are three main reports that we are interested in: 

## Docker Overview
This is the main report and it gives loads of information: 

### Full monitoring of the IoT Edge device
The top of the report shows the health of the host machine in a glace. The report includes information about processor (processing) time, Memory (available in GB), Docker RX Bytes, and Docker TX Bytes (Network activity of the docker host). An example of the report can be seen below. 

<img src="/wp-content/uploads/2018/08/docker-overview.png" alt="Azure App Insights - Docker Overview Sample Report" /> <br />
<span>Azure App Insights - Docker Overview Sample Report</span>

### Health of Each IoT Edge Module

Below that, a full breakdown of resource utilisaiton at the docker host level and at the container level. This's grouped into 2 parts: `Activity by Docker Host` and `Activity by Container`. This can be seen below. 

<img src="/wp-content/uploads/2018/08/docker-activity.png" alt="Azure App Insights - Docker Activity by Host and by Container" /> <br />
<span>Azure App Insights - Docker Activity by Host and by Container</span>

Each of the IoT Edge modules is represented by a line in the `Activity by Container` table. Clicking on any of these modules will take us to a more detailed reports about this particular module. An example of this is shown below: 

<img src="/wp-content/uploads/2018/08/docker-activity-by-container.png" alt="Azure App Insights - Docker Activity by Container" /> <br />
<span>Azure App Insights - Docker Activity by Container</span>

### Servers Report
The servers report gives us lots of information about the host docker machine. In a way it's similar to the Docker Overview reports. 


### Custom (Docker) Events
Another tile that we can add to the dashboard has custom events. By default it will include all `Docker Events`. Things like `start` and `stop` of IoT Edge modules. An example of these reports below: 

<img src="/wp-content/uploads/2018/08/docker-events.png" alt="Azure App Insights - Docker Events" /> <br />
<span>Azure App Insights - Docker Events</span>

Clicking on any of these events, gives us a list of all occurances of this event as below: 
<img src="/wp-content/uploads/2018/08/docker-events2.png" alt="Azure App Insights - Docker Events (List by Container)" /> <br />
<span>Azure App Insights - Docker Events (List by Container)</span>

Lastly, all these reports are built using the Analytics console which is part of the Azure App Insights. We can customise any of these reports by clicking on the customise button at the top right corner of each chart (open chart in analytics). Upon clicking on the customise button, we will see the analytics page like below. In this analytics console, the query is shown, we can then modify the query to match our needs. 

<img src="/wp-content/uploads/2018/08/chart-in-analytics.png" alt="Azure App Insights - Customise Chart in Analytics Console" /> <br />
<span>Azure App Insights - Customise Chart in Analytics Console</span>

# Conclusions
In just a few clicks, we got lots of reports that gives us lots of information about how our IoT Edge (docker host) machine is doing in near real-time as well as detailed information about the individual modules. Please bear in mind that there are many other reports that I have not covered. 

In the next blog post, I will cover how we can get more trace and error information from individual IoT Edge modules. 

