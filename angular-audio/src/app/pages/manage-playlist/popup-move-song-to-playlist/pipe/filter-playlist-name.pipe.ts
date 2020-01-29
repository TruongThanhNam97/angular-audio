import { Pipe, PipeTransform } from '@angular/core';
import { ValidateService } from 'src/app/services/validate.service';

@Pipe({ name: 'filterPlayListName' })
export class FilterPlayListNamePipe implements PipeTransform {
    constructor(private validateService: ValidateService) { }
    transform(value: any[], playlistName: string): any[] {
        if (this.validateService.isEmpty(playlistName)) {
            return value;
        }
        return value.filter((item, i) => item.name.toLowerCase().trim().includes(playlistName.toLowerCase().trim()));
    }
}