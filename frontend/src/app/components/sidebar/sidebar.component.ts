import { ThemeService } from './../../services/theme.service';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StorageQuota } from '../../interfaces';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="bg-secondary-bg flex-1 flex flex-col shadow-lg transition-all duration-300 h-screen" [class.hidden]="!isOpen">
      <!-- <div class="p-5 border-b border-[var(--border-color)]">
        <h2 class="text-lg font-semibold mb-4 text-text-primary">Cloud Mesa</h2>
        <button class="btn-primary w-full flex items-center justify-center gap-2 rounded-md py-2.5 transition-all hover:shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>New Folder</span>
        </button>
      </div> -->
      <nav class="flex-grow py-4 px-3">
        <div class="flex items-center justify-center mb-4">
          <img class="h-9 w-auto rounded" [src]="getThemeService().logoUrl" alt="Logo" />  
        </div>
        <p class="text-xs uppercase font-medium text-accent mb-3 px-3">Main Navigation</p>
        @for (item of menuItems; track item.id) {
          <a 
            [routerLink]="item.route"
            routerLinkActive="bg-primary-bg text-blue-500 font-medium shadow-sm"
            class="flex items-center gap-3 px-4 py-3 mb-1 rounded-lg text-text-primary hover:bg-primary-bg transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="item.icon" />
            </svg>
            {{ item.label }}
          </a>
        }
      </nav>

      <div class="p-4 mt-auto border-t border-[var(--border-color)]">
        <div class="p-4 bg-primary-bg rounded-lg hover:shadow-md transition-all">
          <div class="flex items-center justify-between mb-3">
            <span class="text-text-primary font-medium">Storage</span>
            <span class="text-text-secondary text-sm bg-secondary-bg py-1 px-2 rounded-full">
              {{ storageQuota.used }}{{ storageQuota.unit }} / {{ storageQuota.total }}{{ storageQuota.unit }}
            </span>
          </div>
          <div class="w-full bg-secondary-bg rounded-full h-2.5">
            <div 
              class="bg-[var(--accent)] h-2.5 rounded-full transition-all duration-300" 
              [style.width.%]="(storageQuota.used / storageQuota.total) * 100"
            ></div>
          </div>
          <div class="text-xs text-text-secondary mt-2 text-right">
            {{ Math.round((storageQuota.used / storageQuota.total) * 100) }}% used
          </div>
        </div>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  isOpen = true;
  Math = Math; // Expose Math for percentage calculation
  
  menuItems = [
    {
      id: 'files',
      label: 'My Files',
      icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
      route: '/main/files'
    },
    {
      id: 'shared',
      label: 'Shared with me',
      icon: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z',
      route: '/main/shared'
    },
    {
      id: 'passwords',
      label: 'Passwords',
      icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
      route: '/main/passwords'
    },
    {
      id: 'trash',
      label: 'Trash',
      icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
      route: '/main/trash'
    }
  ];

  storageQuota: StorageQuota = {
    used: 5,
    total: 10,
    unit: 'GB'
  };


  constructor(private themeService : ThemeService) {
  }

  getThemeService() {
    return this.themeService;
  }
}