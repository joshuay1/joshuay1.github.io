---
layout: publication
title: "Komitee Equal Shares: A Hybrid Algorithm for Priceable Participatory Funding"
description: "A CHI EA paper introducing a hybrid participatory funding algorithm that combines voter point allocations with evaluator assessments."
bibkey: acm2026kes
keywords: "participatory budgeting, Method of Equal Shares, algorithmic accountability, deliberation, digital democracy"
---

### The Problem

Participatory funding has a familiar tension. Simple voting can scale, but it often rewards projects with broad popularity and can overlook minority or niche preferences. Deliberation can produce richer judgment, but many citizen assemblies stop at recommendations instead of binding allocation.

Komitee Equal Shares asks whether both modes can be joined inside one allocation rule.

### What KES Does

KES treats participants as playing two complementary roles.

In voter mode, people privately express personal preferences over projects. In evaluator mode, small groups assess projects against collectively defined impact fields, such as shared civic or cultural values.

Both signals become virtual budgets. A project is funded only when its supporters can collectively pay for its cost. This priceability logic extends the Method of Equal Shares and creates a record of who or what "paid" for each project.

### Field Deployment

The system was deployed in the 2025 Kultur Komitee in Winterthur, Switzerland. A randomly selected committee of 38 residents allocated CHF 380,000 across cultural projects.

The final KES portfolio funded 43 projects. The practical baselines funded fewer: 35 projects under individual-only greedy aggregation and 33 under group-only greedy aggregation. The KES outcome had a lower average grant size, suggesting a broader portfolio with more room for smaller or more distinctive projects.

### Why Voting Receipts Matter

The paper's most public-facing design idea is the voting receipt. Formally, it is a priceability record: a trace of how individual and impact-field budgets contributed to each funded project. For participants, it is a familiar explanation format that makes an abstract allocation rule more legible.

Receipts do not magically make every participant understand the algorithm. The paper is careful here: many participants treated the mechanics as a trust signal rather than something they fully inspected. But that is still important. Civic algorithms need accountable artifacts that people can discuss, question, and contest.

### What The Paper Finds

KES produced a broader funding portfolio than greedy baselines. It also selected more low-cost, higher-variance projects than a simulated standard MES comparison, suggesting that the hybrid signal can preserve valued minority or niche projects.

Participant satisfaction appeared more connected to process orientation than simply having one's own favourite projects funded. In the survey, voting concentration was a significant negative predictor of satisfaction, while success ratio was not.

### Limitations To Read Carefully

This is a single field deployment with 38 participants and 32 survey respondents. The statistical findings are therefore suggestive, not final.

The comparison against standard MES is simulated using proxy votes, so the paper cannot fully isolate whether the gains come from the hybrid signal structure, the priceability mechanism, or the particular Winterthur process design.
