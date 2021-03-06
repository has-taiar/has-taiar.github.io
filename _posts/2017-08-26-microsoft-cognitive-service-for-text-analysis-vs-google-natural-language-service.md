---
id: 4187
title: Microsoft Cognitive Service for Text Analysis vs Google Natural Language Service
date: 2017-08-26T20:35:09+00:00
author: has
layout: post
guid: https://www.hasaltaiar.com.au/?p=4187
permalink: /microsoft-cognitive-service-for-text-analysis-vs-google-natural-language-service/
categories:
  - .NET
  - Azure
  - 'C#'
  - Cloud
  - Cognitive Services
  - Google Cloud
  - Machine Learning
tags:
  - AI
  - azure
  - Cognitive Services
  - Google Cloud
  - Machine Learning
  - Text Analytics
---
# Start up

I am trying to evaluate a number of service offering in the context of natural language processing, my starting point here is to compare Microsoft Text Analytics service with its Google counterpart (Google Natural Language service). This post is the first of a series that would cover natural language processing from multiple cloud providers. 

# Microsoft Cognitive Service & Text Analytics

Microsoft Azure offers a number pre-baked services that could help developers and organisation with anything related to recognising images, classifying, or analysing text. The one we are interested in here is the Azure <a href="https://azure.microsoft.com/en-us/services/cognitive-services/text-analytics/" target="_blank">Text Analytics service</a>, which is currently in Preview. This service offer the following apis: 

  * Detect Language
  * Key Phrases
  * Sentiment

A full list of the apis and an interactive demo can be found on the MSDN website <a href="https://westus.dev.cognitive.microsoft.com/docs/services/TextAnalytics.V2.0/operations/56f30ceeeda5650db055a3c7" target="_blank">here</a>

# Google Natural Language

Google <a href="https://cloud.google.com/natural-language/docs/reference/rest/" target="_blank">Natural Language service</a> is very similar to Microsoft Azure&#8217;s offering, but seems to be more mature. The list of apis includes: 

  * Detect Entities
  * Detect Sentiment
  * Entity Sentiment
  * Analyse Syntax
  * Annotate Text

# Implementation

I am trying to evaluate the services using varying data sources and volumes, so I thought of building one Api that would call both services to analyze the data and give me back the summary of responses from all services. Thus, I created a simple web api app that takes text in any format, send it over to Google and Microsoft services, then display the results. 

For Microsoft Azure service, there does not seem to be any official Nuget package, so I ended up calling the RESTful apis directly. It&#8217;s quite simple, and a sample code can be seen below: 

<pre class="brush: csharp; title: ; notranslate" title="">// Microsoft implementation. The payload (dto) objects were implemented as per the docs here: https://westus.dev.cognitive.microsoft.com/docs/services/TextAnalytics.V2.0/operations/56f30ceeeda5650db055a3c7
    using (var client = new HttpClient())
    {
        var payload = new MicrosoftSentimentAnalysisPayload(new List&lt;MicrosoftSentimetAnalysisDocument&gt; { new MicrosoftSentimetAnalysisDocument(request.Input) });
        var serialisedPayload = JsonConvert.SerializeObject(payload);
                
        // sentiment analysis
        var response = await PostHttpRequestToMsServiceAndReturnResult(request, client, MicrosoftCognitiveServicesConstants.SentimentApiUrlSuffix, serialisedPayload);
        var sentimentResponse = JsonConvert.DeserializeObject&lt;MicrosoftSentimentAnalysisResult&gt;(response);

        // keyPhrases analysis
        var keyPhrasesResponse = await PostHttpRequestToMsServiceAndReturnResult(request, client, MicrosoftCognitiveServicesConstants.KeyPhrasesApiUrlSuffix, serialisedPayload);
        var keyPhrases = JsonConvert.DeserializeObject&lt;MicrosoftKeyPhrasesAnalysisResponseDto&gt;(keyPhrasesResponse);
    }
</pre>

