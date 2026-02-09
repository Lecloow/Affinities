import{S as d,A as u}from"./storage-vd1rG5Ao.js";class f{constructor(){this.contentEl=null,this.hintsData=null,this.refreshInterval=null,this.timerInterval=null,this.init(),window.addEventListener("beforeunload",()=>this.cleanup())}cleanup(){this.refreshInterval!==null&&(window.clearInterval(this.refreshInterval),this.refreshInterval=null),this.timerInterval!==null&&(window.clearInterval(this.timerInterval),this.timerInterval=null)}init(){this.contentEl=document.getElementById("content"),this.render(),this.refreshInterval=window.setInterval(()=>{this.loadAndRenderHints()},3e4),this.timerInterval=window.setInterval(()=>{this.updateTimersOnly()},1e3)}async render(){if(!this.contentEl)return;const e=d.getUser();if(!e){this.renderNotConnected();return}await this.renderProfile(e)}renderNotConnected(){this.contentEl&&(this.contentEl.innerHTML=`
      <div class="error">Vous n'êtes pas connecté. Redirection...</div>
    `,setTimeout(()=>{window.location.href="./index.html"},2e3))}async renderProfile(e){this.contentEl&&(this.contentEl.innerHTML=`
      <div class="greeting">Bonjour ${e.first_name}! 👋</div>
      
      <div class="user-info">
        <div class="info-row">
          <div class="label">Prénom</div>
          <div class="value">${e.first_name}</div>
        </div>
        <div class="info-row">
          <div class="label">Nom</div>
          <div class="value">${e.last_name}</div>
        </div>
        <div class="info-row">
          <div class="label">Email</div>
          <div class="value">${e.email}</div>
        </div>
        <div class="info-row">
          <div class="label">Classe</div>
          <div class="value">${e.currentClass}</div>
        </div>
      </div>

      <div id="hints-section">
        <div class="loading">Chargement des indices...</div>
      </div>

      <button class="logout-btn" onclick="logout()">Se déconnecter</button>
    `,await this.loadAndRenderHints())}async loadAndRenderHints(){const e=d.getUser();if(e)try{this.hintsData=await u.getHints(e.id),this.renderHints()}catch(i){console.error("Error loading hints:",i);const t=document.getElementById("hints-section");t&&(t.innerHTML=`
          <div class="hints-container">
            <h2>💝 Indices pour trouver ton âme sœur</h2>
            <div class="error">Impossible de charger les indices. Les matchs n'ont peut-être pas encore été créés.</div>
          </div>
        `)}}renderHints(){if(!this.hintsData||!this.contentEl)return;const e=document.getElementById("hints-section");if(!e)return;if(this.hintsData.days.length===0){e.innerHTML=`
        <div class="hints-container">
          <h2>💝 Indices pour trouver ton âme sœur</h2>
          <div class="info">Les indices seront disponibles une fois les matchs créés.</div>
        </div>
      `;return}const i=this.hintsData.days.map(t=>this.renderDayHints(t)).join("");e.innerHTML=`
      <div class="hints-container">
        <h2>💝 Indices pour trouver ton âme sœur</h2>
        ${i}
      </div>
    `,this.attachGlobalRevealButtonListeners()}attachGlobalRevealButtonListeners(){document.querySelectorAll(".global-reveal-btn").forEach(i=>{i.addEventListener("click",async t=>{const n=t.target,s=parseInt(n.dataset.day||"0");s&&await this.handleRevealAllHints(s)})})}async handleRevealAllHints(e){const i=d.getUser();if(i)try{const t=document.querySelector(`[data-day="${e}"].global-reveal-btn`);if(t){const s=t.textContent;t.disabled=!0,t.textContent="Révélation en cours..."}const n=await u.revealAllHints(i.id,e);await this.loadAndRenderHints(),n.revealed_count>0&&console.log(`${n.revealed_count} hint(s) revealed successfully`)}catch(t){console.error("Error revealing hints:",t),alert("Erreur lors de la révélation des indices. Veuillez réessayer."),await this.loadAndRenderHints()}}async handleRevealHint(e,i){const t=d.getUser();if(t)try{const n=document.querySelector(`[data-day="${e}"][data-hint-number="${i}"]`);n&&(n.disabled=!0,n.textContent="Révélation en cours..."),await u.revealHint(t.id,e,i),await this.loadAndRenderHints()}catch(n){console.error("Error revealing hint:",n),alert("Erreur lors de la révélation de l'indice. Veuillez réessayer.");const s=document.querySelector(`[data-day="${e}"][data-hint-number="${i}"]`);s&&(s.disabled=!1,s.textContent="Révéler l'indice")}}renderDayHints(e){const i=e.day===1?"Jeudi 12 Février":"Vendredi 13 Février";let t="";const n=new Date;let s=0,r=null;for(const a of e.hints){a.available&&!a.revealed&&s++;const l=new Date(a.drop_time);!a.available&&l>n&&!r&&(r=l)}t=e.hints.map((a,l)=>{if(a.available){const c=new Date(a.drop_time).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});if(a.revealed){const m=a.type==="easy"?"🟢 Facile":a.type==="medium"?"🟡 Moyen":"🔴 Difficile";return`
            <div class="hint-item available revealed">
              <div class="hint-header">
                <span class="hint-number">Indice ${l+1}</span>
                <span class="hint-difficulty">${m}</span>
                <span class="hint-time">Révélé à ${c}</span>
              </div>
              <div class="hint-content">${a.content}</div>
            </div>
          `}else return`
            <div class="hint-item available not-revealed">
              <div class="hint-header">
                <span class="hint-number">Indice ${l+1}</span>
                <span class="hint-time">Disponible depuis ${c}</span>
              </div>
              <div class="hint-content hint-placeholder">
                <span class="lock-icon">🎁</span>
                <span class="placeholder-text">Indice disponible - Cliquez sur le bouton en bas pour révéler</span>
              </div>
            </div>
          `}else{const o=new Date(a.drop_time),c=o.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}),m=this.getTimeRemaining(o);return`
          <div class="hint-item locked">
            <div class="hint-header">
              <span class="hint-number">Indice ${l+1}</span>
              <span class="hint-time">Disponible à ${c}</span>
            </div>
            <div class="hint-content locked">
              <span class="lock-icon">🔒</span>
              <span class="timer">${m}</span>
            </div>
          </div>
        `}}).join("");let v="";if(s>0){const a=s===1?"Révéler l'indice disponible":`Révéler les ${s} indices disponibles`;v=`
        <div class="global-reveal-container">
          <button class="global-reveal-btn" data-day="${e.day}">
            ${a}
          </button>
        </div>
      `}else if(r){const a=Math.ceil((r.getTime()-n.getTime())/6e4);v=`
        <div class="global-reveal-container">
          <div class="next-hint-timer">
            <span class="timer-icon">⏱️</span>
            <span class="timer-text">${a===1?"Prochain indice dans 1 minute":`Prochain indice dans ${a} minutes`}</span>
          </div>
        </div>
      `}let h="";if(e.match_revealed&&e.match_info)h=`
        <div class="reveal-section revealed">
          <h3>🎉 Ton match du ${i}</h3>
          <div class="match-card">
            <div class="match-name">${e.match_info.first_name} ${e.match_info.last_name}</div>
            <div class="match-class">${e.match_info.class}</div>
          </div>
        </div>
      `;else{const a=new Date(e.reveal_time),l=a.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}),o=this.getTimeRemaining(a);h=`
        <div class="reveal-section locked">
          <h3>🎁 Révélation du match</h3>
          <div class="reveal-timer">
            <span class="lock-icon">🔒</span>
            <div>
              <div>Disponible à ${l}</div>
              <div class="timer">${o}</div>
            </div>
          </div>
        </div>
      `}return`
      <div class="day-hints">
        <h3 class="day-title">${i}</h3>
        <div class="hints-list">
          ${t}
        </div>
        ${v}
        ${h}
      </div>
    `}getTimeRemaining(e){const i=new Date,t=e.getTime()-i.getTime();if(t<=0)return"Disponible maintenant!";const n=Math.floor(t/(1e3*60*60)),s=Math.floor(t%(1e3*60*60)/(1e3*60)),r=Math.floor(t%(1e3*60)/1e3);return n>0?`Dans ${n}h ${s}min`:s>0?`Dans ${s}min ${r}s`:`Dans ${r}s`}updateTimersOnly(){if(!this.hintsData)return;const e=document.querySelectorAll(".timer");if(e.length===0)return;const i=[];this.hintsData.days.forEach(n=>{n.hints.forEach(s=>{s.available||i.push({element:null,targetTime:new Date(s.drop_time)})}),n.match_revealed||i.push({element:null,targetTime:new Date(n.reveal_time)})});let t=0;e.forEach(n=>{if(t<i.length){const s=this.getTimeRemaining(i[t].targetTime);n.textContent=s,s==="Disponible maintenant!"&&this.loadAndRenderHints(),t++}})}}window.logout=function(){d.clearUser(),window.location.href="./index.html"};document.addEventListener("DOMContentLoaded",()=>{new f});
