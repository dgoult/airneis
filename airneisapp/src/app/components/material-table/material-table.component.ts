import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Material } from 'src/app/interfaces/Material';
import { ApiService } from 'src/app/services/apiService';

@Component({
  selector: 'material-table',
  templateUrl: './material-table.component.html',
  styleUrls: ['./material-table.component.css'],
})
export class MaterialTableComponent implements OnInit {
  @Input() materials: Material[] = [];
  materialDialog: boolean = false;
  material: Material | null = null;
  selectedMaterials: Material[] = [];
  submitted: boolean = false;

  @ViewChild('dt') dt: Table | undefined;

  constructor(
    private apiService: ApiService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadMaterials();
  }

  // Charger tous les matériaux depuis l'API
  loadMaterials() {
    this.apiService.getAllMaterials().subscribe(
      (data: Material[]) => {
        this.materials = data;
      },
      (error) => {
        console.error('Erreur lors du chargement des matériaux', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: `Échec du chargement des matériaux : ${error.message}`
        });
      }
    );
  }

  // Ouvrir le dialogue pour créer un nouveau matériau
  openNew() {
    this.material = { material_id: 0, name: '' }; // Initialisation avec un matériau vide
    this.submitted = false;
    this.materialDialog = true;
  }

  // Cacher le dialogue
  hideDialog() {
    this.materialDialog = false;
    this.submitted = false;
  }

  // Sauvegarder le matériau (création ou mise à jour)
  saveMaterial() {
    this.submitted = true;

    if (!this.material?.name?.trim()) {
      return;
    }

    if (this.material.material_id) {
      // Mise à jour du matériau
      this.apiService.updateMaterial(this.material.material_id, this.material).subscribe(
        () => {
          this.loadMaterials(); // Rafraîchir la liste
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Matériau mis à jour',
            life: 3000
          });
          this.materialDialog = false;
        },
        (error) => {
          console.error('Erreur lors de la mise à jour du matériau', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: `Échec de la mise à jour du matériau : ${error.message}`
          });
        }
      );
    } else {
      // Création d'un nouveau matériau
      this.apiService.createMaterial(this.material).subscribe(
        () => {
          this.loadMaterials(); // Rafraîchir la liste
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Matériau créé',
            life: 3000
          });
          this.materialDialog = false;
        },
        (error) => {
          console.error('Erreur lors de la création du matériau', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: `Échec de la création du matériau : ${error.message}`
          });
        }
      );
    }
  }

  // Éditer un matériau existant
  editMaterial(material: Material) {
    this.material = { ...material }; // Cloner l'objet matériau
    this.materialDialog = true;
  }

  // Supprimer les matériaux sélectionnés
  deleteSelectedMaterials() {
    this.confirmationService.confirm({
      message: 'Êtes-vous sûr de vouloir supprimer les matériaux sélectionnés ?',
      header: 'Confirmer',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const deleteRequests = this.selectedMaterials.map((material) =>
          this.apiService.deleteMaterial(material.material_id).toPromise()
        );

        Promise.all(deleteRequests)
          .then(() => {
            this.loadMaterials();
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Matériaux supprimés',
              life: 3000
            });
          })
          .catch((error) => {
            console.error('Erreur lors de la suppression des matériaux', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: `Échec de la suppression des matériaux : ${error.message}`
            });
          });
      }
    });
  }

  // Supprimer un seul matériau
  deleteMaterial(material: Material) {
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer ${material.name} ?`,
      header: 'Confirmer',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.apiService.deleteMaterial(material.material_id).subscribe(
          () => {
            this.loadMaterials(); // Rafraîchir la liste
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Matériau supprimé',
              life: 3000
            });
          },
          (error) => {
            console.error('Erreur lors de la suppression du matériau', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: `Échec de la suppression du matériau : ${error.message}`
            });
          }
        );
      }
    });
  }

  // Appliquer un filtre global au tableau des matériaux
  applyFilterGlobal($event: any, stringVal: any) {
    this.dt!.filterGlobal(($event.target as HTMLInputElement).value, stringVal);
  }
}
