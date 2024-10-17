import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CommonModule } from '@angular/common';
import { FileUploadModule } from 'primeng/fileupload';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { RadioButtonModule } from 'primeng/radiobutton';
import { RatingModule } from 'primeng/rating';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { Material, Product } from 'src/app/interfaces/Product';
import { ApiService } from 'src/app/services/apiService';
import { Category } from 'src/app/interfaces/Category';

@Component({
    selector: 'product-table',
    templateUrl: './product-table.component.html',
    styleUrls: ['./product-table.component.css'],
    styles: [
        `:host ::ng-deep .p-dialog .product-image {
            width: 150px;
            margin: 0 auto 2rem auto;
            display: block;
        }`
    ]
})
export class ProductTableComponent implements OnInit{
    productDialog: boolean = false;

    @Input() products: Product[] = [];

    product: Product | null = null;

    selectedProducts: Product[] = [];

    submitted: boolean = false;

    statuses!: any[];
  
    selectedImages: string[] = []; // Pour stocker les URLs des images sélectionnées

    @Input() categories: Category[] = [];  // Stocker les catégories ici

    @ViewChild('dt') dt: Table | undefined;

    imageSourceBaseUrl: string = 'http://localhost:8000/api/assets/'

    @Input() materials: Material[] = [];  // Stocker les matériaux récupérés

    selectedMaterials: number[] = [];  // Matériaux sélectionnés pour un produit

    constructor(private apiService: ApiService, private messageService: MessageService, private confirmationService: ConfirmationService) {}

    ngOnInit() {
        this.apiService.getAllProducts().subscribe((response)=>{this.products = response});

        this.apiService.getAllCategories().subscribe((data: Category[]) => {
          this.categories = data;  // Stocker les catégories récupérées
        }, (error) => {
          console.error('Erreur lors du chargement des catégories', error);
        });
        
        this.apiService.getAllMaterials().subscribe((data: Material[]) => { this.materials = data });
    }

    // Méthode pour initialiser un produit vide
    initProduct(): Product {
      return {
        product_id: 0,
        name: '',
        description: '',
        category_id: 0,
        price: '',
        stock: 0,
        materials: [],
        images: [],
        created_at: ''
      };
    }

    openNew() {
        this.ngOnInit();
        this.product = this.initProduct();
        this.selectedImages = [];
        this.selectedProducts = [];
        this.submitted = false;
        this.productDialog = true;
    }

