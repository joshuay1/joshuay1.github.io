# Presentation Plan: Digital Democracy as Collective Intelligence

**Length:** ~30 minutes
**Goal:** Give students a conceptual map of digital democracy, ground it in real research and real systems, show how your projects fit into that map, and leave them with concrete things they could build.

**Design principle:** This should be a **visual story, not a literature-review deck**. One strong idea per slide, screenshots and demos wherever possible, very little text.

---

## Act I: What is democracy? (~6 min)

### 1. Opening: “How do we decide together?”

**Visual:** A crowd of hundreds or thousands of people, flowing toward a single collective decision.

Start more fundamentally than “digital democracy.”

> We have different experiences, information, preferences, beliefs, and values.
> Somehow, we have to decide what to do together.

Pose the central question:

### **How can many minds become collective intelligence?**

This gives you a way into democracy that is broader and more interesting than elections.

---

### 2. Democracy as collective intelligence

**Visual:** Individuals → interaction → collective decision.

Introduce the epistemic perspective on democracy.

Hélène Landemore's work is particularly useful here. Her argument is that inclusive deliberation plus democratic aggregation can harness the cognitive diversity of many people. ([SSRN][1])

You could contrast:

> **Democracy as representation**
> Who has the right to decide?
>
> **Democracy as collective intelligence**
> How can we make better decisions together?

You don't need to claim the second definition replaces the first. It gives students a useful **engineering lens** for the hackathon.

This is also where I would use a short, beautiful collective-intelligence video if we find the right one, perhaps crowds, swarms, ants, fish, or human collective problem solving.

---

### 3. Democracy as a social-choice problem

**Visual:** 5 people with different preference rankings → one decision.

Then introduce the mathematical perspective:

> **Individuals have preferences.
> Society needs a collective choice.
> How should we aggregate them?**

Majority voting is just **one possible mechanism**.

Very briefly introduce social choice, perhaps Condorcet and Arrow, but don't turn this into a theory lecture. The important revelation for students is:

### **There is no neutral “vote” button.**

The mechanism we design affects the outcome.

This naturally foreshadows your participatory-budgeting work. Research on collective intelligence also explicitly connects voting, the Condorcet jury theorem, aggregation, and deliberation. ([OUP Academic][2])

---

## Act II: Democracy as a collective-intelligence system (~3 min)

### 4. The big map

This should probably be the **central visual of the entire presentation**.

```text
                 COLLECTIVE INTELLIGENCE

   VOICES
      ↓
┌─────────────┐
│ 1. LISTEN   │   Bring people into the process
└──────┬──────┘
       ↓
┌─────────────┐
│2. DELIBERATE│   Think and reason together
└──────┬──────┘
       ↓
┌─────────────┐
│3. UNDERSTAND│   Make sense of collective opinion
└──────┬──────┘
       ↓
┌─────────────┐
│ 4. DECIDE   │   Turn preferences into choices
└──────┬──────┘
       ↓
┌─────────────┐
│ 5. VERIFY   │   Make decisions trustworthy
└──────┬──────┘
       ↓
     ACTION
       ↓
   feedback / learning
       ↺

     + 6. REIMAGINE THE SYSTEM
```

There is real theoretical justification for thinking this way. Recent work explicitly describes democracy as a **scaled collective-intelligence process**, with vulnerabilities and opportunities for augmentation at different points. ([DOI][3])

Then:

> **Technology can intervene at every stage.**

Now we explore them.

---

# Act III: Where can we build? (~15 min)

I would use essentially the **same visual grammar for every section**:

**Democratic problem → Existing example → Research → Your project → What could YOU build?**

That repetition will make the talk extremely easy to follow.

---

## 5. LISTEN: Bring more voices in

### The problem

> **How can everyone meaningfully participate?**

**Visual examples:** public consultation, citizen assembly, conversational AI interview, multilingual interface.

Research/themes:

- participation
- representation
- preference elicitation
- conversational surveys
- accessibility
- inclusion

### Real-world examples

Could briefly show something like Decidim, Polis-style participation, or newer AI-mediated consultation systems.

### Your work

**Swiss AI Futures** can fit here as the participation context.

You brought 100+ citizens into discussions about AI, work, and education, which then leads naturally into the next problem: once everyone is in the room, **how do they actually think together?** ([Joshua C. Yang][4])

### Hackathon prompts

> Can AI interview 1,000 citizens?

> Can we hear from people who normally don't participate?

> Can participation work seamlessly across languages?

