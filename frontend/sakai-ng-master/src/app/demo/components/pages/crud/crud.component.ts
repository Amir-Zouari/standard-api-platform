
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { UserService } from 'src/app/demo/service/user.service';
import { User } from 'src/app/demo/api/user';
import { UpdateRequest } from 'src/app/demo/api/updateRequest';
import { HttpParams } from '@angular/common/http';
import { catchError, forkJoin, map, Observable, Subject, Subscription, takeUntil, tap } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/demo/service/auth.service';
import { Role } from 'src/app/demo/api/role';

@Component({
    templateUrl: './crud.component.html',
    providers: [MessageService]
})
export class CrudComponent implements OnInit, OnDestroy {

    @ViewChild('dt') table: Table;

    editUserDialog: boolean = false;

    addUserDialog: boolean = false;

    changePassword: boolean = false;

    deleteUserDialog: boolean = false;

    deleteUsersDialog: boolean = false;

    users: User[] = [];

    usernames: string[] = [];

    emails: string[] = [];

    user: User = {};

    options: any[] = []/* : string[] = Object.values(eRole) */;

    roles: string[];

    authentifiedUser: User;

    selectedUsers: User[] = [];


    cols: any[] = [];

    rowsPerPageOptions = [5, 10, 20];

    addUserForm: FormGroup;
    editUserForm: FormGroup;

    private destroy$ = new Subject<void>();

