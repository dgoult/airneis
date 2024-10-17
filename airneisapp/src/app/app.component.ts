import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css', '../../node_modules/primeflex/primeflex.css']
})
export class AppComponent implements OnInit {
  title = 'AIRNEIS';
  constructor(private authService: AuthService, private router: Router, private messageService: MessageService) {}

  ngOnInit() {
    // Générer un session_id s'il n'existe pas
    this.initializeSessionId();
    
    // Vérifier la validité du token à chaque refresh
    setTimeout(() => {
      if(sessionStorage.getItem('token')){
          this.authService.checkToken().subscribe((isValid: boolean) => {
            if (!isValid) {
              // Si le token est expiré, rediriger ou afficher un message
              console.log('Le token est expiré ou invalide');
              this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: `Le token est expiré ou invalide`
              });
              sessionStorage.clear(); // Efface le token et les informations de session
              this.router.navigate(['/login'])
            } else {
              console.log('Le token est valide');
            }
          });
      }
    }, 500); // Délai pour s'assurer que le p-toast est bien initialisé
  }

  // Méthode pour initialiser un session_id
  initializeSessionId(): void {
    if (!sessionStorage.getItem('session_id')) {
      const sessionId = this.generateSessionId();
      sessionStorage.setItem('session_id', sessionId);
      console.log('Session ID généré:', sessionId);
    }
  }

  // Méthode pour générer un session_id aléatoire
  generateSessionId(): string {
    return 'xxxxxx'.replace(/[x]/g, () =>
      ((Math.random() * 36) | 0).toString(36)
    );
  }
}