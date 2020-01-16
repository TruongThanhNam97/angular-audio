import { Directive, AfterViewInit, ElementRef } from '@angular/core';

@Directive({
    selector: '[appAutoFocus]',
})
export class AuthFocusDirective implements AfterViewInit {
    constructor(private el: ElementRef) {
    }

    ngAfterViewInit() {
        this.el.nativeElement.focus();
    }
}