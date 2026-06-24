---
layout: publication
title: "Belief Engine: Configurable and Inspectable Stance Dynamics in Multi-Agent LLM Deliberation"
description: "An auditable belief-update layer for multi-agent LLM deliberation, with structured memory and configurable stance dynamics."
bibkey: yang2026belief
keywords: "multi-agent LLM deliberation, belief dynamics, stance updating, social simulation, deliberation"
---

### The Problem

Most multi-agent LLM deliberation systems produce transcripts that look socially plausible, but the internal reason for a stance shift is hard to inspect. Did the agent change because it heard stronger evidence, because recent text dominated the prompt, because its persona drifted, or because the base model carried a hidden bias?

The deeper issue is that ordinary LLM agents do not really have a durable core. They can sound confident in one turn, drift in the next, or "change their mind" without any clear account of what convinced them. Belief Engine gives an agent a maintained stance: something stable enough to make the agent coherent, but flexible enough to be updated by evidence.

That makes opinion change more human-like in the important sense: the agent can start somewhere, listen, be persuaded, resist weak arguments, and explain the path from its earlier position to its later one.

### What The System Does

Belief Engine runs a five-step loop:

1. Extract arguments from incoming messages.
2. Judge their polarity and evidential strength.
3. Store active and archived claims in structured memory.
4. Update a maintained stance using evidence uptake and prior anchoring.
5. Compose the next response from stance, memory, and recent dialogue.

The key design choice is that stance is not hidden inside a prompt. It is maintained explicitly, with an audit trail of the claims that moved it. This gives the agent something like a deliberative core rather than a loose stream of plausible responses.

### What The Paper Finds

In generated 15-round debates, the two parameters behave as intended across multiple model backends. Raising evidence uptake makes agents more responsive to later arguments; raising prior anchoring makes them hold more strongly to the initial position.

The paper also validates that this internal stance is visible in generated language: an external judge's score of the generated text correlates strongly with the assigned stance (r = 0.967).

The most interesting result comes from replaying 2,495 human DEBATE trajectories. Belief Engine improves pooled final-stance reconstruction over no-change and net-evidence baselines, but the larger lesson is heterogeneity: stable participants, evidence-aligned movers, and evidence-opposed movers require different update profiles.

### Why It Matters

For civic simulation, educational debate, negotiation agents, and deliberation research, "the model said something plausible" is not enough. The system should expose what it treated as evidence, how much that evidence mattered, and how strongly prior commitments persisted.

Belief Engine is useful because it turns those assumptions into explicit research objects. A future civic simulation can be asked not only what agents concluded, but what update rule made them get there.

### Limitations To Read Carefully

The current representation is intentionally narrow: one scalar stance over one proposition. That makes the system inspectable, but it cannot fully capture multidimensional political positions, values, trust, strategic behavior, or sub-issue movement.

The evidence pipeline also depends on argument extraction and quality scoring. Making those steps explicit is a major improvement, but it does not make them automatically neutral.
