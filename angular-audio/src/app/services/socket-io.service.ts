import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SocketIoService {
    private SERVER_URL: string;
    private SERVER_URL_SOUND: string;
    private socket;
    constructor() {
        this.SERVER_URL = environment.SERVER_URL;
        this.SERVER_URL_SOUND = environment.SERVER_URL_SOUND;
        this.socket = io(this.SERVER_URL);
    }

    sendCommentRealTime() {
        this.socket.emit('song', '');
    }

    getCommentsRealTime() {
        return new Observable((observer) => {
            this.socket.on('song', (song) => {
                observer.next({
                    id: song._id,
                    url: this.SERVER_URL_SOUND + song.url,
                    name: song.name,
                    artist: song.artist,
                    nameToDownload: song.url,
                    userId: song.userId,
                    userName: song.userName,
                    categoryId: song.categoryId ? song.categoryId : null,
                    artistId: song.artistId ? song.artistId : null,
                    likedUsers: song.likedUsers,
                    comments: song.comments ? song.comments : []
                });
            });
        });
    }

    likeSongRealTime() {
        this.socket.emit('like', '');
    }

    getLikeSongRealTime() {
        return new Observable((observer) => {
            this.socket.on('like', (song) => {
                observer.next({
                    id: song._id,
                    url: this.SERVER_URL_SOUND + song.url,
                    name: song.name,
                    artist: song.artist,
                    nameToDownload: song.url,
                    userId: song.userId,
                    userName: song.userName,
                    categoryId: song.categoryId ? song.categoryId : null,
                    artistId: song.artistId ? song.artistId : null,
                    likedUsers: song.likedUsers,
                    comments: song.comments ? song.comments : []
                });
            });
        });
    }

}