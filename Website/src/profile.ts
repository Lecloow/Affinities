import { StorageService } from './storage';
import { ApiService } from './api';
import { HintsResponse, DayHints, Hint } from './types';

export class ProfilePage {
  private contentEl: HTMLElement | null = null;
  private hintsData: HintsResponse | null = null;
  private refreshInterval: number | null = null;
  private timerInterval: number | null = null;
  private selectedDay: number = 1; // Default to day 1 (Jeudi)

  constructor() {
    this.init();
    window.addEventListener('beforeunload', () => this.cleanup());
  }

  private cleanup(): void {
    if (this.refreshInterval !== null) {
      window.clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
    if (this.timerInterval !== null) {
      window.clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private init(): void {
    this.contentEl = document.getElementById('content');
    this.render();

    // Refresh hints every 30 seconds to check for new available hints
    this.refreshInterval = window.setInterval(() => {
      this.loadAndRenderHints();
    }, 30000);

    // Update timers every second for smooth countdown
    this.timerInterval = window.setInterval(() => {
      this.updateTimersOnly();
    }, 1000);
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
      <div class="not-connected">
        <div class="error-state">Vous n'êtes pas connecté. Redirection...</div>
      </div>
    `;

    setTimeout(() => {
      window.location.href = './index.html';
    }, 2000);
  }

  private async renderProfile(user: any): Promise<void> {
    if (!this.contentEl) return;

    // Logout icon SVG (door with arrow)
    const logoutIcon = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 13v-2H7V8l-5 4 5 4v-3z" fill="white"/>
      <path d="M20 3h-9c-1.103 0-2 .897-2 2v4h2V5h9v14h-9v-4H9v4c0 1.103.897 2 2 2h9c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2z" fill="white"/>
    </svg>`;

    this.contentEl.innerHTML = `
      <div class="page-wrapper">
        <!-- Top floral corners handled via CSS pseudo-elements on #app -->
        
        <!-- Header -->
        <header>
          <div class="page-header">
            <p class="greeting-text">👋 Salut ${user.first_name}!</p>
            <button class="logout-btn" onclick="logout()" aria-label="Se déconnecter">
              ${logoutIcon}
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
    `;

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
          <div class="error-state">Impossible de charger les indices.<br>Les âmes soeurs n'ont peut-être pas encore été créés.</div>
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
        <div class="info-state">Les indices seront disponibles une fois les âmes soeurs créés.</div>
      `;
      return;
    }

    // Build segmented control only if more than 1 day
    let segmentedHtml = '';
    if (this.hintsData.days.length > 1) {
      const buttons = this.hintsData.days.map(day => {
        const label = day.day === 1 ? 'Jeudi' : 'Vendredi';
        const active = day.day === this.selectedDay ? 'active' : '';
        return `<button class="segment-btn ${active}" data-day="${day.day}">${label}</button>`;
      }).join('');
      segmentedHtml = `<div class="segmented-control">${buttons}</div>`;
    }

    const selectedDayData = this.hintsData.days.find(d => d.day === this.selectedDay)
      ?? this.hintsData.days[0];

    hintsSection.innerHTML = `
      <div class="page-content">
        ${segmentedHtml}
        ${this.renderDayHints(selectedDayData)}
        ${this.renderRevealButton(selectedDayData)}
      </div>
    `;

    // Attach listeners
    hintsSection.querySelectorAll('.segment-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLButtonElement;
        const day = parseInt(target.dataset.day || '1');
        if (day !== this.selectedDay) {
          this.selectedDay = day;
          this.renderHints();
        }
      });
    });

    hintsSection.querySelectorAll('.global-reveal-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const target = e.target as HTMLButtonElement;
        const day = parseInt(target.dataset.day || '0');
        if (day) await this.handleRevealAllHints(day);
      });
    });
  }

  private renderRevealButton(day: DayHints): string {
    const availableUnrevealed = day.hints.filter(h => h.available && !h.revealed).length;

    const label = availableUnrevealed === 0
      ? 'Révéler un indice'
      : availableUnrevealed === 1
        ? 'Révéler l\'indice disponible'
        : `Révéler les ${availableUnrevealed} indices disponibles`;

    const disabled = availableUnrevealed === 0 ? 'disabled' : '';

    return `
      <div class="reveal-btn-container">
        <button class="global-reveal-btn" data-day="${day.day}" ${disabled}>${label}</button>
      </div>
    `;
  }

  private async handleRevealAllHints(day: number): Promise<void> {
    const user = StorageService.getUser();
    if (!user) return;

    try {
      const button = document.querySelector(`.global-reveal-btn[data-day="${day}"]`) as HTMLButtonElement;
      if (button) {
        button.disabled = true;
        button.textContent = 'Révélation en cours…';
      }

      const result = await ApiService.revealAllHints(user.id, day);
      await this.loadAndRenderHints();

      if (result.revealed_count > 0) {
        console.log(`${result.revealed_count} hint(s) revealed successfully`);
      }
    } catch (error) {
      console.error('Error revealing hints:', error);
      alert('Erreur lors de la révélation des indices. Veuillez réessayer.');
      await this.loadAndRenderHints();
    }
  }

  // ─── Time tag helpers ────────────────────────────────────────────────────

  /** Returns the full time tag HTML for a hint */
  private getHintTimeTagHtml(hint: Hint): string {
    const now = new Date();
    const dropTime = new Date(hint.drop_time);

    if (hint.revealed || hint.available) {
      // Show "Il y a X"
      const diff = now.getTime() - dropTime.getTime();
      const totalMinutes = Math.floor(diff / 60000);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      let timeStr: string;
      if (hours > 0) {
        timeStr = `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`;
      } else if (minutes > 0) {
        timeStr = `${minutes} min`;
      } else {
        timeStr = '1 min';
      }
      return `<span class="time-tag"><span>Il y a</span><span>${timeStr}</span></span>`;
    } else {
      // Locked — show "Dans X" or "A HHhMM"
      const diff = dropTime.getTime() - now.getTime();
      if (diff <= 0) {
        return `<span class="time-tag">Disponible !</span>`;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      if (diff < 60 * 60 * 1000) {
        // under 1 hour → countdown "Dans Xmin Xs"
        const countdown = minutes > 0 ? `${minutes}min ${seconds}s` : `${seconds}s`;
        return `<span class="time-tag" data-timer data-target="${dropTime.toISOString()}"><span>Dans</span><span class="timer-value">${countdown}</span></span>`;
      } else {
        // Show scheduled time "A HHhMM"
        const timeStr = dropTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
          .replace(':', 'h');
        return `<span class="time-tag"><span>A</span><span>${timeStr}</span></span>`;
      }
    }
  }

  private getRevealTimeTagHtml(revealTime: Date, isRevealed: boolean): string {
    const now = new Date();
    if (isRevealed) {
      const diff = now.getTime() - revealTime.getTime();
      const totalMinutes = Math.floor(diff / 60000);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const timeStr = hours > 0
        ? `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`
        : `${totalMinutes > 0 ? totalMinutes : 1} min`;
      return `<span class="time-tag"><span>Il y a</span><span>${timeStr}</span></span>`;
    }

    const diff = revealTime.getTime() - now.getTime();
    if (diff <= 0) {
      return `<span class="time-tag">Maintenant !</span>`;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    if (diff < 60 * 60 * 1000) {
      const countdown = minutes > 0 ? `${minutes}min ${seconds}s` : `${seconds}s`;
      return `<span class="time-tag" data-timer data-target="${revealTime.toISOString()}"><span>Dans</span><span class="timer-value">${countdown}</span></span>`;
    }

    const timeStr = revealTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      .replace(':', 'h');
    return `<span class="time-tag"><span>A</span><span>${timeStr}</span></span>`;
  }

  // ─── Hint content rendering ──────────────────────────────────────────────

  /**
   * Detects patterns and wraps important info in styled tags:
   * - "prénom commence par la lettre : X" → letter in letter-tag
   * - "Son prénom est: Pauline" → name in pink-box
   * - "Son nom contient 6 lettres" → number in pink-box
   * - "Il/Elle est dans la classe: Terminale D" → class in pink-box
   */
  private renderHintContent(content: string): string {
    // Pattern 1: Letter (existing)
    const letterMatch = content.match(/^(.+?:\s*)([A-ZÀ-ÖØ-Ý])$/i);
    if (letterMatch) {
      const text = letterMatch[1];
      const letter = letterMatch[2].toUpperCase();
      return `
        <div class="hint-content-row">
          <span class="hint-content-text">${text}</span>
          <span class="letter-tag">${letter}</span>
        </div>
      `;
    }

    // Pattern 2: "Son prénom est: Pauline"
    const firstNameMatch = content.match(/^(Son prénom est:\s*)(.+)$/i);
    if (firstNameMatch) {
      const text = firstNameMatch[1];
      const name = firstNameMatch[2];
      return `
        <div class="hint-content-row">
          <span class="hint-content-text">${text}</span>
          <span class="pink-box">${name}</span>
        </div>
      `;
    }

    // Pattern 3: "Son nom contient 6 lettres" or any number
    const numberMatch = content.match(/^(.+\s)(\d+)(\s.+)$/);
    if (numberMatch) {
      const textBefore = numberMatch[1];
      const number = numberMatch[2];
      const textAfter = numberMatch[3];
      return `
        <div class="hint-content-row">
          <span class="hint-content-text">${textBefore}</span>
          <span class="pink-box">${number}</span>
          <span class="hint-content-text">${textAfter}</span>
        </div>
      `;
    }

    // Pattern 4: "Il/Elle est dans la classe: Terminale D"
    const classMatch = content.match(/^(Il\/Elle est dans la classe:\s*)(.+)$/i);
    if (classMatch) {
      const text = classMatch[1];
      const className = classMatch[2];
      return `
        <div class="hint-content-row">
          <span class="hint-content-text">${text}</span>
          <span class="pink-box">${className}</span>
        </div>
      `;
    }

    // Default: no special formatting
    return `
      <div class="hint-content-row">
        <span class="hint-content-text">${content}</span>
      </div>
    `;
  }

  // ─── Main day renderer ───────────────────────────────────────────────────

  private renderDayHints(day: DayHints): string {
    const revealTime = new Date(day.reveal_time);
    let rows = '';

    day.hints.forEach((hint, index) => {
      const badgeClass = hint.available && hint.revealed ? 'revealed'
                       : hint.available && !hint.revealed ? 'undiscovered'
                       : 'undiscovered';
      const badgeLabel = `Indice n°${index + 1}`;
      const timeTagHtml = this.getHintTimeTagHtml(hint);

      rows += `
        <div class="hint-row">
          <span class="hint-badge ${badgeClass}">${badgeLabel}</span>
          ${timeTagHtml}
        </div>
      `;

      if (hint.revealed && hint.content) {
        rows += this.renderHintContent(hint.content);
      }
    });

    // Match reveal row - badge becomes orange when revealed
    const revealBadgeClass = day.match_revealed ? 'reveal-badge revealed' : 'reveal-badge';
    const revealTimeTagHtml = this.getRevealTimeTagHtml(revealTime, day.match_revealed);
    rows += `
      <div class="section-divider"></div>
      <div class="hint-row">
        <span class="hint-badge ${revealBadgeClass}">Reveal</span>
        ${revealTimeTagHtml}
      </div>
    `;

    if (day.match_revealed && day.match_info) {
      const dayName = day.day === 1 ? 'Jeudi 12 Février' : 'Vendredi 13 Février';
      rows += `
        <div class="match-revealed-card">
          <p class="match-title">Ton âme soeur du ${dayName}</p>
          <p class="match-name">${day.match_info.first_name} ${day.match_info.last_name}</p>
          <p class="match-class">${day.match_info.class}</p>
        </div>
      `;
    }

    return rows;
  }

  // ─── Timer update (lightweight, no re-render) ────────────────────────────

  private updateTimersOnly(): void {
    if (!this.hintsData) return;

    const timerEls = document.querySelectorAll<HTMLElement>('[data-timer]');
    timerEls.forEach(el => {
      const targetStr = el.dataset.target;
      if (!targetStr) return;

      const targetTime = new Date(targetStr);
      const now = new Date();
      const diff = targetTime.getTime() - now.getTime();

      const valueEl = el.querySelector('.timer-value');
      if (!valueEl) return;

      if (diff <= 0) {
        valueEl.textContent = 'maintenant !';
        this.loadAndRenderHints(); // trigger full reload
        return;
      }

      const minutes = Math.floor((diff % (1000 * 60 * 60)) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      const countdown = minutes > 0 ? `${minutes}min ${seconds}s` : `${seconds}s`;
      valueEl.textContent = countdown;
    });
  }
}

// ─── Global logout ─────────────────────────────────────────────────────────

(window as any).logout = function () {
  StorageService.clearUser();
  window.location.href = './index.html';
};

// ─── Bootstrap ─────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  new ProfilePage();
});