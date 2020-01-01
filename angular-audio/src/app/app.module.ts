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
    UploadCategoryComponent
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
    PopupBanComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
