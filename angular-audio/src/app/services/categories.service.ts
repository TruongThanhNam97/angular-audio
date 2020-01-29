import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CategoryService {
    SERVER_URL: string;
    SERVER_URL_IMAGE: string;

    selectedCategory: string;

    private upadteCategoryAfterEdit$: Subject<any> = new Subject();

    constructor(private http: HttpClient) {
        this.SERVER_URL = environment.SERVER_URL;
        this.SERVER_URL_IMAGE = environment.SERVER_URL_IMAGE;
    }

    getUpdateCategoryAfterEdit() {
        return this.upadteCategoryAfterEdit$;
    }

    upload(data) {
        return this.http.post(`${this.SERVER_URL}categories/upload`, data,
            { headers: { Authorization: localStorage.getItem('jwtToken') } });
    }

    getCategories() {
        return this.http.get(`${this.SERVER_URL}categories/getCategories`).pipe(
            map((categories: any) => {
                const result = categories.map(category =>
                    ({
                        id: category._id,
                        name: category.name,
                        avatar: category.avatar ? `${this.SERVER_URL_IMAGE}${category.avatar}` : null
                    }));
                return result;
            })
        );
    }

    getCategoryById(data) {
        return this.http.get(`${this.SERVER_URL}categories/getCategoryById`, {
            params: {
                id: data.id
            }
        }).pipe(
            map((categories: any) => {
                const result = categories.map(category =>
                    ({
                        id: category._id,
                        name: category.name,
                        avatar: category.avatar ? `${this.SERVER_URL_IMAGE}${category.avatar}` : null
                    }));
                return result;
            })
        );
    }

    updateCategory(data) {
        return this.http.post(`${this.SERVER_URL}categories/update`, data, {
            headers: {
                Authorization: localStorage.getItem('jwtToken')
            }
        }).pipe(
            map((category: any) => {
                return {
                    id: category._id,
                    name: category.name,
                    avatar: category.avatar ? `${this.SERVER_URL_IMAGE}${category.avatar}` : null
                };
            })
        );
    }

    deleteCategory(data) {
        return this.http.post(`${this.SERVER_URL}categories/delete`, data, {
            headers: {
                Authorization: localStorage.getItem('jwtToken')
            }
        });
    }

    getSelectedCategory() {
        return this.selectedCategory;
    }

    setSelectedCategory(selectedCategory) {
        this.selectedCategory = selectedCategory;
    }

    resetSelectedCategory() {
        this.selectedCategory = null;
    }

}