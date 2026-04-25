# LifeOS — Claude Project Memory

Personal productivity PWA. Single-file HTML app, deployed to GitHub Pages at `ariestotele.github.io/lifeos/`.

## Live URLs

- Default / installed PWA: https://ariestotele.github.io/lifeos/ (serves `index.html`)
- Standalone URL: https://ariestotele.github.io/lifeos/life_manager.html

## Tech stack

Vanilla JS, HTML/CSS, `localStorage`, Chart.js CDN. No frameworks. The entire JS block is base64-encoded via `eval(atob('...'))`. All non-ASCII must be escaped as `\uXXXX` (with surrogate pairs for codepoints above U+FFFF) before encoding. Always run `node --check` on the decoded JS before saving.

## Current version

**v5.18.4** (mobile UI overlap fixes — z-index + bottom-nav clearance).

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
- Repo: `Ariestotele/lifeos`. Dev branch: `claude/continue-project-lts6k`.

## Core editing rules (base64 JS block)

The entire JS is wrapped as `eval(atob('…'))`. For every edit:

1. Restore point: `cp life_manager.html life_manager_before_<feature>.html`.
2. Decode base64 → modify JS.
3. Run `node --check` on the decoded JS before re-encoding.
4. Escape non-ASCII with `\uXXXX` (BMP) or surrogate pairs (astral / emoji) before re-encoding.
5. Use `data-id` attributes on `onclick` handlers (avoids quote-escaping bugs).
6. Bump `APP_VERSION` on every change.
7. Surgical edits only — never rewrite large sections unless necessary.
8. Atomic writes — Python transform script with `sub_unique` style asserts; every assertion must pass before any `f.write()` / `os.replace()`.
9. Update **both** `life_manager.html` and `index.html` (byte-identical) in the same commit.
10. **Bump `service-worker.js` `CACHE` constant on every visible release** (e.g. `'lifeos-v5.18'` → `'lifeos-v5.19'`). The SW is cache-first; if `CACHE` doesn't change, installed PWAs keep serving the old HTML even after the new HTML is in cache. Skipping this silently breaks every fix for installed users.

## Architecture

- Two files deploy to GitHub Pages: `index.html` + `service-worker.js`.
- HTML is self-contained: inline manifest (data URI), inline SVG icons, inline CSS.
- Sandbox guard in `pwaInit()` skips SW registration on preview origins (Claude, CodeSandbox, `file://`, etc.).
- **Service worker (v5.18.1+)**: network-first for HTML navigations (deploys take effect on the very next load), cache-first for static assets (fonts, CDN, same-origin sub-resources). Still bump `CACHE` per release.
- **Mobile layout detection (v5.18.2+)**: `pwaInit()` adds `body.touch-device` when `'ontouchstart' in window || navigator.maxTouchPoints > 0`. All mobile chrome (bottom nav, task bottom sheet, sidebar slide, larger tap targets) is gated on this class with `!important` overrides — bypasses the unreliable `@media (max-width:640px)` breakpoint that didn't fire on some phones.
- **Version stamp (v5.18.2+)**: small `#version-stamp` div near the corner displays `v<APP_VERSION> · <viewport>px · touch:<yes|no>` for at-a-glance debugging. Update is deferred to `window.load` so the DOM element exists.
- z-index hierarchy: mobile-nav 100, page-header (sticky) 150, modal-backdrop 200, toast 300 (lifted on touch), sidebar overlay 399, sidebar 400, task panel 410, sh-coll-fab 501, settings/pay-popup 600, link-viewer 800, PWA banners 9999, version stamp 9999.

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
| Tasks | `tasks` | `subtracker_tasks` | title, notes, tags, priority, dueDate, workspace, listId, subtasks, done, starred |
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

Deploy note: `index.html` was brought up to v5.17+ parity via a dedicated commit ("Deploy v5.17 to index.html (mobile nav fix)") so the installed PWA at `/lifeos/` picks up all mobile-nav + workspace-lists work.

## Queued features

1. **Subtask quick-toggle** from task card (click subtask checkbox without opening modal) — small
2. **Quick-date buttons** on task modal (Today / Tomorrow / This week) — small
3. **Recurring tasks** — rrule-lite (daily/weekly/monthly + interval), generation on app load — large
4. **Budget tracker per bill category** — medium

## Open reminders (carry forward across sessions)

- Verify workspace **export → import round-trip** on the user's device after v5.18.3 (create custom workspace, export backup, restore — should preserve).
- Once the user confirms the mobile bar + modals are fully stable, **remove the temporary `#version-stamp` element** (HTML + CSS + JS update) — it was added in v5.18.2 for debugging and isn't intended to be permanent.

## User context

- User: **Faris**, Abu Dhabi. Works in CUAS / field engineering.
- Uses LifeOS daily on Android as an installed PWA (offline-capable).
- Prefers short, direct updates; auto-merge workflow with PR links in the reply.
