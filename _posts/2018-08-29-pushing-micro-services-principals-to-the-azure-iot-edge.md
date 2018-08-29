---
title: Pushing the Micro-Services Principals to the Edge
date: 2018-08-29T22:10:47+00:00
author: has
layout: post
permalink: /pushing-micro-services-principals-to-the-azure-iot-edge
tags:
  - Azure
  - IoT
  - IoTEdge
  - Architecture
  - Microservices
---

<img src="/wp-content/uploads/2018/08/microservices-arch-iot-edge.png" alt="Micro-Services on Azure IoT Edge" /> <br />
<span>Micro-Services on Azure IoT Edge</span>

# Azure IoT Edge
Azure IoT Edge is a service that's built on top of Azure IoT Hub to shift the heavy load of analytics to the Edge. There is a great potential for the Azure IoT Edge as it promises to reduce latency, improve security, and reduce cost. I presented about Azure IoT Edge not long ago and you see the slides [here](). However, many people wonder as I have been asked a few times before, how does it all work? How could you shift the work load from the cloud to the Edge and how can you operationalise such modules? 

I have been lucky enough to be working in this field for the last few months and we have been facing interesting challenges. In this blog post, I will share the architecture we are using for pushing the Machine Learning load to the Edge. The scenario I share here is coming from the Mining field, but it can easily be adapted to other sectors too. I have used a similar architecture for Manufacturing. 


# The Scenario 
Generally speaking, in the mining sector, there is normally lots of sensors in the field, and all of them generating data. Typically this data is stored on site in some system like **OSI Soft PI Server**. The client wants to be able to experiement with and productionise as many machine learning models as possible and as quickly as possible. 
In this scenario, the data is gathered and stored in an OSI Soft PI Server at each site. This data is then pushed to an Azure Data Lake. 


# The Machine Learning Models
The Data Science team work with the data in the Azure Data Lake to perform feature engineering and train the machine learning models. Once a model is built, we use Azure Machine Learning Servies to manage the models and their versioning. For more info on this, see the channel9 talk on Azure Machine Learning Services: 


<a target="_blank" href="https://channel9.msdn.com/Shows/AI-Show/Introduction-to-Azure-ML-Services-Part-1of4">
  <img src="/wp-content/uploads/2018/08/ai-show-ml.png" alt="Azure Machine Learning Services" /></a> <br />
<span>Azure Machine Learning Services</span>


Once we have the machine learning models, we need to operationalise them. 


# Operationalisation of the Machine Learning Models
To operationalise a machine learning model, we build an automated data pipeline to feed the data in near real-time to the model and then action the output from the machine learning model. Generally speaking the output from the machine learning is used in some reporting and **Decision Support Dashboards**. In our case, we aim at full-autonomous system and that's why we integrate directly with the [DCS Systems](https://en.wikipedia.org/wiki/Distributed_control_system). This means that the results from the machine learning prediction are actioned and displayed/actioned in the Operation Technology systems (DCS). This integration is happening over [OPC UA](https://en.wikipedia.org/wiki/OPC_Unified_Architecture) protocol.  


# Micro Services
A common problem that I see in many machine learning models that they are built as a one massive monolithic application. This is a very terrible idea that mashes all data pipeline, sql integration, the machine learning model, monitoring and all in one app. There is a lot of risk in deploying such an app to production as it would be impossible to know how such system is working or what's borken. Thus, we have evolved our architecture over time to use the principals of a micro-services architecture on the Edge. 
The diagram above shows the micro services that are used for this scenario: 
  - **OSI SOFT PI Web Api**: This is developed as an Azure IoT Edge module and is responsible for sourcing data in near real-time from the PI Server (sensors readings) for the Machine Learning model. 
  - **The Pipeline Controller**: The pipeline controller is the main module that triggers the prediction process every n seconds as well as it controls the integration between the different modules. 
  - **The Machine Learning Model**: This is the machine learning model that is produced by the Data Science team. In general, this is normally packaged as a Docker image / Azure IoT Edge module. These models are normally baked with a web server that enables other modules to integrate with itself using requests over HTTPS. 
  - **OPC UA Integrator**: This is the module that integrates with the DCS systems using OPC UA protocol. Essentially, this is the main thing in pushing our intellignence to the Operation Technology team. 
  - **SQL Integrator module**: This module is responsible for storing the input and output of the machine learning model into the DataMart. This would then be used by the Reporting systems. 
  - **Monitoring Module**: The monintoring module is used to collect and report data about the health of the IoT Edge device and the health of all modules to the Azure App Insights. See the details of how this works [here](https://www.hasaltaiar.com.au/monitoring-azure-iot-edge-modules-using-app-insights)
  


# Why Micro Services
In using the micro services approach on the Edge, we have gained lots of flexibity and robustness. The main benefits can be summarised as: 
- Managability and Maintainability of the different modules. 
- Reusability of the modules across multiple projects 
- Ease of development. We assign modules to individual team/team-members. 
- Ease of problem troubleshooting. This is due to be better visibily of what's happening in the run-time. 



# Conclusion
I hope now you can see why it's important to have a good design and architecture for deploying workloads to the Edge. If you end up bundling all your modules into one big module, it will be a nightmare to manage that in production. I hope you find this useful, and would love to hear any feedback :) 

