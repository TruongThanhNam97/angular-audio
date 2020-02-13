import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { CategoryService } from 'src/app/services/categories.service';
import { AlertifyService } from 'src/app/services/alertify.service';
import { takeUntil } from 'rxjs/operators';
import { ValidateService } from 'src/app/services/validate.service';

@Component({
  selector: 'app-upload-category',
  templateUrl: './upload-category.component.html',
  styleUrls: ['./upload-category.component.scss']
})
export class UploadCategoryComponent implements OnInit, OnDestroy {

  signForm: FormGroup;

  arrayType = ['jpg', 'JPG', 'png', 'PNG', 'jpeg', 'JPEG', 'webp', 'WEBP'];

  controlCharacters = /[!@#$%^&*()_+\=\[\]{};':"\\|,<>\/?]+/;

  destroySubscription$: Subject<boolean> = new Subject();

  disableMode = false;

  constructor(
    private uploadCategory: CategoryService,
    private alertify: AlertifyService,
    private validateService: ValidateService) { }

  ngOnInit() {
    this.initializeForm();
  }

  ngOnDestroy() {
    this.destroySubscription$.next(true);
  }

  initializeForm() {
    this.signForm = new FormGroup({
      name: new FormControl(null, [Validators.required]),
      avatar: new FormControl(null, [
        this.validateSelectFile.bind(this),
        this.validateControlCharacters.bind(this),
        this.validateFileNameLength.bind(this),
        this.validateNumberOfExtensions.bind(this)
      ])
    });
  }

  onChange(event) {
    const file = event.target.files[0];
    this.validateService.validateFileBySignature(file, 'image').pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(result => {
      if (result) {
        this.signForm.patchValue({
          avatar: file
        });
      } else {
        this.signForm.patchValue({
          avatar: null
        });
      }
    });
    event.target.value = null;
  }

  validateSelectFile(control: FormControl): { [key: string]: boolean } {
    if (control.value) {
      const lastIndex = control.value.name.lastIndexOf('.');
      const fileType = control.value.name.slice(lastIndex + 1);
      return this.arrayType.includes(fileType) ? null : { invalid: true };
    }
  }

  validateNumberOfExtensions(control: FormControl): { [key: string]: boolean } {
    if (control.value) {
      return control.value.name.split('.').length === 2 ? null : { numberExtensions: true };
    }
  }

  validateFileNameLength(control: FormControl): { [key: string]: boolean } {
    if (control.value) {
      return control.value.name.length <= 150 ? null : { fileNameLength: true };
    }
  }

  validateControlCharacters(control: FormControl): { [key: string]: boolean } {
    if (control.value) {
      return !this.controlCharacters.test(control.value.name) ? null : { controlCharacters: true };
    }
  }

  onSubmit() {
    this.signForm.disable();
    this.disableMode = true;
    const formData = new FormData();
    formData.append('name', this.signForm.value.name);
    formData.append('avatar', this.signForm.value.avatar);
    this.uploadCategory.upload(formData).pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(
      _ => {
        this.alertify.success('Upload successfully');
        this.disableMode = false;
        this.signForm.enable();
      },
      err => {
        if (err.error.name) {
          this.alertify.error(err.error.name);
        }
        this.disableMode = false;
        this.signForm.enable();
      },
      () => this.signForm.reset()
    );
  }

}
