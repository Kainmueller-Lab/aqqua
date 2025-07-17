---
layout: default
title: Data Collection - FAQ
---

# Data Collection - FAQ

If your question is not answered here, please don't hesitate to contact us: [aqqua@geomar.de](mailto:aqqua@geomar.de)

- **What kind of data are you looking for?**
    We're gathering images of marine and freshwater zooplankton and phytoplankton.
    All kinds of labels/identification are welcome but optional, as we're using self-supervised learning for training our foundational model, which does not require labels.

- **Although I am the contact person of a project, it is not my decision to make if the data can be shared.**
    You don't have to make the decision yourself. Check with the principal investigator, data owner, or other relevant stakeholders before proceeding. Then, let us know.

    Also, if your data is hosted on EcoTaxa, please make sure that you are correctly listed as the contact person of a project. If not, select the correct person in the EcoTaxa project settings:

  - In the menu, select "Project / Edit project settings".
  - In the "Priviliges" tab, select the correct person as contact.
  - Click "Save".

- **What will happen to the data that is shared with you?**
    We will build the AqQua Dataset by bringing together data from thousands of individual sources, a suite of different imaging devices, and from across diverse habitats.
    The AqQua Dataset will be published under an open-access license.
    Every data contribution will be duly acknowledged and every data contributor will be co-author on a joint dataset paper.

    Using the AqQua Dataset, we will train a foundational model and fine-tune it for multiple downstream tasks, including classification, trait extraction, and particulate organic carbon (POC) estimation.
    The developed code, models, and tools will be made open source and shared with the plankton imaging community to help with plankton image recognition tasks and to support further method development.
    For example, this could include contributing a generalist image recognition model to EcoTaxa.

- **What do I gain from sharing data with you?**
    By sharing data with us for model development, you contribute to the diversity of the AqQua dataset and increase the chances that the developed model will be particularly useful to the kind of data that *you* are working with. Every data contributor will be co-author on a joint dataset paper and invited to contribute to further publications.

- **Can I only contribute data with validated annotations?**
    All kinds of labels/identification are welcome but optional, as we're using self-supervised learning for training our foundational model, which does not require labels.

- **How can I give you access to projects?**
    This depends on where your projects are currently located. Please fill in our **[data collection form]({{ 'data_collection' | relative_url }})**. We will support you in this process!

- **I have more than just a couple of projects that I would like to share. Is there something quicker than adding the AqQua user manually?**
    We can provide you with a Python script that uses the EcoTaxa API to update the privileges of selected projects. Get in touch with us at <aqqua@geomar.de> to learn about the details.
