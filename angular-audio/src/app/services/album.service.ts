import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class AlbumService {
    private SERVER_URL: string;
    private SERVER_SOUND_URL: string;
    private SERVER_IMAGE_URL: string;

    selectedAlbum: string;

    constructor(private http: HttpClient) {
        this.SERVER_URL = environment.SERVER_URL;
        this.SERVER_SOUND_URL = environment.SERVER_URL_SOUND;
        this.SERVER_IMAGE_URL = environment.SERVER_URL_IMAGE;
    }

    getAlbums() {
        return this.http.get(`${this.SERVER_URL}users`);
    }

    unbanUser(data) {
        return this.http.post(`${this.SERVER_URL}users/unban`, data, {
            headers: {
                Authorization: localStorage.getItem('jwtToken')
            }
        }).pipe(
            map((user: any) => {
                const result = {
                    id: user._id,
                    username: user.username,
                    numberOfReup: user.numberOfReup,
                    avatar: user.avatar ? `${this.SERVER_IMAGE_URL}${user.avatar}` : null
                };
                return result;
            })
        );
    }

    banUser(data) {
        return this.http.post(`${this.SERVER_URL}users/ban`, data, {
            headers: {
                Authorization: localStorage.getItem('jwtToken')
            }
        }).pipe(
            map((user: any) => {
                const result = {
                    id: user._id,
                    username: user.username,
                    numberOfReup: user.numberOfReup,
                    avatar: user.avatar ? `${this.SERVER_IMAGE_URL}${user.avatar}` : null
                };
                return result;
            })
        );
    }

    getAllUsers() {
        return this.http.get(`${this.SERVER_URL}users/getAllUsers`, {
            headers: {
                Authorization: localStorage.getItem('jwtToken')
            }
        }).pipe(
            map((users: any[]) => {
                const result = users.reduce((pre, cur, index, arr) => {
                    const user = {
                        id: cur._id,
                        username: cur.username,
                        numberOfReup: cur.numberOfReup,
                        avatar: cur.avatar ? `${this.SERVER_IMAGE_URL}${cur.avatar}` : null
                    };
                    pre.push(user);
                    return pre;
                }, []);
                return result;
            })
        );
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