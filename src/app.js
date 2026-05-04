
const COLORS=['none','#1D9E75','#4A8ECC','#C46A8A','#C97840','#7A74D4','#C98A1A','#6A9E30','#C95050','#888880'];
const CATCOLORS={Streaming:'#4A8ECC',Utilities:'#C97840',Software:'#7A74D4',Food:'#1D9E75',Housing:'#C98A1A',Health:'#C46A8A',Transport:'#6A9E30',Finance:'#888880',Other:'#5DCAA5'};
const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const APP_VERSION = '5.20.2';
const KEY_ITEMS='subtracker_items', KEY_PAY='subtracker_payments', KEY_TABBY='subtracker_tabby';
const KEY_LINKS='lifeos_links', KEY_LINK_GROUPS='lifeos_link_groups';
const KEY_WORKSPACES='lifeos_workspaces';
const KEY_TASKS='subtracker_tasks', KEY_TASK_HIST='subtracker_task_history', KEY_SHOPPING='lifeos_shopping', KEY_SH_LISTS='lifeos_sh_lists', KEY_LISTS='subtracker_lists', KEY_GOALS='subtracker_goals', KEY_NOTES='subtracker_notes', KEY_LOANS='subtracker_loans', KEY_ACCOUNTS='subtracker_accounts', KEY_NW='subtracker_networth', KEY_RECV='subtracker_receivables';

let items=[], payments=[], tabbyItems=[], editId=null, tabbyEditId=null, tabbyColor=COLORS[4];
let filterCat='All', selectedColor=COLORS[0];
let currentPage='active', toastTimer=null, deletedItem=null, deletedPayments=[];
let tasks=[], lists=[], tkEditId=null, deletedTask=null, tkSelectedColor=COLORS[0];
let tkFilterStatus='all', tkFilterPriority='all', tkFilterList='all', tkWorkspace='personal';
const WS_DEFAULTS=[{id:'personal',name:'Personal',emoji:'\uD83D\uDC64',color:'#7F77DD'},{id:'work',name:'Work',emoji:'\uD83D\uDCBC',color:'#378ADD'}];
let workspaces=[];
let links=[], linkGroups=[];
let shopping=[];
let shCollections=[];
let shoppingFilter='all';
let shCollView='all'; // 'all' | collection id
let taskHistory=[];
let modalSubtasks=[];
let goals=[], glEditId=null, glLogId=null, glFilterCat='all', glSelectedEmoji='\uD83C\uDFAF', glMsInputs=[];
let notes=[], qnEditId=null, qnFilterTag='all', qnSelectedColor='none', qnModalTags=[];
let loans=[], lnEditId=null;
let receivables=[], rvEditId=null;
let accounts=[], acEditId=null, acSelectedColor='#4A8ECC';
let nwHistory=[];
const AC_TYPES={savings:{label:'Savings',icon:'\uD83D\uDCB0',group:'liquid'},current:{label:'Current',icon:'\uD83C\uDFE6',group:'liquid'},cash:{label:'Cash',icon:'\uD83D\uDCB5',group:'liquid'},investment:{label:'Investment',icon:'\uD83D\uDCC8',group:'investments'},crypto:{label:'Crypto',icon:'\uD83D\uDC8E',group:'investments'},gold:{label:'Gold',icon:'\uD83E\uDD47',group:'investments'},fixeddeposit:{label:'Fixed Deposit',icon:'\uD83D\uDD12',group:'fixed'},other:{label:'Other',icon:'\uD83D\uDCCB',group:'liquid'}};
const AC_GROUPS={liquid:'Liquid / Cash',investments:'Investments',fixed:'Fixed / Term deposits'};
const AC_COLORS=['#4A8ECC','#1D9E75','#C98A1A','#C46A8A','#7A74D4','#C95050','#C97840','#5DCAA5','#888880'];
const LN_COLORS={personal:'#4A8ECC',car:'#1D9E75',mortgage:'#C98A1A',education:'#7A74D4',business:'#C46A8A',friendly:'#C46A8A',other:'#888880'};
const QN_COLORS=['none','#4A8ECC','#1D9E75','#C98A1A','#C46A8A','#7A74D4','#C95050','#C97840'];
const QN_COLOR_LABELS={'none':'Default','#4A8ECC':'Blue','#1D9E75':'Green','#C98A1A':'Amber','#C46A8A':'Pink','#7A74D4':'Purple','#C95050':'Red','#C97840':'Orange'};
const GL_EMOJIS=['\uD83C\uDFAF','\uD83D\uDCB0','\uD83C\uDFE0','\u2708\uFE0F','\uD83D\uDC8E','\uD83D\uDCC8','\uD83C\uDFCB\uFE0F','\uD83D\uDCDA','\uD83D\uDE97','\uD83D\uDCBB','\uD83C\uDF0D','\u2764\uFE0F','\uD83C\uDF93','\uD83C\uDFC6','\uD83C\uDF31','\u26A1','\uD83D\uDD11','\uD83D\uDEE1\uFE0F','\uD83C\uDFA8','\uD83C\uDFB5'];
const GL_FIN_SUBCATS=['Savings','Emergency fund','Investment','Debt payoff','Property','Business','Retirement','Other'];
const GL_PER_SUBCATS=['Travel','Fitness','Learning','Health','Relationship','Career','Hobby','Lifestyle','Other'];

/* &#9472;&#9472; Storage &#9472;&#9472; */
var _storageWarnedThisSession=false;
function _storageWriteFail(e,key){
  var quota = e && (e.name==='QuotaExceededError' || e.code===22 || e.code===1014 || e.name==='NS_ERROR_DOM_QUOTA_REACHED');
  if(quota){
    if(!_storageWarnedThisSession){
      _storageWarnedThisSession=true;
      try{toast('\u26A0 Storage full. Recent changes may not save. Export a backup, then clear old data.');}catch(_){}
    }
    try{console.warn('[storage] quota exceeded writing',key,e);}catch(_){}
  } else {
    try{console.warn('[storage] write failed',key,e);}catch(_){}
  }
}
function lsSet(key,value){
  try{ localStorage.setItem(key,value); return true; }
  catch(e){ _storageWriteFail(e,key); return false; }
}

function saveData(){
  lsSet(KEY_ITEMS,JSON.stringify(items));
  lsSet(KEY_PAY,JSON.stringify(payments));
  lsSet(KEY_TABBY,JSON.stringify(tabbyItems));
  asAutoSave();
}
function saveGoals(){lsSet(KEY_GOALS,JSON.stringify(goals));asAutoSave();}
function saveNotes(){lsSet(KEY_NOTES,JSON.stringify(notes));asAutoSave();}
function saveLoans(){lsSet(KEY_LOANS,JSON.stringify(loans));asAutoSave();}
function saveReceivables(){lsSet(KEY_RECV,JSON.stringify(receivables));asAutoSave();}
function saveAccounts(){lsSet(KEY_ACCOUNTS,JSON.stringify(accounts));asAutoSave();}
function saveNetWorth(){lsSet(KEY_NW,JSON.stringify(nwHistory));}



function tkToggleTree(key){
  var stateKey='tk-tree-'+key;
  var isOpen=localStorage.getItem(stateKey)!=='0';
  localStorage.setItem(stateKey,isOpen?'0':'1');
  var body=document.getElementById('tk-tree-body-'+key);
  var header=document.getElementById('tk-tree-hdr-'+key);
  if(body)body.classList.toggle('collapsed',isOpen);
  if(header)header.classList.toggle('open',!isOpen);
}


function tkAddToList(listId){
  openTaskModal();
  setTimeout(function(){
    var l=lists.find(function(x){return x.id===listId;});
    if(l&&l.workspace){
      var wsSel=document.getElementById('tk-workspace-sel');
      if(wsSel){wsSel.value=l.workspace;populateTkListSelect(listId,l.workspace);}
    }
    var sel=document.getElementById('tk-list-sel');
    if(sel)sel.value=listId;
  },80);
}

/* Inline subtask quick-toggle on task cards (v5.20.1).
   - tkToggleSubtasks(id): expand/collapse the subtask list on a card.
   - tkToggleSubtask(taskId, subId): flip a single subtask done state.
   Both re-render only the affected card via outerHTML, not the whole list. */
function tkToggleSubtasks(taskId){
  // v5.20.2: default is expanded. We persist '0' for *explicitly collapsed*
  // tasks; absence of the key means default (= expanded).
  var key='lifeos_tk_exp_'+taskId;
  if(localStorage.getItem(key)==='0') localStorage.removeItem(key);
  else lsSet(key,'0');
  var t=tasks.find(function(x){return x.id===taskId;});
  if(!t) return;
  var el=document.getElementById('task-'+taskId);
  if(el){
    var wrap=document.createElement('div');
    wrap.innerHTML=renderTaskCard(t);
    var fresh=wrap.firstElementChild;
    if(fresh) el.replaceWith(fresh);
  }
}
function tkToggleSubtask(taskId, subId){
  var t=tasks.find(function(x){return x.id===taskId;});
  if(!t || !t.subtasks) return;
  var s=t.subtasks.find(function(x){return x.id===subId;});
  if(!s) return;
  s.done=!s.done;
  saveTasks();
  var el=document.getElementById('task-'+taskId);
  if(el){
    var wrap=document.createElement('div');
    wrap.innerHTML=renderTaskCard(t);
    var fresh=wrap.firstElementChild;
    if(fresh) el.replaceWith(fresh);
  }
}

function tkAddWithTag(tagName){
  openTaskModal();
  setTimeout(function(){
    var inp=document.getElementById('tk-tags');
    if(inp&&!inp.value.trim())inp.value=tagName;
    else if(inp&&inp.value.indexOf(tagName)<0)inp.value=(inp.value?inp.value+', ':'')+tagName;
  },80);
}

function tkRenameTag(oldTag){
  // Inline rename -- show a small input overlay on the tag header
  var grpEl=document.getElementById('tk-grp-tag:'+oldTag);
  if(!grpEl)return;
  var nameEl=grpEl.querySelector('.sh-tree-name');
  if(!nameEl)return;

  // Build inline editor replacing the name span temporarily
  var prevText=nameEl.textContent;
  var inp=document.createElement('input');
  inp.value=oldTag;
  inp.style.cssText='background:var(--surface3);border:0.5px solid var(--accent-border);border-radius:5px;'
    +'color:var(--text);font-size:12px;font-weight:600;font-family:var(--font);padding:0 6px;'
    +'height:24px;min-width:80px;max-width:140px;outline:none;flex-shrink:0';
  inp.onclick=function(e){e.stopPropagation();};

  // Confirm button
  var okBtn=document.createElement('button');
  okBtn.innerHTML='&#10003;';
  okBtn.style.cssText='height:24px;padding:0 8px;border-radius:5px;border:none;'
    +'background:var(--accent);color:#000;font-size:11px;font-weight:700;cursor:pointer;flex-shrink:0;margin-left:4px';
  okBtn.onclick=function(e){e.stopPropagation();applyTagRename(oldTag,inp.value.trim().toLowerCase().replace(/[^a-z0-9\-_]/g,''));};

  // Cancel
  var cancelBtn=document.createElement('button');
  cancelBtn.innerHTML='&#10005;';
  cancelBtn.style.cssText='height:24px;padding:0 6px;border-radius:5px;border:0.5px solid var(--border2);'
    +'background:transparent;color:var(--text3);font-size:11px;cursor:pointer;flex-shrink:0;margin-left:3px';
  cancelBtn.onclick=function(e){e.stopPropagation();renderTasks();};

  // Replace name with editor row
  var wrap=document.createElement('div');
  wrap.style.cssText='display:flex;align-items:center;gap:0;flex:1';
  wrap.appendChild(inp);
  wrap.appendChild(okBtn);
  wrap.appendChild(cancelBtn);
  nameEl.replaceWith(wrap);
  inp.focus();inp.select();

  inp.onkeydown=function(e){
    if(e.key==='Enter'){e.preventDefault();applyTagRename(oldTag,inp.value.trim().toLowerCase().replace(/[^a-z0-9\-_]/g,''));}
    if(e.key==='Escape'){e.preventDefault();renderTasks();}
  };
}

function applyTagRename(oldTag, newTag){
  if(!newTag||newTag===oldTag){renderTasks();return;}
  var changed=0;
  tasks.forEach(function(t){
    if(!t.tags)return;
    var i=t.tags.indexOf(oldTag);
    if(i>-1){t.tags[i]=newTag;changed++;}
  });
  if(changed){
    saveTasks();
    toast('Tag renamed: #'+oldTag+' -> #'+newTag+' ('+changed+' task'+(changed!==1?'s':'')+')');
  }
  renderTasks();
}

function tkGrpToggle(key){
  var stKey='tk-grp-'+key;
  var isOpen=localStorage.getItem(stKey)!=='0';
  localStorage.setItem(stKey,isOpen?'0':'1');
  var body=document.getElementById('tk-grp-body-'+key);
  var header=document.getElementById('tk-grp-'+key);
  if(body)body.classList.toggle('collapsed',isOpen);
  if(header){var hdr=header.querySelector('.sh-tree-header');if(hdr)hdr.classList.toggle('open',!isOpen);}
}

function tkEditList(listId){
  openListsModal();
}


const GH_TOKEN_KEY = 'lifeos_gh_token';
const GH_REPO_KEY  = 'lifeos_gh_repo';
const GH_FILE_PATH = 'index.html';

function ghSaveToken(){
  var inp=document.getElementById('gh-token-input');
  if(!inp||!inp.value.trim()){inp&&inp.focus();return;}
  localStorage.setItem(GH_TOKEN_KEY, inp.value.trim());
  inp.value='';
  inp.placeholder='ghp_...'+localStorage.getItem(GH_TOKEN_KEY).slice(-4);
  ghUpdateTokenBadge();
  toast('GitHub token saved');
}

function ghUpdateTokenBadge(){
  var badge=document.getElementById('gh-token-status');
  if(!badge) return;
  var token=localStorage.getItem(GH_TOKEN_KEY);
  if(token){
    badge.textContent='Saved ghp_...'+token.slice(-4);
    badge.style.display='inline';
    badge.style.background='var(--positive-dim)';
    badge.style.color='var(--positive)';
    badge.style.border='0.5px solid var(--positive-border)';
  } else {
    badge.textContent='Not set';
    badge.style.display='inline';
    badge.style.background='var(--surface3)';
    badge.style.color='var(--text3)';
    badge.style.border='0.5px solid var(--border2)';
  }
}

function ghSaveRepo(){
  var inp=document.getElementById('gh-repo-input');
  if(!inp||!inp.value.trim()){inp&&inp.focus();return;}
  localStorage.setItem(GH_REPO_KEY, inp.value.trim());
  toast('Repo saved: ' + inp.value.trim());
}

function ghLoadSettings(){
  var repo=localStorage.getItem(GH_REPO_KEY)||'';
  var token=localStorage.getItem(GH_TOKEN_KEY)||'';
  var ri=document.getElementById('gh-repo-input');
  var ti=document.getElementById('gh-token-input');
  if(ri) ri.value=repo;
  if(ti && token) ti.placeholder='ghp_...'+token.slice(-4);
  ghUpdateTokenBadge();
}

function ghConfirmDeploy(){
  var token=localStorage.getItem(GH_TOKEN_KEY);
  var repo=localStorage.getItem(GH_REPO_KEY);
  if(!token||!repo){
    toast('Set your GitHub repo and token first');
    return;
  }
  var row=document.getElementById('gh-confirm-row');
  var repoSpan=document.getElementById('gh-confirm-repo');
  if(repoSpan) repoSpan.textContent=repo;
  if(row) row.style.display='block';
  var btn=document.getElementById('gh-deploy-btn');
  if(btn) btn.style.display='none';
}

function ghCancelDeploy(){
  var row=document.getElementById('gh-confirm-row');
  if(row) row.style.display='none';
  var btn=document.getElementById('gh-deploy-btn');
  if(btn) btn.style.display='';
}

async function ghDeploy(){
  var token=localStorage.getItem(GH_TOKEN_KEY);
  var repo=localStorage.getItem(GH_REPO_KEY);
  if(!token||!repo){
    toast('Set your GitHub repo and token in Settings first');
    return;
  }
  var btn=document.getElementById('gh-deploy-btn');
  var status=document.getElementById('gh-deploy-status');
  if(btn) btn.style.opacity='0.6';

  // Use Cloudflare proxy if set (required when running locally or in extension)
  var proxyBase=(aiGetProxy()||'').replace(/\/+$/,'');

  async function ghFetch(url, opts){
    if(proxyBase){
      var r=await fetch(proxyBase+'/github',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          url:url,
          method:opts.method||'GET',
          headers:opts.headers||{},
          body:opts.body||null
        })
      });
      return r;
    }
    return fetch(url, opts);
  }

  try{
    var apiBase='https://api.github.com/repos/'+repo+'/contents/'+GH_FILE_PATH;
    var ghHeaders={
      'Authorization':'token '+token,
      'Accept':'application/vnd.github.v3+json',
      'Content-Type':'application/json'
    };

    if(status) status.textContent='Getting current file SHA...';
    var sha=null;
    try{
      var shaRes=await ghFetch(apiBase,{headers:ghHeaders});
      if(shaRes.ok){var shaData=await shaRes.json();sha=shaData.sha;}
    }catch(fetchErr){
      if(!proxyBase){
        throw new Error('Network blocked. Add your Cloudflare Proxy URL in Settings (AI insights section) to enable deploy from here.');
      }
      throw fetchErr;
    }

    if(status) status.textContent='Encoding file...';
    // Close all modals so deployed file starts clean
    var _modals=['settings-modal','modal','tabby-modal','goal-modal','loan-modal','account-modal','shop-modal','note-modal','recv-modal','restore-modal','lists-modal','sh-coll-modal','link-modal','link-group-modal','pay-popup-wrap'];
    _modals.forEach(function(id){var el=document.getElementById(id);if(el&&el.style)el.style.display='none';});
    var content=document.documentElement.outerHTML;
    var encoded=btoa(unescape(encodeURIComponent(content)));

    if(status) status.textContent='Pushing to GitHub...';
    var body={message:'LifeOS v'+APP_VERSION+' - deployed from app',content:encoded,branch:'main'};
    if(sha) body.sha=sha;

    var pushRes=await ghFetch(apiBase,{method:'PUT',headers:ghHeaders,body:JSON.stringify(body)});

    if(!pushRes.ok){
      var err=await pushRes.json().catch(function(){return {};});
      throw new Error(err.message||'Push failed: HTTP '+pushRes.status);
    }

    if(status) status.textContent='Deployed! Live in ~30s';
    setTimeout(function(){if(status)status.textContent='Deploy index.html to your repo';},4000);
    toast('Deployed to GitHub! Changes live in ~30s');
    ghCancelDeploy();
  }catch(e){
    // If fetch is blocked (sandbox/extension), fall back to download + GitHub upload
    var isNetworkBlock = e.message==='Failed to fetch' || e.message.indexOf('NetworkError')>=0 || e.message.indexOf('fetch')>=0;
    if(isNetworkBlock){
      if(status) status.textContent='Network blocked - downloading file instead...';
      // Download the file
      var content=document.documentElement.outerHTML;
      var blob=new Blob([content],{type:'text/html'});
      triggerDownload(blob,'index.html');
      // Open GitHub upload page
      var repo=localStorage.getItem(GH_REPO_KEY)||'';
      if(repo){
        setTimeout(function(){
          window.open('https://github.com/'+repo+'/upload/main','_blank');
        }, 800);
      }
      if(status) status.textContent='File downloaded! Drag index.html to the GitHub tab.';
      toast('File downloaded - drag it into the GitHub upload page that opened');
    } else {
      if(status) status.textContent='Error: '+e.message;
      toast('Deploy failed: '+e.message);
    }
    ghCancelDeploy();
  }
  if(btn) btn.style.opacity='1';
}


function loadData(){
  try{const d=localStorage.getItem(KEY_ITEMS);if(d)items=JSON.parse(d);}catch(e){items=[];}
  try{const d=localStorage.getItem(KEY_PAY);if(d)payments=JSON.parse(d);}catch(e){payments=[];}
  try{const d=localStorage.getItem(KEY_TABBY);if(d)tabbyItems=JSON.parse(d);}catch(e){tabbyItems=[];}
  try{const d=localStorage.getItem(KEY_TASKS);if(d)tasks=JSON.parse(d);}catch(e){tasks=[];}
  try{const d=localStorage.getItem(KEY_TASK_HIST);if(d)taskHistory=JSON.parse(d);}catch(e){taskHistory=[];}
  try{const d=localStorage.getItem(KEY_LINKS);if(d)links=JSON.parse(d);}catch(e){links=[];}
  try{const d=localStorage.getItem(KEY_LINK_GROUPS);if(d)linkGroups=JSON.parse(d);}catch(e){linkGroups=[];}
  try{const d=localStorage.getItem(KEY_SHOPPING);if(d)shopping=JSON.parse(d);}catch(e){shopping=[];}
  try{const d=localStorage.getItem(KEY_SH_LISTS);if(d)shCollections=JSON.parse(d);}catch(e){shCollections=[];}
  try{const d=localStorage.getItem(KEY_LISTS);if(d)lists=JSON.parse(d);}catch(e){lists=[];}
  try{const d=localStorage.getItem(KEY_GOALS);if(d)goals=JSON.parse(d);}catch(e){goals=[];}
  try{const d=localStorage.getItem(KEY_NOTES);if(d)notes=JSON.parse(d);}catch(e){notes=[];}
  try{const d=localStorage.getItem(KEY_LOANS);if(d)loans=JSON.parse(d);}catch(e){loans=[];}
  try{const d=localStorage.getItem(KEY_RECV);if(d)receivables=JSON.parse(d);}catch(e){receivables=[];}
  try{const d=localStorage.getItem(KEY_ACCOUNTS);if(d)accounts=JSON.parse(d);}catch(e){accounts=[];}
  try{const d=localStorage.getItem(KEY_NW);if(d)nwHistory=JSON.parse(d);}catch(e){nwHistory=[];}
  try{const d=localStorage.getItem(KEY_WORKSPACES);if(d)workspaces=JSON.parse(d);}catch(e){workspaces=[];}
  if(!Array.isArray(workspaces)||!workspaces.length){workspaces=JSON.parse(JSON.stringify(WS_DEFAULTS));saveWorkspaces();}
  render();
  switchPage('dashboard');
  setTimeout(verSnapshot, 500); // snapshot initial state on load
}

/* &#9472;&#9472; Helpers &#9472;&#9472; */
function toMonthly(a,c){return c==='yearly'?a/12:c==='weekly'?a*4.33:c==='quarterly'?a/3:c==='once'?0:a;}
function billActiveInCycle(item, refDate){
  if(!item.startDate) return true;
  const startMs = new Date(item.startDate + '-01').getTime();
  const ce = cycleEnd(refDate || new Date());
  return startMs <= ce.getTime();
}

function billDuration(startDate){
  if(!startDate) return null;
  const start = new Date(startDate+'-01');
  const now   = new Date();
  let months  = (now.getFullYear()-start.getFullYear())*12+(now.getMonth()-start.getMonth());
  if(months < 0) return null;
  if(months === 0) return 'Started this month';
  const yrs = Math.floor(months/12), mo = months%12;
  if(yrs===0) return mo+'mo';
  if(mo===0)  return yrs+'yr';
  return yrs+'yr '+mo+'mo';
}

function billSinceLabel(startDate){
  if(!startDate) return null;
  const d = new Date(startDate+'-01');
  return 'Since '+MONTHS[d.getMonth()]+' '+d.getFullYear();
}
function toAnnual(a,c){return c==='yearly'?a:c==='weekly'?a*52:c==='quarterly'?a*4:a*12;}
function fmt(n){return n.toLocaleString('en',{minimumFractionDigits:2,maximumFractionDigits:2});}
function todayStr(){const t=new Date();return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;}

/* \u2500\u2500 Billing cycle \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
   CYCLE_START_DAY: the day of month the cycle begins.
   Default 1 (calendar month). User can change in Settings.
   Stored in localStorage as 'lifeos_cycle_start'.

   Example with day=26:
     If today = 28 Mar -> cycle = 26 Mar \u2013 25 Apr
     If today = 15 Mar -> cycle = 26 Feb \u2013 25 Mar
   \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
const CYCLE_KEY = 'lifeos_cycle_start';
// Bills flip from Paid -> Unpaid this many days before their own dueDay.
const RESET_LEAD_DAYS = 10;

function getCycleDay(){
  const v = parseInt(localStorage.getItem(CYCLE_KEY));
  return (!isNaN(v) && v >= 1 && v <= 28) ? v : 1;
}

function cycleStart(refDate){
  const d   = refDate || new Date();
  const day = getCycleDay();
  if(day <= 1) return new Date(d.getFullYear(), d.getMonth(), 1);
  if(d.getDate() >= day){
    return new Date(d.getFullYear(), d.getMonth(), day);
  } else {
    return new Date(d.getFullYear(), d.getMonth()-1, day);
  }
}

function cycleEnd(refDate){
  const start = cycleStart(refDate);
  const day   = getCycleDay();
  if(day <= 1){
    // ends last day of that calendar month
    return new Date(start.getFullYear(), start.getMonth()+1, 0);
  }
  // ends one day before same day next month (i.e. day-1 of next month)
  return new Date(start.getFullYear(), start.getMonth()+1, day-1);
}

function nextCycleStart(){
  // Returns the first date of the next billing cycle
  var e = cycleEnd();
  var d = new Date(e);
  d.setDate(d.getDate()+1);
  return d;
}
function nextCycleLabel(){
  return cycleLabel(nextCycleStart());
}

function cycleLabel(refDate){
  const s = cycleStart(refDate), e = cycleEnd(refDate);
  const day = getCycleDay();
  if(day <= 1){
    return s.toLocaleString('en',{month:'long',year:'numeric'});
  }
  return s.getDate()+' '+MONTHS[s.getMonth()]+' \u2013 '+
         e.getDate()+' '+MONTHS[e.getMonth()]+' '+e.getFullYear();
}

// Is a payment date within the current cycle?
function inCycle(dateStr, refDate){
  const d = new Date(dateStr);
  const s = cycleStart(refDate);
  const e = cycleEnd(refDate);
  e.setHours(23,59,59,999);
  return d >= s && d <= e;
}

// What actual date does a dueDay fall on in the current cycle?
function dueDateInCycle(dueDay, refDate){
  // Returns this calendar month's occurrence of dueDay (may be past or future)
  const d = refDate || new Date();
  return new Date(d.getFullYear(), d.getMonth(), dueDay);
}

// Returns the NEXT upcoming occurrence of dueDay (always in the future or today)
function nextDueDate(dueDay){
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), dueDay);
  if(thisMonth >= now) return thisMonth;
  return new Date(now.getFullYear(), now.getMonth()+1, dueDay);
}

function isOverdueCycle(item){
  if(!item.dueDay) return false;
  const due = dueDateInCycle(item.dueDay);
  return due < new Date() && !isPaidThisCycle(item);
}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

function cycleShort(c){return c==='monthly'?'mo':c==='yearly'?'yr':c==='weekly'?'wk':c==='quarterly'?'qtr':c==='once'?'once':c;}

/* Returns true if item has been paid within its current billing cycle.
   monthly   -> payment exists with date in current YYYY-MM
   quarterly -> payment exists in last 3 months
   yearly    -> payment exists in last 12 months
   weekly    -> payment exists in current ISO week (Mon\u2013Sun)              */
function isPaidThisCycle(item){
  if(!payments.length)return false;
  const itemPayments=payments.filter(p=>p.itemId===item.id);
  if(!itemPayments.length)return false;
  const now=new Date();
  const c=item.cycle;
  if(c==='monthly'){
    const dueDay = parseInt(item.dueDay)||0;
    if(!dueDay){
      // No dueDay set -> fall back to calendar-month behaviour
      const ym=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0');
      return itemPayments.some(p=>p.date&&p.date.slice(0,7)===ym);
    }
    // The cycle for this bill ends RESET_LEAD_DAYS before its next dueDay.
    const today = new Date(now.getFullYear(),now.getMonth(),now.getDate());
    let nextDue;
    if(now.getDate() < dueDay){
      nextDue = new Date(now.getFullYear(),now.getMonth(),dueDay);
    } else {
      nextDue = new Date(now.getFullYear(),now.getMonth()+1,dueDay);
    }
    const cycleResetDate = new Date(nextDue);
    cycleResetDate.setDate(cycleResetDate.getDate() - RESET_LEAD_DAYS);
    if(today >= cycleResetDate){
      // We're inside the 'next cycle' window -- need a payment dated at or after the reset.
      return itemPayments.some(p=>p.date && new Date(p.date) >= cycleResetDate);
    }
    // We're inside the current cycle (which started at the previous reset).
    const prevReset = new Date(cycleResetDate);
    prevReset.setMonth(prevReset.getMonth() - 1);
    return itemPayments.some(p=>{
      if(!p.date) return false;
      const pd = new Date(p.date);
      return pd >= prevReset && pd < cycleResetDate;
    });
  }
  if(c==='once'){
    return itemPayments.some(p=>inCycle(p.date));
  }
  if(c==='quarterly'){
    const cutoff=new Date(now.getFullYear(),now.getMonth()-2,1);
    return itemPayments.some(p=>new Date(p.date)>=cutoff);
  }
  if(c==='yearly'){
    const cutoff=new Date(now.getFullYear()-1,now.getMonth(),now.getDate());
    return itemPayments.some(p=>new Date(p.date)>=cutoff);
  }
  if(c==='weekly'){
    const day=now.getDay()||7;
    const mon=new Date(now);mon.setDate(now.getDate()-day+1);mon.setHours(0,0,0,0);
    return itemPayments.some(p=>new Date(p.date)>=mon);
  }
  return itemPayments.some(p=>inCycle(p.date));
}

function formatShortDate(dateStr){
  const d=new Date(dateStr);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

function trialDaysLeft(endDate){
  if(!endDate)return null;
  const diff=Math.ceil((new Date(endDate)-new Date())/(1000*60*60*24));
  return diff;
}

function dueLabel(d){
  if(!d)return null;
  const now=new Date();
  let due=new Date(now.getFullYear(),now.getMonth(),d);
  if(due<now)due=new Date(now.getFullYear(),now.getMonth()+1,d);
  const diff=Math.ceil((due-now)/(1000*60*60*24));
  if(diff<0)return{label:'Overdue',cls:'due-overdue'};
  if(diff===0)return{label:'Due today',cls:'due-soon'};
  if(diff<=5)return{label:`Due in ${diff}d`,cls:'due-soon'};
  return{label:`Day ${d}`,cls:'due-future'};
}

/* &#9472;&#9472; Toast with undo &#9472;&#9472; */
function toast(msg,undoable=false){
  document.getElementById('toast-msg').innerHTML=msg;
  const undoBtn=document.getElementById('toast-undo');
  undoBtn.style.display=undoable?'':'none';
  const el=document.getElementById('toast');
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>{el.classList.remove('show');deletedItem=null;deletedPayments=[];deletedTask=null;},undoable?5000:2400);
}
function undoDelete(){
  if(deletedItem){
    items.unshift(deletedItem);
    deletedPayments.forEach(p=>payments.unshift(p));
    deletedItem=null;deletedPayments=[];
    saveData();render();
    document.getElementById('toast').classList.remove('show');
    clearTimeout(toastTimer);
    toast(`Restored ${items[0].name}`);
  } else if(deletedTask){
    tasks.unshift(deletedTask);
    deletedTask=null;
    saveTasks();renderTasks();
    document.getElementById('toast').classList.remove('show');
    clearTimeout(toastTimer);
    toast(`Restored: ${tasks[0].title}`);
  }
}

/* &#9472;&#9472; Navigation &#9472;&#9472; */
function switchPage(p){
  currentPage=p;
  ['dashboard','active','tabby','trials','history','insights','calc','tasks','goals','calendar','notes','loans','receivables','accounts','networth','shopping','links'].forEach(x=>{
    document.getElementById('page-'+x).style.display=x===p?'':'none';
    const n=document.getElementById('nav-'+x);
    if(n)n.className='nav-item'+(x===p?' active':'');
  });
  // Sync mobile bottom nav
  ['active','tabby','tasks','dashboard'].forEach(x=>{
    const mb=document.getElementById('mnav-'+x);
    if(mb)mb.className='mobile-nav-btn'+(x===p?' active':'');
  });
  if(p==='history')renderHistory();
  if(p==='insights')renderInsights();
  if(p==='trials')renderTrials();
  if(p==='tabby')renderTabby();
  if(p==='calc')renderCalcPage();
  if(p==='tasks')renderTasks();
  if(p==='goals')renderGoals();
  if(p==='calendar')renderCalendar();
  if(p==='dashboard')renderDashboard();
  if(p==='notes')renderNotes();
  if(p==='loans')renderLoans();
  if(p==='receivables')renderReceivables();
  if(p==='accounts')renderAccounts();
  if(p==='networth')renderNetWorth();
  if(p==='shopping')renderShopping();
  if(p==='links')renderLinks();
  closeMobileSidebar();
  if(!_navEditing) renderNav();
}
function toggleSidebar(){
  const app=document.getElementById('app');
  const btn=document.getElementById('sidebar-btn');
  const collapsed=app.classList.toggle('collapsed');
  btn.innerHTML=collapsed?'&#8594;':'&#8592;';
}
function openMobileSidebar(){
  document.getElementById('sidebar').classList.add('mobile-open');
  document.getElementById('sidebar-overlay').classList.add('show');
}
function closeMobileSidebar(){
  document.getElementById('sidebar').classList.remove('mobile-open');
  document.getElementById('sidebar-overlay').classList.remove('show');
}
function handleMobileAdd(){
  switch(currentPage){
    case 'tasks':       openTaskModal(); break;
    case 'notes':       if(typeof openNoteModal==='function') openNoteModal(); break;
    case 'goals':       if(typeof openGoalModal==='function') openGoalModal(); break;
    case 'loans':       if(typeof openLoanModal==='function') openLoanModal(); break;
    case 'accounts':    if(typeof openAccountModal==='function') openAccountModal(); break;
    case 'receivables': if(typeof openRecvModal==='function') openRecvModal(); break;
    case 'shopping':    if(typeof openShopModal==='function') openShopModal(); break;
    case 'links':       if(typeof openLinkModal==='function') openLinkModal(); break;
    case 'tabby':       if(typeof openTabbyModal==='function') openTabbyModal(); else openModal();break;
    default:            openModal(); // bills default
  }
}

/* &#9472;&#9472; Main render &#9472;&#9472; */
function render(){
  const now=new Date();
  // cycle-aware paid filter
  const active=items.filter(i=>i.status==='active'&&!i.isTrial);
  const trials=items.filter(i=>i.isTrial);
  const monthly=active.reduce((s,i)=>s+toMonthly(i.amount,i.cycle),0);
  const annual=active.reduce((s,i)=>s+toAnnual(i.amount,i.cycle),0);
  const cyclePayments=payments.filter(p=>inCycle(p.date));
  const paidAmt=cyclePayments.reduce((s,p)=>s+p.amount,0);
  const paidCt=cyclePayments.length;
  const overdueCount=active.filter(i=>isOverdueCycle(i)).length;
  const expiringTrials=trials.filter(i=>{const d=trialDaysLeft(i.trialEnd);return d!==null&&d<=7&&d>=0;}).length;

  const tabbyNextTotal=tabbyItems.filter(t=>!t.instalments.every(i=>i.paid)).reduce((s,t)=>s+(t.total/4),0);
  const totalEntries=items.length+tabbyItems.length;

  document.getElementById('page-sub').innerHTML=`${cycleLabel()} &#183; ${totalEntries} entries`;

  document.getElementById('metrics').innerHTML=`
    <div class="metric"><div class="metric-label">Monthly</div><div class="metric-value">AED ${fmt(monthly)}</div><div class="metric-sub">${active.length} subs + ${tabbyItems.filter(t=>!t.instalments.every(i=>i.paid)).length} Tabby</div></div>
    <div class="metric"><div class="metric-label">Annual</div><div class="metric-value">AED ${fmt(annual)}</div><div class="metric-sub">projected</div></div>
    <div class="metric green clickable" onclick="showPaidBreakdown()" title="Click to see breakdown"><div class="metric-label">Paid this month &#9432;</div><div class="metric-value">AED ${fmt(paidAmt)}</div><div class="metric-sub">${paidCt} payment${paidCt!==1?'s':''}</div></div>
    <div class="metric${overdueCount>0?' red':''}" ><div class="metric-label">Overdue</div><div class="metric-value">${overdueCount}</div><div class="metric-sub">${overdueCount?'needs attention':'all clear'}</div></div>
    ${expiringTrials>0?`<div class="metric purple"><div class="metric-label">Trials expiring</div><div class="metric-value">${expiringTrials}</div><div class="metric-sub">within 7 days</div></div>`:''}
  `;

  // Trial expiry strip on active page
  const trialWrap=document.getElementById('trial-wrap');
  const expiringList=trials.filter(i=>trialDaysLeft(i.trialEnd)!==null&&trialDaysLeft(i.trialEnd)<=14).sort((a,b)=>new Date(a.trialEnd)-new Date(b.trialEnd));
  if(expiringList.length){
    trialWrap.innerHTML=`<div class="section-label">Trials expiring soon</div><div class="trial-strip">${expiringList.map(i=>{
      const d=trialDaysLeft(i.trialEnd);
      const color=i.color||CATCOLORS[i.cat]||'#888';
      const cls=d<0?'expired':d<=3?'urgent':'';
      const dayLabel=d<0?`Expired ${Math.abs(d)}d ago`:d===0?'Expires today':d===1?'Expires tomorrow':`Expires in ${d}d`;
      return `<div class="trial-card ${cls}" onclick="openModal('${i.id}')">
        <div style="display:flex;align-items:center;gap:6px"><div class="item-dot" style="background:${color}"></div><div class="trial-name">${esc(i.name)}</div></div>
        <div class="trial-days">${dayLabel}</div>
        <div class="trial-amt">AED ${fmt(i.amount)}/${i.cycle==='monthly'?'mo':i.cycle}</div>
      </div>`;
    }).join('')}</div>`;
  } else { trialWrap.innerHTML=''; }

  // Upcoming bills strip -- window wraps into next month correctly
  const today=now.getDate();
  const daysInCurMonth=new Date(now.getFullYear(),now.getMonth()+1,0).getDate();
  const nextMonthDate=new Date(now.getFullYear(),now.getMonth()+1,1);
  const nextYm=nextMonthDate.getFullYear()+'-'+String(nextMonthDate.getMonth()+1).padStart(2,'0');
  const overflow=Math.max(0,(today+14)-daysInCurMonth); // days spilling into next month
  const upcoming=[];
  active.forEach(i=>{
    if(!i.dueDay||isPaidThisCycle(i))return;
    const dueDate=dueDateInCycle(i.dueDay);
    const diff=Math.ceil((dueDate-now)/(1000*60*60*24));
    if(diff>=0&&diff<=14){
      const nextMonth=dueDate.getMonth()!==now.getMonth()||dueDate.getFullYear()!==now.getFullYear();
      upcoming.push({item:i,diff,nextMonth});
    }
  });
  upcoming.sort((a,b)=>a.diff-b.diff);
  const upWrap=document.getElementById('upcoming-wrap');
  if(upcoming.length){
    upWrap.innerHTML=`<div class="section-label">Upcoming &#8212; next 14 days</div><div class="upcoming-strip">${upcoming.map(({item:i,diff,nextMonth})=>{
      const color=i.color||CATCOLORS[i.cat]||'#888';
      const dayLabel=diff===0?'Today':diff===1?'Tomorrow':`In ${diff} days`;
      return `<div class="upcoming-card${diff<=3?' urgent':''}">
        <div style="display:flex;align-items:center;gap:6px"><div class="item-dot" style="background:${color}"></div><div class="upcoming-name">${esc(i.name)}</div></div>
        <div class="upcoming-day">${dayLabel}${nextMonth?' <span style="opacity:.6">(next mo)</span>':''}</div>
        <div class="upcoming-amt">AED ${fmt(i.amount)}</div>
      </div>`;
    }).join('')}</div>`;
  } else { upWrap.innerHTML=''; }

  // Category filter pills &#8212; regular items only (trials excluded)
  const regularItems=items.filter(i=>!i.isTrial);
  const cats=['All','Tabby',...new Set(regularItems.map(i=>i.cat))];
  document.getElementById('filters').innerHTML=cats.map(c=>`<button class="pill${filterCat===c?' active':''}" onclick="setFilter('${c}')">${c}</button>`).join('');

  const q=(document.getElementById('search').value||'').toLowerCase();
  const sortVal=document.getElementById('sort').value;

  // Build unified list: regular items + tabby items tagged with _tabby:true
  const tabbyAsItems=tabbyItems.map(t=>{
    const paidCount=t.instalments.filter(i=>i.paid).length;
    const nextInst=t.instalments.find(i=>!i.paid);
    return{
      _tabby:true,id:t.id,name:t.name,cat:'Tabby',
      color:t.color||'#C98A1A',notes:t.notes||'',
      _paidCount:paidCount,_total:t.total,_nextInst:nextInst,
      _complete:paidCount===4,_raw:t,
      amount:nextInst?t.total/4:0,cycle:'monthly',status:'active',
      dueDay:nextInst?new Date(nextInst.date).getDate():null
    };
  });

  let visRegular=filterCat==='Tabby'?[]:filterCat==='All'?regularItems:regularItems.filter(i=>i.cat===filterCat);
  let visTabby=filterCat==='All'||filterCat==='Tabby'?tabbyAsItems:[];

  if(q){
    visRegular=visRegular.filter(i=>i.name.toLowerCase().includes(q)||i.cat.toLowerCase().includes(q)||(i.notes||'').toLowerCase().includes(q));
    visTabby=visTabby.filter(i=>i.name.toLowerCase().includes(q)||(i.notes||'').toLowerCase().includes(q));
  }

  let vis=[...visRegular,...visTabby];
  if(sortVal==='name')vis.sort((a,b)=>a.name.localeCompare(b.name));
  else if(sortVal==='amount-desc')vis.sort((a,b)=>toMonthly(b.amount,b.cycle)-toMonthly(a.amount,a.cycle));
  else if(sortVal==='amount-asc')vis.sort((a,b)=>toMonthly(a.amount,a.cycle)-toMonthly(b.amount,b.cycle));
  else if(sortVal==='due')vis.sort((a,b)=>(a.dueDay||99)-(b.dueDay||99));

  if(!vis.length){
    document.getElementById('items').innerHTML=`<div class="empty">${(items.length||tabbyItems.length)?'No entries match your search':'Add your first subscription or bill to get started<br><span class="kbd-hint">Tip: press <kbd>N</kbd> anywhere to quickly add a new entry</span>'}</div>`;
    return;
  }
  const ymCur=new Date().toISOString().slice(0,7);
  const visUnpaid=vis.filter(item=>item._tabby?!item._complete:(!isPaidThisCycle(item)&&item.status!=='paused'));
  const visPaid=vis.filter(item=>item._tabby?item._complete:(isPaidThisCycle(item)||item.status==='paused'));
  const unpaidMo=visUnpaid.reduce((s,i)=>s+(i._tabby?i.amount:toMonthly(i.amount,i.cycle)),0);
  const paidMo=visPaid.reduce((s,i)=>s+(i._tabby?i.amount:toMonthly(i.amount,i.cycle)),0);
  const unpaidHTML=visUnpaid.map(item=>item._tabby?renderTabbyActiveItem(item):renderItemCard(item,ymCur)).join('');
  const paidHTML2=visPaid.map(item=>item._tabby?renderTabbyActiveItem(item):renderItemCard(item,ymCur)).join('');
  document.getElementById('items').innerHTML=
    '<div class="bills-two-col">'+
      '<div class="bills-col">'+
        '<div class="bills-col-header">'+
          '<span class="bills-col-title">Unpaid <span style="color:var(--red);margin-left:4px">'+visUnpaid.length+'</span></span>'+
          '<span class="bills-col-sum">AED '+fmt(unpaidMo)+'/mo</span>'+
        '</div>'+
        (unpaidHTML||'<div class="db-empty" style="padding:1rem 0">All clear</div>')+
      '</div>'+
      '<div class="bills-col">'+
        '<div class="bills-col-header">'+
          '<span class="bills-col-title">Paid <span style="color:var(--positive);margin-left:4px">'+visPaid.length+'</span></span>'+
          '<span class="bills-col-sum">AED '+fmt(paidMo)+'/mo</span>'+
        '</div>'+
        (paidHTML2||'<div class="db-empty" style="padding:1rem 0">Nothing paid yet</div>')+
      '</div>'+
    '</div>';
  checkReminders();
}

function renderItem(item,ym){
  const due=dueLabel(item.dueDay),mAmt=toMonthly(item.amount,item.cycle);
  const isP=item.status==='paused';
  const thisMonthPayment=payments.filter(p=>p.itemId===item.id).sort((a,b)=>new Date(b.date)-new Date(a.date))[0];
  const paidNow=isPaidThisCycle(item);
  const showDue=due&&!(paidNow&&due.cls==='due-overdue');
  const color=(item.color&&item.color!=='none')?item.color:(CATCOLORS[item.cat]||'#888');
  // Last paid date (most recent payment of any month)
  const allPayments=payments.filter(p=>p.itemId===item.id).sort((a,b)=>new Date(b.date)-new Date(a.date));
  const lastPaid=allPayments[0];
  // Days until paid state resets &#8212; use dueDay if set, else first of next month
  const now=new Date();
  let daysUntilReset;
  let resetDate;
  if(item.dueDay){
    const nextDue=nextDueDate(item.dueDay);
    daysUntilReset=Math.ceil((nextDue-now)/(1000*60*60*24));
    resetDate=nextDue;
  } else {
    const nextMonth=new Date(now.getFullYear(),now.getMonth()+1,1);
    daysUntilReset=Math.ceil((nextMonth-now)/(1000*60*60*24));
    resetDate=nextMonth;
  }
  const resetDateStr=`${resetDate.getDate()} ${MONTHS[resetDate.getMonth()]}`;
  const resetLabel=daysUntilReset===0?`resets today (${resetDateStr})`:daysUntilReset===1?`resets tomorrow (${resetDateStr})`:`resets in ${daysUntilReset}d &#183; ${resetDateStr}`;
  const paidMeta=paidNow
    ? `<span class="sep">&#183;</span><span style="color:var(--positive);font-size:11px">resets in ${daysUntilReset===0?'today':daysUntilReset===1?'1d':daysUntilReset+'d'}</span>`
    : lastPaid
      ? `<span class="sep">&#183;</span><span style="color:var(--text3);font-size:11px">last paid ${formatShortDate(lastPaid.date)}</span>`
      : '';
  const resetChip='';
  return `<div class="item${isP?' paused':''}${item.isTrial?' trial-item':''}" id="bill-${item.id}">
    <div class="item-dot" style="background:${color}"></div>
    <div>
      <div class="item-name">
        <span>${esc(item.name)}</span>
        ${item.dueDay&&!item.isTrial?`<span style="font-size:11px;font-weight:400;color:var(--text3)">${(()=>{const nd=nextDueDate(item.dueDay);return nd.getDate()+' '+MONTHS[nd.getMonth()];})()} </span>`:''}
        ${isP?'<span class="badge badge-paused">paused</span>':''}
        ${paidNow?'<span class="badge badge-paid">paid</span>':''}
        ${item.isTrial?`<span class="badge ${trialDaysLeft(item.trialEnd)<0?'badge-trial-expired':trialDaysLeft(item.trialEnd)<=3?'badge-trial-urgent':'badge-trial'}">${trialBadgeLabel(item.trialEnd)}</span>`:''}
      </div>
      <div class="item-meta"><span>${item.cat}</span>${item.payAccountId&&!item.isTrial?(()=>{const _a=accounts.find(a=>a.id===item.payAccountId);return _a?`<span style="font-size:11px;color:var(--accent);opacity:.7">&#8594; ${esc(_a.name)}</span>`:''})():''}${resetChip}${showDue?`<span class="item-due ${due.cls}">${due.label}</span>`:''}${!isP&&!item.isTrial?paidMeta:''}</div>
      ${item.notes?`<div class="item-notes">${esc(item.notes)}</div>`:''}
    </div>
    <div>
        <div class="item-amount">AED ${fmt(item.amount)}${item.cycle!=='once'?`<span style="font-size:11px;font-weight:400;color:var(--text3)"> / ${cycleShort(item.cycle)}</span>`:''}</div>
        ${item.cycle!=='monthly'&&item.cycle!=='once'?`<div class="item-amount-sub">&#8776; AED ${Math.round(mAmt)}/mo</div>`:''}
        ${item.cycle==='once'?'<div class="item-amount-sub" style="color:var(--accent)">One-time</div>':''}
      </div>
    <div class="item-actions">
      ${!isP&&!item.isTrial?`<button class="icon-btn pay${paidNow?' done':''}" onclick="togglePaid('${item.id}')" title="${paidNow?'Click to unpay':'Mark as paid'}">&#10003; Paid</button>`:''}
      <button class="icon-btn" onclick="duplicateItem('${item.id}')" title="Duplicate">&#10697;</button>
      <button class="icon-btn" onclick="openModal('${item.id}')" title="Edit">&#9998;</button>
      <button class="icon-btn del" onclick="deleteItem('${item.id}')" title="Delete">&#10005;</button>
    </div>
  </div>`;
}



function renderItemCard(item,ym){
  var due=dueLabel(item.dueDay);
  var mAmt=toMonthly(item.amount,item.cycle);
  var isP=item.status==='paused';
  var paidNow=isPaidThisCycle(item);
  var isOD=isOverdueCycle(item)&&!paidNow;
  var color=(item.color&&item.color!=='none')?item.color:(CATCOLORS[item.cat]||'#888');
  var lastPaid=payments.filter(function(p){return p.itemId===item.id;}).sort(function(a,b){return new Date(b.date)-new Date(a.date);})[0];
  var now=new Date();
  var dur=item.dueDay?Math.ceil((nextDueDate(item.dueDay)-now)/(1000*60*60*24)):Math.ceil((new Date(now.getFullYear(),now.getMonth()+1,1)-now)/(1000*60*60*24));
  var showDue=due&&!(paidNow&&due.cls==='due-overdue');
  var linkedAc=item.payAccountId?accounts.find(function(a){return a.id===item.payAccountId;}):null;

  // Build meta row
  var meta='<span>'+esc(item.cat)+'</span>';
  if(linkedAc) meta+='<span class="bill-sep">&middot;</span><span class="bill-card-account">&#8594; '+esc(linkedAc.name)+'</span>';
  if(showDue)  meta+='<span class="bill-sep">&middot;</span><span class="item-due '+due.cls+'">'+due.label+'</span>';
  if(!isP&&!item.isTrial){
    if(paidNow)        meta+='<span class="bill-sep">&middot;</span><span style="color:var(--positive);font-size:11px">resets in '+(dur<=0?'today':dur+'d')+'</span>';
    else if(lastPaid)  meta+='<span class="bill-sep">&middot;</span><span style="color:var(--text3);font-size:11px">last paid '+formatShortDate(lastPaid.date)+'</span>';
  }

  // Badges
  var badges='';
  if(isOD)           badges+='<span class="badge badge-overdue">overdue</span> ';
  if(isP)            badges+='<span class="badge badge-paused">paused</span> ';
  if(paidNow&&!isP)  badges+='<span class="badge badge-paid">paid</span> ';
  if(item.isTrial)   badges+='<span class="badge '+(trialDaysLeft(item.trialEnd)<0?'badge-trial-expired':trialDaysLeft(item.trialEnd)<=3?'badge-trial-urgent':'badge-trial')+'">'+trialBadgeLabel(item.trialEnd)+'</span>';

  // Amount subline
  var amtSub='';
  if(item.cycle!=='monthly'&&item.cycle!=='once') amtSub='<div class="bill-card-amt-sub">&#8776; AED '+Math.round(mAmt)+'/mo</div>';
  else if(item.cycle==='once') amtSub='<div class="bill-card-amt-sub" style="color:var(--accent)">One-time</div>';

  // Pay button using data-id to avoid quote escaping issues
  var payBtn='';
  if(!isP&&!item.isTrial){
    if(paidNow) payBtn='<button class="bill-card-btn-pay unpay" data-id="'+item.id+'" onclick="togglePaid(this.dataset.id)">&#8617; Unpay</button>';
    else        payBtn='<button class="bill-card-btn-pay" data-id="'+item.id+'" onclick="togglePaid(this.dataset.id)">&#10003; Mark paid</button>';
  }

  // SVG icons \u2014 inline, no escaping issues since we use double-quotes inside single-quoted strings
  var svgE='<svg viewBox="0 0 12 12" width="11" height="11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 1.5l2 2-6 6H2.5v-2l6-6z"/><path d="M7 3l2 2"/></svg>';
  var svgD='<svg viewBox="0 0 12 12" width="11" height="11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="1" width="7" height="7" rx="1"/><rect x="1" y="4" width="7" height="7" rx="1"/></svg>';
  var svgX='<svg viewBox="0 0 12 12" width="11" height="11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h8M5 3V2h2v1M4 3l.5 6.5h3L8 3"/></svg>';

  var cls='bill-card'+(paidNow?' bill-card-paid':'')+(isOD?' bill-card-overdue':'')+(isP?' bill-card-paused':'');

  var h='<div class="'+cls+'" id="bill-'+item.id+'" style="border-left-color:'+color+'">';
  h+='<div class="bill-card-top">';
  h+='<div class="bill-card-name">'+esc(item.name)+(badges?' '+badges:'')+'</div>';
  h+='<div class="bill-card-amt-wrap"><div class="bill-card-amt">AED '+fmt(item.amount);
  if(item.cycle!=='once') h+='<span class="bill-card-cycle"> / '+cycleShort(item.cycle)+'</span>';
  h+='</div>'+amtSub+'</div>';
  h+='</div>';
  h+='<div class="bill-card-meta">'+meta+'</div>';
  if(item.notes) h+='<div class="bill-card-notes">'+esc(item.notes)+'</div>';
  h+='<div class="bill-card-actions">';
  h+=payBtn;
  h+='<button class="bill-icon-btn" data-id="'+item.id+'" onclick="openModal(this.dataset.id)" title="Edit">'+svgE+'</button>';
  h+='<button class="bill-icon-btn" data-id="'+item.id+'" onclick="duplicateItem(this.dataset.id)" title="Duplicate">'+svgD+'</button>';
  h+='<button class="bill-icon-btn del" data-id="'+item.id+'" onclick="deleteItem(this.dataset.id)" title="Delete">'+svgX+'</button>';
  h+='</div></div>';
  return h;
}

function renderTabbyActiveItem(item){
  var t=item._raw;
  var paidCount=item._paidCount;
  var complete=item._complete;
  var next=item._nextInst;
  var color=item.color||'#C98A1A';
  var pct=Math.round(paidCount/4*100);
  var nextLabel='';
  if(next&&!complete){
    var dtt=Math.ceil((new Date(next.date)-new Date())/(1000*60*60*24));
    if(dtt<0)        nextLabel='<span class="item-due due-overdue">Overdue</span>';
    else if(dtt===0) nextLabel='<span class="item-due due-soon">Due today</span>';
    else if(dtt<=5)  nextLabel='<span class="item-due due-soon">In '+dtt+'d</span>';
    else             nextLabel='<span style="color:var(--accent);font-size:11px">'+formatShortDate(next.date)+'</span>';
  }
  var svgView='<svg viewBox="0 0 12 12" width="11" height="11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 6s2-4 5-4 5 4 5 4-2 4-5 4-5-4-5-4z"/><circle cx="6" cy="6" r="1.5"/></svg>';
  var svgX='<svg viewBox="0 0 12 12" width="11" height="11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h8M5 3V2h2v1M4 3l.5 6.5h3L8 3"/></svg>';
  var cls='bill-card'+(complete?' bill-card-paid':'');
  var h='<div class="'+cls+'" style="border-left-color:'+color+'">';
  h+='<div class="bill-card-top">';
  h+='<div class="bill-card-name">'+esc(t.name)+' <span class="badge-tabby">'+paidCount+'/4</span>'+(complete?' <span class="badge badge-paid">complete</span>':'')+'</div>';
  h+='<div class="bill-card-amt-wrap"><div class="bill-card-amt">AED '+fmt(t.total/4)+'<span class="bill-card-cycle"> / inst</span></div>';
  h+='<div class="bill-card-amt-sub">AED '+fmt(t.total)+' total</div></div>';
  h+='</div>';
  h+='<div class="bill-card-meta"><span>Tabby</span><span class="bill-sep">&middot;</span><span>'+paidCount+' of 4 paid</span>';
  if(nextLabel) h+='<span class="bill-sep">&middot;</span>'+nextLabel;
  if(t.notes)   h+='<span class="bill-sep">&middot;</span><span style="font-style:italic">'+esc(t.notes)+'</span>';
  h+='</div>';
  h+='<div style="height:3px;background:var(--surface3);border-radius:99px;margin-top:7px;overflow:hidden">';
  h+='<div style="height:100%;border-radius:99px;background:var(--amber);width:'+pct+'%;transition:width .4s ease"></div></div>';
  h+='<div class="bill-card-actions">';
  if(!complete) h+='<button class="bill-card-btn-pay" data-id="'+t.id+'" onclick="markNextInstalment(this.dataset.id)">&#10003; Pay</button>';
  h+='<button class="bill-icon-btn" onclick="switchPage(\'tabby\')" title="View in Tabby">'+svgView+'</button>';
  h+='<button class="bill-icon-btn del" data-id="'+t.id+'" onclick="deleteTabbyItem(this.dataset.id)" title="Delete">'+svgX+'</button>';
  h+='</div></div>';
  return h;
}
function markNextInstalment(id){
  const t=tabbyItems.find(t=>t.id===id);if(!t)return;
  const idx=t.instalments.findIndex(i=>!i.paid);
  if(idx===-1)return;
  const synth={
    id:'tabby__'+id+'__'+idx,
    name:t.name+' (Instalment '+(idx+1)+'/4)',
    amount:parseFloat((t.total/4).toFixed(2)),
    payAccountId:t.payAccountId||null,
  };
  showPayFromPopup(synth);
}

function doConfirmTabby(tabbyId,tabbyIdx,acId){
  const t=tabbyItems.find(t=>t.id===tabbyId);if(!t)return;
  const inst=t.instalments[tabbyIdx];if(!inst||inst.paid)return;
  inst.paid=true;
  const payId='tabby_'+tabbyId+'_'+tabbyIdx;
  const instDate=inst.date||todayStr();
  payments.unshift({
    id:payId,itemId:'tabby_'+tabbyId,
    name:t.name+' (Tabby '+(tabbyIdx+1)+')',
    cat:t.cat||'Other',amount:t.total/4,date:instDate,
    note:'Tabby instalment '+(tabbyIdx+1),
    deductedAccountId:acId||null
  });
  if(acId){
    const ac=accounts.find(a=>a.id===acId);
    if(ac){
      ac.balance=parseFloat((parseFloat(ac.balance)-(t.total/4)).toFixed(2));
      ac.updatedAt=Date.now();
      ac.history=ac.history||[];
      ac.history.push({balance:ac.balance,date:todayStr(),note:'Tabby: '+t.name+' inst '+(tabbyIdx+1)});
      if(ac.history.length>24)ac.history=ac.history.slice(-24);
      saveAccounts();
      if(currentPage==='accounts')renderAccounts();
      if(currentPage==='networth')renderNetWorth();
    }
  }
  saveData();render();renderTabby();
  const allPaid=t.instalments.every(i=>i.paid);
  toast(allPaid?t.name+' fully paid off!':'Instalment '+(tabbyIdx+1)+' paid'+(acId?' - deducted':''));
}
function trialBadgeLabel(endDate){
  const d=trialDaysLeft(endDate);
  if(d===null)return 'trial';
  if(d<0)return 'trial ended';
  if(d===0)return 'trial ends today';
  return `trial: ${d}d left`;
}

/* &#9472;&#9472; Trials page &#9472;&#9472; */
function renderTrials(){
  const trials=items.filter(i=>i.isTrial);
  const ym=new Date().toISOString().slice(0,7);
  if(!trials.length){
    document.getElementById('trials-list').innerHTML=`<div class="empty">No free trials tracked yet.<br><span class="kbd-hint">Add a trial by checking "This is a free trial" when adding an entry.</span></div>`;
    return;
  }
  const sorted=[...trials].sort((a,b)=>new Date(a.trialEnd||'9999')-new Date(b.trialEnd||'9999'));
  document.getElementById('trials-list').innerHTML=`<div class="items">${sorted.map(item=>renderItem(item,ym)).join('')}</div>`;
}

/* &#9472;&#9472; History &#9472;&#9472; */
function renderHistory(){
  // Build unified history: payments + completed tasks (current + archived)
  const allDoneTasks = [
    ...tasks.filter(t=>t.done&&t.doneAt),
    ...(taskHistory||[])
  ];

  if(!payments.length && !allDoneTasks.length){
    document.getElementById('history-list').innerHTML='<div class="empty">No history yet.</div>';
    return;
  }

  // Tabs
  const activeTab = localStorage.getItem('history-tab')||'bills';
  const tabBar = '<div style="display:flex;gap:0;margin-bottom:1.25rem;border-bottom:0.5px solid var(--border)">'
    + ['bills','tasks'].map(t=>`<button onclick="switchHistoryTab('${t}')" style="padding:8px 18px;font-size:13px;font-weight:500;cursor:pointer;color:${t===activeTab?'var(--text)':'var(--text3)'};border:none;border-bottom:2px solid ${t===activeTab?'var(--accent)':'transparent'};margin-bottom:-0.5px;background:transparent;font-family:var(--font);transition:all .18s">${t==='bills'?'&#9672; Bills & Payments':'&#9635; Completed Tasks'}</button>`).join('')
    +'</div>';

  let content = '';

  if(activeTab==='bills'){
    if(!payments.length){ content='<div class="empty">No payments recorded yet.</div>'; }
    else {
      const sorted=[...payments].sort((a,b)=>new Date(b.date)-new Date(a.date));
      const groups={};
      sorted.forEach(p=>{
        const d=new Date(p.date);
        const key=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
        const label=MONTHS[d.getMonth()]+' '+d.getFullYear();
        if(!groups[key])groups[key]={label,list:[],total:0};
        groups[key].list.push(p);groups[key].total+=p.amount;
      });
      content=Object.keys(groups).sort((a,b)=>b.localeCompare(a)).map(key=>{
        const g=groups[key];
        return '<div class="history-group">'
          +'<div class="history-month-row"><div class="history-month">'+g.label+'</div><div class="month-total">AED '+fmt(g.total)+'</div></div>'
          +g.list.map(p=>{
            const item=items.find(i=>i.id===p.itemId);
            const color=item?(item.color||CATCOLORS[item.cat]||'#888'):'#888';
            const d=new Date(p.date);
            return '<div class="history-item">'
              +'<div class="item-dot" style="background:'+color+'"></div>'
              +'<div><div class="history-name">'+esc(p.name)+'</div><div class="history-meta">'+(p.cat||'')+(p.note?' \u00B7 '+esc(p.note):'')+'</div></div>'
              +'<div><div class="history-amount">AED '+fmt(p.amount)+'</div><div class="history-date">'+d.getDate()+' '+MONTHS[d.getMonth()]+'</div></div>'
              +'<button class="icon-btn del" onclick="deletePayment(\''+ p.id +'\')" title="Delete payment">&#10005;</button>'
              +'</div>';
          }).join('')
          +'</div>';
      }).join('');
    }
  } else {
    // Tasks tab
    if(!allDoneTasks.length){ content='<div class="empty">No completed tasks yet.</div>'; }
    else {
      const sorted=[...allDoneTasks].sort((a,b)=>new Date(b.doneAt)-new Date(a.doneAt));
      const groups={};
      sorted.forEach(t=>{
        const d=new Date(t.doneAt);
        const key=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
        const label=MONTHS[d.getMonth()]+' '+d.getFullYear();
        if(!groups[key])groups[key]={label,list:[]};
        groups[key].list.push(t);
      });
      const PRI_COLOR={urgent:'var(--red)',high:'var(--amber)',medium:'var(--purple)',low:'var(--accent)',none:'var(--border2)'};
      content=Object.keys(groups).sort((a,b)=>b.localeCompare(a)).map(key=>{
        const g=groups[key];
        return '<div class="history-group">'
          +'<div class="history-month-row"><div class="history-month">'+g.label+'</div><div class="month-total">'+g.list.length+' tasks</div></div>'
          +g.list.map(t=>{
            const d=new Date(t.doneAt);
            const ws=t.workspace||'personal';
            const wsL=workspaceLabel(ws);
            return '<div class="history-item">'
              +'<div class="item-dot" style="background:'+(PRI_COLOR[t.priority||'none'])+'"></div>'
              +'<div><div class="history-name">'+esc(t.title)+'</div>'
                +'<div class="history-meta">'+esc(wsL)+(t.priority&&t.priority!=='none'?' \u00B7 '+t.priority:'')+'</div>'
              +'</div>'
              +'<div class="history-date" style="text-align:right">'+d.getDate()+' '+MONTHS[d.getMonth()]+'</div>'
              +'</div>';
          }).join('')
          +'</div>';
      }).join('');
    }
  }

  document.getElementById('history-list').innerHTML = tabBar + content;
}

function switchHistoryTab(tab){
  localStorage.setItem('history-tab', tab);
  renderHistory();
}

/* &#9472;&#9472; Insights &#9472;&#9472; */
function renderInsights(){
  ['insBarChart','insDonutChart','insForecastChart'].forEach(function(id){var c=Chart.getChart(id);if(c)c.destroy();});
  var active=items.filter(function(i){return i.status==='active'&&!i.isTrial;});
  var cont=document.getElementById('insights-content');
  if(!active.length){cont.innerHTML='<div class="empty" style="text-align:center;padding:3rem 1rem;color:var(--text3);border:0.5px dashed var(--border);border-radius:var(--radius-lg)">No active entries to analyze.</div>';return;}
  var cats={};
  active.forEach(function(i){
    if(!cats[i.cat])cats[i.cat]={total:0,count:0,color:i.color||CATCOLORS[i.cat]||'#888'};
    cats[i.cat].total+=toMonthly(i.amount,i.cycle);cats[i.cat].count++;
  });
  var totalMonthly=Object.values(cats).reduce(function(s,c){return s+c.total;},0);
  var sortedCats=Object.entries(cats).sort(function(a,b){return b[1].total-a[1].total;});
  var topItems=active.slice().sort(function(a,b){return toMonthly(b.amount,b.cycle)-toMonthly(a.amount,a.cycle);}).slice(0,5);
  var allTimePaid=payments.reduce(function(s,p){return s+p.amount;},0);
  var now=new Date();
  var months=[];
  for(var i=5;i>=0;i--){
    var d=new Date(now.getFullYear(),now.getMonth()-i,1);
    var key=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
    months.push({key:key,label:MONTHS[d.getMonth()]+' '+String(d.getFullYear()).slice(2)});
  }
  var barData=months.map(function(m){
    var paid=payments.filter(function(p){return p.date.startsWith(m.key);}).reduce(function(s,p){return s+p.amount;},0);
    var curKey=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0');
    var isCurrent=m.key===curKey;
    var projected=(isCurrent&&paid===0)?totalMonthly:paid;
    return {label:m.label,paid:paid,projected:projected,isCurrent:isCurrent};
  });
  var nonZero=barData.slice(0,5).filter(function(b){return b.paid>0;});
  var avgMonthly=nonZero.length?nonZero.reduce(function(s,b){return s+b.paid;},0)/nonZero.length:totalMonthly;
  var maxBar=Math.max.apply(null,barData.map(function(b){return b.projected;}).concat([totalMonthly]))*1.18||1;

  cont.innerHTML=
    '<div class="metrics" style="margin-bottom:1.5rem">'+
    '<div class="metric"><div class="metric-label">Monthly spend</div><div class="metric-value" style="color:var(--accent)">AED '+fmt(totalMonthly)+'</div><div class="metric-sub">'+active.length+' active subs</div></div>'+
    '<div class="metric"><div class="metric-label">Annual projected</div><div class="metric-value">AED '+fmt(totalMonthly*12)+'</div><div class="metric-sub">at current rate</div></div>'+
    '<div class="metric green"><div class="metric-label">All-time paid</div><div class="metric-value">AED '+fmt(allTimePaid)+'</div><div class="metric-sub">'+payments.length+' payments logged</div></div>'+
    '<div class="metric"><div class="metric-label">Categories</div><div class="metric-value">'+Object.keys(cats).length+'</div><div class="metric-sub">avg AED '+fmt(totalMonthly/active.length)+'/entry</div></div>'+
    '</div>'+
    '<div class="ins-grid">'+
    '<div class="ins-card full">'+
      '<div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:1rem">'+
        '<div class="ins-card-title" style="margin-bottom:0">Monthly spend \u2014 last 6 months</div>'+
        '<div style="font-size:11px;color:var(--text3)">avg <span style="font-family:var(--mono);color:var(--text2)">AED '+fmt(avgMonthly)+'</span>/mo</div>'+
      '</div>'+
      '<div style="position:relative;height:200px"><canvas id="insBarChart"></canvas></div>'+
    '</div>'+
    '<div class="ins-card">'+
      '<div class="ins-card-title">Spend by category</div>'+
      '<div class="ins-donut-wrap">'+
        '<canvas id="insDonutChart" height="210"></canvas>'+
      '</div>'+
      '<div class="ins-legend">'+
        sortedCats.map(function(e){
          var cat=e[0],d=e[1];
          return '<div class="ins-legend-row">'+
            '<div class="ins-legend-left">'+
              '<div class="ins-legend-dot" style="background:'+d.color+'"></div>'+
              '<span class="ins-legend-name">'+esc(cat)+'</span>'+
            '</div>'+
            '<span class="ins-legend-pct">'+Math.round(d.total/totalMonthly*100)+'%</span>'+
            '<span class="ins-legend-amt">AED '+fmt(d.total)+'</span>'+
          '</div>';
        }).join('')+
      '</div>'+
    '</div>'+
    '<div class="ins-card">'+
      '<div class="ins-card-title">Top 5 by monthly cost</div>'+
      topItems.map(function(item,i){
        var color=item.color||CATCOLORS[item.cat]||'#888';
        var mAmt=toMonthly(item.amount,item.cycle);
        var pct=Math.round(mAmt/totalMonthly*100);
        return '<div class="ins-stat-row">'+
          '<div class="ins-stat-left">'+
            '<span class="ins-stat-rank">'+(i+1)+'</span>'+
            '<div class="ins-stat-dot" style="background:'+color+'"></div>'+
            '<div>'+
              '<div class="ins-stat-name">'+esc(item.name)+'</div>'+
              '<div class="ins-stat-cat">'+esc(item.cat)+' \u00b7 '+pct+'% of total</div>'+
            '</div>'+
          '</div>'+
          '<div class="ins-stat-right">'+
            '<div class="ins-stat-amt">AED '+fmt(mAmt)+'</div>'+
            '<div class="ins-stat-sub">/mo</div>'+
          '</div>'+
        '</div>';
      }).join('')+
    '</div>'+
    '</div>'+
    // \u2500\u2500 Forecast card (appended after grid) \u2500\u2500
    '<div class="ins-card full" style="margin-top:14px">'+
      '<div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:1rem">'+
        '<div class="ins-card-title" style="margin-bottom:0">Spending forecast -- next 12 months</div>'+
        '<div style="font-size:11px;color:var(--text3)">based on current subscriptions</div>'+
      '</div>'+
      '<div style="position:relative;height:220px"><canvas id="insForecastChart"></canvas></div>'+
      '<div id="ins-forecast-note" style="font-size:11px;color:var(--text3);margin-top:10px;line-height:1.6"></div>'+
    '</div>';

  Chart.defaults.color='rgba(255,255,255,.38)';
  Chart.defaults.font.family="'DM Sans',system-ui,sans-serif";
  Chart.defaults.font.size=11;

  var barCtx=document.getElementById('insBarChart').getContext('2d');
  var barGrad=barCtx.createLinearGradient(0,0,0,200);
  barGrad.addColorStop(0,'rgba(31,170,126,.6)');
  barGrad.addColorStop(1,'rgba(31,170,126,.1)');
  var barColors=barData.map(function(b){return (b.isCurrent&&b.paid===0)?'rgba(31,170,126,.22)':barGrad;});
  var barBorders=barData.map(function(b){return (b.isCurrent&&b.paid===0)?'rgba(31,170,126,.45)':'rgba(31,170,126,.9)';});
  new Chart(barCtx,{
    type:'bar',
    data:{
      labels:barData.map(function(b){return b.label;}),
      datasets:[{
        label:'Spend',
        data:barData.map(function(b){return parseFloat(b.projected.toFixed(2));}),
        backgroundColor:barColors,
        borderColor:barBorders,
        borderWidth:1.5,
        borderRadius:5,
        borderSkipped:false,
        maxBarThickness:52,
      },{
        type:'line',
        label:'Avg',
        data:barData.map(function(){return parseFloat(avgMonthly.toFixed(2));}),
        borderColor:'rgba(201,138,26,.6)',
        borderWidth:1.5,
        borderDash:[5,4],
        pointRadius:0,
        tension:0,
      }]
    },
    options:{
      responsive:true,maintainAspectRatio:false,
      plugins:{
        legend:{display:false},
        tooltip:{
          backgroundColor:'rgba(18,18,18,.95)',
          titleColor:'rgba(255,255,255,.85)',
          bodyColor:'rgba(255,255,255,.55)',
          borderColor:'rgba(255,255,255,.09)',
          borderWidth:1,padding:10,
          callbacks:{
            label:function(item){
              if(item.datasetIndex===1)return 'avg AED '+fmt(item.parsed.y);
              var suffix=barData[item.dataIndex].isCurrent&&barData[item.dataIndex].paid===0?' (projected)':'';
              return 'AED '+fmt(item.parsed.y)+suffix;
            }
          }
        }
      },
      scales:{
        x:{grid:{color:'rgba(255,255,255,.04)'},border:{display:false},ticks:{color:'rgba(255,255,255,.38)'}},
        y:{grid:{color:'rgba(255,255,255,.05)'},border:{display:false},
          ticks:{color:'rgba(255,255,255,.38)',callback:function(v){return 'AED '+Math.round(v);}},
          suggestedMax:maxBar,suggestedMin:0}
      }
    }
  });

  var donutCenterPlugin={
    id:'donutCenter',
    afterDraw:function(chart){
      if(chart.config.type!=='doughnut')return;
      var tooltip=chart.tooltip;
      if(tooltip&&tooltip.getActiveElements&&tooltip.getActiveElements().length>0)return;
      var ctx=chart.ctx;
      var cx=(chart.chartArea.left+chart.chartArea.right)/2;
      var cy=(chart.chartArea.top+chart.chartArea.bottom)/2;
      ctx.save();
      ctx.textAlign='center';
      ctx.textBaseline='middle';
      ctx.fillStyle='rgba(240,240,240,.95)';
      ctx.font="600 16px 'DM Mono',ui-monospace,monospace";
      ctx.fillText('AED '+Math.round(totalMonthly),cx,cy-7);
      ctx.fillStyle='rgba(74,74,74,.9)';
      ctx.font="400 10px 'DM Sans',system-ui,sans-serif";
      ctx.fillText('/month',cx,cy+9);
      ctx.restore();
    }
  };
  var donutCtx=document.getElementById('insDonutChart').getContext('2d');
  new Chart(donutCtx,{
    type:'doughnut',
    data:{
      labels:sortedCats.map(function(e){return e[0];}),
      datasets:[{
        data:sortedCats.map(function(e){return parseFloat(e[1].total.toFixed(2));}),
        backgroundColor:sortedCats.map(function(e){return e[1].color;}),
        borderColor:'#141414',
        borderWidth:2.5,
        hoverOffset:7,
      }]
    },
    options:{
      responsive:true,cutout:'70%',
      plugins:{
        legend:{display:false},
        tooltip:{
          backgroundColor:'rgba(18,18,18,.95)',
          titleColor:'rgba(255,255,255,.85)',
          bodyColor:'rgba(255,255,255,.55)',
          borderColor:'rgba(255,255,255,.09)',
          borderWidth:1,padding:10,
          callbacks:{
            label:function(item){return 'AED '+fmt(item.parsed)+' ('+Math.round(item.parsed/totalMonthly*100)+'%)';}
          }
        }
      }
    },
    plugins:[donutCenterPlugin]
  });

  // \u2500\u2500 Build 12-month forecast data \u2500\u2500
  var fcastNow=new Date();
  var fcastMonths=[];
  for(var fi=0;fi<12;fi++){
    var fd=new Date(fcastNow.getFullYear(),fcastNow.getMonth()+fi,1);
    fcastMonths.push({
      label:MONTHS[fd.getMonth()]+' '+String(fd.getFullYear()).slice(2),
      year:fd.getFullYear(),
      month:fd.getMonth(), // 0-indexed
      total:0,
      items:[]
    });
  }
  // For each active item, calculate which forecast months it hits
  active.forEach(function(item){
    var amt=item.amount;
    var cycle=item.cycle;
    var color=item.color||CATCOLORS[item.cat]||'#888';
    if(cycle==='monthly'||cycle==='weekly'){
      // Every month
      fcastMonths.forEach(function(m){
        m.total+=toMonthly(amt,cycle);
        m.items.push({name:item.name,amount:toMonthly(amt,cycle),color:color});
      });
    } else if(cycle==='quarterly'){
      // Every 3 months -- find first hit from current month
      var startMonth=fcastNow.getMonth();
      fcastMonths.forEach(function(m,idx){
        if(idx%3===0){
          m.total+=amt;
          m.items.push({name:item.name,amount:amt,color:color,badge:'quarterly'});
        }
      });
    } else if(cycle==='yearly'){
      // Only the renewal month -- use dueDay month if set, otherwise current month
      var renewalMonth=item.dueDay?
        (function(){
          // Estimate renewal month from dueDay -- use the month when dueDay is in the future
          var d=new Date(fcastNow.getFullYear(),fcastNow.getMonth(),item.dueDay);
          if(d<fcastNow) d=new Date(fcastNow.getFullYear(),fcastNow.getMonth()+1,item.dueDay);
          return d.getMonth();
        })():fcastNow.getMonth();
      fcastMonths.forEach(function(m){
        if(m.month===renewalMonth){
          m.total+=amt;
          m.items.push({name:item.name,amount:amt,color:color,badge:'annual'});
        }
      });
    }
  });
  // Also include active Tabby instalments
  tabbyItems.forEach(function(t){
    t.instalments.forEach(function(ins){
      if(ins.paid) return;
      var insDate=new Date(ins.date);
      fcastMonths.forEach(function(m){
        if(insDate.getFullYear()===m.year&&insDate.getMonth()===m.month){
          m.total+=t.total/4;
          m.items.push({name:t.name+' (Tabby)',amount:t.total/4,color:'#C98A1A',badge:'tabby'});
        }
      });
    });
  });

  var fcastMax=Math.max.apply(null,fcastMonths.map(function(m){return m.total;}))*1.18||1;
  var fcastAvg=fcastMonths.reduce(function(s,m){return s+m.total;},0)/12;
  var fcastTotal=fcastMonths.reduce(function(s,m){return s+m.total;},0);
  // Heavy months = above 120% of average
  var heavyMonths=fcastMonths.filter(function(m){return m.total>fcastAvg*1.2;});

  // Update note
  var noteEl=document.getElementById('ins-forecast-note');
  if(noteEl){
    var noteHTML='Total projected spend: <strong style="color:var(--text);font-family:var(--mono)">AED '+fmt(fcastTotal)+'</strong> over 12 months \u00B7 avg <strong style="color:var(--text);font-family:var(--mono)">AED '+fmt(fcastAvg)+'</strong>/month';
    if(heavyMonths.length){
      noteHTML+=' \u00B7 <span style="color:var(--amber)">Heavier months: '+heavyMonths.map(function(m){return m.label;}).join(', ')+'</span>';
    }
    noteEl.innerHTML=noteHTML;
  }

  var fcastCtx=document.getElementById('insForecastChart').getContext('2d');
  var fcastGrad=fcastCtx.createLinearGradient(0,0,0,220);
  fcastGrad.addColorStop(0,'rgba(155,127,232,.55)');
  fcastGrad.addColorStop(1,'rgba(155,127,232,.08)');
  var fcastBorderColors=fcastMonths.map(function(m){
    return m.total>fcastAvg*1.2?'rgba(201,138,26,.9)':'rgba(155,127,232,.85)';
  });
  var fcastBgColors=fcastMonths.map(function(m){
    return m.total>fcastAvg*1.2?'rgba(201,138,26,.28)':fcastGrad;
  });
  new Chart(fcastCtx,{
    type:'bar',
    data:{
      labels:fcastMonths.map(function(m){return m.label;}),
      datasets:[{
        label:'Forecast',
        data:fcastMonths.map(function(m){return parseFloat(m.total.toFixed(2));}),
        backgroundColor:fcastBgColors,
        borderColor:fcastBorderColors,
        borderWidth:1.5,
        borderRadius:5,
        borderSkipped:false,
        maxBarThickness:52,
      },{
        type:'line',
        label:'Monthly avg',
        data:fcastMonths.map(function(){return parseFloat(fcastAvg.toFixed(2));}),
        borderColor:'rgba(31,170,126,.55)',
        borderWidth:1.5,
        borderDash:[5,4],
        pointRadius:0,
        tension:0,
      }]
    },
    options:{
      responsive:true,maintainAspectRatio:false,
      plugins:{
        legend:{display:false},
        tooltip:{
          backgroundColor:'rgba(18,18,18,.95)',
          titleColor:'rgba(255,255,255,.85)',
          bodyColor:'rgba(255,255,255,.55)',
          borderColor:'rgba(255,255,255,.09)',
          borderWidth:1,padding:10,
          callbacks:{
            title:function(items){return items[0].label;},
            label:function(item){
              if(item.datasetIndex===1) return 'avg AED '+fmt(item.parsed.y);
              var m=fcastMonths[item.dataIndex];
              var lines=['AED '+fmt(m.total)];
              m.items.slice(0,5).forEach(function(it){
                lines.push('  '+it.name+(it.badge?' ['+it.badge+']':'')
                  +': AED '+fmt(it.amount));
              });
              if(m.items.length>5) lines.push('  ...+'+(m.items.length-5)+' more');
              return lines;
            }
          }
        }
      },
      scales:{
        x:{grid:{color:'rgba(255,255,255,.04)'},border:{display:false},ticks:{color:'rgba(255,255,255,.38)'}},
        y:{grid:{color:'rgba(255,255,255,.05)'},border:{display:false},
          ticks:{color:'rgba(255,255,255,.38)',callback:function(v){return 'AED '+Math.round(v);}},
          suggestedMax:fcastMax,suggestedMin:0}
      }
    }
  });
}
function setFilter(c){filterCat=c;render();}

function togglePaid(id){
  const item=items.find(i=>i.id===id);if(!item)return;
  const existing=payments.find(p=>p.itemId===id&&inCycle(p.date));
  if(existing){
    payments=payments.filter(p=>p.id!==existing.id);
    // Reverse account deduction if one was recorded
    if(existing.deductedAccountId){
      const ac=accounts.find(a=>a.id===existing.deductedAccountId);
      if(ac){
        ac.balance=parseFloat((parseFloat(ac.balance)+(parseFloat(item.amount)||0)).toFixed(2));
        ac.updatedAt=Date.now();
        ac.history=ac.history||[];
        ac.history.push({balance:ac.balance,date:todayStr(),note:'Reversed: '+item.name});
        if(ac.history.length>24)ac.history=ac.history.slice(-24);
        saveAccounts();
        if(currentPage==='accounts')renderAccounts();
        if(currentPage==='networth')renderNetWorth();
      }
    }
    saveData();render();
    toast('\u21b5 '+item.name+' unmarked'+(existing.deductedAccountId?' \u00b7 deduction reversed':''));
  } else {
    showPayFromPopup(item);
  }
}

function showPayFromPopup(item){
  const ex=document.getElementById('pay-popup-wrap');if(ex)ex.remove();
  const defaultAcId=item.payAccountId||'';
  const activeAccounts=accounts.filter(a=>!a.archived);
  const rowsHtml=activeAccounts.length
    ? activeAccounts.map(a=>`
        <div class="pay-ac-row${a.id===defaultAcId?' selected':''}" id="pac-${a.id}" onclick="selectPayAc('${a.id}')">
          <div class="pay-ac-dot" style="background:${a.color||'#888'}"></div>
          <div class="pay-ac-name">${esc(a.name)}</div>
          <div class="pay-ac-bal">AED ${fmt(a.balance)}</div>
          <div class="pay-ac-check">${a.id===defaultAcId?'&#10003;':''}</div>
        </div>`).join('')
    : '<div style="font-size:12px;color:var(--text3);padding:8px 0">No accounts set up yet.</div>';
  const selAc=activeAccounts.find(a=>a.id===defaultAcId)||activeAccounts[0];
  const afterBal=selAc?'AED '+fmt((parseFloat(selAc.balance)||0)-(parseFloat(item.amount)||0)):'--';
  const popup=document.createElement('div');
  popup.id='pay-popup-wrap';
  popup.className='pay-popup-backdrop';
  popup.innerHTML=`
    <div class="pay-popup">
      <div class="pay-popup-head">
        <div><div class="pay-popup-title">Mark ${esc(item.name)} as paid</div><div class="pay-popup-sub">AED ${fmt(item.amount)} &nbsp;\u00b7&nbsp; deduct from which account?</div></div>
        <button class="modal-close-btn" onclick="document.getElementById('pay-popup-wrap').remove()">&#10005;</button>
      </div>
      <div class="pay-popup-body">
        <div style="display:flex;gap:6px;margin-bottom:12px">
          <button id="pay-cycle-cur" onclick="selectPayCycle('current')" style="flex:1;padding:7px 10px;border-radius:var(--radius-md);border:1.5px solid var(--accent);background:var(--accent-dim);color:var(--accent);font-size:11px;font-weight:600;cursor:pointer;font-family:var(--font);transition:all .15s">&#9654; This cycle<br><span style="font-weight:400;opacity:.8;font-size:10px">${cycleLabel()}</span></button>
          <button id="pay-cycle-next" onclick="selectPayCycle('next')" style="flex:1;padding:7px 10px;border-radius:var(--radius-md);border:1.5px solid var(--border2);background:transparent;color:var(--text2);font-size:11px;font-weight:600;cursor:pointer;font-family:var(--font);transition:all .15s">&#9654; Next cycle<br><span style="font-weight:400;opacity:.8;font-size:10px">${nextCycleLabel()}</span></button>
        </div>
        <div id="pay-ac-list">${rowsHtml}</div>
        ${activeAccounts.length?`<div class="pay-after" id="pay-after-row"><span>Balance after deduction</span><span class="pay-after-val" id="pay-after-val">${afterBal}</span></div>`:''}
      </div>
      <div class="pay-popup-foot">
        <button class="pay-confirm-btn" onclick="confirmPayFrom('${item.id}')">&#10003; Confirm &amp; deduct</button>
        <button class="pay-skip-btn" onclick="confirmPayFrom('${item.id}',true)">Mark paid without deducting</button>
      </div>
    </div>`;
  popup.addEventListener('click',function(e){if(e.target===popup)popup.remove();});
  document.body.appendChild(popup);
  window._payItemId=item.id;
  window._paySelectedAcId=defaultAcId||(activeAccounts[0]?activeAccounts[0].id:'');
  window._payDateOverride=null; // null = current cycle (today)
}

function selectPayCycle(which){
  var cur=document.getElementById('pay-cycle-cur');
  var nxt=document.getElementById('pay-cycle-next');
  if(which==='next'){
    window._payDateOverride=nextCycleStart().toISOString().slice(0,10);
    if(cur){cur.style.borderColor='var(--border2)';cur.style.background='transparent';cur.style.color='var(--text2)';}
    if(nxt){nxt.style.borderColor='var(--accent)';nxt.style.background='var(--accent-dim)';nxt.style.color='var(--accent)';}
  } else {
    window._payDateOverride=null;
    if(cur){cur.style.borderColor='var(--accent)';cur.style.background='var(--accent-dim)';cur.style.color='var(--accent)';}
    if(nxt){nxt.style.borderColor='var(--border2)';nxt.style.background='transparent';nxt.style.color='var(--text2)';}
  }
}

function selectPayAc(acId){
  window._paySelectedAcId=acId;
  document.querySelectorAll('.pay-ac-row').forEach(r=>{
    const sel=r.id==='pac-'+acId;
    r.classList.toggle('selected',sel);
    r.querySelector('.pay-ac-check').innerHTML=sel?'&#10003;':'';
  });
  const item=items.find(i=>i.id===window._payItemId);
  const ac=accounts.find(a=>a.id===acId);
  const afterEl=document.getElementById('pay-after-val');
  if(afterEl&&item&&ac){
    const after=(parseFloat(ac.balance)||0)-(parseFloat(item.amount)||0);
    afterEl.textContent='AED '+fmt(after);
    afterEl.style.color=after<0?'var(--red)':'var(--text)';
  }
}

function confirmPayFrom(itemId,skipDeduction){
  const popup=document.getElementById('pay-popup-wrap');
  if(itemId.startsWith('tabby__')){
    const parts=itemId.split('__');
    doConfirmTabby(parts[1],parseInt(parts[2]),skipDeduction?null:window._paySelectedAcId);
    if(popup)popup.remove();
    return;
  }
  const item=items.find(i=>i.id===itemId);if(!item)return;
  const acId=skipDeduction?null:window._paySelectedAcId;
  var payDate = window._payDateOverride || todayStr();
  payments.unshift({id:String(Date.now()),itemId:item.id,name:item.name,cat:item.cat,amount:item.amount,date:payDate,note:'',deductedAccountId:acId||null});
  if(acId){
    const ac=accounts.find(a=>a.id===acId);
    if(ac){
      ac.balance=parseFloat((parseFloat(ac.balance)-(parseFloat(item.amount)||0)).toFixed(2));
      ac.updatedAt=Date.now();
      ac.history=ac.history||[];
      ac.history.push({balance:ac.balance,date:todayStr(),note:'Paid: '+item.name});
      if(ac.history.length>24)ac.history=ac.history.slice(-24);
      saveAccounts();
      if(currentPage==='accounts')renderAccounts();
      if(currentPage==='networth')renderNetWorth();
      toast('\u2713 '+item.name+' paid \u00b7 AED '+fmt(item.amount)+' deducted from '+ac.name);
    verSnapshot(false, 'Paid '+item.name);
    }
  } else {
    toast('\u2713 '+item.name+' marked as paid');
  }
  saveData();render();
  if(popup)popup.remove();
}

function duplicateItem(id){
  const item=items.find(i=>i.id===id);if(!item)return;
  const copy={...item,id:String(Date.now()),name:item.name+' (copy)'};
  items.unshift(copy);
  saveData();render();
  toast(`Duplicated ${item.name}`);
}

function deleteItem(id){
  const item=items.find(i=>i.id===id);if(!item)return;
  deletedItem=item;
  deletedPayments=payments.filter(p=>p.itemId===id);
  items=items.filter(i=>i.id!==id);
  payments=payments.filter(p=>p.itemId!==id);
  saveData();render();
  if(currentPage==='trials')renderTrials();
  toast(`Removed ${item.name}`,true);
}

function deletePayment(id){
  payments=payments.filter(p=>p.id!==id);
  saveData();renderHistory();render();
}

/* &#9472;&#9472; Export &#9472;&#9472; */
/* &#9472;&#9472; Tabby &#9472;&#9472; */
function instalment(total,i,startDate){
  const amt=total/4;
  const d=new Date(startDate);
  d.setMonth(d.getMonth()+i);
  return {amt,date:`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
}

function renderTabby(){
  const active=tabbyItems.filter(t=>!t.archived);
  const totalOwed=active.reduce((s,t)=>{
    const paid=t.instalments.filter(i=>i.paid).length;
    return s+(t.total/4)*(4-paid);
  },0);
  const nextDue=active.reduce((s,t)=>{
    const next=t.instalments.find(i=>!i.paid);
    return next?s+(t.total/4):s;
  },0);
  const completed=tabbyItems.filter(t=>t.instalments.every(i=>i.paid)).length;

  document.getElementById('tabby-metrics').innerHTML=`
    <div class="metric red"><div class="metric-label">Total owed</div><div class="metric-value">AED ${fmt(totalOwed)}</div><div class="metric-sub">across ${active.length} active</div></div>
    <div class="metric amber"><div class="metric-label">Next instalment</div><div class="metric-value">AED ${fmt(nextDue)}</div><div class="metric-sub">upcoming payments</div></div>
    <div class="metric green"><div class="metric-label">Completed</div><div class="metric-value">${completed}</div><div class="metric-sub">fully paid off</div></div>`;

  if(!tabbyItems.length){
    document.getElementById('tabby-list').innerHTML=`<div class="empty">No Tabby purchases yet. Add one to start tracking your instalments.</div>`;
    return;
  }

  const sorted=[...tabbyItems].sort((a,b)=>{
    const aNext=a.instalments.find(i=>!i.paid);
    const bNext=b.instalments.find(i=>!i.paid);
    if(!aNext&&bNext)return 1;
    if(aNext&&!bNext)return -1;
    if(!aNext&&!bNext)return 0;
    return new Date(aNext.date)-new Date(bNext.date);
  });

  document.getElementById('tabby-list').innerHTML=sorted.map(t=>{
    const paidCount=t.instalments.filter(i=>i.paid).length;
    const complete=paidCount===4;
    const color=(t.color&&t.color!=='none')?t.color:COLORS[1];
    const pct=Math.round(paidCount/4*100);
    const nextIdx=t.instalments.findIndex(i=>!i.paid);
    const owed=fmt((t.total/4)*(4-paidCount));

    return `<div class="tabby-card${complete?' complete':''}">
      <div class="tabby-header">
        <div>
          <div class="tabby-title">
            <div class="item-dot" style="background:${color}"></div>
            <span>${esc(t.name)}</span>
            <span class="badge-tabby">${paidCount}/4 paid</span>
            ${complete?'<span class="badge badge-paid">complete</span>':''}
          </div>
          <div class="tabby-meta"><span>${t.cat}</span>${t.notes?`<span class="sep">&#183;</span><span style="font-style:italic">${esc(t.notes)}</span>`:''}
          </div>
        </div>
        <div class="tabby-right">
          <div class="tabby-total-val">AED ${fmt(t.total)}</div>
          ${!complete?`<div class="tabby-total-sub">AED ${owed} left</div>`:''}
          <div class="tabby-actions">
            <button class="icon-btn" onclick="openTabbyModal('${t.id}')" title="Edit">&#9998;</button>
            <button class="icon-btn del" onclick="deleteTabbyItem('${t.id}')" title="Delete">&#10005;</button>
          </div>
        </div>
      </div>
      <div class="tabby-progress"><div class="tabby-progress-fill" style="width:${pct}%"></div></div>
      <div class="tabby-installments">
        ${t.instalments.map((inst,i)=>{
          const isNext=i===nextIdx&&!complete;
          const cls=inst.paid?'paid':isNext?'next-due':'';
          const dateLabel=formatShortDate(inst.date);
          return `<div class="tabby-inst ${cls}" onclick="toggleTabbyInstalment('${t.id}',${i})" title="${inst.paid?'Click to mark unpaid':'Mark as paid'}">
            <div class="tabby-inst-label">Pay ${i+1}</div>
            <div class="tabby-inst-amount">AED ${fmt(t.total/4)}</div>
            <div class="tabby-inst-date">${dateLabel}</div>
            <div class="tabby-inst-icon">${inst.paid?'&#10003;':isNext?'&#8594;':''}</div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  }).join('');
}

function toggleTabbyInstalment(id,idx){
  const t=tabbyItems.find(t=>t.id===id);if(!t)return;
  const inst=t.instalments[idx];
  const wasP=inst.paid;
  inst.paid=!wasP;
  const payId='tabby_'+id+'_'+idx;
  if(!wasP){
    const instDate=inst.date||todayStr();
    payments.unshift({id:payId,itemId:'tabby_'+id,name:t.name+' (Tabby '+(idx+1)+')',
      cat:t.cat||'Other',amount:t.total/4,date:instDate,note:'Tabby instalment '+(idx+1)});
  } else {
    payments=payments.filter(p=>p.id!==payId);
  }
  saveData();renderTabby();render();
  const allPaid=t.instalments.every(i=>i.paid);
  toast(inst.paid
    ? (allPaid?`&#127881; ${t.name} fully paid off!`:`Instalment ${idx+1} paid`)
    : `Instalment ${idx+1} marked unpaid`);
}

function deleteTabbyItem(id){
  const t=tabbyItems.find(t=>t.id===id);if(!t)return;
  if(confirm(`Remove "${t.name}"?`)){
    tabbyItems=tabbyItems.filter(t=>t.id!==id);
    saveData();renderTabby();render();
    toast(`Removed ${t.name}`);
  }
}

let tabbySelectedColor=COLORS[5];

function previewInstalments(){
  const total=parseFloat(document.getElementById('t-total').value);
  const start=document.getElementById('t-start').value;
  const prev=document.getElementById('t-preview');
  if(!total||!start){prev.innerHTML='';return;}
  const amt=total/4;
  prev.innerHTML=[0,1,2,3].map(i=>{
    const inst=instalment(total,i,start);
    return `<div style="background:var(--surface3);border-radius:7px;padding:6px 8px;text-align:center">
      <div style="font-size:10px;color:var(--text3);margin-bottom:2px">Pay ${i+1}</div>
      <div style="font-family:var(--mono);font-size:12px;font-weight:500">AED ${fmt(amt)}</div>
      <div style="font-size:10px;color:var(--text3);margin-top:2px">${formatShortDate(inst.date)}</div>
    </div>`;
  }).join('');
}

function renderTabbyColorPicker(){
  document.getElementById('tabby-color-picker').innerHTML=COLORS.map(c=>c==='none'?`<div class="color-dot none-dot${tabbySelectedColor==='none'?' selected':''}" onclick="selectTabbyColor('none')" title="No colour">&#8854;</div>`:`<div class="color-dot${tabbySelectedColor===c?' selected':''}" style="background:${c}" onclick="selectTabbyColor('${c}')"></div>`).join('');
}
function selectTabbyColor(c){tabbySelectedColor=c;renderTabbyColorPicker();}

function openTabbyModal(id){
  tabbyEditId=id||null;
  const t=id?tabbyItems.find(t=>t.id===id):null;
  document.getElementById('tabby-modal-title').textContent=t?'Edit Tabby purchase':'Add Tabby purchase';
  document.getElementById('t-name').value=t?.name||'';
  document.getElementById('t-total').value=t?.total||'';
  document.getElementById('t-start').value=t?.startDate||todayStr();
  document.getElementById('t-cat').value=t?.cat||'Electronics';
  document.getElementById('t-notes').value=t?.notes||'';
  tabbySelectedColor=t?.color||COLORS[5];
  renderTabbyColorPicker();
  previewInstalments();
  const tPay=document.getElementById('t-pay-account');
  if(tPay){
    tPay.innerHTML='<option value="">-- No account --</option>'+accounts.filter(a=>!a.archived).map(a=>'<option value="'+a.id+'">'+esc(a.name)+' - AED '+fmt(a.balance)+'</option>').join('');
    tPay.value=t?(t.payAccountId||''):'';
  }
  document.getElementById('tabby-modal').style.display='flex';
  setTimeout(()=>document.getElementById('t-name').focus(),50);
}
function closeTabbyModal(){document.getElementById('tabby-modal').style.display='none';tabbyEditId=null;}

function saveTabbyItem(){
  const name=document.getElementById('t-name').value.trim();
  const total=parseFloat(document.getElementById('t-total').value);
  const startDate=document.getElementById('t-start').value;
  if(!name){document.getElementById('t-name').focus();return;}
  if(isNaN(total)||total<=0){document.getElementById('t-total').focus();return;}
  if(!startDate){document.getElementById('t-start').focus();return;}

  if(tabbyEditId){
    const t=tabbyItems.find(t=>t.id===tabbyEditId);
    if(t){
      t.name=name;t.total=total;t.cat=document.getElementById('t-cat').value;
      t.notes=document.getElementById('t-notes').value.trim();t.color=tabbySelectedColor;
      t.payAccountId=document.getElementById('t-pay-account').value||null;
      // Recalculate instalment dates if start changed
      if(t.startDate!==startDate){
        t.startDate=startDate;
        t.instalments=t.instalments.map((inst,i)=>{const n=instalment(total,i,startDate);return{...inst,date:n.date};});
      }
    }
  } else {
    const instalments=[0,1,2,3].map(i=>{const n=instalment(total,i,startDate);return{date:n.date,paid:false};});
    tabbyItems.unshift({
      id:String(Date.now()),name,total,startDate,
      cat:document.getElementById('t-cat').value,
      notes:document.getElementById('t-notes').value.trim(),
      color:tabbySelectedColor,instalments,
      payAccountId:document.getElementById('t-pay-account').value||null
    });
  }
  const wasEditing=!!tabbyEditId;
  saveData();closeTabbyModal();renderTabby();render();
  toast(wasEditing?`Updated ${name}`:`Added ${name}`);
}

document.getElementById('tabby-modal').addEventListener('click',e=>{if(e.target===document.getElementById('tabby-modal'))closeTabbyModal();});

function exportJSON(){
  if(!items.length&&!payments.length&&!tabbyItems.length&&!tasks.length){toast('Nothing to back up yet');return;}
  const data=JSON.stringify({items,payments,tabbyItems,tasks,taskHistory,shopping,shCollections,links,linkGroups,lists,workspaces,goals,notes,loans,receivables,accounts,nwHistory,dbLayout:JSON.parse(localStorage.getItem(DB_LAYOUT_KEY)||'[]'),dbCollapsed:JSON.parse(localStorage.getItem('lifeos_db_collapsed')||'{}'),navLayout:JSON.parse(localStorage.getItem(NAV_LAYOUT_KEY)||'[]'),cycleStart:parseInt(localStorage.getItem(CYCLE_KEY)||'1'),proxyUrl:localStorage.getItem(AI_PROXY_STORE)||'',exportedAt:new Date().toISOString()},null,2);
  const d=new Date();
  const filename='bills-backup-'+d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')+'.json';
  verSnapshot(true);
  triggerDownload(new Blob([data],{type:'application/json'}),filename);
  toast('&#8595; Backup downloaded');
}

/* Holds parsed backup while user decides replace vs merge */
let _pendingRestore=null;

function importJSON(e){
  const file=e.target.files[0];
  if(!file)return;
  const reader=new FileReader();
  reader.onload=ev=>{
    try{
      const data=JSON.parse(ev.target.result);
      // Accept any backup that has at least one known key
      const knownKeys=['items','payments','tasks','goals','loans','accounts','shopping','links','notes','receivables'];
      const hasData=knownKeys.some(function(k){return Array.isArray(data[k]);});
      if(!hasData)throw new Error('Invalid format');
      // Normalise missing arrays to empty
      knownKeys.forEach(function(k){if(!Array.isArray(data[k]))data[k]=[];});
      if(!Array.isArray(data.tabbyItems))data.tabbyItems=[];
      _pendingRestore=data;
      const d=new Date(data.exportedAt||0);
      const dateStr=data.exportedAt?d.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}):'Unknown date';
      const counts=[
        data.items.length+' bills',
        data.payments.length+' payments',
        (data.tabbyItems||[]).length+' Tabby',
        (data.tasks||[]).length+' tasks',
        (data.goals||[]).length+' goals',
        (data.shopping||[]).length+' shopping',
      ].join(' \u00B7 ');
      document.getElementById('restore-modal-meta').textContent='Backed up: '+dateStr;
      document.getElementById('restore-modal-counts').textContent=counts;
      document.getElementById('restore-modal').style.display='flex';
    }catch(err){
      toast('Could not read backup -- make sure it\'s a valid backup file');
    }
    e.target.value='';
  };
  reader.readAsText(file);
}

function closeRestoreModal(){
  document.getElementById('restore-modal').style.display='none';
  _pendingRestore=null;
}

function applyRestore(mode){
  const data=_pendingRestore;
  if(!data){closeRestoreModal();return;}
  if(mode==='replace'){
    items=data.items||[];
    payments=data.payments||[];
    tabbyItems=data.tabbyItems||[];
    tasks=data.tasks||[];
    taskHistory=data.taskHistory||[];
    shopping=data.shopping||[];
    shCollections=data.shCollections||[];
    links=data.links||[];
    linkGroups=data.linkGroups||[];
    lists=data.lists||[];
    workspaces=(data.workspaces&&data.workspaces.length)?data.workspaces:JSON.parse(JSON.stringify(WS_DEFAULTS));
    goals=data.goals||[];
    notes=data.notes||[];
    loans=data.loans||[];
    accounts=data.accounts||[];
    nwHistory=data.nwHistory||[];
    receivables=data.receivables||[];
    saveData();saveTasks();saveTaskHistory();saveShopping();saveShCollections();saveLinks();saveLinkGroups();saveLists();saveWorkspaces();saveGoals();saveNotes();saveLoans();saveReceivables();saveAccounts();saveNetWorth();
    if(data.dbLayout)  localStorage.setItem(DB_LAYOUT_KEY,  JSON.stringify(data.dbLayout));
    if(data.dbCollapsed) localStorage.setItem('lifeos_db_collapsed', JSON.stringify(data.dbCollapsed));
    if(data.navLayout) localStorage.setItem(NAV_LAYOUT_KEY, JSON.stringify(data.navLayout));
    if(data.cycleStart) localStorage.setItem(CYCLE_KEY, data.cycleStart);
    if(data.proxyUrl){ aiSetProxy(data.proxyUrl); loadProxyUrl(); }
    renderNav();
    updateCyclePreview();
loadProxyUrl();
    render();
    if(currentPage==='tasks')renderTasks();
    if(currentPage==='goals')renderGoals();
    if(currentPage==='notes')renderNotes();
    if(currentPage==='loans')renderLoans();
    if(currentPage==='shopping')renderShopping();
    if(currentPage==='links')renderLinks();
    if(currentPage==='receivables')renderReceivables();
    if(currentPage==='accounts')renderAccounts();
    if(currentPage==='dashboard')renderDashboard();
    toast('&#10003; Data replaced -- '+items.length+' bills, '+(shopping||[]).length+' shopping, '+(links||[]).length+' links restored');
  } else {
    // Merge: backup entries win on conflict, local-only entries kept
    const noteIds=new Set((data.notes||[]).map(n=>n.id));
    notes=[...(data.notes||[]),...notes.filter(n=>!noteIds.has(n.id))];
    const loanIds=new Set((data.loans||[]).map(l=>l.id));
    loans=[...(data.loans||[]),...loans.filter(l=>!loanIds.has(l.id))];
    const acIds=new Set((data.accounts||[]).map(a=>a.id));
    accounts=[...(data.accounts||[]),...accounts.filter(a=>!acIds.has(a.id))];
    // Merge net worth snapshots by timestamp
    const nwTs=new Set(nwHistory.map(n=>n.ts));
    nwHistory=[...(data.nwHistory||[]),...nwHistory.filter(n=>!nwTs.has(n.ts))].sort((a,b)=>a.ts-b.ts);
    saveNetWorth();
    const bkIds={
      items:new Set((data.items||[]).map(i=>i.id)),
      pay:new Set((data.payments||[]).map(p=>p.id)),
      tabby:new Set((data.tabbyItems||[]).map(t=>t.id)),
      tasks:new Set((data.tasks||[]).map(t=>t.id)),
      lists:new Set((data.lists||[]).map(l=>l.id)),
      goals:new Set((data.goals||[]).map(g=>g.id)),
    };
    items=[...(data.items||[]),...items.filter(i=>!bkIds.items.has(i.id))];
    payments=[...(data.payments||[]),...payments.filter(p=>!bkIds.pay.has(p.id))];
    tabbyItems=[...(data.tabbyItems||[]),...tabbyItems.filter(t=>!bkIds.tabby.has(t.id))];
    tasks=[...(data.tasks||[]),...tasks.filter(t=>!bkIds.tasks.has(t.id))];
    lists=[...(data.lists||[]),...lists.filter(l=>!bkIds.lists.has(l.id))];
    goals=[...(data.goals||[]),...goals.filter(g=>!bkIds.goals.has(g.id))];
    const rvIds=new Set((data.receivables||[]).map(r=>r.id));
    receivables=[...(data.receivables||[]),...receivables.filter(r=>!rvIds.has(r.id))];
    // Merge shopping
    const shIds=new Set((data.shopping||[]).map(s=>s.id));
    shopping=[...(data.shopping||[]),...shopping.filter(s=>!shIds.has(s.id))];
    const scIds=new Set((data.shCollections||[]).map(c=>c.id));
    shCollections=[...(data.shCollections||[]),...shCollections.filter(c=>!scIds.has(c.id))];
    const lkIds=new Set((data.links||[]).map(l=>l.id));
    links=[...(data.links||[]),...links.filter(l=>!lkIds.has(l.id))];
    const lgIds=new Set((data.linkGroups||[]).map(g=>g.id));
    linkGroups=[...(data.linkGroups||[]),...linkGroups.filter(g=>!lgIds.has(g.id))];
    const wsIds=new Set((data.workspaces||[]).map(w=>w.id));
    if(Array.isArray(data.workspaces)){workspaces=[...data.workspaces,...workspaces.filter(w=>!wsIds.has(w.id))];}
    // Merge taskHistory
    const thIds=new Set((data.taskHistory||[]).map(t=>t.id));
    taskHistory=[...(data.taskHistory||[]),...taskHistory.filter(t=>!thIds.has(t.id))];
    saveData();saveTasks();saveTaskHistory();saveShopping();saveShCollections();saveLinks();saveLinkGroups();saveLists();saveWorkspaces();saveGoals();saveNotes();saveLoans();saveReceivables();saveAccounts();saveNetWorth();
    // Merge layouts: only apply from backup if local layout is empty
    if(data.dbLayout  && !localStorage.getItem(DB_LAYOUT_KEY))  localStorage.setItem(DB_LAYOUT_KEY,  JSON.stringify(data.dbLayout));
    if(data.dbCollapsed && !localStorage.getItem('lifeos_db_collapsed')) localStorage.setItem('lifeos_db_collapsed', JSON.stringify(data.dbCollapsed));
    if(data.navLayout && !localStorage.getItem(NAV_LAYOUT_KEY)) localStorage.setItem(NAV_LAYOUT_KEY, JSON.stringify(data.navLayout));
    if(data.cycleStart) localStorage.setItem(CYCLE_KEY, data.cycleStart);
    if(data.proxyUrl){ aiSetProxy(data.proxyUrl); loadProxyUrl(); }
    renderNav();
    updateCyclePreview();
    render();
    if(currentPage==='tasks')renderTasks();
    if(currentPage==='goals')renderGoals();
    if(currentPage==='notes')renderNotes();
    if(currentPage==='loans')renderLoans();
    if(currentPage==='shopping')renderShopping();
    if(currentPage==='links')renderLinks();
    if(currentPage==='receivables')renderReceivables();
    if(currentPage==='accounts')renderAccounts();
    if(currentPage==='dashboard')renderDashboard();
    if(currentPage==='accounts')renderAccounts();
    if(currentPage==='networth')renderNetWorth();
    toast('&#10003; Backup merged -- no duplicates created');
  }
  closeRestoreModal();
}
function exportCSV(){
  if(!items.length){toast('No entries to export');return;}
  const rows=[['Name','Category','Amount (AED)','Cycle','Monthly Equiv','Due Day','Status','Notes','Is Trial','Trial End']];
  items.forEach(i=>rows.push([i.name,i.cat,i.amount,i.cycle,toMonthly(i.amount,i.cycle).toFixed(2),i.dueDay||'',i.status,i.notes||'',i.isTrial?'Yes':'No',i.trialEnd||'']));
  const csv=rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  triggerDownload(new Blob([csv],{type:'text/csv'}),'subscriptions.csv');
  toast('CSV exported');
}


/* &#9472;&#9472; Modal &#9472;&#9472; */
function toggleTrialFields(){
  const checked=document.getElementById('f-trial').checked;
  document.getElementById('trial-fields').style.display=checked?'block':'none';
}

function openModal(id,forceTrial=false){
  editId=id||null;
  const item=id?items.find(i=>i.id===id):null;
  document.getElementById('modal-title').textContent=item?'Edit entry':'Add entry';
  document.getElementById('f-name').value=item?.name||'';
  document.getElementById('f-amount').value=item?.amount||'';
  document.getElementById('f-cycle').value=item?.cycle||'monthly';
  document.getElementById('f-cat').value=item?.cat||'Streaming';
  document.getElementById('f-due').value=item?.dueDay||'';
  document.getElementById('f-notes').value=item?.notes||'';
  document.getElementById('f-status').value=item?.status||'active';
  const isTrial=item?.isTrial||forceTrial||false;
  document.getElementById('f-trial').checked=isTrial;
  document.getElementById('f-trial-end').value=item?.trialEnd||'';
  document.getElementById('trial-fields').style.display=isTrial?'block':'none';
  selectedColor=item?.color||COLORS[0];
  renderColorPicker();
  const fPayAc=document.getElementById('f-pay-account');
  if(fPayAc){
    fPayAc.innerHTML='<option value="">-- No account --</option>'+
      accounts.filter(a=>!a.archived).map(a=>`<option value="${a.id}">${esc(a.name)} -- AED ${fmt(a.balance)}</option>`).join('');
    fPayAc.value=item?.payAccountId||'';
  }
  document.getElementById('modal').style.display='flex';
  setTimeout(()=>document.getElementById('f-name').focus(),50);
}
function renderColorPicker(){
  document.getElementById('color-picker').innerHTML=COLORS.map(c=>c==='none'?`<div class="color-dot none-dot${selectedColor==='none'?' selected':''}" onclick="selectColor('none')" title="No colour">&#8854;</div>`:`<div class="color-dot${selectedColor===c?' selected':''}" style="background:${c}" onclick="selectColor('${c}')"></div>`).join('');
}
function selectColor(c){selectedColor=c;renderColorPicker();}
function closeModal(){document.getElementById('modal').style.display='none';editId=null;}

function saveItem(){
  const name=document.getElementById('f-name').value.trim();
  const amount=parseFloat(document.getElementById('f-amount').value);
  if(!name){document.getElementById('f-name').focus();return;}
  if(isNaN(amount)||amount<0){document.getElementById('f-amount').focus();return;}
  const isTrial=document.getElementById('f-trial').checked;
  const obj={
    id:editId||String(Date.now()),
    name,amount,
    cycle:document.getElementById('f-cycle').value,
    cat:document.getElementById('f-cat').value,
    dueDay:parseInt(document.getElementById('f-due').value)||null,
    notes:document.getElementById('f-notes').value.trim(),
    status:document.getElementById('f-status').value,
    color:selectedColor,
    isTrial,
    trialEnd:isTrial?document.getElementById('f-trial-end').value:null,
    payAccountId:document.getElementById('f-pay-account').value||null,
  };
  // If editing and amount changed, adjust linked account for current cycle payment
  if(editId){
    const prev=items.find(i=>i.id===editId);
    if(prev&&parseFloat(prev.amount)!==parseFloat(obj.amount)){
      const cyclePay=payments.find(p=>p.itemId===editId&&inCycle(p.date)&&p.deductedAccountId);
      if(cyclePay){
        const ac=accounts.find(a=>a.id===cyclePay.deductedAccountId);
        if(ac){
          const diff=parseFloat(obj.amount)-parseFloat(prev.amount);
          ac.balance=parseFloat((parseFloat(ac.balance)-diff).toFixed(2));
          ac.updatedAt=Date.now();
          ac.history=ac.history||[];
          ac.history.push({balance:ac.balance,date:todayStr(),note:'Adjusted: '+obj.name+' (amount changed)'});
          if(ac.history.length>24)ac.history=ac.history.slice(-24);
          saveAccounts();
          toast('Updated '+obj.name+' \u00B7 account adjusted by AED '+fmt(Math.abs(diff))+(diff>0?' (deducted more)':' (refunded difference)'));
        }
        cyclePay.amount=parseFloat(obj.amount);
      }
    }
    const idx=items.findIndex(i=>i.id===editId);if(idx>-1)items[idx]=obj;
  } else items.unshift(obj);
  saveData();closeModal();render();
  if(currentPage==='trials')renderTrials();
  if(!editId)toast('Added '+obj.name);
  else if(!payments.find(p=>p.itemId===editId&&inCycle(p.date)&&p.deductedAccountId))toast('Updated '+obj.name);
}

/* &#9472;&#9472; Calculator &#9472;&#9472; */
let calcTab='cost';

function switchCalcTab(t){
  calcTab=t;
  ['cost','compare','worth'].forEach(x=>{
    document.getElementById('calc-'+x).style.display=x===t?'':'none';
    document.getElementById('ctab-'+x).className='calc-tab'+(x===t?' active':'');
  });
  if(t==='cost'){populateCalcPicks();calcCost();}
  if(t==='compare'){renderCompare();}
  if(t==='worth'){populateWorthPicks();calcWorth();}
}

function populateCalcPicks(){
  const sel=document.getElementById('cc-pick');
  if(!sel)return;
  const cur=sel.value;
  sel.innerHTML='<option value="">&#8212; Enter manually &#8212;</option>'+
    items.filter(i=>!i.isTrial&&i.status==='active').map(i=>`<option value="${i.id}">${esc(i.name)} &#8212; AED ${fmt(i.amount)}/${cycleShort(i.cycle)}</option>`).join('');
  sel.value=cur;
}
function populateWorthPicks(){
  const sel=document.getElementById('wt-pick');
  if(!sel)return;
  sel.innerHTML='<option value="">&#8212; Enter manually &#8212;</option>'+
    items.filter(i=>!i.isTrial&&i.status==='active').map(i=>`<option value="${i.id}">${esc(i.name)}</option>`).join('');
}

function calcPickSub(){
  const id=document.getElementById('cc-pick').value;
  if(!id)return;
  const item=items.find(i=>i.id===id);if(!item)return;
  document.getElementById('cc-name').value=item.name;
  document.getElementById('cc-amount').value=item.amount;
  document.getElementById('cc-cycle').value=item.cycle;
  calcCost();
}
function worthPickSub(){
  const id=document.getElementById('wt-pick').value;
  if(!id)return;
  const item=items.find(i=>i.id===id);if(!item)return;
  document.getElementById('wt-amount').value=item.amount;
  document.getElementById('wt-cycle').value=item.cycle;
  calcWorth();
}

function calcCost(){
  const amount=parseFloat(document.getElementById('cc-amount').value)||0;
  const cycle=document.getElementById('cc-cycle').value;
  const unit=document.getElementById('cc-unit').value;
  const durEl=document.getElementById('cc-duration');
  const usageEl=document.getElementById('cc-usage');
  const dur=parseInt(durEl.value);
  const usage=parseInt(usageEl.value);
  document.getElementById('cc-duration-val').textContent=dur+(unit==='years'?(dur===1?' yr':' yrs'):(dur===1?' mo':' mos'));
  document.getElementById('cc-usage-val').textContent=usage;

  const monthlyAmt=toMonthly(amount,cycle);
  const totalMonths=unit==='years'?dur*12:dur;
  const total=monthlyAmt*totalMonths;
  const totalHours=usage*totalMonths;
  const perHour=totalHours>0?total/totalHours:0;
  const perDay=total/(totalMonths*30.4);
  const perUse=usage>0?monthlyAmt/usage:0;

  document.getElementById('cc-results').innerHTML=`
    <div class="calc-result"><div class="calc-result-label">Total cost</div><div class="calc-result-val red">AED ${fmt(total)}</div><div class="calc-result-sub">over ${dur} ${unit}</div></div>
    <div class="calc-result"><div class="calc-result-label">Per month</div><div class="calc-result-val">AED ${fmt(monthlyAmt)}</div><div class="calc-result-sub">equivalent</div></div>
    <div class="calc-result"><div class="calc-result-label">Per day</div><div class="calc-result-val">AED ${perDay.toFixed(2)}</div><div class="calc-result-sub">daily cost</div></div>
    <div class="calc-result"><div class="calc-result-label">Per hour used</div><div class="calc-result-val ${perHour<2?'green':perHour<10?'amber':'red'}">AED ${perHour.toFixed(2)}</div><div class="calc-result-sub">${totalHours} hrs total</div></div>
    <div class="calc-result"><div class="calc-result-label">Per use</div><div class="calc-result-val">AED ${perUse.toFixed(2)}</div><div class="calc-result-sub">at ${usage} uses/mo</div></div>`;

  // Year-by-year breakdown
  const rows=[];
  for(let y=1;y<=Math.min(Math.ceil(totalMonths/12),10);y++){
    const m=Math.min(y*12,totalMonths);
    rows.push({label:`Year ${y}`,cumul:monthlyAmt*m,period:monthlyAmt*Math.min(12,totalMonths-(y-1)*12)});
  }
  if(unit==='months'){
    document.getElementById('cc-breakdown').innerHTML=`
      <div class="calc-breakdown-row"><span class="calc-breakdown-label">Monthly</span><span class="calc-breakdown-val">AED ${fmt(monthlyAmt)}</span></div>
      <div class="calc-breakdown-row"><span class="calc-breakdown-label">3 months</span><span class="calc-breakdown-val">AED ${fmt(monthlyAmt*3)}</span></div>
      <div class="calc-breakdown-row"><span class="calc-breakdown-label">6 months</span><span class="calc-breakdown-val">AED ${fmt(monthlyAmt*6)}</span></div>
      <div class="calc-breakdown-row"><span class="calc-breakdown-label">1 year</span><span class="calc-breakdown-val">AED ${fmt(monthlyAmt*12)}</span></div>
      <div class="calc-breakdown-row"><span class="calc-breakdown-label">2 years</span><span class="calc-breakdown-val">AED ${fmt(monthlyAmt*24)}</span></div>
      <div class="calc-breakdown-row"><span class="calc-breakdown-label">5 years</span><span class="calc-breakdown-val">AED ${fmt(monthlyAmt*60)}</span></div>`;
  } else {
    document.getElementById('cc-breakdown').innerHTML=rows.map(r=>`
      <div class="calc-breakdown-row">
        <span class="calc-breakdown-label">${r.label}</span>
        <span class="calc-breakdown-val" style="display:flex;gap:16px">
          <span style="color:var(--text3);font-size:12px">+AED ${fmt(r.period)}</span>
          <span>AED ${fmt(r.cumul)} total</span>
        </span>
      </div>`).join('');
  }
}

function renderCompare(){
  const active=items.filter(i=>!i.isTrial&&i.status==='active');
  if(!active.length){document.getElementById('cmp-list').innerHTML=`<div class="empty">No active subscriptions to compare.</div>`;return;}
  const sorted=[...active].sort((a,b)=>toMonthly(b.amount,b.cycle)-toMonthly(a.amount,a.cycle));
  const max=toMonthly(sorted[0].amount,sorted[0].cycle);
  document.getElementById('cmp-list').innerHTML=sorted.map(item=>{
    const m=toMonthly(item.amount,item.cycle);
    const pct=Math.round(m/max*100);
    const color=(item.color&&item.color!=='none')?item.color:(CATCOLORS[item.cat]||'#888');
    return `<div class="calc-compare-row">
      <div class="calc-compare-dot" style="background:${color}"></div>
      <div class="calc-compare-name">${esc(item.name)}</div>
      <div class="calc-compare-bar-wrap"><div class="calc-compare-bar-track"><div class="calc-compare-bar-fill" style="width:${pct}%;background:${color}"></div></div></div>
      <div class="calc-compare-cycle"><span class="badge badge-cycle" style="font-size:10px;padding:1px 5px;border-radius:3px;background:var(--surface3);color:var(--text3);border:0.5px solid var(--border2)">${item.cycle}</span></div>
      <div class="calc-compare-val">AED ${fmt(m)}<span style="font-size:10px;color:var(--text3)">/mo</span></div>
    </div>`;
  }).join('');

  // Custom comparison slots
  const slots=4;
  document.getElementById('cmp-custom-inputs').innerHTML=[...Array(slots)].map((_,i)=>`
    <div>
      <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px">Option ${i+1}</div>
      <input type="text" placeholder="Name" style="width:100%;height:32px;background:var(--surface2);border:0.5px solid var(--border2);border-radius:7px;color:var(--text);padding:0 8px;font-size:12px;font-family:var(--font);outline:none;margin-bottom:5px" id="cmp-name-${i}" oninput="renderCustomCompare()">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px">
        <input type="number" placeholder="AED" min="0" step="0.01" style="height:32px;background:var(--surface2);border:0.5px solid var(--border2);border-radius:7px;color:var(--text);padding:0 8px;font-size:12px;font-family:var(--font);outline:none;width:100%" id="cmp-amt-${i}" oninput="renderCustomCompare()">
        <select style="height:32px;background:var(--surface2);border:0.5px solid var(--border2);border-radius:7px;color:var(--text2);padding:0 6px;font-size:12px;font-family:var(--font);outline:none;width:100%" id="cmp-cyc-${i}" onchange="renderCustomCompare()">
          <option value="monthly">Monthly</option><option value="yearly">Yearly</option><option value="weekly">Weekly</option><option value="quarterly">Quarterly</option>
        </select>
      </div>
    </div>`).join('');
  renderCustomCompare();
}

function renderCustomCompare(){
  const opts=[];
  for(let i=0;i<4;i++){
    const name=(document.getElementById(`cmp-name-${i}`)?.value||'').trim();
    const amt=parseFloat(document.getElementById(`cmp-amt-${i}`)?.value||'');
    const cyc=document.getElementById(`cmp-cyc-${i}`)?.value||'monthly';
    if(name&&!isNaN(amt)&&amt>0)opts.push({name,amt,cyc,monthly:toMonthly(amt,cyc)});
  }
  if(!opts.length){document.getElementById('cmp-custom-results').innerHTML='';return;}
  const maxM=Math.max(...opts.map(o=>o.monthly));
  const colors=['#4A8ECC','#1D9E75','#C46A8A','#C98A1A'];
  document.getElementById('cmp-custom-results').innerHTML=`
    <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px">Side by side</div>`+
    opts.sort((a,b)=>a.monthly-b.monthly).map((o,i)=>`
    <div class="calc-compare-row">
      <div class="calc-compare-dot" style="background:${colors[i%colors.length]}"></div>
      <div class="calc-compare-name">${esc(o.name)}</div>
      <div class="calc-compare-bar-wrap"><div class="calc-compare-bar-track"><div class="calc-compare-bar-fill" style="width:${Math.round(o.monthly/maxM*100)}%;background:${colors[i%colors.length]}"></div></div></div>
      <div style="font-size:11px;color:var(--text3);flex-shrink:0">${o.cyc}</div>
      <div class="calc-compare-val">AED ${fmt(o.monthly)}<span style="font-size:10px;color:var(--text3)">/mo</span></div>
    </div>`).join('')+`
    <div style="border-top:0.5px solid var(--border);margin-top:10px;padding-top:10px;display:flex;justify-content:space-between;align-items:center">
      <span style="font-size:12px;color:var(--text2)">Cheapest saves you</span>
      <span style="font-family:var(--mono);font-size:13px;font-weight:500;color:var(--accent)">AED ${fmt((maxM-Math.min(...opts.map(o=>o.monthly)))*12)}/yr vs most expensive</span>
    </div>`;
}

function calcWorth(){
  const amount=parseFloat(document.getElementById('wt-amount').value)||0;
  const cycle=document.getElementById('wt-cycle').value;
  const uses=parseInt(document.getElementById('wt-uses').value)||1;
  const mins=parseInt(document.getElementById('wt-mins').value)||30;
  document.getElementById('wt-uses-val').textContent=uses;
  document.getElementById('wt-mins-val').textContent=mins;

  const monthly=toMonthly(amount,cycle);
  const totalMinsMonth=uses*mins;
  const totalHrsMonth=totalMinsMonth/60;
  const perUse=monthly/uses;
  const perHour=totalHrsMonth>0?monthly/totalHrsMonth:0;
  const perDay=monthly/30.4;

  // Verdict logic
  let verdict,verdictColor,verdictDetail;
  if(perUse<=1&&perHour<=5){
    verdict='Great value';verdictColor='var(--accent)';
    verdictDetail=`At AED ${perUse.toFixed(2)} per use and AED ${perHour.toFixed(2)}/hr, you're getting excellent value.`;
  } else if(perUse<=5&&perHour<=15){
    verdict='Reasonable';verdictColor='#4A8ECC';
    verdictDetail=`AED ${perUse.toFixed(2)} per use is fair. Try to use it ${Math.ceil(monthly/2)} times a month to get under AED 2/use.`;
  } else if(perUse<=15){
    verdict='Could be better';verdictColor='var(--amber)';
    verdictDetail=`You need to use it at least ${Math.ceil(monthly/2)} times/month to justify the cost. Currently using it ${uses} times.`;
  } else {
    verdict='Probably not worth it';verdictColor='var(--red)';
    verdictDetail=`At AED ${perUse.toFixed(2)} per use, you're barely using this. Consider pausing or cancelling.`;
  }

  const breakevenUses=Math.ceil(monthly/2); // under AED 2/use target
  const breakevenHrs=(monthly/5).toFixed(1); // under AED 5/hr target

  document.getElementById('wt-results').innerHTML=`
    <div style="text-align:center;padding:1rem 0 1.25rem;border-bottom:0.5px solid var(--border);margin-bottom:1rem">
      <div style="font-size:24px;font-weight:600;color:${verdictColor};letter-spacing:-.01em;margin-bottom:6px">${verdict}</div>
      <div style="font-size:13px;color:var(--text2);max-width:440px;margin:0 auto;line-height:1.6">${verdictDetail}</div>
    </div>
    <div class="calc-result-grid" style="margin-bottom:1rem">
      <div class="calc-result"><div class="calc-result-label">Cost per use</div><div class="calc-result-val ${perUse<=2?'green':perUse<=8?'amber':'red'}">AED ${perUse.toFixed(2)}</div><div class="calc-result-sub">${uses} uses/mo</div></div>
      <div class="calc-result"><div class="calc-result-label">Cost per hour</div><div class="calc-result-val ${perHour<=5?'green':perHour<=15?'amber':'red'}">AED ${perHour.toFixed(2)}</div><div class="calc-result-sub">${totalHrsMonth.toFixed(1)} hrs/mo</div></div>
      <div class="calc-result"><div class="calc-result-label">Cost per day</div><div class="calc-result-val">AED ${perDay.toFixed(2)}</div><div class="calc-result-sub">daily equivalent</div></div>
      <div class="calc-result"><div class="calc-result-label">Monthly total</div><div class="calc-result-val">AED ${fmt(monthly)}</div><div class="calc-result-sub">${cycle}</div></div>
    </div>
    <div style="background:var(--surface2);border-radius:var(--radius);padding:12px 14px">
      <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">To get good value you need</div>
      <div class="calc-breakdown-row"><span class="calc-breakdown-label">Under AED 2 per use</span><span class="calc-breakdown-val">${breakevenUses} uses / month</span></div>
      <div class="calc-breakdown-row"><span class="calc-breakdown-label">Under AED 5 per hour</span><span class="calc-breakdown-val">${breakevenHrs} hours / month</span></div>
      <div class="calc-breakdown-row"><span class="calc-breakdown-label">You currently use it</span><span class="calc-breakdown-val">${uses} uses &#183; ${totalHrsMonth.toFixed(1)} hrs / month</span></div>
    </div>`;
}

function renderCalcPage(){
  populateCalcPicks();
  populateWorthPicks();
  calcCost();
  switchCalcTab(calcTab);
}
function openShortcutsModal(){var m=document.getElementById('shortcuts-modal');if(m)m.style.display='flex';}
function closeShortcutsModal(){var m=document.getElementById('shortcuts-modal');if(m)m.style.display='none';}

document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){closeSearchModal();closeShortcutsModal();closeModal();closeTkModal();closeListsModal();closeSettingsModal();closeLinkViewer();closeTabbyModal();closeRestoreModal();closeWorkspacesModal();closeWsFixModal();closeGoalModal();closeGoalLogModal();closeNoteModal();closeLoanModal();closeAcHistoryModal();closeAccountModal();closeRecvModal();closeShopModal();closeShCollModal();closeLinkModal();closeLinkGroupModal();closePaidBreakdown();closeMobileSidebar();return;}
  const active=document.activeElement;
  const typing=active&&(active.tagName==='INPUT'||active.tagName==='TEXTAREA'||active.tagName==='SELECT');
  if((e.ctrlKey||e.metaKey)&&e.key==='k'){e.preventDefault();openSearchModal();return;}
  if(!typing&&e.key==='/'){e.preventDefault();openSearchModal();return;}
  if(!typing&&e.key==='n'){e.preventDefault();openModal();}
  if(!typing&&e.key==='t'&&currentPage==='tasks'){e.preventDefault();openTaskModal();}
  if(!typing&&e.key==='?'){e.preventDefault();openShortcutsModal();}
});

document.getElementById('modal').addEventListener('click',e=>{if(e.target===document.getElementById('modal'))closeModal();});

/* \u2501\u2501 Task Manager \u2501\u2501 */
function saveTasks(){lsSet(KEY_TASKS,JSON.stringify(tasks));asAutoSave();}
function saveLinks(){lsSet(KEY_LINKS,JSON.stringify(links));}
function saveLinkGroups(){lsSet(KEY_LINK_GROUPS,JSON.stringify(linkGroups));}
function saveShopping(){lsSet(KEY_SHOPPING,JSON.stringify(shopping));asAutoSave();}
function saveShCollections(){lsSet(KEY_SH_LISTS,JSON.stringify(shCollections));}
function saveTaskHistory(){lsSet(KEY_TASK_HIST,JSON.stringify(taskHistory));}

function archiveDoneTasks(){
  // Move tasks done before start of this week to taskHistory
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0,0,0,0);
  const toArchive = tasks.filter(t=>t.done && t.doneAt && new Date(t.doneAt) < startOfWeek);
  if(!toArchive.length) return;
  taskHistory = [...toArchive, ...taskHistory].slice(0, 500); // keep up to 500
  tasks = tasks.filter(t=>!toArchive.find(a=>a.id===t.id));
  saveTasks();
  saveTaskHistory();
}
function saveLists(){lsSet(KEY_LISTS,JSON.stringify(lists));asAutoSave();}
function saveWorkspaces(){lsSet(KEY_WORKSPACES,JSON.stringify(workspaces));asAutoSave&&asAutoSave();}
function getWorkspace(id){return workspaces.find(function(w){return w.id===id;});}
function workspaceLabel(id){var w=getWorkspace(id);return w?((w.emoji||'')+' '+w.name).trim():id||'';}
function workspaceColor(id){var w=getWorkspace(id);return w?w.color:'#888';}
function workspaceEmoji(id){var w=getWorkspace(id);return w?(w.emoji||''):'';}
function populateTkWorkspaceSelect(selectedId){
  var sel=document.getElementById('tk-workspace-sel');
  if(!sel)return;
  sel.innerHTML=workspaces.map(function(w){return '<option value="'+w.id+'">'+(w.emoji?w.emoji+' ':'')+esc(w.name)+'</option>';}).join('');
  if(selectedId&&getWorkspace(selectedId))sel.value=selectedId;
  else if(workspaces.length) sel.value=workspaces[0].id;
}
function populateNewListWorkspaceSelect(){
  var sel=document.getElementById('new-list-workspace');
  if(!sel)return;
  var cur=sel.value;
  sel.innerHTML='<option value="">Global</option>'+workspaces.map(function(w){return '<option value="'+w.id+'">'+(w.emoji?w.emoji+' ':'')+esc(w.name)+'</option>';}).join('');
  if(cur!==undefined)sel.value=cur;
}
function openWorkspacesModal(){
  renderWorkspacesModal();
  document.getElementById('workspaces-modal').style.display='flex';
  setTimeout(function(){var el=document.getElementById('new-ws-name');if(el)el.focus();},50);
}
function closeWorkspacesModal(){
  document.getElementById('workspaces-modal').style.display='none';
  populateTkWorkspaceSelect((document.getElementById('tk-workspace-sel')||{}).value);
  populateNewListWorkspaceSelect();
  renderListsModal();
  renderTasks();
}
function renderWorkspacesModal(){
  var content=document.getElementById('workspaces-manage-content');
  if(!content)return;
  if(!workspaces.length){content.innerHTML='<div style="font-size:13px;color:var(--text3);padding:8px 0">No workspaces.</div>';return;}
  content.innerHTML=workspaces.map(function(w){
    var taskCt=tasks.filter(function(t){return (t.workspace||'personal')===w.id;}).length;
    var listCt=lists.filter(function(l){return l.workspace===w.id;}).length;
    var canDel=workspaces.length>1;
    return '<div class="tk-list-manage-row">'
      +'<span style="width:24px;text-align:center;font-size:16px;flex-shrink:0">'+esc(w.emoji||'')+'</span>'
      +'<div class="tk-list-color-dot" style="background:'+w.color+'"></div>'
      +'<div style="flex:1;font-size:13px;color:var(--text)">'+esc(w.name)+'</div>'
      +'<span style="font-size:11px;color:var(--text3);margin-right:8px">'+taskCt+'\u00B7'+listCt+'</span>'
      +(canDel?'<button class="icon-btn del" onclick="deleteWorkspace(\''+w.id+'\')" title="Delete workspace">&#10005;</button>':'<span style="font-size:10px;color:var(--text3);margin-left:4px">last</span>')
      +'</div>';
  }).join('');
}
function addWorkspace(){
  var nameEl=document.getElementById('new-ws-name');
  var emojiEl=document.getElementById('new-ws-emoji');
  var colorEl=document.getElementById('new-ws-color');
  var name=(nameEl&&nameEl.value||'').trim();
  if(!name){nameEl&&nameEl.focus();return;}
  var emoji=(emojiEl&&emojiEl.value||'').trim();
  var color=(colorEl&&colorEl.value||'#4A8ECC');
  var base=name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')||'ws';
  var id=base,n=1;
  while(getWorkspace(id)){id=base+'-'+(++n);}
  workspaces.push({id:id,name:name,emoji:emoji,color:color});
  saveWorkspaces();
  if(nameEl)nameEl.value='';if(emojiEl)emojiEl.value='';if(colorEl)colorEl.value='#4A8ECC';
  renderWorkspacesModal();
  populateTkWorkspaceSelect((document.getElementById('tk-workspace-sel')||{}).value);
  populateNewListWorkspaceSelect();
  renderTasks();
  toast('Workspace added: '+name);
}
function deleteWorkspace(id){
  if(workspaces.length<=1){toast('Cannot delete last workspace');return;}
  var w=getWorkspace(id);if(!w)return;
  var taskCt=tasks.filter(function(t){return (t.workspace||'personal')===id;}).length;
  var listCt=lists.filter(function(l){return l.workspace===id;}).length;
  var fb=workspaces.find(function(x){return x.id!==id;}).id;
  var msg='Delete workspace "'+w.name+'"?';
  if(taskCt||listCt)msg+=' '+taskCt+' task(s) and '+listCt+' list(s) will move to "'+getWorkspace(fb).name+'".';
  if(!confirm(msg))return;
  tasks.forEach(function(t){if((t.workspace||'personal')===id)t.workspace=fb;});
  lists.forEach(function(l){if(l.workspace===id)l.workspace=fb;});
  workspaces=workspaces.filter(function(x){return x.id!==id;});
  saveWorkspaces();saveTasks();saveLists();
  renderWorkspacesModal();
  populateTkWorkspaceSelect((document.getElementById('tk-workspace-sel')||{}).value);
  populateNewListWorkspaceSelect();
  renderTasks();
  toast('Workspace deleted');
}

function taskDueLabel(dateStr){
  if(!dateStr)return null;
  const[yr,mo,dy]=dateStr.split('-').map(Number);
  const due=new Date(yr,mo-1,dy);
  const today=new Date();today.setHours(0,0,0,0);
  const diff=Math.ceil((due-today)/(1000*60*60*24));
  if(diff<0)return{label:'Overdue',cls:'due-overdue'};
  if(diff===0)return{label:'Today',cls:'due-soon'};
  if(diff===1)return{label:'Tomorrow',cls:'due-soon'};
  if(diff<=7)return{label:`In ${diff}d`,cls:'due-soon'};
  return{label:`${dy} ${MONTHS[mo-1]}`,cls:''};
}

function switchWorkspace(ws){
  tkWorkspace=ws;
  tkFilterStatus='all';tkFilterPriority='all';tkFilterList='all';
  renderTasks();
}


function renderTaskMetrics(){
  const el = document.getElementById('tk-metrics');
  if(!el) return;
  const wsTasks = tasks;
  const active  = wsTasks.filter(t=>!t.done);
  const overdue = active.filter(t=>t.dueDate&&t.dueDate<todayStr());
  const urgent  = active.filter(t=>t.priority==='urgent'||t.priority==='high');
  const dueToday= active.filter(t=>t.dueDate===todayStr());
  const metricStyle = 'background:var(--surface2);border:0.5px solid var(--border);border-radius:var(--radius-md);padding:.7rem 1rem';
  el.innerHTML = [
    {label:'Active', value:active.length, color:'var(--text)'},
    {label:'Overdue', value:overdue.length, color:overdue.length?'var(--red)':'var(--text3)'},
    {label:'Due today', value:dueToday.length, color:dueToday.length?'var(--amber)':'var(--text3)'},
    {label:'Urgent/High', value:urgent.length, color:urgent.length?'var(--purple)':'var(--text3)'},
  ].map(m=>`<div style="${metricStyle}">
    <div style="font-size:10px;color:var(--text3);font-weight:600;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">${m.label}</div>
    <div style="font-size:22px;font-weight:600;font-family:var(--mono);color:${m.color};letter-spacing:-.02em">${m.value}</div>
  </div>`).join('');
}
function renderTasks(){
  if(!document.getElementById('tk-search'))return;
  const todayIso=todayStr();
  const wsTasks=tasks;
  const active=wsTasks.filter(t=>!t.done);
  const done=wsTasks.filter(t=>t.done).length;
  const overdue=active.filter(t=>t.dueDate&&t.dueDate<todayIso).length;
  const dueToday=active.filter(t=>t.dueDate===todayIso).length;
  document.getElementById('tasks-sub').textContent=`${wsTasks.length} task${wsTasks.length!==1?'s':''} \u00B7 ${active.length} active`;
  document.getElementById('tasks-metrics').innerHTML=`
    <div class="metric"><div class="metric-label">Total</div><div class="metric-value">${wsTasks.length}</div><div class="metric-sub">${active.length} active</div></div>
    <div class="metric green"><div class="metric-label">Completed</div><div class="metric-value">${done}</div><div class="metric-sub">all time</div></div>
    ${dueToday>0?`<div class="metric amber"><div class="metric-label">Due today</div><div class="metric-value">${dueToday}</div><div class="metric-sub">don't miss these</div></div>`:''}
    ${overdue>0?`<div class="metric red"><div class="metric-label">Overdue</div><div class="metric-value">${overdue}</div><div class="metric-sub">needs attention</div></div>`:''}`;

  // Filter pills -- grouped dynamically per workspace
  const _pillFor=l=>`<button class="pill${tkFilterList===l.id?' active':''}" onclick="setTkFilter('list','${l.id}')"><span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${l.color};margin-right:4px;vertical-align:middle"></span>${esc(l.name)}</button>`;
  const _grpLabel=txt=>`<span style="font-size:10px;color:var(--text3);font-weight:600;text-transform:uppercase;letter-spacing:.06em;margin:0 4px 0 8px;align-self:center">${txt}</span>`;
  const _wsGroupsHtml=workspaces.map(w=>{const gl=lists.filter(l=>l.workspace===w.id);return gl.length?_grpLabel(w.name)+gl.map(_pillFor).join(''):'';}).join('');
  const _globLists=lists.filter(l=>!l.workspace||!getWorkspace(l.workspace));
  const listPillsHtml=lists.length?`
    <div class="tk-filter-sep"></div>
    <button class="pill${tkFilterList==='all'?' active':''}" onclick="setTkFilter('list','all')">All lists</button>
    ${_wsGroupsHtml}
    ${_globLists.length?_grpLabel('Global')+_globLists.map(_pillFor).join(''):''}
    <button class="pill${tkFilterList==='none'?' active':''}" onclick="setTkFilter('list','none')">No list</button>`:'';
  document.getElementById('tk-filters').innerHTML=`
    <button class="pill${tkFilterStatus==='all'?' active':''}" onclick="setTkFilter('status','all')">All</button>
    <button class="pill${tkFilterStatus==='active'?' active':''}" onclick="setTkFilter('status','active')">Active</button>
    <button class="pill${tkFilterStatus==='done'?' active':''}" onclick="setTkFilter('status','done')">Done</button>
    <div class="tk-filter-sep"></div>
    <button class="pill${tkFilterPriority==='all'?' active':''}" onclick="setTkFilter('priority','all')">Any priority</button>
    <button class="pill${tkFilterPriority==='urgent'?' active':''}" onclick="setTkFilter('priority','urgent')" style="color:var(--red)">Urgent</button>
    <button class="pill${tkFilterPriority==='high'?' active':''}" onclick="setTkFilter('priority','high')" style="color:var(--amber)">High</button>
    <button class="pill${tkFilterPriority==='medium'?' active':''}" onclick="setTkFilter('priority','medium')" style="color:var(--amber)">Medium</button>
    <button class="pill${tkFilterPriority==='low'?' active':''}" onclick="setTkFilter('priority','low')" style="color:var(--accent)">Low</button>
    ${listPillsHtml}
    <button class="icon-btn" onclick="openListsModal()" title="Manage lists" style="margin-left:4px;font-size:12px">&#9998; Lists</button>
    <button class="icon-btn" onclick="openWorkspacesModal()" title="Manage workspaces" style="margin-left:4px;font-size:12px">&#128736; Workspaces</button>`;

  // Filter and sort
  const q=(document.getElementById('tk-search').value||'').toLowerCase();
  const priOrder={urgent:4,high:3,medium:2,low:1,none:0};
  let vis=wsTasks.filter(t=>{
    if(tkFilterStatus==='active'&&t.done)return false;
    if(tkFilterStatus==='done'&&!t.done)return false;
    if(tkFilterPriority!=='all'&&t.priority!==tkFilterPriority)return false;
    if(tkFilterList==='none'&&t.listId)return false;
    if(tkFilterList!=='all'&&tkFilterList!=='none'&&t.listId!==tkFilterList)return false;
    if(q&&!t.title.toLowerCase().includes(q)&&!(t.notes||'').toLowerCase().includes(q)&&!(t.tags||[]).some(tag=>tag.toLowerCase().includes(q)))return false;
    return true;
  });
  const sort=(document.getElementById('tk-sort')||{}).value||'urgency';
  if(sort==='urgency'){
    // Urgency = priority weight + due date proximity
    // Overdue tasks always float to top, then by priority, then by how soon due
    const priW={urgent:1000,high:100,medium:10,low:1,none:0};
    const urgencyScore=t=>{
      let score=priW[t.priority||'none']||0;
      if(t.dueDate){
        const daysLeft=Math.ceil((new Date(t.dueDate)-new Date())/(1000*60*60*24));
        if(daysLeft<0)       score+=5000; // overdue -> always top
        else if(daysLeft===0)score+=2000; // due today
        else if(daysLeft<=3) score+=500;  // due very soon
        else if(daysLeft<=7) score+=100;  // due this week
        else                 score+=Math.max(0,50-daysLeft); // further = less urgent
      }
      return score;
    };
    vis.sort((a,b)=>{
      const diff=urgencyScore(b)-urgencyScore(a);
      if(diff!==0)return diff;
      return (b.createdAt||0)-(a.createdAt||0); // tie-break: newer first
    });
  }
  else if(sort==='due')vis.sort((a,b)=>{if(!a.dueDate&&!b.dueDate)return 0;if(!a.dueDate)return 1;if(!b.dueDate)return -1;return a.dueDate.localeCompare(b.dueDate);});
  else if(sort==='priority')vis.sort((a,b)=>(priOrder[b.priority]||0)-(priOrder[a.priority]||0));
  else if(sort==='name')vis.sort((a,b)=>a.title.localeCompare(b.title));
  else if(sort==='starred')vis.sort((a,b)=>(b.starred?1:0)-(a.starred?1:0));
  else vis.sort((a,b)=>b.createdAt-a.createdAt);

  const container=document.getElementById('tk-list');
  if(!vis.length){
    container.innerHTML='<div class="empty">'+(wsTasks.length?'No tasks match your filter':'Add your first task<br><span class="kbd-hint">Press <kbd>T</kbd> anywhere to add a task</span>')+'</div>';
    return;
  }

  var _firstWsId=(workspaces[0]&&workspaces[0].id)||'personal';
  var _buckets={};
  workspaces.forEach(function(w){_buckets[w.id]=[];});
  vis.forEach(function(t){var wid=(t.workspace&&getWorkspace(t.workspace))?t.workspace:_firstWsId;if(!_buckets[wid])_buckets[wid]=[];_buckets[wid].push(t);});

  function buildSection(sectionTasks,w){
    if(!sectionTasks.length)return '';
    var active=sectionTasks.filter(function(t){return !t.done;});
    var done=sectionTasks.filter(function(t){return t.done;});
    var dotColor=w.color;
    var label=(w.emoji?w.emoji+' ':'')+w.name;
    var headStyle='background:'+w.color+'2b;color:'+w.color+';border:0.5px solid '+w.color+'4d;border-bottom:none';
    var countLabel=active.length+' active'+(done.length?' &middot; '+done.length+' done':'');
    var priW2={urgent:1000,high:100,medium:10,low:1,none:0};
    active.sort(function(a,b){
      var sa=(priW2[a.priority||'none']||0),sb=(priW2[b.priority||'none']||0);
      if(a.dueDate){var d=Math.ceil((new Date(a.dueDate)-new Date())/(1000*60*60*24));if(d<0)sa+=5000;else if(d===0)sa+=2000;else if(d<=3)sa+=500;else if(d<=7)sa+=100;}
      if(b.dueDate){var d=Math.ceil((new Date(b.dueDate)-new Date())/(1000*60*60*24));if(d<0)sb+=5000;else if(d===0)sb+=2000;else if(d<=3)sb+=500;else if(d<=7)sb+=100;}
      return sb-sa;
    });
    var cards=[...active,...done].map(renderTaskCard).join('');
    return '<div class="tk-section">'+
      '<div class="tk-section-head" style="'+headStyle+'">'+
        '<div class="tk-section-head-left">'+
          '<span class="tk-section-dot" style="background:'+dotColor+'"></span>'+
          esc(label)+
        '</div>'+
        '<span style="opacity:.6;font-size:11px;font-weight:400">'+countLabel+'</span>'+
      '</div>'+
      '<div class="tk-section-body">'+cards+'</div>'+
    '</div>';
  }

  container.innerHTML=workspaces.map(function(w){return buildSection(_buckets[w.id]||[],w);}).join('');


}
function toggleBasement(id){
  const isOpen = localStorage.getItem(id)==='1';
  localStorage.setItem(id, isOpen?'0':'1');
  const btn  = document.querySelector('.tk-basement-toggle');
  const list = document.getElementById(id+'-list');
  if(btn)  btn.classList.toggle('open', !isOpen);
  if(list) list.classList.toggle('open', !isOpen);
}

function renderTaskItem(t){
  const doneSubs=(t.subtasks||[]).filter(s=>s.done).length;
  const totalSubs=(t.subtasks||[]).length;
  const dl=taskDueLabel(t.dueDate);
  const dueHtml=dl?`<span class="item-due${dl.cls?' '+dl.cls:''}">${dl.label}</span>`:'';
  const priColors={none:'var(--text3)',low:'#4A8ECC',medium:'var(--amber)',high:'#E07040',urgent:'var(--red)'};
  const priColor=priColors[t.priority||'none'];
  const taskColor=t.color||COLORS[0];
  return `<div class="tk-item${t.done?' tk-done':''}">
    <div class="tk-pri-bar" style="background:${priColor}"></div>
    <div class="tk-check${t.done?' checked':''}" onclick="toggleTaskDone('${t.id}')" title="${t.done?'Mark active':'Mark done'}">${t.done?'&#10003;':''}</div>
    <div class="tk-color-circle" style="background:${taskColor}"></div>
    <div class="tk-body">
      <div class="tk-title">${esc(t.title)}</div>
      <div class="tk-meta">
        ${(function(){var _w=getWorkspace(t.workspace);return _w?'<span class="tk-tag" style="background:'+_w.color+'26;color:'+_w.color+'">'+(_w.emoji?_w.emoji+' ':'')+esc(_w.name)+'</span>':'';})()}
        ${dueHtml}
        ${(t.tags||[]).filter(Boolean).map(tag=>`<span class="tk-tag">#${esc(tag.trim())}</span>`).join('')}
        ${totalSubs?`<span style="font-size:11px;color:var(--text3)">${doneSubs}/${totalSubs} subtasks</span>`:''}
      </div>
      ${t.notes?`<div class="tk-notes-preview">${esc(t.notes)}</div>`:''}
      ${totalSubs?`<div class="tk-subtask-bar"><div class="tk-subtask-fill" style="width:${Math.round(doneSubs/totalSubs*100)}%"></div></div>`:''}
    </div>
    <div class="tk-actions">
      <button class="tk-star${t.starred?' on':''}" onclick="toggleTaskStar('${t.id}')" title="${t.starred?'Unstar':'Star'}">&#9733;</button>
      <button class="icon-btn" onclick="openTaskModal('${t.id}')" title="Edit">&#9998;</button>
      <button class="icon-btn" onclick="duplicateTask('${t.id}')" title="Duplicate">&#10697;</button>
      <button class="icon-btn del" onclick="deleteTask('${t.id}')" title="Delete">&#10005;</button>
    </div>
  </div>`;
}

function renderTaskCard(t){
  var dl=taskDueLabel(t.dueDate);
  var dueHtml=dl?'<span class="item-due'+(dl.cls?' '+dl.cls:'')+'">'+(dl.label)+'</span>':'';
  var doneSubs=(t.subtasks||[]).filter(function(s){return s.done;}).length;
  var totalSubs=(t.subtasks||[]).length;
  var priColors={urgent:'#E05252',high:'#C98A1A',medium:'#7F77DD',low:'#4A8ECC',none:''};
  var stripeColor=priColors[t.priority||'none']||'';
  var stripeHtml=stripeColor?'<div class="tk-card-stripe" style="background:'+stripeColor+'"></div>':'';
  var wsCol=workspaceColor(t.workspace||'personal');
  var barColor=wsCol;
  var svgDone='<svg viewBox="0 0 12 12" width="9" height="9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1.5 6l3 3 6-5"/></svg>';
  var svgEdit='<svg viewBox="0 0 12 12" width="9" height="9" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 1.5l2 2-6 6H2.5v-2l6-6z"/><path d="M7 3l2 2"/></svg>';
  var svgDup='<svg viewBox="0 0 12 12" width="9" height="9" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="1" width="7" height="7" rx="1"/><rect x="1" y="4" width="7" height="7" rx="1"/></svg>';
  var svgDel='<svg viewBox="0 0 12 12" width="9" height="9" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h8M5 3V2h2v1M4 3l.5 6.5h3L8 3"/></svg>';
  var tagsHtml=(t.tags||[]).filter(Boolean).map(function(tag){return '<span class="tk-tag">#'+esc(tag.trim())+'</span>';}).join('');
  var subtaskBar='';
  if(totalSubs){
    // v5.20.2: default expanded; key === '0' means user explicitly collapsed.
    var expanded = localStorage.getItem('lifeos_tk_exp_'+t.id) !== '0';
    var arrow = expanded ? '▾' : '▸';
    var pct = Math.round(doneSubs/totalSubs*100);
    subtaskBar =
      '<div class="tk-card-subrow tk-card-subrow-clickable" data-id="'+t.id+'" onclick="tkToggleSubtasks(this.dataset.id)">'+
        '<span class="tk-card-sub-arrow">'+arrow+'</span>'+
        '<span class="tk-card-sublabel">'+doneSubs+'/'+totalSubs+'</span>'+
        '<div class="tk-card-subbar-wrap"><div class="tk-card-subbar-fill" style="width:'+pct+'%;background:'+barColor+'"></div></div>'+
        '<span class="tk-card-sublabel">subtasks</span>'+
      '</div>';
    if(expanded){
      var disabled = t.done ? ' disabled' : '';
      subtaskBar += '<div class="tk-card-sub-list">'+
        (t.subtasks||[]).map(function(s){
          return '<label class="tk-card-sub-row'+(s.done?' done':'')+'">'+
            '<input type="checkbox" class="tk-card-sub-cb"'+(s.done?' checked':'')+disabled+
              ' data-tid="'+t.id+'" data-sid="'+s.id+'"'+
              ' onclick="event.stopPropagation();tkToggleSubtask(this.dataset.tid,this.dataset.sid)">'+
            '<span class="tk-card-sub-text">'+esc(s.title||'')+'</span>'+
          '</label>';
        }).join('')+
      '</div>';
    }
  }
  var notesHtml=t.notes?'<div class="tk-card-notes">'+esc(t.notes)+'</div>':'';
  var actionsHtml=t.done?'':
    '<div class="tk-card-actions">'+
    '<button class="tk-ibtn tk-ibtn-done" data-id="'+t.id+'" onclick="toggleTaskDone(this.dataset.id)" title="Mark done">'+svgDone+'</button>'+
    '<button class="tk-ibtn" data-id="'+t.id+'" onclick="openTaskModal(this.dataset.id)" title="Edit">'+svgEdit+'</button>'+
    '<button class="tk-ibtn" data-id="'+t.id+'" onclick="duplicateTask(this.dataset.id)" title="Duplicate">'+svgDup+'</button>'+
    '<button class="tk-ibtn tk-ibtn-del" data-id="'+t.id+'" onclick="deleteTask(this.dataset.id)" title="Delete">'+svgDel+'</button>'+
    '</div>';
  var cardCls='tk-card'+(t.done?' tk-card-done':'');
  var checkHtml=t.done?
    '<div class="tk-card-check tk-card-check-done" data-id="'+t.id+'" onclick="toggleTaskDone(this.dataset.id)">&#10003;</div>':
    '<div class="tk-card-check" data-id="'+t.id+'" onclick="toggleTaskDone(this.dataset.id)"></div>';
  return '<div class="'+cardCls+'" id="task-'+t.id+'">'+
    stripeHtml+
    '<div class="tk-card-top">'+
      '<div style="display:flex;gap:6px;align-items:flex-start;flex:1;min-width:0">'+
        checkHtml+
        '<div class="tk-card-title">'+esc(t.title)+'</div>'+
      '</div>'+
    '</div>'+
    '<div class="tk-card-meta">'+dueHtml+tagsHtml+'</div>'+
    subtaskBar+
    notesHtml+
    actionsHtml+
  '</div>';
}

function setTkFilter(type,val){
  if(type==='status')tkFilterStatus=val;
  else if(type==='priority')tkFilterPriority=val;
  else if(type==='list')tkFilterList=val;
  renderTasks();
}

function toggleTaskDone(id){
  const t=tasks.find(t=>t.id===id);if(!t)return;
  t.done=!t.done;
  if(t.done) t.doneAt=new Date().toISOString();
  else delete t.doneAt;
  saveTasks();renderTasks();
  toast(t.done?`&#10003; Done: ${t.title}`:`&#8617; Reopened: ${t.title}`);
}

function toggleTaskStar(id){
  const t=tasks.find(t=>t.id===id);if(!t)return;
  t.starred=!t.starred;
  saveTasks();renderTasks();
}

function deleteTask(id){
  const t=tasks.find(t=>t.id===id);if(!t)return;
  deletedTask=t;
  tasks=tasks.filter(t=>t.id!==id);
  saveTasks();renderTasks();
  toast(`Removed: ${t.title}`,true);
}

function duplicateTask(id){
  const t=tasks.find(t=>t.id===id);if(!t)return;
  const copy={
    ...t,
    id:String(Date.now()),
    title:t.title+' (copy)',
    done:false,
    createdAt:Date.now(),
    subtasks:(t.subtasks||[]).map(s=>({...s,id:String(Date.now()+Math.random()),done:false})),
  };
  const idx=tasks.findIndex(t=>t.id===id);
  tasks.splice(idx+1,0,copy);
  saveTasks();renderTasks();
  toast(`Duplicated: ${t.title}`);
}

/* Task modal */
function renderTkColorPicker(){
  document.getElementById('tk-color-picker').innerHTML=COLORS.map(c=>c==='none'?`<div class="color-dot none-dot${tkSelectedColor==='none'?' selected':''}" onclick="selectTkColor('none')" title="No colour">&#8854;</div>`:`<div class="color-dot${tkSelectedColor===c?' selected':''}" style="background:${c}" onclick="selectTkColor('${c}')"></div>`).join('');
}
function selectTkColor(c){tkSelectedColor=c;renderTkColorPicker();}

function populateTkListSelect(selectedId, workspace){
  const sel=document.getElementById('tk-list-sel');
  if(!sel)return;
  const vis=lists.filter(l=>!l.workspace||!workspace||l.workspace===workspace);
  sel.innerHTML='<option value="">No list</option>'+vis.map(l=>{
    const tag=l.workspace?' \u00b7 '+l.workspace:'';
    return `<option value="${l.id}">${esc(l.name)}${tag}</option>`;
  }).join('');
  if(selectedId)sel.value=selectedId;
}

function openTaskModal(id){
  tkEditId=id||null;
  const t=id?tasks.find(t=>t.id===id):null;
  document.getElementById('tk-modal-title').textContent=t?'Edit task':'New task';
  document.getElementById('tk-title').value=t?.title||'';
  document.getElementById('tk-notes').value=t?.notes||'';
  document.getElementById('tk-priority').value=t?.priority||'none';
  document.getElementById('tk-due').value=t?.dueDate||'';
  document.getElementById('tk-tags').value=t?.tags?(t.tags.join(', ')):'';
  const wsSel=document.getElementById('tk-workspace-sel');
  populateTkWorkspaceSelect(t?.workspace||'personal');
  const curWs=t?.workspace||(workspaces[0]&&workspaces[0].id)||'personal';
  if(wsSel){
    wsSel.value=curWs;
    wsSel.onchange=function(){populateTkListSelect((document.getElementById('tk-list-sel')||{}).value||null,this.value);};
  }
  populateTkListSelect(t?.listId||null,curWs);
  const listSel=document.getElementById('tk-list-sel');
  if(listSel){
    listSel.onchange=function(){
      var lid=this.value;
      var l=lid?lists.find(function(x){return x.id===lid;}):null;
      if(l&&l.workspace){
        var ws2=document.getElementById('tk-workspace-sel');
        if(ws2&&ws2.value!==l.workspace)ws2.value=l.workspace;
      }
    };
  }
  tkSelectedColor=t?.color||COLORS[0];
  renderTkColorPicker();
  renderModalSubtasks(t?.subtasks||[]);
  document.getElementById('tk-panel').classList.add('open');
  document.getElementById('tk-panel-tint').classList.add('show');
  setTimeout(()=>document.getElementById('tk-title').focus(),80);
}
function closeTkModal(){
  document.getElementById('tk-panel').classList.remove('open');
  document.getElementById('tk-panel-tint').classList.remove('show');
  tkEditId=null;
}

function renderModalSubtasks(subs){
  modalSubtasks=(subs||[]).map(s=>({...s}));
  refreshModalSubtasks();
}
function refreshModalSubtasks(){
  const container=document.getElementById('tk-sub-list');
  if(!modalSubtasks.length){container.innerHTML='';container.className='';return;}
  container.className='tk-sub-list';
  // Build rows using DOM nodes to avoid innerHTML/event conflicts and checkbox rendering issues
  container.innerHTML='';
  modalSubtasks.forEach((s,i)=>{
    const row=document.createElement('div');
    row.className='tk-sub-row';
    // Checkbox
    const cb=document.createElement('input');
    cb.type='checkbox';cb.checked=!!s.done;
    cb.style.accentColor='var(--accent)';cb.style.cursor='pointer';cb.style.flexShrink='0';
    cb.style.width='15px';cb.style.height='15px';
    cb.addEventListener('change',function(){modalSubtasks[i].done=this.checked;});
    // Text input
    const inp=document.createElement('input');
    inp.type='text';inp.value=s.title||'';inp.placeholder='Subtask\u2026';
    inp.style.cssText='flex:1;background:transparent;border:none;color:var(--text);font-size:13px;font-family:var(--font);outline:none;padding:0;min-width:0';
    inp.addEventListener('input',function(){modalSubtasks[i].title=this.value;});
    inp.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();addSubtaskRow();}});
    // Delete button
    const del=document.createElement('button');
    del.className='tk-sub-del';del.title='Remove';del.innerHTML='&#10005;';
    del.addEventListener('click',function(){removeSubtaskRow(i);});
    row.appendChild(cb);row.appendChild(inp);row.appendChild(del);
    container.appendChild(row);
  });
}
function addSubtaskRow(){
  modalSubtasks.push({id:String(Date.now()+modalSubtasks.length),title:'',done:false});
  refreshModalSubtasks();
  setTimeout(()=>{const rows=document.querySelectorAll('.tk-sub-row input[type=text]');if(rows.length)rows[rows.length-1].focus();},50);
}
function removeSubtaskRow(i){modalSubtasks.splice(i,1);refreshModalSubtasks();}

function saveTask(){
  const title=document.getElementById('tk-title').value.trim();
  if(!title){document.getElementById('tk-title').focus();return;}
  const tagsRaw=document.getElementById('tk-tags').value;
  const tags=tagsRaw?tagsRaw.split(',').map(t=>t.trim()).filter(Boolean):[];
  const subtasks=modalSubtasks.filter(s=>(s.title||'').trim()).map(s=>({...s,title:s.title.trim()}));
  const existing=tkEditId?tasks.find(t=>t.id===tkEditId):null;
  const obj={
    id:tkEditId||String(Date.now()),
    title,
    notes:document.getElementById('tk-notes').value.trim(),
    priority:document.getElementById('tk-priority').value,
    dueDate:document.getElementById('tk-due').value||null,
    listId:((document.getElementById('tk-list-sel')||{}).value)||null,
    workspace:(document.getElementById('tk-workspace-sel')||{}).value||(existing?existing.workspace||'personal':'personal'),
    tags,subtasks,
    done:existing?.done||false,
    starred:existing?.starred||false,
    color:tkSelectedColor,
    createdAt:existing?.createdAt||Date.now(),
  };
  if(tkEditId){const idx=tasks.findIndex(t=>t.id===tkEditId);if(idx>-1)tasks[idx]=obj;}
  else tasks.unshift(obj);
  saveTasks();closeTkModal();renderTasks();
  toast(tkEditId?`Updated: ${obj.title}`:`Added: ${obj.title}`);
}

/* Lists management */
function openListsModal(){
  populateNewListWorkspaceSelect();
  renderListsModal();
  document.getElementById('lists-modal').style.display='flex';
  setTimeout(()=>document.getElementById('new-list-input').focus(),50);
}
function closeListsModal(){
  document.getElementById('lists-modal').style.display='none';
  renderTasks();
}
function renderListsModal(){
  const content=document.getElementById('lists-manage-content');
  if(!lists.length){content.innerHTML=`<div style="font-size:13px;color:var(--text3);padding:8px 0">No lists yet. Create one below.</div>`;return;}
  content.innerHTML=lists.map(l=>{
    const ws=l.workspace||null;
    const _w=ws?getWorkspace(ws):null;
    const wsLabel=_w?_w.name:'Global';
    const wsColor=_w?_w.color:'#888';
    return `<div class="tk-list-manage-row">
      <div class="tk-list-color-dot" style="background:${l.color}"></div>
      <div style="flex:1;font-size:13px;color:var(--text)">${esc(l.name)}</div>
      <button class="icon-btn" onclick="cycleListWorkspace('${l.id}')" title="Click to change workspace" style="font-size:10px;font-weight:600;padding:3px 8px;border-radius:999px;background:${wsColor}22;color:${wsColor};border:0.5px solid ${wsColor}55;margin-right:8px;cursor:pointer">${wsLabel}</button>
      <span style="font-size:11px;color:var(--text3);margin-right:8px">${tasks.filter(t=>t.listId===l.id).length} tasks</span>
      <button class="icon-btn del" onclick="deleteList('${l.id}')" title="Delete list">&#10005;</button>
    </div>`;}).join('');
}
function cycleListWorkspace(id){
  var l=lists.find(function(x){return x.id===id;});if(!l)return;
  var seq=[null].concat(workspaces.map(function(w){return w.id;}));
  var cur=l.workspace||null;
  var i=seq.indexOf(cur);if(i<0)i=0;
  l.workspace=seq[(i+1)%seq.length];
  saveLists();renderListsModal();renderTasks();
}
function addList(){
  const input=document.getElementById('new-list-input');
  const name=input.value.trim();
  if(!name)return;
  const wsSel=document.getElementById('new-list-workspace');
  const workspace=(wsSel&&wsSel.value)||null;
  lists.push({id:String(Date.now()),name,workspace,color:COLORS[1+(lists.length%(COLORS.length-1))]});
  saveLists();input.value='';if(wsSel)wsSel.value='';renderListsModal();
}
function deleteList(id){
  if(!confirm('Delete this list? Tasks will be unassigned.'))return;
  lists=lists.filter(l=>l.id!==id);
  tasks.forEach(t=>{if(t.listId===id)t.listId=null;});
  saveTasks();saveLists();renderListsModal();
}


/* Workspace migration helper (v5.17.2) */
var _wsFixStaged={};
function openWsFixModal(){
  _wsFixStaged={};
  renderWsFixModal();
  document.getElementById('ws-fix-modal').style.display='flex';
}
function closeWsFixModal(){
  document.getElementById('ws-fix-modal').style.display='none';
  _wsFixStaged={};
}
function renderWsFixModal(){
  var content=document.getElementById('ws-fix-content');
  var list=tasks.slice();
  if(!list.length){content.innerHTML='<div style="padding:14px;color:var(--text3);text-align:center;font-size:13px">No tasks to reclassify.</div>';return;}
  list.sort(function(a,b){
    if(!!a.done!==!!b.done)return a.done?1:-1;
    return (a.title||'').localeCompare(b.title||'');
  });
  content.innerHTML=list.map(function(t){
    var cur=t.workspace||'personal';
    var staged=_wsFixStaged[t.id];
    var sel=staged!==undefined?staged:cur;
    var doneCls=t.done?'opacity:.5;':'';
    return '<div style="display:flex;gap:8px;align-items:center;padding:7px 6px;border-bottom:0.5px solid var(--border);'+doneCls+'">'
      +'<div style="flex:1;min-width:0;font-size:13px;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="'+esc(t.title)+'">'+esc(t.title)+'</div>'
      +'<select data-tid="'+t.id+'" onchange="stageWsFix(this.dataset.tid,this.value)" style="height:28px;background:var(--surface2);border:0.5px solid var(--border2);border-radius:6px;color:var(--text);padding:0 6px;font-size:12px;font-family:var(--font);flex-shrink:0">'
        +workspaces.map(function(w){return '<option value="'+w.id+'"'+(sel===w.id?' selected':'')+'>'+(w.emoji?w.emoji+' ':'')+esc(w.name)+'</option>';}).join('')
      +'</select>'
      +'</div>';
  }).join('');
  updateWsFixCount();
}
function stageWsFix(tid,ws){
  var t=tasks.find(function(x){return x.id===tid;});
  if(!t)return;
  if((t.workspace||'personal')===ws)delete _wsFixStaged[tid];
  else _wsFixStaged[tid]=ws;
  updateWsFixCount();
}
function updateWsFixCount(){
  var el=document.getElementById('ws-fix-count');
  if(!el)return;
  var n=Object.keys(_wsFixStaged).length;
  el.textContent=n?(n+' pending change'+(n!==1?'s':'')):'No changes';
}
function applyWsFix(){
  var keys=Object.keys(_wsFixStaged);
  if(!keys.length){toast('No changes to apply');closeWsFixModal();return;}
  keys.forEach(function(tid){
    var t=tasks.find(function(x){return x.id===tid;});
    if(t)t.workspace=_wsFixStaged[tid];
  });
  saveTasks();
  closeWsFixModal();
  renderTasks();
  toast('Updated '+keys.length+' task'+(keys.length!==1?'s':''));
}

/* Tasks CSV export */
function exportTasksCSV(){
  if(!tasks.length){toast('No tasks to export');return;}
  const rows=[['Title','Status','Priority','Due Date','List','Tags','Notes','Starred','Subtasks Done','Subtasks Total','Created']];
  tasks.forEach(t=>{
      const doneSubs=(t.subtasks||[]).filter(s=>s.done).length;
    rows.push([t.title,t.done?'Done':'Active',t.priority||'none',t.dueDate||'',list?list.name:'',
      (t.tags||[]).join('; '),t.notes||'',t.starred?'Yes':'No',doneSubs,(t.subtasks||[]).length,
      new Date(t.createdAt).toISOString()]);
  });
  const csv=rows.map(r=>r.map(v=>`"${String(v==null?'':v).replace(/"/g,'""')}"`).join(',')).join('\n');
  triggerDownload(new Blob([csv],{type:'text/csv'}),'tasks-export.csv');
  toast('Tasks CSV exported');
}

/* \u2500\u2500 Reliable download helper (works on file:// after DOM interactions) \u2500\u2500 */
function triggerDownload(blob,filename){
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;a.download=filename;
  a.style.cssText='position:absolute;left:-9999px;top:-9999px';
  document.body.appendChild(a);
  a.click();
  // Remove anchor immediately -- download is already queued.
  // Revoke the blob URL after 30s so tab-switching / prompt-sending
  // cannot cancel the download before Chrome has had a chance to start it.
  setTimeout(function(){document.body.removeChild(a);},200);
  setTimeout(function(){URL.revokeObjectURL(url);},30000);
}

/* \u2500\u2500 Goals \u2500\u2500 */
function glGoalStatus(g){
  if(g.status==='completed')return'completed';
  if(g.deadline&&new Date(g.deadline)<new Date()&&g.status!=='completed')return'overdue';
  return g.status||'active';
}
function glProgress(g){
  if(g.type==='milestone'){
    const ms=g.milestones||[];
    if(!ms.length)return 0;
    return Math.round((ms.filter(m=>m.done).length/ms.length)*100);
  }
  const tgt=parseFloat(g.target)||0;
  if(!tgt)return 0;
  return Math.min(100,Math.round(((parseFloat(g.current)||0)/tgt)*100));
}
function glDaysLabel(deadline,status){
  if(!deadline)return null;
  if(status==='completed')return{label:'Completed',cls:'gl-days-done'};
  const diff=Math.ceil((new Date(deadline)-new Date())/(1000*60*60*24));
  if(diff<0)return{label:`${Math.abs(diff)}d overdue`,cls:'gl-days-over'};
  if(diff===0)return{label:'Due today',cls:'gl-days-warn'};
  if(diff<=7)return{label:`${diff}d left`,cls:'gl-days-warn'};
  if(diff<=30)return{label:`${diff}d left`,cls:'gl-days-ok'};
  const months=Math.round(diff/30);
  return{label:`~${months}mo left`,cls:'gl-days-ok'};
}
function renderGoals(){
  const all=goals;
  // Metrics
  const active=all.filter(g=>glGoalStatus(g)==='active');
  const completed=all.filter(g=>glGoalStatus(g)==='completed');
  const overdue=all.filter(g=>glGoalStatus(g)==='overdue');
  const finTotal=all.filter(g=>g.category==='financial'&&g.type==='amount').reduce((s,g)=>s+(parseFloat(g.target)||0),0);
  const finSaved=all.filter(g=>g.category==='financial'&&g.type==='amount').reduce((s,g)=>s+(parseFloat(g.current)||0),0);
  document.getElementById('goals-metrics').innerHTML=`
    <div class="metric"><div class="metric-label">Total goals</div><div class="metric-value">${all.length}</div><div class="metric-sub">${active.length} active</div></div>
    <div class="metric green"><div class="metric-label">Completed</div><div class="metric-value">${completed.length}</div><div class="metric-sub">${completed.length?Math.round(completed.length/all.length*100)+'%':'-'} completion rate</div></div>
    ${overdue.length?`<div class="metric red"><div class="metric-label">Overdue</div><div class="metric-value">${overdue.length}</div><div class="metric-sub">past deadline</div></div>`:''}
    ${finTotal>0?`<div class="metric amber"><div class="metric-label">Financial targets</div><div class="metric-value">AED ${fmt(finTotal)}</div><div class="metric-sub">AED ${fmt(finSaved)} saved so far</div></div>`:''}
  `;
  // Filter pills
  const cats=['all','financial','personal','completed'];
  const catLabels={'all':'All','financial':'&#128176; Financial','personal':'&#127775; Personal','completed':'&#10003; Completed'};
  document.getElementById('gl-filters').innerHTML=cats.map(c=>`<button class="pill${glFilterCat===c?' active':''}" onclick="glSetFilter('${c}')">${catLabels[c]}</button>`).join('');
  // Filter goals
  let filtered=all;
  if(glFilterCat==='financial')filtered=all.filter(g=>g.category==='financial');
  else if(glFilterCat==='personal')filtered=all.filter(g=>g.category==='personal');
  else if(glFilterCat==='completed')filtered=all.filter(g=>glGoalStatus(g)==='completed');
  // Sort: active first, then by deadline
  filtered=filtered.slice().sort((a,b)=>{
    const sa=glGoalStatus(a),sb=glGoalStatus(b);
    const order={overdue:0,active:1,paused:2,completed:3};
    if(order[sa]!==order[sb])return order[sa]-order[sb];
    if(a.deadline&&b.deadline)return new Date(a.deadline)-new Date(b.deadline);
    if(a.deadline)return -1;
    if(b.deadline)return 1;
    return b.createdAt-a.createdAt;
  });
  const container=document.getElementById('gl-list');
  if(!filtered.length){
    container.innerHTML=`<div class="gl-empty"><div class="gl-empty-icon">\uD83C\uDFAF</div><div style="font-size:15px;font-weight:500;color:var(--text2);margin-bottom:6px">${all.length?'No goals match this filter':'No goals yet'}</div><div style="font-size:13px">Set your first goal to get started</div></div>`;
    return;
  }
  container.innerHTML=`<div class="gl-grid">${filtered.map(g=>glCardHTML(g)).join('')}</div>`;
}
function glCardHTML(g){
  const pct=glProgress(g);
  const status=glGoalStatus(g);
  const color=g.category==='financial'?'var(--accent)':'var(--purple)';
  const daysInfo=glDaysLabel(g.deadline,status);
  const isFin=g.category==='financial';
  const isDone=status==='completed';
  const isOver=status==='overdue';
  let progressSection='';
  if(g.type==='amount'){
    progressSection=`
      <div class="gl-progress-wrap">
        <div class="gl-progress-row">
          <span class="gl-progress-label">Progress</span>
          <span class="gl-progress-pct" style="color:${isDone?'var(--accent)':isOver&&pct<100?'var(--red)':color}">${pct}%</span>
        </div>
        <div class="gl-progress-track"><div class="gl-progress-fill" style="width:${pct}%;background:${isDone?'var(--accent)':isOver&&pct<100?'var(--red)':color}"></div></div>
        <div class="gl-amounts">
          <span class="gl-current" style="color:${color}">AED ${fmt(parseFloat(g.current)||0)}</span>
          <span class="gl-target">of AED ${fmt(parseFloat(g.target)||0)}</span>
        </div>
      </div>`;
  } else {
    const ms=g.milestones||[];
    const doneCt=ms.filter(m=>m.done).length;
    progressSection=`
      <div class="gl-progress-wrap">
        <div class="gl-progress-row">
          <span class="gl-progress-label">${doneCt} of ${ms.length} milestones</span>
          <span class="gl-progress-pct" style="color:${color}">${pct}%</span>
        </div>
        <div class="gl-progress-track"><div class="gl-progress-fill" style="width:${pct}%;background:${color}"></div></div>
        <div class="gl-milestone-checks">${ms.map((m,i)=>`
          <div class="gl-ms-row${m.done?' checked':''}" onclick="toggleMilestone('${g.id}',${i})">
            <input type="checkbox" ${m.done?'checked':''} onclick="event.stopPropagation();toggleMilestone('${g.id}',${i})">
            <span>${esc(m.label)}</span>
          </div>`).join('')}</div>
      </div>`;
  }
  const catBadge=isFin?`<span class="gl-badge gl-badge-fin">Financial</span>`:`<span class="gl-badge gl-badge-per">Personal</span>`;
  const statusBadge=isDone?`<span class="gl-badge gl-badge-done">Done</span>`:isOver?`<span class="gl-badge gl-badge-over">Overdue</span>`:g.status==='paused'?`<span class="gl-badge gl-badge-paused">Paused</span>`:'';
  return`<div class="gl-card${isDone?' gl-done':''}${isOver?' gl-overdue':''}" style="--gl-color:${color}">
    <div style="position:absolute;top:0;left:0;right:0;height:2.5px;border-radius:99px 99px 0 0;background:${color};opacity:${isDone?.5:.8}"></div>
    <div class="gl-card-top">
      <div class="gl-left">
        <div class="gl-emoji">${esc(g.emoji||'\uD83C\uDFAF')}</div>
        <div>
          <div class="gl-title">${esc(g.title)}</div>
          <div class="gl-sub">${catBadge}${statusBadge}<span style="color:var(--text3)">${esc(g.subcategory||'')}</span></div>
        </div>
      </div>
      <div class="gl-actions">
        ${!isDone&&g.type==='amount'?`<button class="icon-btn" title="Log progress" onclick="openGoalLogModal('${g.id}')">+</button>`:''}
        ${!isDone?`<button class="icon-btn" title="Mark complete" onclick="markGoalDone('${g.id}')" style="color:var(--accent)">&#10003;</button>`:''}
        <button class="icon-btn" title="Edit" onclick="openGoalModal('${g.id}')">&#9998;</button>
        <button class="icon-btn del" title="Delete" onclick="deleteGoal('${g.id}')">&#10005;</button>
      </div>
    </div>
    ${progressSection}
    ${g.notes?`<div style="font-size:11px;color:var(--text3);font-style:italic;margin-top:8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(g.notes)}</div>`:''}
    ${daysInfo?`<div class="gl-deadline"><span class="gl-deadline-label">&#9711; ${g.deadline?new Date(g.deadline).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):''}</span><span class="gl-days-chip ${daysInfo.cls}">${daysInfo.label}</span></div>`:''}
  </div>`;
}
function glSetFilter(c){glFilterCat=c;renderGoals();}
function toggleMilestone(gid,idx){
  const g=goals.find(x=>x.id===gid);if(!g)return;
  const ms=g.milestones||[];if(!ms[idx])return;
  ms[idx].done=!ms[idx].done;
  if(ms.every(m=>m.done))g.status='completed';
  else if(g.status==='completed')g.status='active';
  saveGoals();renderGoals();
  toast(ms[idx].done?`Milestone done: ${ms[idx].label}`:`Reopened: ${ms[idx].label}`);
}
function markGoalDone(gid){
  const g=goals.find(x=>x.id===gid);if(!g)return;
  g.status='completed';
  if(g.type==='amount')g.current=g.target;
  saveGoals();renderGoals();
  toast(`&#127881; Goal completed: ${g.title}`);
}
function deleteGoal(gid){
  const g=goals.find(x=>x.id===gid);if(!g)return;
  if(!confirm(`Delete "${g.title}"?`))return;
  goals=goals.filter(x=>x.id!==gid);
  saveGoals();renderGoals();
  toast('Goal deleted');
}
/* Goal modal */
function glCatChange(){
  const cat=document.getElementById('gl-cat').value;
  const subs=cat==='financial'?GL_FIN_SUBCATS:GL_PER_SUBCATS;
  const cur=document.getElementById('gl-subcat').value;
  document.getElementById('gl-subcat').innerHTML=subs.map(s=>`<option${s===cur?' selected':''}>${s}</option>`).join('');
}
function glTypeChange(){
  const t=document.getElementById('gl-type').value;
  document.getElementById('gl-amount-fields').style.display=t==='amount'?'':'none';
  document.getElementById('gl-milestone-fields').style.display=t==='milestone'?'':'none';
}
function addMsInput(val=''){
  glMsInputs.push({label:val,done:false});
  renderMsInputs();
}
function removeMsInput(i){glMsInputs.splice(i,1);renderMsInputs();}
function renderMsInputs(){
  const cont=document.getElementById('gl-ms-inputs');
  if(!glMsInputs.length){cont.innerHTML='';return;}
  cont.innerHTML=glMsInputs.map((m,i)=>`
    <div style="display:flex;gap:6px;margin-bottom:6px;align-items:center">
      <input type="text" value="${esc(m.label)}" placeholder="Milestone ${i+1}&#8230;" oninput="glMsInputs[${i}].label=this.value"
        style="flex:1;height:34px;border-radius:var(--radius-md);border:0.5px solid var(--border2);background:var(--surface3);color:var(--text);padding:0 10px;font-size:13px;font-family:var(--font);outline:none">
      <button class="icon-btn del" onclick="removeMsInput(${i})" title="Remove">&#10005;</button>
    </div>`).join('');
}
function buildEmojiGrid(selected){
  document.getElementById('gl-emoji-grid').innerHTML=GL_EMOJIS.map(e=>`
    <button type="button" class="gl-emoji-btn${e===selected?' selected':''}" onclick="selectEmoji('${e}')">${e}</button>`).join('');
  glSelectedEmoji=selected||'\uD83C\uDFAF';
}
function selectEmoji(e){
  glSelectedEmoji=e;
  document.querySelectorAll('.gl-emoji-btn').forEach(b=>{
    b.classList.toggle('selected',b.textContent===e);
  });
}
function openGoalModal(gid=null){
  glEditId=gid;
  glMsInputs=[];
  const g=gid?goals.find(x=>x.id===gid):null;
  document.getElementById('goal-modal-title').textContent=gid?'Edit goal':'Add goal';
  document.getElementById('gl-title').value=g?g.title:'';
  document.getElementById('gl-notes').value=g?g.notes||'':'';
  document.getElementById('gl-deadline').value=g?g.deadline||'':'';
  document.getElementById('gl-target').value=g?g.target||'':'';
  document.getElementById('gl-current').value=g?g.current||'':'';
  document.getElementById('gl-cat').value=g?g.category:'financial';
  glCatChange();
  if(g)document.getElementById('gl-subcat').value=g.subcategory||'';
  document.getElementById('gl-type').value=g?g.type||'amount':'amount';
  glTypeChange();
  if(g&&g.type==='milestone'){glMsInputs=(g.milestones||[]).map(m=>({...m}));renderMsInputs();}
  buildEmojiGrid(g?g.emoji:'\uD83C\uDFAF');
  document.getElementById('goal-modal').style.display='flex';
  setTimeout(()=>document.getElementById('gl-title').focus(),60);
}
function closeGoalModal(){document.getElementById('goal-modal').style.display='none';}
function saveGoal(){
  const title=document.getElementById('gl-title').value.trim();
  if(!title){document.getElementById('gl-title').focus();return;}
  const type=document.getElementById('gl-type').value;
  const milestones=type==='milestone'?glMsInputs.filter(m=>(m.label||'').trim()).map(m=>({...m,label:m.label.trim()})):[];
  const existing=glEditId?goals.find(g=>g.id===glEditId):null;
  const obj={
    id:glEditId||String(Date.now()),
    title,
    category:document.getElementById('gl-cat').value,
    subcategory:document.getElementById('gl-subcat').value,
    type,
    target:type==='amount'?parseFloat(document.getElementById('gl-target').value)||0:milestones.length,
    current:type==='amount'?parseFloat(document.getElementById('gl-current').value)||0:milestones.filter(m=>m.done).length,
    milestones,
    deadline:document.getElementById('gl-deadline').value||null,
    notes:document.getElementById('gl-notes').value.trim(),
    emoji:glSelectedEmoji,
    status:existing?existing.status:'active',
    createdAt:existing?existing.createdAt:Date.now(),
  };
  if(glEditId){const idx=goals.findIndex(g=>g.id===glEditId);if(idx>-1)goals[idx]=obj;}
  else goals.unshift(obj);
  saveGoals();closeGoalModal();renderGoals();
  toast(glEditId?`Updated: ${obj.title}`:`Goal added: ${obj.title}`);
}
/* Log progress modal */
function openGoalLogModal(gid){
  glLogId=gid;
  const g=goals.find(x=>x.id===gid);if(!g)return;
  const pct=glProgress(g);
  document.getElementById('goal-log-title').textContent=`Update: ${g.title}`;
  document.getElementById('goal-log-body').innerHTML=`
    <div style="margin-bottom:12px">
      <div class="gl-progress-row" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
        <span style="font-size:13px;color:var(--text2)">Current progress</span>
        <span style="font-family:var(--mono);font-size:13px;font-weight:500;color:var(--accent)">${pct}%</span>
      </div>
      <div class="gl-progress-track"><div class="gl-progress-fill" style="width:${pct}%;background:var(--accent)"></div></div>
      <div style="display:flex;justify-content:space-between;margin-top:5px">
        <span style="font-size:12px;color:var(--accent);font-family:var(--mono)">AED ${fmt(parseFloat(g.current)||0)}</span>
        <span style="font-size:12px;color:var(--text3)">Target: AED ${fmt(parseFloat(g.target)||0)}</span>
      </div>
    </div>
    <div class="field" style="margin-bottom:0">
      <label>New current amount (AED)</label>
      <div class="gl-log-row">
        <input id="gl-log-input" type="number" min="0" step="1" value="${g.current||0}" placeholder="0">
      </div>
      <div style="font-size:11px;color:var(--text3);margin-top:6px">Or add to current: <button class="btn" style="height:24px;font-size:11px;padding:0 8px;margin-left:4px" onclick="glLogAdd(${g.current||0},${g.target||0})">+ Add amount</button></div>
    </div>`;
  document.getElementById('goal-log-modal').style.display='flex';
  setTimeout(()=>document.getElementById('gl-log-input').select(),60);
}
function glLogAdd(cur,tgt){
  const addAmt=parseFloat(prompt('How much to add? (AED)')||'0');
  if(isNaN(addAmt)||addAmt<=0)return;
  const newVal=Math.min(tgt,cur+addAmt);
  document.getElementById('gl-log-input').value=newVal;
}
function closeGoalLogModal(){document.getElementById('goal-log-modal').style.display='none';}
function saveGoalLog(){
  const g=goals.find(x=>x.id===glLogId);if(!g)return;
  const val=parseFloat(document.getElementById('gl-log-input').value)||0;
  g.current=Math.min(val,g.target);
  if(g.current>=g.target)g.status='completed';
  saveGoals();closeGoalLogModal();renderGoals();
  const pct=glProgress(g);
  toast(pct>=100?`&#127881; Goal reached: ${g.title}`:`Progress updated: ${g.title} (${pct}%)`);
}

/* \u2500\u2500 Calendar \u2500\u2500 */
let calYear=new Date().getFullYear(), calMonth=new Date().getMonth(), calSelectedDate=null;
const CAL_MONTH_NAMES=['January','February','March','April','May','June','July','August','September','October','November','December'];
const CAL_SHORT_DAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function calGetEvents(){
  // Returns a map: 'YYYY-MM-DD' -> [{type,name,meta,color,overdue}]
  const now=new Date(); now.setHours(0,0,0,0);
  const map={};
  function addEv(dateStr,ev){
    if(!dateStr)return;
    if(!map[dateStr])map[dateStr]=[];
    map[dateStr].push(ev);
  }

  // Bills: recurring monthly by dueDay (active, non-trial items)
  const ym=`${calYear}-${String(calMonth+1).padStart(2,'0')}`;
  items.filter(i=>i.status==='active'&&!i.isTrial&&i.dueDay).forEach(i=>{
    const day=String(i.dueDay).padStart(2,'0');
    const dateStr=`${ym}-${day}`;
    const paidThisMonth=payments.some(p=>p.itemId===i.id&&p.date.startsWith(ym));
    const dueDate=new Date(calYear,calMonth,i.dueDay);
    const overdue=!paidThisMonth&&dueDate<now;
    addEv(dateStr,{type:'bill',name:i.name,meta:`AED ${fmt(i.amount)} / ${cycleShort(i.cycle)}`,color:i.color||CATCOLORS[i.cat]||'#C98A1A',overdue,paid:paidThisMonth});
  });

  // Tasks with dueDate
  tasks.filter(t=>!t.done&&t.dueDate).forEach(t=>{
    const d=new Date(t.dueDate); d.setHours(0,0,0,0);
    const overdue=d<now;
    // Only show in current month view
    addEv(t.dueDate,{type:'task',name:t.title,meta:t.priority&&t.priority!=='none'?`${t.priority} priority`:'',color:'#9B7FE8',overdue,taskId:t.id});
  });

  // Goals with deadline
  (goals||[]).filter(g=>g.deadline&&g.status!=='completed').forEach(g=>{
    const d=new Date(g.deadline); d.setHours(0,0,0,0);
    const overdue=d<now;
    addEv(g.deadline,{type:'goal',name:g.title,meta:g.subcategory||'',color:'#1faa7e',overdue,goalId:g.id});
  });

  // Tabby instalments
  tabbyItems.forEach(t=>{
    t.instalments.forEach(ins=>{
      if(ins.paid)return;
      const insDate=new Date(ins.date);
      const dateStr=`${insDate.getFullYear()}-${String(insDate.getMonth()+1).padStart(2,'0')}-${String(insDate.getDate()).padStart(2,'0')}`;
      const overdue=insDate<now;
      addEv(dateStr,{type:'bill',name:`${t.name} (Tabby)`,meta:`AED ${fmt(t.total/4)}`,color:'#C98A1A',overdue});
    });
  });

  return map;
}

function renderCalendar(){
  document.getElementById('cal-month-title').textContent=`${CAL_MONTH_NAMES[calMonth]} ${calYear}`;
  const evMap=calGetEvents();
  const today=new Date(); today.setHours(0,0,0,0);
  const todayStr=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  // First day of month, days in month
  const firstDay=new Date(calYear,calMonth,1).getDay(); // 0=Sun
  const daysInMonth=new Date(calYear,calMonth+1,0).getDate();
  const daysInPrev=new Date(calYear,calMonth,0).getDate();

  let cells='';
  let totalCells=Math.ceil((firstDay+daysInMonth)/7)*7;

  for(let i=0;i<totalCells;i++){
    let day,month,year,otherMonth=false;
    if(i<firstDay){
      day=daysInPrev-firstDay+i+1; month=calMonth-1; year=calYear;
      if(month<0){month=11;year--;}
      otherMonth=true;
    } else if(i>=firstDay+daysInMonth){
      day=i-firstDay-daysInMonth+1; month=calMonth+1; year=calYear;
      if(month>11){month=0;year++;}
      otherMonth=true;
    } else {
      day=i-firstDay+1; month=calMonth; year=calYear;
    }
    const dateStr=`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const isToday=dateStr===todayStr;
    const isSelected=dateStr===calSelectedDate;
    const evs=evMap[dateStr]||[];
    const MAX_SHOW=3;
    const shown=evs.slice(0,MAX_SHOW);
    const extra=evs.length-MAX_SHOW;

    const dotsHTML=shown.map(ev=>{
      const isOverdue=ev.overdue;
      const cls=isOverdue?'cal-dot cal-dot-overdue':`cal-dot cal-dot-${ev.type}`;
      const dot=`<span style="width:5px;height:5px;border-radius:50%;background:${isOverdue?'#E05252':ev.color};flex-shrink:0;display:inline-block"></span>`;
      return `<div class="${cls}">${dot}<span style="overflow:hidden;text-overflow:ellipsis">${esc(ev.name)}</span></div>`;
    }).join('');

    cells+=`<div class="cal-cell${isToday?' cal-today':''}${isSelected?' cal-selected':''}${otherMonth?' cal-other-month':''}" onclick="calSelectDay('${dateStr}')">
      <div class="cal-day-num">${day}</div>
      <div class="cal-dots">${dotsHTML}${extra>0?`<div class="cal-more">+${extra} more</div>`:''}</div>
    </div>`;
  }
  document.getElementById('cal-days').innerHTML=cells;

  // Refresh panel if a day is selected
  if(calSelectedDate){
    calRenderPanel(calSelectedDate,evMap);
    document.getElementById('cal-panel').classList.add('open');
  }
}

function calSelectDay(dateStr){
  // Toggle off if same day clicked again
  if(calSelectedDate===dateStr){calClosePanel();return;}
  calSelectedDate=dateStr;
  renderCalendar();
  const evMap=calGetEvents();
  calRenderPanel(dateStr,evMap);
  const panel=document.getElementById('cal-panel');
  panel.classList.add('open');
  // Smooth scroll to panel so it's visible
  setTimeout(()=>panel.scrollIntoView({behavior:'smooth',block:'nearest'}),50);
}
function calClosePanel(){
  calSelectedDate=null;
  document.getElementById('cal-panel').classList.remove('open');
  renderCalendar();
}

function calRenderPanel(dateStr,evMap){
  const [y,m,d]=dateStr.split('-').map(Number);
  const dateObj=new Date(y,m-1,d);
  const dayName=CAL_SHORT_DAYS[dateObj.getDay()];
  const monthName=CAL_MONTH_NAMES[m-1];
  document.getElementById('cal-panel-date').textContent=`${dayName}, ${d} ${monthName} ${y}`;
  const today=new Date(); today.setHours(0,0,0,0);
  const diff=Math.round((dateObj-today)/(1000*60*60*24));
  let sub='';
  if(diff===0)sub='Today';
  else if(diff===1)sub='Tomorrow';
  else if(diff===-1)sub='Yesterday';
  else if(diff>0)sub=`In ${diff} days`;
  else sub=`${Math.abs(diff)} days ago`;
  document.getElementById('cal-panel-sub').textContent=sub;

  const evs=evMap[dateStr]||[];
  if(!evs.length){
    document.getElementById('cal-panel-content').innerHTML=`<div class="cal-panel-empty">&#9711; Nothing scheduled</div>`;
    return;
  }

  const bills=evs.filter(e=>e.type==='bill');
  const taskEvs=evs.filter(e=>e.type==='task');
  const goalEvs=evs.filter(e=>e.type==='goal');

  let html='';
  if(bills.length){
    html+=`<div class="cal-panel-section">&#128176; Bills</div>`;
    bills.forEach(ev=>{
      const cls=ev.paid?'opacity:.5':'';
      html+=`<div class="cal-event-row" style="${cls}" onclick="switchPage('active')">
        <div class="cal-event-dot" style="background:${ev.overdue?'#E05252':ev.color}"></div>
        <div>
          <div class="cal-event-name">${esc(ev.name)}${ev.paid?' <span style="font-size:10px;color:var(--accent)">&#10003; paid</span>':''}</div>
          <div class="cal-event-meta">${esc(ev.meta)}${ev.overdue&&!ev.paid?' \u00B7 <span style="color:var(--red)">Overdue</span>':''}</div>
        </div>
      </div>`;
    });
  }
  if(taskEvs.length){
    html+=`<div class="cal-panel-section">&#9635; Tasks</div>`;
    taskEvs.forEach(ev=>{
      html+=`<div class="cal-event-row" onclick="switchPage('tasks')">
        <div class="cal-event-dot" style="background:${ev.overdue?'#E05252':'#9B7FE8'}"></div>
        <div>
          <div class="cal-event-name">${esc(ev.name)}</div>
          <div class="cal-event-meta">${esc(ev.meta)}${ev.overdue?' \u00B7 <span style="color:var(--red)">Overdue</span>':''}</div>
        </div>
      </div>`;
    });
  }
  if(goalEvs.length){
    html+=`<div class="cal-panel-section">&#9651; Goals</div>`;
    goalEvs.forEach(ev=>{
      html+=`<div class="cal-event-row" onclick="switchPage('goals')">
        <div class="cal-event-dot" style="background:${ev.overdue?'#E05252':'#1faa7e'}"></div>
        <div>
          <div class="cal-event-name">${esc(ev.name)}</div>
          <div class="cal-event-meta">${esc(ev.meta)}${ev.overdue?' \u00B7 <span style="color:var(--red)">Past deadline</span>':''}</div>
        </div>
      </div>`;
    });
  }
  // Wrap in a responsive multi-column grid for the detail rows
  document.getElementById('cal-panel-content').innerHTML=
    `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:6px">${html}</div>`;
}

function calPrev(){
  calMonth--;
  if(calMonth<0){calMonth=11;calYear--;}
  calSelectedDate=null;
  document.getElementById('cal-panel').classList.remove('open');
  renderCalendar();
}
function calNext(){
  calMonth++;
  if(calMonth>11){calMonth=0;calYear++;}
  calSelectedDate=null;
  document.getElementById('cal-panel').classList.remove('open');
  renderCalendar();
}
function calGoToday(){
  const now=new Date();
  calYear=now.getFullYear(); calMonth=now.getMonth();
  calSelectedDate=null;
  document.getElementById('cal-panel').classList.remove('open');
  renderCalendar();
}

/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
   DASHBOARD -- Widget Registry
   To add a new widget: push one object to DB_WIDGETS.
   Shape: { id, cols, render(container) }
   cols: 1, 2, or 3 (grid column span)
   \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */

const DB_WIDGETS = [
  { id:'finances',    cols:2, render: dbWidgetFinances    },
  { id:'alerts',      cols:1, render: dbWidgetAlerts      },
  { id:'tasks',       cols:1, render: dbWidgetTasks       },
  { id:'bills7',      cols:1, render: dbWidgetBills7      },
  { id:'goals',       cols:1, render: dbWidgetGoals       },
  { id:'shopping',    cols:1, render: dbWidgetShopping    },
  { id:'links',       cols:2, render: dbWidgetLinks       },
  { id:'week',        cols:3, render: dbWidgetWeek        },
  { id:'networth',  cols:1, render: dbWidgetNetWorth    },
  { id:'aiinsight', cols:3, render: dbWidgetAIInsight   },
  /* \u2500\u2500 Future widgets plug in here \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
     { id:'budget',   cols:1, render: dbWidgetBudget      },
     { id:'habits',   cols:1, render: dbWidgetHabits      },
     \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
];

function dbGreeting(){
  const h=new Date().getHours();
  const greet=h<12?'Good morning':h<17?'Good afternoon':'Good evening';
  const now=new Date();
  const dateStr=now.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  // Quick summary sentence
  const todayTasks=tasks.filter(t=>!t.done&&t.dueDate===todayStr()).length;
  const active=items.filter(i=>i.status==='active'&&!i.isTrial);
  const overdueB=active.filter(i=>isOverdueCycle(i)).length;
  const overdueTasks=tasks.filter(t=>!t.done&&t.dueDate&&t.dueDate<todayStr()).length;
  let summary='';
  if(overdueB+overdueTasks>0){
    const alertPage=overdueB>=overdueTasks?'active':'tasks';
    const count=overdueB+overdueTasks;
    summary='<button class="db-link" style="color:var(--red);font-size:13px;font-weight:500" onclick="switchPage(\''+alertPage+'\')">'+count+' item'+(count!==1?'s':'')+' need'+(count===1?'s':'')+' attention -></button>';
  } else if(todayTasks>0){
    summary='<button class="db-link" style="color:var(--text2);font-size:13px" onclick="switchPage(\'tasks\')">'+todayTasks+' task'+(todayTasks!==1?'s':'')+' due today -></button>';
  } else {
    summary='<span style="color:var(--positive)">All clear -- nothing urgent.</span>';
  }
  document.getElementById('db-greeting').innerHTML=`
    <div class="db-greeting-time">${greet}</div>
    <div class="db-greeting-date">${dateStr} &nbsp;&middot;&nbsp; ${summary}</div>`;
}

function renderDashboard(){
  dbGreeting();
  const grid=document.getElementById('db-grid');
  grid.innerHTML='';
  DB_WIDGETS.forEach(w=>{
    const div=document.createElement('div');
    div.className=`db-widget db-w${w.cols}`;
    div.id='dbw-'+w.id;
    grid.appendChild(div);
    try{ w.render(div); }catch(e){ div.innerHTML='<div class="db-empty">Widget error</div>'; }
  });
}

/* \u2500\u2500 Helper: build widget shell \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
function dbCard(el,{icon,title,badge,badgeCls,footerLeft,footerLink,footerPage,body,headColor}){
  const badgeHtml=badge!=null?`<span class="db-badge ${badgeCls||'db-badge-muted'}">${badge}</span>`:'';
  const footerHtml=(footerLeft||footerLink)?`
    <div class="db-widget-footer">
      <span>${footerLeft||''}</span>
      ${footerLink?`<button class="db-link" onclick="switchPage('${footerPage||''}')">${footerLink} &rarr;</button>`:''}
    </div>`:'';
  const headBg=headColor?`background:${headColor};border-bottom-color:${headColor.replace(',.08)',', .2)').replace(',.07)',', .18)')}`:''
  // Derive a solid title colour from the headColor by replacing opacity
  const titleCol=headColor?headColor.replace(/,[\s]*[\d.]+\)$/,',1)').replace('rgba','rgba'):''
  const _dbcState = JSON.parse(localStorage.getItem('lifeos_db_collapsed')||'{}'); const isCollapsed = !!_dbcState[el.id];
  if(isCollapsed) el.classList.add('collapsed');
  else el.classList.remove('collapsed');
  el.innerHTML=`
    <div class="db-widget-head" ${headBg?`style="${headBg}"`:''}> 
      <div class="db-widget-title" ${titleCol?`style="color:${titleCol}"`:''}><span class="db-widget-icon">${icon}</span>${title}</div>
      <div style="display:flex;align-items:center;gap:6px">${badgeHtml}<button class="db-widget-collapse-btn" onclick="dbToggleCollapse('${el.id}')" title="Collapse">&#9660;</button></div>
    </div>
    <div class="db-widget-body" id="dbwb-${el.id.replace('dbw-','')}"></div>
    ${footerHtml}`;
}

function dbToggleCollapse(widgetId){
  const el = document.getElementById(widgetId);
  if(!el) return;
  const isNowCollapsed = el.classList.toggle('collapsed');
  const state = JSON.parse(localStorage.getItem('lifeos_db_collapsed')||'{}');
  state[widgetId] = isNowCollapsed ? 1 : 0;
  localStorage.setItem('lifeos_db_collapsed', JSON.stringify(state));
}

/* \u2500\u2500 Widget: Financial snapshot \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
function dbWidgetFinances(el){
  const now=new Date();
  const ym=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0');
  const active=items.filter(i=>i.status==='active'&&!i.isTrial);
  const monthly=active.reduce((s,i)=>s+toMonthly(i.amount,i.cycle),0);
  const paidAmt=payments.filter(p=>inCycle(p.date)).reduce((s,p)=>s+p.amount,0);
  const paidPct=monthly>0?Math.round(paidAmt/monthly*100):0;
  const overdue=active.filter(i=>isOverdueCycle(i)).length;
  const tabbyOwed=tabbyItems.filter(t=>!t.instalments.every(i=>i.paid)).reduce((s,t)=>s+(t.total/4),0);
  const annual=active.reduce((s,i)=>s+toAnnual(i.amount,i.cycle),0);
  const badge=overdue>0?overdue+' overdue':null;
  dbCard(el,{icon:'&#128176;',title:'Finances',badge,badgeCls:'db-badge-red',footerLink:'View bills',footerPage:'active',headColor:'rgba(74,142,204,.08)'});
  document.getElementById('dbwb-finances').innerHTML=`
    <div class="db-kpi-grid">
      <div class="db-kpi green">
        <div class="db-kpi-label">Monthly spend</div>
        <div class="db-kpi-val">AED ${Math.round(monthly).toLocaleString()}</div>
        <div class="db-kpi-sub">${active.length} active subs</div>
      </div>
      <div class="db-kpi">
        <div class="db-kpi-label">Annual projected</div>
        <div class="db-kpi-val">AED ${Math.round(annual).toLocaleString()}</div>
        <div class="db-kpi-sub">at current rate</div>
      </div>
      <div class="db-kpi${overdue>0?' red':''}">
        <div class="db-kpi-label">Paid this month</div>
        <div class="db-kpi-val">AED ${Math.round(paidAmt).toLocaleString()}</div>
        <div class="db-kpi-sub">${paidPct}% of monthly</div>
      </div>
      <div class="db-kpi${tabbyOwed>0?' amber':''}">
        <div class="db-kpi-label">Tabby next cycle</div>
        <div class="db-kpi-val">AED ${Math.round(tabbyOwed).toLocaleString()}</div>
        <div class="db-kpi-sub">${tabbyItems.filter(t=>!t.instalments.every(i=>i.paid)).length} active plans</div>
      </div>
    </div>`;
}

/* \u2500\u2500 Widget: Net Worth \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
function dbWidgetNetWorth(el){
  const assets = accounts.reduce((s,a)=>s+(parseFloat(a.balance)||0),0);
  const liabs  = loans.filter(l=>!l.paidOff).reduce((s,l)=>s+lnRemainingBalance(l),0);
  const net    = assets - liabs;
  // Delta vs last net worth snapshot
  const lastSnap = nwHistory.length ? nwHistory[nwHistory.length-1] : null;
  const delta    = lastSnap != null ? net - lastSnap.net : null;
  const deltaLabel = delta != null
    ? (delta>=0?'+':'')+'\u202FAED\u202F'+Math.round(Math.abs(delta)).toLocaleString()+(delta>=0?' \u25B2':' \u25BC')
    : null;
  const deltaColor = delta == null ? '' : delta>=0 ? 'var(--accent)' : 'var(--red)';
  const deltaDate  = lastSnap
    ? 'vs ' + new Date(lastSnap.ts).toLocaleDateString('en-GB',{day:'numeric',month:'short'})
    : 'no snapshot yet';
  dbCard(el,{
    icon:'&#10038;',
    title:'Net worth',
    footerLink:'View details',
    footerPage:'networth',
  });
  document.getElementById('dbwb-networth').innerHTML=`
    <div style="text-align:center;padding:10px 0 8px">
      <div style="font-size:26px;font-weight:600;font-family:var(--mono);letter-spacing:-.02em;color:${net>=0?'var(--accent)':'var(--red)'}">
        ${net<0?'-':''}AED\u202F${Math.round(Math.abs(net)).toLocaleString()}
      </div>
      ${deltaLabel!=null?`<div style="font-size:12px;font-weight:500;color:${deltaColor};margin-top:3px">${deltaLabel}</div>`:''}
      <div style="font-size:10px;color:var(--text3);margin-top:2px">${deltaDate}</div>
    </div>
    <div class="db-kpi-grid" style="margin-top:4px">
      <div class="db-kpi green">
        <div class="db-kpi-label">Assets</div>
        <div class="db-kpi-val">AED ${Math.round(assets).toLocaleString()}</div>
        <div class="db-kpi-sub">${accounts.length} account${accounts.length!==1?'s':''}</div>
      </div>
      <div class="db-kpi red">
        <div class="db-kpi-label">Liabilities</div>
        <div class="db-kpi-val">AED ${Math.round(liabs).toLocaleString()}</div>
        <div class="db-kpi-sub">${loans.filter(l=>!l.paidOff).length} active loan${loans.filter(l=>!l.paidOff).length!==1?'s':''}</div>
      </div>
    </div>`;
}

/* \u2500\u2500 Widget: Alerts \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
function dbWidgetAlerts(el){
  const now=new Date();
  const ym=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0');
  const active=items.filter(i=>i.status==='active'&&!i.isTrial);
  const overdueBills=active.filter(i=>isOverdueCycle(i));
  const overdueTasks=tasks.filter(t=>!t.done&&t.dueDate&&t.dueDate<todayStr());
  const expiringTrials=items.filter(i=>i.isTrial&&trialDaysLeft(i.trialEnd)!==null&&trialDaysLeft(i.trialEnd)<=5&&trialDaysLeft(i.trialEnd)>=0);
  const overdueGoals=goals.filter(g=>glGoalStatus(g)==='overdue');
  const total=overdueBills.length+overdueTasks.length+expiringTrials.length+overdueGoals.length;
  // Smart footer: pick the page with the most alerts
  let footerLink=null,footerPage='active';
  if(total){
    const counts={active:overdueBills.length+expiringTrials.length,tasks:overdueTasks.length,goals:overdueGoals.length};
    footerPage=Object.entries(counts).sort((a,b)=>b[1]-a[1])[0][0];
    const labels={active:'View bills',tasks:'View tasks',goals:'View goals'};
    footerLink=labels[footerPage];
  }
  dbCard(el,{icon:'&#9888;',title:'Alerts',badge:total||null,badgeCls:'db-badge-red',footerLink,footerPage,headColor:'rgba(224,82,82,.08)'});
  const body=document.getElementById('dbwb-alerts');
  if(!total){body.innerHTML='<div class="db-empty">&#10003; No alerts right now</div>';return;}
  let rows='';
  overdueBills.forEach(i=>{ rows+=`<div class="db-stat-row"><div class="db-stat-left"><div class="db-stat-dot" style="background:var(--red)"></div><div><div class="db-stat-name">${esc(i.name)}</div><div class="db-stat-sub">Bill overdue</div></div></div><div><div class="db-stat-val" style="color:var(--red)">AED ${fmt(i.amount)}</div></div></div>`; });
  overdueTasks.slice(0,3).forEach(t=>{ rows+=`<div class="db-stat-row"><div class="db-stat-left"><div class="db-stat-dot" style="background:var(--purple)"></div><div><div class="db-stat-name">${esc(t.title)}</div><div class="db-stat-sub">Task overdue</div></div></div><div><div class="db-stat-val" style="color:var(--red);font-family:var(--font);font-size:11px">past due</div></div></div>`; });
  expiringTrials.forEach(i=>{ const d=trialDaysLeft(i.trialEnd); rows+=`<div class="db-stat-row"><div class="db-stat-left"><div class="db-stat-dot" style="background:var(--amber)"></div><div><div class="db-stat-name">${esc(i.name)}</div><div class="db-stat-sub">Trial expiring</div></div></div><div><div class="db-stat-val" style="color:var(--amber);font-size:12px">${d===0?'today':d+'d'}</div></div></div>`; });
  overdueGoals.slice(0,2).forEach(g=>{ rows+=`<div class="db-stat-row"><div class="db-stat-left"><div class="db-stat-dot" style="background:var(--accent)"></div><div><div class="db-stat-name">${esc(g.title)}</div><div class="db-stat-sub">Goal past deadline</div></div></div></div>`; });
  body.innerHTML=rows;
}

/* \u2500\u2500 Widget: Tasks due today \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
function dbWidgetShopping(el){
  const header=el.querySelector('.dbw-header');
  if(header)header.textContent='Shopping';
  const body=el.querySelector('.dbw-body');
  if(!body)return;
  const toBuy=shopping.filter(x=>!x.bought);
  const urgent=toBuy.filter(x=>x.priority==='high');
  if(!shopping.length){
    body.innerHTML='<div style="color:var(--text3);font-size:12px;padding:8px 0">No shopping items yet.</div>';
    return;
  }
  const totalVal=toBuy.reduce((s,x)=>s+(x.price||0),0);
  const show=toBuy.slice(0,4);
  let out='<div style="margin-bottom:8px;display:flex;gap:10px">'
    +'<span style="font-size:11px;color:var(--text3)">'+toBuy.length+' to buy'+(totalVal?' \u00B7 AED '+fmt(totalVal):'')+'</span>'
    +(urgent.length?'<span style="font-size:11px;color:var(--red);font-weight:600">'+urgent.length+' urgent</span>':'')
    +'</div>';
  show.forEach(function(s){
    out+='<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:0.5px solid var(--border)">';
    if(s.imageUrl){
      out+='<img src="'+esc(s.imageUrl)+'" style="width:32px;height:32px;border-radius:5px;object-fit:cover;flex-shrink:0" onerror="this.remove()">';
    } else {
      out+='<div style="width:32px;height:32px;border-radius:5px;background:var(--surface2);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:16px">&#128722;</div>';
    }
    out+='<div style="flex:1;min-width:0">'
      +'<div style="font-size:12px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(s.name)+'</div>'
      +(s.price?'<div style="font-size:10px;color:var(--accent);font-family:var(--mono)">AED '+fmt(s.price)+'</div>':'<div style="font-size:10px;color:var(--text3)">'+esc(s.cat||'')+'</div>')
      +'</div>'
      +'</div>';
  });
  if(toBuy.length>4){
    out+='<div style="font-size:11px;color:var(--text3);padding-top:6px;cursor:pointer" onclick="switchPage(&quot;shopping&quot;)">+ '+(toBuy.length-4)+' more -></div>';
  }
  body.innerHTML=out;
}
function dbWidgetTasks(el){
  const today=todayStr();
  const PRI_ORDER={urgent:0,high:1,medium:2,low:3,none:4};
  const PRI_COLOR={urgent:'var(--red)',high:'var(--amber)',medium:'var(--purple)',low:'var(--text3)',none:'var(--text3)'};
  const due=tasks.filter(t=>!t.done&&t.dueDate===today)
    .sort((a,b)=>(PRI_ORDER[a.priority||'none']||4)-(PRI_ORDER[b.priority||'none']||4));
  const overdueTasks=tasks.filter(t=>!t.done&&t.dueDate&&t.dueDate<today)
    .sort((a,b)=>(PRI_ORDER[a.priority||'none']||4)-(PRI_ORDER[b.priority||'none']||4));
  const total=due.length+overdueTasks.length;
  const badge=total||null;
  dbCard(el,{icon:'&#9635;',title:'Tasks today',badge,badgeCls:'db-badge-purple',headColor:'rgba(155,127,232,.08)',
    footerLeft:overdueTasks.length?overdueTasks.length+' overdue':'',footerLink:'All tasks',footerPage:'tasks'});
  const body=document.getElementById('dbwb-tasks');
  if(!total){
    body.innerHTML='<div class="db-empty">&#10003; Nothing due today</div>';
    return;
  }
  function taskRow(t,isOverdue){
    const priColor=PRI_COLOR[t.priority||'none'];
    const priLabel=t.priority&&t.priority!=='none'?`<span style="color:${priColor}">${t.priority}</span>`:'';
    const overduePill=isOverdue?`<span style="color:var(--red)">overdue</span>`:'';
    return `<div class="db-task-row">
      <div class="db-task-check" onclick="dbCheckTask('${t.id}')"></div>
      <div class="db-task-body">
        <div class="db-task-name">${esc(t.title)}</div>
        <div class="db-task-meta">${overduePill}${priLabel}</div>
      </div>
    </div>`;
  }
  let rows='';
  if(overdueTasks.length){
    rows+=`<div style="font-size:10px;font-weight:600;color:var(--red);text-transform:uppercase;letter-spacing:.07em;margin-bottom:4px">&#9650; Overdue</div>`;
    rows+=overdueTasks.slice(0,3).map(t=>taskRow(t,true)).join('');
  }
  if(due.length){
    if(overdueTasks.length) rows+=`<div style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.07em;margin:8px 0 4px">Today</div>`;
    rows+=due.slice(0,5).map(t=>taskRow(t,false)).join('');
  }
  body.innerHTML=rows;
}

function dbCheckTask(id){
  const t=tasks.find(x=>x.id===id);if(!t)return;
  t.done=true;saveTasks();
  toast(`&#10003; Done: ${t.title}`);
  renderDashboard();
}

/* \u2500\u2500 Widget: Bills due in 7 days \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
function dbWidgetBills7(el){
  const now=new Date();
  const ym=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0');
  const today=now.getDate();
  const daysInMonth=new Date(now.getFullYear(),now.getMonth()+1,0).getDate();
  const nextMonthDate=new Date(now.getFullYear(),now.getMonth()+1,1);
  const nextYm=nextMonthDate.getFullYear()+'-'+String(nextMonthDate.getMonth()+1).padStart(2,'0');
  const overflow=Math.max(0,(today+7)-daysInMonth);
  const active=items.filter(i=>i.status==='active'&&!i.isTrial);
  const upcoming=[];
  active.forEach(i=>{
    if(!i.dueDay||isPaidThisCycle(i))return;
    const dueDate=dueDateInCycle(i.dueDay);
    const diff=Math.ceil((dueDate-now)/(1000*60*60*24));
    if(diff>=0&&diff<=7) upcoming.push({item:i,diff,paid:false});
  });
upcoming.sort((a,b)=>a.diff-b.diff);
  const total=upcoming.reduce((s,u)=>s+u.item.amount,0);
  dbCard(el,{icon:'&#9711;',title:'Bills this week',badge:upcoming.length||null,badgeCls:'db-badge-amber',headColor:'rgba(201,138,26,.08)',
    footerLeft:upcoming.length?'AED '+fmt(total)+' due':'',footerLink:'View all',footerPage:'active'});
  const body=document.getElementById('dbwb-bills7');
  if(!upcoming.length){body.innerHTML='<div class="db-empty">&#10003; No bills due in 7 days</div>';return;}
  body.innerHTML=upcoming.slice(0,5).map(({item:i,diff})=>{
    const color=i.color||CATCOLORS[i.cat]||'#888';
    const dayLabel=diff===0?'Today':diff===1?'Tomorrow':'In '+diff+'d';
    return `<div class="db-stat-row">
      <div class="db-stat-left">
        <div class="db-stat-dot" style="background:${color}"></div>
        <div>
          <div class="db-stat-name">${esc(i.name)}</div>
          <div class="db-stat-sub">${dayLabel} &middot; ${i.cat}</div>
        </div>
      </div>
      <div>
        <div class="db-stat-val">AED ${fmt(i.amount)}</div>
        <div class="db-stat-val-sub">${cycleShort(i.cycle)}</div>
      </div>
    </div>`;
  }).join('');
}

/* \u2500\u2500 Widget: Goals progress \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
function dbWidgetGoals(el){
  const active=goals.filter(g=>glGoalStatus(g)==='active');
  const completed=goals.filter(g=>glGoalStatus(g)==='completed').length;
  dbCard(el,{icon:'&#9651;',title:'Goals',badge:active.length||null,badgeCls:'db-badge-green',headColor:'rgba(31,170,126,.08)',
    footerLeft:completed+' completed',footerLink:'All goals',footerPage:'goals'});
  const body=document.getElementById('dbwb-goals');
  if(!goals.length){body.innerHTML='<div class="db-empty">No goals yet</div>';return;}
  const show=active.slice(0,4);
  body.innerHTML=show.map(g=>{
    const pct=glProgress(g);
    const color=g.category==='financial'?'var(--accent)':'var(--purple)';
    const dInfo=glDaysLabel(g.deadline,glGoalStatus(g));
    return `<div class="db-prog-wrap">
      <div class="db-prog-row">
        <div class="db-prog-name">${esc(g.emoji||'\uD83C\uDFAF')} ${esc(g.title)}</div>
        <div class="db-prog-pct">${pct}%${dInfo?` &middot; <span class="${dInfo.cls}" style="font-size:10px">${dInfo.label}</span>`:''}</div>
      </div>
      <div class="db-prog-track"><div class="db-prog-fill" style="width:${pct}%;background:${color}"></div></div>
    </div>`;
  }).join('');
}

/* \u2500\u2500 Widget: 14-day strip \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
function dbWidgetWeek(el){
  dbCard(el,{icon:'&#9744;',title:'Next 14 days',footerLink:'Calendar',footerPage:'calendar',headColor:'rgba(74,142,204,.07)'});
  const body=document.getElementById('dbwb-week');
  const now=new Date(); now.setHours(0,0,0,0);
  const ym=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0');
  const DAY_NAMES=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const days=[];
  for(let i=0;i<14;i++){
    const d=new Date(now); d.setDate(now.getDate()+i);
    const ds=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
    days.push({d,ds,name:DAY_NAMES[d.getDay()],num:d.getDate()});
  }
  // Collect events per day
  const active=items.filter(i=>i.status==='active'&&!i.isTrial);
  function eventsForDay(ds,d){
    const evs=[];
    // Bills
    active.filter(i=>i.dueDay===d.getDate()&&!isPaidThisCycle(i)).forEach(i=>{
      const isOver=i.dueDay<now.getDate()&&d.getMonth()===now.getMonth();
      evs.push({label:i.name,cls:isOver?'db-day-ev-over':'db-day-ev-bill'});
    });
    // Tasks
    tasks.filter(t=>!t.done&&t.dueDate===ds).forEach(t=>{
      evs.push({label:t.title,cls:t.dueDate<todayStr()?'db-day-ev-over':'db-day-ev-task'});
    });
    // Goals
    goals.filter(g=>g.deadline===ds&&g.status!=='completed').forEach(g=>{
      evs.push({label:g.title,cls:'db-day-ev-goal'});
    });
    return evs;
  }
  // Build two rows of 7 with a subtle week label between them
  function renderDay({d,ds,name,num}){
    const isToday=ds===todayStr();
    const evs=eventsForDay(ds,d);
    const shown=evs.slice(0,3);
    const extra=evs.length-shown.length;
    return `<div class="db-day${isToday?' db-day-today':''}" onclick="switchPage('calendar')">
      <div class="db-day-name">${name}</div>
      <div class="db-day-num">${num}</div>
      <div class="db-day-dots">
        ${shown.map(e=>`<div class="db-day-ev ${e.cls}">${esc(e.label)}</div>`).join('')}
        ${extra>0?`<div style="font-size:9px;color:var(--text3)">+${extra}</div>`:''}
      </div>
    </div>`;
  }
  const week1=days.slice(0,7).map(renderDay).join('');
  const week2=days.slice(7,14).map(renderDay).join('');
  body.innerHTML=`
    <div style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:5px">This week</div>
    <div class="db-week">${week1}</div>
    <div style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.07em;margin:10px 0 5px">Next week</div>
    <div class="db-week">${week2}</div>`;
}


/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
   Auto-save -- File System Access API
   Works in Chrome/Edge from any origin (local file,
   GitHub Pages, localhost).
   - asSetup()      : open Save dialog, pick file location
   - asAutoSave()   : debounced write on every data change
   - asRestoreStatus: show last-save info on page load
   \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */
const AS_FILE_KEY  = 'lifeos_as_filename';
const AS_SYNC_KEY  = 'lifeos_as_last_save';
let _asFileHandle  = null;  // FileSystemFileHandle
let _asAutoTimer   = null;
let _asBusy        = false;

/* \u2500\u2500 UI helpers \u2500\u2500 */
function asDot(state){ const d=document.getElementById('as-dot'); if(d) d.className='as-dot'+(state?' '+state:''); }
function asTxt(t)    { const e=document.getElementById('as-status-text'); if(e) e.textContent=t; }
function asStatus(state,txt){ asDot(state); asTxt(txt); }

/* \u2500\u2500 Check browser support \u2500\u2500 */
function asSupported(){ return typeof window.showSaveFilePicker==='function'; }

/* \u2500\u2500 Setup: let user pick save location \u2500\u2500 */
async function asSetup(){
  if(!asSupported()){
    toast('Auto-save requires Chrome or Edge -- not supported in this browser');
    return;
  }
  try{
    _asFileHandle = await window.showSaveFilePicker({
      suggestedName: 'lifeos-backup.json',
      types:[{description:'JSON backup',accept:{'application/json':['.json']}}],
    });
    const name = _asFileHandle.name;
    localStorage.setItem(AS_FILE_KEY, name);
    document.getElementById('as-file-name').textContent = name;
    document.getElementById('as-file-row').style.display = 'block';
    asStatus('ok','Ready -- '+name);
    // Immediately write current data to the chosen file
    await asWriteFile();
    toast('\u2714 Auto-save set up -- '+name);
  } catch(e){
    if(e.name==='AbortError') return; // user cancelled -- fine
    asStatus('err','Setup failed');
    console.error('AS setup:',e);
  }
}

/* \u2500\u2500 Write data to the file handle \u2500\u2500 */
async function asWriteFile(){
  if(!_asFileHandle) return;
  if(_asBusy) return;
  _asBusy = true;
  asDot('busy');
  try{
    const payload = JSON.stringify(
      {items,payments,tabbyItems,tasks,taskHistory,shopping,shCollections,links,linkGroups,lists,workspaces,goals,notes,loans,receivables,accounts,nwHistory,dbLayout:JSON.parse(localStorage.getItem(DB_LAYOUT_KEY)||'[]'),dbCollapsed:JSON.parse(localStorage.getItem('lifeos_db_collapsed')||'{}'),navLayout:JSON.parse(localStorage.getItem(NAV_LAYOUT_KEY)||'[]'),cycleStart:parseInt(localStorage.getItem(CYCLE_KEY)||'1'),proxyUrl:localStorage.getItem(AI_PROXY_STORE)||'',savedAt:new Date().toISOString()},
      null, 2
    );
    const writable = await _asFileHandle.createWritable();
    await writable.write(payload);
    await writable.close();
    const now = new Date();
    localStorage.setItem(AS_SYNC_KEY, now.toISOString());
    verSnapshot(); // save a versioned snapshot on every successful write
    const timeStr = now.toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'});
    asStatus('ok','\u2714 Saved '+timeStr);
  } catch(e){
    // Permission may have expired -- prompt user to re-grant
    if(e.name==='NotAllowedError'){
      try{
        const perm = await _asFileHandle.requestPermission({mode:'readwrite'});
        if(perm==='granted'){ await asWriteFile(); return; }
      } catch(e2){}
    }
    asStatus('err','Save failed -- click Choose file');
    console.error('AS write:',e);
  }
  _asBusy = false;
}

/* \u2500\u2500 Debounced auto-save triggered by data changes \u2500\u2500 */
function asAutoSave(){
  if(!_asFileHandle) return; // not set up yet
  clearTimeout(_asAutoTimer);
  _asAutoTimer = setTimeout(asWriteFile, 2000);
}

/* \u2500\u2500 Restore status text on page load \u2500\u2500 */
function asRestoreStatus(){
  const last = localStorage.getItem(AS_SYNC_KEY);
  const name = localStorage.getItem(AS_FILE_KEY);
  if(name){
    document.getElementById('as-file-name').textContent = name;
    document.getElementById('as-file-row').style.display = 'block';
  }
  if(last){
    const d = new Date(last);
    const str = d.toLocaleDateString('en-GB',{day:'numeric',month:'short'})
              + ' ' + d.toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'});
    asStatus('ok','\u2714 Last saved '+str);
    asTxt('Last: '+str+(name?' -- '+name:''));
  } else if(name){
    asStatus('','Click \u201CChoose save file\u201D to reconnect');
  }
  // Note: file handle does NOT persist across page loads in the browser.
  // User needs to click "Choose save file" once per session to reconnect.
  // This is a browser security requirement -- we can't store the handle.
  // Sync settings modal status indicators
  const sDot = document.getElementById('settings-as-dot');
  const sTxt = document.getElementById('settings-as-status-text');
  const srcDot = document.getElementById('as-dot');
  const srcTxt = document.getElementById('as-status-text');
  if(sDot&&srcDot) sDot.className = srcDot.className;
  if(sTxt&&srcTxt) sTxt.textContent = srcTxt.textContent;
}

/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
   Quick Notes
   \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */
function qnFmtDate(ts){
  const d=new Date(ts), now=new Date();
  const diff=now-d;
  if(diff<60000) return 'Just now';
  if(diff<3600000) return Math.floor(diff/60000)+'m ago';
  if(diff<86400000) return Math.floor(diff/3600000)+'h ago';
  if(diff<604800000) return Math.floor(diff/86400000)+'d ago';
  return d.toLocaleDateString('en-GB',{day:'numeric',month:'short'});
}

function renderNotes(){
  const q=(document.getElementById('qn-search')||{}).value?.toLowerCase()||'';
  const sort=(document.getElementById('qn-sort')||{}).value||'updated';
  // Build tag list
  const allTags=[...new Set(notes.flatMap(n=>n.tags||[]))].sort();
  const tagBar=document.getElementById('qn-tag-bar');
  if(tagBar){
    tagBar.innerHTML=['all',...allTags].map(t=>`<button class="pill${qnFilterTag===t?' active':''}" onclick="qnSetTag('${esc(t)}')">${t==='all'?'All':esc(t)}</button>`).join('');
  }
  // Filter
  let filtered=notes.filter(n=>{
    const matchQ=!q||(n.title||'').toLowerCase().includes(q)||(n.body||'').toLowerCase().includes(q)||(n.tags||[]).some(t=>t.toLowerCase().includes(q));
    const matchT=qnFilterTag==='all'||(n.tags||[]).includes(qnFilterTag);
    return matchQ&&matchT;
  });
  // Sort
  if(sort==='updated') filtered.sort((a,b)=>(b.updatedAt||b.createdAt)-(a.updatedAt||a.createdAt));
  else if(sort==='created') filtered.sort((a,b)=>b.createdAt-a.createdAt);
  else filtered.sort((a,b)=>(a.title||'').localeCompare(b.title||''));

  const sub=document.getElementById('qn-sub');
  if(sub) sub.textContent=notes.length+' note'+(notes.length!==1?'s':'')+(qnFilterTag!=='all'?' \u00B7 '+qnFilterTag:'');

  const grid=document.getElementById('qn-grid');
  if(!filtered.length){
    grid.innerHTML='<div class="qn-empty"><div style="font-size:32px;margin-bottom:10px;opacity:.4">&#9998;</div><div style="font-size:15px;font-weight:500;color:var(--text2);margin-bottom:6px">'+(notes.length?'No notes match':'No notes yet')+'</div><div style="font-size:13px">Click + New note to start</div></div>';
    return;
  }
  grid.innerHTML='<div class="qn-grid">'+filtered.map(n=>qnCardHTML(n)).join('')+'</div>';
}

function qnCardHTML(n){
  const color=n.color&&n.color!=='none'?n.color:null;
  const colorBar=color?`<div class="qn-color-bar" style="background:${color}"></div>`:'';
  const tagsHTML=(n.tags||[]).map(t=>`<span class="qn-tag" style="${color?'background:'+color+'22;color:'+color:'background:var(--surface3);color:var(--text2)'}" onclick="qnSetTag('${esc(t)}');event.stopPropagation()">${esc(t)}</span>`).join('');
  return `<div class="qn-card" onclick="openNoteModal('${n.id}')">
    ${colorBar}
    <div class="qn-card-header">
      <div class="qn-title">${esc(n.title||'')}</div>
      <div class="qn-actions">
        <button class="icon-btn del" onclick="deleteNote('${n.id}');event.stopPropagation()" title="Delete">&#10005;</button>
      </div>
    </div>
    ${n.body?`<div class="qn-body">${esc(n.body)}</div>`:''}
    <div class="qn-footer">
      <div class="qn-tags">${tagsHTML}</div>
      <div class="qn-date">${qnFmtDate(n.updatedAt||n.createdAt)}</div>
    </div>
  </div>`;
}

function qnSetTag(t){qnFilterTag=t;renderNotes();}

function deleteNote(id){
  notes=notes.filter(n=>n.id!==id);
  saveNotes();renderNotes();
  toast('Note deleted');
}

/* \u2500\u2500 Modal \u2500\u2500 */
function openNoteModal(id){
  qnEditId=id||null;
  qnModalTags=[];
  const n=id?notes.find(x=>x.id===id):null;
  document.getElementById('qn-modal-title').value=n?n.title||'':'';
  document.getElementById('qn-modal-body').value=n?n.body||'':'';
  qnModalTags=n?(n.tags||[]).slice():[];
  qnSelectedColor=n?n.color||'none':'none';
  qnBuildColorPicker();
  qnRenderModalTags();
  document.getElementById('note-modal').style.display='flex';
  setTimeout(()=>{
    const el=document.getElementById(n?'qn-modal-body':'qn-modal-title');
    el.focus();
    if(el.tagName==='TEXTAREA') el.setSelectionRange(el.value.length,el.value.length);
  },60);
}

function closeNoteModal(){
  document.getElementById('note-modal').style.display='none';
  qnEditId=null;
}

function qnBuildColorPicker(){
  document.getElementById('qn-color-picker').innerHTML=QN_COLORS.map(c=>`
    <div class="qn-color-swatch${qnSelectedColor===c?' selected':''}"
      style="background:${c==='none'?'var(--surface3)':c};border-color:${qnSelectedColor===c?'var(--text)':'transparent'}"
      onclick="qnPickColor('${c}')" title="${QN_COLOR_LABELS[c]||c}">
      ${c==='none'?'<span style="font-size:10px;color:var(--text3)">&#9711;</span>':''}
    </div>`).join('');
  const preview=document.getElementById('qn-modal-color-preview');
  if(preview) preview.style.background=qnSelectedColor==='none'?'var(--surface3)':qnSelectedColor;
}

function qnPickColor(c){
  qnSelectedColor=c;
  qnBuildColorPicker();
}

function qnRenderModalTags(){
  const wrap=document.getElementById('qn-modal-tags-wrap');
  const inp=document.getElementById('qn-tag-input');
  // Remove old tag pills, keep the input
  wrap.querySelectorAll('.qn-modal-tag').forEach(el=>el.remove());
  qnModalTags.forEach((t,i)=>{
    const pill=document.createElement('span');
    pill.className='qn-modal-tag';
    pill.style.cssText='background:var(--surface3);color:var(--text2)';
    pill.innerHTML=esc(t)+' <span style="opacity:.6">&times;</span>';
    pill.onclick=()=>{qnModalTags.splice(i,1);qnRenderModalTags();};
    wrap.insertBefore(pill,inp);
  });
}

function qnAddTag(){
  const inp=document.getElementById('qn-tag-input');
  const val=(inp.value||'').trim().toLowerCase().replace(/[^a-z0-9\-_]/g,'');
  if(!val||qnModalTags.includes(val))return;
  qnModalTags.push(val);
  qnRenderModalTags();
  inp.value='';
}

function saveNote(){
  const title=document.getElementById('qn-modal-title').value.trim();
  const body=document.getElementById('qn-modal-body').value.trim();
  if(!title&&!body){closeNoteModal();return;}
  const now=Date.now();
  const existing=qnEditId?notes.find(n=>n.id===qnEditId):null;
  const obj={
    id:qnEditId||String(now),
    title,body,
    tags:qnModalTags.slice(),
    color:qnSelectedColor,
    createdAt:existing?existing.createdAt:now,
    updatedAt:now,
  };
  if(qnEditId){const idx=notes.findIndex(n=>n.id===qnEditId);if(idx>-1)notes[idx]=obj;}
  else notes.unshift(obj);
  saveNotes();closeNoteModal();renderNotes();
  toast(qnEditId?'Note updated':'Note saved');
}

/* \u2500\u2500 Tag input keydown \u2500\u2500 */
document.addEventListener('DOMContentLoaded',function(){
  const inp=document.getElementById('qn-tag-input');
  if(inp){
    inp.addEventListener('keydown',function(e){
      if(e.key==='Enter'||e.key===','){e.preventDefault();qnAddTag();}
      if(e.key==='Backspace'&&!this.value&&qnModalTags.length){
        qnModalTags.pop();qnRenderModalTags();
      }
    });
  }
});

/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
   Loans & EMI Tracker
   \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */

/* \u2500\u2500 EMI formula: M = P * r * (1+r)^n / ((1+r)^n - 1) \u2500\u2500 */
function lnCalcMonthlyEMI(principal, annualRate, tenureMonths){
  if(!principal||!tenureMonths) return 0;
  if(!annualRate) return principal/tenureMonths;
  const r = annualRate / 100 / 12;
  return principal * r * Math.pow(1+r, tenureMonths) / (Math.pow(1+r, tenureMonths) - 1);
}

function lnRemainingBalance(loan){
  const emi = loan.emiOverride || lnCalcMonthlyEMI(loan.principal, loan.rate, loan.tenure);
  const paid = parseFloat(loan.amountPaid) || 0;
  // Remaining = principal - (paid - interest accrued so far)
  // Simplified: remaining = max(0, total payable - amount paid)
  const totalPayable = emi * loan.tenure;
  return Math.max(0, totalPayable - paid);
}

function lnMonthsRemaining(loan){
  const emi = loan.emiOverride || lnCalcMonthlyEMI(loan.principal, loan.rate, loan.tenure);
  if(!emi) return 0;
  const remaining = lnRemainingBalance(loan);
  return Math.ceil(remaining / emi);
}

function lnNextPaymentDate(loan){
  // Returns the next EMI due date (approx monthly from now)
  if(!loan || loan.paidOff) return null;
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth(), loan.startDay||1);
  if(next <= now) next.setMonth(next.getMonth()+1);
  return next;
}

function lnPayoffDate(loan){
  const months = lnMonthsRemaining(loan);
  if(months <= 0) return null;
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d;
}

function lnProgressPct(loan){
  const emi = loan.emiOverride || lnCalcMonthlyEMI(loan.principal, loan.rate, loan.tenure);
  const total = emi * loan.tenure;
  if(!total) return 0;
  return Math.min(100, Math.round(((parseFloat(loan.amountPaid)||0) / total) * 100));
}

/* \u2500\u2500 Render \u2500\u2500 */
function renderLoans(){
  const totalEMI = loans.filter(l=>!l.paidOff).reduce((s,l)=>{
    return s + (l.emiOverride || lnCalcMonthlyEMI(l.principal, l.rate, l.tenure));
  },0);
  const totalRemaining = loans.filter(l=>!l.paidOff).reduce((s,l)=>s+lnRemainingBalance(l),0);
  const totalPrincipal = loans.reduce((s,l)=>s+(parseFloat(l.principal)||0),0);
  const paidOff = loans.filter(l=>l.paidOff).length;

  document.getElementById('emi-sub').textContent = loans.length + ' loan' + (loans.length!==1?'s':'') + (paidOff?' \u00B7 '+paidOff+' paid off':'');

  document.getElementById('emi-metrics').innerHTML = `
    <div class="metric red"><div class="metric-label">Monthly EMI burden</div><div class="metric-value">AED ${fmt(totalEMI)}</div><div class="metric-sub">${loans.filter(l=>!l.paidOff).length} active loan${loans.filter(l=>!l.paidOff).length!==1?'s':''}</div></div>
    <div class="metric"><div class="metric-label">Total remaining</div><div class="metric-value">AED ${fmt(totalRemaining)}</div><div class="metric-sub">across all loans</div></div>
    <div class="metric"><div class="metric-label">Original principal</div><div class="metric-value">AED ${fmt(totalPrincipal)}</div><div class="metric-sub">${loans.length} loan${loans.length!==1?'s':''} total</div></div>
    ${paidOff>0?`<div class="metric green"><div class="metric-label">Paid off</div><div class="metric-value">${paidOff}</div><div class="metric-sub">completed</div></div>`:''}
  `;

  const cont = document.getElementById('emi-list');
  if(!loans.length){
    cont.innerHTML = '<div class="emi-empty"><div style="font-size:32px;margin-bottom:10px;opacity:.4">&#127968;</div><div style="font-size:15px;font-weight:500;color:var(--text2);margin-bottom:6px">No loans added yet</div><div style="font-size:13px">Add your first loan to track EMI and payoff progress</div></div>';
    return;
  }
  const sortBy   = (document.getElementById('ln-sort')||{}).value || 'urgency';
  const filterBy = (document.getElementById('ln-filter')||{}).value || 'all';

  // Filter
  let visible = loans.filter(l=>{
    if(filterBy==='active')   return !l.paidOff;
    if(filterBy==='paidoff')  return l.paidOff;
    if(['personal','car','mortgage','education','business','friendly','other'].includes(filterBy))
      return l.type===filterBy;
    return true;
  });

  // Sort -- urgency = closest payoff date first
  visible = visible.slice().sort((a,b)=>{
    if(a.paidOff !== b.paidOff) return a.paidOff?1:-1;
    if(sortBy==='balance')  return lnRemainingBalance(b)-lnRemainingBalance(a);
    if(sortBy==='urgency'){
      const ma=lnMonthsRemaining(a)||9999, mb=lnMonthsRemaining(b)||9999;
      return ma-mb;
    }
    if(sortBy==='emi'){
      const ea=a.emiOverride||lnCalcMonthlyEMI(a.principal,a.rate,a.tenure);
      const eb=b.emiOverride||lnCalcMonthlyEMI(b.principal,b.rate,b.tenure);
      return eb-ea;
    }
    if(sortBy==='name') return (a.name||'').localeCompare(b.name||'');
    if(sortBy==='added') return (b.createdAt||0)-(a.createdAt||0);
    return 0;
  });

  // Upcoming EMI strip -- next 30 days
  const upcomingEl = document.getElementById('emi-upcoming');
  if(upcomingEl){
    const upcomingEMI = visible.filter(l=>!l.paidOff).map(l=>{
      const payDate = lnNextPaymentDate(l);
      if(!payDate) return null;
      const diff = Math.ceil((payDate - new Date())/(1000*60*60*24));
      if(diff < 0 || diff > 30) return null;
      const emi = Math.round(l.emiOverride || lnCalcMonthlyEMI(l.principal, l.rate, l.tenure));
      return {l, diff, emi};
    }).filter(Boolean).sort((a,b)=>a.diff-b.diff);

    if(upcomingEMI.length){
      upcomingEl.innerHTML = '<div style="margin-bottom:8px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text3)">Upcoming -- next 30 days</div>'
        + '<div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:6px">'
        + upcomingEMI.map(({l,diff,emi})=>{
            const c = LN_COLORS[l.type]||'#888';
            return '<div style="flex-shrink:0;background:var(--surface2);border:0.5px solid var(--border);border-radius:9px;padding:9px 13px;min-width:140px;border-left:3px solid '+c+'">'
              +'<div style="font-size:12px;font-weight:600;color:var(--text);margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px">'+esc(l.name)+'</div>'
              +'<div style="font-size:11px;color:var(--text3);margin-bottom:5px">'+(diff===0?'Due today':diff===1?'Tomorrow':'In '+diff+'d')+'</div>'
              +'<div style="font-size:14px;font-weight:600;font-family:var(--mono);color:'+c+'">AED '+fmt(emi)+'</div>'
              +'</div>';
          }).join('')
        +'</div>';
    } else {
      upcomingEl.innerHTML = '';
    }
  }

  cont.innerHTML = visible.length
    ? '<div class="emi-grid">' + visible.map(l=>lnCardHTML(l)).join('') + '</div>'
    : '<div class="emi-empty" style="padding:2rem">No loans match this filter.</div>';
}

function lnCardHTML(l){
  const emi = l.emiOverride || lnCalcMonthlyEMI(l.principal, l.rate, l.tenure);
  const totalPayable = emi * l.tenure;
  const totalInterest = totalPayable - (parseFloat(l.principal)||0);
  const remaining = lnRemainingBalance(l);
  const pct = lnProgressPct(l);
  const color = LN_COLORS[l.type] || '#888';
  const payoffDate = lnPayoffDate(l);
  const monthsLeft = lnMonthsRemaining(l);
  const isPaidOff = l.paidOff || remaining <= 0;

  const isFriendly = l.type === 'friendly';

  let payoffChip = '';
  if(isPaidOff){
    payoffChip = '<span class="emi-payoff-chip emi-payoff-done">Paid off</span>';
  } else if(payoffDate){
    const mo = payoffDate.toLocaleDateString('en-GB',{month:'short',year:'numeric'});
    const chipCls = monthsLeft <= 12 ? 'emi-payoff-warn' : 'emi-payoff-ok';
    payoffChip = `<span class="emi-payoff-chip ${chipCls}">${mo}</span>`;
  }

  return `<div class="emi-card${isPaidOff?' emi-paid-off':''}" id="loan-${l.id}">
    <div class="emi-card-stripe" style="background:${color}"></div>
    <div class="emi-card-head">
      <div>
        <div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap">
          <div class="emi-card-title">${esc(l.name)}</div>
          ${l.type?`<span class="emi-card-sub">${l.type.charAt(0).toUpperCase()+l.type.slice(1)}</span>`:''}
        </div>
        ${l.lender?`<div class="emi-card-lender" style="color:${color};filter:brightness(1.35) saturate(1.1)"><div class="emi-card-lender-dot" style="background:${color};filter:brightness(1.35)"></div>${esc(l.lender)}</div>`:``}
      </div>
      <div class="emi-actions">
        ${!isPaidOff?`<button class="icon-btn pay" onclick="markLoanPaidOff('${l.id}')" title="Mark paid off">&#10003;</button>`:''}
        <button class="icon-btn" onclick="openLoanModal('${l.id}')" title="Edit">&#9998;</button>
        <button class="icon-btn del" onclick="deleteLoan('${l.id}')" title="Delete">&#10005;</button>
      </div>
    </div>
    ${isFriendly ? `
    <div class="emi-kpis">
      <div class="emi-kpi" style="grid-column:span 2">
        <div class="emi-kpi-label">Amount owed</div>
        <div class="emi-kpi-val red">AED ${fmt(parseFloat(l.principal)||0)}</div>
        <div class="emi-kpi-sub">0% interest \u00B7 no EMI</div>
      </div>
      <div class="emi-kpi" style="grid-column:span 2">
        <div class="emi-kpi-label">${l.dueDate?'Repay by':'Status'}</div>
        <div class="emi-kpi-val" style="${l.dueDate&&new Date(l.dueDate)<new Date()?'color:var(--red)':''}">
          ${l.dueDate?new Date(l.dueDate).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'Flexible'}
        </div>
        <div class="emi-kpi-sub">${l.lender?'Owed to '+esc(l.lender):''}</div>
      </div>
    </div>` : `
    <div class="emi-kpis">
      <div class="emi-kpi">
        <div class="emi-kpi-label">Monthly EMI</div>
        <div class="emi-kpi-val red">AED ${fmt(emi)}</div>
        <div class="emi-kpi-sub">${l.tenure} month${l.tenure!==1?'s':''} total</div>
      </div>
      <div class="emi-kpi">
        <div class="emi-kpi-label">Remaining</div>
        <div class="emi-kpi-val${remaining<(parseFloat(l.principal)||0)*0.2?' green':''}" >AED ${fmt(remaining)}</div>
        <div class="emi-kpi-sub">${monthsLeft} month${monthsLeft!==1?'s':''} left</div>
      </div>
      <div class="emi-kpi">
        <div class="emi-kpi-label">Principal</div>
        <div class="emi-kpi-val">AED ${fmt(parseFloat(l.principal)||0)}</div>
        <div class="emi-kpi-sub">${l.rate?l.rate+'% p.a.':'0% interest'}</div>
      </div>
      <div class="emi-kpi">
        <div class="emi-kpi-label">Total interest</div>
        <div class="emi-kpi-val amber">AED ${fmt(Math.max(0,totalInterest))}</div>
        <div class="emi-kpi-sub">AED ${fmt(totalPayable)} payable</div>
      </div>
    </div>`}
    <div class="emi-prog-label">
      <span class="emi-prog-name">Repaid</span>
      <span class="emi-prog-pct">${pct}%</span>
    </div>
    <div class="emi-prog-track"><div class="emi-prog-fill" style="width:${pct}%;background:${color}"></div></div>
    <div class="emi-footer">
      <span>${l.notes?esc(l.notes.substring(0,40))+(l.notes.length>40?'\u2026':''):''}</span>
      ${payoffChip}
    </div>
  </div>`;
}

/* \u2500\u2500 Modal \u2500\u2500 */
function lnTypeChange(){
  const type = document.getElementById('ln-type').value;
  const isFriendly = type === 'friendly';
  const rateField    = document.getElementById('ln-rate-field');
  const tenureRow    = document.getElementById('ln-tenure-row');
  const dueDateRow   = document.getElementById('ln-duedate-row');
  const preview      = document.getElementById('ln-preview');
  const emiOverride  = document.getElementById('ln-emi-override');
  if(rateField)  rateField.style.display  = isFriendly ? 'none' : '';
  if(tenureRow)  tenureRow.style.display  = isFriendly ? 'none' : '';
  if(dueDateRow) dueDateRow.style.display = isFriendly ? '' : 'none';
  if(isFriendly && preview) preview.style.display = 'none';
  if(!isFriendly) lnCalcEMI();
}

function lnCalcEMI(){
  const p = parseFloat(document.getElementById('ln-principal').value)||0;
  const r = parseFloat(document.getElementById('ln-rate').value)||0;
  const t = parseInt(document.getElementById('ln-tenure').value)||0;
  const prev = document.getElementById('ln-preview');
  if(!p||!t){prev.style.display='none';return;}
  const emi = lnCalcMonthlyEMI(p,r,t);
  const total = emi*t;
  const interest = total-p;
  document.getElementById('ln-prev-emi').textContent = 'AED '+fmt(emi);
  document.getElementById('ln-prev-int').textContent = 'AED '+fmt(Math.max(0,interest));
  document.getElementById('ln-prev-tot').textContent = 'AED '+fmt(total);
  prev.style.display='block';
}

function openLoanModal(id){
  lnEditId = id||null;
  const l = id?loans.find(x=>x.id===id):null;
  document.getElementById('loan-modal-title').textContent = id?'Edit loan':'Add loan';
  document.getElementById('ln-name').value = l?l.name:'';
  document.getElementById('ln-type').value = l?l.type||'personal':'personal';
  document.getElementById('ln-lender').value = l?l.lender||'':'';
  document.getElementById('ln-principal').value = l?l.principal||'':'';
  document.getElementById('ln-rate').value = l?l.rate||'':'';
  document.getElementById('ln-tenure').value = l?l.tenure||'':'';
  document.getElementById('ln-start').value = l?l.startDate||'':'';
  document.getElementById('ln-start-friendly').value = l?l.startDate||'':'';
  document.getElementById('ln-duedate').value = l?l.dueDate||'':'';
  document.getElementById('ln-emi-override').value = l?l.emiOverride||'':'';
  document.getElementById('ln-paid').value = l?l.amountPaid||'':'';
  document.getElementById('ln-notes').value = l?l.notes||'':'';
  document.getElementById('ln-preview').style.display='none';
  lnTypeChange();
  document.getElementById('loan-modal').style.display='flex';
  setTimeout(()=>document.getElementById('ln-name').focus(),50);
}

function closeLoanModal(){document.getElementById('loan-modal').style.display='none';}

function saveLoan(){
  const name = document.getElementById('ln-name').value.trim();
  if(!name){document.getElementById('ln-name').focus();return;}
  const lnType = document.getElementById('ln-type').value;
  const isFriendly = lnType === 'friendly';
  const principal = parseFloat(document.getElementById('ln-principal').value)||0;
  const rate = isFriendly ? 0 : (parseFloat(document.getElementById('ln-rate').value)||0);
  const tenure = isFriendly ? 0 : (parseInt(document.getElementById('ln-tenure').value)||0);
  if(!principal){toast('Please enter the amount');return;}
  if(!isFriendly && !tenure){toast('Please enter principal and tenure');return;}
  const emiOverride = isFriendly ? 0 : (parseFloat(document.getElementById('ln-emi-override').value)||0);
  const dueDate = isFriendly ? (document.getElementById('ln-duedate').value||null) : null;
  const friendlyStart = isFriendly ? (document.getElementById('ln-start-friendly').value||null) : null;
  const existing = lnEditId?loans.find(l=>l.id===lnEditId):null;
  const obj={
    id: lnEditId||String(Date.now()),
    name, principal, rate, tenure,
    type: document.getElementById('ln-type').value,
    lender: document.getElementById('ln-lender').value.trim(),
    startDate: isFriendly ? friendlyStart : (document.getElementById('ln-start').value||null),
    emiOverride: emiOverride||null,
    amountPaid: parseFloat(document.getElementById('ln-paid').value)||0,
    notes: document.getElementById('ln-notes').value.trim(),
    dueDate: dueDate,
    paidOff: existing?existing.paidOff:false,
    createdAt: existing?existing.createdAt:Date.now(),
  };
  if(lnEditId){const idx=loans.findIndex(l=>l.id===lnEditId);if(idx>-1)loans[idx]=obj;}
  else loans.unshift(obj);
  saveLoans();closeLoanModal();renderLoans();
  toast(lnEditId?`Updated: ${obj.name}`:`Loan added: ${obj.name}`);
}

function deleteLoan(id){
  const l=loans.find(x=>x.id===id);if(!l)return;
  if(!confirm('Delete "'+l.name+'"?'))return;
  loans=loans.filter(x=>x.id!==id);
  saveLoans();renderLoans();
  toast('Loan deleted');
}

function markLoanPaidOff(id){
  const l=loans.find(x=>x.id===id);if(!l)return;
  l.paidOff=true;
  l.amountPaid=(l.emiOverride||lnCalcMonthlyEMI(l.principal,l.rate,l.tenure))*l.tenure;
  saveLoans();renderLoans();
  toast('\u{1F389} '+l.name+' marked as paid off!');
}

/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
   Financial Accounts
   Each account has:
   - id, name, type, bank, balance, currency, rate,
     maturity, acnum, notes, color, createdAt, updatedAt
   - history: [{balance, date, note}]  -- balance snapshots
   \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */

function acFmtDate(ts){
  if(!ts) return '';
  const d=new Date(ts),now=new Date();
  const diff=now-d;
  if(diff<86400000) return 'Today';
  if(diff<172800000) return 'Yesterday';
  if(diff<604800000) return Math.floor(diff/86400000)+'d ago';
  return d.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
}

function acAnnualReturn(a){
  if(!a.rate||!a.balance) return 0;
  return (parseFloat(a.balance)||0) * (parseFloat(a.rate)||0) / 100;
}

/* \u2500\u2500 Render \u2500\u2500 */
function renderAccounts(){
  const q=(document.getElementById('ac-search')||{}).value?.toLowerCase()||'';
  const sort=(document.getElementById('ac-sort')||{}).value||'balance';

  const totalAED=accounts.reduce((s,a)=>s+(parseFloat(a.balance)||0),0);
  const totalReturn=accounts.reduce((s,a)=>s+acAnnualReturn(a),0);
  const liquid=accounts.filter(a=>(AC_TYPES[a.type]||{}).group==='liquid').reduce((s,a)=>s+(parseFloat(a.balance)||0),0);
  const invested=accounts.filter(a=>(AC_TYPES[a.type]||{}).group==='investments').reduce((s,a)=>s+(parseFloat(a.balance)||0),0);

  document.getElementById('ac-sub').textContent = accounts.length+' account'+(accounts.length!==1?'s':'')+' \u00B7 AED '+fmt(totalAED)+' total';

  document.getElementById('ac-metrics').innerHTML=`
    <div class="metric green"><div class="metric-label">Total balance</div><div class="metric-value">AED ${fmt(totalAED)}</div><div class="metric-sub">${accounts.length} account${accounts.length!==1?'s':''}</div></div>
    <div class="metric"><div class="metric-label">Liquid / Cash</div><div class="metric-value">AED ${fmt(liquid)}</div><div class="metric-sub">${Math.round(totalAED?liquid/totalAED*100:0)}% of total</div></div>
    <div class="metric purple"><div class="metric-label">Investments</div><div class="metric-value">AED ${fmt(invested)}</div><div class="metric-sub">${Math.round(totalAED?invested/totalAED*100:0)}% of total</div></div>
    ${totalReturn>0?`<div class="metric amber"><div class="metric-label">Annual return</div><div class="metric-value">AED ${fmt(totalReturn)}</div><div class="metric-sub">across interest-bearing accounts</div></div>`:''}
  `;

  // Filter & sort
  let filtered=accounts.filter(a=>{
    if(!q) return true;
    return (a.name||'').toLowerCase().includes(q)||(a.bank||'').toLowerCase().includes(q)||(a.type||'').toLowerCase().includes(q);
  });
  if(sort==='balance') filtered=filtered.slice().sort((a,b)=>(parseFloat(b.balance)||0)-(parseFloat(a.balance)||0));
  else if(sort==='name') filtered=filtered.slice().sort((a,b)=>(a.name||'').localeCompare(b.name||''));
  else filtered=filtered.slice().sort((a,b)=>(b.updatedAt||b.createdAt)-(a.updatedAt||a.createdAt));

  const cont=document.getElementById('ac-groups');
  if(!filtered.length){
    cont.innerHTML='<div class="ac-empty"><div style="font-size:32px;margin-bottom:10px;opacity:.4">&#127981;</div><div style="font-size:15px;font-weight:500;color:var(--text2);margin-bottom:6px">'+(accounts.length?'No accounts match':'No accounts yet')+'</div><div style="font-size:13px">Add your first account to start tracking</div></div>';
    return;
  }

  // Group by category
  const groups={liquid:[],investments:[],fixed:[],other:[]};
  filtered.forEach(a=>{
    const g=(AC_TYPES[a.type]||{}).group||'other';
    (groups[g]||groups.other).push(a);
  });

  let html='';
  Object.entries(AC_GROUPS).forEach(([key,label])=>{
    const group=groups[key];
    if(!group||!group.length) return;
    const groupTotal=group.reduce((s,a)=>s+(parseFloat(a.balance)||0),0);
    html+=`<div class="ac-group">
      <div class="ac-group-label">
        <span>${label}</span>
        <span class="ac-group-total">AED ${fmt(groupTotal)}</span>
      </div>
      <div class="ac-grid">${group.map(a=>acCardHTML(a)).join('')}</div>
    </div>`;
  });
  // Ungrouped
  if(groups.other&&groups.other.length&&!Object.keys(AC_TYPES).every(t=>AC_TYPES[t].group!=='other')){
    const groupTotal=groups.other.reduce((s,a)=>s+(parseFloat(a.balance)||0),0);
    html+=`<div class="ac-group"><div class="ac-group-label"><span>Other</span><span class="ac-group-total">AED ${fmt(groupTotal)}</span></div><div class="ac-grid">${groups.other.map(a=>acCardHTML(a)).join('')}</div></div>`;
  }
  cont.innerHTML=html;

  // Render sparklines after DOM update
  accounts.forEach(a=>acDrawSparkline(a));
}

function acCardHTML(a){
  const typeMeta=AC_TYPES[a.type]||{icon:'\uD83D\uDCCB',label:'Other'};
  const color=a.color||'#4A8ECC';
  const bal=parseFloat(a.balance)||0;
  const annualReturn=acAnnualReturn(a);
  const lastHistory=(a.history||[]).slice(-1)[0];
  const prevBal=lastHistory&&a.history.length>=2?a.history[a.history.length-2].balance:null;
  const delta=prevBal!==null?bal-prevBal:null;
  const hasSparkline=(a.history||[]).length>=2;
  const maturityStr=a.maturity?new Date(a.maturity).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):null;

  return `<div class="ac-card">
    <div class="ac-card-stripe" style="background:${color}"></div>
    <div class="ac-card-head">
      <div class="ac-card-left">
        <div class="ac-icon" style="background:${color}22">${typeMeta.icon}</div>
        <div class="ac-card-info">
          <div class="ac-card-name">${esc(a.name)}</div>
          <div class="ac-card-bank">${esc(a.bank||'')}${a.bank&&a.acnum?' \u00B7\u00B7\u00B7\u00B7'+a.acnum:a.acnum?' \u00B7\u00B7\u00B7\u00B7'+a.acnum:''}</div>
        </div>
      </div>
      <div class="ac-actions">
        <button class="icon-btn" onclick="openAcHistoryModal('${a.id}')" title="Balance history">&#9719;</button>
        <button class="icon-btn" onclick="openAccountModal('${a.id}')" title="Edit">&#9998;</button>
        <button class="icon-btn del" onclick="deleteAccount('${a.id}')" title="Delete">&#10005;</button>
      </div>
    </div>
    <div class="ac-balance">AED ${fmt(bal)}</div>
    <div class="ac-balance-sub">
      ${a.currency&&a.currency!=='AED'?a.currency+' account \u00B7 ':''}
      ${typeMeta.label}
      ${delta!==null?` \u00B7 <span style="color:${delta>=0?'var(--accent)':'var(--red)'}">` + (delta>=0?'\u25B2':'\u25BC')+' AED '+fmt(Math.abs(delta))+'</span>':''}
    </div>
    ${hasSparkline?`<div class="ac-sparkline"><canvas id="spark-${a.id}"></canvas></div>`:''}
    <div class="ac-stats">
      ${a.rate?`<div class="ac-stat"><div class="ac-stat-label">Interest rate</div><div class="ac-stat-val amber">${a.rate}% p.a.</div></div>`:''}
      ${annualReturn>0?`<div class="ac-stat"><div class="ac-stat-label">Annual return</div><div class="ac-stat-val green">AED ${fmt(annualReturn)}</div></div>`:''}
      ${maturityStr?`<div class="ac-stat"><div class="ac-stat-label">Matures</div><div class="ac-stat-val">${maturityStr}</div></div>`:''}
      ${a.updatedAt?`<div class="ac-stat"><div class="ac-stat-label">Last updated</div><div class="ac-stat-val">${acFmtDate(a.updatedAt)}</div></div>`:''}
    </div>
    ${a.notes?`<div style="font-size:11px;color:var(--text3);font-style:italic;margin-bottom:8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(a.notes)}</div>`:''}
    <div class="ac-quick-update">
      <input class="ac-quick-input" id="qupd-${a.id}" type="number" min="0" step="0.01" placeholder="New balance&#8230;" onkeydown="if(event.key==='Enter')acQuickUpdate('${a.id}')">
      <button class="ac-quick-btn" onclick="acQuickUpdate('${a.id}')">Update</button>
    </div>
  </div>`;
}

function acDrawSparkline(a){
  const history=a.history||[];
  if(history.length<2) return;
  const canvas=document.getElementById('spark-'+a.id);
  if(!canvas) return;
  const W=canvas.offsetWidth||240, H=36;
  canvas.width=W; canvas.height=H;
  const ctx=canvas.getContext('2d');
  const vals=history.map(h=>parseFloat(h.balance)||0);
  const min=Math.min(...vals), max=Math.max(...vals);
  const range=max-min||1;
  const color=a.color||'#4A8ECC';
  const pts=vals.map((v,i)=>({
    x:i/(vals.length-1)*(W-4)+2,
    y:H-4-((v-min)/range)*(H-8)
  }));
  ctx.clearRect(0,0,W,H);
  // Fill
  ctx.beginPath();
  ctx.moveTo(pts[0].x,H);
  pts.forEach(p=>ctx.lineTo(p.x,p.y));
  ctx.lineTo(pts[pts.length-1].x,H);
  ctx.closePath();
  ctx.fillStyle=color+'22';
  ctx.fill();
  // Line
  ctx.beginPath();
  pts.forEach((p,i)=>i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y));
  ctx.strokeStyle=color;
  ctx.lineWidth=1.5;
  ctx.stroke();
  // End dot
  const last=pts[pts.length-1];
  ctx.beginPath();
  ctx.arc(last.x,last.y,3,0,Math.PI*2);
  ctx.fillStyle=color;
  ctx.fill();
}

/* \u2500\u2500 Quick update \u2500\u2500 */
function acQuickUpdate(id){
  const inp=document.getElementById('qupd-'+id);
  const val=parseFloat(inp.value);
  if(isNaN(val)||val<0){inp.focus();return;}
  const a=accounts.find(x=>x.id===id);if(!a)return;
  const old=parseFloat(a.balance)||0;
  a.balance=val;
  a.updatedAt=Date.now();
  if(!a.history) a.history=[];
  a.history.push({balance:val,date:new Date().toISOString().slice(0,10),note:'Quick update'});
  if(a.history.length>24) a.history=a.history.slice(-24); // keep last 24 snapshots
  saveAccounts();renderAccounts();
  const delta=val-old;
  toast('Updated: '+a.name+' -> AED '+fmt(val)+(delta!==0?' ('+(delta>0?'+':'')+fmt(delta)+')':''));
}

/* \u2500\u2500 History modal \u2500\u2500 */
function openAcHistoryModal(id){
  const a=accounts.find(x=>x.id===id);if(!a)return;
  document.getElementById('ac-history-title').textContent=a.name+' -- History';
  const history=(a.history||[]).slice().reverse();
  if(!history.length){
    document.getElementById('ac-history-content').innerHTML='<div style="text-align:center;padding:2rem;color:var(--text3);font-size:13px">No balance history yet.<br>Use Quick Update to start logging.</div>';
  } else {
    document.getElementById('ac-history-content').innerHTML=history.map((h,i)=>{
      const prev=history[i+1];
      const delta=prev?((parseFloat(h.balance)||0)-(parseFloat(prev.balance)||0)):null;
      return `<div class="ac-history-row">
        <span class="ac-history-date">${h.date}</span>
        <span class="ac-history-bal">AED ${fmt(parseFloat(h.balance)||0)}</span>
        ${delta!==null?`<span class="ac-history-delta ${delta>=0?'pos':'neg'}">${delta>=0?'+':''}AED ${fmt(Math.abs(delta))}</span>`:'<span></span>'}
      </div>`;
    }).join('');
  }
  document.getElementById('ac-history-modal').style.display='flex';
}
function closeAcHistoryModal(){document.getElementById('ac-history-modal').style.display='none';}

/* \u2500\u2500 Add/Edit modal \u2500\u2500 */
function acTypeChange(){
  const t=document.getElementById('ac-type').value;
  const showRate=['savings','fixeddeposit','investment'].includes(t);
  document.getElementById('ac-rate-field').style.display=showRate?'':'none';
}

function acBuildColorPicker(sel){
  document.getElementById('ac-color-picker').innerHTML=AC_COLORS.map(c=>`
    <div style="width:22px;height:22px;border-radius:50%;background:${c};cursor:pointer;border:2px solid ${sel===c?'var(--text)':'transparent'};transition:transform .15s,border-color .15s;flex-shrink:0"
      onclick="acPickColor('${c}')" title="${c}"></div>`).join('');
  acSelectedColor=sel||AC_COLORS[0];
}
function acPickColor(c){
  acSelectedColor=c;
  acBuildColorPicker(c);
}

function openAccountModal(id){
  acEditId=id||null;
  const a=id?accounts.find(x=>x.id===id):null;
  document.getElementById('account-modal-title').textContent=id?'Edit account':'Add account';
  document.getElementById('ac-name').value=a?a.name:'';
  document.getElementById('ac-type').value=a?a.type||'savings':'savings';
  document.getElementById('ac-bank').value=a?a.bank||'':'';
  document.getElementById('ac-balance').value=a?a.balance||'':'';
  document.getElementById('ac-currency').value=a?a.currency||'AED':'AED';
  document.getElementById('ac-rate').value=a?a.rate||'':'';
  document.getElementById('ac-maturity').value=a?a.maturity||'':'';
  document.getElementById('ac-acnum').value=a?a.acnum||'':'';
  document.getElementById('ac-notes').value=a?a.notes||'':'';
  acTypeChange();
  acBuildColorPicker(a?a.color||AC_COLORS[0]:AC_COLORS[0]);
  document.getElementById('account-modal').style.display='flex';
  setTimeout(()=>document.getElementById('ac-name').focus(),50);
}
function closeAccountModal(){document.getElementById('account-modal').style.display='none';}

function saveAccount(){
  const name=document.getElementById('ac-name').value.trim();
  if(!name){document.getElementById('ac-name').focus();return;}
  const balance=parseFloat(document.getElementById('ac-balance').value)||0;
  const existing=acEditId?accounts.find(a=>a.id===acEditId):null;
  const now=Date.now();
  const obj={
    id:acEditId||String(now),
    name,
    type:document.getElementById('ac-type').value,
    bank:document.getElementById('ac-bank').value.trim(),
    balance,
    currency:document.getElementById('ac-currency').value,
    rate:parseFloat(document.getElementById('ac-rate').value)||null,
    maturity:document.getElementById('ac-maturity').value||null,
    acnum:document.getElementById('ac-acnum').value.trim(),
    notes:document.getElementById('ac-notes').value.trim(),
    color:acSelectedColor,
    createdAt:existing?existing.createdAt:now,
    updatedAt:now,
    history:existing?existing.history||[]:[],
  };
  // Log initial/changed balance as a history snapshot
  const prevBal=existing?parseFloat(existing.balance)||0:null;
  if(prevBal===null||prevBal!==balance){
    obj.history.push({balance,date:new Date().toISOString().slice(0,10),note:existing?'Manual edit':'Initial balance'});
    if(obj.history.length>24) obj.history=obj.history.slice(-24);
  }
  if(acEditId){const idx=accounts.findIndex(a=>a.id===acEditId);if(idx>-1)accounts[idx]=obj;}
  else accounts.unshift(obj);
  saveAccounts();closeAccountModal();renderAccounts();
  toast(acEditId?'Updated: '+obj.name:'Account added: '+obj.name);
}

function deleteAccount(id){
  const a=accounts.find(x=>x.id===id);if(!a)return;
  if(!confirm('Delete "'+a.name+'"?'))return;
  accounts=accounts.filter(x=>x.id!==id);
  saveAccounts();renderAccounts();
  toast('Account deleted');
}

/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
   Bill Reminders
   Two-layer system:
   1. In-app sticky banner -- always works, no permissions
   2. Browser push notifications -- opt-in, persisted
   Checks on every page load. Dismissed-today state stored
   in sessionStorage so it doesn't re-appear mid-session.
   \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */
const REM_DAYS    = 3;   // warn this many days before due
const REM_DISMISS = 'lifeos_rem_dismissed'; // sessionStorage key
const REM_NOTIF   = 'lifeos_notif_enabled'; // localStorage key

/* \u2500\u2500 Build the list of upcoming unpaid bills \u2500\u2500 */
function getUpcomingReminders(){
  const now = new Date();
  const active = items.filter(i=>i.status==='active'&&!i.isTrial&&i.dueDay);
  const results = [];
  active.forEach(i=>{
    if(isPaidThisCycle(i)) return;
    const dueDate = nextDueDate(i.dueDay);
    const diff = Math.ceil((dueDate - now)/(1000*60*60*24));
    if(diff <= REM_DAYS && diff >= -1){
      results.push({item:i, diff:Math.max(0,diff), overdue: dueDate < now});
    }
  });
  // Also include Tabby instalments due within 3 days
  tabbyItems.forEach(t=>{
    t.instalments.forEach(ins=>{
      if(ins.paid) return;
      const insDate = new Date(ins.date);
      const diffMs = insDate - now;
      const diffDays = Math.ceil(diffMs/(1000*60*60*24));
      if(diffDays >= 0 && diffDays <= REM_DAYS){
        results.push({
          item:{name:t.name+' (Tabby)',amount:t.total/4,color:'#C98A1A'},
          diff:diffDays, tabby:true
        });
      }
    });
  });
  return results.sort((a,b)=>a.diff-b.diff);
}

/* \u2500\u2500 Render the in-app banner \u2500\u2500 */
function checkReminders(){
  const wrap = document.getElementById('reminder-banner-wrap');
  if(!wrap) return;
  // Check if dismissed this session
  const dismissed = sessionStorage.getItem(REM_DISMISS);
  const todayKey = new Date().toISOString().slice(0,10);
  if(dismissed === todayKey){ wrap.innerHTML=''; return; }

  const due = getUpcomingReminders();
  if(!due.length){ wrap.innerHTML=''; return; }

  const overdueItems = due.filter(d=>d.diff===0||d.overdue);
  const soonItems    = due.filter(d=>d.diff>0&&!d.overdue);
  const notifEnabled = localStorage.getItem(REM_NOTIF)==='true';
  const notifGranted = 'Notification' in window && Notification.permission==='granted';

  // Build text -- names are clickable links that jump to + highlight the bill
  const hlBtn = (d) => {
    const style = 'background:none;border:none;cursor:pointer;font-family:var(--font);font-size:inherit;font-weight:600;color:var(--text);padding:0;text-decoration:underline;text-underline-offset:2px';
    return '<button onclick="highlightBill(\'' + d.item.id + '\')" style="' + style + '" title="Jump to ' + esc(d.item.name) + '">' + esc(d.item.name) + '</button>';
  };
  let parts = [];
  if(overdueItems.length){
    const overdueLinks = overdueItems.slice(0,3).map(d=>
      d.item.id ? hlBtn(d) : '<strong>'+esc(d.item.name)+'</strong>'
    ).join(', ');
    parts.push(overdueLinks+(overdueItems.length>3?' +more':'')+' <span style="font-weight:400;color:var(--amber)">due today</span>');
  }
  if(soonItems.length){
    const names = soonItems.slice(0,3).map(d=>
      (d.item.id ? hlBtn(d) : '<strong>'+esc(d.item.name)+'</strong>') +
      ' <span style="font-weight:400;color:var(--amber)">in '+d.diff+'d</span>'
    ).join('&nbsp;&nbsp;\u00B7&nbsp;&nbsp;');
    parts.push(names+(soonItems.length>3?' +more':''));
  }

  // Notification button
  let notifBtnHtml = '';
  if('Notification' in window && !notifGranted && !notifEnabled){
    notifBtnHtml = '<button class="reminder-notif-btn" onclick="requestNotifPermission()" title="Enable browser notifications for bill reminders">&#128276;</button>';
  }

  wrap.innerHTML =
    '<div class="reminder-banner">'+
      '<span class="reminder-banner-icon">&#9888;</span>'+
      '<span class="reminder-banner-text">'+parts.join(' &nbsp;\u00B7&nbsp; ')+'</span>'+
      '<div class="reminder-banner-actions">'+
        notifBtnHtml+
        '<button class="reminder-banner-btn primary" onclick="switchPage(\'active\')">View bills</button>'+
        '<button class="reminder-banner-btn ghost" onclick="dismissReminder()" title="Dismiss until tomorrow">&#10005;</button>'+
      '</div>'+
    '</div>';

  // Fire browser notifications if enabled
  if(notifGranted && notifEnabled) fireNotifications(due);
}

function dismissReminder(){
  const todayKey = new Date().toISOString().slice(0,10);
  sessionStorage.setItem(REM_DISMISS, todayKey);
  document.getElementById('reminder-banner-wrap').innerHTML='';
  toast('Reminder dismissed for today');
}

/* \u2500\u2500 Browser push notifications \u2500\u2500 */
function requestNotifPermission(){
  if(!('Notification' in window)) return;
  Notification.requestPermission().then(perm=>{
    if(perm==='granted'){
      localStorage.setItem(REM_NOTIF,'true');
      const due = getUpcomingReminders();
      fireNotifications(due);
      checkReminders(); // refresh banner to remove the enable button
      toast('&#10003; Browser notifications enabled');
    } else {
      toast('Notifications blocked -- use the in-app banner instead');
    }
  });
}

function fireNotifications(due){
  if(!('Notification' in window)||Notification.permission!=='granted') return;
  const firedKey = 'lifeos_notif_fired_'+new Date().toISOString().slice(0,10);
  if(sessionStorage.getItem(firedKey)) return; // only fire once per day
  sessionStorage.setItem(firedKey,'1');
  due.forEach((d,idx)=>{
    setTimeout(()=>{
      const label = d.diff===0?'Due today':'Due in '+d.diff+' day'+(d.diff!==1?'s':'');
      const n = new Notification('Bill reminder -- '+esc(d.item.name),{
        body: label+' \u00B7 AED '+fmt(d.item.amount),
        icon: '',
        tag: 'lifeos-bill-'+d.item.name,
        requireInteraction: false,
      });
      n.onclick = ()=>{ window.focus(); switchPage('active'); n.close(); };
    }, idx * 800); // stagger notifications
  });
}

/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
   Data Versioning
   Keeps last 5 snapshots in localStorage.
   A snapshot is taken on every asAutoSave() call
   (i.e. every time any data changes, after a 2s debounce).
   Snapshots are stored as compressed JSON strings under
   KEY_VER. Each entry: {ts, name, autoLabel, diff, counts, data}
   \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */
const KEY_VER      = 'lifeos_versions';
const VER_MAX      = 10;
let _verPanelOpen  = false;

/* \u2500\u2500 Improvement 2: Data hash for deduplication \u2500\u2500 */
function verDataHash(){
  // Fast hash of counts + last payment ts + last item id -- good enough for change detection
  const lastPay = payments.length ? payments[0].id : '';
  const lastItem = items.length ? items[0].id : '';
  const lastTask = tasks.length ? tasks[0].id : '';
  return [items.length, payments.length, tasks.length, goals.length,
          loans.length, accounts.length, notes.length, receivables.length,
          lastPay, lastItem, lastTask].join('|');
}

/* \u2500\u2500 Improvement 5: Build diff summary vs previous snapshot \u2500\u2500 */
function verBuildDiff(prevSnap){
  if(!prevSnap) return null;
  const prev = prevSnap.counts || {};
  const curr = {
    bills: items.length, tasks: tasks.length, goals: goals.length,
    notes: notes.length, loans: loans.length, accounts: accounts.length,
    payments: payments.length, receivables: receivables.length,
  };
  const parts = [];
  const changes = [
    ['bills', 'bill'], ['tasks', 'task'], ['loans', 'loan'],
    ['goals', 'goal'], ['accounts', 'account'], ['payments', 'payment'],
    ['notes', 'note'], ['receivables', 'receivable'],
  ];
  changes.forEach(([key, label])=>{
    const delta = (curr[key]||0) - (prev[key]||0);
    if(delta > 0) parts.push('+'+delta+' '+label+(delta>1?'s':''));
    else if(delta < 0) parts.push(delta+' '+label+(Math.abs(delta)>1?'s':''));
  });
  return parts.length ? parts.join(', ') : 'Minor changes';
}

/* \u2500\u2500 Core snapshot function \u2500\u2500 */
function verSnapshot(force, autoLabel){
  try{
    let versions = [];
    try{ const s=localStorage.getItem(KEY_VER); if(s) versions=JSON.parse(s); }catch(e){}

    // Improvement 2: Skip if data hasn't changed
    const hash = verDataHash();
    if(!force && versions.length && versions[0].hash === hash) return;

    const payload = JSON.stringify(
      {items,payments,tabbyItems,tasks,taskHistory,shopping,shCollections,links,linkGroups,lists,workspaces,goals,notes,loans,receivables,accounts,nwHistory,
       dbLayout:JSON.parse(localStorage.getItem(DB_LAYOUT_KEY)||'[]'),dbCollapsed:JSON.parse(localStorage.getItem('lifeos_db_collapsed')||'{}'),
       navLayout:JSON.parse(localStorage.getItem(NAV_LAYOUT_KEY)||'[]'),
       cycleStart:parseInt(localStorage.getItem(CYCLE_KEY)||'1'),
       proxyUrl:localStorage.getItem(AI_PROXY_STORE)||'',
       savedAt:new Date().toISOString()}
    );

    // Improvement 5: Build diff vs previous
    const diff = verBuildDiff(versions[0]||null);

    const counts = {
      bills: items.length, tasks: tasks.length, goals: goals.length,
      notes: notes.length, loans: loans.length, accounts: accounts.length,
      payments: payments.length, receivables: receivables.length,
    };

    const snap = {
      ts: Date.now(),
      hash,
      name: '',
      autoLabel: autoLabel || new Date().toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}),
      diff,
      counts,
      data: payload,
    };

    versions.unshift(snap);
    if(versions.length > VER_MAX) versions = versions.slice(0, VER_MAX);
    localStorage.setItem(KEY_VER, JSON.stringify(versions));
    if(_verPanelOpen) renderVerPanel();
  } catch(e){
    console.warn('Version snapshot failed:', e);
  }
}

/* \u2500\u2500 Improvement 4: Manual named checkpoint \u2500\u2500 */
function verManualCheckpoint(){
  const name = prompt('Name this checkpoint (e.g. "Before salary update"):');
  if(name === null) return; // cancelled
  verSnapshot(true, name || 'Manual checkpoint');
  // Set the name on the just-saved snapshot
  const versions = getVersions();
  if(versions.length && !versions[0].name){
    versions[0].name = name || 'Manual checkpoint';
    localStorage.setItem(KEY_VER, JSON.stringify(versions));
  }
  toast('\u2713 Checkpoint saved'+(name?' \u201C'+name+'\u201D':''));
  // Re-render panel if open
  const panel = document.getElementById('settings-ver-panel');
  if(panel && panel.style.display!=='none') renderVerPanel(panel);
}

function getVersions(){
  try{
    const s = localStorage.getItem(KEY_VER);
    return s ? JSON.parse(s) : [];
  } catch(e){ return []; }
}

function toggleVerPanel(){
  _verPanelOpen = !_verPanelOpen;
  const panel = document.getElementById('ver-panel');
  const btn   = document.getElementById('ver-toggle-btn');
  if(_verPanelOpen){
    panel.style.display = 'block';
    if(btn) btn.innerHTML = '&#9719; Hide history';
    renderVerPanel();
  } else {
    panel.style.display = 'none';
    if(btn) btn.innerHTML = '&#9719; Data versions';
  }
}

function renderVerPanel(){
  const panel = document.getElementById('ver-panel');
  if(!panel) return;
  const versions = getVersions();
  if(!versions.length){
    panel.innerHTML = '<div class="ver-panel"><div class="ver-panel-title">Data versions</div><div style="font-size:12px;color:var(--text3);text-align:center;padding:8px 0">No snapshots yet.<br>Saves are taken automatically<br>when you make changes.</div></div>';
    return;
  }
  panel.innerHTML = '<div class="ver-panel">'+
    '<div class="ver-panel-title"><span>&#9719; '+versions.length+' snapshot'+(versions.length!==1?'s':'')+' (last '+VER_MAX+')</span></div>'+
    versions.map((v,i)=>{
      const c = v.counts||{};
      const countStr = [
        c.bills?c.bills+' bills':'',
        c.tasks?c.tasks+' tasks':'',
        c.goals?c.goals+' goals':'',
        c.notes?c.notes+' notes':'',
        c.accounts?c.accounts+' accounts':'',
        c.loans?c.loans+' loans':'',
      ].filter(Boolean).join(' \u00B7 ');
      const filenameHtml = v.filename
        ? '<div style="font-size:10px;color:var(--text3);margin-bottom:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">&#128196; '+v.filename+'</div>'
        : '';
      // Editable name input -- shown above the timestamp
      const nameHtml = '<input class="ver-name-input" id="ver-name-'+i+'" type="text" '+
        'value="'+((v.name||'').replace(/"/g,'&quot;'))+'" '+
        'placeholder="Add a label&#8230;" '+
        'onchange="verSaveName('+i+',this.value)" '+
        'onblur="verSaveName('+i+',this.value)" '+
        'onclick="event.stopPropagation()" '+
        'title="Click to add a label to this snapshot">';
      return '<div class="ver-row">'+
        '<div class="ver-dot'+(i===0?' latest':'')+'"></div>'+
        '<div class="ver-info" style="overflow:hidden">'+
          nameHtml+
          filenameHtml+
          '<div class="ver-time" style="color:var(--text3);font-weight:400;font-size:11px">'+v.label+'</div>'+
          '<div class="ver-counts">'+(countStr||'no data')+'</div>'+
        '</div>'+
        (i===0?'<span style="font-size:10px;color:var(--text3);flex-shrink:0">current</span>':
          '<button class="ver-restore-btn" onclick="verRestore('+i+')">Restore</button>')+
      '</div>';
    }).join('')+
  '</div>';
}

function verSaveName(idx, name){
  let versions = getVersions();
  if(!versions[idx]) return;
  versions[idx].name = name.trim();
  localStorage.setItem(KEY_VER, JSON.stringify(versions));
  // Don't re-render the whole panel (would lose focus mid-type)
}

function verRestore(idx){
  const versions = getVersions();
  const snap = versions[idx];
  if(!snap) return;
  const d = new Date(snap.ts);
  const label = d.toLocaleString('en-GB',{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
  if(!confirm('Restore to snapshot from '+label+'?\n\nThis will replace all current data. Your current state is saved as the most recent snapshot.')){
    return;
  }
  try{
    // Take a snapshot of current state before overwriting (safety net -- always force)
    verSnapshot(true);
    const data = JSON.parse(snap.data);
    items       = data.items       || [];
    payments    = data.payments    || [];
    tabbyItems  = data.tabbyItems  || [];
    tasks       = data.tasks       || [];
    taskHistory = data.taskHistory || [];
    shopping    = data.shopping    || [];
    shCollections = data.shCollections || [];
    links       = data.links       || [];
    linkGroups  = data.linkGroups  || [];
    lists       = data.lists       || [];
    workspaces  = (data.workspaces&&data.workspaces.length)?data.workspaces:JSON.parse(JSON.stringify(WS_DEFAULTS));
    goals       = data.goals       || [];
    notes       = data.notes       || [];
    loans       = data.loans       || [];
    accounts    = data.accounts    || [];
    receivables = data.receivables || [];
    nwHistory   = data.nwHistory   || [];
    // Write to localStorage directly (skip asAutoSave to avoid creating a snapshot mid-restore)
    lsSet(KEY_ITEMS,JSON.stringify(items));
    lsSet(KEY_PAY,JSON.stringify(payments));
    lsSet(KEY_TABBY,JSON.stringify(tabbyItems));
    lsSet(KEY_TASKS,JSON.stringify(tasks));
    lsSet(KEY_TASK_HIST,JSON.stringify(taskHistory));
    lsSet(KEY_SHOPPING,JSON.stringify(shopping));
    lsSet(KEY_LINKS,JSON.stringify(links));
    lsSet(KEY_LINK_GROUPS,JSON.stringify(linkGroups));
    lsSet(KEY_SH_LISTS,JSON.stringify(shCollections));
    lsSet(KEY_LISTS,JSON.stringify(lists));
    lsSet(KEY_WORKSPACES,JSON.stringify(workspaces));
    lsSet(KEY_GOALS,JSON.stringify(goals));
    lsSet(KEY_NOTES,JSON.stringify(notes));
    lsSet(KEY_LOANS,JSON.stringify(loans));
    lsSet(KEY_ACCOUNTS,JSON.stringify(accounts));
    lsSet(KEY_RECV,JSON.stringify(receivables));
    lsSet(KEY_NW,JSON.stringify(nwHistory));
    // Re-render everything
    render();
    if(currentPage==='tasks')    renderTasks();
    if(currentPage==='goals')    renderGoals();
    if(currentPage==='notes')    renderNotes();
    if(currentPage==='loans')    renderLoans();
    if(currentPage==='accounts') renderAccounts();
    if(currentPage==='shopping')  renderShopping();
    if(currentPage==='dashboard')renderDashboard();
    renderVerPanel();
    toast('\u21a9 Restored to '+label);
  } catch(e){
    console.error('Restore failed:', e);
    toast('Restore failed \u2014 snapshot may be corrupted');
  }
}

/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
   Net Worth
   Assets  = sum of all account balances
   Liabs   = sum of remaining loan balances
   Net     = Assets - Liabs
   History = manually saved snapshots stored in nwHistory[]
   Each snapshot: {ts, note, assets, liabs, net, breakdown}
   \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */

function nwCalc(){
  const assets = accounts.reduce((s,a)=>s+(parseFloat(a.balance)||0),0);
  const liabs  = loans.filter(l=>!l.paidOff).reduce((s,l)=>s+lnRemainingBalance(l),0);
  return {assets, liabs, net: assets-liabs};
}

/* \u2500\u2500 Take a snapshot of current net worth \u2500\u2500 */
function nwTakeSnapshot(){
  const {assets, liabs, net} = nwCalc();
  const note = (document.getElementById('nw-snap-note')||{}).value||'';
  const snap = {
    ts:     Date.now(),
    date:   new Date().toISOString().slice(0,10),
    note:   note.trim(),
    assets, liabs, net,
    breakdown: {
      accounts: accounts.map(a=>({name:a.name,type:a.type,balance:parseFloat(a.balance)||0})),
      loans:    loans.filter(l=>!l.paidOff).map(l=>({name:l.name,type:l.type,remaining:lnRemainingBalance(l)})),
    },
  };
  nwHistory.push(snap);
  if(nwHistory.length > 24) nwHistory = nwHistory.slice(-24); // keep last 24
  saveNetWorth();
  if(document.getElementById('nw-snap-note')) document.getElementById('nw-snap-note').value='';
  renderNetWorth();
  toast('\u2713 Net worth snapshot saved -- AED '+fmt(net));
}

/* \u2500\u2500 Main render \u2500\u2500 */
function renderNetWorth(){
  const {assets, liabs, net} = nwCalc();

  // Compare to last snapshot
  const lastSnap = nwHistory.length ? nwHistory[nwHistory.length-1] : null;
  const delta    = lastSnap ? net - lastSnap.net : null;
  const deltaStr = delta !== null
    ? (delta >= 0 ? '+' : '') + 'AED ' + fmt(Math.abs(delta)) + (delta >= 0 ? ' \u25b2' : ' \u25bc')
    : null;
  const deltaDate = lastSnap
    ? 'vs snapshot ' + new Date(lastSnap.ts).toLocaleDateString('en-GB',{day:'numeric',month:'short'})
    : '';

  document.getElementById('nw-sub').textContent =
    accounts.length + ' account' + (accounts.length!==1?'s':'') +
    ' \u00b7 ' + loans.filter(l=>!l.paidOff).length + ' active loan' +
    (loans.filter(l=>!l.paidOff).length!==1?'s':'');

  // Hero card
  document.getElementById('nw-hero').innerHTML =
    '<div class="nw-hero">' +
      '<div class="nw-hero-label">Total net worth</div>' +
      '<div class="nw-hero-value ' + (net>=0?'pos':'neg') + '">AED ' + fmt(Math.abs(net)) + (net<0?' (deficit)':'') + '</div>' +
      (deltaStr ? '<div class="nw-hero-delta ' + (delta>=0?'pos':'neg') + '">' + deltaStr + '</div>' : '') +
      (deltaDate ? '<div class="nw-hero-sub">' + deltaDate + '</div>' : '<div class="nw-hero-sub">Save your first snapshot to track changes over time</div>') +
    '</div>';

  // Assets + Liabilities side-by-side
  const AC_TYPES_LOCAL = typeof AC_TYPES !== 'undefined' ? AC_TYPES : {};

  const assetRows = accounts.length ? accounts
    .slice().sort((a,b)=>(parseFloat(b.balance)||0)-(parseFloat(a.balance)||0))
    .map(a=>{
      const pct = assets > 0 ? Math.round((parseFloat(a.balance)||0)/assets*100) : 0;
      const meta = AC_TYPES_LOCAL[a.type]||{icon:'\uD83D\uDCCB'};
      return '<div class="nw-row">' +
        '<div class="nw-row-left">' +
          '<div class="nw-row-icon" style="background:'+(a.color||'#4A8ECC')+'22">' + (meta.icon||'\uD83D\uDCCB') + '</div>' +
          '<div><div class="nw-row-name">' + esc(a.name) + '</div>' +
          '<div class="nw-row-sub">' + esc(a.bank||a.type||'') + '</div></div>' +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:8px">' +
          '<div class="nw-row-pct">' + pct + '%</div>' +
          '<div class="nw-row-amt green">AED ' + fmt(parseFloat(a.balance)||0) + '</div>' +
        '</div>' +
      '</div>';
    }).join('') :
    '<div style="text-align:center;padding:1rem;font-size:12px;color:var(--text3)">No accounts yet<br><button class="btn" style="margin-top:6px;font-size:11px" onclick="switchPage(\'accounts\')">Add accounts \u2192</button></div>';

  const activeLiabs = loans.filter(l=>!l.paidOff);
  const liabRows = activeLiabs.length ? activeLiabs
    .slice().sort((a,b)=>lnRemainingBalance(b)-lnRemainingBalance(a))
    .map(l=>{
      const rem = lnRemainingBalance(l);
      const pct = liabs > 0 ? Math.round(rem/liabs*100) : 0;
      const colors = typeof LN_COLORS!=='undefined' ? LN_COLORS : {};
      const color = colors[l.type]||'#888';
      const _nwDiv = document.createElement('div');
      _nwDiv.className = 'nw-row';
      _nwDiv.style.cursor = 'pointer';
      _nwDiv.title = 'View in Loans';
      _nwDiv.onclick = (function(id){return function(){highlightLoan(id);};})(l.id);
      _nwDiv.innerHTML = '<div class="nw-row-left">'
        + '<div class="nw-row-icon" style="background:'+color+'22">&#127968;</div>'
        + '<div><div class="nw-row-name">'+esc(l.name)+'</div>'
        + '<div class="nw-row-sub">'+esc(l.lender||l.type||'')+'</div></div>'
        + '</div>'
        + '<div style="display:flex;align-items:center;gap:8px">'
        + '<div class="nw-row-pct">'+pct+'%</div>'
        + '<div class="nw-row-amt red">AED '+fmt(rem)+'</div>'
        + '</div>';
      return _nwDiv.outerHTML;    }).join('') :
    '<div style="text-align:center;padding:1rem;font-size:12px;color:var(--text3)">No active loans<br><span style="color:var(--accent);font-size:11px">\u2713 Debt-free!</span></div>';

  document.getElementById('nw-sections').innerHTML =
    '<div class="nw-section">' +
      '<div class="nw-section-head">' +
        '<div class="nw-section-title">\u25b2 Assets</div>' +
        '<div class="nw-section-total green">AED ' + fmt(assets) + '</div>' +
      '</div>' + assetRows +
    '</div>' +
    '<div class="nw-section">' +
      '<div class="nw-section-head">' +
        '<div class="nw-section-title">\u25bc Liabilities</div>' +
        '<div class="nw-section-total red">AED ' + fmt(liabs) + '</div>' +
      '</div>' + liabRows +
    '</div>';

  // Trend chart
  nwRenderChart(net);
}

/* \u2500\u2500 Trend chart \u2500\u2500 */
function nwRenderChart(currentNet){
  const c = Chart.getChart('nwTrendChart');
  if(c) c.destroy();

  // Build chart data: history snapshots + current live value
  const snaps = nwHistory.slice();
  const chartData = [
    ...snaps.map(s=>({x:s.date, y:s.net, note:s.note})),
    {x:new Date().toISOString().slice(0,10), y:currentNet, note:'Now (live)'},
  ];

  document.getElementById('nw-chart-sub').textContent =
    snaps.length === 0 ? 'Save snapshots to see your trend'
    : snaps.length + ' snapshot' + (snaps.length!==1?'s':'') + ' saved';

  if(chartData.length < 2){
    // Not enough data -- show placeholder message
    const canvas = document.getElementById('nwTrendChart');
    const ctx = canvas.getContext('2d');
    canvas.height = 200;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = 'rgba(255,255,255,.2)';
    ctx.font = "13px system-ui";
    ctx.textAlign = 'center';
    ctx.fillText('Save snapshots over time to see your net worth trend', canvas.width/2, 100);
    return;
  }

  const vals = chartData.map(d=>d.y);
  const minVal = Math.min(...vals);
  const maxVal = Math.max(...vals);
  const padding = (maxVal - minVal) * 0.2 || 1000;

  const ctx = document.getElementById('nwTrendChart').getContext('2d');
  const grad = ctx.createLinearGradient(0,0,0,200);
  grad.addColorStop(0, 'rgba(31,170,126,.35)');
  grad.addColorStop(1, 'rgba(31,170,126,.02)');

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: chartData.map(d=>d.x),
      datasets: [{
        label: 'Net Worth',
        data: chartData.map(d=>d.y),
        borderColor: 'rgba(31,170,126,.9)',
        backgroundColor: grad,
        borderWidth: 2,
        fill: true,
        tension: 0.35,
        pointRadius: chartData.map((_,i)=>i===chartData.length-1?5:4),
        pointBackgroundColor: chartData.map((_,i)=>i===chartData.length-1?'rgba(31,170,126,1)':'rgba(31,170,126,.7)'),
        pointBorderColor: '#141414',
        pointBorderWidth: 2,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: {display:false},
        tooltip: {
          backgroundColor:'rgba(18,18,18,.95)',
          titleColor:'rgba(255,255,255,.85)',
          bodyColor:'rgba(255,255,255,.55)',
          borderColor:'rgba(255,255,255,.09)',
          borderWidth:1, padding:10,
          callbacks: {
            title: items => chartData[items[0].dataIndex].x,
            label: item => {
              const note = chartData[item.dataIndex].note;
              const lines = ['AED ' + fmt(item.parsed.y)];
              if(note) lines.push('\u201c' + note + '\u201d');
              return lines;
            }
          }
        }
      },
      scales: {
        x: {grid:{color:'rgba(255,255,255,.04)'}, border:{display:false}, ticks:{color:'rgba(255,255,255,.38)', maxTicksLimit:8}},
        y: {
          grid:{color:'rgba(255,255,255,.05)'}, border:{display:false},
          ticks:{color:'rgba(255,255,255,.38)', callback:v=>'AED '+Math.round(v/1000)+'k'},
          suggestedMin: minVal - padding,
          suggestedMax: maxVal + padding,
        }
      }
    }
  });
}

/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
   AI Insight Widget
   - Calls Claude (claude-haiku-4-5-20251001) with a compact
     financial snapshot to generate one contextual observation
   - Result cached in localStorage keyed by today's date
   - Re-fetch on manual refresh or when date changes
   - API key stored in localStorage -- never leaves the device
   \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */
const AI_KEY_STORE   = 'lifeos_anthropic_key';
const AI_INS_STORE   = 'lifeos_ai_insight';
const AI_PROXY_STORE = 'lifeos_ai_proxy_url';

function aiGetKey(){ return localStorage.getItem(AI_KEY_STORE)||''; }
function aiSetKey(k){ localStorage.setItem(AI_KEY_STORE, k.trim()); }
function aiGetProxy(){ return localStorage.getItem(AI_PROXY_STORE)||''; }
function aiSetProxy(u){ localStorage.setItem(AI_PROXY_STORE, u.trim()); }

function aiFinancialContext(){
  const now  = new Date();
  const active = items.filter(i=>i.status==='active'&&!i.isTrial&&billActiveInCycle(i));
  const monthly = active.reduce((s,i)=>s+toMonthly(i.amount,i.cycle),0);
  const paidThisCycle = payments.filter(p=>inCycle(p.date));
  const paidAmt = paidThisCycle.reduce((s,p)=>s+p.amount,0);
  const unpaid = active.filter(i=>!isPaidThisCycle(i));
  const overdue = active.filter(i=>isOverdueCycle(i));
  // Previous cycle comparison
  const prevEnd = new Date(cycleStart()); prevEnd.setDate(prevEnd.getDate()-1);
  const prevStart = cycleStart(prevEnd);
  const prevPaid = payments.filter(p=>{const d=new Date(p.date);return d>=prevStart&&d<=prevEnd;}).reduce((s,p)=>s+p.amount,0);
  // Upcoming 7 days
  const upcoming7 = active.filter(i=>{
    if(!i.dueDay||isPaidThisCycle(i))return false;
    const diff=Math.ceil((dueDateInCycle(i.dueDay)-now)/(1000*60*60*24));
    return diff>=0&&diff<=7;
  });
  const assets  = accounts.reduce((s,a)=>s+(parseFloat(a.balance)||0),0);
  const liabs   = loans.filter(l=>!l.paidOff).reduce((s,l)=>s+lnRemainingBalance(l),0);
  const net     = assets-liabs;
  const topBills = active.slice().sort((a,b)=>toMonthly(b.amount,b.cycle)-toMonthly(a.amount,a.cycle))
    .slice(0,6).map(i=>i.name+' AED '+Math.round(toMonthly(i.amount,i.cycle))+'/mo'+(isPaidThisCycle(i)?'[paid]':''));
  const activeGoals = goals.filter(g=>g.status!=='done'&&g.target>0).map(g=>{
    const pct=Math.round((g.current||0)/g.target*100);
    const dl=g.deadline?Math.ceil((new Date(g.deadline)-now)/(1000*60*60*24)):null;
    return g.name+': '+pct+'% of AED '+Math.round(g.target)+(dl!==null?' ('+dl+'d left)':'');
  });
  const activeLoans = loans.filter(l=>!l.paidOff).map(l=>{
    const rem=Math.round(lnRemainingBalance(l));
    const emi=Math.round(l.emiOverride||lnCalcMonthlyEMI(l.principal,l.rate,l.tenure));
    const mo=lnMonthsRemaining(l);
    return l.name+': AED '+rem+' remaining, AED '+emi+'/mo, '+mo+' months left';
  });
  const pendingRecv=receivables?receivables.filter(r=>!r.collected):[];
  const tabbyActive=tabbyItems.filter(t=>!t.instalments.every(i=>i.paid));

  return [
    '=== CURRENT BILLING CYCLE ===',
    'Cycle: '+cycleLabel(),
    'Total monthly bills: AED '+Math.round(monthly)+' ('+active.length+' active)',
    'Paid so far: AED '+Math.round(paidAmt)+' ('+Math.round(monthly>0?paidAmt/monthly*100:0)+'% of cycle)',
    'Previous cycle total: AED '+Math.round(prevPaid)+(prevPaid>0?' -- change: AED '+(Math.round(paidAmt-prevPaid)):''),
    unpaid.length?'Unpaid this cycle: '+unpaid.map(i=>i.name+' AED '+Math.round(i.amount)).join(', '):'All bills paid this cycle!',
    overdue.length?'\u26A0 OVERDUE: '+overdue.map(i=>i.name+' AED '+Math.round(i.amount)).join(', '):'No overdue bills',
    upcoming7.length?'Due next 7 days: '+upcoming7.map(i=>i.name+' AED '+Math.round(i.amount)+' in '+Math.ceil((dueDateInCycle(i.dueDay)-now)/(1000*60*60*24))+'d').join(', '):'',
    '','=== TOP BILLS ===',
    topBills.join(' | '),
    tabbyActive.length?'Tabby active: '+tabbyActive.length+' plans':'',
    '','=== ACCOUNTS & NET WORTH ===',
    'Assets: AED '+Math.round(assets)+' | Liabilities: AED '+Math.round(liabs)+' | Net worth: AED '+Math.round(net),
    accounts.slice().sort((a,b)=>(parseFloat(b.balance)||0)-(parseFloat(a.balance)||0)).slice(0,4)
      .map(a=>a.name+' AED '+Math.round(parseFloat(a.balance)||0)).join(' | '),
    '','=== LOANS ===',
    activeLoans.length?activeLoans.join(' | '):'No active loans',
    '','=== GOALS ===',
    activeGoals.length?activeGoals.join(' | '):'No active goals',
    pendingRecv.length?'Money owed to you: AED '+Math.round(pendingRecv.reduce((s,r)=>s+(parseFloat(r.amount)||0),0))+' from '+pendingRecv.length+' people':'',
    'Today: '+now.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'}),
  ].filter(Boolean).join('\n');
}

async function aiFetchInsight(force){
  const today = new Date().toISOString().slice(0,10);
  if(!force){
    try{
      const cached=JSON.parse(localStorage.getItem(AI_INS_STORE)||'{}');
      if(cached.date===today&&cached.insights) return cached.insights;
    }catch(e){}
  }
  const key=aiGetKey();
  const proxyUrl=aiGetProxy();
  if(!proxyUrl && !key) return null;
  if(!proxyUrl && key && !key.startsWith('sk-ant-')) throw new Error('Invalid API key format -- key should start with sk-ant-');

  const context=aiFinancialContext();
  const prompt=`You are a proactive personal finance analyst. Analyse this user's LifeOS data and return 4-5 specific, actionable insights they can act on TODAY.

Return ONLY a valid JSON array. No markdown, no explanation, just the array.
Each object must have exactly these fields:
- "category": one of "alert", "opportunity", "trend", "tip"
- "icon": one relevant emoji
- "title": 3-5 word summary
- "text": 1-2 sentences using REAL names and REAL numbers from the data. Be specific.
- "action": one concrete next step (max 10 words)

Rules:
- alert = urgent problem needing immediate action (overdue bill, low balance vs upcoming bills, missed payment, loan urgency)
- opportunity = specific money-saving or money-making action (cancel X, pay off Y early, move money to earn more)
- trend = pattern over time with specific numbers (spending up/down vs last cycle, goal velocity, net worth change)
- tip = specific actionable advice based on their actual situation (not generic advice)
- Never say "consider" or "you might want to" -- be direct
- Use actual bill/account/goal/loan names from the data

User data:
${context}`;

  const endpoint = proxyUrl || 'https://api.anthropic.com/v1/messages';
  const headers = {'Content-Type':'application/json'};
  if(!proxyUrl){
    // Direct call -- requires browser CORS support (may fail on some origins)
    headers['x-api-key'] = key;
    headers['anthropic-version'] = '2023-06-01';
    headers['anthropic-dangerous-allow-browser'] = 'true';
  }
  let resp;
  try{
    resp=await fetch(endpoint,{
      method:'POST',
      headers,
      body:JSON.stringify({
        model:'claude-haiku-4-5-20251001',
        max_tokens:800,
        messages:[{role:'user',content:prompt}],
      }),
    });
  }catch(netErr){
    if(location.protocol==='file:') throw new Error('Open via GitHub Pages -- browsers block API calls from local files.');
    if(!proxyUrl) throw new Error('CORS blocked. Set up a proxy in Settings -> AI Proxy URL and try again.');
    throw new Error('Could not reach proxy at '+endpoint+'. Check the URL is correct. ('+netErr.message+')');
  }
  if(!resp.ok){
    let errMsg='API error '+resp.status;
    try{const e=await resp.json();errMsg=e?.error?.message||errMsg;}catch(e){}
    if(resp.status===401) errMsg='Invalid API key -- please re-enter your key.';
    if(resp.status===403) errMsg='API key does not have permission -- check your Anthropic account.';
    if(resp.status===529) errMsg='Anthropic API is overloaded -- try again in a moment.';
    throw new Error(errMsg);
  }
  const data=await resp.json();
  const raw=(data.content||[]).map(b=>b.text||'').join('').trim();
  const clean=raw.replace(/^```json\s*/,'').replace(/^```\s*/,'').replace(/```\s*$/,'').trim();
  const insights=JSON.parse(clean);
  localStorage.setItem(AI_INS_STORE,JSON.stringify({date:today,insights,savedAt:new Date().toISOString()}));
  return insights;
}

/* \u2500\u2500 Widget render \u2500\u2500 */
function dbWidgetAIInsight(el){
  dbCard(el,{icon:'&#10024;',title:'AI insights',badgeCls:'db-badge-purple',headColor:'rgba(155,127,232,.08)'});
  const body=document.getElementById('dbwb-aiinsight');
  if(!body)return;
  const key=aiGetKey();
  const proxyUrl=aiGetProxy();
  if(!key && !proxyUrl){
    body.innerHTML=
      '<div class="ai-insight-body">'+
        '<div style="font-size:12px;color:var(--text2);margin-bottom:8px">'+
          'Enter your <a href="https://console.anthropic.com/settings/keys" style="color:var(--accent)">Anthropic API key</a> to get actionable daily insights.'+
        '</div>'+
        '<div class="ai-insight-key-row">'+
          '<input class="ai-insight-key-input" type="password" placeholder="sk-ant-...">'+
          '<button class="ai-insight-save-btn" onclick="aiSaveKeyAndRun()">Save &amp; run</button>'+
        '</div>'+
        '<div style="font-size:10px;color:var(--text3);margin-top:6px">Key stored only in your browser.</div>'+
      '</div>';
    return;
  }
  body.innerHTML=
    '<div class="ai-insight-body">'+
      '<div class="ai-insight-text loading">'+
        '<div class="ai-insight-loading-dot"></div>'+
        '<div class="ai-insight-loading-dot"></div>'+
        '<div class="ai-insight-loading-dot"></div>'+
        '<span style="margin-left:6px">Analysing your finances\u2026</span>'+
      '</div>'+
    '</div>';
  const today=new Date().toISOString().slice(0,10);
  let cached=null;
  try{const s=localStorage.getItem(AI_INS_STORE);if(s){const p=JSON.parse(s);if(p.date===today&&p.insights)cached=p.insights;}}catch(e){}
  if(cached){aiShowInsights(body,cached,false);}
  else{
    aiFetchInsight(false).then(ins=>{
      if(ins)aiShowInsights(body,ins,false);
      else body.innerHTML='<div class="ai-insight-body"><div style="font-size:12px;color:var(--text3)">Could not generate insights. Check your API key.</div></div>';
    }).catch(e=>{
      body.innerHTML='<div class="ai-insight-body">'+
        '<div style="font-size:12px;color:var(--red);margin-bottom:10px">'+esc(e.message)+'</div>'+
        '<div class="ai-insight-key-row">'+
          '<input class="ai-insight-key-input" type="password" placeholder="Paste API key (sk-ant-...)">'+
          '<button class="ai-insight-save-btn" onclick="aiSaveKeyAndRun()">Save key</button>'+
        '</div>'+
        '<div style="display:flex;gap:10px;margin-top:8px;align-items:center">'+
          '<button class="ai-insight-refresh-btn" onclick="aiRefreshInsight()">&#8635; Try again</button>'+
          '<a href="https://console.anthropic.com/settings/keys" target="_blank" style="font-size:10px;color:var(--accent)">Get API key &#8599;</a>'+
        '</div>'+
      '</div>';
    });
  }
}

function aiShowInsights(body,insights,fresh){
  if(!Array.isArray(insights)||!insights.length){
    body.innerHTML='<div class="ai-insight-body"><div style="font-size:12px;color:var(--text3)">No insights generated.</div></div>';
    return;
  }
  const today=new Date().toISOString().slice(0,10);
  const cards=insights.map(ins=>{
    const cat=ins.category||'tip';
    const icons={alert:'\uD83D\uDEA8',opportunity:'\uD83D\uDCA1',trend:'\uD83D\uDCCA',tip:'\uD83D\uDCAC'};
    const labels={alert:'Alert',opportunity:'Opportunity',trend:'Trend',tip:'Tip'};
    return `<div class="ai-card ${cat}">
      <div class="ai-card-header">
        <span class="ai-card-icon">${ins.icon||icons[cat]||''}</span>
        <span class="ai-card-tag">${labels[cat]||cat}</span>
      </div>
      ${ins.title?`<div class="ai-card-title">${esc(ins.title)}</div>`:''}
      <div class="ai-card-text">${esc(ins.text)}</div>
      ${ins.action?`<div class="ai-card-action"><span>&#8594;</span>${esc(ins.action)}</div>`:''}
    </div>`;
  }).join('');
  body.innerHTML=
    '<div class="ai-insight-body">'+
      '<div class="ai-cards">'+cards+'</div>'+
      '<div class="ai-insight-meta">'+
        '<span>'+(fresh?'Just generated \u00B7 '+new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}):(()=>{try{const c=JSON.parse(localStorage.getItem(AI_INS_STORE)||'{}');const d=c.savedAt?new Date(c.savedAt):null;return d?'Updated '+d.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}):'Updated today';}catch(e){return 'Updated today';}})())+' \u00B7 '+insights.length+' insights</span>'+
        '<div style="display:flex;gap:8px">'+
          '<button class="ai-insight-refresh-btn" onclick="aiRefreshInsight()">&#8635; Refresh</button>'+
          '<button class="ai-insight-refresh-btn" onclick="aiShowKeyInput()">&#128273; Key</button>'+
        '</div>'+
      '</div>'+
    '</div>';
}

function aiRefreshInsight(){
  const body=document.getElementById('dbwb-aiinsight');
  if(!body)return;
  body.innerHTML='<div class="ai-insight-body"><div class="ai-insight-text loading"><div class="ai-insight-loading-dot"></div><div class="ai-insight-loading-dot"></div><div class="ai-insight-loading-dot"></div><span style="margin-left:6px">Refreshing\u2026</span></div></div>';
  aiFetchInsight(true).then(ins=>{
    if(ins)aiShowInsights(body,ins,true);
    else body.innerHTML='<div class="ai-insight-body"><div style="font-size:12px;color:var(--text3)">Could not fetch insights.</div></div>';
  }).catch(e=>{
    body.innerHTML='<div class="ai-insight-body"><div style="font-size:12px;color:var(--red)">Error: '+esc(e.message)+'</div></div>';
  });
}

function aiShowKeyInput(){
  const body=document.getElementById('dbwb-aiinsight');if(!body)return;
  const cur=aiGetKey();
  body.innerHTML='<div class="ai-insight-body">'+
    '<div style="font-size:12px;color:var(--text2);margin-bottom:6px">'+(cur?'Current key: <span style="font-family:var(--mono);font-size:11px;color:var(--text3)">sk-ant-\u2026'+cur.slice(-6)+'</span>':'No key set')+'</div>'+
    '<div class="ai-insight-key-row"><input class="ai-insight-key-input" type="password" placeholder="Paste new key"><button class="ai-insight-save-btn" onclick="aiSaveKeyAndRun()">Save</button></div>'+
    '<div style="display:flex;gap:8px;margin-top:8px">'+
      (cur?'<button class="ai-insight-refresh-btn" onclick="aiClearKey()" style="color:var(--red)">&#128465; Remove</button>':'')+
      '<button class="ai-insight-refresh-btn" onclick="aiRefreshInsight()">&#10005; Cancel</button>'+
    '</div>'+
  '</div>';
  setTimeout(()=>{const i=document.querySelector('.ai-insight-key-input');if(i)i.focus();},50);
}

function aiClearKey(){
  if(!confirm('Remove API key?'))return;
  localStorage.removeItem(AI_KEY_STORE);localStorage.removeItem(AI_INS_STORE);
  dbWidgetAIInsight(document.getElementById('dbw-aiinsight'));
}

function aiSaveKeyAndRun(){
  const inp=document.querySelector('.ai-insight-key-input');
  if(!inp||!inp.value.trim()){inp&&inp.focus();return;}
  aiSetKey(inp.value);
  localStorage.removeItem(AI_INS_STORE);
  const widgetEl=document.getElementById('dbw-aiinsight');
  if(widgetEl)try{dbWidgetAIInsight(widgetEl);}catch(e){}
}

/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
   Dashboard edit mode -- drag to reorder + show/hide
   Widget order & visibility stored in localStorage.
   \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */
const DB_LAYOUT_KEY = 'lifeos_db_layout';
let _dbEditing = false;
let _dbDragSrc = null;  // widget id being dragged

/* \u2500\u2500 Load saved layout -> returns [{id, visible}] \u2500\u2500 */
function dbLoadLayout(){
  try{
    const saved = JSON.parse(localStorage.getItem(DB_LAYOUT_KEY)||'[]');
    if(saved.length) return saved;
  }catch(e){}
  // Default: all visible in original order
  return DB_WIDGETS.map(w=>({id:w.id, visible:true}));
}

function dbSaveLayout(layout){
  localStorage.setItem(DB_LAYOUT_KEY, JSON.stringify(layout));
}

/* \u2500\u2500 Get ordered list of widgets with visibility \u2500\u2500 */
function dbGetOrderedWidgets(){
  const layout = dbLoadLayout();
  // Merge saved layout with current DB_WIDGETS (handles new widgets added after layout saved)
  const layoutMap = Object.fromEntries(layout.map(l=>[l.id,l]));
  const ordered = layout
    .filter(l=>DB_WIDGETS.find(w=>w.id===l.id))           // remove stale entries
    .map(l=>({...DB_WIDGETS.find(w=>w.id===l.id), visible:l.visible}));
  // Append any new widgets not in saved layout
  DB_WIDGETS.forEach(w=>{ if(!layoutMap[w.id]) ordered.push({...w, visible:true}); });
  return ordered;
}

/* \u2500\u2500 Override renderDashboard to respect order + visibility \u2500\u2500 */
const _origRenderDashboard = renderDashboard;
renderDashboard = function(){
  dbGreeting();
  const grid = document.getElementById('db-grid');
  grid.innerHTML = '';
  const ordered = dbGetOrderedWidgets();
  ordered.forEach(w=>{
    const div = document.createElement('div');
    div.className = `db-widget db-w${w.cols}`;
    div.id = 'dbw-'+w.id;
    div.dataset.wid = w.id;
    if(!w.visible) div.classList.add('hidden-widget');
    // Edit overlay (drag handle + show/hide)
    const overlay = document.createElement('div');
    overlay.className = 'db-widget-edit-overlay';
    const _oh = document.createElement('div');
    _oh.className = 'db-drag-handle';
    _oh.innerHTML = '&#8942;&#8942;';
    const _ob = document.createElement('button');
    _ob.className = 'db-vis-btn';
    _ob.title = (w.visible?'Hide':'Show')+' widget';
    _ob.innerHTML = w.visible?'&#128065;':'&#128683;';
    _ob.onclick = (function(id){return function(){dbToggleVisible(id);};})(w.id);
    overlay.appendChild(_oh);
    overlay.appendChild(_ob);
    div.appendChild(overlay);
    grid.appendChild(div);
    if(w.visible){
      try{ w.render(div); }catch(e){ div.innerHTML='<div class="db-empty">Widget error</div>'; }
    } else {
      // Placeholder for hidden widget
      const ph = document.createElement('div');
      ph.style.cssText='padding:16px;font-size:12px;color:var(--text3);text-align:center;opacity:.6';
      ph.textContent = w.id.charAt(0).toUpperCase()+w.id.slice(1)+' (hidden)';
      div.appendChild(ph);
    }
    // Drag events
    div.draggable = false; // only enabled in edit mode
    div.addEventListener('dragstart', dbOnDragStart);
    div.addEventListener('dragover',  dbOnDragOver);
    div.addEventListener('dragleave', dbOnDragLeave);
    div.addEventListener('drop',      dbOnDrop);
    div.addEventListener('dragend',   dbOnDragEnd);
  });
  // Apply edit mode state if active
  if(_dbEditing) grid.classList.add('db-editing');
};

/* \u2500\u2500 Toggle edit mode \u2500\u2500 */
function dbToggleEditMode(){
  _dbEditing = !_dbEditing;
  const grid = document.getElementById('db-grid');
  const bar  = document.getElementById('db-edit-bar');
  const btn  = document.getElementById('db-edit-btn');
  if(_dbEditing){
    grid.classList.add('db-editing');
    bar.classList.add('visible');
    btn.classList.add('active');
    btn.innerHTML = '&#10005; Exit edit';
    // Enable dragging on all widgets
    grid.querySelectorAll('.db-widget').forEach(el=>{ el.draggable=true; });
  } else {
    grid.classList.remove('db-editing');
    bar.classList.remove('visible');
    btn.classList.remove('active');
    btn.innerHTML = '&#9998; Customise';
    grid.querySelectorAll('.db-widget').forEach(el=>{ el.draggable=false; });
    toast('\u2713 Dashboard layout saved');
  }
}

/* \u2500\u2500 Toggle widget visibility \u2500\u2500 */
function dbToggleVisible(wid){
  const layout = dbGetOrderedWidgets().map(w=>({id:w.id, visible:w.id===wid ? !w.visible : w.visible}));
  dbSaveLayout(layout);
  renderDashboard();
  // Re-enable edit mode after re-render
  if(_dbEditing){
    const grid = document.getElementById('db-grid');
    grid.classList.add('db-editing');
    grid.querySelectorAll('.db-widget').forEach(el=>{ el.draggable=true; });
    document.getElementById('db-edit-bar').classList.add('visible');
  }
}

/* \u2500\u2500 Drag and drop \u2500\u2500 */
function dbOnDragStart(e){
  _dbDragSrc = this;
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', this.dataset.wid);
}
function dbOnDragOver(e){
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  if(this !== _dbDragSrc) this.classList.add('drag-over');
}
function dbOnDragLeave(){
  this.classList.remove('drag-over');
}
function dbOnDrop(e){
  e.preventDefault();
  this.classList.remove('drag-over');
  if(!_dbDragSrc || _dbDragSrc===this) return;
  // Reorder in layout
  const srcId  = _dbDragSrc.dataset.wid;
  const dstId  = this.dataset.wid;
  const layout = dbGetOrderedWidgets().map(w=>({id:w.id, visible:w.visible}));
  const srcIdx = layout.findIndex(l=>l.id===srcId);
  const dstIdx = layout.findIndex(l=>l.id===dstId);
  if(srcIdx<0||dstIdx<0) return;
  const [moved] = layout.splice(srcIdx,1);
  layout.splice(dstIdx,0,moved);
  dbSaveLayout(layout);
  // Re-render keeping edit mode alive
  _dbEditing = false; // temporarily off so renderDashboard won't re-add class prematurely
  renderDashboard();
  _dbEditing = true;
  const grid=document.getElementById('db-grid');
  grid.classList.add('db-editing');
  grid.querySelectorAll('.db-widget').forEach(el=>{ el.draggable=true; });
  document.getElementById('db-edit-bar').classList.add('visible');
  document.getElementById('db-edit-btn').classList.add('active');
  document.getElementById('db-edit-btn').innerHTML='&#10005; Exit edit';
}
function dbOnDragEnd(){
  this.classList.remove('dragging');
  document.querySelectorAll('.db-widget').forEach(el=>el.classList.remove('drag-over'));
  _dbDragSrc = null;
}

/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
   Sidebar nav -- dynamic render + drag-to-reorder + hide
   \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */
const NAV_LAYOUT_KEY = 'lifeos_nav_layout';
let _navEditing = false;
let _navDragSrc = null;

// Master nav definition -- ground truth for all pages
const NAV_ITEMS = [
  {id:'links',    icon:'&#128279;', label:'Links',            section:'Launchpad'},
  {id:'shopping', icon:'&#128722;', label:'Shopping',         section:'Productivity'},
  {id:'tasks',    icon:'&#9635;',  label:'Tasks',            section:'Productivity'},
  {id:'goals',    icon:'&#9651;',  label:'Goals',            section:'Productivity'},
  {id:'active',   icon:'&#9672;',  label:'Monthly Expenses', section:'Finances'},
  {id:'tabby',    icon:'&#9681;',  label:'Tabby',            section:'Finances'},
  {id:'trials',   icon:'&#9203;',  label:'Free trials',      section:'Finances'},
  {id:'accounts', icon:'&#127981;',label:'Accounts',         section:'Finances'},
  {id:'loans',    icon:'&#127968;',label:'Loans',            section:'Finances'},
  {id:'receivables',icon:'&#9775;', label:'Receivables',      section:'Finances'},
  {id:'networth', icon:'&#10022;', label:'Net Worth',        section:'Finances'},
  {id:'history',  icon:'&#9719;',  label:'History',          section:'Tools'},
  {id:'insights', icon:'&#9673;',  label:'Insights',         section:'Tools'},
  {id:'calendar', icon:'&#9744;',  label:'Calendar',         section:'Tools'},
  {id:'notes',    icon:'&#9998;',  label:'Notes',            section:'Tools'},
  {id:'calc',     icon:'&#8862;',  label:'Calculator',       section:'Tools'},
];

function navLoadLayout(){
  try{
    const saved = JSON.parse(localStorage.getItem(NAV_LAYOUT_KEY)||'[]');
    if(saved.length){
      const savedMap = Object.fromEntries(saved.map(s=>[s.id,s]));
      // Remove stale saved items
      const filtered = saved
        .filter(s=>NAV_ITEMS.find(n=>n.id===s.id))
        .map(s=>({...NAV_ITEMS.find(n=>n.id===s.id), visible:s.visible!==false}));
      // Insert new items at their correct position from NAV_ITEMS
      NAV_ITEMS.forEach((n, idx)=>{
        if(!savedMap[n.id]){
          // Find insertion point: after the last saved item that appears before this in NAV_ITEMS
          let insertAt = 0;
          for(let i=idx-1;i>=0;i--){
            const prevId = NAV_ITEMS[i].id;
            const pos = filtered.findIndex(f=>f.id===prevId);
            if(pos>=0){ insertAt=pos+1; break; }
          }
          filtered.splice(insertAt,0,{...n,visible:true});
        }
      });
      return filtered;
    }
  }catch(e){}
  return NAV_ITEMS.map(n=>({...n,visible:true}));
}

function navSaveLayout(){
  const items = navLoadLayout().map(n=>({id:n.id,visible:n.visible}));
  localStorage.setItem(NAV_LAYOUT_KEY, JSON.stringify(items));
}

/* \u2500\u2500 Render the nav (called on load + after any change) \u2500\u2500 */
function renderNav(){
  const wrap = document.getElementById('nav-sections-wrap');
  if(!wrap) return;
  const items = navLoadLayout();

  // Group by section preserving order
  const sections = [];
  const sectionMap = {};
  items.forEach(item=>{
    if(!sectionMap[item.section]){
      sectionMap[item.section] = [];
      sections.push({name:item.section, items:sectionMap[item.section]});
    }
    sectionMap[item.section].push(item);
  });

  wrap.innerHTML = '';
  sections.forEach(sec=>{
    const secDiv = document.createElement('div');
    secDiv.className = 'nav-section-wrap';
    secDiv.dataset.section = sec.name;

    // Section label
    const label = document.createElement('div');
    label.className = 'nav-section-edit-label' + (_navEditing?' editing':'');
    label.textContent = sec.name;
    secDiv.appendChild(label);

    // Nav items
    sec.items.forEach(item=>{
      const btn = document.createElement('button');
      btn.id = 'nav-'+item.id;
      let cls = 'nav-item';
      if(_navEditing) cls += ' nav-draggable';
      if(!item.visible) cls += ' nav-hidden-item';
      if(currentPage===item.id) cls += ' active';
      btn.className = cls;
      btn.dataset.navid = item.id;

      if(_navEditing){
        btn.innerHTML =
          '<span class="nav-item-drag-handle">&#8942;&#8942;</span>'+
          '<span class="nav-icon">'+item.icon+'</span>'+
          '<span class="nav-label"> '+item.label+'</span>'+
          '<button class="nav-item-vis-btn" onclick="navToggleVisible(\''+item.id+'\');event.stopPropagation()" title="'+(item.visible?'Hide':'Show')+'">'+
            (item.visible?'&#128065;':'&#128683;')+
          '</button>';
        btn.draggable = true;
        btn.addEventListener('dragstart', navDragStart);
        btn.addEventListener('dragover',  navDragOver);
        btn.addEventListener('dragleave', navDragLeave);
        btn.addEventListener('drop',      navDrop);
        btn.addEventListener('dragend',   navDragEnd);
      } else {
        btn.innerHTML =
          '<span class="nav-icon">'+item.icon+'</span>'+
          '<span class="nav-label"> '+item.label+'</span>';
        if(item.visible){
          btn.onclick = ()=>switchPage(item.id);
        } else {
          btn.onclick = null;
          btn.style.pointerEvents = 'none';
        }
      }
      secDiv.appendChild(btn);
    });
    wrap.appendChild(secDiv);
  });
}

/* \u2500\u2500 Toggle edit mode \u2500\u2500 */
function navToggleEditMode(){
  _navEditing = !_navEditing;
  // Update all nav-edit-btn instances
  document.querySelectorAll('#nav-edit-btn').forEach(btn=>{
    btn.classList.toggle('active', _navEditing);
    btn.innerHTML = _navEditing ? '&#9998; Reorder tabs (active)' : '&#9998; Reorder tabs';
  });
  // Show/hide save order button
  const saveBtn = document.getElementById('nav-save-order-btn');
  if(saveBtn) saveBtn.style.display = _navEditing ? 'block' : 'none';
  // Close settings modal when activating
  if(_navEditing) closeSettingsModal();
  renderNav();
  if(!_navEditing) toast('\u2713 Sidebar layout saved');
}

function navSaveOrder(){
  _navEditing = false;
  document.querySelectorAll('#nav-edit-btn').forEach(btn=>{
    btn.classList.remove('active');
    btn.innerHTML = '&#9998; Reorder tabs';
  });
  const saveBtn = document.getElementById('nav-save-order-btn');
  if(saveBtn) saveBtn.style.display = 'none';
  // Persist current nav order from DOM
  const wrap = document.getElementById('nav-sections-wrap');
  if(wrap){
    const order = Array.from(wrap.querySelectorAll('[data-nav-id]')).map(el=>({
      id: el.dataset.navId,
      visible: !el.classList.contains('nav-hidden')
    }));
    if(order.length) localStorage.setItem(NAV_LAYOUT_KEY, JSON.stringify(order));
  }
  renderNav();
  toast('&#10003; Sidebar order saved');
}

/* \u2500\u2500 Toggle item visibility \u2500\u2500 */
function navToggleVisible(id){
  const layout = navLoadLayout().map(n=>({id:n.id, visible:n.id===id?!n.visible:n.visible}));
  localStorage.setItem(NAV_LAYOUT_KEY, JSON.stringify(layout.map(n=>({id:n.id,visible:n.visible}))));
  renderNav();
}

/* \u2500\u2500 Drag handlers \u2500\u2500 */
function navDragStart(e){
  _navDragSrc = this;
  this.classList.add('nav-dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', this.dataset.navid);
}
function navDragOver(e){
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  if(this !== _navDragSrc && this.dataset.navid) this.classList.add('nav-drag-over');
}
function navDragLeave(){ this.classList.remove('nav-drag-over'); }
function navDrop(e){
  e.preventDefault();
  this.classList.remove('nav-drag-over');
  if(!_navDragSrc || _navDragSrc===this) return;
  const srcId = _navDragSrc.dataset.navid;
  const dstId = this.dataset.navid;
  if(!srcId||!dstId) return;
  const layout = navLoadLayout().map(n=>({id:n.id,visible:n.visible}));
  const si = layout.findIndex(n=>n.id===srcId);
  const di = layout.findIndex(n=>n.id===dstId);
  if(si<0||di<0) return;
  const [moved] = layout.splice(si,1);
  layout.splice(di,0,moved);
  localStorage.setItem(NAV_LAYOUT_KEY, JSON.stringify(layout));
  // Defer DOM rebuild until after dragend fires -- destroying elements mid-drag
  // prevents subsequent drags from working in Chrome/Firefox
  setTimeout(renderNav, 0);
}
function navDragEnd(){
  this.classList.remove('nav-dragging');
  document.querySelectorAll('.nav-item').forEach(el=>el.classList.remove('nav-drag-over'));
  _navDragSrc = null;
  // Ensure nav is re-rendered after drag ends even if drop didn't fire
  // (e.g. dropped outside a valid target)
  setTimeout(renderNav, 0);
}

/* \u2500\u2500 Paid this month -- breakdown modal \u2500\u2500 */
function showPaidBreakdown(){
  const now = new Date();
  const ym  = now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0');
  const monthPayments = payments
    .filter(p=>inCycle(p.date))
    .slice().sort((a,b)=>new Date(b.date)-new Date(a.date));
  const total = monthPayments.reduce((s,p)=>s+p.amount,0);
  const monthLabel = cycleLabel();

  // Build rows
  const rows = monthPayments.map(p=>{
    // Find original item to get colour
    const item = items.find(i=>i.id===p.itemId)||{color:'#888',cat:p.cat||''};
    const color = item.color || CATCOLORS[item.cat] || '#888';
    const dateStr = p.date ? new Date(p.date+'T12:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short'}) : '';
    return `<div class="paid-row">
      <div class="paid-row-dot" style="background:${color}"></div>
      <div class="paid-row-name">${esc(p.name||'Unknown')}</div>
      <div class="paid-row-cat">${esc(p.cat||'')}</div>
      <div class="paid-row-date">${dateStr}</div>
      <div class="paid-row-amt">AED ${fmt(p.amount)}</div>
    </div>`;
  }).join('');

  const html = `
    <div class="paid-breakdown-modal" id="paid-breakdown-modal" onclick="if(event.target===this)closePaidBreakdown()">
      <div class="paid-breakdown-box">
        <div class="paid-breakdown-head">
          <div class="paid-breakdown-title">Paid in ${monthLabel}</div>
          <button class="modal-close-btn" onclick="closePaidBreakdown()">&#10005;</button>
        </div>
        <div class="paid-breakdown-body">
          ${rows||'<div style="text-align:center;padding:2rem;color:var(--text3);font-size:13px">No payments recorded this month yet.</div>'}
        </div>
        <div class="paid-breakdown-foot">
          <span class="paid-breakdown-total">Total: AED ${fmt(total)}</span>
          <span style="font-size:11px;color:var(--text3)">${monthPayments.length} payment${monthPayments.length!==1?'s':''}</span>
        </div>
      </div>
    </div>`;

  // Inject into body
  const existing = document.getElementById('paid-breakdown-modal');
  if(existing) existing.remove();
  document.body.insertAdjacentHTML('beforeend', html);
}

function closePaidBreakdown(){
  const el = document.getElementById('paid-breakdown-modal');
  if(el) el.remove();
}

/* \u2500\u2500 Highlight a specific bill from the reminder banner \u2500\u2500 */
function highlightLoan(loanId){
  switchPage('loans');
  setTimeout(function(){
    const el = document.getElementById('loan-'+loanId);
    if(!el) return;
    el.scrollIntoView({behavior:'smooth', block:'center'});
    el.classList.remove('loan-highlight');
    void el.offsetWidth;
    el.classList.add('loan-highlight');
    el.addEventListener('animationend', function onEnd(){
      el.classList.remove('loan-highlight');
      el.removeEventListener('animationend', onEnd);
    });
  }, 120);
}

function highlightBill(itemId){
  switchPage('active');
  // Wait for render then scroll + pulse
  setTimeout(function(){
    const el = document.getElementById('bill-'+itemId);
    if(!el) return;
    el.scrollIntoView({behavior:'smooth', block:'center'});
    el.classList.remove('bill-highlight'); // reset if already animating
    void el.offsetWidth; // force reflow
    el.classList.add('bill-highlight');
    setTimeout(function(){ el.classList.remove('bill-highlight'); }, 2000);
  }, 120);
}

/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
   Sidebar resize
   Drag the right edge to any width between 160px and 420px.
   Width stored in localStorage and applied via CSS var.
   \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */
const SIDEBAR_W_KEY = 'lifeos_sidebar_w';
const SIDEBAR_MIN   = 160;
const SIDEBAR_MAX   = 420;

function sidebarApplyWidth(w){
  document.documentElement.style.setProperty('--sidebar-w', w+'px');
}

function sidebarLoadWidth(){
  const saved = parseInt(localStorage.getItem(SIDEBAR_W_KEY));
  if(saved && saved >= SIDEBAR_MIN && saved <= SIDEBAR_MAX){
    sidebarApplyWidth(saved);
  }
}

(function sidebarResizeInit(){
  const handle = document.getElementById('sidebar-resize-handle');
  if(!handle) return;
  let startX, startW;

  handle.addEventListener('mousedown', function(e){
    e.preventDefault();
    const app = document.getElementById('app');
    if(app && app.classList.contains('collapsed')) return; // don't resize when collapsed
    startX = e.clientX;
    startW = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sidebar-w')) || 220;
    handle.classList.add('dragging');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    function onMove(e){
      const delta = e.clientX - startX;
      const newW  = Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, startW + delta));
      sidebarApplyWidth(newW);
    }
    function onUp(){
      handle.classList.remove('dragging');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      // Save width
      const w = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sidebar-w'));
      localStorage.setItem(SIDEBAR_W_KEY, w);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });

  // Touch support
  handle.addEventListener('touchstart', function(e){
    const app = document.getElementById('app');
    if(app && app.classList.contains('collapsed')) return;
    startX = e.touches[0].clientX;
    startW = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sidebar-w')) || 220;
    handle.classList.add('dragging');
    function onTouch(e){ 
      const delta = e.touches[0].clientX - startX;
      sidebarApplyWidth(Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, startW + delta)));
    }
    function onEnd(){
      handle.classList.remove('dragging');
      const w = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sidebar-w'));
      localStorage.setItem(SIDEBAR_W_KEY, w);
      document.removeEventListener('touchmove', onTouch);
      document.removeEventListener('touchend', onEnd);
    }
    document.addEventListener('touchmove', onTouch, {passive:true});
    document.addEventListener('touchend', onEnd);
  }, {passive:true});
})();

sidebarLoadWidth();
function saveProxyUrl(){
  const inp = document.getElementById('ai-proxy-input');
  if(!inp) return;
  aiSetProxy(inp.value);
  localStorage.removeItem(AI_INS_STORE); // clear cached error/insight
  toast('Proxy URL saved &#10003;');
  // Re-render widget now
  const w = document.getElementById('dbw-aiinsight');
  if(w) setTimeout(()=>{ try{ dbWidgetAIInsight(w); }catch(e){} }, 200);
}

function loadProxyUrl(){
  ['ai-proxy-input'].forEach(id=>{
    const inp = document.getElementById(id);
    if(inp) inp.value = aiGetProxy();
  });
}


/* \u2500\u2500 Settings modal \u2500\u2500 */
function toggleSettingsVerPanel(){
  const panel = document.getElementById('settings-ver-panel');
  const btn   = document.getElementById('settings-ver-btn');
  if(!panel) return;
  if(panel.style.display==='none'){
    // Render versions inline
    renderVerPanel(panel);
    panel.style.display='block';
    if(btn) btn.innerHTML='&#9719; Data versions &#9650;';
  } else {
    panel.style.display='none';
    if(btn) btn.innerHTML='&#9719; Data versions';
  }
}

function renderVerPanel(container){
  if(!container) return;
  let versions = [];
  try{ versions = JSON.parse(localStorage.getItem(KEY_VER)||'[]'); }catch(e){}
  if(!versions.length){
    container.innerHTML='<div style="font-size:11px;color:var(--text3);padding:8px 0">No snapshots yet.</div>';
    return;
  }
  container.innerHTML = versions.map((v,i)=>{
    const d = new Date(v.ts);
    const dateStr = d.toLocaleDateString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
    const isCurrent = i===0;
    const displayLabel = v.autoLabel || dateStr;
    return '<div class="ver-list-item">'
      + '<div class="ver-list-dot" style="background:'+(isCurrent?'var(--positive)':'var(--border2)')+'"></div>'
      + '<div style="flex:1;min-width:0">'
        + '<input class="ver-name-input" type="text" placeholder="Add a label\u2026" '
          + 'value="'+(v.name||'').replace(/"/g,'&quot;')+'" '
          + 'data-ver-ts="'+v.ts+'" '
          + 'onchange="verSaveNameByTs(this.dataset.verTs,this.value)" '
          + 'onblur="verSaveNameByTs(this.dataset.verTs,this.value)" '
          + 'style="width:100%;font-size:12px;font-weight:500">'
        + '<div style="font-size:10px;color:var(--text3);margin-top:2px">'
          + dateStr
          + (isCurrent?' \u00B7 <span style="color:var(--positive);font-weight:600">current</span>':'')
        +'</div>'
        + (v.diff?'<div style="font-size:10px;color:var(--accent);margin-top:2px">'+esc(v.diff)+'</div>':'')
      +'</div>'
      + (isCurrent?''
        :'<button data-ver-ts="'+v.ts+'" class="ver-restore-settings-btn" style="height:22px;padding:0 8px;border-radius:5px;border:0.5px solid var(--border2);background:var(--surface3);color:var(--text2);font-size:10px;cursor:pointer;flex-shrink:0;margin-top:2px">Restore</button>')
    +'</div>';
  }).join('');
  container.onclick = function(e){
    const btn = e.target.closest('.ver-restore-settings-btn');
    if(btn) verRestoreFromSettings(btn.dataset.verTs);
  };
}

function verSaveNameByTs(ts, name){
  let versions = getVersions();
  const v = versions.find(x=>String(x.ts)===String(ts));
  if(!v) return;
  v.name = name.trim();
  localStorage.setItem(KEY_VER, JSON.stringify(versions));
}


function verRestoreFromSettings(ts){
  const versions = getVersions();
  const idx = versions.findIndex(x=>String(x.ts)===String(ts));
  if(idx<0) return;
  const d = new Date(versions[idx].ts);
  const label = d.toLocaleString('en-GB',{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
  if(!confirm('Restore to snapshot from '+label+'?\n\nThis will replace all current data.')) return;
  closeSettingsModal();
  verRestore(idx);
}

function openSettingsModal(){
  updateCyclePreview();
  loadProxyUrl();
  ghLoadSettings();
  document.getElementById('settings-modal').style.display='flex';
  const keyInp = document.getElementById('ai-key-input-settings');
  const cur = aiGetKey();
  if(keyInp) keyInp.placeholder = cur ? 'sk-ant-\u2026'+cur.slice(-6) : 'sk-ant-...';
  // Sync auto-save status
  const dot = document.getElementById('settings-as-dot');
  const txt = document.getElementById('settings-as-status-text');
  const srcDot = document.getElementById('as-dot');
  const srcTxt = document.getElementById('as-status-text');
  if(dot&&srcDot) dot.className = srcDot.className;
  if(txt&&srcTxt) txt.textContent = srcTxt.textContent;
  updateSettingsInstallState();
}
function closeSettingsModal(){
  document.getElementById('settings-modal').style.display='none';
}
function settingsInstallApp(){
  if(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches){
    toast('Already installed');
    updateSettingsInstallState();
    return;
  }
  if(_pwaDeferredPrompt){
    try{_pwaDeferredPrompt.prompt();}catch(_){}
    _pwaDeferredPrompt.userChoice.then(function(c){
      if(c && c.outcome==='accepted') toast('Installing\u2026');
      _pwaDeferredPrompt = null;
      updateSettingsInstallState();
    }).catch(function(){});
    return;
  }
  // Reset the 7-day dismissed cooldown so the auto-banner can reappear.
  try{localStorage.removeItem('lifeos_pwa_dismissed');}catch(_){}
  var ua = (navigator.userAgent||'').toLowerCase();
  var ios = /iphone|ipad|ipod/.test(ua) || (navigator.maxTouchPoints>1 && /mac os/.test(ua));
  if(ios){
    alert('Install on iOS:\n1. Tap the Share button (square with arrow up)\n2. Scroll down and tap "Add to Home Screen"\n3. Tap Add');
  } else {
    alert('Install on Android / desktop:\n1. Open this site in Chrome (or Edge)\n2. Tap the menu (three dots, top-right)\n3. Tap "Install app" or "Add to Home Screen"\n\nIf you don\'t see the option, the prompt may have been dismissed recently. Visit the site a few times and try again.');
  }
}
function updateSettingsInstallState(){
  var btn = document.getElementById('settings-install-btn');
  var label = document.getElementById('settings-install-label');
  var sub = document.getElementById('settings-install-sub');
  if(!btn || !label || !sub) return;
  var standalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
  if(standalone){
    label.textContent = '\u2713 Already installed';
    sub.textContent = 'Running as installed app';
    btn.style.opacity = '.65';
    btn.disabled = true;
  } else if(_pwaDeferredPrompt){
    label.textContent = 'Install LifeOS';
    sub.textContent = 'Add to home screen for offline access';
    btn.style.opacity = '1';
    btn.disabled = false;
  } else {
    label.textContent = 'Install LifeOS';
    sub.textContent = 'Tap for OS-specific instructions';
    btn.style.opacity = '1';
    btn.disabled = false;
  }
}
function aiSaveKeyFromSettings(){
  const inp = document.getElementById('ai-key-input-settings');
  if(!inp||!inp.value.trim()){inp&&inp.focus();return;}
  aiSetKey(inp.value);
  inp.value='';
  inp.placeholder='sk-ant-\u2026'+aiGetKey().slice(-6);
  localStorage.removeItem(AI_INS_STORE);
  toast('API key saved &#10003;');
}
function saveCycleDay(){
  const v = parseInt(document.getElementById('cycle-day-input').value)||1;
  const clamped = Math.min(28, Math.max(1, v));
  localStorage.setItem(CYCLE_KEY, clamped);
  document.getElementById('cycle-day-input').value = clamped;
  updateCyclePreview();
  render();
  renderDashboard();
  toast('\u2713 Billing cycle updated -- starts day ' + clamped);
}

function updateCyclePreview(){
  const inp = document.getElementById('cycle-day-input');
  const prev = document.getElementById('cycle-label-preview');
  if(!inp||!prev) return;
  const saved = parseInt(localStorage.getItem(CYCLE_KEY))||1;
  inp.value = saved;
  prev.textContent = 'Current cycle: ' + cycleLabel();
}

/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
   Receivables -- money owed TO the user
   \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */
const RECV_TYPE_COLORS = {person:'#9B7FE8', work:'#4A8ECC', other:'#888880'};
const RECV_TYPE_ICONS  = {person:'&#129309;', work:'&#127970;', other:'&#9679;'};

function openRecvModal(id){
  rvEditId = id||null;
  const r = id ? receivables.find(r=>r.id===id) : null;
  document.getElementById('recv-modal-title').textContent = r ? 'Edit receivable' : 'Add receivable';
  document.getElementById('rv-name').value    = r?.name||'';
  document.getElementById('rv-amount').value  = r?.amount||'';
  document.getElementById('rv-type').value    = r?.type||'person';
  document.getElementById('rv-from').value    = r?.from||'';
  document.getElementById('rv-date').value    = r?.date||new Date().toISOString().slice(0,10);
  document.getElementById('rv-due').value     = r?.dueDate||'';
  document.getElementById('rv-notes').value   = r?.notes||'';
  document.getElementById('recv-modal').style.display='flex';
  document.getElementById('rv-name').focus();
}
function closeRecvModal(){
  document.getElementById('recv-modal').style.display='none';
  rvEditId=null;
}

function saveRecv(){
  const name   = document.getElementById('rv-name').value.trim();
  const amount = parseFloat(document.getElementById('rv-amount').value);
  if(!name){document.getElementById('rv-name').focus();return;}
  if(isNaN(amount)||amount<=0){document.getElementById('rv-amount').focus();return;}
  const obj = {
    id:       rvEditId||String(Date.now()),
    name, amount,
    type:     document.getElementById('rv-type').value,
    from:     document.getElementById('rv-from').value.trim(),
    date:     document.getElementById('rv-date').value||new Date().toISOString().slice(0,10),
    dueDate:  document.getElementById('rv-due').value||null,
    notes:    document.getElementById('rv-notes').value.trim(),
    collected: rvEditId ? (receivables.find(r=>r.id===rvEditId)?.collected||false) : false,
    createdAt: rvEditId ? (receivables.find(r=>r.id===rvEditId)?.createdAt||Date.now()) : Date.now(),
  };
  if(rvEditId){ const idx=receivables.findIndex(r=>r.id===rvEditId); if(idx>-1)receivables[idx]=obj; }
  else receivables.unshift(obj);
  saveReceivables(); closeRecvModal(); renderReceivables();
  toast(rvEditId ? `Updated ${obj.name}` : `Added ${obj.name}`);
}

function markRecvCollected(id){
  const r=receivables.find(r=>r.id===id); if(!r) return;
  r.collected=!r.collected;
  r.collectedDate=r.collected?new Date().toISOString().slice(0,10):null;
  saveReceivables(); renderReceivables();
  toast(r.collected?`\u2713 Collected: ${r.name}`:`\u21b5 Reopened: ${r.name}`);
}

function deleteRecv(id){
  const r=receivables.find(r=>r.id===id); if(!r) return;
  receivables=receivables.filter(r=>r.id!==id);
  saveReceivables(); renderReceivables();
  toast(`Removed: ${r.name}`, true);
}

function toggleRecvReceipt(id){
  const r=receivables.find(x=>x.id===id);
  if(!r)return;
  r.receiptSubmitted=!r.receiptSubmitted;
  saveRecv();
  renderReceivables();
  toast(r.receiptSubmitted?'&#10003; Receipt marked as submitted':'Receipt unmarked');
}

function renderReceivables(){
  const pending   = receivables.filter(r=>!r.collected);
  const collected = receivables.filter(r=>r.collected);
  const total     = pending.reduce((s,r)=>s+(parseFloat(r.amount)||0),0);
  const overdue   = pending.filter(r=>r.dueDate&&new Date(r.dueDate)<new Date()).length;

  document.getElementById('recv-sub').textContent =
    receivables.length+' receivable'+(receivables.length!==1?'s':'')+
    (collected.length?' \u00B7 '+collected.length+' collected':'');

  document.getElementById('recv-metrics').innerHTML = `
    <div class="metric" style="border-color:var(--positive-border);background:linear-gradient(135deg,rgba(31,170,126,.07) 0%,var(--surface) 60%)">
      <div class="metric-label">Total owed to you</div>
      <div class="metric-value" style="color:var(--positive)">AED ${fmt(total)}</div>
      <div class="metric-sub">${pending.length} pending</div>
    </div>
    ${overdue?`<div class="metric red"><div class="metric-label">Overdue</div><div class="metric-value">${overdue}</div><div class="metric-sub">past due date</div></div>`:''}
    ${collected.length?`<div class="metric"><div class="metric-label">Collected</div><div class="metric-value">${collected.length}</div><div class="metric-sub">AED ${fmt(collected.reduce((s,r)=>s+(parseFloat(r.amount)||0),0))} recovered</div></div>`:''}
  `;

  const cont = document.getElementById('recv-list');
  if(!receivables.length){
    cont.innerHTML='<div class="emi-empty"><div style="font-size:32px;margin-bottom:10px;opacity:.4">&#9775;</div><div style="font-size:15px;font-weight:500;color:var(--text2);margin-bottom:6px">No receivables yet</div><div style="font-size:13px;color:var(--text3)">Track money owed to you by people or companies</div></div>';
    return;
  }

  const sortBy   = (document.getElementById('recv-sort')||{}).value||'urgency';
  const filterBy = (document.getElementById('recv-filter')||{}).value||'all';

  let vis = receivables.filter(r=>{
    if(filterBy==='pending')   return !r.collected;
    if(filterBy==='collected') return r.collected;
    if(filterBy==='person')    return r.type==='person';
    if(filterBy==='work')      return r.type==='work';
    return true;
  });

  vis = vis.slice().sort((a,b)=>{
    // Always show pending before collected
    if(a.collected!==b.collected) return a.collected?1:-1;
    if(sortBy==='amount')  return (parseFloat(b.amount)||0)-(parseFloat(a.amount)||0);
    if(sortBy==='urgency'){
      const da=a.dueDate?new Date(a.dueDate).getTime():Infinity;
      const db=b.dueDate?new Date(b.dueDate).getTime():Infinity;
      return da-db;
    }
    if(sortBy==='name')  return (a.name||'').localeCompare(b.name||'');
    if(sortBy==='added') return (b.createdAt||0)-(a.createdAt||0);
    return 0;
  });

  cont.innerHTML = '<div class="emi-grid">' + vis.map(r=>{
    const color   = RECV_TYPE_COLORS[r.type]||'#888';
    const icon    = RECV_TYPE_ICONS[r.type]||'';
    const isOD    = !r.collected && r.dueDate && new Date(r.dueDate)<new Date();
    const daysSince = Math.floor((Date.now()-new Date(r.date).getTime())/(1000*60*60*24));
    const sinceStr  = daysSince===0?'Today':daysSince===1?'Yesterday':`${daysSince}d ago`;
    const dueLbl    = r.dueDate
      ? `<span style="font-size:11px;${isOD?'color:var(--red)':'color:var(--text3)'}">
           ${isOD?'Overdue \u00B7 ':''} Due ${new Date(r.dueDate).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}
         </span>` : '';

    return `<div class="emi-card${r.collected?' emi-paid-off':''}">
      <div class="emi-card-stripe" style="background:${color}"></div>
      <div class="emi-card-head">
        <div style="min-width:0">
          <div class="emi-card-title">${icon} ${esc(r.name)}</div>
          <div class="emi-card-sub">${r.from?esc(r.from):''}${r.from&&r.type?' \u00B7 ':''}${r.type?r.type.charAt(0).toUpperCase()+r.type.slice(1):''}</div>
        </div>
        <div class="emi-actions">
          ${!r.collected?`<button class="icon-btn pay" onclick="markRecvCollected('${r.id}')" title="Mark collected">&#10003;</button>`:''}
          <button class="icon-btn" onclick="openRecvModal('${r.id}')" title="Edit">&#9998;</button>
          <button class="icon-btn del" onclick="deleteRecv('${r.id}')" title="Delete">&#10005;</button>
        </div>
      </div>
      <div class="emi-kpis">
        <div class="emi-kpi" style="grid-column:span 2">
          <div class="emi-kpi-label">Amount owed</div>
          <div class="emi-kpi-val" style="color:var(--positive)">AED ${fmt(parseFloat(r.amount)||0)}</div>
          <div class="emi-kpi-sub">${sinceStr} \u00B7 ${r.collected?'<span style="color:var(--positive)">Collected '+formatShortDate(r.collectedDate||r.date)+'</span>':'Pending'}</div>
        </div>
        <div class="emi-kpi" style="grid-column:span 2">
          <div class="emi-kpi-label">${r.dueDate?'Due date':'Lent on'}</div>
          <div class="emi-kpi-val" style="font-size:14px">${r.dueDate?new Date(r.dueDate).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):formatShortDate(r.date)}</div>
          <div class="emi-kpi-sub">${r.notes?esc(r.notes.slice(0,40))+(r.notes.length>40?'\u2026':''):''}</div>
        </div>
      </div>
      <div style="padding:8px 16px 12px;display:flex;align-items:center;gap:10px;border-top:0.5px solid var(--border);margin-top:4px">
        <button onclick="toggleRecvReceipt('${r.id}')" style="display:flex;align-items:center;gap:6px;background:${r.receiptSubmitted?'var(--positive-dim)':'var(--surface3)'};border:0.5px solid ${r.receiptSubmitted?'var(--positive-border)':'var(--border2)'};border-radius:6px;padding:4px 10px;cursor:pointer;font-size:11px;font-weight:500;color:${r.receiptSubmitted?'var(--positive)':'var(--text3)'};font-family:var(--font);transition:all .15s">
          <span style="width:14px;height:14px;border-radius:3px;border:1.5px solid ${r.receiptSubmitted?'var(--positive)':'var(--border3)'};display:flex;align-items:center;justify-content:center;font-size:9px;background:${r.receiptSubmitted?'var(--positive)':'transparent'};color:#fff">${r.receiptSubmitted?'&#10003;':''}</span>
          Receipt submitted
        </button>
        ${!r.collected&&r.dueDate?dueLbl:''}
      </div>
    </div>`;
  }).join('') + '</div>';
}


/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
   Shopping list
   \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */
let shEditId = null;

function openShopModal(id){
  shEditId = id || null;
  const s = id ? shopping.find(x=>x.id===id) : null;
  document.getElementById('shop-modal-title').textContent = s ? 'Edit item' : 'Add item';
  document.getElementById('sh-url').value    = s ? (s.url||'') : '';
  document.getElementById('sh-name').value   = s ? (s.name||'') : '';
  document.getElementById('sh-desc').value   = s ? (s.desc||'') : '';
  document.getElementById('sh-price').value  = s ? (s.price||'') : '';
  document.getElementById('sh-cat').value    = s ? (s.cat||'Electronics') : 'Electronics';
  document.getElementById('sh-priority').value = s ? (s.priority||'normal') : 'normal';
  const btn = document.getElementById('sh-extract-btn');
  if(btn) btn.disabled = !document.getElementById('sh-url').value.trim();
  // Restore store
  const storeEl = document.getElementById('sh-store');
  if(storeEl) storeEl.value = s ? (s.store||'') : '';
  // Restore image
  const imgEl = document.getElementById('sh-image');
  const thumbEl = document.getElementById('sh-image-thumb');
  const previewEl = document.getElementById('sh-image-preview');
  if(imgEl) imgEl.value = s ? (s.imageUrl||'') : '';
  if(thumbEl && previewEl){
    if(s && s.imageUrl){
      thumbEl.src = s.imageUrl;
      previewEl.style.display = 'block';
    } else {
      previewEl.style.display = 'none';
    }
  }
  const statusEl = document.getElementById('sh-extract-status');
  if(statusEl) statusEl.textContent = '';
  // Populate collection select
  const collSel=document.getElementById('sh-item-coll');
  if(collSel){
    collSel.innerHTML='<option value="">-- No collection --</option>'
      +shCollections.map(function(c){return '<option value="'+c.id+'">'+esc(c.name)+'</option>';}).join('');
    collSel.value = s ? (s.collId||'') : (shCollView!=='all'?shCollView:'');
  }
  shSwitchTab('url');
  document.getElementById('shop-modal').style.display = 'flex';
  setTimeout(()=>document.getElementById(document.getElementById('sh-url').value?'sh-name':'sh-url').focus(), 50);
}

function closeShopModal(){
  document.getElementById('shop-modal').style.display = 'none';
  shEditId = null;
}

function shUrlChanged(){
  const url = document.getElementById('sh-url').value.trim();
  const btn = document.getElementById('sh-extract-btn');
  if(btn) btn.disabled = !url;
}

async function shExtractFromUrl(){
  const url=document.getElementById('sh-url').value.trim();
  if(!url)return;
  const btn=document.getElementById('sh-extract-btn');
  const status=document.getElementById('sh-extract-status');
  const proxyUrl=aiGetProxy();
  if(!proxyUrl){
    if(status)status.textContent='URL extraction needs a proxy -- use Paste text instead';
    btn.disabled=false;
    return;
  }
  btn.disabled=true;
  if(status)status.textContent='Fetching page via proxy...';
  try{
    // Use worker /fetch-url endpoint
    const fetchEndpoint=proxyUrl.replace(/\/+$/,'')+'/fetch-url?url='+encodeURIComponent(url);
    const r=await fetch(fetchEndpoint,{signal:AbortSignal.timeout(8000)});
    if(!r.ok)throw new Error('Proxy fetch failed: '+r.status);
    const meta=await r.json();
    if(meta.error)throw new Error(meta.error);
    const pageText=['URL: '+url,
      meta.title?'Title: '+meta.title:'',
      meta.desc?'Description: '+meta.desc:'',
      meta.siteName?'Site: '+meta.siteName:'',
    ].filter(Boolean).join('\n');
    if(meta.image){
      const imgEl=document.getElementById('sh-image');
      const thumbEl=document.getElementById('sh-image-thumb');
      const previewEl=document.getElementById('sh-image-preview');
      if(imgEl)imgEl.value=meta.image;
      if(thumbEl&&previewEl){
        thumbEl.src=meta.image;
        thumbEl.onerror=function(){previewEl.style.display='none';};
        previewEl.style.display='block';
      }
    }
    // Set price from worker if available (more reliable than Claude parsing)
    if(meta.price && !isNaN(meta.price)){
      document.getElementById('sh-price').value = meta.price;
    }
    // Add price hint to page text so Claude can also try to find price
    var priceHintLine = meta.priceHint ? 'Price hint: '+meta.priceHint : '';
    var fullPageText = [pageText, priceHintLine].filter(Boolean).join('\n');
    if(status)status.textContent='Analysing with AI...';
    await shCallClaudeExtract(fullPageText, status, !meta.price);
  }catch(e){
    if(status)status.textContent='URL fetch failed -- try Paste text instead';
    toast('URL extract failed: '+e.message);
  }
  btn.disabled=false;
}


async function shCallClaudeExtract(pageText,statusEl,extractPrice){
  const key=aiGetKey(),proxyUrl=aiGetProxy();
  if(!key&&!proxyUrl){toast('Set up API key or proxy in Settings');return;}
  const endpoint=proxyUrl||'https://api.anthropic.com/v1/messages';
  const headers={'Content-Type':'application/json'};
  if(!proxyUrl){headers['x-api-key']=key;headers['anthropic-version']='2023-06-01';headers['anthropic-dangerous-allow-browser']='true';}
  const resp=await fetch(endpoint,{method:'POST',headers,body:JSON.stringify({
    model:'claude-haiku-4-5-20251001',max_tokens:400,
    messages:[{role:'user',content:'From this product page info, return ONLY valid JSON (no markdown) with keys: name, desc (1-2 sentences), cat (Electronics|Fashion|Home|Health|Food|Books|Sports|Other), price (number or null), store (string or null).\n\n'+pageText}]
  })});
  if(!resp.ok){const e=await resp.json().catch(function(){return {};});throw new Error(e&&e.error?e.error.message:'API '+resp.status);}
  const data=await resp.json();
  const raw=(data.content||[]).map(function(b){return b.text||'';}).join('').trim();
  // Robustly extract the JSON object - find first { and last } regardless of surrounding text
  const jsonStart=raw.indexOf('{');
  const jsonEnd=raw.lastIndexOf('}');
  if(jsonStart<0||jsonEnd<0)throw new Error('No JSON object in response');
  const info=JSON.parse(raw.slice(jsonStart,jsonEnd+1));
  if(info.name)document.getElementById('sh-name').value=info.name;
  if(info.desc)document.getElementById('sh-desc').value=info.desc;
  if(info.cat)document.getElementById('sh-cat').value=info.cat;
  if(info.price&&extractPrice!==false)document.getElementById('sh-price').value=info.price;
  const storeEl=document.getElementById('sh-store');
  if(storeEl&&info.store)storeEl.value=info.store;
  const filled=[info.name,info.desc,info.price].filter(Boolean).length;
  // Check if URL looks like a category page (no product-specific segment)
  const enteredUrl=(document.getElementById('sh-url')||{value:''}).value.trim();
  const isCategoryUrl = enteredUrl && /\/(category|categories|collection|search|browse|s\?|c\/|department|list)/i.test(enteredUrl);
  const msg = isCategoryUrl
    ? 'This looks like a category page -- paste a specific product URL for better results'
    : filled===0 ? 'Could not extract details -- enter manually'
    : filled<2  ? 'Partial info extracted -- fill in the rest'
    : 'Extracted successfully';
  if(statusEl){statusEl.textContent=msg;statusEl.style.color=filled===0?'var(--amber)':'var(--positive)';}
  toast(msg);
}

async function shExtractFromPaste(){
  const text=(document.getElementById('sh-paste-text')||{value:''}).value.trim();
  if(!text){toast('Paste some product text first');return;}
  const btn=document.getElementById('sh-paste-extract-btn');
  const status=document.getElementById('sh-extract-status');
  btn.disabled=true;
  btn.textContent='Extracting...';
  if(status)status.textContent='Analysing pasted text...';
  try{
    await shCallClaudeExtract(text.slice(0,4000),status);
    // close paste area on success
    const area=document.getElementById('sh-paste-area');
    const tb=document.getElementById('sh-paste-toggle');
    if(area)area.style.display='none';
    if(tb)tb.innerHTML='&#128196; Paste text';
    document.getElementById('sh-paste-text').value='';
  }catch(e){
    if(status)status.textContent='Failed: '+e.message;
    toast('Extract error: '+e.message);
  }
  btn.disabled=false;
  btn.innerHTML='&#10024; Extract from text';
}
function shSwitchTab(tab){
  const urlMode   = document.getElementById('sh-mode-url');
  const pasteMode = document.getElementById('sh-mode-paste');
  const tabUrl    = document.getElementById('sh-tab-url');
  const tabPaste  = document.getElementById('sh-tab-paste');
  if(!urlMode||!pasteMode) return;
  const isUrl = (tab==='url');
  urlMode.style.display   = isUrl ? 'block' : 'none';
  pasteMode.style.display = isUrl ? 'none'  : 'block';
  if(tabUrl)  { tabUrl.style.background  = isUrl?'var(--surface)':'transparent'; tabUrl.style.color  = isUrl?'var(--text)':'var(--text3)'; }
  if(tabPaste){ tabPaste.style.background= isUrl?'transparent':'var(--surface)'; tabPaste.style.color= isUrl?'var(--text3)':'var(--text)'; }
  if(!isUrl) setTimeout(function(){ var t=document.getElementById('sh-paste-text'); if(t)t.focus(); }, 50);
}

function saveShopItem(){
  const name=document.getElementById('sh-name').value.trim();
  if(!name){document.getElementById('sh-name').focus();return;}
  const existing=shEditId?shopping.find(function(x){return x.id===shEditId;}):null;
  var collSel=document.getElementById('sh-item-coll');
  var collId=collSel?collSel.value||null:(existing?existing.collId:null);
  const obj={
    id:shEditId||String(Date.now()),
    name:name,
    url:(document.getElementById('sh-url')||{value:''}).value.trim(),
    desc:document.getElementById('sh-desc').value.trim(),
    price:parseFloat(document.getElementById('sh-price').value)||null,
    cat:document.getElementById('sh-cat').value,
    store:(document.getElementById('sh-store')||{value:''}).value.trim()||null,
    imageUrl:(document.getElementById('sh-image')||{value:''}).value.trim()||null,
    priority:document.getElementById('sh-priority').value,
    bought:existing?existing.bought:false,
    addedAt:existing?existing.addedAt:Date.now(),
    collId:collId,
  };
  if(shEditId){var idx=shopping.findIndex(function(x){return x.id===shEditId;});if(idx>-1)shopping[idx]=obj;}
  else shopping.unshift(obj);
  saveShopping();closeShopModal();renderShopping();
  toast(shEditId?'Updated '+obj.name:'Added '+obj.name);
}

function toggleShopBought(id){
  var s=shopping.find(function(x){return x.id===id;});
  if(!s)return;
  s.bought=!s.bought;
  s.boughtAt=s.bought?new Date().toISOString():null;
  saveShopping();renderShopping();
}

function deleteShopItem(id){
  shopping=shopping.filter(function(x){return x.id!==id;});
  saveShopping();renderShopping();
  toast('Item removed');
}

function shSetFilter(f){shoppingFilter=f;renderShopping();}


/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
   Shopping Collections
   \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */
const SH_COLL_COLORS = ['#4A8ECC','#1D9E75','#C98A1A','#C46A8A','#7A74D4','#C95050','#C97840','#5DCAA5'];
let shCollEditId = null;
let shCollSelectedColor = SH_COLL_COLORS[0];

function openShCollModal(id){
  shCollEditId = id || null;
  const c = id ? shCollections.find(x=>x.id===id) : null;
  document.getElementById('sh-coll-modal-title').textContent = c ? 'Edit collection' : 'New collection';
  document.getElementById('sh-coll-name').value  = c ? (c.name||'') : '';
  document.getElementById('sh-coll-url').value   = c ? (c.url||'')  : '';
  document.getElementById('sh-coll-desc').value  = c ? (c.desc||'') : '';
  shCollSelectedColor = c ? (c.color||SH_COLL_COLORS[0]) : SH_COLL_COLORS[0];
  renderShCollColorPicker();
  document.getElementById('sh-coll-modal').style.display='flex';
  setTimeout(function(){document.getElementById('sh-coll-name').focus();},50);
}

function closeShCollModal(){
  document.getElementById('sh-coll-modal').style.display='none';
  shCollEditId=null;
}

function renderShCollColorPicker(){
  const el=document.getElementById('sh-coll-color-picker');
  if(!el)return;
  el.innerHTML=SH_COLL_COLORS.map(function(c){
    var sel=c===shCollSelectedColor;
    return '<div data-c="'+c+'" style="width:22px;height:22px;border-radius:50%;background:'+c+';cursor:pointer;border:2px solid '+(sel?'var(--text)':'transparent')+';transition:border-color .15s"></div>';
  }).join('');
  el.onclick=function(e){var d=e.target.closest('[data-c]');if(d){shCollSelectedColor=d.dataset.c;renderShCollColorPicker();}};
}

function saveShColl(){
  const name=document.getElementById('sh-coll-name').value.trim();
  if(!name){document.getElementById('sh-coll-name').focus();return;}
  const obj={
    id: shCollEditId || String(Date.now()),
    name,
    url:   document.getElementById('sh-coll-url').value.trim(),
    desc:  document.getElementById('sh-coll-desc').value.trim(),
    color: shCollSelectedColor,
    addedAt: shCollEditId ? (shCollections.find(x=>x.id===shCollEditId)?.addedAt||Date.now()) : Date.now(),
  };
  if(shCollEditId){ const idx=shCollections.findIndex(x=>x.id===shCollEditId); if(idx>-1)shCollections[idx]=obj; }
  else shCollections.unshift(obj);
  saveShCollections();
  closeShCollModal();
  renderShopping();
  toast(shCollEditId?'Collection updated':'Collection created: '+name);
}

function deleteShColl(id){
  if(!confirm('Delete this collection? Items in it will become uncollected.'))return;
  shCollections=shCollections.filter(x=>x.id!==id);
  // Unassign items
  shopping.forEach(function(s){if(s.collId===id)s.collId=null;});
  saveShCollections();saveShopping();
  if(shCollView===id)shCollView='all';
  renderShopping();
  toast('Collection deleted');
}

function shMoveItem(itemId, collId){
  const s=shopping.find(x=>x.id===itemId);
  if(!s)return;
  s.collId=collId||null;
  saveShopping();renderShopping();
}

function renderShCollSidebar(){
  const sidebar=document.getElementById('sh-coll-sidebar');
  const list=document.getElementById('sh-coll-list');
  if(!sidebar||!list)return;
  if(!shCollections.length){sidebar.style.display='none';return;}
  sidebar.style.display='block';

  // Update "All items" button active state
  const allBtn=document.getElementById('sh-coll-all');
  if(allBtn){
    allBtn.style.background = shCollView==='all'?'var(--accent-dim)':'var(--surface2)';
    allBtn.style.color      = shCollView==='all'?'var(--accent)':'var(--text2)';
    allBtn.style.borderColor= shCollView==='all'?'var(--accent-border)':'var(--border)';
  }

  list.onclick=function(e){var b=e.target.closest('[data-cid]');if(b){shCollView=b.dataset.cid;renderShopping();}};
  list.innerHTML=shCollections.map(function(c){
    const count=shopping.filter(function(s){return s.collId===c.id&&!s.bought;}).length;
    const isActive=shCollView===c.id;
    return '<div style="margin-bottom:4px">'
      +'<button class="sh-coll-btn'+(isActive?' active':'')+'" onclick="shCollView=&quot;'+c.id+'&quot;;renderShopping()">'
        +'<span class="sh-coll-dot" style="background:'+c.color+'"></span>'
        +'<span class="sh-coll-name">'+esc(c.name)+'</span>'
        +(count>0?'<span class="sh-coll-count">'+count+'</span>':'')
      +'</button>'
      +'</div>';
  }).join('');
}

function renderShopping(){
  var total=shopping.length;
  var toBuyArr=shopping.filter(function(x){return !x.bought;});
  var boughtArr=shopping.filter(function(x){return x.bought;});
  var totalVal=toBuyArr.reduce(function(s,x){return s+(x.price||0);},0);
  var sub=document.getElementById('shop-sub');
  if(sub)sub.textContent=total+' item'+(total!==1?'s':'')+' \u00b7 '+toBuyArr.length+' to buy'+(shCollections.length?' \u00b7 '+shCollections.length+' collections':'');
  var metrics=document.getElementById('shop-metrics');
  if(metrics){
    metrics.innerHTML=[
      {label:'To buy',value:toBuyArr.length,color:'var(--text)',sub:'items'},
      {label:'Bought',value:boughtArr.length,color:'var(--positive)',sub:'completed'},
      totalVal>0?{label:'Estimated',value:'AED '+fmt(totalVal),color:'var(--accent)',sub:'to spend'}:null,
      shCollections.length?{label:'Collections',value:shCollections.length,color:'var(--purple)',sub:'groups'}:null,
    ].filter(Boolean).map(function(m){
      return '<div style="background:var(--surface2);border:0.5px solid var(--border);border-radius:var(--radius-md);padding:.75rem 1rem">'
        +'<div style="font-size:10px;color:var(--text3);font-weight:600;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">'+m.label+'</div>'
        +'<div style="font-size:20px;font-weight:600;font-family:var(--mono);color:'+m.color+'">'+m.value+'</div>'
        +'<div style="font-size:11px;color:var(--text3);margin-top:1px">'+m.sub+'</div>'
        +'</div>';
    }).join('');
  }
  var filtersEl=document.getElementById('shop-filters');
  if(filtersEl){
    filtersEl.innerHTML=[
      {f:'all',label:'All ('+total+')'},
      {f:'tobuy',label:'To buy ('+toBuyArr.length+')'},
      {f:'bought',label:'Bought ('+boughtArr.length+')'},
    ].map(function(t){return '<button class="pill'+(shoppingFilter===t.f?' active':'')+'" onclick="shSetFilter(\''+t.f+'\')">'+t.label+'</button>';}).join('');
  }
  var vis=shopping.slice();
  if(shoppingFilter==='tobuy')vis=vis.filter(function(x){return !x.bought;});
  if(shoppingFilter==='bought')vis=vis.filter(function(x){return x.bought;});
  var priW={high:2,normal:1,low:0};
  function sortItems(arr){return arr.sort(function(a,b){
    if(a.bought!==b.bought)return a.bought?1:-1;
    var pw=(priW[b.priority||'normal']||1)-(priW[a.priority||'normal']||1);
    if(pw!==0)return pw;
    return (b.addedAt||0)-(a.addedAt||0);
  });}
  var el=document.getElementById('shop-list');
  if(!el)return;
  if(!vis.length){
    el.innerHTML='<div class="empty">'+(shopping.length?'No items match this filter.':'Add items to your shopping list')+'</div>';
    // Hide FAB
    var fab=document.getElementById('sh-coll-fab');
    if(fab)fab.style.display='none';
    return;
  }
  function itemCard(s){
    var priLabel={high:'<span style="font-size:10px;font-weight:600;padding:2px 6px;border-radius:var(--radius-sm);margin-left:6px;background:rgba(224,82,82,.15);color:var(--red)">High</span>',low:'<span style="font-size:10px;font-weight:600;padding:2px 6px;border-radius:var(--radius-sm);margin-left:6px;background:rgba(140,140,140,.12);color:var(--text3)">Someday</span>',normal:''}[s.priority||'normal']||'';
    var imgHtml=s.imageUrl?'<div style="flex-shrink:0;width:64px;height:64px;border-radius:7px;overflow:hidden;background:var(--surface2);border:0.5px solid var(--border)"><img src="'+esc(s.imageUrl)+'" alt="" style="width:100%;height:100%;object-fit:cover" onerror="this.parentNode.style.display=\'none\'"></div>':'';
    return '<div class="shop-item'+(s.bought?' bought':'')+'" id="shop-'+s.id+'">'
      +imgHtml
      +'<div class="shop-check'+(s.bought?' checked':'')+'" onclick="toggleShopBought(\''+s.id+'\')">'+(s.bought?'&#10003;':'')+'</div>'
      +'<div class="shop-body">'
        +'<div class="shop-name">'+esc(s.name)+priLabel+'</div>'
        +(s.desc?'<div class="shop-desc">'+esc(s.desc)+'</div>':'')
        +'<div class="shop-meta">'
          +'<span class="shop-cat">'+esc(s.cat||'Other')+'</span>'
          +(s.store?'<span style="font-size:11px;color:var(--text3)">'+esc(s.store)+'</span>':'')
          +(s.price?'<span class="shop-price">AED '+fmt(s.price)+'</span>':'')
          +(s.url?'<a class="shop-link" href="'+esc(s.url)+'" target="_blank" rel="noopener" onclick="event.stopPropagation()" style="padding:2px 8px;border:0.5px solid var(--accent-border);border-radius:5px;background:var(--accent-dim)">&#128279; Open</a>':'')
        +'</div>'
      +'</div>'
      +'<div style="display:flex;flex-direction:column;gap:5px;flex-shrink:0">'
        +'<button class="icon-btn" onclick="openShopModal(\''+s.id+'\')" title="Edit">&#9998;</button>'
        +(shCollections.length?'<select onchange="shMoveItem(\''+s.id+'\',this.value);this.value=\'\'" title="Move" style="height:26px;border-radius:6px;border:0.5px solid var(--border2);background:var(--surface3);color:var(--text3);font-size:10px;cursor:pointer;font-family:var(--font);padding:0 4px"><option value="">&#8594;</option><option value="">No collection</option>'+shCollections.map(function(c){return '<option value="'+c.id+'"'+(s.collId===c.id?' selected':'')+'>'+esc(c.name)+'</option>';}).join('')+'</select>':'')
        +'<button class="icon-btn del" onclick="deleteShopItem(\''+s.id+'\')" title="Remove">&#10005;</button>'
      +'</div>'
    +'</div>';
  }
  var out='';
  if(shCollections.length){
    shCollections.forEach(function(c){
      var cItems=sortItems(vis.filter(function(x){return x.collId===c.id;}));
      var stateKey='sh-tree-'+c.id;
      var isOpen=localStorage.getItem(stateKey)!=='0';
      var cToBuy=cItems.filter(function(x){return !x.bought;}).length;
      var cVal=cItems.reduce(function(s,x){return s+(x.price||0);},0);
      out+='<div class="sh-tree-group">'
        +'<div class="sh-tree-header'+(isOpen?' open':'')+'" onclick="shToggleTree(\''+c.id+'\')" style="border-left:3px solid '+c.color+'">'
          +'<span class="sh-tree-chevron" style="margin-right:2px">&#9654;</span>'
          +'<span class="sh-tree-name">'+esc(c.name)+'</span>'
          +'<span class="sh-tree-meta">'+cItems.length+' item'+(cItems.length!==1?'s':'')+(cToBuy?' &middot; <b style=\'color:var(--text)\'>'+cToBuy+' to buy</b>':'')+(cVal?' &middot; AED '+fmt(cVal):'')+'</span>'
          +'<div style="display:flex;gap:4px;margin-left:auto" onclick="event.stopPropagation()">'
            +(c.url?'<a href="'+c.url+'" target="_blank" rel="noopener" onclick="event.stopPropagation()" title="Open link" style="height:24px;padding:0 10px;border-radius:6px;border:0.5px solid var(--accent-border);background:var(--accent-dim);color:var(--accent);font-size:11px;font-weight:500;display:inline-flex;align-items:center;gap:4px;text-decoration:none">&#128279; Link</a>':'')  
            +'<button class="icon-btn" onclick="openShopModal();setTimeout(function(){document.getElementById(\'sh-item-coll\').value=\''+c.id+'\';},50)" title="Add item here" style="height:24px;padding:0 8px;font-size:11px">+ Add</button>'
            +'<button class="icon-btn" onclick="openShCollModal(\''+c.id+'\')" title="Edit collection" style="height:24px;padding:0 6px">&#9998;</button>'
          +'</div>'
        +'</div>'
        +'<div class="sh-tree-body'+(isOpen?'':' collapsed')+'" id="sh-tree-body-'+c.id+'">'
          +(cItems.length
            ?'<div class="shop-grid">'+cItems.map(itemCard).join('')+'</div>'
            :'<div style="color:var(--text3);font-size:12px;padding:8px 4px;font-style:italic">No items yet</div>')
        +'</div>'
      +'</div>';
    });
    var uncollected=sortItems(vis.filter(function(x){return !x.collId;}));
    if(uncollected.length){
      var uOpen=localStorage.getItem('sh-tree-uncollected')!=='0';
      out+='<div class="sh-tree-group">'
        +'<div class="sh-tree-header'+(uOpen?' open':'')+'" onclick="shToggleTree(\'uncollected\')" style="border-left:3px solid var(--border2)">'
          +'<span class="sh-tree-chevron" style="margin-right:2px">&#9654;</span>'
          +'<span class="sh-tree-name" style="color:var(--text2)">Uncollected</span>'
          +'<span class="sh-tree-meta">'+uncollected.length+' item'+(uncollected.length!==1?'s':'')+'</span>'
        +'</div>'
        +'<div class="sh-tree-body'+(uOpen?'':' collapsed')+'" id="sh-tree-body-uncollected">'
          +'<div class="shop-grid">'+uncollected.map(itemCard).join('')+'</div>'
        +'</div>'
      +'</div>';
    }
  } else {
    out='<div class="shop-grid">'+sortItems(vis).map(itemCard).join('')+'</div>';
  }
  el.innerHTML=out;
  var fab=document.getElementById('sh-coll-fab');
  if(fab)fab.style.display=shCollections.length&&currentPage==='shopping'?'flex':'none';
  renderShCollFloating();
}

function shToggleTree(id){
  var key='sh-tree-'+id;
  var body=document.getElementById('sh-tree-body-'+id);
  var isOpen=localStorage.getItem(key)!=='0';
  localStorage.setItem(key,isOpen?'0':'1');
  if(body)body.classList.toggle('collapsed',isOpen);
  var header=body?body.previousElementSibling:null;
  if(header)header.classList.toggle('open',!isOpen);
}

function toggleShCollPanel(){
  var panel=document.getElementById('sh-coll-panel');
  if(panel)panel.classList.toggle('open');
}

function renderShCollFloating(){
  var el=document.getElementById('sh-coll-panel-items');
  if(!el)return;
  if(!shCollections.length){el.innerHTML='';return;}
  el.innerHTML='<div class="sh-coll-panel-item" onclick="toggleShCollPanel()" style="border-bottom:0.5px solid var(--border)">'
    +'<span>&#9634;</span><span>All items ('+shopping.length+')</span>'
    +'</div>'
    +shCollections.map(function(c){
      var toBuy=shopping.filter(function(x){return x.collId===c.id&&!x.bought;}).length;
      var total=shopping.filter(function(x){return x.collId===c.id;}).length;
      return '<div class="sh-coll-panel-item" onclick="shJumpToCollection(\''+c.id+'\')">'
        +'<span style="width:10px;height:10px;border-radius:50%;background:'+c.color+';display:inline-block;flex-shrink:0"></span>'
        +'<span style="flex:1">'+esc(c.name)+'</span>'
        +'<span style="font-size:10px;color:var(--text3)">'+toBuy+'/'+total+'</span>'
      +'</div>';
    }).join('');
}

function shJumpToCollection(id){
  toggleShCollPanel();
  if(currentPage!=='shopping')switchPage('shopping');
  setTimeout(function(){
    var el=document.getElementById('sh-tree-body-'+id);
    if(el&&el.previousElementSibling)el.previousElementSibling.scrollIntoView({behavior:'smooth',block:'start'});
  },200);
}


function dbWidgetLinks(el){
  dbCard(el,{icon:'&#128279;',title:'Links',headColor:'rgba(74,142,204,.08)',footerLink:'All links',footerPage:'links'});
  var body=document.getElementById('dbwb-links');
  if(!body)return;
  if(!links.length){
    body.innerHTML='<div class="db-empty">No links yet</div>';
    return;
  }
  // Show top 8 most-clicked, then most recent
  var sorted=[...links].sort(function(a,b){return (b.clicks||0)-(a.clicks||0)||(b.addedAt||0)-(a.addedAt||0);}).slice(0,8);
  body.style.padding='10px 12px';
  body.innerHTML='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:8px">'
    +sorted.map(function(l){
      return '<div onclick="openLink(\''+l.id+'\')" style="display:flex;flex-direction:column;align-items:center;gap:5px;padding:10px 6px;border-radius:9px;background:var(--surface2);border:0.5px solid var(--border);cursor:pointer;transition:all .15s;border-top:2px solid '+l.color+'" onmouseover="this.style.background=\'var(--surface3)\'" onmouseout="this.style.background=\'var(--surface2)\'">'
        +'<div style="font-size:20px">'+esc(l.emoji||'\uD83D\uDD17')+'</div>'
        +'<div style="font-size:11px;font-weight:600;color:var(--text);text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;width:100%">'+esc(l.title)+'</div>'
      +'</div>';
    }).join('')
    +'</div>';
}

const LK_COLORS = ['#4A8ECC','#1D9E75','#C98A1A','#C46A8A','#7A74D4','#C95050','#C97840','#5DCAA5','#888880'];
let lkEditId = null, lgEditId = null, lkSelColor = LK_COLORS[0];

const LK_FILE_EMOJI = {'pdf':'\uD83D\uDCC4','doc':'\uD83D\uDCDD','docx':'\uD83D\uDCDD','xls':'\uD83D\uDCCA','xlsx':'\uD83D\uDCCA','ppt':'\uD83D\uDCCB','pptx':'\uD83D\uDCCB','txt':'\uD83D\uDCC3','csv':'\uD83D\uDCCA','jpg':'\uD83D\uDDBC','jpeg':'\uD83D\uDDBC','png':'\uD83D\uDDBC','gif':'\uD83D\uDDBC','svg':'\uD83C\uDFA8','mp4':'\uD83C\uDFAC','mov':'\uD83C\uDFAC','mp3':'\uD83C\uDFB5','wav':'\uD83C\uDFB5','zip':'\uD83D\uDCE6','rar':'\uD83D\uDCE6','exe':'\u2699\uFE0F','dmg':'\uD83D\uDCBF','html':'\uD83C\uDF10','js':'\u26A1','py':'\uD83D\uDC0D','sh':'\uD83D\uDDA5'};

function lkGetFileEmoji(name){
  var ext=(name.split('.').pop()||'').toLowerCase();
  return LK_FILE_EMOJI[ext]||'\uD83D\uDCC4';
}

function lkGetFileColor(name){
  var ext=(name.split('.').pop()||'').toLowerCase();
  var map={pdf:'#E05252',doc:'#4A8ECC',docx:'#4A8ECC',xls:'#1D9E75',xlsx:'#1D9E75',
           ppt:'#C97840',pptx:'#C97840',jpg:'#C46A8A',jpeg:'#C46A8A',png:'#C46A8A',
           mp4:'#9B7FE8',mov:'#9B7FE8',mp3:'#C98A1A',zip:'#888880',py:'#4A8ECC'};
  return map[ext]||LK_COLORS[0];
}

function lkApplyFile(file){
  if(!file)return;
  var name=file.name;
  var noExt=name.includes('.')?name.slice(0,name.lastIndexOf('.')):name;
  // Auto-fill title if empty
  if(!document.getElementById('lk-title').value.trim()){
    document.getElementById('lk-title').value=noExt;
  }
  // Auto-fill emoji
  document.getElementById('lk-emoji').value=lkGetFileEmoji(name);
  // Set colour
  lkSelColor=lkGetFileColor(name);
  renderLkColorPicker();
  // Try to set URL -- only works for file:// protocol pages
  var hint=document.getElementById('lk-path-hint');
  if(file.path){
    // Electron or some browsers expose file.path
    document.getElementById('lk-url').value='file:///'+file.path.replace(/\\/g,'/');
  } else {
    // Show hint to paste path manually
    if(hint)hint.style.display='block';
  }
  // Highlight drop zone as done
  var dz=document.getElementById('lk-drop-zone');
  if(dz){
    dz.style.borderColor='var(--positive-border)';
    dz.style.background='var(--positive-dim)';
    dz.innerHTML='<div style="font-size:20px;margin-bottom:4px">'+lkGetFileEmoji(name)+'</div>'
      +'<div style="font-size:12px;color:var(--positive);font-weight:500">'+esc(name)+'</div>'
      +'<div style="font-size:10px;color:var(--text3);margin-top:3px">Click to choose a different file</div>';
  }
}

function lkFileSelected(input){
  if(input.files&&input.files[0]) lkApplyFile(input.files[0]);
}

function lkDragOver(e){
  e.preventDefault();
  var dz=document.getElementById('lk-drop-zone');
  if(dz){dz.style.borderColor='var(--accent-border)';dz.style.background='var(--accent-dim)';}
}

function lkDragLeave(e){
  var dz=document.getElementById('lk-drop-zone');
  if(dz){dz.style.borderColor='var(--border2)';dz.style.background='';}
}

function lkDrop(e){
  e.preventDefault();
  var files=e.dataTransfer.files;
  if(files&&files[0])lkApplyFile(files[0]);
}

function openLinkModal(id, preselectGroupId){
  lkEditId = id||null;
  const l = id ? links.find(x=>x.id===id) : null;
  document.getElementById('link-modal-title').textContent = l ? 'Edit link' : 'Add link';
  document.getElementById('lk-emoji').value = l ? (l.emoji||'') : '';
  document.getElementById('lk-title').value = l ? (l.title||'') : '';
  document.getElementById('lk-url').value   = l ? (l.url||'')   : '';
  document.getElementById('lk-desc').value  = l ? (l.desc||'')  : '';
  lkSelColor = l ? (l.color||LK_COLORS[0]) : LK_COLORS[0];
  renderLkColorPicker();
  const grpSel = document.getElementById('lk-group');
  if(grpSel){
    grpSel.innerHTML = '<option value="">-- No group --</option>'
      + linkGroups.map(function(g){return '<option value="'+g.id+'"'+(l&&l.groupId===g.id?' selected':'')+'>'+esc(g.name)+'</option>';}).join('');
    if(l) grpSel.value = l.groupId||'';
    else if(preselectGroupId) grpSel.value = preselectGroupId;
  }
  document.getElementById('link-modal').style.display='flex';
  setTimeout(function(){document.getElementById(l?'lk-title':'lk-url').focus();},50);
}

function closeLinkModal(){
  document.getElementById('link-modal').style.display='none';
  lkEditId=null;
  // Reset drop zone
  var dz=document.getElementById('lk-drop-zone');
  if(dz){
    dz.style.borderColor='';dz.style.background='';
    dz.innerHTML='<div style="font-size:20px;margin-bottom:4px">&#128193;</div>'
      +'<div>Drag a file here <span style="color:var(--text3)">or</span> <span style="color:var(--accent);cursor:pointer">click to browse</span></div>'
      +'<div style="font-size:10px;color:var(--text3);margin-top:3px">Auto-fills name and icon -- paste the file path below</div>';
  }
  var hint=document.getElementById('lk-path-hint');
  if(hint)hint.style.display='none';
  var fi=document.getElementById('lk-file-input');
  if(fi)fi.value='';
}

function renderLkColorPicker(){
  var el=document.getElementById('lk-color-picker');
  if(!el)return;
  el.innerHTML=LK_COLORS.map(function(c){
    return '<div data-lkc="'+c+'" style="width:20px;height:20px;border-radius:50%;background:'+c+';cursor:pointer;border:2px solid '+(c===lkSelColor?'var(--text)':'transparent')+';transition:border .15s"></div>';
  }).join('');
  el.onclick=function(e){var d=e.target.closest('[data-lkc]');if(d){lkSelColor=d.dataset.lkc;renderLkColorPicker();}};
}

function saveLinkItem(){
  var title=document.getElementById('lk-title').value.trim();
  var url=document.getElementById('lk-url').value.trim();
  if(!title||!url){toast('Title and URL are required');return;}
  if(!/^https?:\/\//i.test(url)) url='https://'+url;
  var obj={
    id:lkEditId||String(Date.now()),
    emoji:document.getElementById('lk-emoji').value.trim()||'\uD83D\uDD17',
    title,url,
    desc:document.getElementById('lk-desc').value.trim(),
    groupId:document.getElementById('lk-group').value||null,
    color:lkSelColor,
    clicks:lkEditId?(links.find(x=>x.id===lkEditId)||{clicks:0}).clicks:0,
    addedAt:lkEditId?(links.find(x=>x.id===lkEditId)||{addedAt:Date.now()}).addedAt:Date.now(),
  };
  if(lkEditId){var i=links.findIndex(x=>x.id===lkEditId);if(i>-1)links[i]=obj;}
  else links.unshift(obj);
  saveLinks();closeLinkModal();renderLinks();
  toast(lkEditId?'Link updated':'Link added: '+title);
}

function deleteLinkItem(id){
  links=links.filter(x=>x.id!==id);
  saveLinks();renderLinks();toast('Link removed');
}

function openLink(id){
  var l=links.find(x=>x.id===id);
  if(!l)return;
  l.clicks=(l.clicks||0)+1;
  saveLinks();
  renderLinks();
  var url=l.url||'';
  if(!url)return;
  // Always open directly in browser -- works for file:// and https://
  window.open(url,'_blank','noopener');
}

function closeLinkViewer(){
  document.getElementById('link-viewer').style.display='none';
  document.getElementById('lv-iframe').src=''; // stop loading
}

/* \u2500\u2500 Link Groups \u2500\u2500 */
function openLinkGroupModal(id){
  lgEditId=id||null;
  var g=id?linkGroups.find(x=>x.id===id):null;
  document.getElementById('link-group-modal-title').textContent=g?'Edit group':'New group';
  document.getElementById('lg-name').value=g?(g.name||''):'';
  document.getElementById('lg-desc').value=g?(g.desc||''):'';
  document.getElementById('link-group-modal').style.display='flex';
  setTimeout(function(){document.getElementById('lg-name').focus();},50);
}

function closeLinkGroupModal(){document.getElementById('link-group-modal').style.display='none';lgEditId=null;}

function saveLinkGroup(){
  var name=document.getElementById('lg-name').value.trim();
  if(!name){document.getElementById('lg-name').focus();return;}
  var obj={
    id:lgEditId||String(Date.now()),
    name,
    desc:document.getElementById('lg-desc').value.trim(),
    addedAt:lgEditId?(linkGroups.find(x=>x.id===lgEditId)||{addedAt:Date.now()}).addedAt:Date.now(),
  };
  if(lgEditId){var i=linkGroups.findIndex(x=>x.id===lgEditId);if(i>-1)linkGroups[i]=obj;}
  else linkGroups.push(obj);
  saveLinkGroups();closeLinkGroupModal();renderLinks();
  toast(lgEditId?'Group updated':'Group created: '+name);
}

function deleteLinkGroup(id){
  if(!confirm('Delete this group? Links in it will become ungrouped.'))return;
  linkGroups=linkGroups.filter(x=>x.id!==id);
  links.forEach(function(l){if(l.groupId===id)l.groupId=null;});
  saveLinkGroups();saveLinks();renderLinks();toast('Group deleted');
}

/* \u2500\u2500 Render \u2500\u2500 */
function renderLinks(){
  var q=(document.getElementById('links-search')||{value:''}).value.toLowerCase();
  var el=document.getElementById('links-grid');
  if(!el)return;

  // Update sub
  var sub=document.getElementById('links-sub');
  if(sub) sub.textContent=links.length+' link'+(links.length!==1?'s':'')+' across '+(linkGroups.length||0)+' groups';

  if(!links.length){
    el.innerHTML='<div class="empty" style="text-align:center">No links yet.<br><span class="kbd-hint">Add links to build your quick-access dashboard</span></div>';
    return;
  }

  var vis=links.filter(function(l){
    if(!q)return true;
    return (l.title||'').toLowerCase().includes(q)||(l.desc||'').toLowerCase().includes(q)||(l.url||'').toLowerCase().includes(q);
  });

  function cardHTML(l){
    var domain='';
    try{domain=new URL(l.url).hostname.replace(/^www\./,'');}catch(e){}
    return '<div class="link-card" id="lk-'+l.id+'" onclick="openLink(\''+l.id+'\')" style="border-top:2px solid '+l.color+'">'
      +'<div class="link-card-actions">'
        +'<button class="icon-btn" onclick="event.stopPropagation();openLinkModal(\''+l.id+'\')" title="Edit" style="height:22px;padding:0 6px;font-size:11px">&#9998;</button>'
        +'<button class="icon-btn del" onclick="event.stopPropagation();deleteLinkItem(\''+l.id+'\')" title="Remove" style="height:22px;padding:0 6px;font-size:11px">&#10005;</button>'
      +'</div>'
      +'<div class="link-card-icon">'+esc(l.emoji||'\uD83D\uDD17')+'</div>'
      +'<div class="link-card-title">'+esc(l.title)+'</div>'
      +(l.desc?'<div class="link-card-desc">'+esc(l.desc)+'</div>':'')
      +'<div style="display:flex;align-items:center;justify-content:space-between;margin-top:auto">'
        +'<div class="link-card-url">'+domain+'</div>'
        +(l.clicks>0?'<span class="link-card-badge">'+l.clicks+'x</span>':'')
      +'</div>'
    +'</div>';
  }

  var out='';

  // Grouped
  if(linkGroups.length){
    linkGroups.forEach(function(g){
      var gLinks=vis.filter(function(l){return l.groupId===g.id;});
      if(!gLinks.length&&q)return;
      out+='<div class="links-group">'
        +'<div class="links-group-header">'
          +'<div class="links-group-name">'+esc(g.name)+'</div>'
          +(g.desc?'<div class="links-group-desc">'+esc(g.desc)+'</div>':'')
          +'<div style="display:flex;gap:4px">'
            +'<button class="icon-btn" onclick="openLinkModal(null,\''+g.id+'\')" title="Add link to this group" style="height:22px;padding:0 8px;font-size:11px;color:var(--accent);border-color:var(--accent-border);background:var(--accent-dim)">&#65291; link</button>'
            +'<button class="icon-btn" onclick="openLinkGroupModal(\''+g.id+'\')" title="Edit group" style="height:22px;padding:0 6px;font-size:11px">&#9998;</button>'
            +'<button class="icon-btn del" onclick="deleteLinkGroup(\''+g.id+'\')" title="Delete group" style="height:22px;padding:0 6px;font-size:11px">&#10005;</button>'
          +'</div>'
        +'</div>'
        +(gLinks.length?'<div class="links-grid-inner">'+gLinks.map(cardHTML).join('')+'</div>':'<div class="empty-group-cta" onclick="openLinkModal(null,\''+g.id+'\')">&#65291; Add your first link to this group</div>')
        +'</div>';
    });
  }

  // Ungrouped
  var ungrouped=vis.filter(function(l){return !l.groupId;});
  if(ungrouped.length){
    out+='<div class="links-group">'
      +(linkGroups.length?'<div class="links-group-header"><div class="links-group-name" style="color:var(--text3)">Other</div></div>':'')
      +'<div class="links-grid-inner">'+ungrouped.map(cardHTML).join('')+'</div>'
    +'</div>';
  }

  el.innerHTML=out||'<div class="empty">No links match your search</div>';
}

/* \u2500\u2500 Dashboard widget \u2500\u2500 */


/* \u2500\u2500 Global search palette (v5.14) \u2500\u2500 */
let gsResults = [];
let gsSelIdx = 0;
const GS_TYPES = {
  task:     {label:'Task',       icon:'\u2713',  color:'var(--blue)'   },
  note:     {label:'Note',       icon:'\u270E',  color:'var(--amber)'  },
  bill:     {label:'Bill',       icon:'\u00A4',  color:'var(--green)'  },
  loan:     {label:'Loan',       icon:'\u20BF',  color:'var(--red)'    },
  goal:     {label:'Goal',       icon:'\u25CE',  color:'var(--purple)' },
  account:  {label:'Account',    icon:'\u00A4',  color:'var(--blue)'   },
  recv:     {label:'Receivable', icon:'\u21B6',  color:'var(--amber)'  },
  shop:     {label:'Shopping',   icon:'\u25CB',  color:'var(--purple)' },
  link:     {label:'Link',       icon:'\u2192',  color:'var(--text2)'  },
};

function openSearchModal(){
  const m = document.getElementById('search-modal');
  if(!m) return;
  m.style.display = 'flex';
  const inp = document.getElementById('gs-input');
  if(inp){ inp.value = ''; setTimeout(()=>inp.focus(), 50); }
  gsResults = []; gsSelIdx = 0;
  document.getElementById('gs-results').innerHTML = '<div id="gs-empty" style="padding:30px 16px;text-align:center;color:var(--text3);font-size:13px">Type to search across all your data.</div>';
}

function closeSearchModal(){
  const m = document.getElementById('search-modal');
  if(m) m.style.display = 'none';
  gsResults = []; gsSelIdx = 0;
}

function _gsMatch(q, ...fields){
  const text = fields.filter(Boolean).join(' ').toLowerCase();
  if(!text) return false;
  // Match all whitespace-separated tokens (AND search)
  const tokens = q.split(/\s+/).filter(Boolean);
  return tokens.every(t => text.includes(t));
}

function runGlobalSearch(raw){
  const q = (raw||'').trim().toLowerCase();
  const el = document.getElementById('gs-results');
  if(!el) return;
  if(!q){
    gsResults = []; gsSelIdx = 0;
    el.innerHTML = '<div id="gs-empty" style="padding:30px 16px;text-align:center;color:var(--text3);font-size:13px">Type to search across all your data.</div>';
    return;
  }
  const out = [];
  // Tasks
  (tasks||[]).forEach(t=>{
    const subText = (t.subtasks||[]).map(s=>s.title).join(' ');
    if(_gsMatch(q, t.title, t.notes, (t.tags||[]).join(' '), subText)){
      out.push({type:'task', id:t.id, title:t.title||'(untitled task)', sub: t.done?'\u2713 done':((t.priority||'')+(t.dueDate?' \u00B7 due '+t.dueDate:'')), raw:t});
    }
  });
  // Notes
  (notes||[]).forEach(n=>{
    if(_gsMatch(q, n.title, n.body, (n.tags||[]).join(' '))){
      const snippet = (n.body||'').replace(/\s+/g,' ').trim().slice(0,80);
      out.push({type:'note', id:n.id, title:n.title||'(untitled note)', sub: snippet, raw:n});
    }
  });
  // Bills / subs
  (items||[]).forEach(i=>{
    if(_gsMatch(q, i.name, i.cat, i.notes)){
      out.push({type:'bill', id:i.id, title:i.name, sub: (i.cat||'')+' \u00B7 AED '+(i.amount||0)+'/'+(i.cycle||'monthly'), raw:i});
    }
  });
  // Loans
  (loans||[]).forEach(l=>{
    if(_gsMatch(q, l.name, l.lender, l.notes)){
      out.push({type:'loan', id:l.id, title:l.name, sub: (l.lender||'')+' \u00B7 AED '+(l.principal||0), raw:l});
    }
  });
  // Goals
  (goals||[]).forEach(g=>{
    if(_gsMatch(q, g.title, g.category, g.subcategory, g.notes)){
      out.push({type:'goal', id:g.id, title:g.title, sub: (g.category||'')+(g.deadline?' \u00B7 by '+g.deadline:''), raw:g});
    }
  });
  // Accounts
  (accounts||[]).forEach(a=>{
    if(_gsMatch(q, a.name, a.bank, a.acnum, a.notes)){
      out.push({type:'account', id:a.id, title:a.name, sub: (a.bank||'')+' \u00B7 '+(a.currency||'AED')+' '+(a.balance||0), raw:a});
    }
  });
  // Receivables
  (receivables||[]).forEach(r=>{
    if(_gsMatch(q, r.name, r.from, r.notes)){
      out.push({type:'recv', id:r.id, title:r.name, sub: (r.from||'')+' \u00B7 AED '+(r.amount||0), raw:r});
    }
  });
  // Shopping
  (shopping||[]).forEach(s=>{
    if(_gsMatch(q, s.name, s.desc, s.cat, s.store)){
      out.push({type:'shop', id:s.id, title:s.name, sub: (s.cat||'')+(s.price?' \u00B7 AED '+s.price:''), raw:s});
    }
  });
  // Links
  (links||[]).forEach(lk=>{
    if(_gsMatch(q, lk.title, lk.url, lk.desc)){
      out.push({type:'link', id:lk.id, title:lk.title, sub: lk.url||'', raw:lk});
    }
  });
  gsResults = out;
  gsSelIdx = 0;
  renderGsResults();
}

function renderGsResults(){
  const el = document.getElementById('gs-results');
  if(!el) return;
  if(!gsResults.length){
    el.innerHTML = '<div style="padding:30px 16px;text-align:center;color:var(--text3);font-size:13px">No matches</div>';
    return;
  }
  // Group by type, cap 5 per group
  const grouped = {};
  gsResults.forEach(r=>{ (grouped[r.type] = grouped[r.type]||[]).push(r); });
  const order = ['task','note','bill','loan','goal','account','recv','shop','link'];
  let html = '';
  let flatIdx = 0;
  const flatList = [];
  order.forEach(type=>{
    const list = grouped[type];
    if(!list || !list.length) return;
    const meta = GS_TYPES[type];
    const shown = list.slice(0, 5);
    const more = list.length - shown.length;
    html += '<div style="padding:8px 14px 4px;font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;display:flex;justify-content:space-between"><span>'+meta.label+'</span><span style="opacity:.6">'+list.length+'</span></div>';
    shown.forEach(r=>{
      const idx = flatIdx++;
      flatList.push(r);
      const sel = idx===gsSelIdx ? 'background:var(--surface2)' : '';
      html += '<div class="gs-row" data-idx="'+idx+'" onclick="gsActivate('+idx+')" style="display:flex;align-items:center;gap:10px;padding:8px 14px;cursor:pointer;'+sel+'">'
        + '<span style="font-size:14px;width:18px;text-align:center;color:'+meta.color+'">'+meta.icon+'</span>'
        + '<div style="flex:1;min-width:0">'
        + '<div style="font-size:13px;color:var(--text);font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+esc(r.title)+'</div>'
        + (r.sub ? '<div style="font-size:11px;color:var(--text3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:1px">'+esc(r.sub)+'</div>' : '')
        + '</div>'
        + '</div>';
    });
    if(more > 0){
      html += '<div style="padding:4px 14px 8px;font-size:10px;color:var(--text3);opacity:.7">+ '+more+' more...</div>';
    }
  });
  // Re-sync gsResults to the flattened display order so navigation matches what's shown
  gsResults = flatList;
  el.innerHTML = html;
  // Scroll selected into view
  const selEl = el.querySelector('.gs-row[data-idx="'+gsSelIdx+'"]');
  if(selEl) selEl.scrollIntoView({block:'nearest'});
}

function gsKeydown(e){
  if(e.key==='ArrowDown'){ e.preventDefault(); if(gsResults.length){ gsSelIdx = (gsSelIdx+1) % gsResults.length; renderGsResults(); } }
  else if(e.key==='ArrowUp'){ e.preventDefault(); if(gsResults.length){ gsSelIdx = (gsSelIdx - 1 + gsResults.length) % gsResults.length; renderGsResults(); } }
  else if(e.key==='Enter'){ e.preventDefault(); if(gsResults.length) gsActivate(gsSelIdx); }
}

function gsActivate(idx){
  const r = gsResults[idx];
  if(!r) return;
  closeSearchModal();
  jumpToResult(r);
}

function jumpToResult(r){
  // Map type -> page + opener
  switch(r.type){
    case 'task':
      switchPage('tasks');
      setTimeout(()=>{ try{ openTaskModal(r.id); }catch(e){} }, 80);
      break;
    case 'note':
      switchPage('notes');
      setTimeout(()=>{ try{ openNoteModal(r.id); }catch(e){} }, 80);
      break;
    case 'bill':
      switchPage('active');
      setTimeout(()=>{ try{ openModal(r.id); }catch(e){} }, 80);
      break;
    case 'loan':
      switchPage('loans');
      setTimeout(()=>{ try{ openLoanModal(r.id); }catch(e){} }, 80);
      break;
    case 'goal':
      switchPage('goals');
      setTimeout(()=>{ try{ openGoalModal(r.id); }catch(e){} }, 80);
      break;
    case 'account':
      switchPage('accounts');
      setTimeout(()=>{ try{ openAccountModal(r.id); }catch(e){} }, 80);
      break;
    case 'recv':
      switchPage('receivables');
      setTimeout(()=>{ try{ openRecvModal(r.id); }catch(e){} }, 80);
      break;
    case 'shop':
      switchPage('shopping');
      setTimeout(()=>{ try{ openShopModal(r.id); }catch(e){} }, 80);
      break;
    case 'link':
      switchPage('links');
      break;
  }
}



/* \u2500\u2500 PWA registration (v5.15) \u2500\u2500 */
let _pwaDeferredPrompt = null;
let _pwaNewWorker = null;

function pwaInit(){
  // Touch detection: force mobile layout for any touch device, regardless of viewport.
  try{
    var hasTouch = ('ontouchstart' in window) || ((navigator.maxTouchPoints||0) > 0);
    if(hasTouch && document.body) document.body.classList.add('touch-device');
  }catch(_){}
  // Stamp the visible version + viewport for debugging (deferred so the DOM
  // element at the bottom of <body> exists before we update it).
  function _updateVersionStamp(){
    try{
      var stamp = document.getElementById('version-stamp');
      if(stamp){
        var w = window.innerWidth || document.documentElement.clientWidth;
        var t = (('ontouchstart' in window) || ((navigator.maxTouchPoints||0) > 0)) ? 'yes' : 'no';
        stamp.textContent = 'v'+APP_VERSION+' \u00B7 '+w+'px \u00B7 touch:'+t;
      }
    }catch(_){}
  }
  if(document.readyState==='complete')_updateVersionStamp();
  else window.addEventListener('load', _updateVersionStamp);
  if(!('serviceWorker' in navigator)) return;
  // Skip SW registration in preview sandboxes (Claude, ChatGPT, etc.) and file:// previews.
  // Real deployments (GitHub Pages, custom domains) will run normally.
  try{
    const h = location.hostname;
    const isPreview = /claudeusercontent|claude\.ai|openai\.com|chatgptusercontent|anthropic|codesandbox|stackblitz|codepen|jsfiddle|replit/i.test(h);
    const isFileOrEmpty = location.protocol === 'file:' || !h;
    if(isPreview || isFileOrEmpty){
      console.log('[pwa] preview/sandbox origin detected, skipping SW registration');
      return;
    }
  }catch(_){}
  window.addEventListener('load', function(){
    navigator.serviceWorker.register('./service-worker.js', {scope:'./'})
      .then(function(reg){
        console.log('[pwa] SW registered:', reg.scope);
        reg.addEventListener('updatefound', function(){
          const nw = reg.installing;
          if(!nw) return;
          nw.addEventListener('statechange', function(){
            if(nw.state === 'installed' && navigator.serviceWorker.controller){
              // A newer worker is waiting
              _pwaNewWorker = nw;
              const b = document.getElementById('pwa-update-banner');
              if(b) b.classList.add('show');
            }
          });
        });
      })
      .catch(function(err){ console.warn('[pwa] SW register failed:', err); });
    // Reload page when the active worker changes
    let _reloading = false;
    navigator.serviceWorker.addEventListener('controllerchange', function(){
      if(_reloading) return;
      _reloading = true;
      location.reload();
    });
  });

  // Android Chrome: capture install prompt
  window.addEventListener('beforeinstallprompt', function(e){
    e.preventDefault();
    _pwaDeferredPrompt = e;
    // Only show banner if the user hasn't dismissed it recently
    try{
      const dismissed = parseInt(localStorage.getItem('lifeos_pwa_dismissed')||'0', 10);
      if(Date.now() - dismissed < 7*24*60*60*1000) return; // within 7 days
    }catch(_){}
    const b = document.getElementById('pwa-install-banner');
    if(b) b.classList.add('show');
  });

  window.addEventListener('appinstalled', function(){
    try{updateSettingsInstallState();}catch(_){}
    const b = document.getElementById('pwa-install-banner');
    if(b) b.classList.remove('show');
    _pwaDeferredPrompt = null;
    try{ toast('LifeOS installed \u2713'); }catch(_){}
  });
}

function pwaInstall(){
  if(!_pwaDeferredPrompt) return;
  _pwaDeferredPrompt.prompt();
  _pwaDeferredPrompt.userChoice.then(function(choice){
    const b = document.getElementById('pwa-install-banner');
    if(b) b.classList.remove('show');
    _pwaDeferredPrompt = null;
    if(choice.outcome !== 'accepted'){
      try{ localStorage.setItem('lifeos_pwa_dismissed', String(Date.now())); }catch(_){}
    }
  });
}

function pwaDismissInstall(){
  const b = document.getElementById('pwa-install-banner');
  if(b) b.classList.remove('show');
  try{ localStorage.setItem('lifeos_pwa_dismissed', String(Date.now())); }catch(_){}
}

function pwaApplyUpdate(){
  if(_pwaNewWorker){
    _pwaNewWorker.postMessage({type:'SKIP_WAITING'});
  } else {
    location.reload();
  }
}

pwaInit();


/* \u2500\u2500 App boot \u2500\u2500 */
loadData();
asRestoreStatus();
// Ensure settings modal is closed on load
var _sm=document.getElementById('settings-modal');if(_sm)_sm.style.display='none';
archiveDoneTasks();
renderNav();
switchPage('dashboard');
checkReminders();
const _vn = document.getElementById('app-ver-num');
if(_vn) _vn.textContent = APP_VERSION;