    constructor(
        public authService: AuthService,
        private userService: UserService,
        private messageService: MessageService,
        private fb: FormBuilder
    ) {
        this.addUserForm = this.fb.group({
            username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20), Validators.pattern('[a-zA-Z0-9_]+')]],
            password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(40)]],
            confirmPassword: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            phoneNumber: [''],
            address: [''],
            roles: ['', Validators.required]
        }, { validator: this.passwordMatchValidator });

        this.editUserForm = this.fb.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            phoneNumber: [''],
            address: [''],
            roles: ['', Validators.required]
        });
    }
    passwordMatchValidator(form: FormGroup) {
        const password = form.get('password')?.value;
        const confirmPassword = form.get('confirmPassword')?.value;
        return password === confirmPassword ? null : { mismatch: true };
    }

    ngOnInit() {

        forkJoin([this.userService.getAll(), this.userService.getAssignableRoles()]).pipe(
            takeUntil(this.destroy$),
            map(([users, assignableRoles]) => {
                this.users = users;
                this.usernames = this.users.map(user => user.username);
                this.emails = this.users.map(user => user.email);
                this.users.forEach(user => {
                    user.roles = user.roles.map(role => this.mapRole(role));
                });
                this.options = assignableRoles.map((role) => ({ label: role, value: role, disabled: false }));
            }),
            catchError(error => { throw error; })
        ).subscribe();


        this.cols = [
            { field: 'id', header: 'ID' },
            { field: 'username', header: 'Username' },
            { field: 'email', header: 'Email' },
            { field: 'firstName', header: 'FirstName' },
            { field: 'lastName', header: 'LastName' },
            { field: 'phoneNumber', header: 'PhoneNumber' },
            { field: 'address', header: 'Address' },
            { field: 'roles', header: 'Roles' }
        ];
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    mapRole(role: any) {
        return role.name.replace('ROLE_', '').toLowerCase();
    }

    /* getUsers() {
        this.userService.getAll().pipe(
            filter()
            map(data => {
                this.users = data;
        }))
    } */

    /*  refresh() {
 
         //using forkJoin
         const user$ = this.userService.getAll();
         const assignableRoles$ = this.userService.getAssignableRoles();
 
         forkJoin([user$, assignableRoles$]).subscribe(([users, assignableRoles]) => {
             this.users = users;
             this.usernames = users.map(user => user.username);
             this.emails = users.map(user => user.email);
             this.options = assignableRoles.map((role, index) => ({ label: this.roleMap[role], value: role, order: index, disabled: false }));
         });
 
         //using pipe
          this.userSubscription = this.userService.getAll().pipe(
             tap((users) => {
              this.users = users;
              this.usernames = users.map(user => user.username);
              this.emails = users.map(user => user.email);
          }),
         catchError(error => {throw error;})
     ).subscribe();
          this.userService.getAssignableRoles().subscribe(assignableRoles => {
              this.options = assignableRoles.map((role, index) => ({ label: this.roleMap[role], value: role, order: index, disabled: false }));
  
          });
     } */
    openAddDialog() {
        this.addUserForm.reset();
        this.user = {};
        this.addUserDialog = true;
    }

    validateAdd() {
        if (this.addUserForm.invalid) {
            return;
        }

        this.user.username = this.addUserForm.get('username')?.value;
        this.user.email = this.addUserForm.get('email')?.value;
        this.user.password = this.addUserForm.get('password')?.value;
        this.user.firstName = this.addUserForm.get('firstName')?.value;
        this.user.lastName = this.addUserForm.get('lastName')?.value;
        this.user.phoneNumber = this.addUserForm.get('phoneNumber')?.value;
        this.user.address = this.addUserForm.get('address')?.value;
        this.user.roles = this.addUserForm.get('roles')?.value;
        this.userService.create(this.user).pipe(
            takeUntil(this.destroy$),
            tap((createdUser) => {
                this.user.id = createdUser.id;
                this.users = this.users.concat([this.user]);
                this.usernames = this.usernames.concat([this.user.username])
                this.emails = this.emails.concat([this.user.email])
                /* this.users.push(this.user);
                this.table.reset(); */
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'User added',
                    life: 3000,
                });

                this.addUserDialog = false;
                this.user = {};
                this.addUserForm.reset();
            }),
            catchError(error => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.error.message || 'An error occurred during addition.',
                    life: 3000
                });
                throw error;
            })
        ).subscribe();

    }

    /* isUsernameAvailable() {
        return !this.usernames.includes(this.addUserForm.get('username')?.value);
    }

    isEmailAvailable() {
        return !this.emails.includes(this.addUserForm.get('email')?.value);
    } */

    checkUsername() {
        const usernameControl = this.addUserForm.get('username');
        if (usernameControl && usernameControl.valid) {
            if (this.usernames.includes(usernameControl?.value)) {
                usernameControl.setErrors({ notAvailable: true });
            }
        }
    }

    checkEmail() {
        const emailControl = this.addUserForm.get('email');
        if (emailControl && emailControl.valid) {
            if (this.emails.includes(emailControl?.value)) {
                emailControl.setErrors({ notAvailable: true });
            }

        }
    }

    /* areInputsValid(): boolean {
        return this.addUserForm.valid
            && this.isUsernameAvailable()
            && this.isEmailAvailable();
    } */

    openDeleteSelectedUsersDialog() {
        this.deleteUsersDialog = true;
    }

    /* getUserRoles(user: User) {
        return user.roles.map(role => this.roleMap[role.name]);
    } */

    canEdit(user: User) {
        const userRoles = user.roles;
        return !((this.authService.hasRole("ROLE_MODERATOR") && userRoles.includes("admin")) || (this.authService.getUserID() == user.id));
    }

    openEditDialog(user: User) {
        this.user = { ...user };
        this.editUserForm.patchValue({
            firstName: this.user.firstName,
            lastName: this.user.lastName,
            phoneNumber: this.user.phoneNumber,
            address: this.user.address,
            roles: this.user.roles
        });
        /* this.options.forEach(role => {
            role.disabled = this.authService.hasRole(role.value) && userRoles.includes(role.value);
 
        }); */
        this.editUserDialog = true;
    }

    validateEdit() {
        if (this.editUserForm.invalid) {
            return;
        }

        const updatedUser: UpdateRequest = {
            firstName: this.editUserForm.get('firstName')?.value,
            lastName: this.editUserForm.get('lastName')?.value,
            phoneNumber: this.editUserForm.get('phoneNumber')?.value,
            address: this.editUserForm.get('address')?.value,
            roles: this.editUserForm.get('roles')?.value
        };

        this.userService.update(this.user.id, updatedUser).pipe(
            takeUntil(this.destroy$),
            tap(() => {
                this.user = Object.keys(this.user).reduce((acc, key) => {
                    if (updatedUser.hasOwnProperty(key)) {
                        acc[key] = updatedUser[key];
                    } else {
                        acc[key] = this.user[key];
                    }
                    return acc;
                }, {});
                const updatedUsers = [...this.users];
                const index = updatedUsers.findIndex(u => u.id === this.user.id);
                updatedUsers[index] = this.user;
                this.users = updatedUsers;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'User updated',
                    life: 3000
                });
                this.editUserDialog = false;
                this.user = {};
                this.editUserForm.reset();
            }),
            catchError(error => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.error.message || 'An error occurred during update.',
                    life: 3000
                });
                throw error;
            })
        ).subscribe();


    }

    openDeleteUserDialog(user: User) {
        this.deleteUserDialog = true;
        this.user = { ...user };
    }

    confirmDeleteSelected() {
        this.deleteUsersDialog = false;
        const userIds = this.selectedUsers.map((user) => user.id);
        const usernames = this.selectedUsers.map((user) => user.username);
        const emails = this.selectedUsers.map((user) => user.email);
        const params = new HttpParams().set('ids', userIds.join(','));
        this.userService.deleteUsers(params).pipe(
            takeUntil(this.destroy$),
            tap(() => {
                this.users = this.users.filter(u => !userIds.includes(u.id));
                this.usernames = this.usernames.filter(username => !usernames.includes(username));
                this.emails = this.emails.filter(email => !emails.includes(email));
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'users Deleted',
                    life: 3000,
                });
                this.selectedUsers = [];
            }),
            catchError(error => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.error.message || 'An error occurred during deletion.',
                    life: 3000
                });
                throw error;
            })
        ).subscribe();
    }

    confirmDelete() {
        this.deleteUserDialog = false;
        this.userService.delete(this.user.id).pipe(
            takeUntil(this.destroy$),
            tap(() => {
                this.users = this.users.filter(u => u.id !== this.user.id);
                this.usernames = this.usernames.filter(username => username != this.user.username);
                this.emails = this.emails.filter(email => email != this.user.email);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'user Deleted',
                    life: 3000,
                });
                this.user = {};
            }),
            catchError(error => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.error.message || 'An error occurred during deletion.',
                    life: 3000
                });
                throw error;
            })
        ).subscribe();
    }

    hideDialog() {
        this.editUserDialog = false;
        this.addUserDialog = false;
        this.addUserForm.reset();
    }

    findIndexById(id: number): number {
        let index = -1;
        for (let i = 0; i < this.users.length; i++) {
            if (this.users[i].id === id) {
                index = i;
                break;
            }
        }

        return index;
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal(
            (event.target as HTMLInputElement).value,
            'contains'
        );
    }

}
