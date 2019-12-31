import { Component, OnInit, OnDestroy } from '@angular/core';
import { AudioService } from '../../services/audio.service';
import { CloudService } from '../../services/cloud.service';
import { StreamState } from '../../interfaces/stream-state';
import { Subject } from 'rxjs';
import { MatDialog } from '@angular/material';
import { PopupComponent } from './popup/popup.component';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { AlbumService } from 'src/app/services/album.service';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit, OnDestroy {
  files: any;
  state: StreamState;
  currentFile: any = {};
  destroySubscription$: Subject<boolean> = new Subject();
  loading = false;
  username: string;

  constructor(
    private audioService: AudioService,
    private cloudService: CloudService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private album: AlbumService
  ) { }

  ngOnInit() {
    this.route.params.subscribe(param => this.loadSongsFromDb(param.id));
    this.route.queryParams.subscribe(param => this.username = param.username);
    this.currentFile = this.audioService.getCurrentFile();
    if (this.audioService.getPlayMode() && this.username !== this.album.getSelectedAlbum()) {
      this.currentFile = {};
    }
    this.audioService.getCurrentFileSubject2().subscribe((v: any) => {
      this.openFile(v.file, v.index);
    });
  }

  loadSongsFromDb(id: string): void {
    this.loading = true;
    this.cloudService.getSongs(id).pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(files => {
      this.files = files;
    }, err => { }, () => this.loading = false);
  }

  ngOnDestroy() {
    this.destroySubscription$.next(true);
  }

  openFile(file, index) {
    this.audioService.updatePlayMode();
    this.currentFile = { index, file };
    this.audioService.updateCurrentFile1({ index, file });
    this.audioService.stop();
    this.audioService.playStream(file.url).subscribe();
    this.album.setSelectAlbum(this.username);
  }

  openDialog(file: any): void {
    this.dialog.open(PopupComponent, { data: file });
  }
}
