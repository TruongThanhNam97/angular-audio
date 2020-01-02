import { Component, OnInit, OnDestroy } from '@angular/core';
import { CategoryService } from 'src/app/services/categories.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit, OnDestroy {

  destroySubscription$: Subject<boolean> = new Subject();

  categories: any;

  constructor(private categoriesService: CategoryService) { }

  ngOnInit() {
    this.loadCategories();
  }

  ngOnDestroy() {
    this.destroySubscription$.next(true);
  }

  loadCategories() {
    this.categoriesService.getCategories().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(categories => this.categories = [...categories]);
  }

}
