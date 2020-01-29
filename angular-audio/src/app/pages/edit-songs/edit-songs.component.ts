import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CategoryService } from 'src/app/services/categories.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { CloudService } from 'src/app/services/cloud.service';
import { AlertifyService } from 'src/app/services/alertify.service';
import { ValidateService } from 'src/app/services/validate.service';
import { MatDialog } from '@angular/material';
import { PopupVideoComponent } from '../manage-songs/popup-video/popup-video.component';
import { PopupEditComponent } from './popup-edit/popup-edit.component';

@Component({
  selector: 'app-edit-songs',
  templateUrl: './edit-songs.component.html',
  styleUrls: ['./edit-songs.component.scss']
})
export class EditSongsComponent implements OnInit, OnDestroy {

  signForm: FormGroup;

  categories: any;

  destroySubscription$: Subject<boolean> = new Subject();

  currentUser: any;

  mySongs: any[];

  typeVideoMusic = ['mp4', 'MP4'];

  filterNameArtist: string;

  constructor(
    private categoryService: CategoryService,
    private authService: AuthService,
    private cloudService: CloudService,
    private alertifyService: AlertifyService,
    private validateService: ValidateService,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.loadSongsByUserId(this.currentUser.id);
    this.cloudService.getUpdateSongAfterEdit().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(song => {
      const index = this.mySongs.findIndex(v => v.id === song.id);
      this.mySongs = [...this.mySongs.filter((v, i) => i < index), { ...song }, ...this.mySongs.filter((v, i) => i > index)];
    });
    // this.categoryService.getCategories().pipe(
    //   takeUntil(this.destroySubscription$)
    // ).subscribe(categories => {
    //   this.categories = categories;
    //   this.initializeForm();
    // });
  }

  ngOnDestroy() {
    this.destroySubscription$.next(true);
  }

  loadSongsByUserId(userId: string) {
    this.cloudService.getSongsByUserId(userId).pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(songs => {
      this.mySongs = songs;
      console.log(this.mySongs);
    });
  }

  onEdit(song: any) {
    this.dialog.open(PopupEditComponent, { data: song });
  }

  onDelete(song: any, index: number) {
    this.cloudService.deleteSong({ id: song.id }).pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(() => {
      this.mySongs = this.mySongs.filter((v, i) => i !== index);
      this.alertifyService.success('Delete successfully');
    });
  }

  isEmpty(data) {
    return this.validateService.isEmpty(data);
  }

  onSeeVideo(data) {
    this.dialog.open(PopupVideoComponent, { data });
  }

}
