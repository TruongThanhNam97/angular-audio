import { Injectable } from '@angular/core';
import { HttpResponse, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
@Injectable({
    providedIn: 'root'
})
export class DownloadService {
    private SERVER_URL: string;
    private SERVER_URL_SOUND: string;

    constructor(private http: HttpClient) {
        this.SERVER_URL = environment.SERVER_URL;
        this.SERVER_URL_SOUND = environment.SERVER_URL_SOUND;
    }

    downloadFile(nameToDownload: string): Observable<any> {
        return this.http.get(`${this.SERVER_URL}download/song`, {
            responseType: 'blob',
            params: {
                nameToDownload
            }
        });
    }
}