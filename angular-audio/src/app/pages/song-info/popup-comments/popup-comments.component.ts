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
import { SocketIoService } from 'src/app/services/socket-io.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-popup-comments',
  templateUrl: './popup-comments.component.html',
  styleUrls: ['./popup-comments.component.scss']
})
export class PopupCommentsComponent implements OnInit, OnDestroy {

  signForm: FormGroup;
  editForm: FormGroup;
  replyForm: FormGroup;
  editReplyForm: FormGroup;
  SERVER_URL_IMAGE: string;
  destroySubscription$: Subject<boolean> = new Subject();
  currentUser: any;
  indexToEdit = -1;
  editMode = false;
  indextoReply = -1;
  replyMode = false;
  indexToEditReply = -1;
  editReplyMode = false;
  sortMode = false;
  filterBy = 'Latest comment';

  constructor(
    public dialogRef: MatDialogRef<PopupCommentsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private cloudService: CloudService,
    private authService: AuthService,
    private alertify: AlertifyService,
    public dialog: MatDialog,
    private socketIo: SocketIoService,
    private router: Router) {
    this.SERVER_URL_IMAGE = environment.SERVER_URL_IMAGE;
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.socketIo.getCommentsRealTime().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe((song: any) => {
      if (song.id === this.data.id && !this.editMode && !this.replyMode && !this.editReplyMode) {
        this.data = { ...song };
        if (this.filterBy === 'Featured comment') {
          this.sortFeaturedComment();
        } else {
          this.sortLatestComment();
        }
      }
    });
    this.initializeForm();
    this.initializeEditForm();
    this.initializeReplyForm();
    this.initializeEditReplyForm();
  }

  ngOnDestroy() {
    this.destroySubscription$.next(true);
  }

  onDeleteComment(comment) {
    comment.songId = this.data.id;
    this.dialog.open(PopupConfirmDeleteComponent, { data: comment });
  }

  onEditComment(comment, index) {
    this.indexToEdit = index;
    this.editMode = true;
    this.replyMode = false;
    this.editForm.patchValue({
      text: comment.text,
      commentId: comment._id
    });
  }

