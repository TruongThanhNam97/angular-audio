import { Injectable } from '@angular/core';
import { Observable, fromEvent } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class ValidateService {

    private whiteListImage = ['jpg', 'JPG', 'png', 'PNG', 'jpeg', 'JPEG', 'webp', 'WEBP'];
    private arrImageFileInfo = [
        {
            extension: ['jpg', 'jpeg'],
            signature: ['FFD8FF'],
            size: 3,
            offset: 0
        },
        {
            extension: ['png'],
            signature: ['89504E47'],
            size: 4,
            offset: 0
        },
        {
            extension: ['webp'],
            signature: ['52494646'],
            size: 4,
            offset: 0
        },
    ];

    private whiteListAudio = ['mp3', 'MP3', 'wav', 'WAV', 'm4a', 'M4A', 'flac', 'FLAC'];
    private arrAudioFileInfo = [
        {
            extension: ['mp3'],
            signature: ['494433'],
            size: 3,
            offset: 0
        },
        {
            extension: ['wav'],
            signature: ['52494646'],
            size: 4,
            offset: 0
        },
        {
            extension: ['m4a'],
            signature: ['66747970'],
            size: 4,
            offset: 4
        },
        {
            extension: ['flac'],
            signature: ['664C6143'],
            size: 4,
            offset: 0
        }
    ];

    private whiteListVideo = ['mp4', 'MP4'];
    private arrVideoFileInfo = [
        {
            extension: ['mp4'],
            signature: ['66747970'],
            size: 4,
            offset: 4
        }
    ];

    constructor() { }

    isEmpty(data) {
        return data === undefined
            || data === null
            || (typeof data === 'object' && Object.keys(data).length === 0)
            || (typeof data === 'string' && data.trim().length === 0);
    }

    validateFileBySignature(file, fileType): Observable<boolean> {
        if (file) {
            const reader = new FileReader();
            const loadContentFile$ = fromEvent(reader, 'load').pipe(
                map((evt: any) => {
                    const uint = new Uint8Array(evt.target.result);
                    const bytes = [];
                    uint.forEach((byte) => {
                        bytes.push(('0' + byte.toString(16)).slice(-2));
                    })
                    const hex = bytes.join('').toUpperCase();
                    return this.checkMimeTypeOfFile(hex, fileType, file);
                })
            );
            reader.readAsArrayBuffer(file.slice(0, 15));
            return loadContentFile$;
        }
    }

    checkMimeTypeOfFile(hex: string, fileType: string, file: any): boolean {
        switch (fileType) {
            case 'image': {
                return this.checkImageFile(hex, file);
            }
            case 'audio': {
                return this.checkAudioFile(hex, file);
            }
            case 'video': {
                return this.checkVideoFile(hex, file);
            }
            default:
                return false;
        }
    }

    checkImageFile(hex: string, file: any): boolean {
        let result = false;
        this.arrImageFileInfo.some(fileInfo => {
            if (fileInfo.signature.includes(hex.substr(fileInfo.offset * 2, fileInfo.size * 2))) {
                result = true;
                return true;
            }
        });
        return result;
    }

    checkAudioFile(hex: string, file: any): boolean {
        let result = false;
        let extensionBySignature = '';
        const extensionByFileName = file.name.split('.')[1] ? file.name.split('.')[1] : '';
        this.arrAudioFileInfo.some(fileInfo => {
            if (fileInfo.signature.includes(hex.substr(fileInfo.offset * 2, fileInfo.size * 2))) {
                result = true;
                extensionBySignature = fileInfo.extension[0];
                return true;
            }
        });
        if (extensionByFileName.toLowerCase() !== extensionBySignature || !this.whiteListAudio.includes(extensionBySignature)) {
            result = false;
        }
        return result;
    }

    checkVideoFile(hex: string, file: any): boolean {
        let result = false;
        let extensionBySignature = '';
        const extensionByFileName = file.name.split('.')[1] ? file.name.split('.')[1] : '';
        this.arrVideoFileInfo.some(fileInfo => {
            if (fileInfo.signature.includes(hex.substr(fileInfo.offset * 2, fileInfo.size * 2))) {
                result = true;
                extensionBySignature = fileInfo.extension[0];
                return true;
            }
        });
        if (extensionByFileName.toLowerCase() !== extensionBySignature || !this.whiteListVideo.includes(extensionBySignature)) {
            result = false;
        }
        return result;
    }
}