    deleteSelectedProducts() {
      this.confirmationService.confirm({
          message: 'Are you sure you want to delete the selected products?',
          header: 'Confirm',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
              if (this.selectedProducts && this.selectedProducts.length > 0) {
                  // Créer un tableau de requêtes de suppression pour chaque produit sélectionné
                  const deleteRequests = this.selectedProducts.map(product =>
                      this.apiService.deleteProduct(product.product_id).toPromise()
                  );
  
                  // Utiliser Promise.all pour attendre que toutes les requêtes soient terminées
                  Promise.all(deleteRequests)
                      .then(() => {
                          // Suppression réussie, mettre à jour la liste des produits
                          this.products = this.products.filter((val) => !this.selectedProducts.includes(val));
                          this.selectedProducts = [];
                          this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Products Deleted', life: 3000 });
                      })
                      .catch((error) => {
                          // Gérer les erreurs en cas d'échec
                          console.error('Erreur lors de la suppression des produits', error);
                          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete products', life: 3000 });
                      });
              } else {
                  // Aucun produit sélectionné
                  this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'No products selected', life: 3000 });
              }
          }
      });
    }

    editProduct(product: Product) {
        this.product = { ...product };
        
        this.selectedMaterials = this.product.materials
        .filter(material => material && material.material_id)  // Filtrer les matériaux valides
        .map(material => material.material_id);

        this.selectedImages = this.product.images.map((img) => {
            return img.image_url;
        });
        this.productDialog = true;
    }

    deleteProduct(product: Product) {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete ' + product.name + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                // Appel à l'API pour supprimer le produit
                this.apiService.deleteProduct(product.product_id).subscribe({
                    next: () => {
                        // Si la suppression est un succès, on met à jour la liste des produits
                        this.products = this.products.filter((val) => val.product_id !== product.product_id);
                        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Product Deleted', life: 3000 });
                    },
                    error: (err) => {
                        // Gestion des erreurs lors de la suppression
                        console.error('Erreur lors de la suppression du produit:', err);
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete product: ' + err.message, life: 3000 });
                    }
                });
            }
        });
    }

    hideDialog() {
        this.productDialog = false;
        this.submitted = false;
    }

    onImageSelect(event: any): void {
        if (event.target.files && event.target.files.length) {
            const files = event.target.files;
    
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
    
                // Vérifier que le fichier est bien un PNG
                if (file.type === 'image/png') {
                    // Vérifier si le nom de fichier contient des espaces
                    if (file.name.includes(' ')) {
                        // Afficher un message d'erreur si le nom de fichier contient un espace
                        console.error('Le nom du fichier ne doit pas contenir d\'espace');
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erreur',
                            detail: 'Le nom du fichier ne doit pas contenir d\'espace',
                        });
                    } else {
                        const reader = new FileReader();
    
                        reader.onload = (e: any) => {
                            // Créer un objet FormData pour envoyer l'image
                            const formData = new FormData();
                            formData.append('image', file);
    
                            // Appeler une méthode pour envoyer l'image via l'API
                            this.uploadImage(formData);
                        };
    
                        reader.readAsDataURL(file);  // Lire les fichiers comme URLs
                    }
                } else {
                    // Afficher un message d'erreur si le fichier n'est pas un PNG
                    console.error('Seuls les fichiers PNG sont acceptés');
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: 'Seuls les fichiers PNG sont acceptés',
                    });
                }
            }
        }
    }

    // Méthode pour envoyer l'image au serveur via l'API
    uploadImage(formData: FormData): void {
      this.apiService.uploadImage(formData).subscribe({
        next: (response) => {

            // Stocker l'URL de l'image dans le tableau selectedImages
            this.selectedImages.push(response);

            // Afficher un message de succès
            this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Image téléchargée avec succès',
            });
        },
        error: (err) => {
          // Gérer les erreurs
          console.error('Erreur lors du téléchargement de l\'image:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Échec du téléchargement de l\'image',
          });
        }
      });
    }
    
    removeImage(index: number): void {
        const imageUrl = this.selectedImages[index];
        const filename = imageUrl.split('/').pop();  // Récupérer seulement le nom du fichier
    
        if (filename) {
            const encodedFilename = encodeURIComponent(filename);  // Encoder le nom du fichier pour gérer les espaces et les caractères spéciaux
    
            // Envoyer la requête DELETE pour supprimer l'image
            this.apiService.deleteImage(encodedFilename).subscribe({
                next: (response) => {
                    this.selectedImages.splice(index, 1);  // Retirer l'image de la liste après suppression

                    // Afficher un message de succès
                    this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Image supprimée avec succès',
                    });
                },
                error: (error) => {
                    console.error('Erreur lors de la suppression de l\'image:', error);
                    // Gérer les erreurs
                    console.error('Erreur lors du téléchargement de l\'image:', error);
                    this.messageService.add({
                      severity: 'error',
                      summary: 'Erreur',
                      detail: 'Échec du téléchargement de l\'image',
                    });
                }
            });
        }
    }
    
    removeImageProduct(index: number): void {
        this.selectedImages.splice(index, 1);  // Retirer l'image de la liste après suppression
    }

    saveProduct() {
        this.submitted = true;
    
        if (!this.product || !this.selectedImages.length || !this.selectedMaterials.length) {
            return;
        }
    
        if (this.product.name?.trim()) {
            // Ajouter les URLs des images sélectionnées à `this.product.images`
            this.product.images = this.selectedImages.map((url, index) => {
                return { image_id: index + 1, image_url: url };  // Assigner les URLs d'images
            });
            
            this.product.materials = this.selectedMaterials.map(materialId => {
                const material = this.materials.find(m => m.material_id === materialId);
                return { material_id: material?.material_id!, name: material?.name! };
            });
    
            if (this.product !== null && this.product.product_id) {
                // Si l'ID du produit existe, on effectue une mise à jour (update)
                this.apiService.updateProduct(this.product.product_id, this.product).subscribe({
                    next: (response) => {
                        const index = this.findIndexById(this.product?.product_id!);
                        if (index !== -1) {
                            this.products[index] = response;  // Mettre à jour le produit existant dans la liste
                        }
    
                        // Message de succès pour l'update
                        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Product Updated', life: 3000 });
    
                        // Réinitialiser le formulaire et fermer la boîte de dialogue
                        this.products = [...this.products];
                        this.productDialog = false;
                        this.selectedImages = [];
                        this.selectedMaterials = [];
                        this.product = null;
                    },
                    error: (err) => {
                        // Gestion des erreurs
                        console.error('Erreur lors de la mise à jour du produit:', err);
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update product: ' + err.message, life: 3000 });
                    }
                });
            } else {
                // Si l'ID du produit n'existe pas, on effectue une création (create)
                this.apiService.createProduct(this.product).subscribe({
                    next: (response) => {
                        this.products.push(response);  // Ajouter le produit à la liste
    
                        // Message de succès pour la création
                        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Product Created', life: 3000 });
    
                        // Réinitialiser le formulaire et fermer la boîte de dialogue
                        this.products = [...this.products];
                        this.productDialog = false;
                        this.selectedImages = [];
                        this.selectedMaterials = [];
                        this.product = null;
                    },
                    error: (err) => {
                        // Gestion des erreurs
                        console.error('Erreur lors de la création du produit:', err);
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create product: ' + err.message, life: 3000 });
                    }
                });
            }
        }
    }

    // saveProduct() {
    //     this.submitted = true;
    
    //     if (!this.product) {
    //         return;
    //     }
    
    //     if (this.product.name?.trim()) {
    //         // Ajouter les URLs des images sélectionnées à `this.product.images`
    //         this.product.images = this.selectedImages.map((url, index) => {
    //             return { image_id: index + 1, image_url: url };  // Assigner les URLs d'images
    //         });
    
    //         // Appeler l'API pour créer ou mettre à jour le produit
    //         this.apiService.createProduct(this.product).subscribe((response) => {
    //             // Assigner la réponse de l'API à `this.product`
    //             this.product = response;
    
    //             // Si le produit a déjà un ID, cela signifie que c'est une mise à jour
    //             if (this.product.product_id) {
    //                 const index = this.findIndexById(this.product.product_id);
    //                 if (index !== -1) {
    //                     this.products[index] = this.product;  // Mettre à jour le produit existant
    //                 }
    //             } else {
    //                 this.products.push(this.product);  // Ajouter le produit à la liste
    //             }
    
    //             // Ajouter un message de succès
    //             this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Product Saved', life: 3000 });
    
    //             // Réinitialiser le formulaire et fermer la boîte de dialogue
    //             this.products = [...this.products];
    //             this.productDialog = false;
    //             this.product = null;
    //         }, (error) => {
    //             // Gestion des erreurs
    //             this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save product', life: 3000 });
    //         });
    //     }
    // }

    findIndexById(id: number): number {
        let index = -1;
        for (let i = 0; i < this.products.length; i++) {
            if (this.products[i].product_id === id) {
                index = i;
                break;
            }
        }

        return index;
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

    categoriesLabel(id: number | null): string {
      return this.categories.find(v => v.category_id === id)?.name ?? id?.toString() ?? 'Non défini';
    }

    materialLabel(materials: Material[]): string {
        // Si le produit a plusieurs matériaux, on va récupérer et concaténer leurs noms
        return materials.map(m => this.materials.find(v => v.material_id === m.material_id)?.name ?? m.material_id.toString()).join(', ');
    }

    applyFilterGlobal($event: any, stringVal: any) {
      this.dt!.filterGlobal(($event.target as HTMLInputElement).value, stringVal);
    }
}