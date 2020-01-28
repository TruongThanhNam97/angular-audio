import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CategoryService } from 'src/app/services/categories.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AlertifyService } from 'src/app/services/alertify.service';
import { MatDialog } from '@angular/material';
import { PopupEditCategoryComponent } from './popup-edit-category/popup-edit-category.component';

@Component({
  selector: 'app-edit-category',
  templateUrl: './edit-category.component.html',
  styleUrls: ['./edit-category.component.scss']
})
export class EditCategoryComponent implements OnInit, OnDestroy {

  destroySubscription$: Subject<boolean> = new Subject();

  categories: any[];

  constructor(
    private categoryService: CategoryService,
    private alertifyService: AlertifyService,
    public dialog: MatDialog) { }

  ngOnInit() {
    this.loadCategories();
    this.categoryService.getUpdateCategoryAfterEdit().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(res => {
      const index = this.categories.findIndex(category => category.id === res.id);
      this.categories = [...this.categories.filter((v, i) => i < index), { ...res }, ...this.categories.filter((v, i) => i > index)];
    });
  }

  loadCategories() {
    this.categoryService.getCategories().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe((categories: any) => {
      this.categories = categories;
    }, _ => { });
  }

  ngOnDestroy() {
    this.destroySubscription$.next(true);
  }

  onEdit(category) {
    this.dialog.open(PopupEditCategoryComponent, { data: category });
  }

  onDelete(categoryId, index) {
    this.categoryService.deleteCategory({ id: categoryId }).pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(_ => { }, err => console.log(err), () => {
      this.categories = this.categories.filter((v, i) => i !== index);
      this.alertifyService.success('Delete successfully');
    });
  }

}
