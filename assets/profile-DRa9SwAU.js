import{S as c,A as h}from"./storage-Bectqoev.js";class v{constructor(){this.contentEl=null,this.hintsData=null,this.refreshInterval=null,this.timerInterval=null,this.init(),window.addEventListener("beforeunload",()=>this.cleanup())}cleanup(){this.refreshInterval!==null&&(window.clearInterval(this.refreshInterval),this.refreshInterval=null),this.timerInterval!==null&&(window.clearInterval(this.timerInterval),this.timerInterval=null)}init(){this.contentEl=document.getElementById("content"),this.render(),this.refreshInterval=window.setInterval(()=>{this.loadAndRenderHints()},3e4),this.timerInterval=window.setInterval(()=>{this.updateTimersOnly()},1e3)}async render(){if(!this.contentEl)return;const e=c.getUser();if(!e){this.renderNotConnected();return}await this.renderProfile(e)}renderNotConnected(){this.contentEl&&(this.contentEl.innerHTML=`
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
    `,await this.loadAndRenderHints())}async loadAndRenderHints(){const e=c.getUser();if(e)try{this.hintsData=await h.getHints(e.id),this.renderHints()}catch(n){console.error("Error loading hints:",n);const i=document.getElementById("hints-section");i&&(i.innerHTML=`
          <div class="hints-container">
            <h2>💝 Indices pour trouver ton âme sœur</h2>
            <div class="error">Impossible de charger les indices. Les matchs n'ont peut-être pas encore été créés.</div>
          </div>
        `)}}renderHints(){if(!this.hintsData||!this.contentEl)return;const e=document.getElementById("hints-section");if(!e)return;if(this.hintsData.days.length===0){e.innerHTML=`
        <div class="hints-container">
          <h2>💝 Indices pour trouver ton âme sœur</h2>
          <div class="info">Les indices seront disponibles une fois les matchs créés.</div>
        </div>
      `;return}const n=this.hintsData.days.map(i=>this.renderDayHints(i)).join("");e.innerHTML=`
      <div class="hints-container">
        <h2>💝 Indices pour trouver ton âme sœur</h2>
        ${n}
      </div>
    `}renderDayHints(e){const n=e.day===1?"Jeudi 12 Février":"Vendredi 13 Février";let i="";const a=new Date;for(const t of e.hints){const r=new Date(t.drop_time);if(!t.available&&r>a)break}i=e.hints.map((t,r)=>{if(t.available){const o=new Date(t.drop_time).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}),d=t.type==="easy"?"🟢 Facile":t.type==="medium"?"🟡 Moyen":"🔴 Difficile";return`
          <div class="hint-item available">
            <div class="hint-header">
              <span class="hint-number">Indice ${r+1}</span>
              <span class="hint-difficulty">${d}</span>
              <span class="hint-time">Révélé à ${o}</span>
            </div>
            <div class="hint-content">${t.content}</div>
          </div>
        `}else{const l=new Date(t.drop_time),o=l.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}),d=this.getTimeRemaining(l);return`
          <div class="hint-item locked">
            <div class="hint-header">
              <span class="hint-number">Indice ${r+1}</span>
              <span class="hint-time">Disponible à ${o}</span>
            </div>
            <div class="hint-content locked">
              <span class="lock-icon">🔒</span>
              <span class="timer">${d}</span>
            </div>
          </div>
        `}}).join("");let s="";if(e.match_revealed&&e.match_info)s=`
        <div class="reveal-section revealed">
          <h3>🎉 Ton match du ${n}</h3>
          <div class="match-card">
            <div class="match-name">${e.match_info.first_name} ${e.match_info.last_name}</div>
            <div class="match-class">${e.match_info.class}</div>
          </div>
        </div>
      `;else{const t=new Date(e.reveal_time),r=t.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}),l=this.getTimeRemaining(t);s=`
        <div class="reveal-section locked">
          <h3>🎁 Révélation du match</h3>
          <div class="reveal-timer">
            <span class="lock-icon">🔒</span>
            <div>
              <div>Disponible à ${r}</div>
              <div class="timer">${l}</div>
            </div>
          </div>
        </div>
      `}return`
      <div class="day-hints">
        <h3 class="day-title">${n}</h3>
        <div class="hints-list">
          ${i}
        </div>
        ${s}
      </div>
    `}getTimeRemaining(e){const n=new Date,i=e.getTime()-n.getTime();if(i<=0)return"Disponible maintenant!";const a=Math.floor(i/(1e3*60*60)),s=Math.floor(i%(1e3*60*60)/(1e3*60)),t=Math.floor(i%(1e3*60)/1e3);return a>0?`Dans ${a}h ${s}min`:s>0?`Dans ${s}min ${t}s`:`Dans ${t}s`}updateTimersOnly(){if(!this.hintsData)return;const e=document.querySelectorAll(".timer");if(e.length===0)return;const n=[];this.hintsData.days.forEach(a=>{a.hints.forEach(s=>{s.available||n.push({element:null,targetTime:new Date(s.drop_time)})}),a.match_revealed||n.push({element:null,targetTime:new Date(a.reveal_time)})});let i=0;e.forEach(a=>{if(i<n.length){const s=this.getTimeRemaining(n[i].targetTime);a.textContent=s,s==="Disponible maintenant!"&&this.loadAndRenderHints(),i++}})}}window.logout=function(){c.clearUser(),window.location.href="./index.html"};document.addEventListener("DOMContentLoaded",()=>{new v});
