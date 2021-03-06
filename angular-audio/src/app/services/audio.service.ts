import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as moment from 'moment';
import { StreamState } from '../interfaces/stream-state';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private stop$ = new Subject();
  private audioObj = new Audio();
  private state: StreamState = {
    playing: false,
    readableCurrentTime: '',
    readableDuration: '',
    duration: undefined,
    currentTime: undefined,
    canplay: false,
    error: false
  };
  private stateChange: BehaviorSubject<StreamState> = new BehaviorSubject(this.state);
  audioEvents = [
    'ended',
    'error',
    'play',
    'playing',
    'pause',
    'timeupdate',
    'canplay',
    'loadedmetadata',
    'loadstart'
  ];
  private playMode = false;
  private playModeSubject$ = new Subject();

  private currentFile: any = {};
  private currentFileSubject$2 = new Subject();
  private currentFileSubject$1 = new Subject();

  private destroyGeneralSubject$: Subject<boolean> = new Subject();

  private volumeSubject$ = new Subject();

  private muteSubject$ = new Subject();

  private loopSubject$ = new Subject();

  private resetCurrentFileSubject$: Subject<any> = new Subject();

  constructor() { }

  getDestroyGeneralSubject$() {
    return this.destroyGeneralSubject$.asObservable();
  }

  triggerDestroyGeneral() {
    this.destroyGeneralSubject$.next(true);
  }

  getLoopSubject() {
    return this.loopSubject$.asObservable();
  }

  updateLoop(mode) {
    this.audioObj.loop = mode;
    this.loopSubject$.next(this.audioObj.loop);
  }

  getMuteSubject() {
    return this.muteSubject$.asObservable();
  }

  updateMute(mode) {
    this.audioObj.muted = mode;
    this.muteSubject$.next(this.audioObj.muted);
  }

  getVolumeSubject() {
    return this.volumeSubject$.asObservable();
  }

  updateVolume(volume) {
    this.audioObj.volume = volume;
    this.volumeSubject$.next(this.audioObj.volume);
  }

  getCurrentFile() {
    return this.currentFile;
  }

  setCurrentFile(file) {
    this.currentFile = { ...file };
  }

  resetCurentFile() {
    this.currentFile = {};
    this.resetCurrentFileSubject$.next(this.currentFile);
  }

  getResetCurrentFileSubject() {
    return this.resetCurrentFileSubject$;
  }

  updateCurrentFile1(file) {
    this.currentFile = { ...file };
    this.currentFileSubject$1.next(this.currentFile);
  }

  updateCurrentFile2(file) {
    this.currentFile = { ...file };
    this.currentFileSubject$2.next(this.currentFile);
  }

  getCurrentFileSubject1() {
    return this.currentFileSubject$1.asObservable();
  }

  getCurrentFileSubject2() {
    return this.currentFileSubject$2.asObservable();
  }

  getPlayModeSubject() {
    return this.playModeSubject$.asObservable();
  }

  updatePlayMode() {
    this.playMode = true;
    this.playModeSubject$.next(this.playMode);
  }

  closePlayMode() {
    this.playMode = false;
    this.playModeSubject$.next(this.playMode);
  }

  getPlayMode() {
    return this.playMode;
  }


  getState(): Observable<StreamState> {
    return this.stateChange.asObservable();
  }

  private updateStateEvents(event: Event): void {
    switch (event.type) {
      case 'canplay':
        this.state.duration = this.audioObj.duration;
        this.state.readableDuration = this.formatTime(this.state.duration);
        this.state.canplay = true;
        break;
      case 'playing':
        this.state.playing = true;
        break;
      case 'pause':
        this.state.playing = false;
        break;
      case 'timeupdate':
        this.state.currentTime = this.audioObj.currentTime;
        this.state.readableCurrentTime = this.formatTime(this.state.currentTime);
        break;
      case 'error':
        this.resetState();
        this.state.error = true;
        break;
    }
    this.stateChange.next(this.state);
  }

  resetState() {
    this.state = {
      playing: false,
      readableCurrentTime: '',
      readableDuration: '',
      duration: undefined,
      currentTime: undefined,
      canplay: false,
      error: false
    };
  }

  private streamObservable(url): any {
    return new Observable(observer => {
      // Play audio
      this.audioObj.src = url;
      this.audioObj.load();
      this.audioObj.play();

      // Get current volume of audio
      this.volumeSubject$.next(this.audioObj.volume);

      // Get current mute mode of audio
      this.muteSubject$.next(this.audioObj.muted);

      // Get current loop mode of audio
      this.loopSubject$.next(this.audioObj.loop);

      const handler = (event: Event) => {
        this.updateStateEvents(event);
        observer.next(event);
      };

      this.addEvents(this.audioObj, this.audioEvents, handler);
      // return unsubscribe function
      return () => {
        // Stop Playing
        this.audioObj.pause();
        this.audioObj.currentTime = 0;
        // remove event listeners
        this.removeEvents(this.audioObj, this.audioEvents, handler);
        // reset state
        this.resetState();
      };
    });
  }

  private addEvents(obj, events, handler) {
    events.forEach(event => {
      obj.addEventListener(event, handler);
    });
  }

  private removeEvents(obj, events, handler) {
    events.forEach(event => {
      obj.removeEventListener(event, handler);
    });
  }

  playStream(url) {
    return this.streamObservable(url).pipe(takeUntil(this.stop$));
  }

  play() {
    this.audioObj.play();
  }

  pause() {
    this.audioObj.pause();
  }

  stop() {
    this.stop$.next();
  }

  seekTo(seconds) {
    this.audioObj.currentTime = seconds;
  }

  formatTime(time: number, format: string = 'HH:mm:ss') {
    const momentTime = time * 1000;
    return moment.utc(momentTime).format(format);
  }
}
