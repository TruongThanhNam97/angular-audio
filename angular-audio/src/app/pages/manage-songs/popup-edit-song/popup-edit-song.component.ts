import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CloudService } from 'src/app/services/cloud.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-popup-edit-song',
  templateUrl: './popup-edit-song.component.html',
  styleUrls: ['./popup-edit-song.component.scss']
})
export class PopupEditSongComponent implements OnInit, OnDestroy {

  signForm: FormGroup;

  destroySubscription$: Subject<boolean> = new Subject();

  loading = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private cloudService: CloudService,
    public dialogRef: MatDialogRef<PopupEditSongComponent>) { }

  ngOnInit() {
    this.initializeForm();
    this.signForm.patchValue({
      id: this.data.song.id,
      name: this.data.song.name,
      artist: this.data.song.artist,
      categoryId: this.data.song.categoryId,
      artistId: this.data.song.artistId,
      detail: this.data.song.songcontent.detail.trim()
    });
  }

  ngOnDestroy() {
    this.destroySubscription$.next(true);
  }

  initializeForm() {
    this.signForm = new FormGroup({
      id: new FormControl(null, [Validators.required]),
      name: new FormControl(null, [Validators.required, Validators.maxLength(50)]),
      artist: new FormControl(null, [Validators.required, Validators.maxLength(50)]),
      categoryId: new FormControl(null, [Validators.required]),
      artistId: new FormControl(null, [Validators.required]),
      detail: new FormControl('')
    });
  }

  onSubmit() {
    this.loading = true;
    this.signForm.value.detail = this.signForm.value.detail.trim();
    this.cloudService.updateSong(this.signForm.value).pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(song => {
      this.cloudService.setUpdatedSong(song);
      this.dialogRef.close();
      this.loading = false;
    }, _ => this.loading = false);
  }

}
