// import { inject } from '@angular/core';
// import { CanActivateFn, Router } from '@angular/router';

// export const adminAuthGuard: CanActivateFn = (route, state) => {
//     if (sessionStorage.getItem('isAdmin') === 'true') {
//     return true;
//   } else {
//     const router = inject(Router);
//     return router.navigate(['/login']);
//   }
// };

import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { PopupComponent } from '../popup/popup.component';
import { AuthService } from 'src/app/services/auth.service';

export const adminAuthGuard: CanActivateFn = (route, state) => {
  const dialog = inject(MatDialog); // Injecter MatDialog
  const router = inject(Router);
  const authService = inject(AuthService);

  // if (!authService.checkTokenValidity()) {
  //   dialog.open(PopupComponent, {
  //     width: '300px',
  //     data: { message: "Tokken expiré" },
  //   }).afterClosed().subscribe(() => {
  //     router.navigate(['/home']);
  //   });
  //   return false;
  // }

  if (sessionStorage.getItem('token') && sessionStorage.getItem('isAdmin') === 'true') {
    return true;
  } else {
    // Afficher la popup d'information
    dialog.open(PopupComponent, {
      width: '300px',
      data: { message: "Vous n'avez pas les droits pour accéder à cette page.", title: "Accès refusé" },
    }).afterClosed().subscribe(() => {
      router.navigate(['/home']);
    });

    return false;
  }
};

// import { CanActivateFn } from '@angular/router';
// import { inject } from '@angular/core';
// import { Router } from '@angular/router';
// import { MessageService } from 'primeng/api';
// import { AuthService } from 'src/app/services/auth.service';

// export const adminAuthGuard: CanActivateFn = (route, state) => {
//   const router = inject(Router);
//   const messageService = inject(MessageService);
//   const authService = inject(AuthService); // Injection du service d'authentification pour vérifier le token

//   // Vérifier si le token est valide
//   if (!authService.checkTokenValidity()) {
//     // Afficher une popup si le token est invalide ou manquant
//     messageService.add({
//       severity: 'error',
//       summary: 'Session expirée',
//       detail: 'Votre session a expiré. Veuillez vous reconnecter.',
//       life: 3000
//     });

//     return false;
//   }

//   // Vérifier si l'utilisateur est admin
//   if (sessionStorage.getItem('isAdmin') === 'true') {
//     return true;
//   } else {
//     messageService.add({
//       severity: 'error',
//       summary: 'Accès refusé',
//       detail: 'Vous devez être administrateur pour accéder à cette page.',
//       life: 3000
//     });

//     setTimeout(() => {
//       router.navigate(['/login']);
//     }, 3000);

//     return false;
//   }
// };