import { Component, OnInit } from '@angular/core';
import { AudioService } from 'src/app/services/audio.service';
import { CloudService } from 'src/app/services/cloud.service';
import { StreamState } from '../../interfaces/stream-state';

@Component({
  selector: 'app-media-footer',
  templateUrl: './media-footer.component.html',
  styleUrls: ['./media-footer.component.scss']
})
export class MediaFooterComponent implements OnInit {
  state: StreamState;
  currentFile: any = {};
  files: any;
  volume = 1;
  mute = false;
  previousVolume: number;
  loop = false;
  randomMode = false;

  constructor(private audioService: AudioService, private cloudService: CloudService) { }

  ngOnInit() {
    this.files = this.cloudService.getCurrentPlayList();
    this.cloudService.getCurrentPlayListSubject().subscribe(files => this.files = [...files]);
    this.currentFile = this.audioService.getCurrentFile();
    this.audioService.getCurrentFileSubject1().subscribe(
      (file: any) => this.currentFile = { ...file }
    );
    this.audioService.getState().subscribe(state => {
      this.state = state;
      if (this.state.readableCurrentTime === this.state.readableDuration
        && this.state.readableCurrentTime !== '' && this.state.readableDuration !== '') {
        if (this.randomMode) {
          this.random();
        } else if (!this.loop) {
          this.next();
        }
      }
    });
    this.audioService.getVolumeSubject().subscribe((volume: number) => this.volume = volume);
    this.audioService.getMuteSubject().subscribe((mute: boolean) => this.mute = mute);
    this.audioService.getLoopSubject().subscribe((loop: boolean) => this.loop = loop);
  }

  pause() {
    this.audioService.pause();
  }

  play() {
    this.audioService.play();
  }
  stop() {
    this.audioService.stop();
  }

  next() {
    const index = this.currentFile.index + 1;
    if (index <= this.files.length - 1) {
      const file = this.files[index];
      this.audioService.updateCurrentFile2({ index, file });
    }
  }
  previous() {
    const index = this.currentFile.index - 1;
    const file = this.files[index];
    this.audioService.updateCurrentFile2({ index, file });
  }

  random() {
    const index = this.getRandomIndex(this.files.length);
    const file = this.files[index];
    this.audioService.updateCurrentFile2({ index, file });
  }

  getRandomIndex(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  isFirstPlaying() {
    return this.currentFile.index === 0;
  }

  isLastPlaying() {
    if (this.files) {
      return this.currentFile.index === this.files.length - 1;
    }
  }
  onSliderChangeEnd(change) {
    this.audioService.seekTo(change.value);
  }

  onVolumeChange(change) {
    if (change.value === 0) {
      this.audioService.updateMute(true);
    } else if (change.value !== 0 && this.mute === true) {
      this.audioService.updateMute(false);
    }
    this.audioService.updateVolume(change.value);
  }

  onChangeMuteMode() {
    const muteModeAfterChange = !this.mute;
    if (muteModeAfterChange) {
      this.previousVolume = this.volume;
      this.audioService.updateVolume(0);
    } else {
      this.audioService.updateVolume(this.previousVolume);
    }
    this.audioService.updateMute(!this.mute);
  }

  onChangeLoopMode() {
    this.randomMode = false;
    this.audioService.updateLoop(!this.loop);
  }

  onChangeRandomMode() {
    this.audioService.updateLoop(false);
    this.randomMode = !this.randomMode;
  }

}
