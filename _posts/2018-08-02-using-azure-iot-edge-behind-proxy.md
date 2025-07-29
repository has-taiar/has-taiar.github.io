---
title: Using Azure IoT Edge Behind Proxy
date: 2018-08-02T18:30:47+00:00
author: has
layout: post
permalink: /using-azure-iot-edge-behind-proxy/
tags:
  - Azure
  - IoT
  - IoTEdge
---

<img src="/wp-content/uploads/2018/08/azure-iot-edge-with-proxy.png" alt="Azure IoT Edge behind firewall" /> <br />
<span>Azure IoT Edge behind firewall</span>

Azure IoT Edge is a great offering for shifting load from the cloud to the Edge. It enables scenarios where there is emphasis on low-latency, better performance, higher security, better privacy, etc. 
One limitation of the Azure IoT Edge is that it currently does not support operating behind a proxy. 

# Finding the problem
The first challenge was finding where the problem was, I setup my Docker to use my proxy settings and changed my IoT Edge runtime config to have the proxy settings as below: 

<img src="/wp-content/uploads/2018/08/docker-proxy-settings.PNG" alt="Docker settings to support firewall" /> <br />
<span>Docker settings to support firewall</span>

<img src="/wp-content/uploads/2018/08/iot-edge-config.PNG" alt="Location of IoT Edge config file" /> <br />
<span>Location of IoT Edge config file</span>

```
# sample config change from IoT Edge config file
agent:
  name: "edgeAgent"
  type: "docker"
  env: {"HTTP_PROXY": "http://user:pwd@proxy.com", "HTTPS_PROXY": "http://user:pwd@proxy.com"}
  env: {}
  config:
    image: "mcr.microsoft.com/azureiotedge-agent:1.0"
    auth: {}

```
<br /><span>Sample config to enable ENV varialbes in IoT Edge Runtime

However, that did not fix the problem. To make things more difficult, the docs do not mention anything about operating behind a proxy. 
After some investigation, I took this conversation to the Azure IoT Edge dev team on GitHub, can find the details [here](https://github.com/Azure/iotedge/issues/5) 

# Defining The Problem
It turned out that the problem is worse than I expected. The lack of support for Proxy was not just a limitation in the IoT Edge. It was due to lake of proxy support in the SDK libraries as it can be seen in the conversation with the IoT Edge product team. 
There is no way to get around this unless the SDK libraries implement support for proxy settings, then the IoT Edge product team can adopt this change on their end too. 

# The Solution
While all this may take time, I need a solution urgently, and hence we have the solution below :) 
We concluded that the solution was to exempt the IoT Hub traffic from our proxy. However, punching a hole in the firewall would not appeal to any Infrastructure team. Thus, to solve the problem with minimal security impact, we did the following: 
- Open port 443 (https) on the IoT Edge machine (outbound) 
- Enabled a proxy exemption rule for specific traffic. This exemption only applies to: 
  - Https traffic (on port 443) from the IoT Edge device going outbound
  AND
  - The exmemption only applies to traffic going to Azure IoT Hub. This was enforced by white-lising Azure IP Address(es) for our specific region. 
  
So there you have it, with this change we enabled our IoT Edge device to work behind a proxy and there is minimal impact on our security posture. 

It's important to understand that this solution is mostly to enable traffic between our IoT Edge environment (IoT Edge Hub and IoT Edge Agent modules) and the IoT Hub. 
This means that if you have other IoT Edge modules that are loading external contents (at runtime) then they will still need to have proxy settings. 

I hope this has been useful, please let me know if you have questions or comments, would love to hear feedback. 
