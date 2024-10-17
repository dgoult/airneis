import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { UserConnected, UserLogin, UserRegister } from '../interfaces/auth';
import { Observable, catchError, map, of } from 'rxjs';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { PopupComponent } from '../popup/popup.component';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = 'http://localhost:8000/api';


  constructor(private http: HttpClient) { }

  registerUser(userDetails: UserRegister) {
    return this.http.post(`${this.baseUrl}/register`, userDetails);
  }

  loginUser(userDetails: UserLogin): Observable<UserConnected> {
    return this.http.post<UserConnected>(`${this.baseUrl}/login`, userDetails);
  }

  // Méthode pour vérifier si le token a expiré ou non
  checkToken(): Observable<boolean> {
    const token = sessionStorage.getItem('token');
    if (!token) {
      return of(false); // Si pas de token, renvoie false directement
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get(`${this.baseUrl}/token/check`, { headers })
      .pipe(
        map(() => {
          // Si l'API retourne un code 200, cela signifie que le token est valide
          return true;
        }),
        catchError((error: HttpErrorResponse) => {
          // Si l'API retourne un code 401 ou 403, le token est invalide ou expiré
          if (error.status === 401 || error.status === 403) {
            console.error('Token expiré ou invalide');
            return of(false);
          }
          // Autres erreurs
          console.error('Erreur lors de la vérification du token:', error);
          return of(false);  // Renvoie `false` en cas d'autres erreurs
        })
      );
  }

  // Méthode pour vérifier la validité du token
  checkTokenValidity() {
    const token = sessionStorage.getItem('token');
    const expiration = sessionStorage.getItem('tokenExpiration');
    const dialog = inject(MatDialog); // Injecter MatDialog
    const router = inject(Router);

    if (token && expiration) {
      const now = new Date().getTime();
      if (now > parseInt(expiration)) {
        
        dialog.open(PopupComponent, {
          width: '300px',
          data: { message: "Tokken expiré" },
        }).afterClosed().subscribe(() => {
          sessionStorage.clear(); // Efface le token et les informations de session
          router.navigate(['/home']);
          return false;
        });
      }
      return true; // Token valide
    }
        
    dialog.open(PopupComponent, {
      width: '300px',
      data: { message: "Token ou sa durée d'expiration manquante", title: "Accès refusé" },
    }).afterClosed().subscribe(() => {
      sessionStorage.clear(); // Efface le token et les informations de session
      return false;
    });

    return false;
  }


}
