import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TimeAgoPipe } from 'time-ago-pipe';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material.module';
import { PlayerComponent } from './pages/player/player.component';
import { FormUploadComponent } from './pages/form-upload/form-upload.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { MediaFooterComponent } from './pages/media-footer/media-footer.component';
import { PopupComponent } from './pages/player/popup/popup.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { PopupBanComponent } from './pages/login/popup-ban/popup-ban.component';
import { ListUsersComponent } from './pages/list-users/list-users.component';
import { UploadCategoryComponent } from './pages/upload-category/upload-category.component';
import { CategoriesComponent } from './pages/categories/categories.component';
import { PlaylistPlayingComponent } from './pages/media-footer/playlist-playing/playlist-playing.component';
import { EditCategoryComponent } from './pages/edit-category/edit-category.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { EditProfileComponent } from './pages/edit-profile/edit-profile.component';
import { EditSongsComponent } from './pages/edit-songs/edit-songs.component';
import { ManageCategoriesComponent } from './pages/manage-categories/manage-categories.component';
import { ManageSongsComponent } from './pages/manage-songs/manage-songs.component';
import { PopupEditSongComponent } from './pages/manage-songs/popup-edit-song/popup-edit-song.component';
import { ManageUserComponent } from './pages/manage-user/manage-user.component';
import { PopupThreeTypesComponent } from './pages/player/popup-three-types/popup-three-types.component';
import { ManageArtistComponent } from './pages/manage-artist/manage-artist.component';
import { EditArtistComponent } from './pages/edit-artist/edit-artist.component';
import { UploadArtistComponent } from './pages/upload-artist/upload-artist.component';
import { ArtistsComponent } from './pages/artists/artists.component';
import { ManageBlockedSongsComponent } from './pages/manage-blocked-songs/manage-blocked-songs.component';
import { ManagePlaylistComponent } from './pages/manage-playlist/manage-playlist.component';
import { PopupPlaylistComponent } from './pages/manage-playlist/popup-playlist/popup-playlist.component';
import { PopupMoveSongToPlaylistComponent } from './pages/manage-playlist/popup-move-song-to-playlist/popup-move-song-to-playlist.component';
import { FilterPlayListNamePipe } from './pages/manage-playlist/popup-move-song-to-playlist/pipe/filter-playlist-name.pipe';
import { SongInfoComponent } from './pages/song-info/song-info.component';
import { PopupCommentsComponent } from './pages/song-info/popup-comments/popup-comments.component';

@NgModule({
  declarations: [
    AppComponent,
    PlayerComponent,
    FormUploadComponent,
    PageNotFoundComponent,
    MediaFooterComponent,
    PopupComponent,
    LoginComponent,
    RegisterComponent,
    PopupBanComponent,
    ListUsersComponent,
    UploadCategoryComponent,
    CategoriesComponent,
    PlaylistPlayingComponent,
    EditCategoryComponent,
    DashboardComponent,
    EditProfileComponent,
    EditSongsComponent,
    ManageCategoriesComponent,
    ManageSongsComponent,
    PopupEditSongComponent,
    ManageUserComponent,
    PopupThreeTypesComponent,
    ManageArtistComponent,
    EditArtistComponent,
    UploadArtistComponent,
    ArtistsComponent,
    ManageBlockedSongsComponent,
    ManagePlaylistComponent,
    PopupPlaylistComponent,
    PopupMoveSongToPlaylistComponent,
    FilterPlayListNamePipe,
    SongInfoComponent,
    PopupCommentsComponent,
    TimeAgoPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule
  ],
  entryComponents: [
    PopupComponent,
    PopupBanComponent,
    PlaylistPlayingComponent,
    PopupEditSongComponent,
    PopupThreeTypesComponent,
    PopupPlaylistComponent,
    PopupMoveSongToPlaylistComponent,
    PopupCommentsComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
