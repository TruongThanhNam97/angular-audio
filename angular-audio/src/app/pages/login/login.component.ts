import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AlertifyService } from 'src/app/services/alertify.service';
import { MatDialog } from '@angular/material';
import { PopupBanComponent } from './popup-ban/popup-ban.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  signForm: FormGroup;
  destroySubscription$: Subject<boolean> = new Subject();
  disableMode = false;

  constructor(
    private authService: AuthService,
    private alertifyService: AlertifyService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.initializeForm();
  }

  ngOnDestroy() {
    this.destroySubscription$.next(true);
  }

  initializeForm() {
    this.signForm = new FormGroup({
      username: new FormControl(null, [Validators.required]),
      password: new FormControl(null, [Validators.required])
    });
  }

  onSubmit() {
    this.signForm.disable();
    this.disableMode = true;
    this.authService.login(this.signForm.value).pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(
      response => {
        this.authService.setUpAfterLogin(response.token);
        this.alertifyService.success('Login successfully');
      },
      error => {
        if (error.error.username) {
          this.alertifyService.error(error.error.username);
        }
        if (error.error.password) {
          this.alertifyService.error(error.error.password);
        }
        if (error.error.message) {
          this.dialog.open(PopupBanComponent, {
            data: error.error.message
          });
        }
        this.signForm.enable();
        this.disableMode = false;
      }
    );
  }

}
