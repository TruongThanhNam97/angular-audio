import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { CategoryService } from 'src/app/services/categories.service';
import { takeUntil } from 'rxjs/operators';
import { AlertifyService } from 'src/app/services/alertify.service';

@Component({
  selector: 'app-popup-edit-category',
  templateUrl: './popup-edit-category.component.html',
  styleUrls: ['./popup-edit-category.component.scss']
})
export class PopupEditCategoryComponent implements OnInit, OnDestroy {

  signForm: FormGroup;

  arrayType = ['jpg', 'JPG', 'png', 'PNG', 'gif', 'GIF', 'tif', 'TIF'];

  destroySubscription$: Subject<boolean> = new Subject();

  disableMode = false;

  loading = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<PopupEditCategoryComponent>,
    private categoryService: CategoryService,
    private alertifyService: AlertifyService
  ) { }

  ngOnInit() {
    this.initializeForm();
    this.signForm.patchValue({
      id: this.data.id,
      name: this.data.name
    });
  }

  ngOnDestroy() {
    this.destroySubscription$.next(true);
  }

  onChange(e) {
    this.signForm.patchValue({
      avatar: e.target.files[0]
    });
    e.target.value = null;
  }

  initializeForm() {
    this.signForm = new FormGroup({
      id: new FormControl(null, [Validators.required]),
      name: new FormControl(null, [Validators.required]),
      avatar: new FormControl(null, [this.validateSelectFile.bind(this)])
    });
  }

  validateSelectFile(control: FormControl): { [key: string]: boolean } {
    if (control.value) {
      const lastIndex = control.value.name.lastIndexOf('.');
      const fileType = control.value.name.slice(lastIndex + 1);
      return this.arrayType.includes(fileType) ? null : { invalid: true };
    }
  }

  onSubmit() {
    this.loading = true;
    this.signForm.disable();
    this.disableMode = true;
    const formData = new FormData();
    formData.append('id', this.signForm.value.id);
    formData.append('name', this.signForm.value.name);
    if (this.signForm.value.avatar) {
      formData.append('file', this.signForm.value.avatar);
    }
    this.categoryService.updateCategory(formData).pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(res => {
      this.categoryService.getUpdateCategoryAfterEdit().next(res);
      this.alertifyService.success('Update successfully');
      this.signForm.enable();
      this.signForm.reset();
      this.disableMode = false;
      this.dialogRef.close();
      this.loading = false;
    }, err => {
      this.signForm.enable();
      this.disableMode = false;
      this.loading = false;
    });
  }

}
