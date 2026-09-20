# Stock Research Hub — Public

Public deployment repository for the **Passive Research** portion of Stock Research Hub.

> This repository is a publish target, not the primary development workspace.

## Status

**Phase 1 — Passive Research Pipeline: COMPLETE / CLOSED**

The Phase 1 public site now provides both historical episode browsing and structured episode analysis for supported episodes.

Current public deployment:

- scheduled Passive Info collection
- historical episode browser
- structured analysis artifacts
- Analysis UI
- GitHub Pages deployment
- allowlisted Private → Public publication

## Purpose

The project separates research information into two categories:

- **Passive Info** — information collected from fixed public sources for research/reference.
- **Active Info** — personal holdings, watchlists and private investment research. Active Info is intentionally excluded from this public repository.

This repository implements the public portion of **Phase 1: Passive Research** only.

## Current source

### Gooaye 股癌

The Phase 1 source is the Vocus 股癌逐字稿 room.

The public site stores episode metadata used by the historical UI, such as:

- episode number
- publication date
- title
- original source URL

For episodes with completed analysis, the site also publishes schema-controlled structured analysis, including:

- summary and relevance
- entities
- topics
- market observations
- analysis metadata

The full transcript is **not mirrored, stored, or republished** in this repository. Full-source content is transient analysis input only. Source links direct users back to the original website.

## Published structure

```text
stock-research-hub_public/
├─ index.html
├─ app.js
├─ styles.css
└─ data/
   ├─ passive/
   │  └─ gooaye/
   │     └─ episodes.json
   └─ analysis/
      └─ gooaye/
         ├─ index.json
         └─ EP*.json
```

Episodes without a current analysis artifact remain visible in the historical browser but do not expose an Analysis action.

## Publishing model

Development and analysis persistence take place in a separate private repository. Only explicitly approved public artifacts are published here.

```text
Private development repository
        │
        ├─ Passive episode metadata
        └─ Structured analysis artifacts
                ↓
        Validation + explicit allowlist
                ↓
        Public deployment artifacts
                ↓
        stock-research-hub_public
                ↓
            GitHub Pages
        ├─ Episode History
        └─ Analysis UI
```

The publication process follows an **allowlist-by-default** and **fail-closed** rule: files outside the approved public artifact set are rejected rather than implicitly published.

Passive metadata and Analysis publication have separate change boundaries so one publisher does not overwrite unrelated public artifacts.

## Data and privacy boundary

This public repository may contain only approved public runtime assets, Passive Info metadata, and approved structured analysis artifacts.

It must not contain:

- full Vocus transcripts or raw source content
- Active Info
- portfolio holdings or cost basis
- personal watchlists
- credentials, tokens or secrets
- private configuration
- internal development artifacts

Structured analysis artifacts explicitly record that source content is not stored.

Future private Active Info functionality is expected to use a separate private deployment path rather than this public GitHub Pages repository.

## Phase 1 completion summary

| Phase | Deliverable | Status |
| --- | --- | --- |
| P1.1 | Project Skeleton | Complete |
| P1.2 | Collector PoC | Complete |
| P1.3 | Web UI / initial deployment | Complete |
| P1.4 | Scheduled collection + historical backfill | Complete |
| P1.5 | Historical Episode UI | Complete |
| P1.6 | Structured Analysis model + full-source analysis PoCs | Complete |
| P1.7 | Analysis orchestration / persistence / scheduled single-episode PoC | Complete |
| P1.8 | Allowlisted Analysis publication + Analysis UI | Complete |

Phase 1 demonstrated the end-to-end public research path:

> **Source → Collection → Full-source Analysis → Validation → Persistence → Safe Publication → Research UI**

Experimental follow-on work and future private research capabilities are tracked separately and are not part of the Phase 1 public deployment contract.

## Repository role

This repository should remain a **minimal public deployment surface**.

Architecture specifications, completion reviews, experimental work, private analysis orchestration, and future Active Info development belong in the private source repository rather than being copied here.
