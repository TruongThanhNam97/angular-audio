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


  private blockedSongsOfUser: any[] = [];
  private blockedSongsAfterBlockSubject$: Subject<any> = new Subject();

  private selectedSong: any;
  private selectedSongId: string;

  private updateSongAfterManipulatingSubject$: Subject<any> = new Subject();


  constructor(private http: HttpClient) {
    this.SERVER_URL = environment.SERVER_URL;
    this.SERVER_URL_SOUND = environment.SERVER_URL_SOUND;
  }

  getUpdateSongAfterManipulatingSubject() {
    return this.updateSongAfterManipulatingSubject$;
  }

  getSelectedSongId() {
    return this.selectedSongId;
  }

  setSelectedSongId(id) {
    this.selectedSongId = id;
  }

  setSelectedSong(song) {
    this.selectedSong = { ...song };
  }

  getSelectedSong() {
    return this.selectedSong;
  }

  getCurrentFileSubject() {
    return this.currentFileSubject$;
  }

  getUpdatedSongsAfterLikingSubject() {
    return this.updatedSongsAfterLikingSubject$;
  }

  getTop20FavarotieSongs() {
    return this.http.get(`${this.SERVER_URL}`).pipe(
      map((files: any) => {
        let result = files.reduce((acc, cur) => {
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
            likedUsers: cur.likedUsers,
            comments: cur.comments ? cur.comments : []
          };
          acc.push(obj);
          return acc;
        }, []);
        result = result.filter(song => !this.blockedSongsOfUser.includes(song.id));
        return result;
      })
    );
  }

  getAllSongs() {
    return this.http.get(`${this.SERVER_URL}getAllSongs`).pipe(
      map((files: any) => {
        let result = files.reduce((acc, cur) => {
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
            likedUsers: cur.likedUsers,
            comments: cur.comments ? cur.comments : []
          };
          acc.push(obj);
          return acc;
        }, []);
        result = result.filter(song => !this.blockedSongsOfUser.includes(song.id));
        return result;
      })
    );
  }

  getSongBySongId(id: string) {
    return this.http.get(this.SERVER_URL + 'getSongBySongId', { params: { id } }).pipe(
      map((song: any) => {
        const result = {
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
        };
        return result;
      }),
      tap(song => {
        this.allowGetSongs = false;
        this.currentPlayList = [song];
        // this.currentPlayListSubject$.next(this.currentPlayList);
      })
    );
  }

  getSongsByUserId(id: string) {
    return this.http.get(this.SERVER_URL + 'getSongs', { params: { id } }).pipe(
      map((files: any) => {
        let result = files.reduce((acc, cur) => {
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
            likedUsers: cur.likedUsers,
            comments: cur.comments ? cur.comments : []
          };
          acc.push(obj);
          return acc;
        }, []);
        result = result.filter(song => !this.blockedSongsOfUser.includes(song.id));
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
        let result = files.reduce((acc, cur) => {
          const obj = {
            id: cur.song._id,
            url: this.SERVER_URL_SOUND + cur.song.url,
            name: cur.song.name,
            artist: cur.song.artist,
            nameToDownload: cur.song.url,
            userId: cur.song.userId,
            userName: cur.song.userName,
            categoryId: cur.song.categoryId ? cur.song.categoryId : null,
            artistId: cur.song.artistId ? cur.song.artistId : null,
            likedUsers: cur.song.likedUsers,
            comments: cur.song.comments ? cur.song.comments : []
          };
          acc.push(obj);
          return acc;
        }, []);
        result = result.filter(song => !this.blockedSongsOfUser.includes(song.id));
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
        let result = files.reduce((acc, cur) => {
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
            likedUsers: cur.likedUsers,
            comments: cur.comments ? cur.comments : []
          };
          acc.push(obj);
          return acc;
        }, []);
        result = result.filter(song => !this.blockedSongsOfUser.includes(song.id));
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
        let result = files.reduce((acc, cur) => {
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
            likedUsers: cur.likedUsers,
            comments: cur.comments ? cur.comments : []
          };
          acc.push(obj);
          return acc;
        }, []);
        result = result.filter(song => !this.blockedSongsOfUser.includes(song.id));
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
          likedUsers: song.likedUsers,
          comments: song.comments ? song.comments : []
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
          likedUsers: song.likedUsers,
          comments: song.comments ? song.comments : []
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

  getBlockedSongs() {
    return this.http.get(`${this.SERVER_URL}getBlockedSongs`, {
      headers: {
        Authorization: localStorage.getItem('jwtToken')
      }
    });
  }

  blockSong(data) {
    return this.http.post(`${this.SERVER_URL}block-song`, data, {
      headers: {
        Authorization: localStorage.getItem('jwtToken')
      }
    });
  }

  setBlockedSongsOfUser(blockedSongs) {
    this.blockedSongsOfUser = [...blockedSongs];
  }

  getBlockedSongsOfUser() {
    return this.blockedSongsOfUser;
  }

  getBlockedSongsAfterBlockSubject() {
    return this.blockedSongsAfterBlockSubject$;
  }

  addComment(data) {
    return this.http.post(`${this.SERVER_URL}addComment`, data, {
      headers: {
        Authorization: localStorage.getItem('jwtToken')
      }
    }).pipe(
      map((song: any) => ({
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
      }))
    );
  }

  addSubComment(data) {
    return this.http.post(`${this.SERVER_URL}addSubComment`, data, {
      headers: {
        Authorization: localStorage.getItem('jwtToken')
      }
    }).pipe(
      map((song: any) => ({
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
      }))
    );
  }


  editComment(data) {
    return this.http.post(`${this.SERVER_URL}editComment`, data, {
      headers: {
        Authorization: localStorage.getItem('jwtToken')
      }
    }).pipe(
      map((song: any) => ({
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
      }))
    );
  }

  editSubComment(data) {
    return this.http.post(`${this.SERVER_URL}editSubComment`, data, {
      headers: {
        Authorization: localStorage.getItem('jwtToken')
      }
    }).pipe(
      map((song: any) => ({
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
      }))
    );
  }

  deleteComment(data) {
    return this.http.post(`${this.SERVER_URL}deleteComment`, data, {
      headers: {
        Authorization: localStorage.getItem('jwtToken')
      }
    }).pipe(
      map((song: any) => ({
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
      }))
    );
  }

  deleteSubComment(data) {
    return this.http.post(`${this.SERVER_URL}deleteSubComment`, data, {
      headers: {
        Authorization: localStorage.getItem('jwtToken')
      }
    }).pipe(
      map((song: any) => ({
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
      }))
    );
  }

  likeComment(data) {
    return this.http.post(`${this.SERVER_URL}likeComment`, data, {
      headers: {
        Authorization: localStorage.getItem('jwtToken')
      }
    }).pipe(
      map((song: any) => ({
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
      }))
    );
  }

  likeSubComment(data) {
    return this.http.post(`${this.SERVER_URL}likeSubComment`, data, {
      headers: {
        Authorization: localStorage.getItem('jwtToken')
      }
    }).pipe(
      map((song: any) => ({
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
      }))
    );
  }

  unlikeComment(data) {
    return this.http.post(`${this.SERVER_URL}unlikeComment`, data, {
      headers: {
        Authorization: localStorage.getItem('jwtToken')
      }
    }).pipe(
      map((song: any) => ({
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
      }))
    );
  }

  unlikeSubComment(data) {
    return this.http.post(`${this.SERVER_URL}unlikeSubComment`, data, {
      headers: {
        Authorization: localStorage.getItem('jwtToken')
      }
    }).pipe(
      map((song: any) => ({
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
      }))
    );
  }

}