  isMyComment(comment) {
    if (this.currentUser) {
      return this.currentUser.id === comment.user._id;
    }
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

  formatNumberOfComments(comments): string {
    let result = comments.length;
    comments.forEach(comment => {
      result += comment.subComments.length;
    });
    if (result >= 1000) {
      return (result / 1000).toFixed(1) + 'K';
    }
    if (result >= 1000000) {
      return (result / 1000000).toFixed(1) + 'M';
    }
    return result;
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

  initializeReplyForm() {
    this.replyForm = new FormGroup({
      songId: new FormControl(this.data.id, [Validators.required]),
      text: new FormControl(null, [Validators.required]),
      commentId: new FormControl(null, [Validators.required])
    });
  }
  initializeEditReplyForm() {
    this.editReplyForm = new FormGroup({
      songId: new FormControl(this.data.id, [Validators.required]),
      commentId: new FormControl(null, [Validators.required]),
      subCommentId: new FormControl(null, [Validators.required]),
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
      this.signForm.get('text').reset();
      this.alertify.success('Add comment successfully');
      this.resetAll();
    });
  }

  onEditSubmit() {
    if (this.editForm.valid) {
      this.cloudService.editComment(this.editForm.value).pipe(
        takeUntil(this.destroySubscription$)
      ).subscribe(song => {
        this.cloudService.setSelectedSong(song);
        this.resetAll();
        this.alertify.success('Edit comment successfully');
        this.data = { ...song };
      });
    }
  }

  onCancel() {
    this.indexToEdit = -1;
    this.editMode = false;
    this.indexToEditReply = -1;
    this.editReplyMode = false;
  }

  onLikeComment(comment) {
    this.cloudService.likeComment({ songId: this.data.id, commentId: comment._id }).pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(song => {
      this.cloudService.setSelectedSong(song);
      // this.socketIo.sendCommentRealTime();
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
      // this.socketIo.sendCommentRealTime();
    }, err => {
      if (err.error.message) {
        this.alertify.error(err.error.message);
      }
    });
  }

  isReactedComment(listId: string[]): boolean {
    if (this.currentUser) {
      return listId.filter(id => id === this.currentUser.id).length > 0;
    }
  }

  onDisplayReplyInputField(comment, index) {
    this.replyForm.get('text').reset();
    this.indextoReply = index;
    this.replyMode = true;
    this.editMode = false;
    this.editReplyMode = false;
    this.replyForm.patchValue({
      commentId: comment._id
    });
  }

  onReply() {
    if (this.replyForm.valid) {
      this.cloudService.addSubComment(this.replyForm.value).pipe(
        takeUntil(this.destroySubscription$)
      ).subscribe(song => {
        this.cloudService.setSelectedSong(song);
        this.resetAll();
        this.alertify.success('Reply comment successfully');
        this.data = { ...song };
      });
      this.replyForm.get('text').reset();
    }
  }

  onEditReplySubmit() {
    if (this.editReplyForm.valid) {
      this.cloudService.editSubComment(this.editReplyForm.value).pipe(
        takeUntil(this.destroySubscription$)
      ).subscribe(song => {
        this.cloudService.setSelectedSong(song);
        this.resetAll();
        this.alertify.success('Edit reply successfully');
        this.data = { ...song };
      });
    }
  }

  onLikeReplyComment(subComment, comment) {
    this.cloudService.likeSubComment({ songId: this.data.id, commentId: comment._id, subCommentId: subComment._id }).pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(song => {
      this.cloudService.setSelectedSong(song);
      // this.socketIo.sendCommentRealTime();
    }, err => {
      if (err.error.message) {
        this.alertify.error(err.error.message);
      }
    });
  }

  onUnlikeSubComment(subComment, comment) {
    this.cloudService.unlikeSubComment({ songId: this.data.id, commentId: comment._id, subCommentId: subComment._id }).pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(song => {
      this.cloudService.setSelectedSong(song);
      // this.socketIo.sendCommentRealTime();
    }, err => {
      if (err.error.message) {
        this.alertify.error(err.error.message);
      }
    });
  }

  onDeleteSubComment(subComment, comment) {
    subComment.songId = this.data.id;
    subComment.commentId = comment._id;
    this.dialog.open(PopupConfirmDeleteComponent, { data: subComment });
  }

  onEditSubComment(subComment, comment, subIndex, index) {
    this.indexToEditReply = subIndex;
    this.indexToEdit = index;
    this.editReplyMode = true;
    this.editMode = false;
    this.replyMode = false;
    this.editReplyForm.patchValue({
      text: subComment.text,
      commentId: comment._id,
      subCommentId: subComment._id
    });
  }

  sortFeaturedComment() {
    const result = this.data.comments.sort((a, b) => b.liked.length - a.liked.length);
    this.data = { ...this.data, comments: result };
    this.sortMode = false;
    this.filterBy = 'Featured comment';
    this.resetAll();
  }

  sortLatestComment() {
    const result = this.data.comments.sort((a, b) => {
      const date1 = new Date(a.date);
      const date2 = new Date(b.date);
      return date2.getTime() - date1.getTime();
    });
    this.data = { ...this.data, comments: result };
    this.sortMode = false;
    this.filterBy = 'Latest comment';
    this.resetAll();
  }

  openPopupSort() {
    this.sortMode = !this.sortMode;
  }

  resetAll() {
    this.indexToEdit = -1;
    this.editMode = false;
    this.indextoReply = -1;
    this.replyMode = false;
    this.indexToEditReply = -1;
    this.editReplyMode = false;
  }

  onNavigateToUserAlbum(comment) {
    this.router.navigate(['/albums', comment.user._id], { queryParams: { username: comment.user.username } });
    this.dialogRef.close();
  }

}
