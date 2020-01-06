import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CloudService {
  private SERVER_URL: string;
  private SERVER_URL_SOUND: string;

  private currentPlayList: any;
  private allowGetSongs = true;

  private currentPlayListSubject$: Subject<any> = new Subject();

  private updatedSong: any;
  private updatedSongSubject$: Subject<any> = new Subject();

  private updatedSongsAfterLikingSubject$: Subject<any> = new Subject();

  private currentFileSubject$: Subject<any> = new Subject();

  private selectedFavoriteSongs: string;


  constructor(private http: HttpClient) {
    this.SERVER_URL = environment.SERVER_URL;
    this.SERVER_URL_SOUND = environment.SERVER_URL_SOUND;
  }

  getCurrentFileSubject() {
    return this.currentFileSubject$;
  }

  getUpdatedSongsAfterLikingSubject() {
    return this.updatedSongsAfterLikingSubject$;
  }

  getAllSongs() {
    return this.http.get(`${this.SERVER_URL}getAllSongs`).pipe(
      map((files: any) => {
        const result = files.reduce((acc, cur) => {
          const obj = {
            id: cur._id,
            url: this.SERVER_URL_SOUND + cur.url,
            name: cur.name,
            artist: cur.artist,
            nameToDownload: cur.url,
            userId: cur.userId,
            userName: cur.userName,
            categoryId: cur.categoryId ? cur.categoryId : null,
            artistId: cur.artistId ? cur.artistId : null,
            likedUsers: cur.likedUsers
          };
          acc.push(obj);
          return acc;
        }, []);
        return result;
      })
    );
  }

  getSongsByUserId(id: string) {
    return this.http.get(this.SERVER_URL + 'getSongs', { params: { id } }).pipe(
      map((files: any) => {
        const result = files.reduce((acc, cur) => {
          const obj = {
            id: cur._id,
            url: this.SERVER_URL_SOUND + cur.url,
            name: cur.name,
            artist: cur.artist,
            nameToDownload: cur.url,
            userId: cur.userId,
            userName: cur.userName,
            categoryId: cur.categoryId ? cur.categoryId : null,
            likedUsers: cur.likedUsers
          };
          acc.push(obj);
          return acc;
        }, []);
        return result;
      }),
      tap(files => {
        this.allowGetSongs = false;
        this.currentPlayList = [...files];
        // this.currentPlayListSubject$.next(this.currentPlayList);
      })
    );
  }

  getFavoriteSongsByUserId(id: string) {
    return this.http.get(this.SERVER_URL + 'getSongs', { params: { id, favoriteMode: 'true' } }).pipe(
      map((files: any) => {
        const result = files.reduce((acc, cur) => {
          const obj = {
            id: cur.song._id,
            url: this.SERVER_URL_SOUND + cur.song.url,
            name: cur.song.name,
            artist: cur.song.artist,
            nameToDownload: cur.song.url,
            userId: cur.song.userId,
            userName: cur.song.userName,
            categoryId: cur.song.categoryId ? cur.song.categoryId : null,
            likedUsers: cur.song.likedUsers
          };
          acc.push(obj);
          return acc;
        }, []);
        return result;
      }),
      tap(files => {
        this.allowGetSongs = false;
        this.currentPlayList = [...files];
        // this.currentPlayListSubject$.next(this.currentPlayList);
      })
    );
  }

  getSongsByCategoryId(id: string) {
    return this.http.get(this.SERVER_URL + 'getSongsByCategory', { params: { id } }).pipe(
      map((files: any) => {
        const result = files.reduce((acc, cur) => {
          const obj = {
            id: cur._id,
            url: this.SERVER_URL_SOUND + cur.url,
            name: cur.name,
            artist: cur.artist,
            nameToDownload: cur.url,
            userId: cur.userId,
            userName: cur.userName,
            likedUsers: cur.likedUsers
          };
          acc.push(obj);
          return acc;
        }, []);
        return result;
      }),
      tap(files => {
        this.allowGetSongs = false;
        this.currentPlayList = [...files];
        // this.currentPlayListSubject$.next(this.currentPlayList);
      })
    );
  }

  getSongsByArtistId(id: string) {
    return this.http.get(this.SERVER_URL + 'getSongsByArtist', { params: { id } }).pipe(
      map((files: any) => {
        const result = files.reduce((acc, cur) => {
          const obj = {
            id: cur._id,
            url: this.SERVER_URL_SOUND + cur.url,
            name: cur.name,
            artist: cur.artist,
            nameToDownload: cur.url,
            userId: cur.userId,
            userName: cur.userName,
            likedUsers: cur.likedUsers
          };
          acc.push(obj);
          return acc;
        }, []);
        return result;
      }),
      tap(files => {
        this.allowGetSongs = false;
        this.currentPlayList = [...files];
        // this.currentPlayListSubject$.next(this.currentPlayList);
      })
    );
  }

  updateSong(data) {
    return this.http.post(`${this.SERVER_URL}edit-song`, data, {
      headers: {
        Authorization: localStorage.getItem('jwtToken')
      }
    }).pipe(
      map((song: any) => {
        return {
          id: song._id,
          url: this.SERVER_URL_SOUND + song.url,
          name: song.name,
          artist: song.artist,
          nameToDownload: song.url,
          userId: song.userId,
          userName: song.userName,
          categoryId: song.categoryId ? song.categoryId : null,
          artistId: song.artistId ? song.artistId : null,
          likedUsers: song.likedUsers
        };
      })
    );
  }

  deleteSong(data) {
    return this.http.post(`${this.SERVER_URL}delete-song`, data, {
      headers: {
        Authorization: localStorage.getItem('jwtToken')
      }
    });
  }

  likeSong(data) {
    return this.http.post(`${this.SERVER_URL}like-song`, data, {
      headers: {
        Authorization: localStorage.getItem('jwtToken')
      }
    }).pipe(
      map((song: any) => {
        return {
          id: song._id,
          url: this.SERVER_URL_SOUND + song.url,
          name: song.name,
          artist: song.artist,
          nameToDownload: song.url,
          userId: song.userId,
          userName: song.userName,
          categoryId: song.categoryId ? song.categoryId : null,
          artistId: song.artistId ? song.artistId : null,
          likedUsers: song.likedUsers
        };
      })
    );
  }

  getCurrentPlayList() {
    return this.currentPlayList;
  }

  getCurrentPlayListSubject() {
    return this.currentPlayListSubject$.asObservable();
  }

  getStateToAllowGetSongs() {
    return this.allowGetSongs;
  }

  setStateToAllowGetSongs() {
    this.allowGetSongs = true;
  }

  updateCurrentPlayList() {
    this.currentPlayListSubject$.next(this.currentPlayList);
  }

  setUpdatedSong(song) {
    this.updatedSong = { ...song };
    this.updatedSongSubject$.next(this.updatedSong);
  }

  getUpdatedSongSubject() {
    return this.updatedSongSubject$.asObservable();
  }

  setCurrentPlayList(files) {
    this.currentPlayList = [...files];
  }

  setSelectedFavoriteSongs(favoriteSong) {
    this.selectedFavoriteSongs = favoriteSong;
  }

  getSelectedFavoriteSongs() {
    return this.selectedFavoriteSongs;
  }

  resetSelectedFavoriteSongs() {
    this.selectedFavoriteSongs = null;
  }


}
