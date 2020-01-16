import { Component, OnInit, OnDestroy } from '@angular/core';
import { AudioService } from 'src/app/services/audio.service';
import { CloudService } from 'src/app/services/cloud.service';
import { StreamState } from '../../interfaces/stream-state';
import { MatDialog, MatBottomSheet } from '@angular/material';
import { PopupComponent } from '../player/popup/popup.component';
import { PlaylistPlayingComponent } from './playlist-playing/playlist-playing.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PlayListService } from 'src/app/services/playlist.service';
import { SongInfoService } from 'src/app/services/song-info.service';

@Component({
  selector: 'app-media-footer',
  templateUrl: './media-footer.component.html',
  styleUrls: ['./media-footer.component.scss']
})
export class MediaFooterComponent implements OnInit, OnDestroy {
  state: StreamState;
  currentFile: any = {};
  files: any[];
  volume = 1;
  mute = false;
  previousVolume: number;
  loop = false;
  randomMode = false;

  destroySubscription$: Subject<boolean> = new Subject();

  constructor(
    private audioService: AudioService,
    private cloudService: CloudService,
    private dialog: MatDialog,
    private bottomSheet: MatBottomSheet,
    private playlistService: PlayListService,
    private songInfoService: SongInfoService
  ) { }

  ngOnInit() {
    this.files = this.cloudService.getCurrentPlayList();
    this.cloudService.getCurrentPlayListSubject().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(files => this.files = [...files]);
    this.currentFile = this.audioService.getCurrentFile();
    this.audioService.getResetCurrentFileSubject().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(currentFile => this.currentFile = currentFile);
    this.audioService.getCurrentFileSubject1().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(
      (file: any) => this.currentFile = { ...file }
    );
    this.audioService.getState().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(state => {
      this.state = state;
      if (this.state.readableCurrentTime === this.state.readableDuration
        && this.state.readableCurrentTime !== '' && this.state.readableDuration !== '') {
        if (this.randomMode) {
          this.random();
        } else if (!this.loop && this.currentFile.index !== this.files.length - 1) {
          this.next();
        } else if (!this.loop && this.currentFile.index === this.files.length - 1) {
          this.audioService.resetState();
          this.songInfoService.getModeSubject().next('displayBtnPlay');
        }
      }
    });
    this.audioService.getVolumeSubject().pipe(takeUntil(this.destroySubscription$)).subscribe((volume: number) => this.volume = volume);
    this.audioService.getMuteSubject().pipe(takeUntil(this.destroySubscription$)).subscribe((mute: boolean) => this.mute = mute);
    this.audioService.getLoopSubject().pipe(takeUntil(this.destroySubscription$)).subscribe((loop: boolean) => this.loop = loop);
    this.cloudService.getUpdatedSongsAfterLikingSubject()
      .pipe(takeUntil(this.destroySubscription$)).subscribe(files => this.files = [...files]);
    this.cloudService.getBlockedSongsAfterBlockSubject().pipe(takeUntil(this.destroySubscription$)).subscribe(blockedSong => {
      this.files = this.files.filter(song => song.id !== blockedSong.id);
      const newIndex = this.files.findIndex(file => file.id === this.currentFile.file.id);
      if (blockedSong.id === this.currentFile.file.id) {
        const nextIndex = this.currentFile.index;
        const preIndex = this.currentFile.index - 1;
        if (this.files[nextIndex]) {
          this.next1();
        } else if (this.files[preIndex]) {
          this.previous1();
        } else {
          this.audioService.resetCurentFile();
          this.audioService.closePlayMode();
          this.audioService.stop();
        }
      } else if (newIndex !== this.currentFile.index) {
        this.audioService.getResetCurrentFileSubject().next({ index: newIndex, file: this.currentFile.file });
        this.audioService.setCurrentFile({ index: newIndex, file: this.currentFile.file });
      }
    });
    this.playlistService.getListSongsAfterDeleteFromPlayListSubject().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(data => {
      this.files = this.files.filter(song => song.id !== data.songId);
      const newIndex = this.files.findIndex(file => file.id === this.currentFile.file.id);
      if (data.songId === this.currentFile.file.id) {
        const nextIndex = this.currentFile.index;
        const preIndex = this.currentFile.index - 1;
        if (this.files[nextIndex]) {
          this.next1();
        } else if (this.files[preIndex]) {
          this.previous1();
        } else {
          this.audioService.resetCurentFile();
          this.audioService.closePlayMode();
          this.audioService.stop();
        }
      } else if (newIndex !== this.currentFile.index) {
        this.audioService.getResetCurrentFileSubject().next({ index: newIndex, file: this.currentFile.file });
        this.audioService.setCurrentFile({ index: newIndex, file: this.currentFile.file });
      }
    });
    this.cloudService.getUpdateSongAfterManipulatingSubject().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(updatedSong => {
      if (this.files.filter(song => song.id === updatedSong.id).length > 0) {
        const index = this.files.findIndex(song => song.id === updatedSong.id);
        this.files = [...this.files.filter((v, i) => i < index), { ...updatedSong }, ...this.files.filter((v, i) => i > index)];
      }
      if (this.currentFile.file && this.currentFile.file.id === updatedSong.id) {
        this.currentFile = { ...this.currentFile, file: updatedSong };
      }
    });
    this.cloudService.getUpdateSongAfterAddCommentSubject().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(updatedSong => {
      if (this.files.filter(song => song.id === updatedSong.id).length > 0) {
        const index = this.files.findIndex(song => song.id === updatedSong.id);
        this.files = [...this.files.filter((v, i) => i < index), { ...updatedSong }, ...this.files.filter((v, i) => i > index)];
      }
      if (this.currentFile.file && this.currentFile.file.id === updatedSong.id) {
        this.currentFile = { ...this.currentFile, file: updatedSong };
      }
    });
  }

