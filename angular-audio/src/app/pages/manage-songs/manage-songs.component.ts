import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { CategoryService } from 'src/app/services/categories.service';
import { AuthService } from 'src/app/services/auth.service';
import { CloudService } from 'src/app/services/cloud.service';
import { AlertifyService } from 'src/app/services/alertify.service';
import { takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material';
import { PopupEditSongComponent } from './popup-edit-song/popup-edit-song.component';
import { AudioService } from 'src/app/services/audio.service';
import { AlbumService } from 'src/app/services/album.service';
import { DownloadService } from 'src/app/services/download.service';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-manage-songs',
  templateUrl: './manage-songs.component.html',
  styleUrls: ['./manage-songs.component.scss']
})
export class ManageSongsComponent implements OnInit, OnDestroy {

  signForm: FormGroup;

  categories: any[];

  destroySubscription$: Subject<boolean> = new Subject();

  currentUser: any;

  mySongs: any[];

  username: string = null;

  selectedAlbum: string;

  selectedCategory: string;

  currentFile: any = {};

  categoryName: string = null;

  constructor(
    private categoryService: CategoryService,
    private authService: AuthService,
    private cloudService: CloudService,
    private alertifyService: AlertifyService,
    public dialog: MatDialog,
    private audioService: AudioService,
    private album: AlbumService,
    private download: DownloadService) { }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.loadAllSongs(this.currentUser.id);
    this.categoryService.getCategories().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(categories => {
      this.categories = categories;
    });
    this.cloudService.getUpdatedSongSubject().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(updatedSong => {
      const index = this.mySongs.findIndex(v => v.id === updatedSong.id);
      this.mySongs = [...this.mySongs.filter((v, i) => i < index), { ...updatedSong }, ...this.mySongs.filter((v, i) => i > index)];
      this.alertifyService.success('Update successfully');
    });
  }

  ngOnDestroy() {
    this.destroySubscription$.next(true);
  }

  setUpAudio() {
    this.audioService.triggerDestroyGeneral();
    this.selectedAlbum = this.album.getSelectedAlbum();
    this.selectedCategory = this.categoryService.getSelectedCategory();

    this.currentFile = this.audioService.getCurrentFile();
    if (this.audioService.getPlayMode() && ((this.username !== this.selectedAlbum) || (this.categoryName !== this.selectedCategory))) {
      this.currentFile = {};
    }
    this.audioService.getCurrentFileSubject2().pipe(takeUntil(this.audioService.getDestroyGeneralSubject$())).subscribe((v: any) => {
      this.openFile(v.file, v.index);
    });
  }

  getCategoryNameById(categoryId) {
    if (this.categories) {
      return this.categories.find(category => category.id === categoryId).name;
    }
  }

  loadAllSongs(userId: string) {
    this.cloudService.getAllSongs().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(songs => {
      this.mySongs = songs;
      this.setUpAudio();
      this.cloudService.setCurrentPlayList(this.mySongs);
    });
  }

  onEdit(song: any) {
    this.dialog.open(PopupEditSongComponent, { data: { song, categories: this.categories } });
  }

  onDelete(song: any, index: number) {
    this.cloudService.deleteSong({ id: song.id }).pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(() => {
      this.mySongs = this.mySongs.filter((v, i) => i !== index);
      this.alertifyService.success('Delete successfully');
    });
  }

  openFile(file, index) {
    this.audioService.updatePlayMode();
    if (this.username && this.selectedAlbum === this.username || this.categoryName && this.selectedCategory === this.categoryName) {
      this.currentFile = { index, file };
    }
    this.audioService.updateCurrentFile1({ index, file });
    this.audioService.stop();
    this.audioService.playStream(file.url).subscribe();
  }

  update() {
    if (this.username) {
      this.categoryService.resetSelectedCategory();
      this.album.setSelectedAlbum(this.username);
      this.selectedAlbum = this.username;
    }
    if (this.categoryName) {
      this.album.resetSelectedAlbum();
      this.categoryService.setSelectedCategory(this.categoryName);
      this.selectedCategory = this.categoryName;
    }
    this.cloudService.updateCurrentPlayList();
  }

  downloadFile(data) {
    this.download.downloadFile(data.nameToDownload).subscribe(blob => {
      saveAs(blob, `${data.name}-${data.artist}.wav`);
    }, err => console.log(err));
  }

}
