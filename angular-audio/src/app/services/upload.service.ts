import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { CloudService } from './cloud.service';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  SERVER_URL = 'http://localhost:3000/';
  SERVER_URL_SOUND = 'http://localhost:3000/watermark-songs/';

  constructor(private http: HttpClient, private cloudService: CloudService) { }

  uploadSong(data) {
    return this.http
      .post(this.SERVER_URL + 'upload', data, {
        reportProgress: true,
        observe: 'events'
      })
      .pipe(
        map((event: any) => {
          switch (event.type) {
            case HttpEventType.UploadProgress: {
              const progress = Math.round((100 * event.loaded) / event.total);
              return { status: 'progress', message: progress };
            }
            case HttpEventType.Response: {
              this.cloudService.addSongToLocalSongs({
                url: this.SERVER_URL_SOUND + event.body.song.url,
                name: event.body.song.name,
                artist: event.body.song.artist
              });
              return event.body;
            }
            default:
              return `Unhandeled event : ${event.type}`;
          }
        })
      );
  }
}
