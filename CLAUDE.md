# LifeOS — Session Notes

## Workflow preferences

After every push to a feature branch:
1. **Open a PR** to `main` automatically.
2. **Squash-merge** it automatically.
3. **Reply with both links** — the PR URL and the merge commit SHA/URL.

Don't pause to ask for confirmation on those steps.

## Project layout

- Working file: **`life_manager.html`** — edit this.
- **`index.html`** is the live deploy target; keep it **byte-identical** to `life_manager.html` after every commit (the installed PWA at `/lifeos/` points at `index.html`).
- `service-worker.js` at repo root.
- Standalone URL after deploy: `https://ariestotele.github.io/lifeos/life_manager.html`.

## Editing the base64 JS block

The entire JS is wrapped as `eval(atob('…'))`. For every edit:

1. Create a restore point: `cp life_manager.html life_manager_before_<feature>.html`.
2. Decode the base64 → modify the JS.
3. `node --check` the decoded JS before proceeding.
4. Escape all non-ASCII with `\uXXXX` (BMP) or surrogate pairs (astral / emoji) before re-encoding.
5. Use `data-id` attributes on `onclick` handlers (avoids quote-escaping bugs).
6. Bump `APP_VERSION` on every change.
7. Atomic write only — every assertion passes before any `f.write()`. Use a Python transform script with `sub_unique` style checks.

## Context

- User: Faris, Abu Dhabi. Daily-driver PWA on Android.
- Repo: `Ariestotele/lifeos`. Dev branch: `claude/continue-project-lts6k`.
