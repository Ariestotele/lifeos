// LifeOS build script.
//
// Combines src/index.html + src/styles.css + src/app.js into the deployed
// HTML pair (index.html and life_manager.html, kept byte-identical), and
// auto-bumps the service worker CACHE constant from a content hash so we
// can never accidentally ship stale cache.
//
// Run:  node build.js
//
// No dependencies; uses only node:fs and node:crypto.

const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const ROOT = __dirname;
const SRC  = path.join(ROOT, 'src');

const tpl = fs.readFileSync(path.join(SRC, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(SRC, 'styles.css'), 'utf8');
const js  = fs.readFileSync(path.join(SRC, 'app.js'),     'utf8');

// Build-time guards: the inline approach breaks if the JS or CSS contains
// HTML-parser-terminating sequences. Cheap insurance against future regressions.
if (js.includes('</script>')) {
  throw new Error('src/app.js contains "</script>" — would prematurely close the inline <script> tag.');
}
if (js.includes('<!--')) {
  throw new Error('src/app.js contains "<!--" — would start an HTML comment inside <script>.');
}
if (css.includes('</style>')) {
  throw new Error('src/styles.css contains "</style>" — would prematurely close the inline <style> tag.');
}
if (!tpl.includes('/*<!--CSS-->*/')) throw new Error('src/index.html missing /*<!--CSS-->*/ marker');
if (!tpl.includes('/*<!--JS-->*/'))  throw new Error('src/index.html missing /*<!--JS-->*/ marker');

// split().join() — dumb string substitution. Avoids String.replace's interpretation
// of $1, $&, $` etc. in the replacement string, which would silently corrupt JS
// containing regex literals or template strings.
const out = tpl
  .split('/*<!--CSS-->*/').join(css)
  .split('/*<!--JS-->*/').join(js);

// index.html and life_manager.html stay byte-identical (per project rule).
fs.writeFileSync(path.join(ROOT, 'index.html'),        out);
fs.writeFileSync(path.join(ROOT, 'life_manager.html'), out);

// Hash the output and inject it as the SW cache name. Manual cache bumps
// have been forgotten before, leading to stuck-on-stale-version bugs.
const hash = crypto.createHash('sha256').update(out).digest('hex').slice(0, 8);
const newCache = `lifeos-${hash}`;
const swPath = path.join(ROOT, 'service-worker.js');
let sw = fs.readFileSync(swPath, 'utf8');
const swBefore = sw;
sw = sw.replace(/const CACHE = ['"][^'"]*['"]/, `const CACHE = '${newCache}'`);
if (sw === swBefore) {
  throw new Error('service-worker.js: failed to find/replace the CACHE constant');
}
fs.writeFileSync(swPath, sw);

console.log(`built ${out.length.toLocaleString()} bytes  ·  CACHE=${newCache}`);
