import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { CloudService } from 'src/app/services/cloud.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { AlertifyService } from 'src/app/services/alertify.service';
import { PopupConfirmDeleteComponent } from '../popup-confirm-delete/popup-confirm-delete.component';

@Component({
  selector: 'app-popup-comments',
  templateUrl: './popup-comments.component.html',
  styleUrls: ['./popup-comments.component.scss']
})
export class PopupCommentsComponent implements OnInit, OnDestroy {

  signForm: FormGroup;
  editForm: FormGroup;
  SERVER_URL_IMAGE: string;
  destroySubscription$: Subject<boolean> = new Subject();
  currentUser: any;
  indexToEdit = -1;
  editMode = false;

  constructor(
    public dialogRef: MatDialogRef<PopupCommentsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private cloudService: CloudService,
    private authService: AuthService,
    private alertify: AlertifyService,
    public dialog: MatDialog) {
    this.SERVER_URL_IMAGE = environment.SERVER_URL_IMAGE;
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.cloudService.getUpdateSongAfterAddCommentSubject().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(song => this.data = { ...song });
    this.initializeForm();
    this.initializeEditForm();
  }

  ngOnDestroy() {
    this.destroySubscription$.next(true);
  }

  onDeleteComment(comment) {
    // this.alertify.confirm('Do you want to delete this comment?', () => {
    //   this.cloudService.deleteComment({ songId: this.data.id, commentId: comment._id }).pipe(
    //     takeUntil(this.destroySubscription$)
    //   ).subscribe(song => {
    //     this.cloudService.setSelectedSong(song);
    //     this.cloudService.getUpdateSongAfterAddCommentSubject().next(song);
    //     this.alertify.success('Delete comment successfully');
    //   });
    // });
    comment.songId = this.data.id;
    this.dialog.open(PopupConfirmDeleteComponent, { data: comment });
  }

  onEditComment(comment, index) {
    this.indexToEdit = index;
    this.editMode = true;
    this.editForm.patchValue({
      text: comment.text,
      commentId: comment._id
    });
  }

  isMyComment(comment) {
    return this.currentUser.id === comment.user._id;
  }

  formatNumber(number): string {
    if (number >= 1000) {
      return (number / 1000).toFixed(1) + 'K';
    }
    if (number >= 1000000) {
      return (number / 1000000).toFixed(1) + 'M';
    }
    return number;
  }

  initializeForm() {
    this.signForm = new FormGroup({
      songId: new FormControl(this.data.id, [Validators.required]),
      text: new FormControl(null, [Validators.required])
    });
  }

  initializeEditForm() {
    this.editForm = new FormGroup({
      songId: new FormControl(this.data.id, [Validators.required]),
      text: new FormControl(null, [Validators.required]),
      commentId: new FormControl(null, [Validators.required])
    });
  }

  onClose() {
    this.dialogRef.close();
  }

  onSubmit() {
    this.cloudService.addComment(this.signForm.value).pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(song => {
      this.cloudService.setSelectedSong(song);
      // this.data = { ...song };
      this.cloudService.getUpdateSongAfterAddCommentSubject().next(song);
      this.signForm.get('text').reset();
      this.alertify.success('Add comment successfully');
    });
  }

  onEditSubmit() {
    if (this.editForm.valid) {
      this.cloudService.editComment(this.editForm.value).pipe(
        takeUntil(this.destroySubscription$)
      ).subscribe(song => {
        this.cloudService.setSelectedSong(song);
        // this.data = { ...song };
        this.cloudService.getUpdateSongAfterAddCommentSubject().next(song);
        this.editForm.reset();
        this.onCancel();
        this.alertify.success('Edit comment successfully');
      });
    }
  }

  onCancel() {
    this.indexToEdit = -1;
    this.editMode = false;
  }

  onLikeComment(comment) {
    this.cloudService.likeComment({ songId: this.data.id, commentId: comment._id }).pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(song => {
      this.cloudService.setSelectedSong(song);
      // this.data = { ...song };
      this.cloudService.getUpdateSongAfterAddCommentSubject().next(song);
    }, err => {
      if (err.error.message) {
        this.alertify.error(err.error.message);
      }
    });
  }

  onUnlikeComment(comment) {
    this.cloudService.unlikeComment({ songId: this.data.id, commentId: comment._id }).pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(song => {
      this.cloudService.setSelectedSong(song);
      // this.data = { ...song };
      this.cloudService.getUpdateSongAfterAddCommentSubject().next(song);
    }, err => {
      if (err.error.message) {
        this.alertify.error(err.error.message);
      }
    });
  }

  isReactedComment(listId: string[]): boolean {
    return listId.filter(id => id === this.currentUser.id).length > 0;
  }

}
