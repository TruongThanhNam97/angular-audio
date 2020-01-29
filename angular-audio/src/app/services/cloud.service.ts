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


  private allowGetSongs = true;

  private currentPlayListSubject$: Subject<any> = new Subject();

  private updatedSong: any;
  private updatedSongSubject$: Subject<any> = new Subject();

  private updatedSongsAfterLikingSubject$: Subject<any> = new Subject();

  private currentFileSubject$: Subject<any> = new Subject();

  private blockedSongsOfUser: any[] = [];
  private blockedSongsAfterBlockSubject$: Subject<any> = new Subject();

  private selectedSong: any;
  private selectedSongId: string;
  private selectedFavoriteSongs: string;
  private selectedTop100Love: string;
  private selectedTop100Hear: string;
  private currentPlayList: any;

  private updateSongAfterManipulatingSubject$: Subject<any> = new Subject();

  private updateSongAfterEdit$: Subject<any> = new Subject();

  private updateSongsAfterDelete$: Subject<any> = new Subject();

  private updateSongsAfterAdd$: Subject<any> = new Subject();

  private resetTempAndLastCurrentTime$: Subject<boolean> = new Subject();


  constructor(private http: HttpClient) {
    this.SERVER_URL = environment.SERVER_URL;
    this.SERVER_URL_SOUND = environment.SERVER_URL_SOUND;
  }

  getSelectedTop100Hear() {
    return this.selectedTop100Hear;
  }

  setSelectedTop100Hear(mode) {
    this.selectedTop100Hear = mode;
  }

  resetSelectedTop100Hear() {
    this.selectedTop100Hear = null;
  }

  resetTempAndLastCurrentTime() {
    return this.resetTempAndLastCurrentTime$;
  }

  getSelectedTop100Love() {
    return this.selectedTop100Love;
  }

  setSelectedTop100Love(mode) {
    this.selectedTop100Love = mode;
  }

  resetSelectedTop100Love() {
    this.selectedTop100Love = null;
  }

  getUpdateSongsAfterAdd() {
    return this.updateSongsAfterAdd$;
  }

  getUpdateSongsAfterDelete() {
    return this.updateSongsAfterDelete$;
  }

  getUpdateSongAfterEdit() {
    return this.updateSongAfterEdit$;
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
            comments: cur.comments ? cur.comments : [],
            songcontent: cur.songcontent,
            video: cur.video ? cur.video : null,
            views: cur.views
          };
          acc.push(obj);
          return acc;
        }, []);
        result = result.filter(song => !this.blockedSongsOfUser.includes(song.id));
        return result;
      })
    );
  }

  getTop100FavoriteSongs() {
    return this.http.get(`${this.SERVER_URL}getTop100Love`).pipe(
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
            comments: cur.comments ? cur.comments : [],
            songcontent: cur.songcontent,
            video: cur.video ? cur.video : null,
            views: cur.views
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

  getTop100Hear() {
    return this.http.get(`${this.SERVER_URL}getTop100Hear`).pipe(
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
            comments: cur.comments ? cur.comments : [],
            songcontent: cur.songcontent,
            video: cur.video ? cur.video : null,
            views: cur.views
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
            comments: cur.comments ? cur.comments : [],
            songcontent: cur.songcontent,
            video: cur.video ? cur.video : null,
            views: cur.views
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
          comments: song.comments ? song.comments : [],
          songcontent: song.songcontent,
          video: song.video ? song.video : null,
          views: song.views
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
            comments: cur.comments ? cur.comments : [],
            songcontent: cur.songcontent,
            video: cur.video ? cur.video : null,
            views: cur.views
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
            comments: cur.song.comments ? cur.song.comments : [],
            songcontent: cur.song.songcontent,
            video: cur.song.video ? cur.song.video : null,
            views: cur.song.views
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
            comments: cur.comments ? cur.comments : [],
            songcontent: cur.songcontent,
            video: cur.video ? cur.video : null,
            views: cur.views
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
            comments: cur.comments ? cur.comments : [],
            songcontent: cur.songcontent,
            video: cur.video ? cur.video : null,
            views: cur.views
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
          comments: song.comments ? song.comments : [],
          songcontent: song.songcontent,
          video: song.video ? song.video : null,
          views: song.views
        };
      })
    );
  }

  approveSong(data) {
    return this.http.post(`${this.SERVER_URL}approve-song`, data, {
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
          comments: song.comments ? song.comments : [],
          songcontent: song.songcontent,
          video: song.video ? song.video : null,
          views: song.views
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
          comments: song.comments ? song.comments : [],
          songcontent: song.songcontent,
          video: song.video ? song.video : null,
          views: song.views
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
        comments: song.comments ? song.comments : [],
        songcontent: song.songcontent,
        video: song.video ? song.video : null,
        views: song.views
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
        comments: song.comments ? song.comments : [],
        songcontent: song.songcontent,
        video: song.video ? song.video : null,
        views: song.views
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
        comments: song.comments ? song.comments : [],
        songcontent: song.songcontent,
        video: song.video ? song.video : null,
        views: song.views
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
        comments: song.comments ? song.comments : [],
        songcontent: song.songcontent,
        video: song.video ? song.video : null,
        views: song.views
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
        comments: song.comments ? song.comments : [],
        songcontent: song.songcontent,
        video: song.video ? song.video : null,
        views: song.views
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
        comments: song.comments ? song.comments : [],
        songcontent: song.songcontent,
        video: song.video ? song.video : null,
        views: song.views
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
        comments: song.comments ? song.comments : [],
        songcontent: song.songcontent,
        video: song.video ? song.video : null,
        views: song.views
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
        comments: song.comments ? song.comments : [],
        songcontent: song.songcontent,
        video: song.video ? song.video : null,
        views: song.views
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
        comments: song.comments ? song.comments : [],
        songcontent: song.songcontent,
        video: song.video ? song.video : null,
        views: song.views
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
        comments: song.comments ? song.comments : [],
        songcontent: song.songcontent,
        video: song.video ? song.video : null,
        views: song.views
      }))
    );
  }

  updateViewsOfSong(data) {
    return this.http.post(`${this.SERVER_URL}views`, data).pipe(
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
        comments: song.comments ? song.comments : [],
        songcontent: song.songcontent,
        video: song.video ? song.video : null,
        views: song.views
      }))
    );
  }

}
