import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { CloudService } from './cloud.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private SERVER_URL: string;
  private SERVER_URL_SOUND: string;

  constructor(private http: HttpClient, private cloudService: CloudService) {
    this.SERVER_URL = environment.SERVER_URL;
    this.SERVER_URL_SOUND = environment.SERVER_URL_SOUND;
  }

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
              return event.body;
            }
            default:
              return `Unhandeled event : ${event.type}`;
          }
        })
      );
  }
}
