import { Component, OnInit } from '@angular/core';
import { AudioService } from 'src/app/services/audio.service';
import { CloudService } from 'src/app/services/cloud.service';
import { StreamState } from "../../interfaces/stream-state";

@Component({
  selector: 'app-media-footer',
  templateUrl: './media-footer.component.html',
  styleUrls: ['./media-footer.component.scss']
})
export class MediaFooterComponent implements OnInit {
  state: StreamState;
  currentFile: any = {};
  files : any;

  constructor(private audioService : AudioService,private cloudService : CloudService) { }

  ngOnInit() {
    this.files = this.cloudService.getLocalSongs();
    this.cloudService.getLocalSongsSubjects$().subscribe(
      v => this.files = v
    );
    this.currentFile = this.audioService.getCurrentFile();
    this.audioService.getCurrentFileSubject().subscribe(
      v => this.currentFile = v
    );
    this.audioService.getState().subscribe(state => {
      console.log(state);
      this.state = state;
    });
  }

  pause() {
    this.audioService.pause();
  }
  play() {
    this.audioService.play();
  }
  stop() {
    this.audioService.stop();
  }
  next() {
    const index = this.currentFile.index + 1;
    const file = this.files[index];
    // this.openFile(file, index);
    this.audioService.updateCurrentFile2({index,file});
  }
  previous() {
    const index = this.currentFile.index - 1;
    const file = this.files[index];
    // this.openFile(file, index);
    this.audioService.updateCurrentFile2({index,file});
  }
  isFirstPlaying() {
    return this.currentFile.index === 0;
  }

  isLastPlaying() {
    if (this.files) {
      return this.currentFile.index === this.files.length - 1;
    }
  }
  onSliderChangeEnd(change) {
    this.audioService.seekTo(change.value);
  }

}
