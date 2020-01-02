import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { CategoryService } from 'src/app/services/categories.service';
import { AlertifyService } from 'src/app/services/alertify.service';

@Component({
  selector: 'app-upload-category',
  templateUrl: './upload-category.component.html',
  styleUrls: ['./upload-category.component.scss']
})
export class UploadCategoryComponent implements OnInit, OnDestroy {

  signForm: FormGroup;

  arrayType = ['jpg', 'JPG', 'png', 'PNG', 'gif', 'GIF', 'tif', 'TIF'];

  destroySubscription$: Subject<boolean> = new Subject();

  constructor(private uploadCategory: CategoryService, private alertify: AlertifyService) { }

  ngOnInit() {
    this.initializeForm();
  }

  ngOnDestroy() {
    this.destroySubscription$.next(true);
  }

  initializeForm() {
    this.signForm = new FormGroup({
      name: new FormControl(null, [Validators.required]),
      avatar: new FormControl(null, [this.validateSelectFile.bind(this)])
    });
  }

  onChange(e) {
    this.signForm.patchValue({
      avatar: e.target.files[0]
    });
    e.target.value = null;
  }

  validateSelectFile(control: FormControl): { [key: string]: boolean } {
    if (control.value) {
      const lastIndex = control.value.name.lastIndexOf('.');
      const fileType = control.value.name.slice(lastIndex + 1);
      return this.arrayType.includes(fileType) ? null : { invalid: true };
    }
  }

  onSubmit() {
    const formData = new FormData();
    formData.append('name', this.signForm.value.name);
    formData.append('avatar', this.signForm.value.avatar);
    this.uploadCategory.upload(formData).subscribe(
      _ => this.alertify.success('Upload successfully'),
      _ => this.alertify.error('Failed'),
      () => this.signForm.reset()
    );
  }

}
