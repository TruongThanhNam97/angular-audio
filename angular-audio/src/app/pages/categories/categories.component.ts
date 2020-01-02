import { Component, OnInit, OnDestroy } from '@angular/core';
import { CategoryService } from 'src/app/services/categories.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { AlbumService } from 'src/app/services/album.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit, OnDestroy {

  destroySubscription$: Subject<boolean> = new Subject();

  categories: any;

  selectedCategory: string;

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
    this.categoriesService.getCategories().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(categories => this.categories = [...categories]);
  }

  onNavigateToSeeCategory(category) {
    this.router.navigate([category.id], { relativeTo: this.route, queryParams: { categoryName: category.name } });
  }

}
