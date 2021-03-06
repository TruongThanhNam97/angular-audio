import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'songnamepipe' })
export class SongNamePipe implements PipeTransform {
    transform(value: string): string {
        if (value.length <= 50) {
            return value;
        }
        const lastIndex = value.lastIndexOf('.');
        const songName = value.slice(0, lastIndex);
        const extension = value.substr(lastIndex + 1);
        return extension.length <= 3
            ? `${songName.substr(0, 50)}... .${extension}` : `${songName.substr(0, 50)}... .${extension.substr(0, 3)}...`;
    }
}