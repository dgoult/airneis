import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeAdminComponent } from './components/homeAdmin/homeAdmin.component';
import { adminAuthGuard } from './guards/adminAuthGuard.guard';
import { HomeComponent } from './components/home/home.component';
import { SearchPageComponent } from './search-page/search-page.component';
import { ProfilePageComponent } from './profile-page/profile-page.component';
import { CategoryDetailComponent } from './components/category-detail/category-detail.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'home-admin',
    component: HomeAdminComponent,
    canActivate: [adminAuthGuard]
  },
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'search',
    component: SearchPageComponent,
  },
  {
    path: 'profile',
    component: ProfilePageComponent,
  },
  { 
    path: 'category/:id', 
    component: CategoryDetailComponent, 
  },
  { 
    path: 'product/:id', 
    component: ProductDetailComponent, 
  },
  {
    path: '', redirectTo: 'home', pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
