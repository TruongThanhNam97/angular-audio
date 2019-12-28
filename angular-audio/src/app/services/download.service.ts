import { Injectable } from '@angular/core';
import { HttpResponse, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
    providedIn: 'root'
})
export class DownloadService {
    SERVER_URL = 'http://localhost:3000/';
    SERVER_URL_SOUND = 'http://localhost:3000/watermark-songs/';

    constructor(private http: HttpClient) { }

    downloadFile(nameToDownload: string): Observable<any> {
        return this.http.get(`${this.SERVER_URL}download/song`, {
            responseType: 'blob',
            params: {
                nameToDownload
            }
        });
    }
}