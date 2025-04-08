---
layout: default
title: Research
---

## AqQua Objectives
- Bring together and harmonise ~ 3 billion images from a variety of pelagic imaging modalities and a global network of research groups.
- Build a foundational model of pelagic image data that disrupts the state of the art in downstream species classification and associated novelty detection, trait extraction, and particulate organic carbon quantification.
- Cater a large-scale platform service to a user community of stakeholders from all over the world by rolling out models as easy-to-use resource-efficient tools. Ensure sustained methodological advances via an open competition in the core computer vision community.
- Exploit and expand models in combination with environmental- and satellite data to generate temporally resolved, local to global species distribution maps, ecosystem health indicators, and assessments of the carbon uptake- and export potential of aquatic food webs.

Success will be measurable in terms of performance across downstream tasks, pickup of models, tools and global distribution estimates by the domain- and computer vision communities, earth system modelling community, industry, water authorities, political stakeholders and decision makers, federal state agencies, UNESCO and UN, as well as citizen scientists. Fulfilment of these objectives will enable a leap in our understanding of marine and freshwater ecosystems through operational global monitoring of aquatic life, catalyse development of safeguarding measures and improve human well-being in the face of climate change.<br>

## Challenges
A number of challenges lie ahead towards establishing and exploiting such a model. 
- Data from a variety of modalities and a large community of research groups in Helmholtz and the world has to be brought together and harmonised. 
- Unique aspects of pelagic image data require methodological advances over established self-supervised learning workflows. 
- Fine-tuned models need to be distilled into resource-efficient tools along with a well-orchestrated roll-out to the best benefit of a diverse global user community. 
- The model needs to be embedded into a compositional system that integrates orthogonal data sources and models for comprehensive global predictions.

AqQua brings together the essential interdisciplinary expertises and track records in core AI, HPC, Pelagic Imaging, Plankton Biogeochemistry and Ecosystem Analysis and Modeling as well as the overwhelming support of the global community to tackle these challenges. 

## Approach
We have identified three billion pelagic images accessible for our project, with high diversity across modalities and geolocations. A significant fraction of the data originates from four Helmholtz Centers, complemented by vast contributions from the global community. Members will contribute data to, but will also be primary beneficiaries of AqQua. Project members will work closely with Helmholtz Imaging, Helmholtz AI and HIFIS, the Helmholtz DataHub and Helmholtz Coastal Data Centre. AqQua is further supported by more than 40 international partners from research institutions, developers and companies including manufacturers of state-of-the-art imaging systems. Our extensive previous work and interdisciplinary expertise allows us to yield a highly diverse and AI-ready dataset. 

The inherent scarcity of the available labels and the distinct information content of pelagic imaging compared to standard computer vision data, calls for a dedicated, large-scale, domain-specific self-supervised learning (SSL) approach. There is huge potential for innovation by harmonising and leveraging the vast amounts of all available data for large-scale training, i.e., Foundation Model. Such a model will establish consistency and generalisation across imaging systems and geolocations at likely disruptive downstream performance, particularly in generalization scenarios.

AqQua’s core computational module will be a vision transformer (ViT, Dosovitskiy et al. 2021) trained on massive unlabeled data based on state-of-the-art self-supervised learning paradigms. We will extend and adapt the underlying methodology to pelagic images and metadata to develop and train a highly performant domain-specific foundation model. We expect AqQua to exceed previous trait extraction and POC quantification performance in the face of scarce annotations, and disruptively boost zero-shot down-stream performance on new modalities and geolocations.

In-depth assessment of AqQua’s embedding space structure and respective loss impact will contribute an advanced understanding of self-supervised learning paradigms and their learnt knowledge, catalysing related method development. We will explore further advances towards highly multimodal integrative architectures and training paradigms, aiming at a compositional model that comprises orthogonal sources such as remote sensing, environmental and occurrence data.

## Expected Outcome
Current assessments of global marine carbon export remain widely divergent with a range as large as the present annual anthropogenic CO2 emission rate, and estimates mostly represent averages of multi-annual to multi-decadal data. Abundance of most planktonic species is unknown and not monitored to date. AqQua will yield global distribution estimates of carbon export and plankton diversity at unprecedented spatial and temporal scales. Such maps will not only progress to the scientific understanding, but will serve political stakeholders and decision makers in the face of emerging carbon removal techniques. We envision that AqQua will be key to enabling operational pelagic imaging, to yield global budgets of carbon export flux and plankton distribution at annual to monthly scales and their potential changes in light of climate change.
AqQua’s impact is propelled by our Open Science approach, which will democratise access to massive datasets and large-scale models, making scientific exploration accessible and affordable also for small, specialised domain research groups, also in developing countries. Our cross-platform models rolled out as easy-to-use tools will benefit the entire domain community as well as non-scientific stakeholders like e.g. federal state water monitoring programmes.

The AI community will advance through our in-depth studies of embedding space structure in the face of well-categorised properties of training data distribution, as well as through our extended multi-modal modelling efforts. Our dataset and source code itself will be invaluable for generating and benchmarking algorithmic improvements. 
