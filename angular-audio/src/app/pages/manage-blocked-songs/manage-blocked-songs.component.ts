import { Component, OnInit, OnDestroy } from '@angular/core';
import { CloudService } from 'src/app/services/cloud.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AlertifyService } from 'src/app/services/alertify.service';

@Component({
  selector: 'app-manage-blocked-songs',
  templateUrl: './manage-blocked-songs.component.html',
  styleUrls: ['./manage-blocked-songs.component.scss']
})
export class ManageBlockedSongsComponent implements OnInit, OnDestroy {

  destroySubscriptions$: Subject<boolean> = new Subject();

  blockedSongs: any[];

  filterNameArtist: string;

  loading = false;

  disableMode = false;

  constructor(private cloudService: CloudService, private alertify: AlertifyService) { }

  ngOnInit() {
    this.loadBlockedSongs();
  }

  loadBlockedSongs() {
    this.loading = true;
    this.cloudService.getBlockedSongs().pipe(
      takeUntil(this.destroySubscriptions$)
    ).subscribe((blockedSongs: any[]) => {
      this.blockedSongs = [...blockedSongs];
      this.loading = false;
    }, err => this.loading = false);
  }

  ngOnDestroy() {
    this.destroySubscriptions$.next(true);
  }

  onUnblock(song) {
    this.disableMode = true;
    this.cloudService.blockSong({ id: song.id }).pipe(
      takeUntil(this.destroySubscriptions$)
    ).subscribe(blockedSongs => {
      this.cloudService.setBlockedSongsOfUser(blockedSongs);
      this.cloudService.getBlockedSongsAfterBlockSubject().next(blockedSongs);
      this.blockedSongs = this.blockedSongs.filter(item => item.id !== song.id);
      this.alertify.success('Unblock successfully');
      this.disableMode = false;
    }, err => this.disableMode = false);
  }

}
