---
title: Context Window
description: How much text a model can attend to at once.
tags: [inference]
maturity: growing
sources: [2026-06-24-inaugural]
---

The **context window** is the span of [tokens](/reference/glossary/tokens/) a model
can attend to in a single pass. Exceed it and earlier content falls out of view.

The window is set per tool — see [llama.cpp](/reference/tools/llama-cpp/) for the
relevant flag.

```mermaid
graph LR
  A[Prompt] --> B[Context Window]
  B --> C[Generated Output]
```
