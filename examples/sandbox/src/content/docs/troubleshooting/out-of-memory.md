---
title: Out of Memory on Load
description: Symptom → cause → fix for OOM when loading a model.
tags: [troubleshooting]
maturity: growing
---

**Symptom:** the process is killed while loading. **Cause:** the
[context window](/concepts/context-window/) is set larger than memory allows.
**Fix:** lower `--ctx-size`.
