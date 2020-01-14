import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs';
import { CloudService } from './cloud.service';

@Injectable({
    providedIn: 'root'
})
export class PlayListService {

    SERVER_URL: string;
    SERVER_URL_SOUND: string;
    selectedPlayList: string;
    listSongsOfPlayList: any[];
    createdPlayListsSubject$: Subject<any> = new Subject();
    updatedPlayListsSubject$: Subject<any> = new Subject();
    deletedPlayListSubject$: Subject<any> = new Subject();
    listSongsAfterDeleteFromPlayListSubject$: Subject<any> = new Subject();
    updatedPlayListAfterAddOrDeleteSongSubject$: Subject<any> = new Subject();

    constructor(private http: HttpClient, private cloudService: CloudService) {
        this.SERVER_URL = environment.SERVER_URL;
        this.SERVER_URL_SOUND = environment.SERVER_URL_SOUND;
    }

    setListSongsOfPlayList(playlist) {
        const blockedSongs = this.cloudService.getBlockedSongsOfUser();
        this.listSongsOfPlayList = [...playlist.listSongs];
        this.listSongsOfPlayList = this.listSongsOfPlayList.map(song => ({
            id: song._id,
            url: this.SERVER_URL_SOUND + song.url,
            name: song.name,
            artist: song.artist,
            nameToDownload: song.url,
            userId: song.userId,
            userName: song.userName,
            likedUsers: song.likedUsers,
            playlistId: playlist._id,
            playlistName: playlist.name,
            artistId: song.artistId ? song.artistId : null,
            categoryId: song.categoryId ? song.categoryId : null,
            comments: song.comments ? song.comments : []
        }));
        this.listSongsOfPlayList = this.listSongsOfPlayList.filter(song => !blockedSongs.includes(song.id));
    }

    getListSongsOfPlayList() {
        return this.listSongsOfPlayList;
    }

    getSelectedPlayList() {
        return this.selectedPlayList;
    }

    setSelectedPlayList(playlist) {
        this.selectedPlayList = playlist;
    }

    resetSelectedPlayList() {
        this.selectedPlayList = null;
    }

    getCreatedPlayListSubject() {
        return this.createdPlayListsSubject$;
    }

    getUpdatedPlayListSubject() {
        return this.updatedPlayListsSubject$;
    }

    getDeletedPlayListSubject() {
        return this.deletedPlayListSubject$;
    }

    getPlayListByUser() {
        return this.http.get(`${this.SERVER_URL}playlists`, {
            headers: {
                Authorization: localStorage.getItem('jwtToken')
            }
        });
    }

    createPlayList(data) {
        return this.http.post(`${this.SERVER_URL}playlists/createPlayList`, data, {
            headers: {
                Authorization: localStorage.getItem('jwtToken')
            }
        });
    }

    editPlayList(data) {
        return this.http.post(`${this.SERVER_URL}playlists/editPlayList`, data, {
            headers: {
                Authorization: localStorage.getItem('jwtToken')
            }
        });
    }

    deletePlayList(data) {
        return this.http.post(`${this.SERVER_URL}playlists/deletePlayList`, data, {
            headers: {
                Authorization: localStorage.getItem('jwtToken')
            }
        });
    }

    addSongToPlayList(data) {
        return this.http.post(`${this.SERVER_URL}playlists/addSong`, data, {
            headers: {
                Authorization: localStorage.getItem('jwtToken')
            }
        });
    }

    deleteSongFromPlayList(data) {
        return this.http.post(`${this.SERVER_URL}playlists/deleteSong`, data, {
            headers: {
                Authorization: localStorage.getItem('jwtToken')
            }
        });
    }

    getListSongsAfterDeleteFromPlayListSubject() {
        return this.listSongsAfterDeleteFromPlayListSubject$;
    }

    getUdatedPlayListAfterAddOrDeleteSongSubject() {
        return this.updatedPlayListAfterAddOrDeleteSongSubject$;
    }
}