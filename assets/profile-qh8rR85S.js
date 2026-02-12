import{S as g,A as f}from"./storage-CNG1vvmV.js";/* empty css                */class E{constructor(){this.contentEl=null,this.hintsData=null,this.userStats=null,this.candidates=null,this.refreshInterval=null,this.timerInterval=null,this.selectedDay=1,this.init(),window.addEventListener("beforeunload",()=>this.cleanup())}adjustServerTime(e){const a=new Date(e);return a.setHours(a.getHours()+1),a}cleanup(){this.refreshInterval!==null&&(window.clearInterval(this.refreshInterval),this.refreshInterval=null),this.timerInterval!==null&&(window.clearInterval(this.timerInterval),this.timerInterval=null)}init(){this.contentEl=document.getElementById("content"),this.render(),this.refreshInterval=window.setInterval(()=>{this.loadAndRenderHints()},3e4),this.timerInterval=window.setInterval(()=>{this.updateTimersOnly()},1e3)}async render(){if(!this.contentEl)return;const e=g.getUser();if(!e){this.renderNotConnected();return}await this.renderProfile(e)}renderNotConnected(){this.contentEl&&(this.contentEl.innerHTML=`
      <div class="not-connected">
        <div class="error-state">Vous n'êtes pas connecté. Redirection...</div>
      </div>
    `,setTimeout(()=>{window.location.href="./index.html"},2e3))}async renderProfile(e){if(!this.contentEl)return;const a=`<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
              ${a}
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
    `,await this.loadAndRenderHints()}async loadAndRenderHints(){const e=g.getUser();if(e)try{const[a,s,i]=await Promise.all([f.getHints(e.id),f.getUserStats(e.id).catch(r=>(console.warn("Failed to load user stats:",r),{user_id:e.id,total_points:0,code_exchange_bonus:0,guesses:[]})),f.getCandidates(e.id).catch(r=>(console.warn("Failed to load candidates:",r),{candidates:[]}))]);if(this.hintsData=a,this.userStats=s,this.candidates=i,this.hintsData){let r=0;this.hintsData.hint1_revealed&&r++,this.hintsData.hint2_revealed&&r++,this.hintsData.hint3_revealed&&r++,this.currentHintNumber=r}else this.currentHintNumber=0;this.renderHints()}catch(a){console.error("Error loading hints:",a);const s=document.getElementById("hints-section");s&&(s.innerHTML=`
        <div class="error-state">
          Impossible de charger les indices.<br>
          Les âmes soeurs n'ont peut-être pas encore été créés.
        </div>
      `)}}renderHints(){if(!this.hintsData||!this.contentEl)return;const e=document.getElementById("hints-section");if(!e)return;if(this.hintsData.days.length===0){e.innerHTML=`
        <div class="info-state">Les indices seront disponibles une fois les âmes soeurs créés.</div>
      `;return}let a="";this.hintsData.days.length>1&&(a=`<div class="segmented-control">${this.hintsData.days.map(n=>{const c=n.day===1?"Jeudi":"Vendredi";return`<button class="segment-btn ${n.day===this.selectedDay?"active":""}" data-day="${n.day}">${c}</button>`}).join("")}</div>`);const s=this.hintsData.days.find(o=>o.day===this.selectedDay)??this.hintsData.days[0];e.innerHTML=`
      <div class="page-content">
        ${this.renderUserScore()}
        ${a}
        ${this.renderDayHints(s)}
        ${this.renderRevealButton(s)}
        ${this.renderGuessSection(s)}
        ${this.renderRevealCodeSection(s)}
      </div>
    `,e.querySelectorAll(".segment-btn").forEach(o=>{o.addEventListener("click",n=>{const c=n.target,d=parseInt(c.dataset.day||"1");d!==this.selectedDay&&(this.selectedDay=d,this.renderHints())})}),e.querySelectorAll(".global-reveal-btn").forEach(o=>{o.addEventListener("click",async n=>{const c=n.target,d=parseInt(c.dataset.day||"0");d&&await this.handleRevealAllHints(d)})});const i=e.querySelector(".guess-form"),r=e.querySelector(".guess-input"),t=e.querySelector(".autocomplete-dropdown");if(r&&t&&this.candidates){let o=null;r.addEventListener("input",n=>{const c=n.target.value.toLowerCase().trim();if(o=null,c.length===0){t.style.display="none";return}const d=this.candidates.candidates.filter(h=>h.first_name.toLowerCase().includes(c)||h.last_name.toLowerCase().includes(c));if(d.length===0){t.style.display="none";return}t.innerHTML=d.map(h=>`<div class="autocomplete-item" data-id="${h.id}">${h.first_name} ${h.last_name}</div>`).join(""),t.style.display="block",t.querySelectorAll(".autocomplete-item").forEach(h=>{h.addEventListener("click",()=>{const v=h.dataset.id,m=this.candidates.candidates.find(p=>p.id===v);m&&(r.value=`${m.first_name} ${m.last_name}`,o=v,t.style.display="none")})})}),document.addEventListener("click",n=>{!r.contains(n.target)&&!t.contains(n.target)&&(t.style.display="none")}),i&&i.addEventListener("submit",async n=>{n.preventDefault(),o?await this.handleSubmitGuess(this.selectedDay,o):alert("Veuillez sélectionner une personne dans la liste")})}const l=e.querySelector(".code-exchange-form");l&&l.addEventListener("submit",async o=>{o.preventDefault();const n=l.querySelector(".code-exchange-input");n&&n.value&&await this.handleExchangeCode(this.selectedDay,n.value)})}renderRevealButton(e){const a=e.hints.filter(r=>r.available&&!r.revealed).length,s=a===0?"Révéler un indice":a===1?"Révéler l'indice disponible":`Révéler les ${a} indices disponibles`,i=a===0?"disabled":"";return`
      <div class="reveal-btn-container">
        <button class="global-reveal-btn" data-day="${e.day}" ${i}>${s}</button>
      </div>
    `}async handleRevealAllHints(e){const a=g.getUser();if(a)try{const s=document.querySelector(`.global-reveal-btn[data-day="${e}"]`);s&&(s.disabled=!0,s.textContent="Révélation en cours…");const i=await f.revealAllHints(a.id,e);await this.loadAndRenderHints(),i.revealed_count>0&&console.log(`${i.revealed_count} hint(s) revealed successfully`)}catch(s){console.error("Error revealing hints:",s),alert("Erreur lors de la révélation des indices. Veuillez réessayer."),await this.loadAndRenderHints()}}getHintTimeTagHtml(e){const a=new Date,s=this.adjustServerTime(e.drop_time);if(e.revealed||e.available){const i=a.getTime()-s.getTime(),r=Math.floor(i/6e4),t=Math.floor(r/60),l=r%60;let o;return t>0?o=`${t}h${l>0?` ${l}min`:""}`:l>0?o=`${l} min`:o="1 min",`<span class="time-tag"><span>Il y a</span><span>${o}</span></span>`}else{const i=s.getTime()-a.getTime();if(i<=0)return'<span class="time-tag">Disponible !</span>';const r=Math.floor(i%(1e3*60*60)/6e4),t=Math.floor(i%6e4/1e3);if(i<60*60*1e3){const l=r>0?`${r}min ${t}s`:`${t}s`;return`<span class="time-tag" data-timer data-target="${s.toISOString()}"><span>Dans</span><span class="timer-value">${l}</span></span>`}else return`<span class="time-tag"><span>A</span><span>${s.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}).replace(":","h")}</span></span>`}}getRevealTimeTagHtml(e,a){const s=new Date;if(a){const o=s.getTime()-e.getTime(),n=Math.floor(o/6e4),c=Math.floor(n/60),d=n%60;return`<span class="time-tag"><span>Il y a</span><span>${c>0?`${c}h${d>0?` ${d}min`:""}`:`${n>0?n:1} min`}</span></span>`}const i=e.getTime()-s.getTime();if(i<=0)return'<span class="time-tag">Maintenant !</span>';const r=Math.floor(i%(1e3*60*60)/6e4),t=Math.floor(i%6e4/1e3);if(i<60*60*1e3){const o=r>0?`${r}min ${t}s`:`${t}s`;return`<span class="time-tag" data-timer data-target="${e.toISOString()}"><span>Dans</span><span class="timer-value">${o}</span></span>`}return`<span class="time-tag"><span>A</span><span>${e.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}).replace(":","h")}</span></span>`}renderHintContent(e){const a=e.match(/^(.+?:\s*)([A-ZÀ-ÖØ-Ý])$/i);if(a){const t=a[1],l=a[2].toUpperCase();return`
        <div class="hint-content-row">
          <span class="hint-content-text">${t}</span>
          <span class="letter-tag">${l}</span>
        </div>
      `}const s=e.match(/^(Son prénom est:\s*)(.+)$/i);if(s){const t=s[1],l=s[2];return`
        <div class="hint-content-row">
          <span class="hint-content-text">${t}</span>
          <span class="pink-box">${l}</span>
        </div>
      `}const i=e.match(/^(.+\s)(\d+)(\s.+)$/);if(i){const t=i[1],l=i[2],o=i[3];return`
        <div class="hint-content-row">
          <span class="hint-content-text">${t}</span>
          <span class="pink-box">${l}</span>
          <span class="hint-content-text">${o}</span>
        </div>
      `}const r=e.match(/^(Il\/Elle est dans la classe:\s*)(.+)$/i);if(r){const t=r[1],l=r[2];return`
        <div class="hint-content-row">
          <span class="hint-content-text">${t}</span>
          <span class="pink-box">${l}</span>
        </div>
      `}return`
      <div class="hint-content-row">
        <span class="hint-content-text">${e}</span>
      </div>
    `}renderDayHints(e){const a=new Date(e.reveal_time);let s="";e.hints.forEach((t,l)=>{const o=t.available&&t.revealed?"revealed":(t.available&&!t.revealed,"undiscovered"),n=`Indice n°${l+1}`,c=this.getHintTimeTagHtml(t);s+=`
        <div class="hint-row">
          <span class="hint-badge ${o}">${n}</span>
          ${c}
        </div>
      `,t.revealed&&t.content&&(s+=this.renderHintContent(t.content))});const i=e.match_revealed?"reveal-badge revealed":"reveal-badge",r=this.getRevealTimeTagHtml(a,e.match_revealed);if(s+=`
      <div class="section-divider"></div>
      <div class="hint-row">
        <span class="hint-badge ${i}">Reveal</span>
        ${r}
      </div>
    `,e.match_revealed&&e.match_info){const t=e.day===1?"Jeudi 12 Février":"Vendredi 13 Février";s+=`
        <div class="match-revealed-card">
          <p class="match-title">Ton âme soeur du ${t}</p>
          <p class="match-name">${e.match_info.first_name} ${e.match_info.last_name}</p>
          <p class="match-class">${e.match_info.class}</p>
        </div>
      `}return s}updateTimersOnly(){if(!this.hintsData)return;document.querySelectorAll("[data-timer]").forEach(a=>{const s=a.dataset.target;if(!s)return;const i=new Date(s),r=new Date,t=i.getTime()-r.getTime(),l=a.querySelector(".timer-value");if(!l)return;if(t<=0){l.textContent="maintenant !",this.loadAndRenderHints();return}const o=Math.floor(t%(1e3*60*60)/6e4),n=Math.floor(t%6e4/1e3),c=o>0?`${o}min ${n}s`:`${n}s`;l.textContent=c})}renderUserScore(){return this.userStats?`
      <div class="user-score-section">
        <div class="user-score-label">Ton Score Total</div>
        <div class="user-score-value">${this.userStats.total_points} pts</div>
        <a href="./leaderboard.html" class="leaderboard-link-btn">Voir le classement 🏆</a>
      </div>
    `:""}renderGuessSection(e){var $,y,w,S;if(!g.getUser()||!this.candidates)return"";const s=new Date(e.reveal_time);if(new Date>=s)return`
        <div class="guess-section disabled">
          <div class="guess-title">🎯 Deviner mon âme sœur</div>
          <div class="guess-result info">
            Le temps pour deviner est écoulé. L'identité a été révélée!
          </div>
        </div>
      `;const r=(($=this.userStats)==null?void 0:$.guesses.filter(u=>u.day===e.day))||[],t=e.hints,l=((y=t[0])==null?void 0:y.revealed)||!1,o=((w=t[1])==null?void 0:w.revealed)||!1,n=((S=t[2])==null?void 0:S.revealed)||!1,c=r.some(u=>u.hint_number===1),d=r.some(u=>u.hint_number===2),h=r.some(u=>u.hint_number===3);let v=0,m=0;l&&!c?(v=1,m=100):o&&!d?(v=2,m=75):n&&!h&&(v=3,m=50);let p="";return r.length>0&&(p='<div class="guess-history">',p+='<div class="guess-history-title">Tes tentatives:</div>',r.forEach(u=>{var x;const H=u.is_correct?"✓":"✗",T=u.is_correct?"success":"error",b=(x=this.candidates)==null?void 0:x.candidates.find(_=>_.id===u.guessed_user_id),D=b?`${b.first_name} ${b.last_name}`:"Inconnu";p+=`
          <div class="guess-history-item ${T}">
            ${H} Indice ${u.hint_number}: ${D} ${u.is_correct?`(+${u.points_earned}pts)`:""}
          </div>
        `}),p+="</div>"),v===0?[l,o,n].filter(Boolean).length===0?`
          <div class="guess-section disabled">
            <div class="guess-title">🎯 Deviner mon âme sœur</div>
            <div class="guess-description">
              Révèles au moins un indice pour pouvoir deviner qui est ton âme sœur!
            </div>
          </div>
        `:`
          <div class="guess-section disabled">
            <div class="guess-title">🎯 Deviner mon âme sœur</div>
            ${p}
            <div class="guess-description">
              Révèles le prochain indice pour faire une nouvelle tentative!
            </div>
          </div>
        `:`
      <div class="guess-section" data-hint-number="${v}">
        <div class="guess-title">🎯 Deviner mon âme sœur (Indice ${v})</div>
        ${p}
        <div class="guess-description">
          Si tu devines correctement avec cet indice, tu gagneras <strong>${m} points</strong>!
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
    `}calculateGuessPoints(e){return{1:100,2:75,3:50}[e]||0}async handleSubmitGuess(e,a){var l,o;const s=g.getUser();if(!s)return;const i=(l=this.hintsData)==null?void 0:l.days.find(n=>n.day===e);if(!i){alert("Impossible de trouver les indices pour ce jour");return}const r=((o=this.userStats)==null?void 0:o.guesses.filter(n=>n.day===e))||[];let t=0;if(i.hints.forEach((n,c)=>{const d=r.some(h=>h.hint_number===c+1);n.revealed&&!d&&t===0&&(t=c+1)}),t===0){alert("Aucun indice disponible pour deviner pour le moment !");return}try{const n=document.querySelector(".guess-form"),c=n==null?void 0:n.querySelector(".guess-submit-btn");c&&(c.disabled=!0,c.textContent="Envoi en cours...");const d=await f.submitGuess(s.id,e,t,a);await this.loadAndRenderHints(),d.is_correct?alert(`🎉 ${d.message}

Tu as gagné ${d.points_earned} points!`):alert(`😔 ${d.message} ${t}`)}catch(n){console.error("Error submitting guess:",n),alert(n.message||"Erreur lors de l'envoi de ta réponse. Veuillez réessayer."),await this.loadAndRenderHints()}finally{const n=document.querySelector(".guess-form"),c=n==null?void 0:n.querySelector(".guess-submit-btn");c&&(c.disabled=!1,c.textContent="Valider mon choix")}}renderRevealCodeSection(e){if(!e.match_revealed)return"";const a=g.getUser();return a?(this.loadRevealCode(a.id,e.day),`<div id="reveal-code-container-${e.day}"></div>`):""}async loadRevealCode(e,a){try{const s=await f.getRevealCode(e,a),i=document.getElementById(`reveal-code-container-${a}`);if(!i)return;if(!s.available){i.innerHTML="";return}if(s.both_exchanged){i.innerHTML=`
        <div class="reveal-code-section">
          <div class="reveal-code-title">🎁 Code d'échange</div>
          <div class="code-exchange-success">
            ✓ Vous avez tous les deux échangé vos codes! Félicitations! 🎉
          </div>
        </div>
      `;return}const r=s.exchanged?'<div class="code-exchange-pending">⏳ En attente que votre âme sœur échange son code...</div>':"";i.innerHTML=`
      <div class="reveal-code-section">
        <div class="reveal-code-title">🎁 Ton Code Secret</div>
        <div class="reveal-code-display">
          <div class="reveal-code-value">${s.code}</div>
        </div>
        ${r}
        <div class="reveal-code-description">
          Partages ce code avec ton âme sœur! Si vous échangez vos codes, vous gagnerez tous les deux <strong>50 points bonus</strong>!
        </div>
        <form class="code-exchange-form">
          <input 
            type="text" 
            class="code-exchange-input" 
            placeholder="Code de ton âme sœur" 
            maxlength="6"
            ${s.exchanged?"disabled":""}
            required
          />
          <button type="submit" class="code-exchange-btn" ${s.exchanged?"disabled":""}>
            ${s.exchanged?"Code déjà échangé":"Échanger le code"}
          </button>
        </form>
      </div>
    `;const t=i.querySelector(".code-exchange-form");t&&!s.exchanged&&t.addEventListener("submit",async l=>{l.preventDefault();const o=t.querySelector(".code-exchange-input");o&&o.value&&await this.handleExchangeCode(a,o.value)})}catch(s){console.error("Error loading reveal code:",s)}}async handleExchangeCode(e,a){const s=g.getUser();if(s)try{const i=document.querySelector(".code-exchange-form"),r=i==null?void 0:i.querySelector(".code-exchange-btn");r&&(r.disabled=!0,r.textContent="Échange en cours...");const t=await f.exchangeCode(s.id,e,a.toUpperCase());await this.loadAndRenderHints(),alert(`🎉 ${t.message}

Tu as gagné ${t.points_earned} points bonus!`)}catch(i){console.error("Error exchanging code:",i),alert(i.message||"Code invalide ou erreur lors de l'échange. Veuillez vérifier et réessayer."),await this.loadAndRenderHints()}}}window.logout=function(){g.clearUser(),window.location.href="./index.html"};document.addEventListener("DOMContentLoaded",()=>{new E});
