import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { takeUntil } from 'rxjs/operators';
import { AlertifyService } from 'src/app/services/alertify.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, OnDestroy {

  signForm: FormGroup;
  destroySubscription$: Subject<boolean> = new Subject();

  constructor(private authService: AuthService, private alertifyService: AlertifyService) { }

  ngOnInit() {
    this.intializeForm();
  }

  ngOnDestroy() {
    this.destroySubscription$.next(true);
  }

  intializeForm() {
    this.signForm = new FormGroup({
      username: new FormControl(null, [Validators.required, Validators.minLength(10), Validators.maxLength(30)]),
      password: new FormControl(null, [Validators.required, Validators.minLength(6), Validators.maxLength(30)]),
      password2: new FormControl(null, [Validators.required])
    }, [this.validateConfirmPassword]);
  }

  validateConfirmPassword(signForm: FormGroup): { [key: string]: boolean } {
    return signForm.get('password').value === signForm.get('password2').value ? null : { misMatch: true };
  }

  onSubmit() {
    this.authService.register(this.signForm.value).pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(
      _ => {
        const { username, password } = this.signForm.value;
        this.authService.login({ username, password }).pipe(
          takeUntil(this.destroySubscription$)
        ).subscribe(response => {
          this.authService.setUpAfterLogin(response.token);
          this.alertifyService.success('Login successfully');
        });
      },
      error => {
        if (error.error.username) {
          this.alertifyService.error(error.error.username);
        }
        if (error.error.password) {
          this.alertifyService.error(error.error.password);
        }
        if (error.error.password2) {
          this.alertifyService.error(error.error.password2);
        }
      }
    );
  }

}
