import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { UserRoleEnum } from 'src/app/interfaces/UserRoleEnum';
import { User } from 'src/app/interfaces/auth';
import { ApiService } from 'src/app/services/apiService';

@Component({
  selector: 'user-table',
  templateUrl: './user-table.component.html',
  styleUrls: ['./user-table.component.css'],
})
export class UserTableComponent implements OnInit {
  @Input() users: User[] = [];
  userDialog: boolean = false;
  user: User | null = null;
  selectedUsers: User[] = [];
  submitted: boolean = false;

  @ViewChild('dt') dt: Table | undefined;
  
  // Définir les options de rôle en fonction de l'énumération UserRole
  roleOptions: any[] = [
    { label: 'Utilisateur', value: UserRoleEnum.USER },
    { label: 'Admin', value: UserRoleEnum.ADMIN }
  ];

  constructor(
    private apiService: ApiService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  verifiedEmailLabel(isVerified: boolean): string {
    return isVerified
      ? 'Oui'
      : 'Non'
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

  // Ouvrir le dialogue pour créer un nouvel utilisateur
  openNew() {
    this.user = { user_id: 0, full_name: '', email: '', phone_number: '', role: '', email_verified: false, verification_token: '', created_at: '' }; // Initialisation avec un utilisateur vide
    this.submitted = false;
    this.userDialog = true;
  }

  // Cacher le dialogue
  hideDialog() {
    this.userDialog = false;
    this.submitted = false;
  }

  // Sauvegarder l'utilisateur (création ou mise à jour)
  saveUser() {
    this.submitted = true;

    if (!this.user?.full_name?.trim()) {
      return;
    }

    if (this.user.user_id) {
      // Mise à jour de l'utilisateur
      this.apiService.updateUser(this.user.user_id, this.user).subscribe(
        () => {
          this.loadUsers(); // Rafraîchir la liste
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Utilisateur mis à jour',
            life: 3000
          });
          this.userDialog = false;
        },
        (error) => {
          console.error('Erreur lors de la mise à jour de l\'utilisateur', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: `Échec de la mise à jour de l'utilisateur : ${error.message}`
          });
        }
      );
    } else {
      // Création d'un nouvel utilisateur
      this.apiService.createUser(this.user).subscribe(
        () => {
          this.loadUsers(); // Rafraîchir la liste
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Utilisateur créé',
            life: 3000
          });
          this.userDialog = false;
        },
        (error) => {
          console.error('Erreur lors de la création de l\'utilisateur', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: `Échec de la création de l'utilisateur : ${error.message}`
          });
        }
      );
    }
  }

  // Éditer un utilisateur existant
  editUser(user: User) {
    this.user = { ...user }; // Cloner l'objet utilisateur
    this.userDialog = true;
  }

  // Supprimer les utilisateurs sélectionnés
  deleteSelectedUsers() {
    this.confirmationService.confirm({
      message: 'Êtes-vous sûr de vouloir supprimer les utilisateurs sélectionnés ?',
      header: 'Confirmer',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const deleteRequests = this.selectedUsers.map((user) =>
          this.apiService.deleteUser(user.user_id).toPromise()
        );

        Promise.all(deleteRequests)
          .then(() => {
            this.loadUsers();
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Utilisateurs supprimés',
              life: 3000
            });
          })
          .catch((error) => {
            console.error('Erreur lors de la suppression des utilisateurs', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: `Échec de la suppression des utilisateurs : ${error.message}`
            });
          });
      }
    });
  }

  // Supprimer un seul utilisateur
  deleteUser(user: User) {
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer ${user.full_name} ?`,
      header: 'Confirmer',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.apiService.deleteUser(user.user_id).subscribe(
          () => {
            this.loadUsers(); // Rafraîchir la liste
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Utilisateur supprimé',
              life: 3000
            });
          },
          (error) => {
            console.error('Erreur lors de la suppression de l\'utilisateur', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: `Échec de la suppression de l'utilisateur : ${error.message}`
            });
          }
        );
      }
    });
  }

  // Appliquer un filtre global au tableau des utilisateurs
  applyFilterGlobal($event: any, stringVal: any) {
    this.dt!.filterGlobal(($event.target as HTMLInputElement).value, stringVal);
  }
}
