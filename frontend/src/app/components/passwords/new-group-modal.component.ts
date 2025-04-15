import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PasswordGroup } from '../../interfaces';

@Component({
  selector: 'app-new-group-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 bg-gray-900/50  flex items-center justify-center z-50">
        <div class="bg-primary-bg p-6 rounded-lg w-full max-w-md">
          <h3 class="text-xl font-semibold text-text-primary mb-4">New Password Group</h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-text-secondary mb-1">Name</label>
              <input
                type="text"
                [(ngModel)]="newGroup.name"
                placeholder="e.g., Personal Accounts"
                class="w-full px-3 py-2 bg-secondary-bg rounded-lg border border-[var(--border-color)]"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-text-secondary mb-1">Description (optional)</label>
              <textarea
                [(ngModel)]="newGroup.description"
                rows="3"
                placeholder="Add a description for this group..."
                class="w-full px-3 py-2 bg-secondary-bg rounded-lg border border-[var(--border-color)]"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-text-secondary mb-1">Color</label>
              <div class="flex gap-2">
                @for (color of colors; track color) {
                  <button
                    class="w-8 h-8 rounded-full border-2 transition-transform"
                    [style.background-color]="color"
                    [class.border-[var(--accent)]="newGroup.color === color"
                    [class.scale-110]="newGroup.color === color"
                    (click)="newGroup.color = color"
                  ></button>
                }
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-text-secondary mb-1">Icon</label>
              <div class="grid grid-cols-8 gap-2">
                @for (icon of icons; track icon) {
                  <button
                    class="p-2 rounded-lg border transition-colors"
                    [class.bg-[var(--accent)]]="newGroup.icon === icon"
                    [class.text-white]="newGroup.icon === icon"
                    (click)="newGroup.icon = icon"
                  >
                    {{ icon }}
                  </button>
                }
              </div>
            </div>

            <div>
              <label class="flex items-center gap-2">
                <input
                  type="checkbox"
                  [(ngModel)]="newGroup.isPrivate"
                  class="rounded border-[var(--border-color)]"
                />
                <span class="text-text-primary">Private group</span>
              </label>
              <p class="text-sm text-text-secondary mt-1">Private groups are only visible to you</p>
            </div>
          </div>

          <div class="mt-6 flex justify-end gap-2">
            <button class="btn-secondary" (click)="close()">Cancel</button>
            <button class="btn-primary" (click)="save()">Create Group</button>
          </div>
        </div>
      </div>
    }
  `
})
export class NewGroupModalComponent {
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveGroup = new EventEmitter<PasswordGroup>();

  colors = [
    '#ef4444', '#f97316', '#f59e0b', '#84cc16', 
    '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6'
  ];

  icons = ['🔑', '🔒', '🏠', '💼', '🌐', '💳', '📱', '💻'];

  newGroup: Partial<PasswordGroup> = {
    name: '',
    description: '',
    color: this.colors[0],
    icon: this.icons[0],
    isPrivate: false
  };

  close(): void {
    this.resetForm();
    this.closeModal.emit();
  }

  save(): void {
    if (this.newGroup.name) {
      const group: PasswordGroup = {
        id: crypto.randomUUID(),
        name: this.newGroup.name,
        description: this.newGroup.description,
        color: this.newGroup.color,
        icon: this.newGroup.icon,
        isPrivate: this.newGroup.isPrivate ?? false,
        createdAt: new Date(),
        updatedAt: new Date(),
        ownerId: 'current-user-id', // This should come from an auth service
        sharedWith: []
      };
      this.saveGroup.emit(group);
      this.resetForm();
      this.close();
    }
  }

  private resetForm(): void {
    this.newGroup = {
      name: '',
      description: '',
      color: this.colors[0],
      icon: this.icons[0],
      isPrivate: false
    };
  }
}