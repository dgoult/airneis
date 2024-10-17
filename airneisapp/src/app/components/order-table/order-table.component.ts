import { Component, Input, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ApiService } from 'src/app/services/apiService';

@Component({
  selector: 'order-table',
  templateUrl: './order-table.component.html',
  styleUrls: ['./order-table.component.css']
})
export class OrderTableComponent implements OnInit {
  @Input() orders: any[] = [];
  selectedOrders: any[] = [];
  order: any = null;
  orderDialog: boolean = false;
  submitted: boolean = false;

  // Options pour les statuts de commande
  statusOptions: any[] = [
    { label: 'En cours', value: 'en cours' },
    { label: 'Annulé', value: 'annulé' },
    { label: 'Livré', value: 'livré' }
  ];

  constructor(private apiService: ApiService, private messageService: MessageService) {}

  ngOnInit(): void {
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

  openNew() {
    this.order = {
      order_id: null,
      user_id: null,
      address_id: null,
      payment_id: null,
      product_id: null,
      quantity: null,
      status: 'en cours',
      date: new Date()
    }; // Initialisation d'une nouvelle commande
    this.submitted = false;
    this.orderDialog = true;
  }

  editOrder(order: any) {
    this.order = { ...order }; // Clone de l'objet pour modification
    this.orderDialog = true;
  }

  saveOrder() {
    this.submitted = true;
    if (this.order.status && this.order.quantity) {
      if (this.order.order_id) {
        // Si l'order_id existe, nous mettons à jour la commande existante
        this.apiService.updateOrder(this.order.order_id, this.order).subscribe(
          (response) => {
            this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Commande mise à jour avec succès', life: 3000 });
            this.loadOrders(); // Recharger les commandes après modification
            this.orderDialog = false;
            this.order = null;
          },
          (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: `Erreur lors de la mise à jour de la commande : ${error.message}`
            });
            console.error('Erreur lors de la mise à jour de la commande', error);
          }
        );
      } else {
        // Si l'order_id n'existe pas, nous créons une nouvelle commande
        this.apiService.createOrder(this.order).subscribe(
          (response) => {
            this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Commande créée avec succès', life: 3000 });
            this.loadOrders(); // Recharger les commandes après création
            this.orderDialog = false;
            this.order = null;
          },
          (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: `Erreur lors de la création de la commande : ${error.message}`
            });
            console.error('Erreur lors de la création de la commande', error);
          }
        );
      }
    }
  }

  deleteOrder(order: any) {
    this.apiService.deleteOrder(order.order_id).subscribe(
      (response) => {
        this.loadOrders(); // Recharger les commandes après suppression
      },
      (error) => {
        console.error('Erreur lors de la suppression de la commande', error);
      }
    );
  }

  deleteSelectedOrders() {
    if (this.selectedOrders && this.selectedOrders.length > 0) {
      const deleteRequests = this.selectedOrders.map(order =>
        this.apiService.deleteOrder(order.order_id).toPromise()
      );

      Promise.all(deleteRequests)
        .then(() => {
          this.loadOrders(); // Recharger les commandes après suppression
          this.selectedOrders = [];
        })
        .catch((error) => {
          console.error('Erreur lors de la suppression des commandes', error);
        });
    }
  }

  hideDialog() {
    this.orderDialog = false;
    this.submitted = false;
  }
}