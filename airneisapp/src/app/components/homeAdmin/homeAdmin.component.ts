import { Router } from '@angular/router';
import { Component, HostListener, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Product } from 'src/app/interfaces/Product';
import { Category } from 'src/app/interfaces/Category';
import { Material } from 'src/app/interfaces/Material';
import { User } from 'src/app/interfaces/auth';
import { MessageService } from 'primeng/api';
import { ApiService } from 'src/app/services/apiService';

@Component({
  selector: 'app-home-admin',
  templateUrl: './homeAdmin.component.html',
  styleUrls: ['./homeAdmin.component.css']
})
export class HomeAdminComponent implements OnInit {
  
  products: Product[] = [];
  categories: Category[] = [];
  materials: Material[] = [];
  users: User[] = [];
  homePatern: any;
  orders: any[] = [];

  selectedCarouselProducts: Product[] = [];  // Produits pour le carrousel
  selectedCategories: Category[] = [];  // Catégories sélectionnées
  selectedHighlanders: Product[] = [];  // Produits pour la section Highlanders

  carouselProducts: any[] = [];  // Produits du carrousel
  featuredCategories: any[] = [];  // Catégories en vedette
  highlandersProducts: any[] = [];  // Produits highlanders

  imageSourceBaseUrl: string = 'http://localhost:8000/api/assets/'
  
  constructor(private http: HttpClient, private router: Router, private messageService: MessageService, private apiService: ApiService) {}

  //Refresh les data au clique de l'onglet
  @HostListener('document:click', ['$event'])
  onTabClick(event: Event) {
    const targetElement = event.target as HTMLElement;
    if (targetElement.closest('.p-tabview .p-tabview-nav li .p-tabview-nav-link')) {
      this.ngOnInit();
    }
  }

  logOut() {
    sessionStorage.clear();
    this.router.navigate(['login']);
  }

  addMaterial() {
    console.log('addMaterial');
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
    this.loadMaterials();
    this.loadUsers();
    this.loadHomePatern();
    this.loadOrders();
  }

  loadOrders() {
    this.apiService.getAllOrders().subscribe(
      (response) => {
        this.orders = response;
      },
      (error) => {
        console.error('Erreur lors du chargement des commandes', error);
      }
    );
  }

  // Charger tous les utilisateurs depuis l'API
  loadUsers() {
    this.apiService.getAllUsers().subscribe(
      (data: User[]) => {
        this.users = data;
      },
      (error) => {
        console.error('Erreur lors du chargement des utilisateurs', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: `Échec du chargement des utilisateurs : ${error.message}`
        });
      }
    );
  }

  loadProducts() {
    const token = sessionStorage.getItem('token'); // Récupère le token depuis localStorage ou une autre source
    const ad = sessionStorage.getItem('isAdmin'); // Récupère le token depuis localStorage ou une autre source
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<Product[]>('http://localhost:8000/api/admin/products', { headers })
      .subscribe(data => {
        this.products = data;
      }, error => {
        console.error('Erreur lors du chargement des produits', error);
      });
  }

  loadCategories() {
    const token = sessionStorage.getItem('token'); 
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    this.http.get<Category[]>('http://localhost:8000/api/admin/categories', { headers })
      .subscribe(data => {
        this.categories = data;
      }, error => {
        console.error('Erreur lors du chargement des catégories', error);
      });
  }

  loadMaterials() {
    const token = sessionStorage.getItem('token'); 
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    this.http.get<Material[]>('http://localhost:8000/api/admin/materials', { headers })
      .subscribe(data => {
        this.materials = data;
      }, error => {
        console.error('Erreur lors du chargement des matériaux', error);
      });
  }

  loadHomePatern() {
    const token = sessionStorage.getItem('token'); // Récupère le token depuis localStorage ou une autre source
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
    this.http.get<{carouselProducts: any[], highlandersProducts: any[], featuredCategories: Category[]}>('http://localhost:8000/api/homepatern', { headers })
      .subscribe(data => {
        console.log('loadHomePatern-data', data);
        
        

      // Conversion des chaînes d'images en tableaux pour chaque produit
      data.carouselProducts.forEach(product => {
        product.images = product.images ? product.images.split(',') : [];
      });

      data.highlandersProducts.forEach(product => {
        product.images = product.images ? product.images.split(',') : [];
      });

      // Trouver les objets dans `products` qui correspondent aux `selectedCarouselProducts` par `product_id`
      this.selectedCarouselProducts = data.carouselProducts.map(carouselProduct => {
        const match = this.products.find(p => p.product_id === carouselProduct.product_id);
        return match ? match : carouselProduct;
      });

      // Charger les catégories et Highlanders produits
      this.selectedCategories = data.featuredCategories;
      this.selectedHighlanders = data.highlandersProducts.map(highlanderProduct => {
        const match = this.products.find(p => p.product_id === highlanderProduct.product_id);
        return match ? match : highlanderProduct;
      });

      // Mettre à jour les listes pour l'affichage
      this.carouselProducts = data.carouselProducts;
      this.featuredCategories = data.featuredCategories;
      this.highlandersProducts = data.highlandersProducts;
  
        // // Conversion des chaînes d'images en tableaux pour chaque produit
        // this.carouselProducts.forEach(product => {
        //   product.images = product.images ? product.images.split(',') : [];
        // });
  
        // this.highlandersProducts.forEach(product => {
        //   product.images = product.images ? product.images.split(',') : [];
        // });
  
        // // Initialisation des valeurs sélectionnées pour le formulaire
        // this.selectedCarouselProducts = [...this.carouselProducts];
        // this.selectedCategories = [...this.featuredCategories];
        // this.selectedHighlanders = [...this.highlandersProducts];

        console.log("loadHomePatern", this.selectedCarouselProducts, this.selectedCategories, this.selectedHighlanders )
      }, error => {
        console.error('Erreur lors du chargement des homepatern', error);
        this.messageService.add({ severity: 'warn', summary: 'Erreur', detail: 'Impossible de charger les éléments de la page d\'accueil' });
      });
  }
  
  saveHomePatern() {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
    const homePatern = {
      carouselProducts: this.selectedCarouselProducts.map(p => p.product_id),
      featuredCategories: this.selectedCategories.map(c => c.category_id),
      highlandersProducts: this.selectedHighlanders.map(p => p.product_id)  // Ajout des Highlanders
    };

    console.log("homeAdmin-saveHomePatern", homePatern);
  
    this.http.post('http://localhost:8000/api/admin/homepatern', homePatern, { headers })
      .subscribe(response => {
        console.log('Paramètres de la page d\'accueil sauvegardés avec succès', response);
        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Products Deleted', life: 3000 });
      }, error => {
        console.error('Erreur lors de la sauvegarde des paramètres de la page d\'accueil', error);
        this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'No products selected', life: 3000 });
      });
  }

  materialLabel(id: number): string {
    return this.materials.find(v => v.material_id = id)?.name ?? id.toString();
  }

  categoriesLabel(id: number | null): string {
    return this.categories.find(v => v.category_id === id)?.name ?? id?.toString() ?? 'Non défini';
  }
}
