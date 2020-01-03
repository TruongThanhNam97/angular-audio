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

const routes: Routes = [
  { path: '', redirectTo: '/albums', pathMatch: 'full' },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      { path: 'upload', component: FormUploadComponent },
      { path: 'edit-profile', component: EditProfileComponent },
    ]
  },
  { path: 'songs', component: PlayerComponent },
  { path: 'albums', component: ListUsersComponent },
  { path: 'albums/:id', component: PlayerComponent },
  { path: 'upload-category', component: UploadCategoryComponent },
  { path: 'edit-category', component: EditCategoryComponent },
  { path: 'categories', component: CategoriesComponent },
  { path: 'categories/:id', component: PlayerComponent },
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
