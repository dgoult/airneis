import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Product } from 'src/app/interfaces/Product';
import { ApiService } from 'src/app/services/apiService';

@Component({
  selector: 'app-category-detail',
  templateUrl: './category-detail.component.html',
  styleUrls: ['./category-detail.component.css']
})
export class CategoryDetailComponent implements OnInit {
  categoryId: number = 0;
  categoryName: string | null = '';
  categoryDescription: string | null = '';
  categoryImageUrl: string | null = '';
  products: Product[] = [];
  imageSourceBaseUrl = 'http://localhost:8000/api/assets/';

  constructor(private route: ActivatedRoute, private apiService: ApiService) {}

  ngOnInit(): void {
    // Récupérer l'ID de la catégorie depuis l'URL
    this.categoryId = +this.route.snapshot.paramMap.get('id')!;
    this.loadCategoryDetails();

    // this.products.forEach((product: any) => {
    //   product.images = this.convertToImageObjects(product.images);
    // });
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

  // Charger les détails de la catégorie
  loadCategoryDetails(): void {
    this.apiService.getCategoryDetails(this.categoryId).subscribe(category => {
      this.categoryName = category.name;
      this.categoryDescription = category.description;
      this.categoryImageUrl = category.image_url;

      category.products.forEach((product: any) => {
        product.images = this.convertToImageObjects(product.images);
      });
      this.products = category.products;
    });
  }
}
