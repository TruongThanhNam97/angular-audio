import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { PlayerComponent } from './pages/player/player.component';
import { FormUploadComponent } from './pages/form-upload/form-upload.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';

const routes: Routes = [
  { path: "", redirectTo: '/upload', pathMatch : 'full' },
  { path : "upload", component : FormUploadComponent },
  { path : "songs", component : PlayerComponent },
  { path : "page-not-found", component : PageNotFoundComponent },
  { path: "**", redirectTo: "/page-not-found" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
