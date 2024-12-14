import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../service/auth-guard.service';

@NgModule({
    imports: [RouterModule.forChild([
        { path: 'users', loadChildren: () => import('./crud/crud.module').then(m => m.CrudModule), canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_MODERATOR', 'ROLE_ADMIN'] } },
        { path: 'groups', loadChildren: () => import('./group/group.module').then(m => m.GroupModule), canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_USER', 'ROLE_MODERATOR', 'ROLE_ADMIN'] } },
        { path: 'empty', loadChildren: () => import('./empty/emptydemo.module').then(m => m.EmptyDemoModule) },
        { path: 'timeline', loadChildren: () => import('./timeline/timelinedemo.module').then(m => m.TimelineDemoModule) },
        { path: '**', redirectTo: '/notfound' }
    ])],
    exports: [RouterModule]
})
export class PagesRoutingModule { }
