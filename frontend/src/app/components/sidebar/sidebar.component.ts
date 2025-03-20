import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StorageQuota } from '../../interfaces';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="bg-[var(--secondary-bg)] w-64 h-screen p-4 flex flex-col gap-4 lg:block" [class.hidden]="!isOpen">
      <div class="mb-6">
        <button class="btn-primary w-full flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          New Folder
        </button>
      </div>

      <nav class="space-y-2">
        @for (item of menuItems; track item.id) {
          <a 
            [routerLink]="item.route"
            routerLinkActive="bg-[var(--primary-bg)]"
            class="flex items-center gap-2 px-4 py-2 rounded-lg text-[var(--text-primary)] hover:bg-[var(--primary-bg)]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="item.icon" />
            </svg>
            {{ item.label }}
          </a>
        }
      </nav>

      <div class="mt-auto">
        <div class="p-4 bg-[var(--primary-bg)] rounded-lg">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[var(--text-primary)]">Storage</span>
            <span class="text-[var(--text-secondary)]">
              {{ storageQuota.used }}{{ storageQuota.unit }} / {{ storageQuota.total }}{{ storageQuota.unit }}
            </span>
          </div>
          <div class="w-full bg-[var(--secondary-bg)] rounded-full h-2">
            <div 
              class="bg-[var(--accent)] h-2 rounded-full" 
              [style.width.%]="(storageQuota.used / storageQuota.total) * 100"
            ></div>
          </div>
        </div>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  isOpen = true;
  
  menuItems = [
    {
      id: 'files',
      label: 'My Files',
      icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
      route: '/files'
    },
    {
      id: 'shared',
      label: 'Shared with me',
      icon: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z',
      route: '/shared'
    },
    {
      id: 'passwords',
      label: 'Passwords',
      icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
      route: '/passwords'
    },
    {
      id: 'trash',
      label: 'Trash',
      icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
      route: '/trash'
    }
  ];

  storageQuota: StorageQuota = {
    used: 5,
    total: 10,
    unit: 'GB'
  };
}