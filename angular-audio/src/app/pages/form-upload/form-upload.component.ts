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

  signForm : FormGroup;

  selectedFile : any;

  uploadResponse : { status : '', message : '', filePath : '' };

  error : string;

  constructor(private uploadService : UploadService,private cloudService : CloudService) { }

  ngOnInit() {
    this.signForm = new FormGroup({
      name : new FormControl(null,[Validators.required]),
      artist : new FormControl(null,[Validators.required]),
      file : new FormControl(null,[Validators.required],[this.isFileInvalid.bind(this)])
    });
  }

  onSelectFile(e) {
    this.selectedFile = e.target.files[0];
  }

  isFileInvalid(control : FormControl) : Observable<{ [s:string] : boolean }> {
    if ( control ) {
      if ( control.value.split('.')[1].toLowerCase() !== 'mp3' ) {
        return of({isFileInvalid : true});
      }
      return of(null);
    }
  }

  onSubmit() {
    const formData = new FormData();
    formData.append('file',this.selectedFile);
    formData.append('artist',this.signForm.get('artist').value);
    formData.append('name',this.signForm.get('name').value);
    this.uploadService.uploadSong(formData).subscribe(
      (res:any) => {this.uploadResponse = res;console.log(this.uploadResponse);  },
      err => this.error = err
    );
    //this.signForm.reset();
    this.selectedFile = null;
  }

}
