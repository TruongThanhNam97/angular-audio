import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'filterPlayListName' })
export class FilterPlayListNamePipe implements PipeTransform {
    transform(value: any[], playlistName: string): any[] {
        if (!playlistName) {
            return value;
        }
        return value.filter((item, i) => item.name.toLowerCase().trim().includes(playlistName.toLowerCase().trim()));
    }
}