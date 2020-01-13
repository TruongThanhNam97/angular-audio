import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlbumService } from 'src/app/services/album.service';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { CloudService } from 'src/app/services/cloud.service';
import { AlertifyService } from 'src/app/services/alertify.service';

@Component({
  selector: 'app-manage-user',
  templateUrl: './manage-user.component.html',
  styleUrls: ['./manage-user.component.scss']
})
export class ManageUserComponent implements OnInit, OnDestroy {

  destroySubscription$: Subject<boolean> = new Subject();

  users: any[];

  songs: any[];

  uploadedSongs: any;

  constructor(
    private albumService: AlbumService,
    private cloudService: CloudService,
    private alertify: AlertifyService) { }

  ngOnInit() {
    this.loadAllSongs();
  }

  ngOnDestroy() {
    this.destroySubscription$.next(true);
  }

  loadAllUsers() {
    this.albumService.getAllUsers().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(users => {
      this.users = users;
    });
  }

  loadAllSongs() {
    this.cloudService.getAllSongs().pipe(
      tap((songs: any[]) => this.caculateNumberOfUploadedSongs(songs)),
      takeUntil(this.destroySubscription$)
    ).subscribe(songs => {
      this.songs = songs;
      this.loadAllUsers();
    });
  }

  caculateNumberOfUploadedSongs(songs: any[]) {
    this.uploadedSongs = {};
    const map = new Map();
    songs.forEach(song => {
      if (!map.has(song.userId)) {
        map.set(song.userId, '');
        this.uploadedSongs[song.userId] = 1;
      } else {
        this.uploadedSongs[song.userId]++;
      }
    });
  }

  countUploadedSong(userId: string): number {
    return this.uploadedSongs[userId] ? this.uploadedSongs[userId] : 0;
  }

  onUnban(user) {
    this.albumService.unbanUser({ id: user.id }).pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(
      (updatedUser: any) => {
        const index = this.users.findIndex(item => item.id === updatedUser.id);
        this.users = [...this.users.filter((v, i) => i < index), { ...updatedUser }, ...this.users.filter((v, i) => i > index)];
        this.alertify.success('Unban successfully');
      },
      err => console.log(err)
    );
  }

  onBan(user) {
    this.albumService.banUser({ id: user.id }).pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(
      (updatedUser: any) => {
        const index = this.users.findIndex(item => item.id === updatedUser.id);
        this.users = [...this.users.filter((v, i) => i < index), { ...updatedUser }, ...this.users.filter((v, i) => i > index)];
        this.alertify.success('Ban successfully');
      },
      err => console.log(err)
    );
  }

}
