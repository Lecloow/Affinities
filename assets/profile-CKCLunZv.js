import{S as d,A as m}from"./storage-vd1rG5Ao.js";class v{constructor(){this.contentEl=null,this.hintsData=null,this.refreshInterval=null,this.timerInterval=null,this.selectedDay=1,this.init(),window.addEventListener("beforeunload",()=>this.cleanup())}cleanup(){this.refreshInterval!==null&&(window.clearInterval(this.refreshInterval),this.refreshInterval=null),this.timerInterval!==null&&(window.clearInterval(this.timerInterval),this.timerInterval=null)}init(){this.contentEl=document.getElementById("content"),this.render(),this.refreshInterval=window.setInterval(()=>{this.loadAndRenderHints()},3e4),this.timerInterval=window.setInterval(()=>{this.updateTimersOnly()},1e3)}async render(){if(!this.contentEl)return;const t=d.getUser();if(!t){this.renderNotConnected();return}await this.renderProfile(t)}renderNotConnected(){this.contentEl&&(this.contentEl.innerHTML=`
      <div class="not-connected">
        <div class="error-state">Vous n'êtes pas connecté. Redirection...</div>
      </div>
    `,setTimeout(()=>{window.location.href="./index.html"},2e3))}async renderProfile(t){if(!this.contentEl)return;const i=`<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 13v-2H7V8l-5 4 5 4v-3z" fill="white"/>
      <path d="M20 3h-9c-1.103 0-2 .897-2 2v4h2V5h9v14h-9v-4H9v4c0 1.103.897 2 2 2h9c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2z" fill="white"/>
    </svg>`;this.contentEl.innerHTML=`
      <div class="page-wrapper">
        <!-- Top floral corners handled via CSS pseudo-elements on #app -->
        
        <!-- Header -->
        <header>
          <div class="page-header">
            <p class="greeting-text">👋 Salut ${t.first_name}!</p>
            <button class="logout-btn" onclick="logout()" aria-label="Se déconnecter">
              ${i}
            </button>
          </div>
          <div class="header-divider"></div>
        </header>

        <!-- Hints section -->
        <main id="hints-section">
          <div class="loading-state">Chargement des indices…</div>
        </main>

        <!-- Credits footer -->
        <footer class="credits">
          <p>Made with <span class="heart">❤️</span> by Thomas Conchon</p>
          <p>With the help of Thomas Sportisse and Lilian Delahaye</p>
          <p>Thanks to the Comité de promo 2026</p>
          <div class="credits-source-row">
            <span>Code source :</span>
            <a class="credits-github" href="#" target="_blank" rel="noopener">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="#ddd" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
              </svg>
              GitHub
            </a>
          </div>
        </footer>

        <!-- Bottom floral decorations -->
        <div class="bottom-flowers left"></div>
        <div class="bottom-flowers right"></div>
      </div>
    `,await this.loadAndRenderHints()}async loadAndRenderHints(){const t=d.getUser();if(t)try{this.hintsData=await m.getHints(t.id),this.renderHints()}catch(i){console.error("Error loading hints:",i);const n=document.getElementById("hints-section");n&&(n.innerHTML=`
          <div class="error-state">Impossible de charger les indices.<br>Les âmes soeurs n'ont peut-être pas encore été créés.</div>
        `)}}renderHints(){if(!this.hintsData||!this.contentEl)return;const t=document.getElementById("hints-section");if(!t)return;if(this.hintsData.days.length===0){t.innerHTML=`
        <div class="info-state">Les indices seront disponibles une fois les âmes soeurs créés.</div>
      `;return}let i="";this.hintsData.days.length>1&&(i=`<div class="segmented-control">${this.hintsData.days.map(r=>{const e=r.day===1?"Jeudi":"Vendredi";return`<button class="segment-btn ${r.day===this.selectedDay?"active":""}" data-day="${r.day}">${e}</button>`}).join("")}</div>`);const n=this.hintsData.days.find(s=>s.day===this.selectedDay)??this.hintsData.days[0];t.innerHTML=`
      <div class="page-content">
        ${i}
        ${this.renderDayHints(n)}
        ${this.renderRevealButton(n)}
      </div>
    `,t.querySelectorAll(".segment-btn").forEach(s=>{s.addEventListener("click",r=>{const e=r.target,a=parseInt(e.dataset.day||"1");a!==this.selectedDay&&(this.selectedDay=a,this.renderHints())})}),t.querySelectorAll(".global-reveal-btn").forEach(s=>{s.addEventListener("click",async r=>{const e=r.target,a=parseInt(e.dataset.day||"0");a&&await this.handleRevealAllHints(a)})})}renderRevealButton(t){const i=t.hints.filter(r=>r.available&&!r.revealed).length,n=i===0?"Révéler un indice":i===1?"Révéler l'indice disponible":`Révéler les ${i} indices disponibles`,s=i===0?"disabled":"";return`
      <div class="reveal-btn-container">
        <button class="global-reveal-btn" data-day="${t.day}" ${s}>${n}</button>
      </div>
    `}async handleRevealAllHints(t){const i=d.getUser();if(i)try{const n=document.querySelector(`.global-reveal-btn[data-day="${t}"]`);n&&(n.disabled=!0,n.textContent="Révélation en cours…");const s=await m.revealAllHints(i.id,t);await this.loadAndRenderHints(),s.revealed_count>0&&console.log(`${s.revealed_count} hint(s) revealed successfully`)}catch(n){console.error("Error revealing hints:",n),alert("Erreur lors de la révélation des indices. Veuillez réessayer."),await this.loadAndRenderHints()}}getHintTimeTagHtml(t){const i=new Date,n=new Date(t.drop_time);if(t.revealed||t.available){const s=i.getTime()-n.getTime(),r=Math.floor(s/6e4),e=Math.floor(r/60),a=r%60;let o;return e>0?o=`${e}h${a>0?` ${a}min`:""}`:a>0?o=`${a} min`:o="1 min",`<span class="time-tag"><span>Il y a</span><span>${o}</span></span>`}else{const s=n.getTime()-i.getTime();if(s<=0)return'<span class="time-tag">Disponible !</span>';const r=Math.floor(s%(1e3*60*60)/6e4),e=Math.floor(s%6e4/1e3);if(s<60*60*1e3){const a=r>0?`${r}min ${e}s`:`${e}s`;return`<span class="time-tag" data-timer data-target="${n.toISOString()}"><span>Dans</span><span class="timer-value">${a}</span></span>`}else return`<span class="time-tag"><span>A</span><span>${n.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}).replace(":","h")}</span></span>`}}getRevealTimeTagHtml(t,i){const n=new Date;if(i){const o=n.getTime()-t.getTime(),l=Math.floor(o/6e4),c=Math.floor(l/60),h=l%60;return`<span class="time-tag"><span>Il y a</span><span>${c>0?`${c}h${h>0?` ${h}min`:""}`:`${l>0?l:1} min`}</span></span>`}const s=t.getTime()-n.getTime();if(s<=0)return'<span class="time-tag">Maintenant !</span>';const r=Math.floor(s%(1e3*60*60)/6e4),e=Math.floor(s%6e4/1e3);if(s<60*60*1e3){const o=r>0?`${r}min ${e}s`:`${e}s`;return`<span class="time-tag" data-timer data-target="${t.toISOString()}"><span>Dans</span><span class="timer-value">${o}</span></span>`}return`<span class="time-tag"><span>A</span><span>${t.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}).replace(":","h")}</span></span>`}renderHintContent(t){const i=t.match(/^(.+?:\s*)([A-ZÀ-ÖØ-Ý])$/i);if(i){const e=i[1],a=i[2].toUpperCase();return`
        <div class="hint-content-row">
          <span class="hint-content-text">${e}</span>
          <span class="letter-tag">${a}</span>
        </div>
      `}const n=t.match(/^(Son prénom est:\s*)(.+)$/i);if(n){const e=n[1],a=n[2];return`
        <div class="hint-content-row">
          <span class="hint-content-text">${e}</span>
          <span class="pink-box">${a}</span>
        </div>
      `}const s=t.match(/^(.+\s)(\d+)(\s.+)$/);if(s){const e=s[1],a=s[2],o=s[3];return`
        <div class="hint-content-row">
          <span class="hint-content-text">${e}</span>
          <span class="pink-box">${a}</span>
          <span class="hint-content-text">${o}</span>
        </div>
      `}const r=t.match(/^(Il\/Elle est dans la classe:\s*)(.+)$/i);if(r){const e=r[1],a=r[2];return`
        <div class="hint-content-row">
          <span class="hint-content-text">${e}</span>
          <span class="pink-box">${a}</span>
        </div>
      `}return`
      <div class="hint-content-row">
        <span class="hint-content-text">${t}</span>
      </div>
    `}renderDayHints(t){const i=new Date(t.reveal_time);let n="";t.hints.forEach((e,a)=>{const o=e.available&&e.revealed?"revealed":(e.available&&!e.revealed,"undiscovered"),l=`Indice n°${a+1}`,c=this.getHintTimeTagHtml(e);n+=`
        <div class="hint-row">
          <span class="hint-badge ${o}">${l}</span>
          ${c}
        </div>
      `,e.revealed&&e.content&&(n+=this.renderHintContent(e.content))});const s=t.match_revealed?"reveal-badge revealed":"reveal-badge",r=this.getRevealTimeTagHtml(i,t.match_revealed);if(n+=`
      <div class="section-divider"></div>
      <div class="hint-row">
        <span class="hint-badge ${s}">Reveal</span>
        ${r}
      </div>
    `,t.match_revealed&&t.match_info){const e=t.day===1?"Jeudi 12 Février":"Vendredi 13 Février";n+=`
        <div class="match-revealed-card">
          <p class="match-title">Ton âme soeur du ${e}</p>
          <p class="match-name">${t.match_info.first_name} ${t.match_info.last_name}</p>
          <p class="match-class">${t.match_info.class}</p>
        </div>
      `}return n}updateTimersOnly(){if(!this.hintsData)return;document.querySelectorAll("[data-timer]").forEach(i=>{const n=i.dataset.target;if(!n)return;const s=new Date(n),r=new Date,e=s.getTime()-r.getTime(),a=i.querySelector(".timer-value");if(!a)return;if(e<=0){a.textContent="maintenant !",this.loadAndRenderHints();return}const o=Math.floor(e%(1e3*60*60)/6e4),l=Math.floor(e%6e4/1e3),c=o>0?`${o}min ${l}s`:`${l}s`;a.textContent=c})}}window.logout=function(){d.clearUser(),window.location.href="./index.html"};document.addEventListener("DOMContentLoaded",()=>{new v});
