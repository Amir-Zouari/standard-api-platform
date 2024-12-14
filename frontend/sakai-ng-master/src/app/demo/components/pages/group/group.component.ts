import { Component, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { GroupService } from 'src/app/demo/service/group.service';
import { Group } from 'src/app/demo/api/group';
import { HttpParams } from '@angular/common/http';
import { catchError, forkJoin, Subject, Subscription, takeUntil, tap, throwError } from 'rxjs';
import { User } from 'src/app/demo/api/user';
import { UserService } from 'src/app/demo/service/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UpdateGroupRequest } from 'src/app/demo/api/updateGroupRequest';
import { AuthService } from 'src/app/demo/service/auth.service';

@Component({
  templateUrl: './group.component.html',
  providers: [MessageService],
})
export class GroupComponent implements OnInit, OnDestroy {

  private groupsAndUsersSubscription: Subscription;

  editGroupDialog: boolean = false;

  addGroupDialog: boolean = false;

  deleteGroupDialog: boolean = false;

  deleteGroupsDialog: boolean = false;

  quitGroupDialog: boolean = false;

  manageUsersGroupDialog: boolean = false;

  groups: Group[] = [];

  group: Group = {};

  updatedGroup: Group = {};

  selectedGroups: Group[] = [];

  allUsers: User[] = [];

  availableUsers: User[] = [];

  users: User[] = [];//group's users

  usersIds: number[] = [];

  authenticatedUserId: number;

  cols: any[] = [];

  rowsPerPageOptions = [5, 10, 20];

  editGroupForm: FormGroup;

  addGroupForm: FormGroup;

  private destroy$ = new Subject<void>();

  constructor(
    public authService: AuthService,
    private groupService: GroupService,
    private messageService: MessageService,
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.editGroupForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });

    this.addGroupForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit() {

    this.authenticatedUserId = this.authService.getUserID();

    this.groupsAndUsersSubscription = forkJoin([
      this.groupService.getGroups(),
      this.userService.getAll()
    ]).pipe(
      takeUntil(this.destroy$),
      catchError(error => {

        console.error('Error fetching groups and users:', error);
        throw error;
      })
    ).subscribe(([groups, users]) => {
      this.groups = groups;
      this.allUsers = users;
    });

    this.cols = [
      { field: 'id', header: 'ID' },
      { field: 'name', header: 'Name' },
      { field: 'description', header: 'Description' },
    ];
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /* refreshGroupsList() {
    this.groupsAndUsersSubscription = forkJoin([
      this.groupService.getGroups(),
      this.userService.getAll()
    ]).pipe(
      catchError(error => {
        
        console.error('Error fetching groups and users:', error);
        throw error;
      })
    ).subscribe(([groups, users]) => {
      this.groups = groups;
      this.allUsers = users;
    });
  } */

  getFilteredGroups(): Group[] {
    if (this.authService.hasRole('ROLE_USER')) {
      return this.groups.filter(group => group.users?.some(user => user.id === this.authenticatedUserId));
    } else {
      return this.groups; // Show all groups for other roles
    }
  }

  openAddGroupDialog() {
    this.group = {};
    this.addGroupDialog = true;
  }

  deleteSelectedGroups() {
    this.deleteGroupsDialog = true;
  }

  openEditGroupDialog(group: Group) {
    this.group = { ...group };
    this.editGroupForm.patchValue(this.group);
    this.editGroupDialog = true;
  }

  openQuitGroupDialog(group: Group) {
    this.group = { ...group };
    this.quitGroupDialog = true;
  }

  leaveGroup() {
    this.quitGroupDialog = false;
    this.userService.leaveGroup(this.group.id).pipe(
      takeUntil(this.destroy$),
      tap(() => {
        this.groups.filter(g => g.id != this.group.id);
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Group left',
          life: 3000,
        });
        this.quitGroupDialog = false;
        this.group = {};

      }),

      catchError(error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error.message || 'An error occurred during quit.',
          life: 3000
        });
        throw error; // Re-throw the error for potential global error handling
      })
    ).subscribe();

  }

  deleteGroup(group: Group) {
    this.deleteGroupDialog = true;
    this.group = { ...group };
  }

  confirmDeleteSelected() {
    this.deleteGroupsDialog = false;
    const groupIds = this.selectedGroups.map((group) => group.id);
    const params = new HttpParams().set('ids', groupIds.join(','));
    this.groupService.deleteGroups(params).pipe(
      takeUntil(this.destroy$),
      tap(() => {
      this.groups = this.groups.filter(g => !groupIds.includes(g.id));
      this.messageService.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Groups Deleted',
        life: 3000,
      });
    }),
      catchError(error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error.message || 'An error occurred during deletion.',
          life: 3000
        });
        throw error; // Re-throw the error for potential global error handling
      })
    ).subscribe();
    this.selectedGroups = [];
  }

  confirmDelete() {
    this.deleteGroupDialog = false;
    this.groupService.deleteGroup(this.group.id).pipe(
      takeUntil(this.destroy$),
      tap(() => {
        this.groups = this.groups.filter(g => g.id !== this.group.id);
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Group Deleted',
          life: 3000,
        });
        this.group = {};
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
    this.editGroupDialog = false;
    this.addGroupDialog = false;
  }

  validateEdit() {
    if (this.editGroupForm.invalid) {
      return;
    }
    const updatedGroup: UpdateGroupRequest =
    {
      name: this.editGroupForm.get("name")?.value,
      description: this.editGroupForm.get("description")?.value
    };
    this.groupService.updateGroup(this.group.id, updatedGroup).pipe(
      takeUntil(this.destroy$),
      tap(() => {
        this.group = Object.keys(this.group).reduce((acc, key) => {
          if (updatedGroup.hasOwnProperty(key)) {
            acc[key] = updatedGroup[key];
          } else {
            acc[key] = this.group[key];
          }
          return acc;
        }, {});
        const updatedGroups = [...this.groups];
        const index = updatedGroups.findIndex(g => g.id === this.group.id);
        updatedGroups[index] = this.group;
        this.groups = updatedGroups;
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Group edited',
          life: 3000,
        });
        this.editGroupDialog = false;
        this.group = {};
        this.editGroupForm.reset();
      }),

      catchError(error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error.message || 'An error occurred during update.',
          life: 3000
        });
        throw error; // Re-throw the error for potential global error handling
      })
    ).subscribe();
  }

  validateAdd() {
    if (this.addGroupForm.invalid) {
      return;
    }
    this.group.name = this.addGroupForm.get('name')?.value;
    this.group.description = this.addGroupForm.get('description')?.value;
    this.groupService.createGroup(this.group).pipe(
      takeUntil(this.destroy$),
      tap((createdGroup) => {
        this.group.id = createdGroup.id;
        this.groups = this.groups.concat([this.group]);
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Group added',
          life: 3000,
        });
        this.addGroupDialog = false;
        this.group = {};
        this.addGroupForm.reset();
      }),

      catchError(error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error.message || 'An error occurred during addition.',
          life: 3000
        });
        throw error; // Re-throw the error for potential global error handling
      })
    ).subscribe();
  }

  manageGroupUsers(group: Group) {

    this.group = this.deepCopy(group);
    this.usersIds = [];
    this.users = this.deepCopy(this.group.users);
    this.availableUsers = this.allUsers.filter(user => !this.users.some(u => u.id === user.id));
    this.manageUsersGroupDialog = true;

  }

  validateManageGroupUsers() {
    this.usersIds = this.users.map((user) => user.id);
    this.groupService.updateGroupUsers(this.group.id, this.usersIds).pipe(
      takeUntil(this.destroy$),
      tap((updatedGroup) => {
        this.group = this.deepCopy(updatedGroup);
        const updatedGroups = this.deepCopy(this.groups);
        const index = updatedGroups.findIndex(g => g.id === this.group.id);
        updatedGroups[index] = this.group;
        this.groups  = this.deepCopy(updatedGroups);
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: "Group\'s users edited",
          life: 3000,
        });

      }),
      catchError(error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error.message || "An error occurred during editing group\'s users.",
          life: 3000
        });
        throw error;
      })
    ).subscribe();
    this.manageUsersGroupDialog = false;
    this.users = [];
    this.usersIds = [];
    this.availableUsers = [];
    this.group = null;
  }

  findIndexById(id: number): number {
    let index = -1;
    for (let i = 0; i < this.groups.length; i++) {
      if (this.groups[i].id === id) {
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

  deepCopy<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

}
