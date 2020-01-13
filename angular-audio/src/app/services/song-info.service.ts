import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SongInfoService {

    modeSubject$: Subject<string> = new Subject();

    constructor() { }

    getModeSubject() {
        return this.modeSubject$;
    }
}