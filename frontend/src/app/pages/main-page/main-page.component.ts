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
    <div class="min-h-screen bg-primary-bg">
      <div class="flex flex-row">
        <app-sidebar class="flex h-full" />
        <div class="flex flex-col flex-1">
          <app-navbar />
          <main class="flex-1">
            <router-outlet />
          </main>
        </div>
      </div>
    </div>
  `,
})
export class MainPageComponent {
  constructor() {}
}
