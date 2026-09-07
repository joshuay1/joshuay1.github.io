# Building Digital Democracy in Practice

Hacking Democracy / ETH Zurich, September 7, 2026 · Joshua C. Yang.

The current presentation has 36 slides, planned for 30:00 in a 30-minute slot. This is the source for `https://joshuacyang.com/talks/hacking-democracy/`, featured on the homepage.

## Work on this talk

From the repository root:

```sh
npm run talk:serve -- 8000
npm run talk:check -- hacking-democracy
npm run talk:export -- hacking-democracy
```

Open `/talks/hacking-democracy/` on the preview server. Phones and tablets up to 900px open in scrolling reading mode. `?view=present` explicitly selects slides; `?view=read` explicitly selects browsing; `?demos=offline` selects local demo fallbacks.

Presentation controls are previous/next, count, Scenes and Full screen. Arrow keys, Space and Page Down advance; O opens Scenes. Public browsing shows Contents and a profile link. Speaker notes are not shown. Embedded sites may take keyboard focus; use the presentation arrows after interacting inside them.

## Structure and editing

- `index.html`: slide order, text, speaking notes, sources and media references.
- `app.js`: navigation and the original voting/summary/receipt interactions.
- `aggregation.js`, `embeds.js`, `concepts.js`: funding handout, two live project embeds and Aarau’s evidence dialog.
- `motion.js`: selected explanatory sequences, respecting reduced motion.
- `browse.css`: mobile reading refinements. Other CSS files reflect successive content modules; `concepts.css` styles the latest research illustrations.
- `assets/`: local fonts, photos, illustrations, original figures and demo data; provenance is in `assets/media/provenance.json`.
- `_authoring/`: original plan, style reference and saved generation prompts; not part of the public reading page.
- `talk.config.json`: expected slide count and regression checks. Update alongside the running order.

The five process steps are Framing, Ideas, Deliberation, Voting and Accountability. Cases include Kultur Komitee, Aarau, Murmi and voting receipts. The new representation question and research illustrations draw on Self-Introduction.pptx. Original Aarau allocation maps remain available in the evidence dialog; figurative artwork does not encode measurements.

The speaker biography follows Josh’s supplied ETH affiliation. His stated total of over CHF 2 million concerns three years of involvement; dated deployment figures are separate. Keep these distinctions when editing.

For the complete reusable pipeline, see [presentation-workflow.md](../../docs/presentation-workflow.md).

- `budget-playground.js`: offline budget sensitivity demo using the simplified six-project handout; this is not the full KK25 allocation algorithm.
