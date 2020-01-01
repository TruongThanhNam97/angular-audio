import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class UploadCategoryService {
    SERVER_URL: string;

    constructor(private http: HttpClient) {
        this.SERVER_URL = environment.SERVER_URL;
    }

    upload(data) {
        return this.http.post(`${this.SERVER_URL}categories/upload`, data,
            { headers: { Authorization: localStorage.getItem('jwtToken') } });
    }
}