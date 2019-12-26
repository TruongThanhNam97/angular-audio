import { Component, OnInit, OnDestroy } from '@angular/core';
import { AudioService } from '../../services/audio.service';
import { CloudService } from '../../services/cloud.service';
import { StreamState } from '../../interfaces/stream-state';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {
  files: any;
  state: StreamState;
  currentFile: any = {};
  destroy$ = new Subject();
  loading = false;

  constructor(
    private audioService: AudioService,
    private cloudService: CloudService
  ) { }

  ngOnInit() {
    if (this.cloudService.getStateToAllowGetSongs()) {
      // get media files
      this.loading = true;
      this.cloudService.getSongs().subscribe(files => {
        this.files = files;
      }, err => { }, () => this.loading = false);
    } else {
      this.files = this.cloudService.getLocalSongs();
    }

    this.cloudService.getLocalSongsSubjects$().subscribe(v => (this.files = v));

    this.currentFile = this.audioService.getCurrentFile();

    this.audioService.getCurrentFileSubject2().subscribe((v: any) => {
      this.openFile(v.file, v.index);
    });
  }

  openFile(file, index) {
    this.audioService.updatePlayMode();
    // this.playMode = true;
    this.currentFile = { index, file };
    this.audioService.updateCurrentFile1({ index, file });

    this.audioService.stop();
    // this.playStream(file.url);
    this.audioService.playStream(file.url).subscribe();
  }
}
