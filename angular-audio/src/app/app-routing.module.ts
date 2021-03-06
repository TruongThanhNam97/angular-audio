import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PlayerComponent } from './pages/player/player.component';
import { FormUploadComponent } from './pages/form-upload/form-upload.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { AuthGuard } from './services/auth-guard.service';
import { LoginComponent } from './pages/login/login.component';
import { LoginGuard } from './services/login-guard.service';
import { RegisterComponent } from './pages/register/register.component';
import { ListUsersComponent } from './pages/list-users/list-users.component';
import { UploadCategoryComponent } from './pages/upload-category/upload-category.component';
import { CategoriesComponent } from './pages/categories/categories.component';
import { EditCategoryComponent } from './pages/edit-category/edit-category.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { EditProfileComponent } from './pages/edit-profile/edit-profile.component';
import { EditSongsComponent } from './pages/edit-songs/edit-songs.component';
import { ManageCategoriesComponent } from './pages/manage-categories/manage-categories.component';
import { ManageSongsComponent } from './pages/manage-songs/manage-songs.component';
import { ManageUserComponent } from './pages/manage-user/manage-user.component';
import { ManageArtistComponent } from './pages/manage-artist/manage-artist.component';
import { UploadArtistComponent } from './pages/upload-artist/upload-artist.component';
import { EditArtistComponent } from './pages/edit-artist/edit-artist.component';
import { ArtistsComponent } from './pages/artists/artists.component';
import { ManageBlockedSongsComponent } from './pages/manage-blocked-songs/manage-blocked-songs.component';
import { ManagePlaylistComponent } from './pages/manage-playlist/manage-playlist.component';
import { SongInfoComponent } from './pages/song-info/song-info.component';
import { Top100Component } from './pages/top100/top100.component';
import { ReadSongComponent } from './pages/read-song/read-song.component';

const routes: Routes = [
  { path: '', redirectTo: '/categories', pathMatch: 'full' },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      { path: 'edit-profile', component: EditProfileComponent },
      { path: 'upload-song', component: FormUploadComponent },
      { path: 'edit-song', component: EditSongsComponent },
      { path: 'my-songs/:id', component: PlayerComponent },
      { path: 'my-favorite-songs/:id', component: PlayerComponent },
      { path: 'blocked-songs', component: ManageBlockedSongsComponent },
      { path: 'manage-playlist', component: ManagePlaylistComponent },
      { path: 'manage-playlist/:id', component: PlayerComponent },
    ]
  },
  { path: 'albums', component: ListUsersComponent },
  { path: 'albums/:id', component: PlayerComponent },
  {
    path: 'manage-categories',
    component: ManageCategoriesComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      { path: 'upload-category', component: UploadCategoryComponent },
      { path: 'edit-category', component: EditCategoryComponent },
    ]
  },
  {
    path: 'manage-artists',
    component: ManageArtistComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      { path: 'upload-artist', component: UploadArtistComponent },
      { path: 'edit-artist', component: EditArtistComponent },
    ]
  },
  {
    path: 'manage-songs',
    component: ManageSongsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'manage-user',
    component: ManageUserComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'read-song',
    component: ReadSongComponent,
    canActivate: [AuthGuard]
  },
  { path: 'categories', component: CategoriesComponent },
  { path: 'top100', component: Top100Component },
  { path: 'top100/top100Loves', component: PlayerComponent },
  { path: 'top100/top100Hear', component: PlayerComponent },
  { path: 'categories/:id', component: PlayerComponent },
  { path: 'artists', component: ArtistsComponent },
  { path: 'artists/:id', component: PlayerComponent },
  { path: 'song-info', component: SongInfoComponent },
  { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [LoginGuard] },
  { path: 'page-not-found', component: PageNotFoundComponent },
  { path: '**', redirectTo: '/page-not-found' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
