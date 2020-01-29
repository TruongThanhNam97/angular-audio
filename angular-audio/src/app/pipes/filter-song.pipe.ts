import { Pipe, PipeTransform } from '@angular/core';
import { ValidateService } from '../services/validate.service';

@Pipe({ name: 'songPipe' })
export class SongPipe implements PipeTransform {
    constructor(private validateService: ValidateService) { }
    transform(value: any[], nameArtist: string): any {
        if (this.validateService.isEmpty(nameArtist)) {
            return value;
        }
        const result = value.filter(item => item.name.toLowerCase().trim().includes(nameArtist.toLowerCase().trim())
            || item.artist.toLowerCase().trim().includes(nameArtist.toLocaleLowerCase().trim()));
        return result;
    }
}