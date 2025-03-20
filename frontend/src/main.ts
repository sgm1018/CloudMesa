import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './app/components/navbar/navbar.component';
import { SidebarComponent } from './app/components/sidebar/sidebar.component';
import { FileListComponent } from './app/components/file-list/file-list.component';
import { PasswordListComponent } from './app/components/passwords/password-list.component';
import { ShareModalComponent } from './app/components/share-modal/share-modal.component';

const routes = [
  { path: '', redirectTo: '/files', pathMatch: 'full' as 'full' }, // Fix is here
  { path: 'files', component: FileListComponent },
  { path: 'passwords', component: PasswordListComponent },
  { path: 'shared', component: FileListComponent },
  { path: 'trash', component: FileListComponent }
];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent, ShareModalComponent],
  template: `
    <div class="min-h-screen bg-[var(--primary-bg)]">
      <app-navbar />
      <div class="flex">
        <app-sidebar />
        <main class="flex-1">
          <router-outlet />
        </main>
      </div>
      <app-share-modal [isOpen]="false" />
    </div>
  `
})
export class App {
  name = 'CloudDrive';
}

bootstrapApplication(App, {
  providers: [
    provideRouter(routes)
  ]
});