  ngOnDestroy() {
    this.destroySubscription$.next(true);
  }

  pause() {
    this.audioService.pause();
    this.cloudService.getUpdateSongAfterManipulatingSubject().next({ ...this.currentFile.file, displayBtn: 'displayBtnPlay' });
    this.songInfoService.setStatusAudio('pause');
  }

  play() {
    this.audioService.play();
    this.cloudService.getUpdateSongAfterManipulatingSubject().next({ ...this.currentFile.file, displayBtn: 'displayBtnPause' });
    this.songInfoService.setStatusAudio('play');
  }

  stop() {
    this.audioService.stop();
  }

  next() {
    this.songInfoService.getModeSubject().next('displayBtnPlay');
    const index = this.currentFile.index + 1;
    if (index <= this.files.length - 1) {
      const file = this.files[index];
      this.audioService.updateCurrentFile2({ index, file });
      this.cloudService.getUpdateSongAfterManipulatingSubject().next({ ...file, displayBtn: 'displayBtnPause' });
    }
  }

  next1() {
    this.songInfoService.getModeSubject().next('displayBtnPlay');
    const index = this.currentFile.index;
    if (index <= this.files.length - 1) {
      const file = this.files[index];
      this.audioService.updateCurrentFile2({ index, file });
      this.cloudService.getUpdateSongAfterManipulatingSubject().next({ ...file, displayBtn: 'displayBtnPause' });
    }
  }

  previous() {
    this.songInfoService.getModeSubject().next('displayBtnPlay');
    const index = this.currentFile.index - 1;
    const file = this.files[index];
    if (file) {
      this.audioService.updateCurrentFile2({ index, file });
      this.cloudService.getUpdateSongAfterManipulatingSubject().next({ ...file, displayBtn: 'displayBtnPause' });
    }
  }

  previous1() {
    this.songInfoService.getModeSubject().next('displayBtnPlay');
    const index = this.currentFile.index - 1;
    const file = this.files[index];
    if (file) {
      this.audioService.updateCurrentFile2({ index, file });
      this.cloudService.getUpdateSongAfterManipulatingSubject().next({ ...file, displayBtn: 'displayBtnPause' });
    }
  }

  random() {
    this.songInfoService.getModeSubject().next('displayBtnPlay');
    const index = this.getRandomIndex(this.files.length);
    const file = this.files[index];
    this.audioService.updateCurrentFile2({ index, file });
    this.cloudService.getUpdateSongAfterManipulatingSubject().next({ ...file, displayBtn: 'displayBtnPause' });
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

  onViewMore() {
    this.dialog.open(PopupComponent, { data: this.currentFile.file });
  }

  onOpenPlaylist() {
    this.bottomSheet.open(PlaylistPlayingComponent, { data: this.files });
  }

}
