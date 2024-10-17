import { Pipe, PipeTransform, Injectable } from '@angular/core';

@Pipe({
    name: 'filter',
    pure: false
})
@Injectable()
export class MySearchPipePipe implements PipeTransform {
    /*
     * @param items object from array
     * @param term term's search
     * @param objectFieldNames (optional) array of field names to search
     */
    transform(items: any[], term: string, objectFieldNames: string[]): any[] {
        if (!term || !items) return items;
        return MySearchPipePipe.filter(items, term, objectFieldNames);
    }

    /*
     * @param items List of items to filter
     * @param term  a string term to compare with every property of the list
     * @param objectFieldNames array of field names to search
     */
    static filter(items: Array<{ [key: string]: any }>, term: string, objectFieldNames: string[]): Array<{ [key: string]: any }> {
        const toCompare = term.toLowerCase();
        return items.filter(item => {
            if (!objectFieldNames || objectFieldNames.length === 0) { // If no specific fields are defined, search all fields
                for (let property in item) {
                    if (item[property] === null || item[property] === undefined) {
                        continue;
                    }
                    if (item[property].toString().toLowerCase().includes(toCompare)) {
                        return true;
                    }
                }
            } else { // Otherwise, search only specified fields
                for (let fieldName of objectFieldNames) {
                    if (item[fieldName] === null || item[fieldName] === undefined) {
                        continue;
                    }
                    if (item[fieldName].toString().toLowerCase().includes(toCompare)) {
                        return true;
                    }
                }
            }
            return false;
        });
    }
}