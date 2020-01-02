import { Component, OnInit, Inject, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { StreamState } from 'src/app/interfaces/stream-state';
import { Subject } from 'rxjs';
import { AudioService } from 'src/app/services/audio.service';
import { MatDialog, MAT_BOTTOM_SHEET_DATA } from '@angular/material';
import { AlbumService } from 'src/app/services/album.service';
import { CategoryService } from 'src/app/services/categories.service';
import { PopupComponent } from '../../player/popup/popup.component';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-playlist-playing',
  templateUrl: './playlist-playing.component.html',
  styleUrls: ['./playlist-playing.component.scss']
})
export class PlaylistPlayingComponent implements OnInit, OnDestroy {

  files: any;
  state: StreamState;
  currentFile: any = {};
  destroySubscription$: Subject<boolean> = new Subject();
  loading = false;
  username: string;
  id: string;
  categoryName: string;

  test = 0;

  constructor(
    private audioService: AudioService,
    public dialog: MatDialog,
    private album: AlbumService,
    private categoryService: CategoryService,
    private cdt: ChangeDetectorRef,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any
  ) { }

  ngOnInit() {
    this.files = [...this.data];
    this.currentFile = this.audioService.getCurrentFile();
    this.audioService.getCurrentFileSubject2().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe((v: any) => {
      this.currentFile = { index: v.index, file: v.file };
      this.cdt.detectChanges();
    });
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
  }

  openDialog(file: any): void {
    this.dialog.open(PopupComponent, { data: file });
  }

}
