import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SongInfoService {

    private modeSubject$: Subject<string> = new Subject();
    private statusAduio = 'pause';

    constructor() { }

    getModeSubject() {
        return this.modeSubject$;
    }

    setStatusAudio(status) {
        this.statusAduio = status;
    }

    getStatusAudio() {
        return this.statusAduio;
    }
}