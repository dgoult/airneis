import { Pipe, PipeTransform, Injectable } from '@angular/core';
import { Product } from './interfaces/Product';

@Pipe({
    name: 'advancedFilter',
    pure: false
})
@Injectable()
export class AdvancedFilterPipe implements PipeTransform {
    transform(
        products: Product[], 
        searchText: string, 
        selectedMaterials: number[],
        priceRange: number[], 
        selectedCategories: number[], 
        inStockOnly: boolean
    ): Product[] {
        if (!products) return [];
        
        return products.filter(product => {
            // Filtre par texte (nom et description)
            const textMatch = this.matchText(product, searchText);

            // Filtre par matériaux (par `material_id`)
            const materialMatch = this.matchMaterials(product, selectedMaterials);

            // Filtre par prix
            const priceMatch = (!priceRange[0] || parseFloat(product.price) >= priceRange[0]) && (!priceRange[1] || parseFloat(product.price) <= priceRange[1]);

            // Filtre par catégorie
            const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(product.category_id);

            // Filtre par stock
            const stockMatch = !inStockOnly || (product.stock && product.stock > 0);

            return textMatch && materialMatch && priceMatch && categoryMatch && stockMatch;
        });
    }

    private matchText(product: Product, searchText: string): boolean {
        if (!searchText) return true;
        const lowerCaseSearch = searchText.toLowerCase();
        const nameMatch = product.name?.toLowerCase().includes(lowerCaseSearch) ?? false;
        // const descriptionMatch = product.description?.toLowerCase().includes(lowerCaseSearch) ?? false;
        
        // return nameMatch || descriptionMatch;
        return nameMatch;
    }

    private matchMaterials(product: Product, selectedMaterialIds: number[]): boolean {
        // Vérifier si les matériaux sont définis et non vides
        if (!selectedMaterialIds.length) return true;
        if (!product.materials || !Array.isArray(product.materials)) return false;
        
        // Filtrer par correspondance des `material_id`
        return product.materials.some(material => selectedMaterialIds.includes(material.material_id));
    }
}
// import { Pipe, PipeTransform, Injectable } from '@angular/core';
// import { Product } from './interfaces/Product';

// @Pipe({
//     name: 'advancedFilter',
//     pure: false
// })
// @Injectable()
// export class AdvancedFilterPipe implements PipeTransform {
//     transform(
//         products: Product[], 
//         searchText: string, 
//         selectedMaterialIds: number[], 
//         priceRange: number[],  // Mise à jour pour utiliser priceRange
//         selectedCategories: number[], 
//         inStockOnly: boolean
//     ): Product[] {
//         if (!products) return [];
        
//         return products.filter(product => {
//             // Filtre par texte (nom et description)
//             const textMatch = this.matchText(product, searchText);

//             // Filtre par matériaux (par `material_id`)
//             const materialMatch = this.matchMaterials(product, selectedMaterialIds);

//             // Filtre par prix en utilisant le range
//             const priceMatch = this.matchPrice(product, priceRange);

//             // Filtre par catégorie
//             const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(product.category_id);

//             // Filtre par stock
//             const stockMatch = !inStockOnly || (product.stock && product.stock > 0);

//             return textMatch && materialMatch && priceMatch && categoryMatch && stockMatch;
//         });
//     }

//     private matchText(product: Product, searchText: string): boolean {
//         if (!searchText) return true;
//         const lowerCaseSearch = searchText.toLowerCase();
//         const nameMatch = product.name?.toLowerCase().includes(lowerCaseSearch) ?? false;
//         const descriptionMatch = product.description?.toLowerCase().includes(lowerCaseSearch) ?? false;
        
//         return nameMatch || descriptionMatch;
//     }

//     private matchMaterials(product: Product, selectedMaterialIds: number[]): boolean {
//         if (!selectedMaterialIds.length) return true;
//         if (!product.materials || !Array.isArray(product.materials)) return false;
        
//         return product.materials.some(material => selectedMaterialIds.includes(material.material_id));
//     }

//     private matchPrice(product: Product, priceRange: number[]): boolean {
//         if (!priceRange || priceRange.length !== 2) return true;
//         const [priceMin, priceMax] = priceRange;
//         const productPrice = parseFloat(product.price);
        
//         return productPrice >= priceMin && productPrice <= priceMax;
//     }
// }
