import { Component, Input, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Category } from 'src/app/interfaces/Category';
import { ApiService } from 'src/app/services/apiService';

@Component({
  selector: 'app-category-table',
  templateUrl: './category-table.component.html',
  styleUrls: ['./category-table.component.css'],
})
export class CategoryTableComponent {
  @Input() categories: Category[] = [];
  categoryDialog: boolean = false;
  category: Category | null = null;
  submitted: boolean = false;
  selectedImages: string[] = [];
  imageSourceBaseUrl = 'http://localhost:8000/api/assets/';  // Adjust as per your server URL
  editMode: boolean = false;  // To differentiate between add and edit mode

  @ViewChild('dt') dt: Table | undefined;

  constructor(private apiService: ApiService, private messageService: MessageService, private confirmationService: ConfirmationService) {}

  ngOnInit() {
      this.apiService.getAllCategories().subscribe((data) => {
          this.categories = data;
      });
  }

  initCategory() {
    this.category = { category_id: 0, name: null, image_url: null, description: null };
  }

  addCategory() {
      this.initCategory();
      this.selectedImages = [];
      this.submitted = false;
      this.editMode = false;
      this.categoryDialog = true;
  }

  hideDialog() {
      this.categoryDialog = false;
      this.submitted = false;
  }

  saveCategory() {
      this.submitted = true;
  
      if (!this.category || !this.selectedImages.length || this.selectedImages.length > 1 ) {
          return;
      }
  
      if (this.category.name?.trim()) {
          // Ajouter les URLs des images sélectionnées à `this.category.images`
          this.category.image_url = this.selectedImages[0];
  
          if (this.category !== null && this.category.category_id) {
              // Si l'ID de la catégorie existe, on effectue une mise à jour (update)
              this.apiService.updateCategory(this.category.category_id, this.category).subscribe({
                  next: (response) => {
                      const index = this.findIndexById(this.category?.category_id!);
                      if (index !== -1) {
                          this.categories[index] = response;  // Mettre à jour la catégorie existant dans la liste
                      }
  
                      // Message de succès pour l'update
                      this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Category Updated', life: 3000 });
  
                      // Réinitialiser le formulaire et fermer la boîte de dialogue
                      this.categories = [...this.categories];
                      this.categoryDialog = false;
                      this.selectedImages = [];
                      this.category = null;
                  },
                  error: (err) => {
                      // Gestion des erreurs
                      console.error('Erreur lors de la mise à jour de la catégorie:', err);
                      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update category: ' + err.message, life: 3000 });
                  }
              });
          } else {
              // Si l'ID de la catégorie n'existe pas, on effectue une création (create)
              this.apiService.createCategory(this.category).subscribe({
                  next: (response) => {
                      this.categories.push(response);  // Ajouter la catégorie à la liste
  
                      // Message de succès pour la création
                      this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Category Created', life: 3000 });
  
                      // Réinitialiser le formulaire et fermer la boîte de dialogue
                      this.categories = [...this.categories];
                      this.categoryDialog = false;
                      this.category = null;
                  },
                  error: (err) => {
                      // Gestion des erreurs
                      console.error('Erreur lors de la création de la catégorie:', err);
                      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create category: ' + err.message, life: 3000 });
                  }
              });
          }
      }
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

removeImageCategory(index: number): void {
    this.selectedImages.splice(index, 1);  // Retirer l'image de la liste après suppression
}



findIndexById(id: number): number {
  let index = -1;
  for (let i = 0; i < this.categories.length; i++) {
      if (this.categories[i].category_id === id) {
          index = i;
          break;
      }
  }

  return index;
}

editCategory(category: Category) {
  this.category = { ...category };
  this.category.image_url
   ? this.selectedImages[0] = this.category.image_url
   : this.selectedImages = [];
  
  this.categoryDialog = true;
}

deleteCategory(category: Category) {
  this.confirmationService.confirm({
      message: 'Are you sure you want to delete ' + category.name + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
          // Appel à l'API pour supprimer la catégorie
          this.apiService.deleteCategory(category.category_id).subscribe({
              next: () => {
                  // Si la suppression est un succès, on met à jour la liste des catégoriess
                  this.categories = this.categories.filter((val) => val.category_id !== category.category_id);
                  this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Category Deleted', life: 3000 });
              },
              error: (err) => {
                  // Gestion des erreurs lors de la suppression
                  console.error('Erreur lors de la suppression de la catégorie:', err);
                  this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete category: ' + err.message, life: 3000 });
              }
          });
      }
  });
}

applyFilterGlobal($event: any, stringVal: any) {
  this.dt!.filterGlobal(($event.target as HTMLInputElement).value, stringVal);
}

}
