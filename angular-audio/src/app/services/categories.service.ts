import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class CategoryService {
    SERVER_URL: string;
    SERVER_URL_IMAGE: string;

    constructor(private http: HttpClient) {
        this.SERVER_URL = environment.SERVER_URL;
        this.SERVER_URL_IMAGE = environment.SERVER_URL_IMAGE;
    }

    upload(data) {
        return this.http.post(`${this.SERVER_URL}categories/upload`, data,
            { headers: { Authorization: localStorage.getItem('jwtToken') } });
    }

    getCategories() {
        return this.http.get(`${this.SERVER_URL}categories/getCategories`).pipe(
            map((categories: any) => {
                const result = categories.map(category =>
                    ({ id: category._id, name: category.name, avatar: `${this.SERVER_URL_IMAGE}${category.avatar}` }));
                return result;
            })
        );
    }
}