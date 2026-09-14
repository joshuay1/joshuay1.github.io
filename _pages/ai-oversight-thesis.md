---
layout: page
title: "AI oversight with Apertus"
permalink: /ai-oversight-thesis/
description: "Work on AI oversight through LLM engineering or research in AI safety, security and governance. Open to students and research collaborators."
nav: false
---

<div class="thesis-intro" markdown="1">
<p class="thesis-eyebrow">Research opportunities · ETH Zurich &amp; EPFL · MIT collaboration</p>

**Interested in building AI systems that help us keep other AI systems accountable?**

I’m looking for students and collaborators to work with me and **Prof. Michiel Bakker at MIT** on AI oversight, starting with **Apertus**. This could be your master’s thesis, or a research project we build and publish papers on together.

<a class="thesis-button" href="mailto:joshyang@mit.edu?cc=bakker%40mit.edu&amp;subject=AI%20oversight%20with%20Apertus">Let’s talk about the project</a>

</div>

## What’s the idea?

As AI agents take on more work, how do we check what they actually did? Imagine a lab says its deployed model passed the required evaluations. Can an outside reviewer follow the records and verify that claim? What if some logs are missing, or the deployed model is a different checkpoint?

We want to build tools that help people investigate agent behaviour, find missing evidence and check whether AI developers are keeping their commitments. The longer-term goal is meaningful independent oversight, including when sensitive information needs to stay inside a lab.

This is already a practical problem. [METR’s investigation of an agent incident](https://metr.org/blog/2026-08-26-openai-hugging-face-incident-investigation/) describes how hard it was to check large volumes of AI-generated analysis. Anthropic’s September 2026 [commitment to embedded evaluators](https://darioamodei.com/post/we-must-pace-the-frontier) makes the question especially timely: even with access, how does a small team keep up?

## Why Apertus and Switzerland?

[Apertus](https://www.apertus-ai.org/) is the open language-model effort from ETH Zurich, EPFL and CSCS. It gives us a concrete setting for studying model evaluation and development workflows.

For the engineering work, I’m especially keen to work with students and collaborators based at ETH Zurich or EPFL who can connect this research with the Swiss AI community. We would start with public Apertus artifacts and experiments we can run ourselves, then explore work with Apertus contributors where suitable access can be arranged. Broader research collaborators can be based elsewhere.

## What you could work on

We’ll pick one focused question together. For example:

- **Find missing evidence:** connect agent transcripts with job records to identify missing runs or incomplete logs.
- **Investigate agent behaviour:** search across traces to check a claim, such as whether an agent continued after a stop instruction, and show the evidence behind the answer.
- **Check an evaluation workflow:** connect checkpoint IDs, evaluation results and release records to verify that the right model was evaluated before a handoff.

You would build a working system and test it against sensible baselines. We care about whether it catches real problems, avoids false accusations and saves reviewers time. There is already research code and a literature collection to build on.

## How you could contribute

**Engineering:** help build and test the systems, as a student or collaborator interested in hands-on work. You should be comfortable with:

- **Python, PyTorch and Hugging Face**, including loading model checkpoints, running inference and building evaluation pipelines.
- **Linux, GPUs and cluster workflows**, including submitting and debugging Slurm jobs, managing environments and dealing with GPU memory limits.
- **Reproducible experiments**, including Git, logging, experiment tracking and analysing results across models or configurations.

Experience with agent frameworks, large trace datasets, distributed inference or fine-tuning would also be useful.

**Research collaboration:** bring experience in **AI safety, security or governance** to help shape what we audit, how we judge the evidence and how these tools could support independent oversight in practice. You don’t need hands-on LLM or GPU experience for this. We could develop research questions, design studies and work towards papers together.

## Interested? Get in touch

Email **[joshyang@mit.edu](mailto:joshyang@mit.edu?cc=bakker%40mit.edu&subject=AI%20oversight%20with%20Apertus)** and **CC Prof. Michiel Bakker at [bakker@mit.edu](mailto:bakker@mit.edu)**. Tell us a little about your background, how you’d like to contribute and when you could start. A CV or a link to relevant code, research or writing would help.

**If you’re looking for a master’s thesis**, let’s discuss the project first. We can then look for an ETH Zurich or EPFL professor willing to supervise locally and help set up the collaboration, with MIT co-supervision.

**You don’t need to be looking for a thesis.** If you want to contribute to the project and work towards papers together, I’d be happy to hear from you too.

<p class="thesis-context-date">Updated 14 September 2026.</p>
<p class="thesis-back-link"><a href="{{ '/' | relative_url }}">← Back to Josh’s homepage</a></p>
