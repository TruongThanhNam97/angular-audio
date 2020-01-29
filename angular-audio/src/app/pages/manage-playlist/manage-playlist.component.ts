import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { PlayListService } from 'src/app/services/playlist.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material';
import { PopupPlaylistComponent } from './popup-playlist/popup-playlist.component';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-manage-playlist',
  templateUrl: './manage-playlist.component.html',
  styleUrls: ['./manage-playlist.component.scss']
})
export class ManagePlaylistComponent implements OnInit, OnDestroy {

  playLists: any[];
  currentUser: any;
  destroySubscription$: Subject<boolean> = new Subject();
  playlistName: string;

  constructor(
    private authService: AuthService,
    private playListService: PlayListService,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.loadPlayList();
    this.currentUser = this.authService.getCurrentUser();
    this.playListService.getCreatedPlayListSubject().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(playlist => this.playLists = [...this.playLists, { ...playlist }]);
    this.playListService.getUpdatedPlayListSubject().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(playlist => {
      const index = this.playLists.findIndex(item => item._id === playlist._id);
      this.playLists = [...this.playLists.filter((v, i) => i < index), { ...playlist }, ...this.playLists.filter((v, i) => i > index)];
    });
    this.playListService.getDeletedPlayListSubject().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(playlist => {
      this.playLists = this.playLists.filter(item => item._id !== playlist._id);
    });
    this.playListService.getUdatedPlayListAfterAddOrDeleteSongSubject().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(updatedPlaylist => {
      const index = this.playLists.findIndex(item => item._id === updatedPlaylist._id);
      this.playLists =
        [...this.playLists.filter((v, i) => i < index), { ...updatedPlaylist }, ...this.playLists.filter((v, i) => i > index)];
    });
  }

  ngOnDestroy() {
    this.destroySubscription$.next(true);
  }

  loadPlayList() {
    this.playListService.getPlayListByUser().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe((data: any[]) => this.playLists = data);
  }

  onCreatePlayList() {
    this.dialog.open(PopupPlaylistComponent, { data: { mode: 'create' } });
  }

  onDeletePlayList(playList) {
    this.dialog.open(PopupPlaylistComponent, { data: { mode: 'delete', selected: playList } });
  }

  onEditPlayList(playList) {
    this.dialog.open(PopupPlaylistComponent, { data: { mode: 'edit', selected: playList } });
  }

  onNavigateToSeePlayList(playList) {
    this.playListService.setListSongsOfPlayList(playList);
    this.router.navigate([`${playList._id}`],
      {
        relativeTo: this.route,
        queryParams: { playlist: playList.name, displayButtonBack: false }
      });
  }

}
