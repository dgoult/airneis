import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeAdminComponent } from './components/homeAdmin/homeAdmin.component';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { HttpClientModule } from '@angular/common/http';
import { ToastModule } from 'primeng/toast';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ConfirmationService, MessageService } from 'primeng/api';
import { HomeComponent } from './components/home/home.component';
import { CarouselModule } from 'primeng/carousel';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { MultiSelectModule } from 'primeng/multiselect';
import { OrderListModule } from 'primeng/orderlist';
import { ProductTableComponent } from './components/product-table/product-table.component';
import { DialogModule } from 'primeng/dialog';
import { RippleModule } from 'primeng/ripple';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CommonModule } from '@angular/common';
import { FileUploadModule } from 'primeng/fileupload';
import { TagModule } from 'primeng/tag';
import { RadioButtonModule } from 'primeng/radiobutton';
import { RatingModule } from 'primeng/rating';
import { InputNumberModule } from 'primeng/inputnumber';
import { PopupComponent } from './popup/popup.component';
import { MatDialogModule } from '@angular/material/dialog';
import { NavbarComponent } from './menubar/menubar.component';
import {MenubarModule} from 'primeng/menubar';
import { SidebarModule } from 'primeng/sidebar';
import { CategoryTableComponent } from './components/category-table/category-table.component';
import { ApiService } from './services/apiService';
import { BadgeModule } from 'primeng/badge';
import { MaterialTableComponent } from './components/material-table/material-table.component';
import { UserTableComponent } from './components/user-table/user-table.component';
import { OrderTableComponent } from './components/order-table/order-table.component';
import { ProductHomeListComponent } from './components/product-home-list/product-home-list.component';
import { MySearchPipePipe } from './my-search-pipe.pipe';
import { AdvancedFilterPipe } from './advanced-filter.pipe';
import { KnobModule } from 'primeng/knob';
import { SliderModule } from 'primeng/slider';
import { CheckboxModule } from 'primeng/checkbox';
import { SearchPageComponent } from './search-page/search-page.component';
import { ProfilePageComponent } from './profile-page/profile-page.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { CategoryDetailComponent } from './components/category-detail/category-detail.component';
import { CategoryPriorityComponent } from './components/category-priority/category-priority.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    HomeAdminComponent,
    HomeComponent,
    ProductTableComponent,
    PopupComponent,
    NavbarComponent,
    CategoryTableComponent,
    MaterialTableComponent,
    UserTableComponent,
    OrderTableComponent,
    ProductHomeListComponent,
    MySearchPipePipe,
    AdvancedFilterPipe,
    SearchPageComponent,
    ProfilePageComponent,
    ProductDetailComponent,
    CategoryDetailComponent,
    CategoryPriorityComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CardModule,
    InputTextModule,
    ReactiveFormsModule,
    ButtonModule,
    HttpClientModule,
    ToastModule,
    BrowserAnimationsModule,
    FormsModule,
    CarouselModule,
    DropdownModule,
    TableModule,
    TabViewModule,
    MultiSelectModule,
    OrderListModule,
    DialogModule,
    RippleModule,
    ToolbarModule,
    ConfirmDialogModule,
    InputTextareaModule,
    CommonModule,
    FileUploadModule,
    TagModule,
    RadioButtonModule, 
    RatingModule,
    InputNumberModule,
    MatDialogModule,
    MenubarModule,
    SidebarModule,
    BadgeModule,
    KnobModule,
    SliderModule,
    CheckboxModule,
  ],
  providers: [MessageService, ConfirmationService, ApiService],
  bootstrap: [AppComponent]
})
export class AppModule { }
