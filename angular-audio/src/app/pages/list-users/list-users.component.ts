import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlbumService } from 'src/app/services/album.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { CategoryService } from 'src/app/services/categories.service';

@Component({
  selector: 'app-list-users',
  templateUrl: './list-users.component.html',
  styleUrls: ['./list-users.component.scss']
})
export class ListUsersComponent implements OnInit, OnDestroy {

  destroySubscription$: Subject<boolean> = new Subject();

  listAlbums: any;

  selectedAlbum: string;

  SERVER_URL_IMAGE: string;

  constructor(
    private albumService: AlbumService,
    private router: Router,
    private route: ActivatedRoute,
    private categoryService: CategoryService) {
    this.SERVER_URL_IMAGE = environment.SERVER_URL_IMAGE;
  }

  ngOnInit() {
    this.getAlbums();
  }

  ngOnDestroy() {
    this.destroySubscription$.next(true);
  }

  getAlbums() {
    this.albumService.getAlbums().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe((albums: any) => this.listAlbums = [...albums]);
  }

  onNavigateToSeeAlbum(album) {
    this.router.navigate([album._id], { relativeTo: this.route, queryParams: { username: album.username } });
  }

}
