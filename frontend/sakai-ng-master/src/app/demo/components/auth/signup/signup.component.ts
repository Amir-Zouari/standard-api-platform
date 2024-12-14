import { SignupRequest } from './../../../api/signupRequest';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { catchError, Subject, takeUntil, tap } from 'rxjs';
import { AuthService } from 'src/app/demo/service/auth.service';
import { UserService } from 'src/app/demo/service/user.service';
import { LayoutService } from 'src/app/layout/service/app.layout.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styles: [`
        :host ::ng-deep .pi-eye,
        :host ::ng-deep .pi-eye-slash {
            transform:scale(1.6);
            margin-right: 1rem;
            color: var(--primary-color) !important;
        }
        
    `],
  providers: [MessageService],
})
export class SignupComponent implements OnInit, OnDestroy {

  signupForm: FormGroup;
  signupRequest: SignupRequest = {};
  isMessageLong: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(
    public layoutService: LayoutService,
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private userService: UserService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.signupForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20), Validators.pattern('[a-zA-Z0-9_]+')]],
      email: ['', [Validators.required, Validators.email/* , Validators.maxLength(150), Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,20}$/) */]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(40)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password');
    const confirmPassword = formGroup.get('confirmPassword');
    return password && confirmPassword && password.value === confirmPassword.value ? null : { mismatch: true };
  }

  checkUsername() {
    const usernameControl = this.signupForm.get('username');
    if (usernameControl && usernameControl.valid) {
      this.userService.checkUsernameAvailability(usernameControl.value).pipe(
        takeUntil(this.destroy$)
      ).subscribe(isAvailable => {
        if (!isAvailable) {
          usernameControl.setErrors({ notAvailable: true });
        }
      });
    }
  }

  checkEmail() {
    const emailControl = this.signupForm.get('email');
    if (emailControl && emailControl.valid) {
      this.userService.checkEmailAvailability(emailControl.value).pipe(
        takeUntil(this.destroy$)
      ).subscribe(isAvailable => {
        if (!isAvailable) {
          emailControl.setErrors({ notAvailable: true });
        }
      });
    }
  }

  signupUser() {
    if (this.signupForm.invalid) {
      return;
    }

    this.signupRequest.firstName = this.signupForm.get('firstName').value;
    this.signupRequest.lastName = this.signupForm.get('lastName').value;
    this.signupRequest.username = this.signupForm.get('username').value;
    this.signupRequest.email = this.signupForm.get('email').value;
    this.signupRequest.password = this.signupForm.get('password').value;

    this.authService.signup(this.signupRequest).pipe(
      takeUntil(this.destroy$),
      tap(() => {
        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'User Registered Successfully', life: 3000 });
        this.signupForm.reset();
        this.router.navigate(['/auth/login']);
      }),
      catchError(error => {
        error.error.message.length < 50 ? this.isMessageLong = false : this.isMessageLong = true;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error.message || 'An error occurred during signup.',
          life: 3000,
        });

        throw error; // Re-throw the error for potential global error handling
      })
    ).subscribe();
  }

  get firstName() { return this.signupForm.get('firstName'); }
  get lastName() { return this.signupForm.get('lastName'); }
  get username() { return this.signupForm.get('username'); }
  get email() { return this.signupForm.get('email'); }
  get password() { return this.signupForm.get('password'); }
  get confirmPassword() { return this.signupForm.get('confirmPassword'); }
}
