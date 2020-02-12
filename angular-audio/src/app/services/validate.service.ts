import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ValidateService {
    constructor() { }

    isEmpty(data) {
        return data === undefined
            || data === null
            || (typeof data === 'object' && Object.keys(data).length === 0)
            || (typeof data === 'string' && data.trim().length === 0);
    }
}
