import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { ArtistsService } from 'src/app/services/artists.service';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-artists',
  templateUrl: './artists.component.html',
  styleUrls: ['./artists.component.scss']
})
export class ArtistsComponent implements OnInit, OnDestroy {

  destroySubscription$: Subject<boolean> = new Subject();

  artists: any;

  artistName: string;

  loading = false;

  constructor(
    private artistsService: ArtistsService,
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
    this.artistsService.getArtists().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(artists => {
      this.artists = [...artists];
      this.loading = false;
    }, err => this.loading = false);
  }

  onNavigateToSeeArtist(artist) {
    this.router.navigate([artist.id], { relativeTo: this.route, queryParams: { artistName: artist.name } });
  }

}
