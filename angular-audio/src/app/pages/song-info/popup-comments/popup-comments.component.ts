import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { CloudService } from 'src/app/services/cloud.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { AlertifyService } from 'src/app/services/alertify.service';

@Component({
  selector: 'app-popup-comments',
  templateUrl: './popup-comments.component.html',
  styleUrls: ['./popup-comments.component.scss']
})
export class PopupCommentsComponent implements OnInit, OnDestroy {

  signForm: FormGroup;
  SERVER_URL_IMAGE: string;
  destroySubscription$: Subject<boolean> = new Subject();
  currentUser: any;

  constructor(
    public dialogRef: MatDialogRef<PopupCommentsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private cloudService: CloudService,
    private authService: AuthService,
    private alertify: AlertifyService) {
    this.SERVER_URL_IMAGE = environment.SERVER_URL_IMAGE;
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    console.log(this.currentUser);
    this.initializeForm();
    console.log(this.data);
  }

  ngOnDestroy() {
    this.destroySubscription$.next(true);
  }

  onDeleteComment(comment) {
    this.alertify.confirm('Do u want to delete this comment?', () => {
      this.cloudService.deleteComment({ songId: this.data.id, commentId: comment._id }).pipe(
        takeUntil(this.destroySubscription$)
      ).subscribe(song => {
        this.cloudService.setSelectedSong(song);
        this.data = { ...song };
        this.cloudService.getUpdateSongAfterAddCommentSubject().next(song);
        this.alertify.success('Delete comment successfully');
      });
    });
  }

  isMyComment(comment) {
    return this.currentUser.id === comment.user._id;
  }

  formatComments(comments): string {
    if (comments >= 1000) {
      return (comments / 1000).toFixed(1) + 'K';
    }
    if (comments >= 1000000) {
      return (comments / 1000000).toFixed(1) + 'M';
    }
    return comments;
  }

  initializeForm() {
    this.signForm = new FormGroup({
      songId: new FormControl(this.data.id, [Validators.required]),
      text: new FormControl(null, [Validators.required])
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
      this.data = { ...song };
      this.cloudService.getUpdateSongAfterAddCommentSubject().next(song);
      this.signForm.get('text').reset();
      this.alertify.success('Add comment successfully');
    });
  }

}
