# Stock Research Hub — Public

Public deployment repository for the **Passive Info** portion of Stock Research Hub.

> This repository is a publish target, not the primary development workspace.

## Purpose

The project separates research information into two categories:

- **Passive Info** — information collected from fixed public sources for research/reference.
- **Active Info** — personal holdings, watchlists and investment research. Active Info is intentionally excluded from this public repository.

This repository currently implements **Phase 1: Passive Info** only.

## Current source

### Gooaye 股癌

The current Phase 1 source is the Vocus 股癌逐字稿 room.

The public site stores only episode metadata used by the UI, such as:

- episode number
- publication date
- title
- original source URL

The transcript itself is **not mirrored or republished** in this repository. Links direct users back to the original source website.

## Published structure

```text
stock-research-hub_public/
├─ index.html
├─ app.js
├─ styles.css
└─ data/
   └─ passive/
      └─ gooaye/
         └─ episodes.json
```

## Publishing model

Development takes place in a separate private repository. Only explicitly approved public artifacts are published here.

```text
Private development repository
        ↓
Explicit allowlist
        ↓
Public deployment artifacts
        ↓
stock-research-hub_public
        ↓
GitHub Pages
```

The publish process follows an **allowlist-by-default** rule: new files or directories in the private workspace are not published unless they are explicitly added to the public artifact set.

## Privacy boundary

This public repository must not contain:

- Active Info
- portfolio holdings or cost basis
- personal watchlists
- credentials, tokens or secrets
- private configuration
- internal development files

Future private Active Info functionality is expected to use a separate private deployment path rather than GitHub Pages.

## Status

- Phase 1.1 — Project skeleton: complete
- Phase 1.2 — Passive collector PoC: complete
- Phase 1.3 — Web UI v0.1: complete
- Phase 1.3c-1 — Manual allowlisted public artifact publish: complete
- Next — GitHub Pages deployment
