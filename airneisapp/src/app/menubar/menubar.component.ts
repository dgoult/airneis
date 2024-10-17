import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../services/apiService';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-navbar',
  templateUrl: './menubar.component.html',
  styleUrls: ['./menubar.component.css']
})

export class NavbarComponent { 
  menuVisible = false;
  cartVisible = false;
  cartItems: any[] = [];

  constructor(private router: Router, private apiService: ApiService, private messageService: MessageService) {}

  ngOnInit() {
    this.loadCart();
  }

  loadCart() {
    const sessionId = sessionStorage.getItem('session_id');
    const userId = sessionStorage.getItem('user_id') ? parseInt(sessionStorage.getItem('user_id')!) : undefined;

    this.apiService.getCart(sessionId, userId).subscribe(
      response => {
        this.cartItems = response.items || [];
      },
      error => {
        console.error('Erreur lors du chargement du panier', error);
      }
    );
  }

  openCart() {
    this.cartVisible = true;
    this.loadCart(); // Recharger le panier à chaque ouverture
  }

  increaseQuantity(product: any) {
    const sessionId = sessionStorage.getItem('session_id');
    const userId = sessionStorage.getItem('user_id') ? parseInt(sessionStorage.getItem('user_id')!) : undefined;

    const cartItem = {
      session_id: sessionId,
      user_id: userId,
      product_id: product.product_id,
      quantity: 1
    };

    this.apiService.addToCart(cartItem).subscribe(
      response => {
        this.loadCart();
        this.messageService.add({ severity: 'success', summary: 'Ajouté au panier', detail: `${product.name} a été ajouté au panier.`, life: 3000 });
      },
      error => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible d\'ajouter l\'article au panier.', life: 3000 });
        console.error('Erreur d\'ajout au panier', error);
      }
    );
  }

  decreaseQuantity(cartItemId: number) {
    this.apiService.removeFromCart(cartItemId).subscribe(
      response => {
        this.loadCart(); // Recharger le panier après suppression
      },
      error => {
        console.error('Erreur lors de la suppression de l\'article du panier', error);
      }
    );
  }

  logOut() {
    sessionStorage.clear();
    this.router.navigate(['login']);
  }

  isConnected(): boolean {
    return sessionStorage.getItem('token') !== null;
  }

  isAdmin(): boolean {
    return sessionStorage.getItem('isAdmin') !== "true";
  }

  openSearchPage() {
    // Logique pour ouvrir la page de recherche
    this.router.navigate(['/search']);
  }

  // Méthode pour calculer le total du panier
  getCartTotal(): number {
      return this.cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  toggleMenu() {
    this.menuVisible = !this.menuVisible;
  }

  goToLogIn() {
    this.router.navigate(['/login']);
  }

  goToSettings() {
    this.router.navigate(['/settings']);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  goToCheckout() {
    this.router.navigate(['/checkout']);
  }

  goToAdmin() {
    this.router.navigate(['/home-admin']);
  }
}