---

## 6. DELIBERATE: Help people think together

### The problem

> **Democracy isn't just collecting opinions. People can learn, argue, persuade, and change their minds.**

**Visual:** Many speech bubbles interacting rather than simply entering a ballot box.

Introduce deliberative democracy very lightly.

### Your project: Murmi

This is where you can switch from slides to a **live/demo moment**.

[Murmi project and demo](https://joshuacyang.com/projects/murmi/?utm_source=chatgpt.com)

Murmi listens to live discussion and uses AI to organize the group's priorities, agreements, tensions, and less-heard perspectives. Importantly, participants can inspect and correct the AI's interpretation. It has been piloted with vTaiwan and Swiss AI Futures. ([Joshua C. Yang][5])

Show:

**conversation → AI facilitation → reflection → further conversation**

### Hackathon prompts

> AI mediator?

> Argument mapper?

> Common-ground finder?

> Tool that introduces missing evidence?

---

## 7. UNDERSTAND: Make sense of the crowd

Now slightly shift Murmi's role.

### The problem

Put **1,000 speech bubbles** on screen.

Then:

> **Nobody can read all of this.**

Technology can cluster, summarize and visualize collective opinion.

But immediately introduce the democratic danger:

> **Who decides what the group “said”?**

This is where questions of minority-view preservation, summarization bias, clustering, consensus and disagreement become interesting.

### Murmi again

Murmi spans **2 and 3**, which is worth explicitly saying.

It isn't only facilitating conversation. It is trying to construct a **shared, inspectable representation of what the group thinks**. ([Joshua C. Yang][4])

### Hackathon prompts

> Map 10,000 opinions.

> Find hidden consensus.

> Find the important disagreement.

> Detect perspectives the AI summary erased.

This could be one of the strongest AI-oriented hackathon categories.

---

## 8. DECIDE: Turn opinions into collective choices

Now return to your social-choice opening.

### The problem

> We listened.
> We deliberated.
> We understand the options.
>
> **But what do we actually do?**

Bring back the preference-ranking visual from slide 3.

Research:

**Social choice → voting → preference aggregation → fair division → participatory budgeting**

### Your project: participatory budgeting / Equal Shares

This can be your concrete case study.

Your Komitee Equal Shares work allocated **CHF 380,000** in Winterthur, involving 38 randomly selected citizens and funding 43 projects. It combines deliberative signals with an allocation mechanism based on the Method of Equal Shares. ([Joshua C. Yang][6])

Your earlier work also directly investigated how voting-system design affects perceived fairness and legitimacy. ([Joshua C. Yang][7])

This makes the abstract social-choice problem suddenly tangible.

### Hackathon prompts

> Build a fairer voting system.

> Let a neighborhood allocate CHF 1 million.

> Visualize how different voting rules change the winner.

> Design a mechanism for finding broadly acceptable compromises.

---

## 9. VERIFY: Can we trust the result?

This deserves its own stage.

### The problem

Show a black box:

**Votes → 🡪 ??? → 🡪 Result**

Ask:

> **How do I know my voice mattered?**

There are several dimensions here:

- transparency
- accountability
- legitimacy
- auditability
- explainability
- verifiability

### Your project: Voting Receipt

This is a perfect visual example.

Your Equal Shares Voting Receipts were built precisely to make the Method of Equal Shares easier for participants to **inspect, understand and discuss**. ([Joshua C. Yang][4])

Show an actual receipt.

Then make the broader point:

### **Democratic algorithms shouldn't merely produce an answer. They should help people understand how that answer came about.**

### Hackathon prompts

> Give every participant a meaningful “receipt.”

> Trace a citizen proposal into a final policy.

> Audit whether an AI summary represented participants fairly.

> Explain a complex democratic algorithm without requiring a math degree.

---

# Act IV: What happens when AI becomes a participant? (~3 min)

## 10. REIMAGINE: New forms of democracy

Change the visual language here. Make this feel more speculative.

Until now:

> **AI helps humans participate in democracy.**

But now ask:

# **What if AI becomes part of the collective?**

Agents could:

- represent people
- deliberate
- negotiate
- simulate consequences
- maintain preferences
- discover compromises
- participate in collective decisions

Your earlier **LLM Voting** work is a great bridge because it showed both the possibility and danger: LLM voting behavior can change with ballot ordering, prompts, personas and temperature. ([Joshua C. Yang][8])

Then:

### Your project: Belief Engine

[Belief Engine](https://joshuacyang.com/pubs/belief-engine/?utm_source=chatgpt.com)

Belief Engine gives LLM agents an explicit, inspectable stance that can persist while still changing in response to evidence. Instead of an agent mysteriously changing its mind, you can examine **why** its position changed. ([Joshua C. Yang][9])

This lets you introduce a much bigger question:

> **Could we design entirely new collective-intelligence institutions around humans and AI?**

That's your visionary transition.

---

# Act V: The future is something we design (~3 min)

## 11. Zoom back out

Return to exactly the same collective-intelligence diagram from slide 4.

But now populate it with everything students have seen:

```text
LISTEN
Citizen participation
        ↓
DELIBERATE
Murmi
        ↓
UNDERSTAND
Murmi / AI sensemaking
        ↓
DECIDE
Participatory budgeting / Equal Shares
        ↓
VERIFY
Voting Receipts
        ↓
ACTION
        ↺

        + AI AGENTS
          Belief Engine
```

Now they realize that what looked like six separate topics is **one system**.

---

## 12. The hopeful ending

I would avoid ending on “democracy is in crisis.”

Instead:

> For most of history, democracy has been constrained by the technologies available to it.

Physical assemblies.

Paper ballots.

Representatives.

Mass media.

Online platforms.

And now AI.

Then your central optimistic proposition:

# **We have new tools for thinking together.**

# **We haven't yet invented the institutions they make possible.**

And then turn it over to them.

---

## 13. Final hackathon slide

Almost nothing on screen:

# **Where will you intervene?**

**Listen → Deliberate → Understand → Decide → Verify → Reimagine**

Then:

> **Find one place where collective intelligence breaks down.**
>
> **Build something that makes it work better.**

That is where I would stop.

---

This gives you roughly **12 to 15 slides**, rather than trying to cram 30 slides into 30 minutes. More importantly, there is a coherent intellectual arc:

**What is democracy? → Democracy as collective intelligence → Collective intelligence has bottlenecks → Here are real attempts to solve them → Here is what I have tried → AI radically expands the design space → Now you build the next piece.**

Your own projects also stop feeling like a portfolio section in the middle of the talk. They become **evidence throughout the story that these abstract problems can actually be turned into things people build, deploy, test and study**. ([Joshua C. Yang][4])

For the actual deck, I would next research **each of the six stages individually**, looking specifically for 1 iconic visual/example, 1 compelling paper or finding, 1 existing system/demo, and 2 to 3 genuinely exciting hackathon directions per stage. I would also hunt down the best collective-intelligence videos for the opening rather than settling for generic explainer videos.

[1]: https://papers.ssrn.com/sol3/papers.cfm?abstract_id=1845709&utm_source=chatgpt.com "Democratic Reason: The Mechanisms of Collective Intelligence in Politics by Helene E. Landemore :: SSRN"
[2]: https://academic.oup.com/book/41099/chapter-abstract/350395640?utm_source=chatgpt.com "Collective Intelligence: Crowd Wisdom versus Herding | Theories of Choice: The Social Science and the Law of Decision Making | Oxford Academic"
[3]: https://doi.org/10.1007/978-981-95-9667-6_3?utm_source=chatgpt.com "Democracy as a Scaled Collective Intelligence Process: Points of Vulnerability and Augmentation | Springer Nature Link"
[4]: https://joshuacyang.com/projects/?utm_source=chatgpt.com "real-world projects | Joshua C. Yang"
[5]: https://joshuacyang.com/projects/murmi/?utm_source=chatgpt.com "Murmi | Joshua C. Yang"
[6]: https://joshuacyang.com/pubs/komitee-equal-shares/?utm_source=chatgpt.com "Komitee Equal Shares: A Hybrid Algorithm for Priceable Participatory Funding | Joshua C. Yang"
[7]: https://joshuacyang.com/pubs/designing-digital-voting-systems/?utm_source=chatgpt.com "Designing Digital Voting Systems for Citizens: Achieving Fairness and Legitimacy in Participatory Budgeting | Joshua C. Yang"
[8]: https://joshuacyang.com/pubs/llm-voting/?utm_source=chatgpt.com "LLM Voting: Human Choices and AI Collective Decision Making | Joshua C. Yang"
[9]: https://joshuacyang.com/pubs/belief-engine/?utm_source=chatgpt.com "Belief Engine: Configurable and Inspectable Stance Dynamics in Multi-Agent LLM Deliberation | Joshua C. Yang"
