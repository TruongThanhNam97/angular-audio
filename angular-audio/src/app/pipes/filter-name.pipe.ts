import { Pipe, PipeTransform } from '@angular/core';
import { ValidateService } from '../services/validate.service';

@Pipe({ name: 'namePipe' })
export class NamePipe implements PipeTransform {
    constructor(private validateService: ValidateService) { }
    transform(value: any[], name: string): any {
        if (this.validateService.isEmpty(name)) {
            return value;
        }
        const result = value.filter(item => item.name.toLowerCase().trim().includes(name.toLowerCase().trim()));
        return result;
    }
}