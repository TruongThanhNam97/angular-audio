import { Component, OnInit } from '@angular/core';
import { AudioService } from './services/audio.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss','../../node_modules/bootstrap/dist/css/bootstrap.min.css']
})
export class AppComponent implements OnInit {
  playMode : boolean = false;
  constructor(private audioSerive : AudioService) {}
  ngOnInit() {
    this.audioSerive.getPlayModeSubject().subscribe((v:any) => this.playMode = v);
  }
}
