# Talks on Josh’s page

Talks live here as self-contained static websites. Their public address is `https://joshuacyang.com/talks/<slug>/`.

```sh
npm ci
npx puppeteer browsers install chrome
npm run talk:new -- my-next-talk "My next talk"
npm run talk:serve -- 8000
npm run talk:check -- my-next-talk
npm run talk:export -- my-next-talk
```

Open `http://127.0.0.1:8000/talks/my-next-talk/`. Phones open a scrolling reading layout; `?view=present` explicitly opens slide mode. The starter includes local fonts and a minimal runtime; it does not copy another talk’s claims or datasets.

See [the complete authoring workflow](../docs/presentation-workflow.md) for research, illustration generation, purposeful interactions, visual review, exports and publication. [Hacking Democracy](hacking-democracy/README.md) is the developed reference talk.
