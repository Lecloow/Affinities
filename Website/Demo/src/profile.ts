import { StorageService } from './storage';
import { ApiService } from './api';
import { HintsResponse, DayHints, Hint, UserStatsResponse, CandidatesResponse } from './types';

export class ProfilePage {
  private contentEl: HTMLElement | null = null;
  private hintsData: HintsResponse | null = null;
  private userStats: UserStatsResponse | null = null;
  private candidates: CandidatesResponse | null = null;
  private refreshInterval: number | null = null;
  private timerInterval: number | null = null;
  private selectedDay: number = 1;

  constructor() {
    this.init();
    window.addEventListener('beforeunload', () => this.cleanup());
  }

private adjustServerTime(dateInput: string | Date): Date {
  const date = new Date(dateInput);
  date.setHours(date.getHours() + 1);
  return date;
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

    // Si on arrive en mode demo, reset le state pour un départ propre
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('demo') === '1') {
      // Déclenche un reset côté API (le login demo fait déjà ça, mais au cas où)
      ApiService.login('demo').catch(() => {});
    }

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
  console.log('🔥🔥🔥 PROFILE RENDER START');

  if (!this.contentEl) return;

  const raw = localStorage.getItem('saint_valentin_user');
  console.log('🔥🔥🔥 RAW STORAGE:', raw);

  const user = StorageService.getUser();
  console.log('🔥🔥🔥 USER:', user);

  if (!user) {
    console.log('🔥🔥🔥 NO USER FOUND');
    this.renderNotConnected();
    return;
  }

  console.log('🔥🔥🔥 USER OK, RENDERING PROFILE');
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
      window.location.href = '../index.html';
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

    await this.loadAndRenderHints();
  }

