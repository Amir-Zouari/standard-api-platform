import { AuthService } from 'src/app/demo/service/auth.service';
import { Router } from '@angular/router';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { LayoutService } from "./service/app.layout.service";
import { OverlayPanel } from 'primeng/overlaypanel';
import { User } from '../demo/api/user';
import { UserService } from '../demo/service/user.service';
import { UpdateRequest } from '../demo/api/updateRequest';
import { Dialog } from 'primeng/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { catchError, Subject, takeUntil, tap } from 'rxjs';

@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html',
    providers: [MessageService],
    styles: [`
        .user-info {
            display: flex;
            flex-direction: column;
            align-items: center; /* Center horizontally */
            justify-content: center; /* Center vertically if needed */
            font-size: 16px;
            color: #333;
            line-height: 1;
            text-align: center; /* Ensure text is centered */
            height: 100%; /* Adjust as needed */
        }

        .roles {
            font-weight: bold;
            color: #555;
        }
        `]
})
export class AppTopBarComponent implements OnInit {

    private destroy$ = new Subject<void>();
    
    changePasswordDialog = false;

    editProfileDialog = false;

    currentUser: User = {};

    updatedUser: UpdateRequest = {};

    password = '';

    confirmPassword = '';

    passwordsMatch: boolean = true;

    editProfileForm: FormGroup;

    items!: MenuItem[];

    @ViewChild('menubutton') menuButton!: ElementRef;

    @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;

    @ViewChild('topbarmenu') menu!: ElementRef;

    constructor(public layoutService: LayoutService, public overlaypanel: OverlayPanel,
        public userService: UserService, public messageService: MessageService, public router: Router,
        public authService: AuthService, private fb: FormBuilder) {
        this.editProfileForm = this.fb.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            phoneNumber: [''],
            address: ['']
        });
    }

    ngOnInit() {
        this.refresh();
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    mapRole(role: any) {
        return role.name.replace('ROLE_', '').toLowerCase();
    }

    refresh() {
        this.userService.get(this.authService.getUserID()).pipe(
            takeUntil(this.destroy$)
        ).subscribe(user => {
            this.currentUser = user;
            this.currentUser.roles = this.currentUser.roles.map(role => this.mapRole(role));
        });

    }

    show(event: any, overlaypanel: OverlayPanel) {
        overlaypanel.toggle(event);
    }


    changePassword() {
        this.changePasswordDialog = true;
        /* dialog._visible = true; */
    }

    openEditDialog() {
        this.editProfileForm.patchValue({
            firstName: this.currentUser.firstName,
            lastName: this.currentUser.lastName,
            phoneNumber: this.currentUser.phoneNumber,
            address: this.currentUser.address
        });
        this.editProfileDialog = true;
    }

    editProfile() {
        if (this.editProfileForm.invalid) {
            return;
        }

        const updatedUser: UpdateRequest = {
            firstName: this.editProfileForm.get('firstName')?.value,
            lastName: this.editProfileForm.get('lastName')?.value,
            phoneNumber: this.editProfileForm.get('phoneNumber')?.value,
            address: this.editProfileForm.get('address')?.value
        };

        this.userService.updateProfile(updatedUser).pipe(
            takeUntil(this.destroy$),
            tap(() => {
                this.refresh();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'User updated',
                    life: 3000
                });
                this.editProfileDialog = false;
                this.currentUser = {};
                this.editProfileForm.reset();
            }),
            catchError(error => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.error.message || 'An error occurred during edit.',
                    life: 3000
                });
                throw error;
            })
        ).subscribe();
    }

    signOut() {
        this.authService.signOut();
        this.router.navigate(['/auth/login']);
    }

    checkPasswords() {
        if (this.password != '' && this.confirmPassword != '')
            this.passwordsMatch = this.password == this.confirmPassword;
    }

    passwordsNotEmpty() {
        return (this.password != '' && this.confirmPassword != '' && this.updatedUser.oldPassword != '');
    }

    fieldsValid() {
        return this.passwordsMatch && this.passwordsNotEmpty();
    }

    validateChangePassword() {
        if (this.fieldsValid()) {
            this.updatedUser.newPassword = this.password;
            this.userService.updateProfile(this.updatedUser).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Password changed successfully', life: 3000 });
                    this.changePasswordDialog = false;
                    this.updatedUser = {};
                    this.password = '';
                    this.confirmPassword = '';
                    this.passwordsMatch = true;
                },
                error: (error) => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: error.error.message || 'an error occured during password change', life: 3000 });
                }

            });
        }


    }

    hideDialog() {
        this.changePasswordDialog = false;
        this.editProfileDialog = false;
    }
}
