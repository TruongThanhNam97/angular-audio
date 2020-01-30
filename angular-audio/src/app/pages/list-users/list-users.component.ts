import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlbumService } from 'src/app/services/album.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { CategoryService } from 'src/app/services/categories.service';
import { AuthService } from 'src/app/services/auth.service';
import { AlertifyService } from 'src/app/services/alertify.service';
import { SocketIoService } from 'src/app/services/socket-io.service';

@Component({
  selector: 'app-list-users',
  templateUrl: './list-users.component.html',
  styleUrls: ['./list-users.component.scss']
})
export class ListUsersComponent implements OnInit, OnDestroy {

  destroySubscription$: Subject<boolean> = new Subject();

  listAlbums: any[];

  selectedAlbum: string;

  SERVER_URL_IMAGE: string;

  currentUser: any;

  username: string;

  disableMode = false;

  loading = false;

  constructor(
    private albumService: AlbumService,
    private router: Router,
    private route: ActivatedRoute,
    private categoryService: CategoryService,
    private authService: AuthService,
    private alertify: AlertifyService,
    private socketIo: SocketIoService) {
    this.SERVER_URL_IMAGE = environment.SERVER_URL_IMAGE;
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.getAlbums();
    this.socketIo.getFollwersRealTime().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe((res: any) => {
      const index = this.listAlbums.findIndex(uploader => uploader.id === res.followedUser.id);
      const updatedUser = {
        id: res.followedUser.id,
        username: res.followedUser.username,
        avatar: res.followedUser.avatar ? res.followedUser.avatar : null,
        followers: res.followedUser.followers
      };
      this.listAlbums = [...this.listAlbums.filter((v, i) => i < index), updatedUser, ...this.listAlbums.filter((v, i) => i > index)];
    });
  }

  ngOnDestroy() {
    this.destroySubscription$.next(true);
  }

  getAlbums() {
    this.loading = true;
    this.albumService.getAlbums().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe((albums: any) => {
      this.listAlbums = [...albums];
      this.loading = false;
    }, err => this.loading = false);
  }

  onNavigateToSeeAlbum(album) {
    this.router.navigate([album.id], { relativeTo: this.route, queryParams: { username: album.username } });
  }

  formatNumber(numb): string {
    if (numb >= 1000) {
      return (numb / 1000).toFixed(1) + 'K';
    }
    if (numb >= 1000000) {
      return (numb / 1000000).toFixed(1) + 'M';
    }
    return numb;
  }

  follows(uploader) {
    this.disableMode = true;
    this.authService.followsUser({ id: uploader.id }).pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe((res: any) => {
      this.alertify.success(`${res.message} ${uploader.username} successfully`);
      this.disableMode = false;
    }, err => this.disableMode = false);
  }

  isFollowed(uploader) {
    return uploader.followers.filter(id => id === this.currentUser.id).length > 0;
  }

}