Ironically, Google has already baked a nice support library and its available on nuget :). The library I used is <a href="https://www.nuget.org/packages/Google.Cloud.Language.V1/" target="_blank">Google.Cloud.Language.V1</a>. Note that the library is in Beta, so you would have to tick the box in nuget before you can see it in your search. The Google cloud team also have another Google Cloud Language nuget package but that one is more experimental, so they are using it for pushing more prototypes rather than production-ready code. The experimental nuget package can be found <a href="https://www.nuget.org/packages/Google.Cloud.Language.V1.Experimental/" target="_blank">here</a>.
  
Once the package installed the sample code is very simple as below. 

<pre class="brush: csharp; title: ; notranslate" title="">// calling google cloud natural language service
    LanguageServiceClient client = LanguageServiceClient.Create();
    Document document = Document.FromPlainText(message.Input); 
    var response = await client.AnalyzeSentimentAsync(document);
    var syntaxResult = await client.AnalyzeSyntaxAsync(document);
</pre>

One thing to remember is to add the file path of your Google Auth service account (json file) in your Environment Variables. I added it in the project settings as you can see below. 

<img src="https://i1.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2017/08/env-variable-for-google-cloud-natural-language-service-auth.png?resize=300%2C222&#038;ssl=1" alt="Environment variable for Google Cloud Natural Language service auth" width="300" height="222" class="alignnone size-medium wp-image-4189" srcset="https://i1.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2017/08/env-variable-for-google-cloud-natural-language-service-auth.png?resize=300%2C222&ssl=1 300w, https://i1.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2017/08/env-variable-for-google-cloud-natural-language-service-auth.png?resize=768%2C568&ssl=1 768w, https://i1.wp.com/www.hasaltaiar.com.au/wp-content/uploads/2017/08/env-variable-for-google-cloud-natural-language-service-auth.png?w=842&ssl=1 842w" sizes="(max-width: 300px) 100vw, 300px" data-recalc-dims="1" />

# Evaluation

For the evaluation, I have collected lots of data from product reviews, hotel reviews, news articles, economic reports, etc. In this post, I will show the hotel reviews and the news article. 

## Hotel Reviews

I am using these hotel review that we found online. Here we have the review, the rating that the user given to that hotel, and Google and Azure service responses: 

