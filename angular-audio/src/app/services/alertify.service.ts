import { Injectable } from '@angular/core';
declare let alertify: any;

@Injectable({
    providedIn: 'root'
})
export class AlertifyService {
    constructor() {
        this.setConfigAlertify();
    }
    confirm(message: string, okCallback: () => any) {
        alertify.confirm(message, e => {
            if (e) {
                okCallback();
            } else {
            }
        });
    }
    success(message: string) {
        alertify.success(message);
    }
    error(message: string) {
        alertify.error(message);
    }
    warning(message: string) {
        alertify.warning(message);
    }
    message(message: string) {
        alertify.message(message);
    }
    notify(html) {
        alertify.message(html);
    }
    setConfigAlertify() {
        alertify.defaults = {
            // notifier defaults
            notifier: {
                // auto-dismiss wait time (in seconds)
                delay: 1.5,
                // default position
                position: 'bottom-right',
                // adds a close button to notifier messages
                closeButton: false
            },

            // language resources
            glossary: {
                // dialogs default title
                title: 'Confirm',
                // ok button text
                ok: 'OK',
                // cancel button text
                cancel: 'Cancel'
            },

            // theme settings
            theme: {
                // class name attached to prompt dialog input textbox.
                input: 'ajs-input',
                // class name attached to ok button
                ok: 'ajs-ok',
                // class name attached to cancel button
                cancel: 'ajs-cancel'
            },
            // global hooks
            hooks: {
                // invoked before initializing any dialog
                preinit: function (instance) { },
                // invoked after initializing any dialog
                postinit: function (instance) { },
            },
        };
    }
}