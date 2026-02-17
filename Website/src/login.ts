import { ApiService, DEMO_USER } from './api';
import { StorageService } from './storage';

export class LoginPage {
  private form: HTMLFormElement | null = null;
  private passwordInput: HTMLInputElement | null = null;
  private resultEl: HTMLElement | null = null;
  private submitBtn: HTMLButtonElement | null = null;
  private demoBtn: HTMLButtonElement | null = null;

  constructor() {
    this.init();
  }

  /**
   * Initialise la page
   */
  private init(): void {
    this.cacheElements();
    this.attachEventListeners();
  }

  /**
   * Met en cache les éléments du DOM
   */
  private cacheElements(): void {
    this.form = document.getElementById('loginForm') as HTMLFormElement | null;
    this.passwordInput = document.getElementById('password') as HTMLInputElement | null;
    this.resultEl = document.getElementById('result') as HTMLElement | null;
    this.submitBtn = document.getElementById('submitBtn') as HTMLButtonElement | null;
    this.demoBtn = document.getElementById('demoBtn') as HTMLButtonElement | null;

    // Debug: log presence
    console.debug('LoginPage.cacheElements: form=', !!this.form, 'password=', !!this.passwordInput, 'result=', !!this.resultEl, 'demoBtn=', !!this.demoBtn);

    if (!this.form || !this.passwordInput || !this.resultEl) {
      console.error('Elements manquants dans le DOM');
    }
  }

  /**
   * Attache les event listeners
   */
  private attachEventListeners(): void {
    this.form?.addEventListener('submit', (e) => this.handleSubmit(e));
    this.passwordInput?.addEventListener('input', () => this.clearError());

    // Demo button: fill demo password and submit login flow
    if (this.demoBtn) {
      this.demoBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // Sauvegarde directement le demo user sans appel API
        StorageService.setUser(DEMO_USER);
        window.location.href = './profile.html?demo=1';
      });
    }

    // Fallback: delegate click at document level in case element wasn't found/cached
    document.addEventListener('click', async (e) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      // If the clicked element is the demoBtn or inside it
      const clickedDemo = (target.id === 'demoBtn') || (target.closest && target.closest('#demoBtn'));
      if (clickedDemo) {
        e.preventDefault();
        console.debug('demoBtn clicked (delegated handler)');
        if (!this.passwordInput) return;
        this.passwordInput.value = 'demo';
        if (this.resultEl) {
          this.resultEl.textContent = 'Mode démo activé...';
          this.resultEl.className = 'result info';
        }
        await this.submitLogin('demo');
      }
    });
  }

  /**
   * Gère la soumission du formulaire
   */
  private async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();

    const password = this.passwordInput?.value.trim();

    if (!password) {
      this.showError('Veuillez entrer un code.');
      return;
    }

    await this.submitLogin(password);
  }

  /**
   * Soumet la requête de login
   */
 private async submitLogin(password: string): Promise<void> {
   try {
     this.setLoading(true);
     this.clearError();

     const user = await ApiService.login(password);
     console.log('🔥🔥🔥 USER FROM API:', user);

     StorageService.setUser(user);
     console.log('🔥🔥🔥 SAVED TO STORAGE');

     const check = localStorage.getItem('saint_valentin_user');
     console.log('🔥🔥🔥 LOCALSTORAGE RAW:', check);

     const retrieved = StorageService.getUser();
     console.log('🔥🔥🔥 RETRIEVED:', retrieved);

     if (!retrieved) {
       alert('ERREUR: Utilisateur non sauvegardé!');
       return;
     }

     this.showSuccess('Connexion réussie! Redirection...');
     // If demo login, redirect with demo flag so profile can initialize demo state even on file://
     if (password === 'demo') {
       setTimeout(() => window.location.href = './profile.html?demo=1', 800);
     } else {
       setTimeout(() => window.location.href = './profile.html', 1000);
     }

   } catch (error: any) {
     console.error('❌ Error:', error);
     this.showError(error?.message || 'Erreur');
   } finally {
     this.setLoading(false);
   }
 }



  /**
   * Affiche un message d'erreur
   */
  private showError(message: string): void {
    if (!this.resultEl) return;
    this.resultEl.textContent = message;
    this.resultEl.className = 'result error';
  }

  /**
   * Affiche un message de succès
   */
  private showSuccess(message: string): void {
    if (!this.resultEl) return;
    this.resultEl.textContent = message;
    this.resultEl.className = 'result success';
  }

  /**
   * Affiche l'état de chargement
   */
  private setLoading(isLoading: boolean): void {
    if (this.submitBtn) {
      this.submitBtn.disabled = isLoading;
    }

    if (!this.resultEl) return;

    if (isLoading) {
      this.resultEl.innerHTML = '<span class="spinner"></span>Connexion en cours...';
      this.resultEl.className = 'result loading';
    } else {
      this.resultEl.innerHTML = '';
      this.resultEl.className = 'result';
    }
  }

  /**
   * Efface les messages d'erreur
   */
  private clearError(): void {
    if (!this.resultEl) return;
    this.resultEl.innerHTML = '';
    this.resultEl.className = 'result';
  }
}

// Initialise la page quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
  new LoginPage();
});

// Expose a global helper to start the demo flow in case the button listener doesn't run
// This can be called from the console or used as onclick in the HTML
(window as any).startDemo = async (): Promise<void> => {
  console.debug('window.startDemo called');
  try {
    const passwordInput = document.getElementById('password') as HTMLInputElement | null;
    const resultEl = document.getElementById('result') as HTMLElement | null;
    if (passwordInput) passwordInput.value = 'demo';
    if (resultEl) {
      resultEl.textContent = 'Mode démo activé...';
      resultEl.className = 'result info';
    }

    const user = await ApiService.login('demo');
    console.log('🔥🔥🔥 USER FROM API (global startDemo):', user);
    StorageService.setUser(user as any);

    if (resultEl) {
      resultEl.textContent = 'Connexion démo réussie. Redirection...';
      resultEl.className = 'result success';
    }

    setTimeout(() => { window.location.href = './profile.html?demo=1'; }, 800);
  } catch (err: any) {
    console.error('startDemo error', err);
    const resultEl = document.getElementById('result') as HTMLElement | null;
    if (resultEl) {
      resultEl.textContent = err?.message || 'Erreur demo';
      resultEl.className = 'result error';
    }
  }
};
