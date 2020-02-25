import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CloudService } from './cloud.service';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs';
import { retry } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private SERVER_URL: string;
  private SERVER_URL_SOUND: string;

  private queueProcessing = 0;
  private queueProcessingSubject$: Subject<number> = new Subject();

  private chooseFileMode = true;
  private chooseFileModeSubject$: Subject<boolean> = new Subject();


  constructor(private http: HttpClient, private cloudService: CloudService) {
    this.SERVER_URL = environment.SERVER_URL;
    this.SERVER_URL_SOUND = environment.SERVER_URL_SOUND;
  }

  getChooseFileMode() {
    return this.chooseFileMode;
  }

  getChooseFileModeSubject() {
    return this.chooseFileModeSubject$;
  }

  setChooseFileMode(mode) {
    this.chooseFileMode = mode;
    this.chooseFileModeSubject$.next(this.chooseFileMode);
  }

  uploadSong(data) {
    return this.http.post(`${this.SERVER_URL}songs/upload`, data, { headers: { Authorization: localStorage.getItem('jwtToken') } }).pipe(
      retry(0)
    );
  }

  readSong(data) {
    return this.http.post(`${this.SERVER_URL}songs/readWatermark`, data,
      { headers: { Authorization: localStorage.getItem('jwtToken') } }).pipe(
        retry(0)
      );
  }

  getQueueProcessingSubject() {
    return this.queueProcessingSubject$.asObservable();
  }

  addQueueProcessing() {
    this.queueProcessing++;
    this.queueProcessingSubject$.next(this.queueProcessing);
  }

  setAllQueueProcessing(numberOfSongs) {
    this.queueProcessing = numberOfSongs;
    this.queueProcessingSubject$.next(this.queueProcessing);
  }

  minusQueueProcessing() {
    this.queueProcessing -= 5;
    this.queueProcessingSubject$.next(this.queueProcessing);
  }

  resetProcessing() {
    this.queueProcessing = 0;
    this.queueProcessingSubject$.next(this.queueProcessing);
  }

}
