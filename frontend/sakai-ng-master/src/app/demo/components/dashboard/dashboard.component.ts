import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Product } from '../../api/product';
import { ProductService } from '../../service/product.service';
import { Subscription, debounceTime } from 'rxjs';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { User } from '../../api/user';
import { Group } from '../../api/group';
import { UserService } from '../../service/user.service';
import { GroupService } from '../../service/group.service';
import { AuthService } from '../../service/auth.service';

@Component({
    templateUrl: './dashboard.component.html',
    styles: [`
    .role-badge {
    display: inline-block;
    margin: 0.5rem;
}
.role-text {
    padding: 0.5rem 1rem;
    border-radius: 50px;
    color: #fff;
    font-weight: bold;
    text-transform: uppercase;
}
.role-user {
    background-color: #007bff; /* Blue for USER */
}
.role-admin {
    background-color: #dc3545; /* Red for ADMIN */
}
.role-moderator {
    background-color: #28a745; /* Green for MODERATOR */
}
        `]
})
export class DashboardComponent implements OnInit, OnDestroy {

    users: User[] = [];

    groups: Group[] = [];

    authenticatedUser: User = {};

    authenticatedUserRoles: string[];

    roleMap = {
        ROLE_USER: 'User',
        ROLE_MODERATOR: 'Moderator',
        ROLE_ADMIN: 'Admin'
    };

    chartData: any;

    chartOptions: any;

    subscription!: Subscription;

    userSubscription!: Subscription;

    groupSubscription!: Subscription;

    constructor(private userService: UserService, public authService: AuthService, private groupService: GroupService, public layoutService: LayoutService) {
        this.subscription = this.layoutService.configUpdate$
            .pipe(debounceTime(25))
            .subscribe((config) => {
                this.initChart();
            });
    }

    ngOnInit() {

        this.authenticatedUserRoles = this.authService.getRoles().map(role => this.roleMap[role])

        this.userService.get(this.authService.getUserID()).subscribe(u => this.authenticatedUser = u);

        const userSubscription = this.userService.getAll().subscribe(users => {
            this.users = users;
            if (this.users && this.groups) {
                this.initChart();
            }
        });

        const groupSubscription = this.groupService.getGroups().subscribe(groups => {
            this.groups = groups;
            if (this.users && this.groups) {
                this.initChart();
            }

        });
    }

    initChart() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        if (!this.groups || !this.users) {
            return; // Prevent chart initialization if data isn't available
        }

        const chartLabels = this.groups.map(group => group.name);
        const groupData = this.groups.map(group => group.users.length);

        this.chartData = {
            labels: chartLabels,
            datasets: [

                {
                    label: 'Number  Of  Users  Per  Group',
                    data: groupData,
                    fill: false,
                    backgroundColor: documentStyle.getPropertyValue('--green-600'),
                    borderColor: documentStyle.getPropertyValue('--green-600'),
                    tension: .4
                }
            ]
        };

        this.chartOptions = {
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                },
                y: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                }
            }
        };
    }

    getRoleClass(role: string): string {
        switch (role) {
            case 'Admin':
                return 'role-admin';
            case 'Moderator':
                return 'role-moderator';
            case 'User':
            default:
                return 'role-user';
        }
    }
    

    ngOnDestroy() {
        if (this.userSubscription) {
            this.userSubscription.unsubscribe();
        }
        if (this.groupSubscription) {
            this.groupSubscription.unsubscribe();
        }
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
