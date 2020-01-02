import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CategoryService } from 'src/app/services/categories.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AlertifyService } from 'src/app/services/alertify.service';

@Component({
  selector: 'app-edit-category',
  templateUrl: './edit-category.component.html',
  styleUrls: ['./edit-category.component.scss']
})
export class EditCategoryComponent implements OnInit, OnDestroy {

  signForm: FormGroup;

  arrayType = ['jpg', 'JPG', 'png', 'PNG', 'gif', 'GIF', 'tif', 'TIF'];

  destroySubscription$: Subject<boolean> = new Subject();

  categories: any[];

  constructor(private categoryService: CategoryService, private alertifyService: AlertifyService) { }

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getCategories().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe((categories: any) => {
      this.categories = categories;
      this.initializeForm();
    }, _ => { });
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

  onEdit(category) {
    this.signForm.patchValue({
      id: category.id,
      name: category.name
    });
  }

  onDelete(categoryId, index) {
    this.signForm.reset();
    this.categoryService.deleteCategory({ id: categoryId }).pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(_ => { }, err => console.log(err), () => {
      this.categories = this.categories.filter((v, i) => i !== index);
      this.alertifyService.success('Delete successfully');
    });
  }

  onSubmit() {
    const formData = new FormData();
    formData.append('id', this.signForm.value.id);
    formData.append('name', this.signForm.value.name);
    if (this.signForm.value.avatar) {
      formData.append('file', this.signForm.value.avatar);
    }
    this.categoryService.updateCategory(formData).pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(res => {
      const index = this.categories.findIndex(category => category.id === res.id);
      this.categories = [...this.categories.filter((v, i) => i < index), { ...res }, ...this.categories.filter((v, i) => i > index)];
      this.alertifyService.success('Update successfully');
    }, err => console.log(err));
    this.signForm.reset();
  }

}
