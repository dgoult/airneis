import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/apiService';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Material, Product } from '../interfaces/Product';
import { Category } from '../interfaces/Category';

@Component({
  selector: 'app-search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.css']
})
export class SearchPageComponent implements OnInit {

  imageSourceBaseUrl = 'http://localhost:8000/api/assets/';  // Adjust as per your server URL

  products: Product[] = [];
  cartVisible: boolean = false;
  searchText: string = '';
  selectedMaterials: number[] = [];
  priceMin: number = 0;
  priceMax: number = 0;
  selectedCategories: number[] = [];
  inStockOnly: boolean = false;
  sortOption: string = 'price_asc';
  priceRange: number[] = [0, 1000];
  categories: Category[] = [];
  materials: Material[] = [];

  sortOptions = [
    { label: 'Prix croissant', value: 'price_asc' },
    { label: 'Prix décroissant', value: 'price_desc' },
    { label: 'Nouveautés', value: 'newest' },
    { label: 'En stock (croissant)', value: 'stock_asc' },
    { label: 'En stock (décroissant)', value: 'stock_desc' },
];

  constructor(private apiService: ApiService, private messageService: MessageService, private confirmationService: ConfirmationService) {}

  ngOnInit() {
    this.apiService.getAllProducts().subscribe((response)=>{this.products = response});
    setTimeout(() => {
      this.loadCategories();
      this.loadMaterials();
    }, 500);

    // this.apiService.getAllCategories().subscribe((data: Category[]) => {
    //   this.categories = data;  // Stocker les catégories récupérées
    // }, (error) => {
    //   console.error('Erreur lors du chargement des catégories', error);
    // });
    
    // this.apiService.getAllMaterials().subscribe((data: Material[]) => { this.materials = data });
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
}
