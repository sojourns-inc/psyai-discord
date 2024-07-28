# Credit

This code is a fork of [DoseBot](https://github.com/dosebotredux/DosebotRedux). I take credit for essentially nothing except `ask.ts`, `info.ts`, `/queries` and some stuff in the `/include` directory. The rest is their work. We're on the shoulders of giants. <3

Some of the text below is copied verbatim from DoseBot's README.md.

---

**PsyAI** is a harm reduction Discord bot, used to provide users with a variety of useful harm reduction information from [PsychonautWiki](https://www.psychonautwiki.org) and effect information from [Effect Index](https://www.effectindex.com).

# How does PsyAI work?
PsyAI uses **retrieval-augmented generation** (RAG), a powerful technique that enhances my ability to provide *accurate* and *consistent* information. This approach combines the strengths of information retrieval and natural language generation to ensure that responses are both contextually relevant and factually correct. Here’s how it works and how it helps me answer questions referencing data from sources like PsychonautWiki (and others).
## DISCLAIMER:
PsyAI is =NOT= affiliated with Psychonautwiki.org or any of its current admins. It was co-crated by [Josie Kins](https://josiekins.xyz) (original founder of PsychonautWiki) and myself (AKA `sernyl` on Discord, `sernylan` on Telegram, `alevkov` on Github.
## STEP 1: Information Retrieval
When you ask a question, the first step involves **retrieving** relevant documents or pieces of information from a pre-existing database or context. This retrieval process ensures that the most **pertinent data** is selected based on the query. For instance, if you ask about the subjective effects of a particular psychoactive substance, I can pull detailed descriptions and data from a comprehensive database that includes:
- user experiences, 
- scientific research, and...  
- harm reduction practices.
## STEP 2: Natural Language Generation
Once the relevant information is retrieved, the next step is to generate a coherent and contextually appropriate response. This involves synthesizing the retrieved data into a natural language format that is **easy to understand**. The generation process ensures that the response is not just a verbatim copy of the retrieved information but is tailored to answer the *specific* question effectively.
## How PsyAI References Data from Tripsit.me, Effectindex.com, PsychonautWiki.org, etc.
When it comes to referencing data from sources like PsychonautWiki, the retrieval-augmented generation process allows me to pull specific details from the extensive content collection available. This includes:
- scientific research, 
- harm reduction practices, and 
- subjective effects indexes. 
By accessing this rich repository of information, I can provide detailed and accurate answers to your questions about psychoactive substances, their effects, and safe practices.
## An Example
For instance, if you were to ask about the effects of a particular hallucinogen, I could retrieve detailed descriptions from Tripsit.me, PiHKAL, etc. available in the database. I would then generate a response that incorporates this information, providing you with a comprehensive overview of the substance’s effects, potential risks, and harm reduction strategies.
## Ensuring Accuracy Over Time
The retrieval-augmented generation approach also allows for **continuous improvement**. As new information is added to the database, the retrieval process can access this updated data, ensuring that the responses remain **current and accurate**. This dynamic nature of RAG ensures that the information provided evolves with the latest scientific findings and user experiences.

In summary, retrieval-augmented generation helps me produce accurate and consistent information by combining the strengths of information retrieval and natural language generation. This approach ensures that I can reference detailed and reliable data from sources like PsychonautWiki, providing you with well-informed and contextually relevant answers.

:purple_heart:

## Message content restriction

Beginning September 1, 2022, Discord has restricted access to message content for verified bots, meaning the main PsyAI instance is no longer able to execute v1 commands. I'll be porting all remaining v1 commands to the v2 system as I have spare time. Pull requests are welcome.

## Features

- Substance harm reduction information
- Combination safety information
- Role management system
- Effect information
- Tolerance calculators
- And more! Say `--help` for the full command list.

### In memoriam

DoseBot is a separate project, and is maintained in memory of Cocoa, 1995 - 2019. Cocoa was the creator of the original DoseBot. This implementation builds on Cocoa's work, and lives in a new repo: [PsyAI](https://github.com/sojourns-inc/PsyAI).
