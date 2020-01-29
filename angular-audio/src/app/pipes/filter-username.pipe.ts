import { Pipe, PipeTransform } from '@angular/core';
import { ValidateService } from '../services/validate.service';

@Pipe({ name: 'usernamePipe' })
export class UsernamePipe implements PipeTransform {
    constructor(private validateService: ValidateService) { }
    transform(value: any[], username: string): any {
        if (this.validateService.isEmpty(username)) {
            return value;
        }
        const result = value.filter(item => item.username.toLowerCase().trim().includes(username.toLowerCase().trim()));
        return result;
    }
}