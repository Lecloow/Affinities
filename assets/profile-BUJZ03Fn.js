import{S as m,A as p}from"./storage-cCMpemRP.js";/* empty css                */class C{constructor(){this.contentEl=null,this.hintsData=null,this.userStats=null,this.candidates=null,this.refreshInterval=null,this.timerInterval=null,this.selectedDay=1,this.init(),window.addEventListener("beforeunload",()=>this.cleanup())}adjustServerTime(e){const s=new Date(e);return s.setHours(s.getHours()+1),s}cleanup(){this.refreshInterval!==null&&(window.clearInterval(this.refreshInterval),this.refreshInterval=null),this.timerInterval!==null&&(window.clearInterval(this.timerInterval),this.timerInterval=null)}init(){this.contentEl=document.getElementById("content"),this.render(),this.refreshInterval=window.setInterval(()=>{this.loadAndRenderHints()},3e4),this.timerInterval=window.setInterval(()=>{this.updateTimersOnly()},1e3)}async render(){if(!this.contentEl)return;const e=m.getUser();if(!e){this.renderNotConnected();return}await this.renderProfile(e)}renderNotConnected(){this.contentEl&&(this.contentEl.innerHTML=`
      <div class="not-connected">
        <div class="error-state">Vous n'êtes pas connecté. Redirection...</div>
      </div>
    `,setTimeout(()=>{window.location.href="./index.html"},2e3))}async renderProfile(e){if(!this.contentEl)return;const s=`<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 13v-2H7V8l-5 4 5 4v-3z" fill="white"/>
      <path d="M20 3h-9c-1.103 0-2 .897-2 2v4h2V5h9v14h-9v-4H9v4c0 1.103.897 2 2 2h9c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2z" fill="white"/>
    </svg>`;this.contentEl.innerHTML=`
      <div class="page-wrapper">
        <!-- Top floral corners handled via CSS pseudo-elements on #app -->
        
        <!-- Header -->
        <header>
          <div class="page-header">
            <p class="greeting-text">👋 Salut ${e.first_name}!</p>
            <button class="logout-btn" onclick="logout()" aria-label="Se déconnecter">
              ${s}
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
            <a class="credits-github" href="https://github.com/Lecloow/SaintValentin_Event" target="_blank" rel="noopener">
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
    `,await this.loadAndRenderHints()}async loadAndRenderHints(){const e=m.getUser();if(e)try{const[s,t,a]=await Promise.all([p.getHints(e.id),p.getUserStats(e.id).catch(i=>(console.warn("Failed to load user stats:",i),{user_id:e.id,total_points:0,code_exchange_bonus:0,guesses:[]})),p.getCandidates(e.id).catch(i=>(console.warn("Failed to load candidates:",i),{candidates:[]}))]);this.hintsData=s,this.userStats=t,this.candidates=a,this.renderHints()}catch(s){console.error("Error loading hints:",s);const t=document.getElementById("hints-section");t&&(t.innerHTML=`
        <div class="error-state">
          Impossible de charger les indices.<br>
          Les âmes soeurs n'ont peut-être pas encore été créés.
        </div>
      `)}}renderHints(){if(!this.hintsData||!this.contentEl)return;const e=document.getElementById("hints-section");if(!e)return;if(this.hintsData.days.length===0){e.innerHTML=`
        <div class="info-state">Les indices seront disponibles une fois les âmes soeurs créés.</div>
      `;return}let s="";this.hintsData.days.length>1&&(s=`<div class="segmented-control">${this.hintsData.days.map(o=>{const l=o.day===1?"Jeudi":"Vendredi";return`<button class="segment-btn ${o.day===this.selectedDay?"active":""}" data-day="${o.day}">${l}</button>`}).join("")}</div>`);const t=this.hintsData.days.find(r=>r.day===this.selectedDay)??this.hintsData.days[0];e.innerHTML=`
      <div class="page-content">
        ${this.renderUserScore()}
        ${s}
        ${this.renderDayHints(t)}
        ${this.renderRevealButton(t)}
        ${this.renderGuessSection(t)}
        ${this.renderRevealCodeSection(t)}
      </div>
    `,e.querySelectorAll(".segment-btn").forEach(r=>{r.addEventListener("click",o=>{const l=o.target,d=parseInt(l.dataset.day||"1");d!==this.selectedDay&&(this.selectedDay=d,this.renderHints())})}),e.querySelectorAll(".global-reveal-btn").forEach(r=>{r.addEventListener("click",async o=>{const l=o.target,d=parseInt(l.dataset.day||"0");d&&await this.handleRevealAllHints(d)})});const a=e.querySelector(".guess-form"),i=e.querySelector(".guess-input"),n=e.querySelector(".autocomplete-dropdown");if(i&&n&&this.candidates){let r=null;i.addEventListener("input",o=>{const l=o.target.value.toLowerCase().trim();if(r=null,l.length===0){n.style.display="none";return}const d=this.candidates.candidates.filter(u=>u.first_name.toLowerCase().includes(l)||u.last_name.toLowerCase().includes(l));if(d.length===0){n.style.display="none";return}n.innerHTML=d.map(u=>`<div class="autocomplete-item" data-id="${u.id}">${u.first_name} ${u.last_name}</div>`).join(""),n.style.display="block",n.querySelectorAll(".autocomplete-item").forEach(u=>{u.addEventListener("click",()=>{const h=u.dataset.id,g=this.candidates.candidates.find(f=>f.id===h);g&&(i.value=`${g.first_name} ${g.last_name}`,r=h,n.style.display="none")})})}),document.addEventListener("click",o=>{!i.contains(o.target)&&!n.contains(o.target)&&(n.style.display="none")}),a&&a.addEventListener("submit",async o=>{o.preventDefault(),r?await this.handleSubmitGuess(this.selectedDay,r):alert("Veuillez sélectionner une personne dans la liste")})}const c=e.querySelector(".code-exchange-form");c&&c.addEventListener("submit",async r=>{r.preventDefault();const o=c.querySelector(".code-exchange-input");o&&o.value&&await this.handleExchangeCode(this.selectedDay,o.value)})}renderRevealButton(e){const s=e.hints.filter(i=>i.available&&!i.revealed).length,t=s===0?"Révéler un indice":s===1?"Révéler l'indice disponible":`Révéler les ${s} indices disponibles`,a=s===0?"disabled":"";return`
      <div class="reveal-btn-container">
        <button class="global-reveal-btn" data-day="${e.day}" ${a}>${t}</button>
      </div>
    `}async handleRevealAllHints(e){const s=m.getUser();if(s)try{const t=document.querySelector(`.global-reveal-btn[data-day="${e}"]`);t&&(t.disabled=!0,t.textContent="Révélation en cours…");const a=await p.revealAllHints(s.id,e);await this.loadAndRenderHints(),a.revealed_count>0&&console.log(`${a.revealed_count} hint(s) revealed successfully`)}catch(t){console.error("Error revealing hints:",t),alert("Erreur lors de la révélation des indices. Veuillez réessayer."),await this.loadAndRenderHints()}}getTimeTagHtml(e,s){const t=new Date,a=e.getTime()-t.getTime();if(s.isActive){const r=t.getTime()-e.getTime(),o=Math.floor(r/6e4),l=Math.floor(o/60),d=o%60;let u;return l>0?u=`${l}h${d>0?` ${d}min`:""}`:u=`${o>0?o:1} min`,`<span class="time-tag"><span>Il y a</span><span>${u}</span></span>`}if(a<=0)return`<span class="time-tag">${s.nowLabel??"Maintenant !"}</span>`;const i=Math.floor(a%(1e3*60*60)/6e4),n=Math.floor(a%6e4/1e3);if(a<60*60*1e3){const r=i>0?`${i}min ${n}s`:`${n}s`;return`<span class="time-tag" data-timer data-target="${e.toISOString()}">
                <span>Dans</span>
                <span class="timer-value">${r}</span>
              </span>`}return`<span class="time-tag"><span>A</span><span>${e.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}).replace(":","h")}</span></span>`}getHintTimeTagHtml(e){const s=this.adjustServerTime(e.drop_time);return this.getTimeTagHtml(s,{isActive:e.revealed||e.available,nowLabel:"Disponible !"})}getRevealTimeTagHtml(e,s){const t=this.adjustServerTime(e);return this.getTimeTagHtml(t,{isActive:s,nowLabel:"Maintenant !"})}renderHintContent(e){const s=e.match(/^(.+?:\s*)([A-ZÀ-ÖØ-Ý])$/i);if(s){const n=s[1],c=s[2].toUpperCase();return`
        <div class="hint-content-row">
          <span class="hint-content-text">${n}</span>
          <span class="letter-tag">${c}</span>
        </div>
      `}const t=e.match(/^(Son prénom est:\s*)(.+)$/i);if(t){const n=t[1],c=t[2];return`
        <div class="hint-content-row">
          <span class="hint-content-text">${n}</span>
          <span class="pink-box">${c}</span>
        </div>
      `}const a=e.match(/^(.+\s)(\d+)(\s.+)$/);if(a){const n=a[1],c=a[2],r=a[3];return`
        <div class="hint-content-row">
          <span class="hint-content-text">${n}</span>
          <span class="pink-box">${c}</span>
          <span class="hint-content-text">${r}</span>
        </div>
      `}const i=e.match(/^(Il\/Elle est dans la classe:\s*)(.+)$/i);if(i){const n=i[1],c=i[2];return`
        <div class="hint-content-row">
          <span class="hint-content-text">${n}</span>
          <span class="pink-box">${c}</span>
        </div>
      `}return`
      <div class="hint-content-row">
        <span class="hint-content-text">${e}</span>
      </div>
    `}renderDayHints(e){const s=new Date(e.reveal_time);let t="";e.hints.forEach((n,c)=>{const r=n.available&&n.revealed?"revealed":(n.available&&!n.revealed,"undiscovered"),o=`Indice n°${c+1}`,l=this.getHintTimeTagHtml(n);t+=`
        <div class="hint-row">
          <span class="hint-badge ${r}">${o}</span>
          ${l}
        </div>
      `,n.revealed&&n.content&&(t+=this.renderHintContent(n.content))});const a=e.match_revealed?"reveal-badge revealed":"reveal-badge",i=this.getRevealTimeTagHtml(s,e.match_revealed);if(t+=`
      <div class="section-divider"></div>
      <div class="hint-row">
        <span class="hint-badge ${a}">Reveal</span>
        ${i}
      </div>
    `,e.match_revealed&&e.match_info){const n=e.day===1?"Jeudi 12 Février":"Vendredi 13 Février";t+=`
        <div class="match-revealed-card">
          <p class="match-title">Ton âme soeur du ${n}</p>
          <p class="match-name">${e.match_info.first_name} ${e.match_info.last_name}</p>
          <p class="match-class">${e.match_info.class}</p>
        </div>
      `}return t}updateTimersOnly(){if(!this.hintsData)return;document.querySelectorAll("[data-timer]").forEach(s=>{const t=s.dataset.target;if(!t)return;const a=new Date(t),i=new Date,n=a.getTime()-i.getTime(),c=s.querySelector(".timer-value");if(!c)return;if(n<=0){c.textContent="maintenant !",this.loadAndRenderHints();return}const r=Math.floor(n%(1e3*60*60)/6e4),o=Math.floor(n%6e4/1e3),l=r>0?`${r}min ${o}s`:`${o}s`;c.textContent=l})}renderUserScore(){return this.userStats?`
      <div class="user-score-section">
        <div class="user-score-label">Ton Score Total</div>
        <div class="user-score-value">${this.userStats.total_points} pts</div>
        <a href="./leaderboard.html" class="leaderboard-link-btn">Voir le classement 🏆</a>
      </div>
    `:""}renderGuessSection(e){var $,w,S,x;if(!m.getUser()||!this.candidates)return"";const t=new Date(e.reveal_time);if(new Date>=t)return`
        <div class="guess-section disabled">
          <div class="guess-title">🎯 Deviner mon âme sœur</div>
          <div class="guess-result info">
            Le temps pour deviner est écoulé. L'identité a été révélée!
          </div>
        </div>
      `;const i=(($=this.userStats)==null?void 0:$.guesses.filter(v=>v.day===e.day))||[],n=e.hints,c=((w=n[0])==null?void 0:w.revealed)||!1,r=((S=n[1])==null?void 0:S.revealed)||!1,o=((x=n[2])==null?void 0:x.revealed)||!1,l=i.some(v=>v.hint_number===1),d=i.some(v=>v.hint_number===2),u=i.some(v=>v.hint_number===3);let h=0;c&&!l?h=1:r&&!d?h=2:o&&!u&&(h=3);const g=[c,r,o].filter(Boolean).length;let f=0;g===1?f=100:g===2?f=75:g===3&&(f=50);let b="";return i.length>0&&(b='<div class="guess-history">',b+='<div class="guess-history-title">Tes tentatives:</div>',i.forEach(v=>{var H;const T=v.is_correct?"✓":"✗",E=v.is_correct?"success":"error",y=(H=this.candidates)==null?void 0:H.candidates.find(D=>D.id===v.guessed_user_id),_=y?`${y.first_name} ${y.last_name}`:"Inconnu";b+=`
          <div class="guess-history-item ${E}">
            ${T} Indice ${v.hint_number}: ${_} ${v.is_correct?`(+${v.points_earned}pts)`:""}
          </div>
        `}),b+="</div>"),h===0?[c,r,o].filter(Boolean).length===0?`
          <div class="guess-section disabled">
            <div class="guess-title">🎯 Deviner mon âme sœur</div>
            <div class="guess-description">
              Révèles au moins un indice pour pouvoir deviner qui est ton âme sœur!
            </div>
          </div>
        `:`
          <div class="guess-section disabled">
            <div class="guess-title">🎯 Deviner mon âme sœur</div>
            ${b}
            <div class="guess-description">
              Révèles le prochain indice pour faire une nouvelle tentative!
            </div>
          </div>
        `:`
      <div class="guess-section" data-hint-number="${h}">
        <div class="guess-title">🎯 Deviner mon âme sœur (Indice ${h})</div>
        ${b}
        <div class="guess-description">
          Si tu devines correctement avec cet indice, tu gagneras <strong>${f} points</strong>!
        </div>
        <form class="guess-form">
          <div class="autocomplete-container">
            <input 
              type="text" 
              class="guess-input" 
              placeholder="Tapes le prénom ou nom..." 
              autocomplete="off"
              required
            />
            <div class="autocomplete-dropdown" style="display: none;"></div>
          </div>
          <button type="submit" class="guess-submit-btn">Valider mon choix</button>
        </form>
      </div>
    `}calculateGuessPoints(e){return{1:100,2:75,3:50}[e]||0}async handleSubmitGuess(e,s){var r,o;const t=m.getUser();if(!t)return;const a=(r=this.hintsData)==null?void 0:r.days.find(l=>l.day===e);if(!a){alert("Impossible de trouver les indices pour ce jour");return}const i=((o=this.userStats)==null?void 0:o.guesses.filter(l=>l.day===e))||[],n=a.hints.find((l,d)=>{const u=i.some(h=>h.hint_number===d+1);return l.revealed&&!u}),c=n?a.hints.indexOf(n)+1:0;if(c===0){alert("Aucun indice disponible pour deviner pour le moment !");return}try{const l=document.querySelector(".guess-form"),d=l==null?void 0:l.querySelector(".guess-submit-btn");d&&(d.disabled=!0,d.textContent="Envoi en cours...");const u=await p.submitGuess(t.id,e,c,s);await this.loadAndRenderHints(),u.is_correct?alert(`🎉 ${u.message}

Tu gagne ${u.points_earned} points!`):alert(`😔 ${u.message}`)}catch(l){console.error("Error submitting guess:",l),alert(l.message||"Erreur lors de l'envoi de ta réponse. Veuillez réessayer."),await this.loadAndRenderHints()}finally{const l=document.querySelector(".guess-form"),d=l==null?void 0:l.querySelector(".guess-submit-btn");d&&(d.disabled=!1,d.textContent="Valider mon choix")}}renderRevealCodeSection(e){if(!e.match_revealed)return"";const s=m.getUser();return s?(this.loadRevealCode(s.id,e.day),`<div id="reveal-code-container-${e.day}"></div>`):""}async loadRevealCode(e,s){try{const t=await p.getRevealCode(e,s),a=document.getElementById(`reveal-code-container-${s}`);if(!a)return;if(!t.available){a.innerHTML="";return}if(t.both_exchanged){a.innerHTML=`
        <div class="reveal-code-section">
          <div class="reveal-code-title">🎁 Code d'échange</div>
          <div class="code-exchange-success">
            ✓ Vous avez tous les deux échangé vos codes! Félicitations! 🎉
          </div>
        </div>
      `;return}const i=t.exchanged?'<div class="code-exchange-pending">⏳ En attente que ton âme sœur échange son code...</div>':"";a.innerHTML=`
      <div class="reveal-code-section">
        <div class="reveal-code-title">🎁 Ton Code Secret</div>
        <div class="reveal-code-display">
          <div class="reveal-code-value">${t.code}</div>
        </div>
        ${i}
        <div class="reveal-code-description">
          Partages ce code avec ton âme sœur! Si vous échangez vos codes, vous gagnerez tous les deux <strong>100 points bonus</strong>!
        </div>
        <form class="code-exchange-form">
          <input 
            type="text" 
            class="code-exchange-input" 
            placeholder="Code de ton âme sœur" 
            maxlength="6"
            ${t.exchanged?"disabled":""}
            required
          />
          <button type="submit" class="code-exchange-btn" ${t.exchanged?"disabled":""}>
            ${t.exchanged?"Code déjà échangé":"Échanger le code"}
          </button>
        </form>
      </div>
    `;const n=a.querySelector(".code-exchange-form");n&&!t.exchanged&&n.addEventListener("submit",async c=>{c.preventDefault();const r=n.querySelector(".code-exchange-input");r&&r.value&&await this.handleExchangeCode(s,r.value)})}catch(t){console.error("Error loading reveal code:",t)}}async handleExchangeCode(e,s){const t=m.getUser();if(t)try{const a=document.querySelector(".code-exchange-form"),i=a==null?void 0:a.querySelector(".code-exchange-btn");i&&(i.disabled=!0,i.textContent="Échange en cours...");const n=await p.exchangeCode(t.id,e,s.toUpperCase());await this.loadAndRenderHints(),alert(`🎉 ${n.message}

Tu gagne ${n.points_earned} points bonus!`)}catch(a){console.error("Error exchanging code:",a),alert(a.message||"Code invalide ou erreur lors de l'échange. Veuillez vérifier et réessayer."),await this.loadAndRenderHints()}}}window.logout=function(){m.clearUser(),window.location.href="./index.html"};document.addEventListener("DOMContentLoaded",()=>{new C});
