import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { NavbarComponent } from "../../components/navbar/navbar.component";
import { RouterOutlet } from "@angular/router";
import { ShareModalComponent } from "../../components/share-modal/share-modal.component";
import { SidebarComponent } from "../../components/sidebar/sidebar.component";

@Component({
  selector: "app-main-page",
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    RouterOutlet,
    ShareModalComponent,
    SidebarComponent,
  ],
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
  `,
})
export class MainPageComponent {
  constructor(){}


}
