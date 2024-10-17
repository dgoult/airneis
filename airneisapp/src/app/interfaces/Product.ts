export interface Material {
    material_id: number;
    name: string;
  }
  
  export interface Image {
    image_id: number;
    image_url: string;
  }
  
  export interface Product {
    product_id: number;
    name: string;
    description: string;
    category_id: number;
    price: string;
    stock: number;
    materials: Material[];
    images: Image[];
    created_at: string;
  }
  
  export interface ProductCreateResponseApi {
    message: string;
    product_id: number;
  }