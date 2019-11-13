import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { UploadService } from 'src/app/services/upload.service';
import { CloudService } from 'src/app/services/cloud.service';

@Component({
  selector: 'app-form-upload',
  templateUrl: './form-upload.component.html',
  styleUrls: ['./form-upload.component.css']
})
export class FormUploadComponent implements OnInit {

  signForm: FormGroup;

  selectedFile: any;

  uploadResponse: { status: '', message: '', filePath: '' };

  error: string;

  isUpload: boolean = false;

  constructor(private uploadService: UploadService, private cloudService: CloudService) { }

  ngOnInit() {
    this.signForm = new FormGroup({
      file: new FormControl(null, [Validators.required], [this.isFileInvalid.bind(this)]),
      name: new FormControl(null, [Validators.required]),
      artist: new FormControl(null, [Validators.required])
    });
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
    this.uploadService.uploadSong(formData).subscribe(
      (res: any) => {
        
        this.uploadResponse = res; 
        console.log(this.uploadResponse);
       },
      err => { 
        this.error = err.error;
        this.isUpload = false; 
      },
      () => this.isUpload = false
    );
    //this.signForm.reset();
    this.selectedFile = null;
  }

}
