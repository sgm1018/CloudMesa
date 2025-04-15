import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, RouterOutlet, Routes } from '@angular/router';
import { NavbarComponent } from './app/components/navbar/navbar.component';
import { SidebarComponent } from './app/components/sidebar/sidebar.component';
import { FileListComponent } from './app/components/file-list/file-list.component';
import { PasswordListComponent } from './app/components/passwords/password-list.component';
import { ShareModalComponent } from './app/components/share-modal/share-modal.component';
import { AuthPageComponent } from './app/pages/auth-page/auth-page.component';
import { MainPageComponent } from './app/pages/main-page/main-page.component';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthGuard } from './app/guards/auth.guard';
import { authInterceptor } from './app/interceptors/interceptor';

const routes: Routes = [
  { path: '', redirectTo: '/main/files', pathMatch: 'full' },

  { path: 'auth', component: AuthPageComponent },
  { 
    path: 'main', 
    component: MainPageComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'files', pathMatch: 'full' },
      { path: 'files', component: FileListComponent },
      { path: 'passwords', component: PasswordListComponent },
      { path: 'shared', component: FileListComponent },
      { path: 'trash', component: FileListComponent }
    ]
  }
];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent, ShareModalComponent],
  template: `<router-outlet />`
})
export class App {
  name = 'CloudMesa';
}

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    

  ]
});