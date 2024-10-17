import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User, UserConnected, UserLogin, UserRegister } from '../interfaces/auth';
import { Material, Product } from '../interfaces/Product';
import { Category } from '../interfaces/Category';
import { AuthService } from './auth.service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient, private authService: AuthService, private messageService: MessageService, private router: Router) { }

  getCategoryDetails(categoryId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/categories/${categoryId}`);
  }

  setPriorityProducts(categoryId: number, productIds: number[]) {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.baseUrl}/admin/categories/priority/${categoryId}`, { priority_products: productIds }, { headers });
  }

  // Récupérer tous les produits avec gestion des erreurs
  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/products`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Récupérer un produit par son ID avec gestion des erreurs
  getProductById(productId: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/products/${productId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getSimilarProducts(productId: number) {
    return this.http.get(`${this.baseUrl}/products/${productId}/similar`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Créer un produit avec gestion des erreurs
  createProduct(product: Product): Observable<Product> {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    console.log('createproduct', product);

    return this.http.post<Product>(`${this.baseUrl}/admin/products`, product, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Mettre à jour un produit avec gestion des erreurs
  updateProduct(productId: number, product: Product): Observable<Product> {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    console.log('updateProduct request', productId, product);

    return this.http.put<Product>(`${this.baseUrl}/admin/products/${productId}`, product, { headers }).pipe(
        catchError((error: any): Observable<never> => {
            console.error('updateProduct error:', error);  // Log the error in the console
            // Lancer l'erreur pour la remonter au composant parent
            return throwError(() => new Error(error.message || 'Server error'));
        })
    );
  }

  // Supprimer un produit avec gestion des erreurs
  deleteProduct(productId: number): Observable<any> {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.delete<any>(`${this.baseUrl}/admin/products/${productId}`, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/categories`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Créer une ctégorie avec gestion des erreurs
  createCategory(category: Category): Observable<Category> {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    console.log('createcategory', category);

    return this.http.post<Category>(`${this.baseUrl}/admin/categories`, category, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Mettre à jour une ctégorie avec gestion des erreurs
  updateCategory(categoryId: number, category: Category): Observable<Category> {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    console.log('updateCategory request', categoryId, category);

    return this.http.put<Category>(`${this.baseUrl}/admin/categories/${categoryId}`, category, { headers }).pipe(
        catchError((error: any): Observable<never> => {
            console.error('updateCategory error:', error);  // Log the error in the console
            // Lancer l'erreur pour la remonter au composant parent
            return throwError(() => new Error(error.message || 'Server error'));
        })
    );
  }

  // Supprimer une ctégorie avec gestion des erreurs
  deleteCategory(categoryId: number): Observable<any> {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.delete<any>(`${this.baseUrl}/admin/categories/${categoryId}`, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  getAllMaterials(): Observable<Material[]> {
    return this.http.get<Material[]>(`${this.baseUrl}/materials`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Créer un matériau avec gestion des erreurs
  createMaterial(material: Material): Observable<Material> {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    console.log('createMaterial', material);

    return this.http.post<Material>(`${this.baseUrl}/admin/materials`, material, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Mettre à jour un matériau avec gestion des erreurs
  updateMaterial(materialId: number, material: Material): Observable<Material> {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    console.log('updateMaterial request', materialId, material);

    return this.http.put<Material>(`${this.baseUrl}/admin/materials/${materialId}`, material, { headers }).pipe(
        catchError((error: any): Observable<never> => {
            console.error('updateMaterial error:', error);  // Log the error in the console
            // Lancer l'erreur pour la remonter au composant parent
            return throwError(() => new Error(error.message || 'Server error'));
        })
    );
  }

  // Supprimer un matériau avec gestion des erreurs
  deleteMaterial(materialId: number): Observable<any> {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.delete<any>(`${this.baseUrl}/admin/materials/${materialId}`, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  getAllUsers(): Observable<any> {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<User[]>('http://localhost:8000/api/admin/users', { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

    // Créer un utilisateur avec gestion des erreurs
  createUser(user: User): Observable<User> {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    console.log('createUser', user);

    return this.http.post<User>(`${this.baseUrl}/admin/users`, user, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Mettre à jour un utilisateur avec gestion des erreurs
  updateUser(userId: number, user: User): Observable<User> {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    console.log('updateUser request', userId, user);

    return this.http.put<User>(`${this.baseUrl}/admin/users/${userId}`, user, { headers }).pipe(
        catchError((error: any): Observable<never> => {
            console.error('updateUser error:', error);  // Log the error in the console
            return throwError(() => new Error(error.message || 'Server error'));
        })
    );
  }

  // Supprimer un utilisateur avec gestion des erreurs
  deleteUser(userId: number): Observable<any> {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.delete<any>(`${this.baseUrl}/admin/users/${userId}`, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  getAllOrders(): Observable<any[]> {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`${this.baseUrl}/admin/orders`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  createOrder(order: any): Observable<any> {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.post<any>(`${this.baseUrl}/admin/orders`, order, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  updateOrder(orderId: number, order: any): Observable<any> {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put<any>(`${this.baseUrl}/admin/orders/${orderId}`, order, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  deleteOrder(orderId: number): Observable<any> {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete<any>(`${this.baseUrl}/admin/orders/${orderId}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  getCart(sessionId?: string | null, userId?: number | null): Observable<any> {
      let queryParams = '';
      if (sessionId) {
          queryParams = `?session_id=${sessionId}`;
      } else if (userId) {
          queryParams = `?user_id=${userId}`;
      }

      return this.http.get<any>(`${this.baseUrl}/cart${queryParams}`)
          .pipe(
              catchError(this.handleError)
          );
  }

  addToCart(cartItem: { session_id?: string | null; user_id?: number | null; product_id: number; quantity: number }): Observable<any> {
    console.log('apiservice addToCart', cartItem.session_id)
    return this.http.post<any>(`${this.baseUrl}/cart/add`, cartItem)
        .pipe(
            catchError(this.handleError)
        );
  }

  removeFromCart(cartItemId: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/cart/remove/${cartItemId}`)
        .pipe(
            catchError(this.handleError)
        );
  }

  getHomePatern(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/homepatern`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Connexion utilisateur avec gestion des erreurs
  loginUser(userDetails: UserLogin): Observable<UserConnected> {
    return this.http.post<UserConnected>(`${this.baseUrl}/login`, userDetails)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Inscription utilisateur avec gestion des erreurs
  registerUser(userDetails: UserRegister): Observable<UserConnected> {
    return this.http.post<UserConnected>(`${this.baseUrl}/register`, userDetails)
      .pipe(
        catchError(this.handleError)
      );
  }

  uploadImage(formData: FormData): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/assets`, formData)
      .pipe(
        catchError(this.handleError)
    );
  }

  deleteImage(imageUrl: string) {
      return this.http.delete(`${this.baseUrl}/assets/${imageUrl}`)
      .pipe(
        catchError(this.handleError)
    );
  }

  // Fonction de gestion des erreurs - extraction du message
  private handleError(error: HttpErrorResponse): Observable<never> {
    
    if(localStorage.getItem('token')){
        this.authService.checkToken().subscribe((isValid: boolean) => {
          if (!isValid) {
            // Si le token est expiré, rediriger ou afficher un message
            console.log('Le token est expiré ou invalide');
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: `Le token est expiré ou invalide`
            });
            sessionStorage.clear(); // Efface le token et les informations de session
            this.router.navigate(['/login'])
          } else {
            console.log('Le token est valide');
          }
        });
    }
    
    let errorMessage = '';

    if (error.error && error.error.message) {
      // Si le serveur retourne un message d'erreur, on le récupère
      errorMessage = error.error.message;
    } else if (error.error instanceof ErrorEvent) {
      // Erreur côté client (ex : problème de réseau)
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur sans message d'erreur explicite
      errorMessage = `Erreur du serveur: Code ${error.status}, Message: ${error.message}`;
    }

    console.error(errorMessage);  // Afficher l'erreur dans la console pour le débogage
    return throwError(() => new Error(errorMessage));  // Retourner l'observable d'erreur avec un message
  }
}