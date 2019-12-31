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

  constructor(private http: HttpClient) {
    this.SERVER_URL = environment.SERVER_URL;
    this.SERVER_URL_SOUND = environment.SERVER_URL_SOUND;
  }

  getSongs(id: string) {
    return this.http.get(this.SERVER_URL + 'getSongs', { params: { id } }).pipe(
      map((files: any) => {
        const result = files.reduce((acc, cur) => {
          const obj = {
            url: this.SERVER_URL_SOUND + cur.url,
            name: cur.name,
            artist: cur.artist,
            nameToDownload: cur.url,
            userId: cur.userId,
            userName: cur.userName
          };
          acc.push(obj);
          return acc;
        }, []);
        return result;
      }),
      tap(files => {
        this.allowGetSongs = false;
        this.currentPlayList = [...files];
        this.currentPlayListSubject$.next(this.currentPlayList);
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


}
