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
    // Cleanup on page unload
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
      <div class="error">Vous n'êtes pas connecté. Redirection...</div>
    `;

    setTimeout(() => {
      window.location.href = './index.html';
    }, 2000);
  }

  private async renderProfile(user: any): Promise<void> {
    if (!this.contentEl) return;

    this.contentEl.innerHTML = `
      <div class="greeting">Salut ${user.first_name}! 👋</div>

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

    // Render segmented control
    const segmentedControlHtml = `
      <div class="segmented-control">
        <button class="segment-btn ${this.selectedDay === 1 ? 'active' : ''}" data-day="1">
          Jeudi
        </button>
        <button class="segment-btn ${this.selectedDay === 2 ? 'active' : ''}" data-day="2">
          Vendredi
        </button>
      </div>
    `;

    // Find the selected day
    const selectedDayData = this.hintsData.days.find(day => day.day === this.selectedDay);
    const dayHtml = selectedDayData ? this.renderDayHints(selectedDayData) : '';

    hintsSection.innerHTML = `
      <div class="hints-container">
        <h2>💝 Indices pour trouver ton âme sœur</h2>
        ${segmentedControlHtml}
        ${dayHtml}
      </div>
    `;
    
    // Attach event listeners to segmented control buttons
    this.attachSegmentedControlListeners();
    
    // Attach event listeners to reveal buttons
    this.attachGlobalRevealButtonListeners();
  }
  
  private attachSegmentedControlListeners(): void {
    const segmentButtons = document.querySelectorAll('.segment-btn');
    segmentButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const target = e.target as HTMLButtonElement;
        const day = parseInt(target.dataset.day || '1');
        
        if (day !== this.selectedDay) {
          this.selectedDay = day;
          this.renderHints();
        }
      });
    });
  }
  
  private attachGlobalRevealButtonListeners(): void {
    const revealButtons = document.querySelectorAll('.global-reveal-btn');
    revealButtons.forEach(button => {
      button.addEventListener('click', async (e) => {
        const target = e.target as HTMLButtonElement;
        const day = parseInt(target.dataset.day || '0');
        
        if (day) {
          await this.handleRevealAllHints(day);
        }
      });
    });
  }
  
  private async handleRevealAllHints(day: number): Promise<void> {
    const user = StorageService.getUser();
    if (!user) return;
    
    try {
      // Disable the button during the request
      const button = document.querySelector(`[data-day="${day}"].global-reveal-btn`) as HTMLButtonElement;
      if (button) {
        const originalText = button.textContent;
        button.disabled = true;
        button.textContent = 'Révélation en cours...';
      }
      
      // Call the API to reveal all hints
      const result = await ApiService.revealAllHints(user.id, day);
      
      // Reload hints to show the revealed content
      await this.loadAndRenderHints();
      
      // Show success message if hints were revealed
      if (result.revealed_count > 0) {
        // Success message will be visible through the updated UI
        console.log(`${result.revealed_count} hint(s) revealed successfully`);
      }
      
    } catch (error) {
      console.error('Error revealing hints:', error);
      alert('Erreur lors de la révélation des indices. Veuillez réessayer.');
      
      // Reload to restore the correct button state
      await this.loadAndRenderHints();
    }
  }

  private async handleRevealHint(day: number, hintNumber: number): Promise<void> {
    const user = StorageService.getUser();
    if (!user) return;
    
    try {
      // Disable the button during the request
      const button = document.querySelector(`[data-day="${day}"][data-hint-number="${hintNumber}"]`) as HTMLButtonElement;
      if (button) {
        button.disabled = true;
        button.textContent = 'Révélation en cours...';
      }
      
      // Call the API to reveal the hint
      await ApiService.revealHint(user.id, day, hintNumber);
      
      // Reload hints to show the revealed content
      await this.loadAndRenderHints();
      
    } catch (error) {
      console.error('Error revealing hint:', error);
      alert('Erreur lors de la révélation de l\'indice. Veuillez réessayer.');
      
      // Re-enable the button on error
      const button = document.querySelector(`[data-day="${day}"][data-hint-number="${hintNumber}"]`) as HTMLButtonElement;
      if (button) {
        button.disabled = false;
        button.textContent = 'Révéler l\'indice';
      }
    }
  }

  private renderDayHints(day: DayHints): string {
    let hintsHtml = '';
    const now = new Date();
    
    // Count available but not revealed hints
    let availableUnrevealedCount = 0;
    let nextHintTime: Date | null = null;
    
    for (const hint of day.hints) {
      if (hint.available && !hint.revealed) {
        availableUnrevealedCount++;
      }
      const hintTime = new Date(hint.drop_time);
      if (!hint.available && hintTime > now && !nextHintTime) {
        nextHintTime = hintTime;
      }
    }

    // Render hints
    hintsHtml = day.hints.map((hint, index) => {
      if (hint.available) {
        const dropTime = new Date(hint.drop_time);
        const timeStr = dropTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        
        if (hint.revealed) {
          // Hint is revealed, show the content
          const difficultyLabel = hint.type === 'easy' ? '🟢 Facile' : 
                                 hint.type === 'medium' ? '🟡 Moyen' : '🔴 Difficile';
          
          return `
            <div class="hint-item available revealed">
              <div class="hint-header">
                <span class="hint-number">Indice ${index + 1}</span>
                <span class="hint-difficulty">${difficultyLabel}</span>
                <span class="hint-time">Révélé à ${timeStr}</span>
              </div>
              <div class="hint-content">${hint.content}</div>
            </div>
          `;
        } else {
          // Hint is available but not revealed yet, show placeholder
          return `
            <div class="hint-item available not-revealed">
              <div class="hint-header">
                <span class="hint-number">Indice ${index + 1}</span>
                <span class="hint-time">Disponible depuis ${timeStr}</span>
              </div>
              <div class="hint-content hint-placeholder">
                <span class="lock-icon">🎁</span>
                <span class="placeholder-text">Indice disponible - Cliquez sur le bouton en bas pour révéler</span>
              </div>
            </div>
          `;
        }
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
    
    // Create the global reveal button at the bottom
    let revealButtonHtml = '';
    if (availableUnrevealedCount > 0) {
      const buttonText = availableUnrevealedCount === 1 
        ? 'Révéler l\'indice disponible' 
        : `Révéler les ${availableUnrevealedCount} indices disponibles`;
      revealButtonHtml = `
        <div class="global-reveal-container">
          <button class="global-reveal-btn" data-day="${day.day}">
            ${buttonText}
          </button>
        </div>
      `;
    } else if (nextHintTime) {
      // Show time until next hint
      const minutesUntilNext = Math.ceil((nextHintTime.getTime() - now.getTime()) / (1000 * 60));
      const timeText = minutesUntilNext === 1 
        ? 'Prochain indice dans 1 minute' 
        : `Prochain indice dans ${minutesUntilNext} minutes`;
      revealButtonHtml = `
        <div class="global-reveal-container">
          <div class="next-hint-timer">
            <span class="timer-icon">⏱️</span>
            <span class="timer-text">${timeText}</span>
          </div>
        </div>
      `;
    }

    // Render match reveal section
    const dayName = day.day === 1 ? 'Jeudi 12 Février' : 'Vendredi 13 Février';
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
      <div class="day-hints-content">
        <div class="hints-list">
          ${hintsHtml}
        </div>
        ${revealButtonHtml}
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

  private updateTimersOnly(): void {
    // Update all timer elements without reloading data
    if (!this.hintsData) return;

    const timerElements = document.querySelectorAll('.timer');
    if (timerElements.length === 0) return;

    // Collect all times that need updating
    const times: { element: Element; targetTime: Date }[] = [];

    this.hintsData.days.forEach((day) => {
      day.hints.forEach((hint) => {
        if (!hint.available) {
          times.push({ element: null as any, targetTime: new Date(hint.drop_time) });
        }
      });
      if (!day.match_revealed) {
        times.push({ element: null as any, targetTime: new Date(day.reveal_time) });
      }
    });

    // Update each timer element
    let timerIndex = 0;
    timerElements.forEach((el) => {
      if (timerIndex < times.length) {
        const timeRemaining = this.getTimeRemaining(times[timerIndex].targetTime);
        el.textContent = timeRemaining;
        
        // If timer expired, reload the full hints data
        if (timeRemaining === 'Disponible maintenant!') {
          this.loadAndRenderHints();
        }
        timerIndex++;
      }
    });
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