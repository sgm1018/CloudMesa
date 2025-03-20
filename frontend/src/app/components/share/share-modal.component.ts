import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShareSettings, User } from '../../interfaces';

@Component({
  selector: 'app-share-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50">
        <div class="bg-[var(--primary-bg)] p-6 rounded-lg w-full max-w-md">
          <h2 class="text-xl font-semibold text-[var(--text-primary)] mb-4">Share {{ itemType }}</h2>
          
          <div class="space-y-6">
            <!-- Share with Users -->
            <div>
              <h3 class="text-lg font-medium text-[var(--text-primary)] mb-2">Share with Users</h3>
              <div class="space-y-4">
                <div>
                  <input
                    type="text"
                    [(ngModel)]="userSearchQuery"
                    placeholder="Search users..."
                    class="w-full px-4 py-2 bg-[var(--secondary-bg)] text-[var(--text-primary)] rounded-lg border border-[var(--border-color)]"
                  />
                  @if (filteredUsers.length > 0) {
                    <div class="mt-2 bg-[var(--card-bg)] rounded-lg border border-[var(--border-color)] max-h-48 overflow-y-auto">
                      @for (user of filteredUsers; track user.id) {
                        <button
                          class="w-full px-4 py-2 flex items-center gap-3 hover:bg-[var(--secondary-bg)]"
                          (click)="selectUser(user)"
                        >
                          <div class="w-8 h-8 rounded-full bg-[var(--accent)] text-white flex items-center justify-center">
                            {{ user.name[0].toUpperCase() }}
                          </div>
                          <div class="text-left">
                            <p class="text-[var(--text-primary)]">{{ user.name }}</p>
                            <p class="text-sm text-[var(--text-secondary)]">{{ user.email }}</p>
                          </div>
                        </button>
                      }
                    </div>
                  }
                </div>

                @if (selectedUsers.length > 0) {
                  <div class="space-y-2">
                    @for (user of selectedUsers; track user.id) {
                      <div class="flex items-center justify-between p-2 bg-[var(--secondary-bg)] rounded-lg">
                        <div class="flex items-center gap-2">
                          <div class="w-8 h-8 rounded-full bg-[var(--accent)] text-white flex items-center justify-center">
                            {{ user.name[0].toUpperCase() }}
                          </div>
                          <span class="text-[var(--text-primary)]">{{ user.name }}</span>
                        </div>
                        <div class="flex items-center gap-2">
                          <select
                            [(ngModel)]="userPermissions[user.id]"
                            class="px-2 py-1 bg-[var(--card-bg)] rounded border border-[var(--border-color)]"
                          >
                            <option value="read">Read</option>
                            <option value="write">Write</option>
                          </select>
                          <button
                            class="p-1 text-red-500 hover:bg-red-500/10 rounded"
                            (click)="removeUser(user)"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    }
                  </div>
                }

                <label class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    [(ngModel)]="shareSettings.notifyByEmail"
                    class="rounded border-[var(--border-color)]"
                  />
                  <span class="text-[var(--text-primary)]">Notify users by email</span>
                </label>
              </div>
            </div>

            <!-- Share via Link -->
            <div>
              <h3 class="text-lg font-medium text-[var(--text-primary)] mb-2">Share via Link</h3>
              <div class="space-y-4">
                @if (shareSettings.link) {
                  <div class="flex gap-2">
                    <input
                      type="text"
                      [value]="shareSettings.link"
                      readonly
                      class="flex-1 px-4 py-2 bg-[var(--secondary-bg)] text-[var(--text-primary)] rounded-lg border border-[var(--border-color)]"
                    />
                    <button class="btn-secondary" (click)="copyLink()">Copy</button>
                  </div>
                } @else {
                  <button class="btn-secondary w-full" (click)="generateLink()">Generate Link</button>
                }

                @if (shareSettings.link) {
                  <div class="space-y-2">
                    <div>
                      <label class="block text-sm font-medium text-[var(--text-secondary)] mb-1">Link Expiration</label>
                      <select
                        [(ngModel)]="linkExpiration"
                        class="w-full px-3 py-2 bg-[var(--secondary-bg)] rounded-lg border border-[var(--border-color)]"
                        (change)="updateLinkExpiration()"
                      >
                        <option value="never">Never</option>
                        <option value="1day">1 day</option>
                        <option value="7days">7 days</option>
                        <option value="30days">30 days</option>
                        <option value="custom">Custom date</option>
                      </select>
                    </div>

                    @if (linkExpiration === 'custom') {
                      <input
                        type="date"
                        [(ngModel)]="customExpirationDate"
                        class="w-full px-3 py-2 bg-[var(--secondary-bg)] rounded-lg border border-[var(--border-color)]"
                        (change)="updateLinkExpiration()"
                      />
                    }
                  </div>
                }
              </div>
            </div>
          </div>

          <div class="mt-6 flex justify-end gap-2">
            <button class="btn-secondary" (click)="close()">Cancel</button>
            <button class="btn-primary" (click)="share()">Share</button>
          </div>
        </div>
      </div>
    }
  `
})
export class ShareModalComponent {
  @Input() isOpen = false;
  @Input() itemType: 'file' | 'password' | 'group' = 'file';
  @Input() itemId = '';
  @Output() closeModal = new EventEmitter<void>();
  @Output() shareItem = new EventEmitter<ShareSettings>();

  userSearchQuery = '';
  linkExpiration: 'never' | '1day' | '7days' | '30days' | 'custom' = 'never';
  customExpirationDate = '';
  selectedUsers: User[] = [];
  userPermissions: Record<string, 'read' | 'write'> = {};

  shareSettings: ShareSettings = {
    id: '',
    fileId: '',
    type: 'private',
    notifyByEmail: false
  };

  // Mock users for demo
  users: User[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com' }
  ];

  get filteredUsers(): User[] {
    const query = this.userSearchQuery.toLowerCase();
    return this.users.filter(user => 
      !this.selectedUsers.includes(user) &&
      (user.name.toLowerCase().includes(query) || 
       user.email.toLowerCase().includes(query))
    );
  }

  selectUser(user: User): void {
    this.selectedUsers.push(user);
    this.userPermissions[user.id] = 'read';
    this.userSearchQuery = '';
  }

  removeUser(user: User): void {
    this.selectedUsers = this.selectedUsers.filter(u => u.id !== user.id);
    delete this.userPermissions[user.id];
  }

  generateLink(): void {
    this.shareSettings = {
      ...this.shareSettings,
      id: crypto.randomUUID(),
      fileId: this.itemId,
      type: 'public',
      link: `https://example.com/share/${crypto.randomUUID()}`
    };
  }

  copyLink(): void {
    if (this.shareSettings.link) {
      navigator.clipboard.writeText(this.shareSettings.link);
    }
  }

  updateLinkExpiration(): void {
    if (!this.shareSettings.link) return;

    let expiresAt: Date | undefined;
    
    switch (this.linkExpiration) {
      case '1day':
        expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        break;
      case '7days':
        expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        break;
      case 'custom':
        expiresAt = this.customExpirationDate ? new Date(this.customExpirationDate) : undefined;
        break;
      default:
        expiresAt = undefined;
    }

    this.shareSettings.expiresAt = expiresAt;
  }

  share(): void {
    const settings: ShareSettings = {
      ...this.shareSettings,
      allowedUsers: this.selectedUsers.map(user => user.id)
    };
    this.shareItem.emit(settings);
    this.close();
  }

  close(): void {
    this.resetForm();
    this.closeModal.emit();
  }

  private resetForm(): void {
    this.shareSettings = {
      id: '',
      fileId: '',
      type: 'private',
      notifyByEmail: false
    };
    this.selectedUsers = [];
    this.userPermissions = {};
    this.userSearchQuery = '';
    this.linkExpiration = 'never';
    this.customExpirationDate = '';
  }
}