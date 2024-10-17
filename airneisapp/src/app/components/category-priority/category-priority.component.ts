import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ApiService } from 'src/app/services/apiService';

@Component({
  selector: 'app-category-priority',
  templateUrl: './category-priority.component.html',
  providers: [MessageService]
})
export class CategoryPriorityComponent implements OnInit {
  categories: any[] = [];
  products: any[] = [];
  selectedCategory: any;
  selectedPriorityProducts: any[] = [];
  imageSourceBaseUrl = 'http://localhost:8000/api/assets/';

  constructor(
    private apiService: ApiService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories() {
    this.apiService.getAllCategories().subscribe((data: any) => {
      this.categories = data;
    });
  }

  onCategoryChange() {
    if (this.selectedCategory) {
      this.apiService.getCategoryDetails(this.selectedCategory.category_id).subscribe((data: any) => {

        data.products.forEach((product: any) => {
          product.images = this.convertToImageObjects(product.images);
        });

        this.products = data.products;
        this.selectedPriorityProducts = this.products;
      });
    }
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

  savePriorityProducts() {
    const productIds = this.selectedPriorityProducts.map(p => p.product_id);
    this.apiService.setPriorityProducts(this.selectedCategory.category_id, productIds).subscribe(
      () => {
        this.messageService.add({severity: 'success', summary: 'Success', detail: 'Priorités enregistrées avec succès'});
      },
      (error) => {
        this.messageService.add({severity: 'error', summary: 'Erreur', detail: 'Échec de la sauvegarde des priorités'});
      }
    );
  }

  categoriesLabel(categoryId: number): string {
    const category = this.categories.find(c => c.category_id === categoryId);
    return category ? category.name : '';
  }
}