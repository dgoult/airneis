import { HttpHeaders } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Category } from 'src/app/interfaces/Category';
import { Material, Product } from 'src/app/interfaces/Product';
import { ApiService } from 'src/app/services/apiService';

@Component({
  selector: 'app-product-home-list',
  templateUrl: './product-home-list.component.html',
  styleUrls: ['./product-home-list.component.css']
})
export class ProductHomeListComponent implements OnInit {
  @Input() products: Product[] = [];
  @Input() categories: Category[] = [];
  @Input() materials: Material[] = [];
  @Input() imageSourceBaseUrl: string = '';
  @Input() onSearchPage: boolean = true;
  @Input() onCategoryPage: boolean = true;
  @Input() readOnly: boolean = false;
  searchText: string = '';
  selectedMaterials: number[] = [];
  priceMin: number = 0;
  priceMax: number = 0;
  selectedCategories: number[] = [];
  inStockOnly: boolean = false;
  sortOption: string = 'price_asc';
  priceRange: number[] = [0, 1000];
  cartVisible: boolean = false;

  sortOptions = [
    { label: 'Prix croissant', value: 'price_asc' },
    { label: 'Prix décroissant', value: 'price_desc' },
    { label: 'Nouveautés', value: 'newest' },
    { label: 'En stock (croissant)', value: 'stock_asc' },
    { label: 'En stock (décroissant)', value: 'stock_desc' },
];

  searchProduct: any;

  constructor(private apiService: ApiService, private messageService: MessageService, private router: Router) {}

  ngOnInit() {
    setTimeout(() => {
      this.loadCategories();
      this.loadMaterials();
    }, 500);
  }

  goToProduct(id:number) {
    this.router.navigate(['/product', id]);
  }

  loadCategories() {
    this.apiService.getAllCategories().subscribe((data: Category[]) => { this.categories = data });
  }

  loadMaterials() {
    this.apiService.getAllMaterials().subscribe((data: Material[]) => { this.materials = data });
  }

  // Fonctions de tri
  sortProducts() {
      switch (this.sortOption) {
          case 'price_asc':
              this.products.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
              break;
          case 'price_desc':
              this.products.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
              break;
          case 'newest':
              this.products.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
              break;
          case 'stock_asc':
              this.products.sort((a, b) => a.stock - b.stock);
              break;
          case 'stock_desc':
              this.products.sort((a, b) => b.stock - a.stock);
              break;
      }
  }

  toggleMenu() {
    this.cartVisible = true;
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

  // Méthode pour réinitialiser les filtres
  resetFilters() {
    this.searchText = '';
    this.selectedMaterials = [];
    this.selectedCategories = [];
    this.priceRange = [0, 1000];
    this.inStockOnly = false;
    this.sortOption = 'price_asc';
    this.sortProducts(); // Réappliquer le tri après réinitialisation
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
