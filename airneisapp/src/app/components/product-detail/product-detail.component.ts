import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Product } from 'src/app/interfaces/Product';
import { ApiService } from 'src/app/services/apiService';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  similarProducts: any[] = [];
  productId: number = 0;
  product: Product | null = null;
  imageSourceBaseUrl = 'http://localhost:8000/api/assets/';

  constructor(private route: ActivatedRoute, private apiService: ApiService, private messageService: MessageService) {}

  // ngOnInit(): void {
  //   // Récupérer l'ID de la catégorie depuis l'URL
  //   this.productId = +this.route.snapshot.paramMap.get('id')!;
  //   this.loadProductDetails();
  // }

  ngOnInit(): void {
    // Écouter les changements de paramètres pour recharger les détails du produit
    this.route.params.subscribe(params => {
      const productId = params['id'];
      this.loadProductDetails(productId);
      this.loadSimilarProducts(productId);
    });
  }

  // Charger les détails de la catégorie
  loadProductDetails(productId: number) {
    this.apiService.getProductById(productId).subscribe((data: any) => {
      this.product = data;
    });
  }

  loadSimilarProducts(productId: number) {
    this.apiService.getSimilarProducts(productId).subscribe((data: any) => {
      this.similarProducts = data;
    });
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
