import { NgModule } from '@angular/core';
import { HashLocationStrategy, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AppLayoutModule } from './layout/app.layout.module';
import { NotfoundComponent } from './demo/components/notfound/notfound.component';
import { ProductService } from './demo/service/product.service';
import { CountryService } from './demo/service/country.service';
import { CustomerService } from './demo/service/customer.service';
import { EventService } from './demo/service/event.service';
import { IconService } from './demo/service/icon.service';
import { NodeService } from './demo/service/node.service';
import { PhotoService } from './demo/service/photo.service';
import { UserService } from './demo/service/user.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { InterceptorService } from './demo/service/interceptor.service';
import { OverlayPanel } from 'primeng/overlaypanel';
import { UserSessionService } from './demo/service/user-session.service';
import { AuthGuard } from './demo/service/auth-guard.service';
import { AuthService } from './demo/service/auth.service';


@NgModule({
    declarations: [AppComponent, NotfoundComponent],
    imports: [AppRoutingModule, AppLayoutModule],
    providers: [
        AuthService,
        AuthGuard,
        { provide: LocationStrategy, useClass: PathLocationStrategy },
        { provide: HTTP_INTERCEPTORS, useClass: InterceptorService, multi: true },
        CountryService, CustomerService, EventService, IconService, NodeService,
        PhotoService, ProductService ,UserService,OverlayPanel,UserSessionService
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
