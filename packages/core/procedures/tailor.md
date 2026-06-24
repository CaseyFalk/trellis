# Tailor

One-shot, first-session tailoring: shape a fresh Trellis project to its focus area.
Run this once, before substantive learning, when `trellis.config.json` has
`"tailored": false`. Nothing is written until you approve a plan.

Conventions and the tool reference live in [`docs/conventions.md`](docs/conventions.md).
In Claude Code this is `/trellis-tailor`; with any other agent, follow these steps.
After this, structural growth happens organically through capture — there is no need
to re-run tailoring.

## 1. Read the focus

Read the focus statement in `AGENTS.md` (written by `trellis new` from the user's
prompt). Reflect it back in your own words and confirm you've understood the subject
and the user's goal. If it's thin, ask one or two clarifying questions.

## 2. Propose the Reference cut

Propose 2–4 domain-appropriate **Reference cuts** with labels — the *kinds* of
reference this subject needs (software → Tools, Models; cooking → Ingredients,
Techniques; law → Statutes, Cases). **Glossary always exists**; don't propose it.
Don't touch the five fixed registers.

## 3. Propose a starter taxonomy

Propose a small set of starter **tags** for the focus (a handful — enough to seed
clean faceting, not an exhaustive list). Each with a one-line gloss.

## 4. Seed the learning profile

Read the shared profile at `~/.trellis/learning-profile.md`. If it's empty or stubby,
propose a minimal seed (a couple of domain-agnostic preferences worth asking about —
e.g. preferred depth, visual vs. textual). Keep it light; it grows through use. Never
put anything focus-specific here.

## 5. Plan — approval gate

Present the whole plan together: the Reference cuts + labels, the starter tags, the
focus statement you'll record, and any learning-profile additions. Write nothing
until the user approves or revises it.

## 6. Write — via the tools

Execute the approved plan using the tools (`conventions.md` → Mechanics):

- Each Reference cut: `trellis section add reference/<name> --label "…"`.
- Each starter tag: `trellis tag add <tag> --gloss "…"`.
- Record the focus + the chosen section labels in `AGENTS.md` (edit its prose
  directly — it's an owned file).
- Learning-profile additions (if confirmed in step 5): write them into
  `~/.trellis/learning-profile.md`.
- Mark tailoring complete: `trellis config set tailored true`.

## 7. Offer to seed from existing notes

If the user has existing notes or documents for this focus, offer to capture them now
— drop them in and run the **capture** procedure ([`docs/capture.md`](docs/capture.md)).
Seeding is just capture applied on day one; there is no separate import.

## 8. Verify

Run `trellis check` (it should pass on the still-empty KB), then tell the user the
project is tailored and ready — they can start asking questions, and you'll offer to
capture as understanding settles.
