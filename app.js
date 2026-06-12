const OWNER = 'supermachotwist';
const API_ROOT = 'https://api.github.com';
const reposEl = document.getElementById('repos');
const statusEl = document.getElementById('status');
const searchEl = document.getElementById('search');
const sortEl = document.getElementById('sort');

let allRepos = [];
let readmeCache = {};

async function fetchRepos(){
  setStatus('Loading repositories…');
  try{
    const res = await fetch(`${API_ROOT}/users/${OWNER}/repos?per_page=200`);
    if(!res.ok) throw new Error(`GitHub API error: ${res.status}`);
    const data = await res.json();
    allRepos = data;
    renderRepos();
    setStatus(`${data.length} repositories loaded.`);
  }catch(err){
    setStatus('Failed to load repositories. ' + err.message);
  }
}

function setStatus(msg){
  statusEl.textContent = msg;
}

function renderRepos(){
  const q = searchEl.value.trim().toLowerCase();
  let list = allRepos.slice();
  const sort = sortEl.value;
  if(sort === 'stars') list.sort((a,b)=>b.stargazers_count - a.stargazers_count);
  else if(sort === 'name') list.sort((a,b)=>a.name.localeCompare(b.name));
  else list.sort((a,b)=>new Date(b.updated_at) - new Date(a.updated_at));

  if(q) list = list.filter(r=> (r.name + ' ' + (r.description||'')).toLowerCase().includes(q));

  reposEl.innerHTML = '';
  if(list.length===0){reposEl.innerHTML = '<div class="status">No repositories match.</div>';return}

  for(const repo of list){
    const card = document.createElement('article');
    card.className = 'repo-card';
    const title = document.createElement('h2');
    const a = document.createElement('a');
    a.rel='noopener'; a.textContent = repo.name;
    title.appendChild(a);
    const meta = document.createElement('div'); meta.className='meta';
    meta.innerHTML = `⭐ ${repo.stargazers_count} · ${repo.language || '—'} · Updated ${new Date(repo.updated_at).toLocaleDateString()}`;
    const desc = document.createElement('div'); desc.className='desc'; desc.textContent = repo.description || '';

    const btns = document.createElement('div'); btns.className='buttons';
    const readmeBtn = document.createElement('button'); readmeBtn.className='btn'; readmeBtn.textContent='View README';
    const visitBtn = document.createElement('a'); visitBtn.className='btn'; visitBtn.textContent='Open on GitHub'; visitBtn.href = repo.html_url; visitBtn.target='_blank'; visitBtn.rel='noopener';
    btns.appendChild(readmeBtn); btns.appendChild(visitBtn);

    const readmeWrap = document.createElement('div'); readmeWrap.className='readme'; readmeWrap.style.display='none';

    readmeBtn.addEventListener('click', async ()=>{
      if(readmeWrap.style.display === 'none'){
        readmeBtn.textContent = 'Loading…';
        try{
          const md = await loadReadme(repo);
          readmeWrap.innerHTML = marked.parse(md || '_No README found._');
          // highlight code blocks
          readmeWrap.querySelectorAll('pre code').forEach((block)=>{hljs.highlightElement(block)});
          readmeWrap.style.display = 'block';
          readmeBtn.textContent = 'Hide README';
        }catch(err){
          readmeWrap.innerHTML = `<div class="status">Failed to load README: ${err.message}</div>`;
          readmeWrap.style.display = 'block';
          readmeBtn.textContent = 'Hide README';
        }
      }else{
        readmeWrap.style.display = 'none';
        readmeBtn.textContent = 'View README';
      }
    });

    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(desc);
    card.appendChild(btns);
    card.appendChild(readmeWrap);
    reposEl.appendChild(card);
  }
}

async function loadReadme(repo){
  const cacheKey = repo.full_name;
  if(readmeCache[cacheKey]) return readmeCache[cacheKey];
  // Try the readme endpoint and request raw content
  const url = `${API_ROOT}/repos/${repo.full_name}/readme`;
  const res = await fetch(url, {headers: {'Accept': 'application/vnd.github.v3.raw'}});
  if(res.status === 404) { readmeCache[cacheKey] = null; return null; }
  if(!res.ok) throw new Error(`GitHub API ${res.status}`);
  const text = await res.text();
  readmeCache[cacheKey] = text;
  return text;
}

// events
searchEl.addEventListener('input', ()=>renderRepos());
sortEl.addEventListener('change', ()=>renderRepos());

// init
fetchRepos();
