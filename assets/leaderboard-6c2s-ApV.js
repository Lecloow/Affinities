import{S as o,A as h}from"./storage-CNG1vvmV.js";/* empty css                */const v=12e4;class b{constructor(){this.contentEl=null,this.leaderboardData=null,this.refreshInterval=null,this.init(),window.addEventListener("beforeunload",()=>this.cleanup())}cleanup(){this.refreshInterval!==null&&(window.clearInterval(this.refreshInterval),this.refreshInterval=null)}init(){this.contentEl=document.getElementById("content"),this.render(),this.refreshInterval=window.setInterval(()=>{this.loadAndRenderLeaderboard()},v)}async render(){if(!this.contentEl)return;const t=o.getUser(),a=`<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 13v-2H7V8l-5 4 5 4v-3z" fill="white"/>
      <path d="M20 3h-9c-1.103 0-2 .897-2 2v4h2V5h9v14h-9v-4H9v4c0 1.103.897 2 2 2h9c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2z" fill="white"/>
    </svg>`,s=`<svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
      <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
    </svg>`;this.contentEl.innerHTML=`
      <div class="page-wrapper">
        <!-- Header -->
        <header>
          <div class="page-header">
            <button class="back-btn" onclick="goBack()" aria-label="Retour">
              ${s}
            </button>
            <p class="greeting-text" style="flex: 1; text-align: center; margin: 0;">Classement</p>
            ${t?`<button class="logout-btn" onclick="logout()" aria-label="Se déconnecter">${a}</button>`:'<div style="width: 48px;"></div>'}
          </div>
          <div class="header-divider"></div>
        </header>

        <!-- Leaderboard section -->
        <main id="leaderboard-section">
          <div class="loading-state">Chargement du classement…</div>
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
                <path d="M8 0C3.58 0 0 3.58 0 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
              </svg>
              GitHub
            </a>
          </div>
        </footer>

        <!-- Bottom floral decorations -->
        <div class="bottom-flowers left"></div>
        <div class="bottom-flowers right"></div>
      </div>
    `,await this.loadAndRenderLeaderboard()}async loadAndRenderLeaderboard(){try{this.leaderboardData=await h.getLeaderboard(),this.renderLeaderboard()}catch(t){console.error("Error loading leaderboard:",t);const a=document.getElementById("leaderboard-section");a&&(a.innerHTML=`
          <div class="error-state">Impossible de charger le classement.</div>
        `)}}renderLeaderboard(){if(!this.leaderboardData||!this.contentEl)return;const t=document.getElementById("leaderboard-section");if(!t)return;if(this.leaderboardData.leaderboard.length===0){t.innerHTML=`
        <div class="info-state">Le classement sera disponible une fois que des participants auront obtenu des points.</div>
      `;return}const a=o.getUser(),s=a==null?void 0:a.id;let r='<div class="leaderboard-container">';const i=new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});r+=`<div class="leaderboard-update-time">Dernière mise à jour : ${i}</div>`,this.leaderboardData.leaderboard.forEach(e=>{const d=e.user_id===s,l=e.rank===1?"rank-1":e.rank===2?"rank-2":e.rank===3?"rank-3":"",c=d?"current-user":"",n=e.rank===1?"🥇":e.rank===2?"🥈":e.rank===3?"🥉":"";r+=`
        <div class="leaderboard-row ${l} ${c}">
          <div class="leaderboard-rank">
            ${n||`#${e.rank}`}
          </div>
          <div class="leaderboard-info">
            <div class="leaderboard-name">${e.first_name} ${e.last_name}${d?" (Vous)":""}</div>
            <div class="leaderboard-class">${e.currentClass}</div>
          </div>
          <div class="leaderboard-points">
            ${e.total_points} pts
          </div>
        </div>
      `}),r+="</div>",t.innerHTML=r}}window.logout=function(){o.clearUser(),window.location.href="./index.html"};window.goBack=function(){window.location.href="./profile.html"};document.addEventListener("DOMContentLoaded",()=>{new b});
