import { StorageService } from './storage';
import { ApiService } from './api';
import { HintsResponse, DayHints, Hint } from './types';

export class ProfilePage {
  private contentEl: HTMLElement | null = null;
  private hintsData: HintsResponse | null = null;
  private refreshInterval: number | null = null;

  constructor() {
    this.init();
  }

  private init(): void {
    this.contentEl = document.getElementById('content');
    this.render();
    
    // Refresh hints every 30 seconds to update timers
    this.refreshInterval = window.setInterval(() => {
      this.loadAndRenderHints();
    }, 30000);
  }

  private async render(): Promise<void> {
    if (!this.contentEl) return;

    const user = StorageService.getUser();

    if (!user) {
      this.renderNotConnected();
      return;
    }

    await this.renderProfile(user);
  }

  private renderNotConnected(): void {
    if (!this.contentEl) return;

    this.contentEl.innerHTML = `
      <div class="error">Vous n'êtes pas connecté. Redirection...</div>
    `;

    setTimeout(() => {
      window.location.href = './index.html';
    }, 2000);
  }

  private async renderProfile(user: any): Promise<void> {
    if (!this.contentEl) return;

    this.contentEl.innerHTML = `
      <div class="greeting">Bonjour ${user.first_name}! 👋</div>
      
      <div class="user-info">
        <div class="info-row">
          <div class="label">Prénom</div>
          <div class="value">${user.first_name}</div>
        </div>
        <div class="info-row">
          <div class="label">Nom</div>
          <div class="value">${user.last_name}</div>
        </div>
        <div class="info-row">
          <div class="label">Email</div>
          <div class="value">${user.email}</div>
        </div>
        <div class="info-row">
          <div class="label">Classe</div>
          <div class="value">${user.currentClass}</div>
        </div>
      </div>

      <div id="hints-section">
        <div class="loading">Chargement des indices...</div>
      </div>

      <button class="logout-btn" onclick="logout()">Se déconnecter</button>
    `;

    // Load hints
    await this.loadAndRenderHints();
  }

  private async loadAndRenderHints(): Promise<void> {
    const user = StorageService.getUser();
    if (!user) return;

    try {
      this.hintsData = await ApiService.getHints(user.id);
      this.renderHints();
    } catch (error) {
      console.error('Error loading hints:', error);
      const hintsSection = document.getElementById('hints-section');
      if (hintsSection) {
        hintsSection.innerHTML = `
          <div class="hints-container">
            <h2>💝 Indices pour trouver ton âme sœur</h2>
            <div class="error">Impossible de charger les indices. Les matchs n'ont peut-être pas encore été créés.</div>
          </div>
        `;
      }
    }
  }

  private renderHints(): void {
    if (!this.hintsData || !this.contentEl) return;

    const hintsSection = document.getElementById('hints-section');
    if (!hintsSection) return;

    if (this.hintsData.days.length === 0) {
      hintsSection.innerHTML = `
        <div class="hints-container">
          <h2>💝 Indices pour trouver ton âme sœur</h2>
          <div class="info">Les indices seront disponibles une fois les matchs créés.</div>
        </div>
      `;
      return;
    }

    const daysHtml = this.hintsData.days.map(day => this.renderDayHints(day)).join('');

    hintsSection.innerHTML = `
      <div class="hints-container">
        <h2>💝 Indices pour trouver ton âme sœur</h2>
        ${daysHtml}
      </div>
    `;
  }

  private renderDayHints(day: DayHints): string {
    const dayName = day.day === 1 ? 'Jeudi 12 Février' : 'Vendredi 13 Février';
    
    let hintsHtml = '';
    const now = new Date();
    
    // Check for next available hint
    let nextHintTime: Date | null = null;
    for (const hint of day.hints) {
      const hintTime = new Date(hint.drop_time);
      if (!hint.available && hintTime > now) {
        nextHintTime = hintTime;
        break;
      }
    }

    // Render hints
    hintsHtml = day.hints.map((hint, index) => {
      if (hint.available) {
        const dropTime = new Date(hint.drop_time);
        const timeStr = dropTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        const difficultyLabel = hint.type === 'easy' ? '🟢 Facile' : 
                               hint.type === 'medium' ? '🟡 Moyen' : '🔴 Difficile';
        
        return `
          <div class="hint-item available">
            <div class="hint-header">
              <span class="hint-number">Indice ${index + 1}</span>
              <span class="hint-difficulty">${difficultyLabel}</span>
              <span class="hint-time">Révélé à ${timeStr}</span>
            </div>
            <div class="hint-content">${hint.content}</div>
          </div>
        `;
      } else {
        const dropTime = new Date(hint.drop_time);
        const timeStr = dropTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        const timeRemaining = this.getTimeRemaining(dropTime);
        
        return `
          <div class="hint-item locked">
            <div class="hint-header">
              <span class="hint-number">Indice ${index + 1}</span>
              <span class="hint-time">Disponible à ${timeStr}</span>
            </div>
            <div class="hint-content locked">
              <span class="lock-icon">🔒</span>
              <span class="timer">${timeRemaining}</span>
            </div>
          </div>
        `;
      }
    }).join('');

    // Render match reveal section
    let revealHtml = '';
    if (day.match_revealed && day.match_info) {
      revealHtml = `
        <div class="reveal-section revealed">
          <h3>🎉 Ton match du ${dayName}</h3>
          <div class="match-card">
            <div class="match-name">${day.match_info.first_name} ${day.match_info.last_name}</div>
            <div class="match-class">${day.match_info.class}</div>
          </div>
        </div>
      `;
    } else {
      const revealTime = new Date(day.reveal_time);
      const timeStr = revealTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      const timeRemaining = this.getTimeRemaining(revealTime);
      
      revealHtml = `
        <div class="reveal-section locked">
          <h3>🎁 Révélation du match</h3>
          <div class="reveal-timer">
            <span class="lock-icon">🔒</span>
            <div>
              <div>Disponible à ${timeStr}</div>
              <div class="timer">${timeRemaining}</div>
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div class="day-hints">
        <h3 class="day-title">${dayName}</h3>
        <div class="hints-list">
          ${hintsHtml}
        </div>
        ${revealHtml}
      </div>
    `;
  }

  private getTimeRemaining(targetTime: Date): string {
    const now = new Date();
    const diff = targetTime.getTime() - now.getTime();
    
    if (diff <= 0) {
      return 'Disponible maintenant!';
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `Dans ${hours}h ${minutes}min`;
    } else if (minutes > 0) {
      return `Dans ${minutes}min ${seconds}s`;
    } else {
      return `Dans ${seconds}s`;
    }
  }
}

// Fonction globale pour le logout
(window as any).logout = function() {
  StorageService.clearUser();
  window.location.href = './index.html';
};

// Initialise la page quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
  new ProfilePage();
});