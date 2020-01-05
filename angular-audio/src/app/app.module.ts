import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

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
    PopupThreeTypesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  entryComponents: [
    PopupComponent,
    PopupBanComponent,
    PlaylistPlayingComponent,
    PopupEditSongComponent,
    PopupThreeTypesComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
