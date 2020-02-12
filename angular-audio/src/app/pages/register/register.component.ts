import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subject, Observable, fromEvent } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { takeUntil, map } from 'rxjs/operators';
import { AlertifyService } from 'src/app/services/alertify.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, OnDestroy {

  signForm: FormGroup;
  destroySubscription$: Subject<boolean> = new Subject();
  disableMode = false;

  arrayType = ['jpg', 'JPG', 'png', 'PNG', 'jpeg', 'JPEG', 'webp', 'WEBP'];

  controlCharacters = /[!@#$%^&*()_+\=\[\]{};':"\\|,<>\/?]+/;

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
      password2: new FormControl(null, [Validators.required]),
      avatar: new FormControl(null, [
        this.validateImage.bind(this),
        this.validateControlCharacters.bind(this),
        this.validateFileNameLength.bind(this),
        this.validateNumberOfExtensions.bind(this)
      ])
    }, [this.validateConfirmPassword]);
  }

  onSelectedFile(event: any) {
    const file = event.target.files[0];
    this.isImageFileExactly(file).pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(result => {
      if (result) {
        this.signForm.patchValue({
          avatar: file
        });
      } else {
        this.signForm.patchValue({
          avatar: null
        });
      }
    });
    event.target.value = null;
  }

  validateNumberOfExtensions(control: FormControl): { [key: string]: boolean } {
    if (control.value) {
      return control.value.name.split('.').length === 2 ? null : { numberExtensions: true };
    }
  }

  validateFileNameLength(control: FormControl): { [key: string]: boolean } {
    if (control.value) {
      return control.value.name.length <= 150 ? null : { fileNameLength: true };
    }
  }

  validateControlCharacters(control: FormControl): { [key: string]: boolean } {
    if (control.value) {
      return !this.controlCharacters.test(control.value.name) ? null : { controlCharacters: true };
    }
  }

  validateImage(formControl: FormControl): { [key: string]: boolean } {
    if (formControl.value) {
      const fileType = formControl.value.name.split('.')[1];
      return this.arrayType.includes(fileType) ? null : { incorrectType: true };
    }
  }

  isImageFileExactly(file): Observable<boolean> {
    if (file) {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file.slice(0, 4));
      return fromEvent(reader, 'load').pipe(
        map((evt: any) => {
          const uint = new Uint8Array(evt.target.result);
          const bytes = [];
          uint.forEach((byte) => {
            bytes.push(byte.toString(16));
          })
          const hex = bytes.join('').toUpperCase();
          return this.checkMimeTypeImageFile(hex);
        })
      );
    }
  }

  checkMimeTypeImageFile(signature): boolean {
    switch (signature) {
      case 'FFD8FFE0': // jpg / jpeg
        return true;
      case 'FFD8FFE2': // jpg
        return true;
      case 'FFD8FFFE': // jpg
        return true;
      case 'FFD8FFE1': // jpg
        return true;
      case '89504E47': // png
        return true;
      case '52494646': // webp
        return true;
      default:
        return false;
    }
  }

  validateConfirmPassword(signForm: FormGroup): { [key: string]: boolean } {
    return signForm.get('password').value === signForm.get('password2').value ? null : { misMatch: true };
  }

  onSubmit() {
    this.disableMode = true;
    this.signForm.disable();
    const formData = new FormData();
    formData.append('username', this.signForm.value.username);
    formData.append('password', this.signForm.value.password);
    formData.append('password2', this.signForm.value.password2);
    formData.append('avatar', this.signForm.value.avatar);
    this.authService.register(formData).pipe(
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
        this.disableMode = false;
        this.signForm.enable();
      }
    );
  }

}
