---
layout: default
title: FAQs
filename: faq
permalink: /faq/
---
If your question is not answered here, please don’t hesitate to contact us: aqqua@geomar.de

<details>
<summary><strong>What kind of data are you looking for?</strong></summary>
We’re gathering images of marine and freshwater zooplankton and phytoplankton. All kinds of labels/identification are welcome but optional, as we’re using self-supervised learning for training our foundational model, which does not require labels.
</details>

<details>
<summary><strong>I have millions of images, do you want them all?</strong></summary>
Yes, we try to gather all existing plankton images, as the foundation model requires as much image data from diverse regions and imaging devices as possible.
</details>

<details>
<summary><strong>What is a foundation model?</strong></summary>
A foundation model is a machine-learning model trained at scale, usually with self-supervised methods on broad, multimodal data, that can be adapted to carry out diverse downstream tasks <a href="https://arxiv.org/abs/2108.07258">Bommassani et al. 2022</a>. AqQua is a foundational model for plankton computer vision that will be trained using state of the art vision transformers on billions of plankton images from diverse imaging devices. This model will be fine-tuned for the downstream tasks of plankton identification, classification, trait detection, outlier detection and global interpolation of plankton distribution.
</details>

<details>
<summary><strong>My data is on EcoTaxa, how can I share it with you?</strong></summary> 
Please fill in the <a href="https://survey.hifis.dkfz.de/398984?lang=en">Data Sharing Form</a> and also provide view access to the aqqua@geomar.de user on EcoTaxa. This enables us to download your data. We will inform you once we have downloaded your data, so that you can revoke access, if you would like to.
</details>

<details>
<summary><strong>I have many projects on EcoTaxa that I would like to share. Is there something quicker than adding the AqQua user manually?</strong></summary>
You can download these <a href="https://codebase.helmholtz.cloud/aqqua-public/ecotaxa-tools">Python scripts</a> that use the EcoTaxa API to generate a list of your EcoTaxa projects. You can at any time, should you wish to, change the access rights for multiple projects in bulk via the EcoTaxa API.
</details>

<details>
<summary><strong>My data is not on EcoTaxa, what now?</strong></summary>
If you use web hosting services (AZURE, GLOBUS, ...), you can share your dataset via these. We also can download image data from IFCB dashboards. You could also send us a harddrive. Other options (e.g. FTP, ...) would also be possible. Please inform us about your preferred method via the <a href="https://survey.hifis.dkfz.de/398984?lang=en">Data Sharing Form</a>.
</details>

<details>
<summary><strong>How is AqQua funded?</strong></summary>
AqQua is funded via the <a href="https://hfmi.helmholtz.de">Helmholtz Foundation Model Initiative</a>. It is a one-shot endeavour to collect the data and build the foundation model. The project is funded for three years. 
</details>

<details>
<summary><strong>What will happen to the data that is shared with you?</strong></summary>
We will build the AqQua Dataset by bringing together data from thousands of individual sources, a suite of different imaging devices, and from across diverse habitats. The AqQua Dataset will be published under an open-access license earliest in July 2027. Every data contribution will be duly acknowledged and every data contributor will be co-author on a joint dataset paper.
Using the AqQua Dataset, we will train a foundational model and fine-tune it for multiple downstream tasks, including classification, trait extraction, and global interpolation of plankton and particle distribution. The developed code, models, and tools will be made open source and shared with the plankton imaging community to help with plankton image recognition tasks and to support further method development. For example, this could include contributing a generalist image recognition model to EcoTaxa.
</details>

<details>
<summary><strong>How will global interpolation work in detail?</strong></summary>
You can explicitly choose if you would like to share your data for global interpolation studies within AqQua. We will then also need the volume sampled per image acquisition. We will used boosted regression trees and possibly other machine learning algorithms to learn the global plankton or particle distribution and associated process rates from the AqQua image data. Please see <a href="https://www.frontiersin.org/journals/marine-science/articles/10.3389/fmars.2022.894372/full">Drago et al. 2020</a> and Clements et al. (<a href="https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2021GB007276">2022</a>, <a href="https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2022GB007633">2023</a>) for further details. 
</details>

<details>
<summary><strong>What do I gain from sharing data with you?</strong></summary>
By sharing data with us for model development, you contribute to the diversity of the AqQua dataset and increase the chances that the developed model will be particularly useful to the kind of data that you are working with. Every data contributor will be co-author on a joint dataset paper and invited to contribute to further publications.
</details>

<details>
<summary><strong>Can I only contribute data with validated annotations?</strong></summary>
All kinds of labels/identification are welcome but optional, as we’re using self-supervised learning for training our foundational model, which does not require labels.
</details>

<details>
<summary><strong>Although I am the contact person of a project, it is not my decision to make if the data can be shared. How do I proceed?</strong></summary>
  <p>
    You don’t have to make the decision yourself. Check with the principal investigator, data owner, or other relevant stakeholders before proceeding. Then, let us know.<br>
    Also, if your data is hosted on EcoTaxa, please make sure that you are correctly listed as the contact person of a project. If not, select the correct person in the EcoTaxa project settings:
    <ul>
      <li>In the menu, select “Project / Edit project settings”.</li>
      <li>In the “Priviliges” tab, select the correct person as contact.</li>
    </ul>
  </p>
</details>