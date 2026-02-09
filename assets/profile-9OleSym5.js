import{S as c,A as m}from"./storage-vd1rG5Ao.js";class f{constructor(){this.contentEl=null,this.hintsData=null,this.refreshInterval=null,this.timerInterval=null,this.selectedDay=1,this.init(),window.addEventListener("beforeunload",()=>this.cleanup())}cleanup(){this.refreshInterval!==null&&(window.clearInterval(this.refreshInterval),this.refreshInterval=null),this.timerInterval!==null&&(window.clearInterval(this.timerInterval),this.timerInterval=null)}init(){this.contentEl=document.getElementById("content"),this.render(),this.refreshInterval=window.setInterval(()=>{this.loadAndRenderHints()},3e4),this.timerInterval=window.setInterval(()=>{this.updateTimersOnly()},1e3)}async render(){if(!this.contentEl)return;const e=c.getUser();if(!e){this.renderNotConnected();return}await this.renderProfile(e)}renderNotConnected(){this.contentEl&&(this.contentEl.innerHTML=`
      <div class="error">Vous n'êtes pas connecté. Redirection...</div>
    `,setTimeout(()=>{window.location.href="./index.html"},2e3))}async renderProfile(e){this.contentEl&&(this.contentEl.innerHTML=`
      <div class="greeting">Salut ${e.first_name}! 👋</div>

      <div id="hints-section">
        <div class="loading">Chargement des indices...</div>
      </div>

      <button class="logout-btn" onclick="logout()">Se déconnecter</button>
    `,await this.loadAndRenderHints())}async loadAndRenderHints(){const e=c.getUser();if(e)try{this.hintsData=await m.getHints(e.id),this.renderHints()}catch(s){console.error("Error loading hints:",s);const t=document.getElementById("hints-section");t&&(t.innerHTML=`
          <div class="hints-container">
            <h2>💝 Indices pour trouver ton âme sœur</h2>
            <div class="error">Impossible de charger les indices. Les matchs n'ont peut-être pas encore été créés.</div>
          </div>
        `)}}renderHints(){if(!this.hintsData||!this.contentEl)return;const e=document.getElementById("hints-section");if(!e)return;if(this.hintsData.days.length===0){e.innerHTML=`
        <div class="hints-container">
          <h2>💝 Indices pour trouver ton âme sœur</h2>
          <div class="info">Les indices seront disponibles une fois les matchs créés.</div>
        </div>
      `;return}const s=`
      <div class="segmented-control">
        <button class="segment-btn ${this.selectedDay===1?"active":""}" data-day="1">
          Jeudi
        </button>
        <button class="segment-btn ${this.selectedDay===2?"active":""}" data-day="2">
          Vendredi
        </button>
      </div>
    `,t=this.hintsData.days.find(i=>i.day===this.selectedDay),n=t?this.renderDayHints(t):"";e.innerHTML=`
      <div class="hints-container">
        <h2>💝 Indices pour trouver ton âme sœur</h2>
        ${s}
        ${n}
      </div>
    `,this.attachSegmentedControlListeners(),this.attachGlobalRevealButtonListeners()}attachSegmentedControlListeners(){document.querySelectorAll(".segment-btn").forEach(s=>{s.addEventListener("click",t=>{const n=t.target,i=parseInt(n.dataset.day||"1");i!==this.selectedDay&&(this.selectedDay=i,this.renderHints())})})}attachGlobalRevealButtonListeners(){document.querySelectorAll(".global-reveal-btn").forEach(s=>{s.addEventListener("click",async t=>{const n=t.target,i=parseInt(n.dataset.day||"0");i&&await this.handleRevealAllHints(i)})})}async handleRevealAllHints(e){const s=c.getUser();if(s)try{const t=document.querySelector(`[data-day="${e}"].global-reveal-btn`);if(t){const i=t.textContent;t.disabled=!0,t.textContent="Révélation en cours..."}const n=await m.revealAllHints(s.id,e);await this.loadAndRenderHints(),n.revealed_count>0&&console.log(`${n.revealed_count} hint(s) revealed successfully`)}catch(t){console.error("Error revealing hints:",t),alert("Erreur lors de la révélation des indices. Veuillez réessayer."),await this.loadAndRenderHints()}}async handleRevealHint(e,s){const t=c.getUser();if(t)try{const n=document.querySelector(`[data-day="${e}"][data-hint-number="${s}"]`);n&&(n.disabled=!0,n.textContent="Révélation en cours..."),await m.revealHint(t.id,e,s),await this.loadAndRenderHints()}catch(n){console.error("Error revealing hint:",n),alert("Erreur lors de la révélation de l'indice. Veuillez réessayer.");const i=document.querySelector(`[data-day="${e}"][data-hint-number="${s}"]`);i&&(i.disabled=!1,i.textContent="Révéler l'indice")}}renderDayHints(e){let s="";const t=new Date;let n=0,i=null;for(const a of e.hints){a.available&&!a.revealed&&n++;const r=new Date(a.drop_time);!a.available&&r>t&&!i&&(i=r)}s=e.hints.map((a,r)=>{if(a.available){const d=new Date(a.drop_time).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});if(a.revealed){const v=a.type==="easy"?"🟢 Facile":a.type==="medium"?"🟡 Moyen":"🔴 Difficile";return`
            <div class="hint-item available revealed">
              <div class="hint-header">
                <span class="hint-number">Indice ${r+1}</span>
                <span class="hint-difficulty">${v}</span>
                <span class="hint-time">Révélé à ${d}</span>
              </div>
              <div class="hint-content">${a.content}</div>
            </div>
          `}else return`
            <div class="hint-item available not-revealed">
              <div class="hint-header">
                <span class="hint-number">Indice ${r+1}</span>
                <span class="hint-time">Disponible depuis ${d}</span>
              </div>
              <div class="hint-content hint-placeholder">
                <span class="lock-icon">🎁</span>
                <span class="placeholder-text">Indice disponible - Cliquez sur le bouton en bas pour révéler</span>
              </div>
            </div>
          `}else{const o=new Date(a.drop_time),d=o.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}),v=this.getTimeRemaining(o);return`
          <div class="hint-item locked">
            <div class="hint-header">
              <span class="hint-number">Indice ${r+1}</span>
              <span class="hint-time">Disponible à ${d}</span>
            </div>
            <div class="hint-content locked">
              <span class="lock-icon">🔒</span>
              <span class="timer">${v}</span>
            </div>
          </div>
        `}}).join("");let l="";if(n>0){const a=n===1?"Révéler l'indice disponible":`Révéler les ${n} indices disponibles`;l=`
        <div class="global-reveal-container">
          <button class="global-reveal-btn" data-day="${e.day}">
            ${a}
          </button>
        </div>
      `}else if(i){const a=Math.ceil((i.getTime()-t.getTime())/6e4);l=`
        <div class="global-reveal-container">
          <div class="next-hint-timer">
            <span class="timer-icon">⏱️</span>
            <span class="timer-text">${a===1?"Prochain indice dans 1 minute":`Prochain indice dans ${a} minutes`}</span>
          </div>
        </div>
      `}const u=e.day===1?"Jeudi 12 Février":"Vendredi 13 Février";let h="";if(e.match_revealed&&e.match_info)h=`
        <div class="reveal-section revealed">
          <h3>🎉 Ton match du ${u}</h3>
          <div class="match-card">
            <div class="match-name">${e.match_info.first_name} ${e.match_info.last_name}</div>
            <div class="match-class">${e.match_info.class}</div>
          </div>
        </div>
      `;else{const a=new Date(e.reveal_time),r=a.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}),o=this.getTimeRemaining(a);h=`
        <div class="reveal-section locked">
          <h3>🎁 Révélation du match</h3>
          <div class="reveal-timer">
            <span class="lock-icon">🔒</span>
            <div>
              <div>Disponible à ${r}</div>
              <div class="timer">${o}</div>
            </div>
          </div>
        </div>
      `}return`
      <div class="day-hints-content">
        <div class="hints-list">
          ${s}
        </div>
        ${l}
        ${h}
      </div>
    `}getTimeRemaining(e){const s=new Date,t=e.getTime()-s.getTime();if(t<=0)return"Disponible maintenant!";const n=Math.floor(t/(1e3*60*60)),i=Math.floor(t%(1e3*60*60)/(1e3*60)),l=Math.floor(t%(1e3*60)/1e3);return n>0?`Dans ${n}h ${i}min`:i>0?`Dans ${i}min ${l}s`:`Dans ${l}s`}updateTimersOnly(){if(!this.hintsData)return;const e=document.querySelectorAll(".timer");if(e.length===0)return;const s=[];this.hintsData.days.forEach(n=>{n.hints.forEach(i=>{i.available||s.push({element:null,targetTime:new Date(i.drop_time)})}),n.match_revealed||s.push({element:null,targetTime:new Date(n.reveal_time)})});let t=0;e.forEach(n=>{if(t<s.length){const i=this.getTimeRemaining(s[t].targetTime);n.textContent=i,i==="Disponible maintenant!"&&this.loadAndRenderHints(),t++}})}}window.logout=function(){c.clearUser(),window.location.href="./index.html"};document.addEventListener("DOMContentLoaded",()=>{new f});
