import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable, of, Subject, throwError } from 'rxjs';
import { UploadService } from 'src/app/services/upload.service';
import { CloudService } from 'src/app/services/cloud.service';
import { takeUntil } from 'rxjs/operators';
import { AlertifyService } from 'src/app/services/alertify.service';
import { ERROR_COMPONENT_TYPE } from '@angular/compiler';

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
    private cloudService: CloudService,
    private alertify: AlertifyService
  ) { }

  ngOnInit() {
    this.initForm();
  }

  ngOnDestroy() {
    this.destroyDescription$.next(true);
  }

  initForm() {
    this.signForm = new FormGroup({
      file: new FormControl(null, [Validators.required], [this.isFileInvalid.bind(this)]),
      name: new FormControl(null, [Validators.required]),
      artist: new FormControl(null, [Validators.required])
    });
  }

  disableFieldOfForm() {
    this.signForm.get('name').disable();
    this.signForm.get('artist').disable();
    this.signForm.get('file').disable();
  }

  enableFieldOfForm() {
    this.signForm.get('name').enable();
    this.signForm.get('artist').enable();
    this.signForm.get('file').enable();
  }

  onSelectFile(e) {
    this.selectedFile = e.target.files[0];
    let file_name = this.selectedFile.name.split('.')[0];
    let meta_array = file_name.split('-', 2);
    this.signForm.patchValue({
      artist: meta_array[0],
      name: meta_array[1]
    });
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
    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('artist', this.signForm.get('artist').value);
    formData.append('name', this.signForm.get('name').value);
    this.isUpload = true;
    this.disableFieldOfForm();
    this.uploadService.uploadSong(formData).pipe(
      takeUntil(this.destroyDescription$)
    ).subscribe(
      (res) => {
        // Here to catch data from server
        this.uploadResponse = res;
        
        this.isUpload = false;
        this.enableFieldOfForm();
        this.signForm.reset();

        
        if (res.status == "progress")
          {}
        else if ( res.status == "error" )
          this.alertify.error(res.message)
        else if ( res.status == "ok" )
          this.alertify.success('Your song has been processed');
          
      },
      err => {
        // Here to catch error from server
        this.error = err.error;
        this.isUpload = false;
        this.enableFieldOfForm();
        this.signForm.reset();
        this.alertify.error('Error');
      },
    );
  }

}
