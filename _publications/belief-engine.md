---
layout: publication
title: "Belief Engine: Making Agent Stance Auditable in LLM Deliberation"
description: "Accepted at NeurIPS 2026. Belief Engine makes LLM agent stance auditable through structured evidence, memory, and configurable log-odds updates."
bibkey: yang2026belief
keywords: "multi-agent LLM deliberation, belief dynamics, stance updating, social simulation, deliberation"
---

## The Problem

An LLM agent can appear to change its position because it accepts evidence, echoes an interaction partner, drifts from its assigned role, or receives a different prompt or retrieved context. A plausible transcript alone does not distinguish these explanations.

Belief Engine makes one part of this process explicit: a maintained evidential state over a proposition, exposed as a scalar stance. Here, "belief" has a Bayesian modelling meaning. It is a state computed by the system, rather than a claim about an LLM's private beliefs or human cognition.

## What The System Does

Belief Engine runs a five-step loop:

1. Extract arguments from incoming messages.
2. Judge their polarity and evidential strength.
3. Consolidate claims in structured memory, retaining active and archived records.
4. Compute the belief state in log-odds space and expose it as a stance.
5. Generate the next response from that stance, retrieved memory, and recent dialogue.

Two controls determine how evidence contributes: **evidence uptake (u)** weights later arguments, while **prior anchoring (a)** weights the initial commitment. In the active-record mode illustrated below, archived arguments remain available for audit but no longer contribute to the stance calculation.

<figure>
  <img src="{{ '/assets/img/publication_figures/belief-engine-architecture.png' | relative_url }}" alt="Incoming messages become scored claims in structured memory. Evidence uptake weights later arguments and prior anchoring weights seed arguments. Active evidence determines a scalar stance used with memory and dialogue to generate a reply." loading="lazy">
  <figcaption>Figure 1. The camera-ready Belief Engine architecture. The update rule computes stance outside the language model, preserving a record of the evidence and settings behind each update.</figcaption>
</figure>

## What The Paper Finds

**Configurable stance dynamics.** Across multiple LLMs, higher evidence uptake increases responsiveness to new arguments, while stronger prior anchoring preserves the initial stance. Generated debates run for 15 rounds.

**Closer expressed positions under the tested protocol.** In 150 debates across five topics, a shared external judge scores a mean final stance gap of 0.53 for BE, compared with 1.12 for prompt self-updating and 1.02 for retrieval-augmented self-updating. These results describe convergence in expressed positions under this protocol; they do not establish that convergence is always desirable.

**Expanded stance-to-text validation.** Across ten propositions, correlations between assigned stance and automated judgments of generated responses range from 0.934 to 0.970. This checks whether the generated text reflects the controlled stance, without establishing agreement with human readers or validating a model of human belief.

**Human replay with uneven gains.** On 2,495 DEBATE participant trajectories, pooled held-out final-stance RMSE is 0.466, compared with 0.489 for carrying the initial stance forward and 0.488 for a fitted net-evidence baseline. Gains are strongest among participants whose opinions move in the direction of extracted evidence. Stable participants and those moving against that evidence require different profiles.

These participant groups are defined using observed final opinions. Their results are diagnostic reconstructions, not a way to select a person's update profile before their final opinion is known.

## Why It Matters

For deliberation research, civic simulation, educational debate, and negotiation agents, researchers need to inspect what counted as evidence, how strongly it affected the maintained state, and how much the initial position persisted.

Belief Engine makes these modelling choices configurable and records the resulting trajectories. The revised paper also shows that different uptake and anchoring settings can reach the same final stance through different intermediate states, making the full path useful for auditing.

## Limitations To Read Carefully

The representation is deliberately narrow: one scalar stance over one proposition. It does not capture sub-issue positions, trust, values, or strategic behaviour.

The evidence pipeline depends on argument extraction and strength scoring. An explicit audit trail does not make those judgments neutral, and argument scores are not calibrated likelihoods. The update is Bayesian-inspired.

Human replay holds the received evidence stream fixed. It reconstructs final opinions without generating new interactions or observing intermediate human stances. Its strongest results concern evidence-following opinion changes; gains across the full population are more modest.
