import { UserService } from 'src/app/demo/service/user.service';
import { LoginRequest } from './../../../api/loginRequest';
import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/demo/service/auth.service';
import { UserSessionService } from 'src/app/demo/service/user-session.service';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { MessageService } from 'primeng/api';
import { catchError, Subject, takeUntil, tap } from 'rxjs';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
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
export class LoginComponent implements OnDestroy {
    username = '';
    password = '';
    loginRequest: LoginRequest = {};
    private destroy$ = new Subject<void>();

    constructor(public layoutService: LayoutService,
        public authService: AuthService, public router: Router,
        public userSessionService: UserSessionService,
        public messageService: MessageService
    ) { }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    checkForm() {
        return (this.username != '' && this.password != '');

    }

    clearVariables() {
        this.username = '';
        this.password = '';

    }

    signinUser() {
        this.loginRequest.username = this.username;
        this.loginRequest.password = this.password;
        if (this.checkForm()) {
            this.authService.signin(this.loginRequest).pipe(
                takeUntil(this.destroy$),
                tap((jwtResponse) => {
                    localStorage.setItem('jwtToken', jwtResponse.accessToken);
                    this.clearVariables();
                    this.router.navigate(['/']);
                    this.loginRequest = {};
                }),
                catchError((error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Signin Error', // Provide a clear general message
                        detail: error.error.message || 'An error occurred during signin.',
                        life: 3000,
                    });
                    throw error; // Re-throw for potential global error handling
                })
            )
                .subscribe();
        }
    }

}
