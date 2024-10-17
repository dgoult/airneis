import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { ApiService } from 'src/app/services/apiService';
import { Category } from 'src/app/interfaces/Category';
import { Material } from 'src/app/interfaces/Product';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  carouselProducts: any[] = [];  // Produits pour le carousel
  featuredCategories: any[] = [];  // Catégories en vedette
  highlandersProducts: any[] = [];  // Produits highlanders
  categories: Category[] = [];
  materials: Material[] = [];
  imageSourceBaseUrl = 'http://localhost:8000/api/assets/';

  responsiveOptions = [
      {
          breakpoint: '1400px',
          numVisible: 3,
          numScroll: 3
      },
      {
          breakpoint: '1220px',
          numVisible: 2,
          numScroll: 2
      },
      {
          breakpoint: '1100px',
          numVisible: 1,
          numScroll: 1
      }
  ];

  constructor(private http: HttpClient, private messageService: MessageService, private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadHomePatern();
  }

  // Méthode pour charger la page d'accueil
  loadHomePatern() {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any>('http://localhost:8000/api/homepatern', { headers })
      .subscribe(data => {
        this.carouselProducts = data.carouselProducts;
        this.featuredCategories = data.featuredCategories;
        this.highlandersProducts = data.highlandersProducts;

        // Conversion des chaînes d'images en objets pour chaque produit
        this.carouselProducts.forEach(product => {
          product.images = this.convertToImageObjects(product.images);
        });

        this.highlandersProducts.forEach(product => {
          product.images = this.convertToImageObjects(product.images);
        });
      }, error => {
        console.error('Erreur lors du chargement des homepatern', error);
        this.messageService.add({ severity: 'warn', summary: 'Erreur', detail: 'Impossible de charger les éléments de la page d\'accueil' });
      });
  }

  // Nouvelle méthode pour convertir les chaînes en objets d'image
  convertToImageObjects(imagesString: string): { image_id: number, image_url: string }[] {
    if (!imagesString) return [];
    
    const imageUrls = imagesString.split(',');
    return imageUrls.map((url, index) => ({
        image_id: 0, // Exemple d'ID (vous pouvez l'adapter selon vos besoins)
        image_url: url.trim()
    }));
  }

  getSeverity(stock: number) {
      if (stock === 0) {
          return 'danger';
      }else if (stock <= 15) {
           return 'warning';
       } else if (stock >= 15) {
           return 'success';
       } 
    return 'danger';
  }

  getStockLabel(stock: number): string {
    if (stock === 0) {
      return 'Stock épuisé !'
    } else if (stock <= 15) {
      return 'Bientôt épuisé !';
    } else if (stock >= 15) {
      return 'En stock !';
    }
    
    return stock.toString();
  }

  addToCart(product: any) {
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
        this.messageService.add({ severity: 'success', summary: 'Ajouté au panier', detail: `${product.name} a été ajouté au panier.`, life: 3000 });
      },
      error => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible d\'ajouter l\'article au panier.', life: 3000 });
        console.error('Erreur d\'ajout au panier', error);
      }
    );
  }
}