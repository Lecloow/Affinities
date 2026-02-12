import { StorageService } from './storage';
import { ApiService } from './api';
import { LeaderboardResponse } from './types';

// Refresh leaderboard every 2 minutes
const LEADERBOARD_REFRESH_INTERVAL_MS = 120000;

export class LeaderboardPage {
  private contentEl: HTMLElement | null = null;
  private leaderboardData: LeaderboardResponse | null = null;
  private refreshInterval: number | null = null;

  constructor() {
    this.init();
    window.addEventListener('beforeunload', () => this.cleanup());
  }

  private cleanup(): void {
    if (this.refreshInterval !== null) {
      window.clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  private init(): void {
    this.contentEl = document.getElementById('content');
    this.render();

    // Refresh leaderboard periodically
    this.refreshInterval = window.setInterval(() => {
      this.loadAndRenderLeaderboard();
    }, LEADERBOARD_REFRESH_INTERVAL_MS);
  }

  private async render(): Promise<void> {
    if (!this.contentEl) return;

    const user = StorageService.getUser();

    // Logout icon SVG (door with arrow)
    const logoutIcon = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 13v-2H7V8l-5 4 5 4v-3z" fill="white"/>
      <path d="M20 3h-9c-1.103 0-2 .897-2 2v4h2V5h9v14h-9v-4H9v4c0 1.103.897 2 2 2h9c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2z" fill="white"/>
    </svg>`;

    // Back arrow icon
    const backIcon = `<svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
      <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
    </svg>`;

    this.contentEl.innerHTML = `
      <div class="page-wrapper">
        <!-- Header -->
        <header>
          <div class="page-header">
            <button class="back-btn" onclick="goBack()" aria-label="Retour">
              ${backIcon}
            </button>
            <p class="greeting-text" style="flex: 1; text-align: center; margin: 0;">Classement</p>
            ${user ? `<button class="logout-btn" onclick="logout()" aria-label="Se déconnecter">${logoutIcon}</button>` : '<div style="width: 48px;"></div>'}
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
    `;

    await this.loadAndRenderLeaderboard();
  }

  private async loadAndRenderLeaderboard(): Promise<void> {
    try {
      this.leaderboardData = await ApiService.getLeaderboard();
      this.renderLeaderboard();
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      const leaderboardSection = document.getElementById('leaderboard-section');
      if (leaderboardSection) {
        leaderboardSection.innerHTML = `
          <div class="error-state">Impossible de charger le classement.</div>
        `;
      }
    }
  }

  private renderLeaderboard(): void {
    if (!this.leaderboardData || !this.contentEl) return;

    const leaderboardSection = document.getElementById('leaderboard-section');
    if (!leaderboardSection) return;

    if (this.leaderboardData.leaderboard.length === 0) {
      leaderboardSection.innerHTML = `
        <div class="info-state">Le classement sera disponible une fois que des participants auront obtenu des points.</div>
      `;
      return;
    }

    const user = StorageService.getUser();
    const userId = user?.id;

    let rows = '<div class="leaderboard-container">';

    // Add update time
    const now = new Date();
    const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    rows += `
        <div class="leaderboard-update-time">Dernière mise à jour : ${timeStr}</div>
        <div class="leaderboard-comment">
            Suite aux bugs d’hier, nous avons décidé de réinitialiser le classement pour repartir sur de bonnes bases.<br>
            Merci de votre compréhension.
         </div>

    `;

    this.leaderboardData.leaderboard.forEach((entry) => {
      const isCurrentUser = entry.user_id === userId;
      const rankClass = entry.rank === 1 ? 'rank-1' : entry.rank === 2 ? 'rank-2' : entry.rank === 3 ? 'rank-3' : '';
      const highlightClass = isCurrentUser ? 'current-user' : '';

      const medal = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : '';

      rows += `
        <div class="leaderboard-row ${rankClass} ${highlightClass}">
          <div class="leaderboard-rank">
            ${medal ? medal : `#${entry.rank}`}
          </div>
          <div class="leaderboard-info">
            <div class="leaderboard-name">${entry.first_name} ${entry.last_name}${isCurrentUser ? ' (Toi)' : ''}</div>
            <div class="leaderboard-class">${entry.currentClass}</div>
          </div>
          <div class="leaderboard-points">
            ${entry.total_points} pts
          </div>
        </div>
      `;
    });

    rows += '</div>';

    leaderboardSection.innerHTML = rows;
  }
}

// ─── Global functions ─────────────────────────────────────────────────────────

(window as any).logout = function () {
  StorageService.clearUser();
  window.location.href = './index.html';
};

(window as any).goBack = function () {
  window.location.href = './profile.html';
};

// ─── Bootstrap ─────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  new LeaderboardPage();
});