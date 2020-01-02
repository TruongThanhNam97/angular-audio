import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AlbumService {
    private SERVER_URL: string;
    private SERVER_SOUND_URL: string;

    selectedAlbum: string;

    constructor(private http: HttpClient) {
        this.SERVER_URL = environment.SERVER_URL;
        this.SERVER_SOUND_URL = environment.SERVER_URL_SOUND;
    }

    getAlbums() {
        return this.http.get(`${this.SERVER_URL}users`);
    }

    getSelectedAlbum() {
        return this.selectedAlbum;
    }

    setSelectedAlbum(selectedAlbum: string) {
        this.selectedAlbum = selectedAlbum;
    }

    resetSelectedAlbum() {
        this.selectedAlbum = null;
    }

}