# LifeOS — Claude Project Memory

> **Personal productivity PWA**. Single-file HTML app, deployed to GitHub Pages at `ariestotele.github.io/lifeos/`.

---

## ▶︎ START HERE — fresh-session orientation

Read this section first; it tells you what to do.

**Who you're talking to**: Faris (Abu Dhabi, CUAS / field engineering). Uses LifeOS daily on Android as an installed PWA. Prefers short, direct updates and the auto-merge workflow — open PR, squash-merge it, reply with PR URL + merge SHA, no pause for confirmation.

**Where we are**: v5.24.11. Dev branch `claude/elegant-goldberg-uHJMS`. Repo `Ariestotele/lifeos`.

**Workflow expectations** (this is non-negotiable, don't ask each time):
1. Edit `src/app.js` / `src/styles.css` / `src/index.html`. Never edit the built HTMLs at the repo root.
2. Bump `APP_VERSION` in `src/app.js` for every visible change.
3. `node --check src/app.js && node build.js` before committing.
4. Commit `src/` + both HTMLs + `service-worker.js` together (build output).
5. Push, open PR to `main`, squash-merge it automatically, reply with both links.
6. After merge: `git fetch origin main && git reset --hard origin/main && git push --force-with-lease` — keeps the feature branch in sync (squash creates new SHAs).
7. Restore-point HTMLs only for major (v5.X) releases. Two are already sitting in the repo waiting to be deleted once Faris confirms stable — see "Open reminders".

**What's queued (pick one, or surface a triage)**:
1. **Tasks Phase 2** — drag-to-reorder within a date bucket, swipe-to-complete on mobile. Medium.
2. **Cloud sync auto-push on change** — debounced (30s idle) so the manual push button becomes optional. Heuristic in the "Queued features" section below.
3. **Peek-to-toast** — when `cloudPeekStatus` first detects new data from another device, show a one-time toast in addition to the chip's pulsing state. Small/medium.

**Don't surprise**: never run destructive git commands (force push, reset --hard) unless inside the standard branch-sync flow. Never skip hooks. Always run `node --check src/app.js` before building.

**Tone**: terse. State results and next step in one or two sentences. No long preambles. Use `file:line` when referencing code.

---

## Repo layout

```
lifeos/
├── CLAUDE.md                 # this file -- read first
├── README.md
├── build.js                  # combines src/ -> deployable HTML; auto-bumps SW cache
├── src/                      # SOURCE FILES (edit these from v5.20+)
│   ├── index.html            # template with /*<!--CSS-->*/ /*<!--JS-->*/ markers
│   ├── styles.css            # plain CSS
│   └── app.js                # plain JS (was previously base64-encoded inline)
├── index.html                # BUILD OUTPUT, do not edit; byte-identical to life_manager.html
├── life_manager.html         # BUILD OUTPUT, do not edit; same content as index.html
├── service-worker.js         # PWA SW; `const CACHE` is auto-bumped by build.js
├── gptlife_manager.html      # legacy stub, unused
└── bills-backup-*.json       # personal data export, do not modify
```

**Edit workflow (v5.20+):**
1. Edit `src/app.js`, `src/styles.css`, or `src/index.html` (the template).
2. Run `node build.js` — produces fresh `index.html` + `life_manager.html` and bumps `const CACHE` in `service-worker.js` from a content hash.
3. Commit `src/`, the two HTMLs, and `service-worker.js` together.

Restore-point HTMLs (`life_manager_before_*.html`) are no longer committed — git history covers them. The `.gitignore` enforces this.

## Live URLs

- Default / installed PWA: https://ariestotele.github.io/lifeos/ (serves `index.html`)
- Standalone URL: https://ariestotele.github.io/lifeos/life_manager.html

## Tech stack

Vanilla JS, HTML/CSS, `localStorage`, Chart.js CDN. No frameworks. From v5.20 onward the JS is plain UTF-8 inlined as `<script>...</script>` (no more base64 / `eval(atob(...))` / `\uXXXX` escapes). Always run `node --check src/app.js` before building.

## Current version

**v5.24.11** (cloud sync provenance + persistent chip + recurring tasks + universal pause + audit batch — see Version history for the v5.23–v5.24 series).

## Workflow preferences

After every push to a feature branch:
1. **Open a PR** to `main` automatically.
2. **Squash-merge** it automatically.
3. **Reply with both links** — PR URL and the merge commit SHA.

Don't pause for confirmation on those steps.

After each squash-merge, immediately **sync local + remote feature branch with `main`** (squash creates new SHAs; skipping this causes the next PR to go "dirty"):

```
git fetch origin main && git reset --hard origin/main && git push --force-with-lease
```

## Project layout

- Working file: **`life_manager.html`** — edit this.
- **`index.html`** is the live deploy target; keep it **byte-identical** to `life_manager.html` after every commit (the installed PWA at `/lifeos/` points at `index.html`).
- `service-worker.js` at repo root.
- Repo: `Ariestotele/lifeos`. Current dev branch: `claude/elegant-goldberg-uHJMS`.
- **Data repo (v5.22.2+)**: optional separate **private** repo for personal data (e.g. `Ariestotele/lifeos-data`). Configured in Settings → Auto-save / GitHub → "Data repo (optional)". Lets the code repo stay public for GitHub Pages while data round-trips through a private repo. Same PAT must include both repos under fine-grained permissions (Contents: Read and write).

## Core editing rules (post-v5.20 source split)

1. Edit `src/app.js`, `src/styles.css`, or `src/index.html` (template) directly with `Edit` — no decode/encode dance.
2. Run `node --check src/app.js` before building.
3. Use `data-id` attributes on `onclick` handlers (avoids quote-escaping bugs).
4. Bump `APP_VERSION` (in `src/app.js`) on every visible change.
5. Surgical edits only — never rewrite large sections unless necessary.
6. Run `node build.js` — generates `index.html` + `life_manager.html` (byte-identical) and auto-bumps `const CACHE` in `service-worker.js` from the content hash. Manual cache bumps are no longer required.
7. Commit `src/` + both HTMLs + `service-worker.js` together.
8. Restore points — **only for major (v5.X) releases**, kept local, deleted after merge: `cp life_manager.html life_manager_before_<feature>.html`. Skipped for sub-minor releases (git history is enough).

Build-time guards in `build.js` reject any `src/app.js` containing `</script>` or `<!--`, and any `src/styles.css` containing `</style>`. If a guard fires, fix the source instead of bypassing.

## Architecture

- Two files deploy to GitHub Pages: `index.html` + `service-worker.js`.
- HTML is self-contained: inline manifest (data URI), inline SVG icons, inline CSS.
- Sandbox guard in `pwaInit()` skips SW registration on preview origins (Claude, CodeSandbox, `file://`, etc.).
- **Service worker (v5.18.1+)**: network-first for HTML navigations (deploys take effect on the very next load), cache-first for static assets (fonts, CDN, same-origin sub-resources). Still bump `CACHE` per release.
- **Mobile layout detection (v5.18.2+)**: `pwaInit()` adds `body.touch-device` when `'ontouchstart' in window || navigator.maxTouchPoints > 0`. All mobile chrome (bottom nav, task bottom sheet, sidebar slide, larger tap targets) is gated on this class with `!important` overrides — bypasses the unreliable `@media (max-width:640px)` breakpoint that didn't fire on some phones.
- **Version stamp (v5.18.2+)**: small `#version-stamp` div near the corner displays `v<APP_VERSION> · <viewport>px · touch:<yes|no>` for at-a-glance debugging. Update is deferred to `window.load` so the DOM element exists.
- z-index hierarchy: mobile-nav 100, page-header (sticky) 150, **cloud-chip 155**, **cloud-popover 170**, modal-backdrop 200, toast 300 (lifted on touch), sidebar overlay 399, sidebar 400, task panel 410, sh-coll-fab 501, settings/pay-popup 600, link-viewer 800, PWA banners 9999. (Version stamp removed on touch in v5.24.2.)
- **Cloud sync (v5.22.0+)**: `cloudPush` / `cloudPull` round-trip the full backup payload as a JSON file in a GitHub repo via the Contents API. Reuses `_buildBackupPayload()` and `applyRestore('replace')`. SHA caching (`CLOUD_FILE_SHA_KEY`) prevents 409 races; first push has no SHA (= file create). Both helpers route through the AI proxy if `aiGetProxy()` is set (same pattern as `ghDeploy`). Tokens live in `localStorage` per device — adding a new device means re-pasting the PAT.
- **Cloud sync provenance (v5.24.6+)**: every push stamps the payload with `_deviceId` (random `d<8 chars>` in `lifeos_device_id`) + `_deviceName` (auto-detected from UA, override in Settings → Cloud sync → Device, `lifeos_device_name`). Pull reads them and stores as `lifeos_cloud_remote_sender` JSON so the recipient sees who pushed.
- **Cloud sync passive peek (v5.24.10+)**: `cloudPeekStatus()` polls the GitHub Commits API (~1KB) every 5 min while the tab is visible — and on visibility resume — to detect when another device pushed. If the commit SHA differs from `CLOUD_PEEK_COMMIT_KEY`, it fetches the file once to refresh `_deviceName`/`exportedAt`. **Never** writes `CLOUD_FILE_SHA_KEY` (would break push-conflict detection). Throttled to 30s min between calls. Also triggered when the chip popover opens.
- **Cloud sync UI (v5.24.7+)**: persistent chip top-right of every page (`#cloud-chip`, fixed, z-index 155). States via class: `synced` (green dot, <2h since sync), `dirty` (amber, <24h), `stale` (gray), `remote-new` (pulsing blue accent — cloud has data from another device newer than our last sync). Click toggles `#cloud-popover` (z-index 170) with full provenance + Pull/Push buttons + manual `cloudPeekNow()` refresh link. Hides itself when token/repo aren't set.
- **Cloud push conflict guard (v5.24.4+)**: before PUT, fetches the current remote SHA via GET. If it differs from `CLOUD_FILE_SHA_KEY`, prompts the user to confirm overwrite or cancel and pull first. The PUT still relies on GitHub's 409 as a server-side backstop.
- **Force-update escape hatch (v5.24.1+)**: Settings → App → "Force update now" unregisters every SW + deletes every Cache Storage cache + reloads with `?v=<ts>` so the browser disk cache is bypassed. Keeps localStorage intact. Use when the PWA is stuck on an old version (Chrome can serve SW JS from HTTP cache for ≤24h).

## Branding

LifeOS "LO" monogram as inline SVG in sidebar, favicon, and PWA icons:
- L = vertical rounded bar, `#7AB5E8 → #4A8ECC` gradient
- O = hollow ring, `#7AB5E8 → #3A6FA8` gradient
- Small light-blue connector dot between them
- Background = `#1a1d24 → #0c0d10` gradient, rounded corners at 22% of side
- Accent: `#4A8ECC` (muted sky blue)

## Pages

Dashboard, Bills (active/trials/history), Tabby tracker, Insights, Calculator, Tasks (one section per workspace), Goals, Calendar, Notes, Loans, Receivables, Accounts, Net Worth, Shopping, Links.

## Features

- Dashboard widgets (drag reorder, customize mode)
- AI insights (Claude Haiku via proxy URL)
- GitHub Pages deploy button (in-app)
- Dual storage (localStorage + Claude `window.storage`)
- Privacy toggle, restore points
- Cycle-aware bill filtering
- **Global search palette** — `Ctrl/Cmd+K` or `/`, 9 entity types, keyboard nav, grouped results
- **PWA install** — manifest + service worker (cache-first + bg refresh + auto-update banner)
- **Mobile bottom nav** — hamburger, Home, FAB, Tasks, Bills (context-aware FAB across 9 pages)
- **Custom workspaces** — `workspaces` array of `{id, name, emoji, color}`; Manage Workspaces modal (🔧 button on Tasks filter row); add / delete with id-keyed reassignment of tasks + lists; first-load defaults seed Personal 👤 + Work 💼 so legacy `'personal'`/`'work'` values still work without migration.
- **Workspace-scoped lists** — each list optionally belongs to a workspace or `null` (global); filter pills grouped per workspace + Global; cycleListWorkspace iterates real workspaces array.
- **Fix task workspaces** migration tool — in Manage Lists, reclassify legacy tasks in bulk; options dynamically populate from `workspaces`.
- **Keyboard shortcuts panel** — press `?`
- **Links UX** — per-group `+ link` shortcut, empty-group CTA, mobile-visible card actions
- **Cloud sync (v5.22)** — pull / push the full backup payload to a GitHub repo (default same as deploy repo; v5.22.2 lets you override with a private data repo). Status line shows Last pulled / Last pushed separately.
- **Cloud sync — provenance + chip + peek (v5.24.6 → v5.24.10)** — per-device id+name stamps the payload so the recipient knows who pushed. Persistent top-right chip on every page shows latest sync state with a colored dot; click opens a popover with full Pull/Push UI. Passive peek polls the file's latest commit every 5 min so the "last written by" status updates even when nobody pulls. Chip pulses blue (`remote-new`) when cloud has newer data from another device.
- **Cloud push pre-check (v5.24.4)** — before PUT, fetches remote SHA and prompts on mismatch (friendlier than GitHub's 409).
- **Tasks Phase 1 refresh (v5.21)** — quick-add row, date grouping (Overdue / Today / Tomorrow / This week / Later / No date / **Paused** v5.24.0), one-bucket-at-a-time mobile view, workspace-coloured card backgrounds, **explicit bucket header above body (v5.24.4)** so the active bucket is unambiguous even when card content (e.g. dueDate="Today") looks similar.
- **Recurring tasks (v5.24.0)** — `task.recur = {freq:'daily'|'weekly'|'monthly', interval:N} | null`. On completion, `dueDate` advances to next future occurrence (loop catches up missed dates), history entry logged. **Single row** in the task list — no clutter. Calendar derives all occurrences in the visible month from `recur`. Modal: "Repeats" select + "Every N" interval input.
- **Universal pause (v5.24.0)** — `task.paused = boolean`, applies to recurring AND normal tasks. Paused tasks live in a dedicated `Paused` bucket pill, card dims to .6 opacity + shows chip, pause button in card action row.
- **2-column task modal on wider viewports (v5.24.5–v5.24.6, v5.24.8)** — Left column: Title → **Subtasks** → Notes → Workspace+List. Right column: Priority+Due → Repeats+Every → Pause → Tags → Color. Collapses to single column under 720px.
- **Single-column task list on phones (v5.24.9–v5.24.11)** — `.tk-section-body` is 2-col on desktop/tablets, 1-col only on viewports ≤640px. Tablets keep 2-col (v5.24.11 fix: was forcing 1-col on any touch device regardless of width).
- **Budget tracker per bill category (v5.20.4)** — set monthly cap per category; progress bar against current cycle spend.
- **Inline subtask quick-toggle (v5.20.1)** — tap a subtask checkbox on the task card without opening the modal.
- **Quick-date buttons (v5.20.3)** — Today / Tomorrow / This week shortcuts in the task modal.
- **One-time bill handling (v5.20.6–v5.20.7)** — one-time bills no longer recur across cycles; live in a dedicated paid-section after payment with "paid &lt;date&gt;" label.
- **Day-of-month picker (v5.20.9)** — calendar grid for bill `dueDay` instead of a 1–31 number field.
- **Clear all data (v5.20.5)** — Settings → Backup button to wipe every LifeOS key at once.
- **Bill card BG tinted by category (v5.23.0)** — faint 8% alpha wash on card background matching the category color.
- **Edit workspaces from Manage Workspaces (v5.23.1)** — pencil button toggles inline edit row (name + emoji + color). ID stays stable so existing `task.workspace`/`list.workspace` refs don't break.
- **Mobile tap-target uplift (v5.23.3)** — `modal-close-btn` 26→40px, `bill-icon-btn` 22→40px, `bill-card-btn-pay` 22→36px on touch. Notes & Accounts edit/delete actions visible on touch (were hover-only).
- **120ms search debounce (v5.23.4)** — five page-level search inputs (Bills / Tasks / Notes / Accounts / Links) now route through `dbSearch(fn)` instead of firing `render*()` on every keystroke.
- **Calendar grid fix (v5.24.2)** — added `min-width:0` to `.cal-cell` so the 7-column grid actually distributes equally. Wide event chips (e.g. "Plex Remote Access") were blowing out the layout into 3 squashed columns on phones.
- **Reminder banner mobile fix (v5.24.2)** — was `position:sticky;top:-2rem` (desktop trick) which jammed against the status bar on phones. Now `position:static` on touch.

## Keyboard shortcuts

| Scope | Key | Action |
|---|---|---|
| Global | `?` | Open shortcuts panel |
| Global | `Ctrl/Cmd+K` or `/` | Open global search |
| Global | `N` | New bill |
| Global | `Esc` | Close any modal/panel |
| Tasks page | `T` | New task |
| Search palette | `↑` `↓` | Move selection |
| Search palette | `Enter` | Open result |

Shortcuts are disabled while typing in inputs.

## Data shapes (for search / filtering)

| Entity | Array | localStorage key | Fields |
|---|---|---|---|
| Bills / subs | `items` | `subtracker_items` | name, cat, notes, amount, cycle, dueDay, status, isTrial |
| Tasks | `tasks` | `subtracker_tasks` | title, notes, tags, priority, dueDate, workspace, listId, subtasks, done, starred, **recur** `{freq,interval}\|null` (v5.24.0), **paused** `bool` (v5.24.0) |
| Lists | `lists` | `subtracker_lists` | id, name, color, **workspace** (nullable = global) |
| Workspaces | `workspaces` | `lifeos_workspaces` | id, name, emoji, color |
| Notes | `notes` | `subtracker_notes` | title, body, tags, color |
| Loans | `loans` | `subtracker_loans` | name, lender, principal, rate, tenure, notes, paidOff |
| Goals | `goals` | `subtracker_goals` | title, category, type, target, current, milestones, deadline |
| Accounts | `accounts` | `subtracker_accounts` | name, bank, type, balance, currency, history |
| Receivables | `receivables` | `subtracker_receivables` | name, from, amount, date, collected |
| Shopping | `shopping` | `lifeos_shopping` | name, desc, cat, price, store, bought, collId |
| Links | `links` | `lifeos_links` | title, url, desc, groupId, emoji, color, clicks |
| Link groups | `linkGroups` | `lifeos_link_groups` | id, name, desc |

Workspace values: any `workspaces[].id` (defaults `'personal'` / `'work'` always present unless user deleted them), or `null` (global, lists only).

`workspaces` is included in every export bundle (3 sites in JS) and restored by both restore-import and merge-import paths, with default-seeding fallback for older backups that omit the field.

### Backup payload metadata (v5.24.6+)

Every backup / cloud-sync payload carries these provenance fields alongside the data:
- `exportedAt` (ISO timestamp)
- `_deviceId` (random per-device id from `lifeos_device_id`)
- `_deviceName` (auto-detected from UA, override in Settings → Cloud sync → Device)

`cloudPull` and `cloudPeekStatus` read these to populate `lifeos_cloud_remote_sender` for the "Cloud last written by" UI. Old backups without `_device*` fields still restore cleanly — provenance just falls back to "Unknown device".

### Cloud sync localStorage keys (v5.22+)

| Key | Purpose | Set by |
|---|---|---|
| `lifeos_cloud_path` | path inside repo | Settings input |
| `lifeos_cloud_repo` | optional override repo | Settings input |
| `lifeos_cloud_last_pull` | ts of last successful pull | `cloudPull` |
| `lifeos_cloud_last_push` | ts of last successful push | `cloudPush` |
| `lifeos_cloud_sha` | cached file SHA for conflict guard | pull / push (never peek) |
| `lifeos_cloud_remote_sender` | JSON `{id,name,at}` | pull + peek + push |
| `lifeos_cloud_peek_last` | ts of last peek call | `cloudPeekStatus` |
| `lifeos_cloud_peek_commit` | commit SHA we last processed | `cloudPeekStatus` |
| `lifeos_device_id` | random per-device id (`d` + 8 chars) | `getDeviceId()` first call |
| `lifeos_device_name` | user override (else UA auto-detect) | Settings input |

## Version history

- **v5.14** — Global search palette (`Ctrl+K` / `/`, 9 entity types, keyboard nav, grouped results)
- **v5.15** — PWA (manifest, service worker, install/update banners, iOS/Android meta) + LO logo rebrand (Tracker → LifeOS) + mobile polish (16px inputs, 40px tap targets, safe-area insets, sandbox guard)
- **v5.16** — Fixed workspace dropdown bug (`saveTask` now reads `tk-workspace-sel`) + mobile bottom nav markup (hamburger + Home + FAB + Tasks + Bills, context-aware FAB across 9 pages)
- **v5.17** — Workspace-scoped lists: `workspace` field on lists, list picker in task modal, filter pills grouped by workspace, `saveTask` writes real `listId`
- **v5.17.1** — Removed dead floating Lists FAB + panel (and dead `tkRenderListFloating` renderer)
- **v5.17.2** — Workspace hygiene: "Fix task workspaces" migration modal (batch reclassify) + removed silent list-workspace override on every save (now only syncs on list change)
- **v5.17.3** — Links fixes: mobile-visible card actions (`hover:none` media query), per-group `+ link` shortcut, empty-group CTA
- **v5.17.4** — Keyboard shortcuts panel (`?` key)
- **v5.18** — Custom workspaces: first-class `workspaces` array, Manage Workspaces modal (🔧 button on Tasks filter row), dynamic per-workspace section rendering + filter pill groups, dynamic populates for task / lists / wsfix modals, defaults seed Personal+Work on first load
- **v5.18.1** — Mobile breakpoint expanded to `(pointer:coarse)` and SW switched to network-first for HTML navigations (deploys take effect on the very next page load)
- **v5.18.2** — JS touch detection: `body.touch-device` class with `!important` overrides forces mobile layout regardless of viewport. Solved a bug where the user's phone reported viewport >640px so the media query never fired. Added a small version stamp (`v · …px · touch:yes`) for debugging
- **v5.18.3** — `workspaces` added to every export bundle + both import paths (restore + merge) so backups round-trip cleanly. Version-stamp update deferred to `window.load`
- **v5.18.4** — Mobile UI overlap fixes: dropped `.mobile-nav` z-index from 380 → 100 so modals always sit above it; lifted toast / PWA install / PWA update / Shopping FAB above the bottom nav on touch devices
- **v5.19.0** — Storage quota safety: introduced `lsSet()` wrapper around 34 `localStorage.setItem` sites; on `QuotaExceededError` shows a single-shot toast (was silent data loss before)
- **v5.19.1** — Cleanup: workspace merge condition uses `Array.isArray(data.workspaces)` (was skipping empty arrays); fixed `ai-key-input` focus to use `querySelector('.ai-insight-key-input')` (the broken id never existed)
- **v5.19.2** — Universal Esc-key modal close: extended the keydown handler to call all 24 close functions (was 7); every modal now closes on Esc
- **v5.19.3** — Manual PWA install button in Settings → App section: handles 3 states (already installed / `beforeinstallprompt` available / not available → OS-specific instructions). Resets the 7-day dismissed cooldown on tap. Auto-updates on `appinstalled` event.
- **v5.19.4** — Theme audit (read-only Explore-agent report; informed v5.19.5)
- **v5.19.5** — Theme unification: added `--radius-sm: 4px`, `--radius-md: 8px`, `--shadow-lg`; routed 65 hardcoded `border-radius:8px`/`4px` instances through the new variables. Pixel-identical render. Future radius/shadow tweaks now one-line.
- **v5.19.6** — Perf pass: killed `backdrop-filter` blurs on touch devices (mobile-nav, all modal backdrops, sidebar overlay, task panel tint, banners). Three stacked blur layers were causing modal-open jank on phone GPUs. Compensated with slightly more opaque solid backgrounds. Desktop unchanged.
- **v5.19.7** — Monthly bill reset window: `isPaidThisCycle` for monthly bills now rolls over `RESET_LEAD_DAYS` (=10) days before each bill's own `dueDay`, not on the 1st of the next calendar month. Bills without a `dueDay` keep the old calendar-month fallback. Other cycles unchanged.
- **v5.20.0** — Source split: JS, CSS, and HTML template moved to `src/`; `build.js` (Node, no deps) inlines them as plaintext into `index.html` and `life_manager.html`. Drops the `eval(atob('…'))` wrapper and the `\uXXXX` escape dance entirely. `build.js` auto-bumps `service-worker.js` `const CACHE` from a content hash so the manual cache-bump rule is no longer needed. Build output ~129KB smaller than before because base64 + escapes are gone. Functionally identical to v5.19.7.
- **v5.20.1** — Inline subtask quick-toggle on task cards (no longer needs to open the modal to tick a subtask).
- **v5.20.2** — Subtasks expanded by default on task cards (was collapsed; the extra click hid useful info).
- **v5.20.3** — Quick-date buttons on task modal: Today / Tomorrow / This week.
- **v5.20.4** — Budget tracker per bill category: monthly cap + progress bar against current-cycle spend.
- **v5.20.5** — "Clear all data" button in Settings → Backup (wipes every LifeOS localStorage key in one shot, with confirm).
- **v5.20.6** — Bug fix: one-time bills were recurring across cycles. `isPaidThisCycle` now respects `cycle === 'one-time'` and uses the payment date directly.
- **v5.20.7** — One-time bills get a dedicated paid-section + "paid &lt;date&gt;" label (instead of being mixed into the recurring paid list).
- **v5.20.8** — UX fix: modals no longer close when the mouse is pressed inside and released outside (drag-out). Only true outside clicks close.
- **v5.20.9** — Day-of-month picker (calendar grid) for bill `dueDay` — replaces the 1–31 number input.
- **v5.20.10** — Priority shown via task title colour/weight, not a top stripe. Cleaner card; the stripe was visually noisy on small screens.
- **v5.21.0** — Tasks tab refresh (Phase 1): quick-add row at the top, date grouping (Overdue / Today / Tomorrow / This week / Later / No date), small polish across cards.
- **v5.21.1** — Tasks tab one-bucket-at-a-time view on mobile (calmer ADHD-friendly view): collapse all groups except the active one; tap header to switch.
- **v5.21.2** — Task card background tinted by workspace colour (subtle, low-opacity wash) so workspace context is glanceable.
- **v5.22.0** — **Cloud sync via GitHub**: pull/push the full backup JSON to a repo using the Contents API. `cloudPush` / `cloudPull` reuse `_buildBackupPayload()` and `applyRestore('replace')`; SHA cached in `lifeos_cloud_sha` for conflict avoidance. Routes through the AI proxy if set (same plumbing as `ghDeploy`).
- **v5.22.1** — Cloud sync status split into separate "Last pulled" and "Last pushed" timestamps (was a single ambiguous "Last synced").
- **v5.22.2** — Cloud sync data-repo override (`CLOUD_REPO_KEY` / `lifeos_cloud_repo` in localStorage). Lets the code repo stay public for GitHub Pages while data round-trips through a separate private repo (e.g. `Ariestotele/lifeos-data`). Clears cached SHA on override change to avoid cross-repo 409s.
- **v5.22.3** — Cloud push/pull surface GitHub's real error message (`r.json().message`) instead of bare `HTTP 401`. Mirrors `ghDeploy`'s pattern; turned a mystery "401" into "Bad credentials" which immediately identified a stale token on one device.
- **v5.23.0** — Bill cards tinted by category colour. Mirrors v5.21.2 task-card workspace tint; faint 8% alpha wash on the card background.
- **v5.23.1** — Edit workspaces from the Manage Workspaces modal. Pencil button toggles inline edit row for name + emoji + color; id stays stable.
- **v5.23.2** — Correctness sweep. Two inline-onclick string-interpolated IDs → `data-id` pattern (`deletePayment`, shopping coll switcher). 11 `localStorage.setItem` sites writing JSON now route through `lsSet()` so quota errors surface via toast.
- **v5.23.3** — Mobile tap-target uplift on touch: `modal-close-btn` 26→40px, `bill-icon-btn` 22→40px, `bill-card-btn-pay` 22→36px. Notes & Accounts edit/delete actions visible on touch (matching the Links v5.17.3 fix).
- **v5.23.4** — 120ms debounce on the 5 page-level search inputs (Bills / Tasks / Notes / Accounts / Links). Each was firing the page's `render*()` on every keystroke. Audit also flagged several false alarms (sidebar-overlay blur, subtask re-render storm, Chart.js leak, listener accumulation) — all already handled by earlier releases.
- **v5.24.0** — **Recurring tasks + universal pause**. Schema additions (backwards-compatible): `task.recur = {freq,interval}|null`, `task.paused = bool`. Recurring tasks stay as a single row in the list; on completion `dueDate` advances to next future occurrence (loop catches up missed dates) and a history entry is logged to `taskHistory`. Calendar derives occurrences in the visible month from `recur`. Universal pause: any task can be paused, lives in a new `Paused` bucket pill, dims to .6 opacity, has a pause button in the card action row.
- **v5.24.1** — **Force update button** in Settings → App. Unregisters every SW, deletes every Cache Storage cache, reloads with `?v=<ts>` cache-bust. Keeps localStorage intact. Escape hatch for the "stuck on old version" PWA scenario (Chrome can serve SW JS from HTTP cache for ≤24h, blocking auto-update detection).
- **v5.24.2** — Calendar grid + reminder banner fixes. `.cal-cell` was missing `min-width:0`, so wide event chips (e.g. "Plex Remote Access") blew out the 7-column layout into 3 squashed columns. Reminder banner was `position:sticky;top:-2rem` (desktop trick) which jammed against the status bar on phones — now `position:static` on touch. Version stamp `#version-stamp` hidden on touch (was overlapping the banner).
- **v5.24.3** — Paused-tab fallback hardened. The render fell back to `today` via `if(!buckets[selectedBucket])` when the truthiness check was unreliable; tightened to `_TK_DATE_GROUPS.indexOf(...) === -1`. Added `msgMap['paused']` so empty paused bucket has a friendly message. New **Cloud sync widget on the dashboard** (one-tap Pull / Push, in-place timestamp refresh, hides if creds not set).
- **v5.24.4** — Cloud push pre-check: before PUT, GET the current remote SHA and prompt the user if it differs from our cached one (friendlier than GitHub's 409). Tasks bucket **header** above body (e.g. `● PAUSED · 1 task`) so the active bucket is unmistakable — paused tasks kept their original due-date chip ("Today" if dueDate was today), making the body look identical to today's bucket.
- **v5.24.5** — **2-column task modal** on viewports >720px. Left: Title → Notes → Subtasks. Right: Priority+Due → Workspace+List → Repeats+Every → Pause → Tags → Color. Collapses to single column at ≤720px.
- **v5.24.6** — Workspace+List moved to the left column (joins identity/content fields). **Cloud sync device provenance**: per-device random `_deviceId` + auto-detected `_deviceName` (editable in Settings → Cloud sync → Device) stamped on every push payload. Pull reads + stores as `lifeos_cloud_remote_sender`. Settings + dashboard widget both show exact timestamps and "Cloud last written by `<Device>`".
- **v5.24.7** — **Persistent cloud-sync chip + popover**. Pill top-right of every page (`#cloud-chip`, fixed, z-index 155), theme-matched. States via class: `synced` (green dot, <2h), `dirty` (amber, <24h), `stale` (gray). Spinning icon while sync in flight. Auto-refreshes every 60s. Click → popover (z-index 170) with provenance + Pull/Push. Hides itself when creds aren't set.
- **v5.24.8** — Pulled / Pushed status now renders as two distinct cards (coloured border + uppercase header + relative time large, exact time small) via the `_cloudSyncRowHtml(direction, ts)` helper. Used in Settings status, dashboard widget, and chip popover. Task modal: Subtasks moved up to sit directly under Title (was under Notes) — quicker breakdown of work without scrolling past the Notes textarea.
- **v5.24.9** — Single-column task cards on mobile. `.tk-section-body` (by-workspace mode) was 2-col on every viewport. Added `@media(max-width:640px)` + `body.touch-device !important` overrides so it collapses on phones. (Over-corrected — see v5.24.11.)
- **v5.24.10** — **Passive cloud peek**. `cloudPeekStatus()` hits the GitHub Commits API for the file path (~1KB) every 5 min while tab is visible — and on visibility resume — to detect when another device pushed. Only fetches the full file (and refreshes `_deviceName`/`exportedAt`) when the commit SHA changed. **Never** writes `CLOUD_FILE_SHA_KEY` so push-conflict detection stays intact. Throttled to 30s min between calls. Chip gains `remote-new` state (pulsing blue accent) when cloud has data from another device newer than our last sync; label shows the other device's push age. Popover gains "NEW FROM ANOTHER DEVICE" banner + auto-promoted Pull button + manual `cloudPeekNow()` refresh link.
- **v5.24.11** — Tablet column fix. v5.24.9's `body.touch-device .tk-section-body{1fr}` was forcing single column on all touch devices regardless of viewport width — bad UX on tablets which have the horizontal space for 2 columns. Gated behind `@media(max-width:640px)` so phones still get 1-col and tablets get 2-col. Also updated `CLAUDE.md` for fresh-session handover.

Deploy note: `index.html` was brought up to v5.17+ parity via a dedicated commit ("Deploy v5.17 to index.html (mobile nav fix)") so the installed PWA at `/lifeos/` picks up all mobile-nav + workspace-lists work.

## Queued features

1. **Tasks Phase 2** — drag-to-reorder within a date bucket, swipe-to-complete on mobile (follow-up to v5.21) — medium
2. **Cloud sync — auto-push on change** (debounced) so the manual push button becomes optional — small/medium. Heuristic: any save through `saveTasks` / `saveData` / etc. sets a `dirty_since` timestamp; a 30s-idle debounce calls `cloudPush()` if dirty.
3. **Cross-device peek-to-toast** — when `cloudPeekStatus` first detects new data from another device, show a one-time toast ("Faris phone just pushed · tap to pull") in addition to the chip's pulsing state. Could surface via the existing `_pwaUpdateBanner` pattern.

Completed since the last memory catch-up (now in Version history): recurring tasks (v5.24.0), universal pause (v5.24.0), persistent cloud chip (v5.24.7), passive cloud peek (v5.24.10), device-stamped provenance (v5.24.6), the v5.23 audit batch (cards / mobile tap targets / search debounce / correctness sweep).

## Open reminders (carry forward across sessions)

- **Two local restore-point HTMLs are sitting in the repo root** waiting for confirm-stable + delete: `life_manager_before_audit.html` (pre-v5.23 audit batch), `life_manager_before_recurring.html` (pre-v5.24.0). Both `.gitignored`. Delete once the user confirms nothing has regressed in daily use.
- **Verify workspace export → import round-trip** on the user's device after v5.18.3 (create custom workspace, export backup, restore — should preserve). Still unverified.
- **Cloud sync: per-device token reality** — tokens are in `localStorage`, so adding a new device always means pasting the PAT once on that device. If a future "Bad credentials" report comes in, first thing to check is whether the device's stored token matches the other devices'. Re-paste the token, no code change needed.
- **Cloud sync: per-device deviceName reality** — same per-device pattern. New devices auto-detect a name from UA on first use (e.g. "Android phone", "Windows PC"). User can override in Settings → Cloud sync → Device.
- **Stuck-on-old-version PWA** — known scenario where Chrome serves SW JS from HTTP cache for up to 24h, so auto-update banner never fires. Solution: tell user to open the URL in a regular Chrome tab (not the PWA), or Android Settings → Apps → LifeOS → Storage → **Clear cache only** (NOT Clear data — wipes localStorage). Once they're on v5.24.1+ they have the in-app **Settings → App → "Force update now"** button as a permanent escape hatch.
- **Touch-device CSS overrides** can over-fire on wide tablets (touch-enabled desktops, iPads). Pattern v5.24.11 used: gate `body.touch-device` rules behind a width media query (`@media(max-width:640px)`) for layout-flow rules — keeps the desktop-style layout on tablets that have the space. Larger tap targets, bottom sheet panels, bottom nav, etc. can stay touch-only.
- **Paused tab perception issue** — paused tasks keep their original `dueDate` chip ("Today" if dueDate was today), making the paused bucket body look identical to today's bucket. v5.24.4 added a colored bucket header above the body (`● PAUSED · 1 task`) to disambiguate. If a user reports "Paused goes back to Today", first thing to ask: do they see the colored header?

## User context

- User: **Faris**, Abu Dhabi. Works in CUAS / field engineering.
- Uses LifeOS daily on Android as an installed PWA (offline-capable).
- Prefers short, direct updates; auto-merge workflow with PR links in the reply.