<table>
  <tr>
    <th rowspan="2">
      Star Rating
    </th>
    
    <th rowspan="2">
      Review Text
    </th>
    
    <th colspan="2">
      Microsoft Response
    </th>
    
    <th colspan="2">
      Google Response
    </th>
  </tr>
  
  <tr>
    <th>
      Score (0 to 1)
    </th>
    
    <th>
      Key Phrases
    </th>
    
    <th>
      Score (-1 to 1)
    </th>
    
    <th>
      Magnitude
    </th>
  </tr>
  
  <tr>
    <td>
      4
    </td>
    
    <td>
      Travelled solo. I have been in this hotel twice since last year for my business trips. Good for me as they have safety solutions, room service, kitchen stuff, balcony and the location is perfect. However, the wifi connection is quite weak, could hardly be reached on the 4th floor.
    </td>
    
    <td>
      0.997
    </td>
    
    <td>
      kitchen stuff, balcony, room service, safety solutions, location, year, wifi connection, business trips
    </td>
    
    <td>
      0.100
    </td>
    
    <td>
      1.899
    </td>
  </tr>
  
  <tr>
    <td>
      2
    </td>
    
    <td>
      Travelled Solo. Stayed in a 2 bedroom apartment. Very small. It not cleaned much at all. The walls were dirty and the mattress had a dirty stain on it which could be clearly seen through the sheet.Â There was also an opened packet of maltesers still on the bench from the previous guests. Definitely wont stay here again.
    </td>
    
    <td>
      0.00002
    </td>
    
    <td>
      dirty stain, bench, mattress, opened packet of maltesers, previous guests, walls&#8221;, bedroom apartment, wont stay, sheet
    </td>
    
    <td>
      -0.2000
    </td>
    
    <td>
      2.2999
    </td>
  </tr>
  
  <tr>
    <td>
      3
    </td>
    
    <td>
      Travelled as a couple. This was our second stay at the star gate, I have to admit not as good as the first visit, I didn&#8217;t realise all the appartments are not the same this one was much smaller than the first, but let me say still on par with other places we have stayed at, it was facing the street so s bit noisy during the day but quiet through the night, the room was clean with a small fridge and microwave, with a small but ample supply of plates and utensils, the staff are as the first time helpful and friendly, all in all I was a bit disappointed in the stay this time but only because I was spoiled the first time! But I was told I could request the room we had on our first trip so I&#8217;m sure it will not be the last stay we have at the star gate.
    </td>
    
    <td>
      0.1184
    </td>
    
    <td>
      stay, room, time helpful, star gate, small fridge, microwave, ample supply of plates, day, utensils, night, staff, street, trip, visit, places, couple, appartments
    </td>
    
    <td>
      0.1000
    </td>
    
    <td>
      0.3000
    </td>
  </tr></table> 
  
  <p>
    Things to note here:
  </p>
  
  <ol>
    <li>
      Google Sentiment Score is a number that range between -1 and 1, which represent the sentiment of the text as detected by Google Cloud. The response from Google also includes Magnitude, which is an positive integer to show the strength of the detected sentiment
    </li>
    <li>
      Microsoft Azure gives a sentiment score that ranges from 0 to 1. Azure does not offer Magnitude value for the sentiment.
    </li>
    <li>
      Azure is also giving us the Key Phrases in the text that we are passing. This is good to find out the themes, or the main topics of a piece of text. Note that Azure had an api that was call Detect Topics that would do just that, but it was deprecated earlier this month.
    </li>
    <li>
      Using Google&#8217;s syntax analysis api, I was not able to get the key phrases, but what it gave me was the breakdown of the paragraph or documents into smaller sentences. I found this to be very useful as sometimes you would have a large document (say a news article) and giving it all at once to the ML algorithm could mess up with the result. I might try the other apis from Google like analyse entities in a future blog post
    </li>
  </ol>
  
  <p>
    As you can see, Google and Azure both detected the sentiment well most of the time. The accuracy goes up when the rating is closer to the edges (1 or 5 stars). Also note that the key phrases here was not as helpful.
  </p>
  
  <h2>
    News Articles
  </h2>
  
  <p>
    Natural language processing is fascinating because it is not just what the person says, there is a lot that is inferred in the context. Thus, I wanted to see how the services would perform in other forms of speech, so I chose a paragraph from a news article. Here is the results:
  </p>
  
  <table>
    <tr>
      <th rowspan="2">
        Paragraph
      </th>
      
      <th colspan="2">
        Microsoft Response
      </th>
      
      <th colspan="2">
        Google Response
      </th>
    </tr>
    
    <tr>
      <th>
        Score (0 to 1)
      </th>
      
      <th>
        Key Phrases
      </th>
      
      <th>
        Score (-1 to 1)
      </th>
      
      <th>
        Magnitude
      </th>
    </tr>
    
    <tr>
      <td>
        Australia&#8217;s unemployment rate is already stubbornly high at 5.7 per cent (around a percentage point above the US) and if none of those 40,000 auto-related workers found new jobs it would rise back above 6 per cent.
      </td>
      
      <td>
        0.0310
      </td>
      
      <td>
        related workers, new jobs, Australia&#8217;s unemployment rate, percentage point
      </td>
      
      <td>
      </td>
      
      <td>
      </td>
    </tr>
  </table>
  
  <p>
    Interestingly, both Azure and Google Cloud sentimental analysis accuracy went terribly down in this case. Azure did try to give a score, although not accurate. However Google Cloud returned 0 for both sentiment and magnitude, which is odd.<br /> On the other hand, the key phrases returned from Azure are more relevant.
  </p>
  
  <h1>
    Conclusions
  </h1>
  
  <p>
    Natural language processing is a very complex and fascinating subject. From what I have seen, you cannot just take a service from any vendor and just use it out of the box. All the services I have reviewed so far have accuracy issues. The tricky part is finding the sweet spot by evaluating varying data sources and massaging the data before feeding it to the algorithm. In the next blog post, I will do that and review some of the other available services from IBM and Amazon.
  </p>
