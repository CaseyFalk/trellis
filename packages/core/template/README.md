# My Learning Project

A [Trellis](https://github.com/CaseyFalk/trellis) learning project — a living knowledge
base that grows as you learn, built on Astro + Starlight.

## Run it

```sh
npm install      # if not already done by `trellis new`
npm run dev      # local site with hot reload at http://localhost:4321
npm run build    # production build (validates internal links)
npm run check    # fast frontmatter + link + sources + tag validation
```

## Start learning

Open this folder in your AI coding agent. The first time, it will **offer to tailor**
the structure and tag vocabulary to your focus area — say yes. Then just ask
questions; when understanding settles, let it **capture** what you've learned. Pages
file themselves into the right section and cross-link automatically.

**Have existing notes?** Drop them in and ask your agent to capture them — the same
capture loop decomposes and files them (no special import step).

## How it's organized

- **Concepts** — what things are and why they matter.
- **Guides** — step-by-step procedures.
- **Reference** — the details (with a Glossary; other cuts tailored to your focus).
- **Troubleshooting** — symptom → cause → fix.
- **Journal** — the dated record of what each capture produced.
- **Concept Map** — a visual graph of how pages link.

See [`AGENTS.md`](AGENTS.md) for how the agent operates here.

## Keeping it current

```sh
brew upgrade trellis     # update the Trellis tool
trellis update           # apply framework updates to this project (non-destructive)
```
