import { Injectable } from '@angular/core';
import { of, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CloudService {
  private SERVER_URL: string;
  private SERVER_URL_SOUND: string;

  private localSongs: any = [];

  private localSongsSubject$ = new Subject();

  allowGetSongs = true;

  constructor(private http: HttpClient) {
    this.SERVER_URL = environment.SERVER_URL;
    this.SERVER_URL_SOUND = environment.SERVER_URL_SOUND;
  }

  getSongs() {
    return this.http.get(this.SERVER_URL + 'getSongs').pipe(
      map((v: any) => {
        const result = v.reduce((acc, cur) => {
          const obj = {
            url: this.SERVER_URL_SOUND + cur.url,
            name: cur.name,
            artist: cur.artist,
            nameToDownload: cur.url
          };
          acc.push(obj);
          return acc;
        }, []);
        return result;
      }),
      tap(v => {
        this.allowGetSongs = false;
        this.localSongs = v;
      })
    );
  }

  getLocalSongsSubjects$() {
    return this.localSongsSubject$.asObservable();
  }

  getStateToAllowGetSongs() {
    return this.allowGetSongs;
  }

  addSongToLocalSongs(song: any) {
    this.localSongs = [...this.localSongs, song];
    this.localSongsSubject$.next(this.localSongs);
  }

  getLocalSongs() {
    return this.localSongs;
  }


}
