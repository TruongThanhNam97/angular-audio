import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class ArtistsService {
    SERVER_URL: string;
    SERVER_URL_IMAGE: string;

    selectedArtist: string;

    constructor(private http: HttpClient) {
        this.SERVER_URL = environment.SERVER_URL;
        this.SERVER_URL_IMAGE = environment.SERVER_URL_IMAGE;
    }

    upload(data) {
        return this.http.post(`${this.SERVER_URL}artists/upload`, data,
            { headers: { Authorization: localStorage.getItem('jwtToken') } });
    }

    getArtists() {
        return this.http.get(`${this.SERVER_URL}artists/getArtists`).pipe(
            map((artists: any) => {
                const result = artists.map(artist =>
                    ({
                        id: artist._id,
                        name: artist.name,
                        avatar: artist.avatar ? `${this.SERVER_URL_IMAGE}${artist.avatar}` : null
                    }));
                return result;
            })
        );
    }

    getArtistById(data) {
        return this.http.get(`${this.SERVER_URL}artists/getArtistById`, {
            params: {
                id: data.id
            }
        }).pipe(
            map((artists: any) => {
                const result = artists.map(artist =>
                    ({
                        id: artist._id,
                        name: artist.name,
                        avatar: artist.avatar ? `${this.SERVER_URL_IMAGE}${artist.avatar}` : null
                    }));
                return result;
            })
        );
    }

    updateArtist(data) {
        return this.http.post(`${this.SERVER_URL}artists/update`, data, {
            headers: {
                Authorization: localStorage.getItem('jwtToken')
            }
        }).pipe(
            map((artist: any) => {
                return {
                    id: artist._id,
                    name: artist.name,
                    avatar: artist.avatar ? `${this.SERVER_URL_IMAGE}${artist.avatar}` : null
                };
            })
        );
    }

    deleteArtist(data) {
        return this.http.post(`${this.SERVER_URL}artists/delete`, data, {
            headers: {
                Authorization: localStorage.getItem('jwtToken')
            }
        });
    }

    getSelectedArtist() {
        return this.selectedArtist;
    }

    setSelectedArtist(selectedArtist) {
        this.selectedArtist = selectedArtist;
    }

    resetSelectedArtist() {
        this.selectedArtist = null;
    }
}