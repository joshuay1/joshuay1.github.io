---
layout: publication
title: "LLM Voting: Human Choices and AI Collective Decision Making"
description: "A study of how large language models behave in voting and collective decision-making settings compared with human choices."
bibkey: yang2024llm
keywords: "LLM voting, collective decision making, AI ethics, democratic processes, human-AI alignment"
---

### The Problem

LLMs are increasingly discussed as assistants, advisors, and even proxy participants in democratic processes. But if an LLM can cast a vote, that does not mean it represents a human voter. It may be sensitive to prompt wording, ballot order, model defaults, temperature, or persona construction.

This paper asks a concrete question: when LLMs are placed in a participatory budgeting task, how closely do their votes resemble human votes, and where do they systematically diverge?

### What The Study Did

The experiment replays a real participatory budgeting task with 24 projects and a CHF 60,000 budget framing. The human baseline comes from 180 Zurich university students. The authors then prompt matching LLM electorates using GPT-4 Turbo and LLaMA-2.

The study varies:

- Voting input method: approval, 5-approval, cumulative, and ranked.
- Presentation: original order, reversed order, and reversed numeric IDs.
- Persona prompting: constructed from participant preference data.
- Chain-of-thought style reflection.
- Temperature settings.

The comparison separates aggregate outcomes, individual vote overlap, and preference diversity using Kendall tau, Jaccard similarity, and Jaccard distance.

### What The Paper Finds

LLM voting is mechanism-sensitive. Changing the voting rule or the presentation order can shift collective outcomes even when the underlying project set is unchanged.

Personas can improve alignment with human votes, but they are not neutral. They may compress diversity, overfit to the provided profile, or make the simulated electorate easier to steer.

Chain-of-thought prompting does not solve the alignment problem. It can make an explanation more readable, but in this study it did not reliably make LLM votes closer to human votes.

Temperature behaves like a normative design parameter. Higher temperature can increase diversity among LLM voters, but that diversity may trade off against human alignment and coherence.

### Why It Matters

The paper is not saying that LLMs should never be used in democratic workflows. It is saying they should not be treated as drop-in voters or faithful digital twins.

If LLM voting is sensitive to ballot order, label order, temperature, and persona design, then the prompt and interface become political infrastructure. Whoever controls those settings may shape the outcome.

### Limitations To Read Carefully

The human baseline is a university-student sample in one participatory budgeting task. That makes the benchmark concrete, but not universal.

The study also highlights a tension: predicting how humans vote is different from designing a legitimate democratic system. High similarity to one sample is not the same thing as fair representation.
