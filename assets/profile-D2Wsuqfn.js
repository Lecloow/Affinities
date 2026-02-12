import{S as g,A as f}from"./storage-CNG1vvmV.js";/* empty css                */class D{constructor(){this.contentEl=null,this.hintsData=null,this.userStats=null,this.candidates=null,this.refreshInterval=null,this.timerInterval=null,this.selectedDay=1,this.init(),window.addEventListener("beforeunload",()=>this.cleanup())}adjustServerTime(e){const a=new Date(e);return a.setHours(a.getHours()+1),a}cleanup(){this.refreshInterval!==null&&(window.clearInterval(this.refreshInterval),this.refreshInterval=null),this.timerInterval!==null&&(window.clearInterval(this.timerInterval),this.timerInterval=null)}init(){this.contentEl=document.getElementById("content"),this.render(),this.refreshInterval=window.setInterval(()=>{this.loadAndRenderHints()},3e4),this.timerInterval=window.setInterval(()=>{this.updateTimersOnly()},1e3)}async render(){if(!this.contentEl)return;const e=g.getUser();if(!e){this.renderNotConnected();return}await this.renderProfile(e)}renderNotConnected(){this.contentEl&&(this.contentEl.innerHTML=`
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
    `,await this.loadAndRenderHints()}async loadAndRenderHints(){const e=g.getUser();if(e)try{const[a,s,n]=await Promise.all([f.getHints(e.id),f.getUserStats(e.id).catch(i=>(console.warn("Failed to load user stats:",i),{user_id:e.id,total_points:0,code_exchange_bonus:0,guesses:[]})),f.getCandidates(e.id).catch(i=>(console.warn("Failed to load candidates:",i),{candidates:[]}))]);this.hintsData=a,this.userStats=s,this.candidates=n,this.renderHints()}catch(a){console.error("Error loading hints:",a);const s=document.getElementById("hints-section");s&&(s.innerHTML=`
          <div class="error-state">Impossible de charger les indices.<br>Les âmes soeurs n'ont peut-être pas encore été créés.</div>
        `)}}renderHints(){if(!this.hintsData||!this.contentEl)return;const e=document.getElementById("hints-section");if(!e)return;if(this.hintsData.days.length===0){e.innerHTML=`
        <div class="info-state">Les indices seront disponibles une fois les âmes soeurs créés.</div>
      `;return}let a="";this.hintsData.days.length>1&&(a=`<div class="segmented-control">${this.hintsData.days.map(c=>{const l=c.day===1?"Jeudi":"Vendredi";return`<button class="segment-btn ${c.day===this.selectedDay?"active":""}" data-day="${c.day}">${l}</button>`}).join("")}</div>`);const s=this.hintsData.days.find(r=>r.day===this.selectedDay)??this.hintsData.days[0];e.innerHTML=`
      <div class="page-content">
        ${this.renderUserScore()}
        ${a}
        ${this.renderDayHints(s)}
        ${this.renderRevealButton(s)}
        ${this.renderGuessSection(s)}
        ${this.renderRevealCodeSection(s)}
      </div>
    `,e.querySelectorAll(".segment-btn").forEach(r=>{r.addEventListener("click",c=>{const l=c.target,u=parseInt(l.dataset.day||"1");u!==this.selectedDay&&(this.selectedDay=u,this.renderHints())})}),e.querySelectorAll(".global-reveal-btn").forEach(r=>{r.addEventListener("click",async c=>{const l=c.target,u=parseInt(l.dataset.day||"0");u&&await this.handleRevealAllHints(u)})});const n=e.querySelector(".guess-form"),i=e.querySelector(".guess-input"),t=e.querySelector(".autocomplete-dropdown");if(i&&t&&this.candidates){let r=null;i.addEventListener("input",c=>{const l=c.target.value.toLowerCase().trim();if(r=null,l.length===0){t.style.display="none";return}const u=this.candidates.candidates.filter(v=>v.first_name.toLowerCase().includes(l)||v.last_name.toLowerCase().includes(l));if(u.length===0){t.style.display="none";return}t.innerHTML=u.map(v=>`<div class="autocomplete-item" data-id="${v.id}">${v.first_name} ${v.last_name}</div>`).join(""),t.style.display="block",t.querySelectorAll(".autocomplete-item").forEach(v=>{v.addEventListener("click",()=>{const h=v.dataset.id,m=this.candidates.candidates.find(p=>p.id===h);m&&(i.value=`${m.first_name} ${m.last_name}`,r=h,t.style.display="none")})})}),document.addEventListener("click",c=>{!i.contains(c.target)&&!t.contains(c.target)&&(t.style.display="none")}),n&&n.addEventListener("submit",async c=>{c.preventDefault(),r?await this.handleSubmitGuess(this.selectedDay,r):alert("Veuillez sélectionner une personne dans la liste")})}const o=e.querySelector(".code-exchange-form");o&&o.addEventListener("submit",async r=>{r.preventDefault();const c=o.querySelector(".code-exchange-input");c&&c.value&&await this.handleExchangeCode(this.selectedDay,c.value)})}renderRevealButton(e){const a=e.hints.filter(i=>i.available&&!i.revealed).length,s=a===0?"Révéler un indice":a===1?"Révéler l'indice disponible":`Révéler les ${a} indices disponibles`,n=a===0?"disabled":"";return`
      <div class="reveal-btn-container">
        <button class="global-reveal-btn" data-day="${e.day}" ${n}>${s}</button>
      </div>
    `}async handleRevealAllHints(e){const a=g.getUser();if(a)try{const s=document.querySelector(`.global-reveal-btn[data-day="${e}"]`);s&&(s.disabled=!0,s.textContent="Révélation en cours…");const n=await f.revealAllHints(a.id,e);await this.loadAndRenderHints(),n.revealed_count>0&&console.log(`${n.revealed_count} hint(s) revealed successfully`)}catch(s){console.error("Error revealing hints:",s),alert("Erreur lors de la révélation des indices. Veuillez réessayer."),await this.loadAndRenderHints()}}getHintTimeTagHtml(e){const a=new Date,s=this.adjustServerTime(e.drop_time);if(e.revealed||e.available){const n=a.getTime()-s.getTime(),i=Math.floor(n/6e4),t=Math.floor(i/60),o=i%60;let r;return t>0?r=`${t}h${o>0?` ${o}min`:""}`:o>0?r=`${o} min`:r="1 min",`<span class="time-tag"><span>Il y a</span><span>${r}</span></span>`}else{const n=s.getTime()-a.getTime();if(n<=0)return'<span class="time-tag">Disponible !</span>';const i=Math.floor(n%(1e3*60*60)/6e4),t=Math.floor(n%6e4/1e3);if(n<60*60*1e3){const o=i>0?`${i}min ${t}s`:`${t}s`;return`<span class="time-tag" data-timer data-target="${s.toISOString()}"><span>Dans</span><span class="timer-value">${o}</span></span>`}else return`<span class="time-tag"><span>A</span><span>${s.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}).replace(":","h")}</span></span>`}}getRevealTimeTagHtml(e,a){const s=new Date;if(a){const r=s.getTime()-e.getTime(),c=Math.floor(r/6e4),l=Math.floor(c/60),u=c%60;return`<span class="time-tag"><span>Il y a</span><span>${l>0?`${l}h${u>0?` ${u}min`:""}`:`${c>0?c:1} min`}</span></span>`}const n=e.getTime()-s.getTime();if(n<=0)return'<span class="time-tag">Maintenant !</span>';const i=Math.floor(n%(1e3*60*60)/6e4),t=Math.floor(n%6e4/1e3);if(n<60*60*1e3){const r=i>0?`${i}min ${t}s`:`${t}s`;return`<span class="time-tag" data-timer data-target="${e.toISOString()}"><span>Dans</span><span class="timer-value">${r}</span></span>`}return`<span class="time-tag"><span>A</span><span>${e.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}).replace(":","h")}</span></span>`}renderHintContent(e){const a=e.match(/^(.+?:\s*)([A-ZÀ-ÖØ-Ý])$/i);if(a){const t=a[1],o=a[2].toUpperCase();return`
        <div class="hint-content-row">
          <span class="hint-content-text">${t}</span>
          <span class="letter-tag">${o}</span>
        </div>
      `}const s=e.match(/^(Son prénom est:\s*)(.+)$/i);if(s){const t=s[1],o=s[2];return`
        <div class="hint-content-row">
          <span class="hint-content-text">${t}</span>
          <span class="pink-box">${o}</span>
        </div>
      `}const n=e.match(/^(.+\s)(\d+)(\s.+)$/);if(n){const t=n[1],o=n[2],r=n[3];return`
        <div class="hint-content-row">
          <span class="hint-content-text">${t}</span>
          <span class="pink-box">${o}</span>
          <span class="hint-content-text">${r}</span>
        </div>
      `}const i=e.match(/^(Il\/Elle est dans la classe:\s*)(.+)$/i);if(i){const t=i[1],o=i[2];return`
        <div class="hint-content-row">
          <span class="hint-content-text">${t}</span>
          <span class="pink-box">${o}</span>
        </div>
      `}return`
      <div class="hint-content-row">
        <span class="hint-content-text">${e}</span>
      </div>
    `}renderDayHints(e){const a=new Date(e.reveal_time);let s="";e.hints.forEach((t,o)=>{const r=t.available&&t.revealed?"revealed":(t.available&&!t.revealed,"undiscovered"),c=`Indice n°${o+1}`,l=this.getHintTimeTagHtml(t);s+=`
        <div class="hint-row">
          <span class="hint-badge ${r}">${c}</span>
          ${l}
        </div>
      `,t.revealed&&t.content&&(s+=this.renderHintContent(t.content))});const n=e.match_revealed?"reveal-badge revealed":"reveal-badge",i=this.getRevealTimeTagHtml(a,e.match_revealed);if(s+=`
      <div class="section-divider"></div>
      <div class="hint-row">
        <span class="hint-badge ${n}">Reveal</span>
        ${i}
      </div>
    `,e.match_revealed&&e.match_info){const t=e.day===1?"Jeudi 12 Février":"Vendredi 13 Février";s+=`
        <div class="match-revealed-card">
          <p class="match-title">Ton âme soeur du ${t}</p>
          <p class="match-name">${e.match_info.first_name} ${e.match_info.last_name}</p>
          <p class="match-class">${e.match_info.class}</p>
        </div>
      `}return s}updateTimersOnly(){if(!this.hintsData)return;document.querySelectorAll("[data-timer]").forEach(a=>{const s=a.dataset.target;if(!s)return;const n=new Date(s),i=new Date,t=n.getTime()-i.getTime(),o=a.querySelector(".timer-value");if(!o)return;if(t<=0){o.textContent="maintenant !",this.loadAndRenderHints();return}const r=Math.floor(t%(1e3*60*60)/6e4),c=Math.floor(t%6e4/1e3),l=r>0?`${r}min ${c}s`:`${c}s`;o.textContent=l})}renderUserScore(){return this.userStats?`
      <div class="user-score-section">
        <div class="user-score-label">Votre Score Total</div>
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
      `;const i=(($=this.userStats)==null?void 0:$.guesses.filter(d=>d.day===e.day))||[],t=e.hints,o=((y=t[0])==null?void 0:y.revealed)||!1,r=((w=t[1])==null?void 0:w.revealed)||!1,c=((S=t[2])==null?void 0:S.revealed)||!1,l=i.some(d=>d.hint_number===1),u=i.some(d=>d.hint_number===2),v=i.some(d=>d.hint_number===3);let h=0,m=0;o&&!l?(h=1,m=100):r&&!u?(h=2,m=75):c&&!v&&(h=3,m=50);let p="";return i.length>0&&(p='<div class="guess-history">',p+='<div class="guess-history-title">Vos tentatives:</div>',i.forEach(d=>{var x;const H=d.is_correct?"✓":"✗",E=d.is_correct?"success":"error",b=(x=this.candidates)==null?void 0:x.candidates.find(_=>_.id===d.guessed_user_id),T=b?`${b.first_name} ${b.last_name}`:"Inconnu";p+=`
          <div class="guess-history-item ${E}">
            ${H} Indice ${d.hint_number}: ${T} ${d.is_correct?`(+${d.points_earned}pts)`:""}
          </div>
        `}),p+="</div>"),h===0?[o,r,c].filter(Boolean).length===0?`
          <div class="guess-section disabled">
            <div class="guess-title">🎯 Deviner mon âme sœur</div>
            <div class="guess-description">
              Révélez au moins un indice pour pouvoir deviner qui est votre âme sœur!
            </div>
          </div>
        `:`
          <div class="guess-section disabled">
            <div class="guess-title">🎯 Deviner mon âme sœur</div>
            ${p}
            <div class="guess-description">
              Révélez le prochain indice pour faire une nouvelle tentative!
            </div>
          </div>
        `:`
      <div class="guess-section" data-hint-number="${h}">
        <div class="guess-title">🎯 Deviner mon âme sœur (Indice ${h})</div>
        ${p}
        <div class="guess-description">
          Si vous devinez correctement avec cet indice, vous gagnerez <strong>${m} points</strong>!
        </div>
        <form class="guess-form">
          <div class="autocomplete-container">
            <input 
              type="text" 
              class="guess-input" 
              placeholder="Tapez le prénom ou nom..." 
              autocomplete="off"
              required
            />
            <div class="autocomplete-dropdown" style="display: none;"></div>
          </div>
          <button type="submit" class="guess-submit-btn">Valider mon choix</button>
        </form>
      </div>
    `}calculateGuessPoints(e){return{1:100,2:75,3:50}[e]||0}async handleSubmitGuess(e,a){const s=g.getUser();if(!s)return;const n=document.querySelector(".guess-section[data-hint-number]"),i=parseInt((n==null?void 0:n.dataset.hintNumber)||"0");if(i===0){alert("Erreur: numéro d'indice invalide");return}try{const t=document.querySelector(".guess-form"),o=t==null?void 0:t.querySelector(".guess-submit-btn");o&&(o.disabled=!0,o.textContent="Envoi en cours...");const r=await f.submitGuess(s.id,e,i,a);await this.loadAndRenderHints(),r.is_correct?alert(`🎉 ${r.message}

Vous avez gagné ${r.points_earned} points!`):alert(`😔 ${r.message}`)}catch(t){console.error("Error submitting guess:",t),alert(t.message||"Erreur lors de l'envoi de votre réponse. Veuillez réessayer."),await this.loadAndRenderHints()}}renderRevealCodeSection(e){if(!e.match_revealed)return"";const a=g.getUser();return a?(this.loadRevealCode(a.id,e.day),`<div id="reveal-code-container-${e.day}"></div>`):""}async loadRevealCode(e,a){try{const s=await f.getRevealCode(e,a),n=document.getElementById(`reveal-code-container-${a}`);if(!n)return;if(!s.available){n.innerHTML="";return}if(s.both_exchanged){n.innerHTML=`
        <div class="reveal-code-section">
          <div class="reveal-code-title">🎁 Code d'échange</div>
          <div class="code-exchange-success">
            ✓ Vous avez tous les deux échangé vos codes! Félicitations! 🎉
          </div>
        </div>
      `;return}const i=s.exchanged?'<div class="code-exchange-pending">⏳ En attente que votre âme sœur échange son code...</div>':"";n.innerHTML=`
      <div class="reveal-code-section">
        <div class="reveal-code-title">🎁 Votre Code Secret</div>
        <div class="reveal-code-display">
          <div class="reveal-code-value">${s.code}</div>
        </div>
        ${i}
        <div class="reveal-code-description">
          Partagez ce code avec votre âme sœur! Si vous échangez vos codes, vous gagnerez tous les deux <strong>50 points bonus</strong>!
        </div>
        <form class="code-exchange-form">
          <input 
            type="text" 
            class="code-exchange-input" 
            placeholder="Code de votre âme sœur" 
            maxlength="6"
            ${s.exchanged?"disabled":""}
            required
          />
          <button type="submit" class="code-exchange-btn" ${s.exchanged?"disabled":""}>
            ${s.exchanged?"Code déjà échangé":"Échanger le code"}
          </button>
        </form>
      </div>
    `;const t=n.querySelector(".code-exchange-form");t&&!s.exchanged&&t.addEventListener("submit",async o=>{o.preventDefault();const r=t.querySelector(".code-exchange-input");r&&r.value&&await this.handleExchangeCode(a,r.value)})}catch(s){console.error("Error loading reveal code:",s)}}async handleExchangeCode(e,a){const s=g.getUser();if(s)try{const n=document.querySelector(".code-exchange-form"),i=n==null?void 0:n.querySelector(".code-exchange-btn");i&&(i.disabled=!0,i.textContent="Échange en cours...");const t=await f.exchangeCode(s.id,e,a.toUpperCase());await this.loadAndRenderHints(),alert(`🎉 ${t.message}

Vous avez gagné ${t.points_earned} points bonus!`)}catch(n){console.error("Error exchanging code:",n),alert(n.message||"Code invalide ou erreur lors de l'échange. Veuillez vérifier et réessayer."),await this.loadAndRenderHints()}}}window.logout=function(){g.clearUser(),window.location.href="./index.html"};document.addEventListener("DOMContentLoaded",()=>{new D});
