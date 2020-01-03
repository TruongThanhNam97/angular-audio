import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CategoryService } from 'src/app/services/categories.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { CloudService } from 'src/app/services/cloud.service';
import { AlertifyService } from 'src/app/services/alertify.service';

@Component({
  selector: 'app-edit-songs',
  templateUrl: './edit-songs.component.html',
  styleUrls: ['./edit-songs.component.scss']
})
export class EditSongsComponent implements OnInit, OnDestroy {

  signForm: FormGroup;

  typeFileMusic = ['mp3', 'MP3', 'wav', 'WAV'];

  categories: any;

  destroySubscription$: Subject<boolean> = new Subject();

  currentUser: any;

  mySongs: any[];

  constructor(
    private categoryService: CategoryService,
    private authService: AuthService,
    private cloudService: CloudService,
    private alertifyService: AlertifyService) { }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    console.log(this.currentUser);
    this.loadSongsByUserId(this.currentUser.id);
    this.categoryService.getCategories().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(categories => {
      this.categories = categories;
      console.log(this.categories);
      this.initializeForm();
    });
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

  initializeForm() {
    this.signForm = new FormGroup({
      id: new FormControl(null, [Validators.required]),
      name: new FormControl(null, [Validators.required, Validators.maxLength(50)]),
      artist: new FormControl(null, [Validators.required, Validators.maxLength(50)]),
      categoryId: new FormControl(null, [Validators.required])
    });
  }

  onEdit(song: any) {
    this.signForm.patchValue({
      id: song.id,
      name: song.name,
      artist: song.artist,
      categoryId: song.categoryId
    });
  }

  onDelete(song: any, index: number) {
    this.cloudService.deleteSong({ id: song.id }).pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(() => {
      this.mySongs = this.mySongs.filter((v, i) => i !== index);
      this.alertifyService.success('Delete successfully');
    });
  }

  onSubmit() {
    this.cloudService.updateSong(this.signForm.value).pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(song => {
      const index = this.mySongs.findIndex(v => v.id === song.id);
      this.mySongs = [...this.mySongs.filter((v, i) => i < index), { ...song }, ...this.mySongs.filter((v, i) => i > index)];
      this.alertifyService.success('Update successfully');
      this.signForm.reset();
    });
  }

}
