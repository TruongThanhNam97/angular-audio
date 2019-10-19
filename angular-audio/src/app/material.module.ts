import { NgModule } from "@angular/core";
import {
  MatButtonModule,
  MatListModule,
  MatSliderModule,
  MatIconModule,
  MatToolbarModule,
  MatCardModule,
  MatProgressSpinnerModule
} from "@angular/material";

const modules = [
  MatButtonModule,
  MatListModule,
  MatSliderModule,
  MatIconModule,
  MatToolbarModule,
  MatCardModule,
  MatProgressSpinnerModule
];

@NgModule({
  imports: modules,
  exports: modules
})
export class MaterialModule {}