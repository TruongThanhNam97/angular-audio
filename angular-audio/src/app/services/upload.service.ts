import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { CloudService } from './cloud.service';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private SERVER_URL: string;
  private SERVER_URL_SOUND: string;

  private queueProcessing = 0;
  private queueProcessingSubject$: Subject<number> = new Subject();

  constructor(private http: HttpClient, private cloudService: CloudService) {
    this.SERVER_URL = environment.SERVER_URL;
    this.SERVER_URL_SOUND = environment.SERVER_URL_SOUND;
  }

  uploadSong(data) {
    return this.http.post(`${this.SERVER_URL}upload`, data, { headers: { Authorization: localStorage.getItem('jwtToken') } });
  }

  getQueueProcessingSubject() {
    return this.queueProcessingSubject$.asObservable();
  }

  addQueueProcessing() {
    this.queueProcessing++;
    this.queueProcessingSubject$.next(this.queueProcessing);
  }

  minusQueueProcessing() {
    this.queueProcessing--;
    this.queueProcessingSubject$.next(this.queueProcessing);
  }

}