private async loadAndRenderHints(): Promise<void> {
  const user = StorageService.getUser();
  if (!user) return;

  try {
    const [hintsData, userStats, candidates] = await Promise.all([
      ApiService.getHints(user.id),
      ApiService.getUserStats(user.id).catch((error) => {
        console.warn('Failed to load user stats:', error);
        return { user_id: user.id, total_points: 0, code_exchange_bonus: 0, guesses: [] };
      }),
      ApiService.getCandidates(user.id).catch((error) => {
        console.warn('Failed to load candidates:', error);
        return { candidates: [] };
      })
    ]);
    
    this.hintsData = hintsData;
    this.userStats = userStats;
    this.candidates = candidates;

    this.renderHints();

  } catch (error) {
    console.error('Error loading hints:', error);
    const hintsSection = document.getElementById('hints-section');
    if (hintsSection) {
      hintsSection.innerHTML = `
        <div class="error-state">
          Impossible de charger les indices.<br>
          Les âmes soeurs n'ont peut-être pas encore été créés.
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
        ${this.renderUserScore()}
        ${segmentedHtml}
        ${this.renderDayHints(selectedDayData)}
        ${this.renderRevealButton(selectedDayData)}
        ${this.renderGuessSection(selectedDayData)}
        ${this.renderRevealCodeSection(selectedDayData)}
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

    // Attach guess form listener with autocomplete
    const guessForm = hintsSection.querySelector('.guess-form') as HTMLFormElement;
    const guessInput = hintsSection.querySelector('.guess-input') as HTMLInputElement;
    const autocompleteDropdown = hintsSection.querySelector('.autocomplete-dropdown') as HTMLElement;
    
    if (guessInput && autocompleteDropdown && this.candidates) {
      let selectedUserId: string | null = null;
      
      // Handle input changes
      guessInput.addEventListener('input', (e) => {
        const query = (e.target as HTMLInputElement).value.toLowerCase().trim();
        selectedUserId = null; // Reset selection
        
        if (query.length === 0) {
          autocompleteDropdown.style.display = 'none';
          return;
        }
        
        // Filter candidates
        const matches = this.candidates!.candidates.filter(c => 
          c.first_name.toLowerCase().includes(query) || 
          c.last_name.toLowerCase().includes(query)
        );
        
        if (matches.length === 0) {
          autocompleteDropdown.style.display = 'none';
          return;
        }
        
        // Build dropdown
        autocompleteDropdown.innerHTML = matches.map(c => 
          `<div class="autocomplete-item" data-id="${c.id}">${c.first_name} ${c.last_name}</div>`
        ).join('');
        autocompleteDropdown.style.display = 'block';
        
        // Attach click handlers to items
        autocompleteDropdown.querySelectorAll('.autocomplete-item').forEach(item => {
          item.addEventListener('click', () => {
            const id = (item as HTMLElement).dataset.id!;
            const candidate = this.candidates!.candidates.find(c => c.id === id);
            if (candidate) {
              guessInput.value = `${candidate.first_name} ${candidate.last_name}`;
              selectedUserId = id;
              autocompleteDropdown.style.display = 'none';
            }
          });
        });
      });
      
      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!guessInput.contains(e.target as Node) && !autocompleteDropdown.contains(e.target as Node)) {
          autocompleteDropdown.style.display = 'none';
        }
      });
      
      // Handle form submission
      if (guessForm) {
        guessForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          if (selectedUserId) {
            await this.handleSubmitGuess(this.selectedDay, selectedUserId);
          } else {
            alert('Veuillez sélectionner une personne dans la liste');
          }
        });
      }
    }

    // Attach code exchange form listener
    const codeExchangeForm = hintsSection.querySelector('.code-exchange-form') as HTMLFormElement;
    if (codeExchangeForm) {
      codeExchangeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const input = codeExchangeForm.querySelector('.code-exchange-input') as HTMLInputElement;
        if (input && input.value) {
          await this.handleExchangeCode(this.selectedDay, input.value);
        }
      });
    }
  }

  private renderRevealButton(day: DayHints): string {
    const availableUnrevealed = day.hints.filter(h => h.available && !h.revealed).length;
    const allHintsRevealed = day.hints.every(h => h.revealed);

    // Tous révélés mais match pas encore → bouton "Révéler l'identité"
    if (allHintsRevealed && !day.match_revealed) {
      return `
      <div class="reveal-btn-container">
        <button class="global-reveal-btn" data-day="${day.day}">💝 Révéler l'identité</button>
      </div>
    `;
    }

    // Match déjà révélé → bouton désactivé
    if (day.match_revealed) {
      return `
      <div class="reveal-btn-container">
        <button class="global-reveal-btn" disabled>Identité révélée ✓</button>
      </div>
    `;
    }

    const label = availableUnrevealed === 1
        ? "Révéler l'indice disponible"
        : `Révéler les ${availableUnrevealed} indices disponibles`;

    return `
    <div class="reveal-btn-container">
      <button class="global-reveal-btn" data-day="${day.day}" ${availableUnrevealed === 0 ? 'disabled' : ''}>${label}</button>
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

  private getTimeTagHtml(
    targetTime: Date,
    options: {
      isActive: boolean;        // équivalent de revealed/available
      nowLabel?: string;        // "Disponible !" ou "Maintenant !"
    }
  ): string {
    const now = new Date();
    const diff = targetTime.getTime() - now.getTime();


    // Passe (il y a x min/heures)
    if (options.isActive) {
      const pastDiff = now.getTime() - targetTime.getTime();
      const totalMinutes = Math.floor(pastDiff / 60000);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      let timeStr: string;

      if (hours > 0) {
        timeStr = `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`;
      } else {
        timeStr = `${totalMinutes > 0 ? totalMinutes : 1} min`;
      }

      return `<span class="time-tag"><span>Il y a</span><span>${timeStr}</span></span>`;
    }

    if (diff <= 0) {
      return `<span class="time-tag">${options.nowLabel ?? 'Maintenant !'}</span>`;
    }


    // Futur(dans x min/heures ou à HHhMM)
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    if (diff < 60 * 60 * 1000) {
      const countdown = minutes > 0
        ? `${minutes}min ${seconds}s`
        : `${seconds}s`;

      return `<span class="time-tag" data-timer data-target="${targetTime.toISOString()}">
                <span>Dans</span>
                <span class="timer-value">${countdown}</span>
              </span>`;
    }

    const timeStr = targetTime
      .toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      .replace(':', 'h');

    return `<span class="time-tag"><span>A</span><span>${timeStr}</span></span>`;
  }

  private getHintTimeTagHtml(hint: Hint): string {
    const dropTime = this.adjustServerTime(hint.drop_time);

    return this.getTimeTagHtml(dropTime, {
      isActive: hint.revealed || hint.available,
      nowLabel: 'Disponible !'
    });
  }


  private getRevealTimeTagHtml(revealTime: Date, isRevealed: boolean): string {
    const dropTime = this.adjustServerTime(revealTime);

    return this.getTimeTagHtml(dropTime, {
      isActive: isRevealed,
      nowLabel: 'Maintenant !'
    });
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

  // ─── User Score ──────────────────────────────────────────────────────────

  private renderUserScore(): string {
    if (!this.userStats) return '';

    return `
      <div class="user-score-section">
        <div class="user-score-label">Ton Score Total</div>
        <div class="user-score-value">${this.userStats.total_points} pts</div>
        <a href="./leaderboard.html" class="leaderboard-link-btn">Voir le classement 🏆</a>
      </div>
    `;
  }

  // ─── Guess Section ───────────────────────────────────────────────────────

  private renderGuessSection(day: DayHints): string {
    const user = StorageService.getUser();
    if (!user || !this.candidates) return '';

    // Check if reveal time has passed
    const revealTime = new Date(day.reveal_time);
    const now = new Date();
    if (now >= revealTime) {
      return `
        <div class="guess-section disabled">
          <div class="guess-title">🎯 Deviner mon âme sœur</div>
          <div class="guess-result info">
            Le temps pour deviner est écoulé. L'identité a été révélée!
          </div>
        </div>
      `;
    }

    // Get all guesses for this day
    const dayGuesses = this.userStats?.guesses.filter(g => g.day === day.day) || [];
    
    // Check which hints are revealed
    const hints = day.hints;
    const hint1Revealed = hints[0]?.revealed || false;
    const hint2Revealed = hints[1]?.revealed || false;
    const hint3Revealed = hints[2]?.revealed || false;
    
    // Check which guesses have been made
    const guess1Made = dayGuesses.some(g => g.hint_number === 1);
    const guess2Made = dayGuesses.some(g => g.hint_number === 2);
    const guess3Made = dayGuesses.some(g => g.hint_number === 3);
    
    // Determine which hint we can guess on
   let availableHintNumber = 0;

    if (hint1Revealed && !guess1Made) {
      availableHintNumber = 1;
    } else if (hint2Revealed && !guess2Made) {
      availableHintNumber = 2;
    } else if (hint3Revealed && !guess3Made) {
      availableHintNumber = 3;
    }

    // Calculate potential points based on number of hints revealed (not hint number)
    const hintsRevealedCount = [hint1Revealed, hint2Revealed, hint3Revealed].filter(Boolean).length;
    let potentialPoints = 0;
    if (hintsRevealedCount === 1) potentialPoints = 100;
    else if (hintsRevealedCount === 2) potentialPoints = 75;
    else if (hintsRevealedCount === 3) potentialPoints = 50;
    
    // Build guess history
    let guessHistoryHtml = '';
    if (dayGuesses.length > 0) {
      guessHistoryHtml = '<div class="guess-history">';
      guessHistoryHtml += '<div class="guess-history-title">Tes tentatives:</div>';
      dayGuesses.forEach(g => {
        const icon = g.is_correct ? '✓' : '✗';
        const className = g.is_correct ? 'success' : 'error';
        const candidate = this.candidates?.candidates.find(c => c.id === g.guessed_user_id);
        const name = candidate ? `${candidate.first_name} ${candidate.last_name}` : 'Inconnu';
        guessHistoryHtml += `
          <div class="guess-history-item ${className}">
            ${icon} Indice ${g.hint_number}: ${name} ${g.is_correct ? `(+${g.points_earned}pts)` : ''}
          </div>
        `;
      });
      guessHistoryHtml += '</div>';
    }
    
    // If no available hint, show status
    if (availableHintNumber === 0) {
      const revealedCount = [hint1Revealed, hint2Revealed, hint3Revealed].filter(Boolean).length;
      if (revealedCount === 0) {
        return `
          <div class="guess-section disabled">
            <div class="guess-title">🎯 Deviner mon âme sœur</div>
            <div class="guess-description">
              Révèles au moins un indice pour pouvoir deviner qui est ton âme sœur!
            </div>
          </div>
        `;
      } else {
        return `
          <div class="guess-section disabled">
            <div class="guess-title">🎯 Deviner mon âme sœur</div>
            ${guessHistoryHtml}
            <div class="guess-description">
              Révèles le prochain indice pour faire une nouvelle tentative!
            </div>
          </div>
        `;
      }
    }

    // Show guess form with autocomplete input
    return `
      <div class="guess-section" data-hint-number="${availableHintNumber}">
        <div class="guess-title">🎯 Deviner mon âme sœur (Indice ${availableHintNumber})</div>
        ${guessHistoryHtml}
        <div class="guess-description">
          Si tu devines correctement avec cet indice, tu gagneras <strong>${potentialPoints} points</strong>!
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
    `;
  }

  private calculateGuessPoints(hintNumber: number): number {
    const pointsMap: { [key: number]: number } = {
      1: 100,
      2: 75,
      3: 50
    };
    return pointsMap[hintNumber] || 0;
  }

private async handleSubmitGuess(day: number, guessedUserId: string): Promise<void> {
  const user = StorageService.getUser();
  if (!user) return;

  const dayData = this.hintsData?.days.find(d => d.day === day);
  if (!dayData) {
    alert('Impossible de trouver les indices pour ce jour');
    return;
  }

  const dayGuesses = this.userStats?.guesses.filter(g => g.day === day) || [];

  // Déterminer le prochain hint disponible à deviner
  // Trouve le premier hint révélé qui n'a pas encore été deviné
  const nextHint = dayData.hints.find((hint, index) => {
    const guessMade = dayGuesses.some(g => g.hint_number === index + 1);
    return hint.revealed && !guessMade;
  });

  // Si trouvé, récupère son numéro (index + 1), sinon 0
  const hintNumber = nextHint ? dayData.hints.indexOf(nextHint) + 1 : 0;


  if (hintNumber === 0) {
    alert('Aucun indice disponible pour deviner pour le moment !');
    return;
  }

  try {
    const guessForm = document.querySelector('.guess-form');
    const submitBtn = guessForm?.querySelector('.guess-submit-btn') as HTMLButtonElement;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Envoi en cours...';
    }

    const result = await ApiService.submitGuess(user.id, day, hintNumber, guessedUserId);

    await this.loadAndRenderHints();

    if (result.is_correct) {
      alert(`🎉 ${result.message}\n\nTu gagne ${result.points_earned} points!`);
    } else {
      alert(`😔 ${result.message}`);
    }

  } catch (error: any) {
    console.error('Error submitting guess:', error);
    alert(error.message || 'Erreur lors de l\'envoi de ta réponse. Veuillez réessayer.');
    await this.loadAndRenderHints();
  } finally {
    const guessForm = document.querySelector('.guess-form');
    const submitBtn = guessForm?.querySelector('.guess-submit-btn') as HTMLButtonElement;
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Valider mon choix';
    }
  }
}




  // ─── Reveal Code Section ─────────────────────────────────────────────────

  private renderRevealCodeSection(day: DayHints): string {
    if (!day.match_revealed) {
      return ''; // Don't show reveal code section until match is revealed
    }

    const user = StorageService.getUser();
    if (!user) return '';

    // We'll fetch the reveal code async and update the section
    this.loadRevealCode(user.id, day.day);

    return `<div id="reveal-code-container-${day.day}"></div>`;
  }

  private async loadRevealCode(userId: string, day: number): Promise<void> {
  try {
    const codeData = await ApiService.getRevealCode(userId, day);
    const container = document.getElementById(`reveal-code-container-${day}`);

    if (!container) return;

    if (!codeData.available) {
      container.innerHTML = '';
      return;
    }

    if (codeData.both_exchanged) {
      container.innerHTML = `
        <div class="reveal-code-section">
          <div class="reveal-code-title">🎁 Code d'échange</div>
          <div class="code-exchange-success">
            ✓ Vous avez tous les deux échangé vos codes! Félicitations! 🎉
          </div>
        </div>
      `;
      return;
    }
    // Show the code until both type it
    const exchangeStatus = codeData.exchanged
      ? '<div class="code-exchange-pending">⏳ En attente que ton âme sœur échange son code...</div>'
      : '';

    container.innerHTML = `
      <div class="reveal-code-section">
        <div class="reveal-code-title">🎁 Ton Code Secret</div>
        <div class="reveal-code-display">
          <div class="reveal-code-value">${codeData.code}</div>
        </div>
        ${exchangeStatus}
        <div class="reveal-code-description">
          Partages ce code avec ton âme sœur! Si vous échangez vos codes, vous gagnerez tous les deux <strong>100 points bonus</strong>!
        </div>
        <form class="code-exchange-form">
          <input 
            type="text" 
            class="code-exchange-input" 
            placeholder="Code de ton âme sœur" 
            maxlength="6"
            ${codeData.exchanged ? 'disabled' : ''}
            required
          />
          <button type="submit" class="code-exchange-btn" ${codeData.exchanged ? 'disabled' : ''}>
            ${codeData.exchanged ? 'Code déjà échangé' : 'Échanger le code'}
          </button>
        </form>
      </div>
    `;

    // Re-attach the form listener for this specific section
    const form = container.querySelector('.code-exchange-form') as HTMLFormElement;
    if (form && !codeData.exchanged) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const input = form.querySelector('.code-exchange-input') as HTMLInputElement;
        if (input && input.value) {
          await this.handleExchangeCode(day, input.value);
        }
      });
    }
  } catch (error) {
    console.error('Error loading reveal code:', error);
  }
}

  private async handleExchangeCode(day: number, partnerCode: string): Promise<void> {
    const user = StorageService.getUser();
    if (!user) return;

    try {
      const form = document.querySelector('.code-exchange-form') as HTMLFormElement;
      const submitBtn = form?.querySelector('.code-exchange-btn') as HTMLButtonElement;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Échange en cours...';
      }

      const result = await ApiService.exchangeCode(user.id, day, partnerCode.toUpperCase());
      
      await this.loadAndRenderHints();

      alert(`🎉 ${result.message}\n\nTu gagne ${result.points_earned} points bonus!`);
    } catch (error: any) {
      console.error('Error exchanging code:', error);
      alert(error.message || 'Code invalide ou erreur lors de l\'échange. Veuillez vérifier et réessayer.');
      await this.loadAndRenderHints();
    }
  }
}

// ─── Global logout ─────────────────────────────────────────────────────────

(window as any).logout = function () {
  StorageService.clearUser();
  window.location.href = '../index.html';
};

// ─── Bootstrap ─────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  new ProfilePage();
});
