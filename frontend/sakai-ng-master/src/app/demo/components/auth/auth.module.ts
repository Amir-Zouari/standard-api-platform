import { AuthService } from './../../service/auth.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthRoutingModule } from './auth-routing.module';
import { UserSessionService } from '../../service/user-session.service';
import { UserService } from '../../service/user.service';
import { ToastModule } from 'primeng/toast';

@NgModule({
    imports: [
        CommonModule,
        AuthRoutingModule
    ],
    //providers:[AuthService]
})
export class AuthModule { }
