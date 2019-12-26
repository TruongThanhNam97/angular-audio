import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable, of, Subject, throwError } from 'rxjs';
import { UploadService } from 'src/app/services/upload.service';
import { AlertifyService } from 'src/app/services/alertify.service';
import { CloudService } from 'src/app/services/cloud.service';

@Component({
  selector: 'app-form-upload',
  templateUrl: './form-upload.component.html',
  styleUrls: ['./form-upload.component.css']
})
export class FormUploadComponent implements OnInit, OnDestroy {

  signForm: FormGroup;

  selectedFile: any;

  uploadResponse: { status: '', message: '', filePath: '' };

  error: string;

  isUpload = false;

  destroyDescription$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private uploadService: UploadService,
    private alertify: AlertifyService,
    private cloudService: CloudService
  ) { }

  ngOnInit() {
    this.initForm();
  }

  ngOnDestroy() {
    this.destroyDescription$.next(true);
  }

  initForm() {
    this.signForm = new FormGroup({
      file: new FormControl(null, [Validators.required], [this.isFileInvalid.bind(this)])
    });
  }

  disableFieldOfForm() {
    this.signForm.get('file').disable();
  }

  enableFieldOfForm() {
    this.signForm.get('file').enable();
  }

  onSelectFile(e) {
    this.selectedFile = [];
    this.selectedFile = e.target.files;
  }

  isFileInvalid(control: FormControl): Observable<{ [s: string]: boolean }> {
    if (control) {
      if (!['wav', 'mp3'].includes(control.value.split('.')[1].toLowerCase())) {
        return of({ isFileInvalid: true });
      }
      return of(null);
    }
  }

  onSubmit() {
    this.isUpload = true;
    this.disableFieldOfForm();
    let temp = 0;
    const selectedFileLength = this.selectedFile.length;
    for (let i = 0; i < selectedFileLength; i++) {
      const formData = new FormData();
      formData.append('file', this.selectedFile[i]);
      this.uploadService.uploadSong(formData).subscribe(
        (res) => {
          // Here to catch data from server
          this.uploadResponse = res;
          if (this.uploadResponse['song']) {
            const songName = this.uploadResponse['song'].name;
            this.alertify.success(`Song name: ${songName} has been processed`);
          }
        },
        err => {
          // Here to catch error from server
          temp++;
          this.error = err.error.error;
          if (temp === selectedFileLength) {
            this.isUpload = false;
            this.enableFieldOfForm();
            this.signForm.reset();
          }
          this.alertify.error(this.error);
        },
        () => {
          this.cloudService.allowGetSongs = false;
          temp++;
          console.log(temp);
          if (temp === selectedFileLength) {
            this.isUpload = false;
            this.enableFieldOfForm();
            this.signForm.reset();
          }
        }
      );
    }
    this.selectedFile = null;
  }

  formatSize(size: number): number {
    return Math.round(size);
  }

}
