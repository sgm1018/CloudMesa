import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShareSettings } from '../../interfaces';

@Component({
  selector: 'app-share-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 bg-gray-900/50 flex items-center justify-center">
        <div class="bg-[var(--primary-bg)] p-6 rounded-lg w-full max-w-md">
          <h2 class="h2">Share</h2>
          
          <div class="space-y-4">
            <div>
              <h3 class="h3">Public Link</h3>
              <div class="flex gap-2">
                <input
                  type="text"
                  [value]="shareSettings.link"
                  readonly
                  class="flex-1 px-4 py-2 bg-[var(--secondary-bg)] text-[var(--text-primary)] rounded-lg border border-[var(--border-color)]"
                />
                <button class="btn-primary" (click)="copyLink()">Copy</button>
              </div>
            </div>

            <div>
              <h3 class="h3">Protected Link</h3>
              <div class="space-y-2">
                <input
                  type="password"
                  placeholder="Set password"
                  class="w-full px-4 py-2 bg-[var(--secondary-bg)] text-[var(--text-primary)] rounded-lg border border-[var(--border-color)]"
                />
                <button class="btn-secondary w-full">Generate Protected Link</button>
              </div>
            </div>

            <div>
              <h3 class="h3">Share with Users</h3>
              <input
                type="text"
                placeholder="Search users..."
                class="w-full px-4 py-2 bg-[var(--secondary-bg)] text-[var(--text-primary)] rounded-lg border border-[var(--border-color)]"
              />
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
  @Output() closeModal = new EventEmitter<void>();

  shareSettings: ShareSettings = {
    id: '',
    fileId: '',
    type: 'public',
    link: 'https://clouddrive.example/share/abc123'
  };

  close(): void {
    this.closeModal.emit();
  }

  share(): void {
    // Implement share logic
    this.close();
  }

  copyLink(): void {
    if (this.shareSettings.link) {
      navigator.clipboard.writeText(this.shareSettings.link);
    }
  }

  
}