import { Component, OnInit, OnDestroy } from '@angular/core';
import { CategoryService } from 'src/app/services/categories.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit, OnDestroy {

  destroySubscription$: Subject<boolean> = new Subject();

  categories: any;

  categoryName: string;

  loading = false;

  constructor(
    private categoriesService: CategoryService,
    private router: Router,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.loadCategories();
  }

  ngOnDestroy() {
    this.destroySubscription$.next(true);
  }

  loadCategories() {
    this.loading = true;
    this.categoriesService.getCategories().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(categories => {
      this.categories = [...categories];
      this.loading = false;
    }, err => this.loading = false);
  }

  onNavigateToSeeCategory(category) {
    this.router.navigate([category.id], { relativeTo: this.route, queryParams: { categoryName: category.name } });
  }

}
