import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PasswordEntry, PasswordGeneratorOptions } from '../../interfaces';

@Component({
  selector: 'app-add-password-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50">
        <div class="bg-[var(--primary-bg)] p-6 rounded-lg w-full max-w-md">
          <h3 class="text-xl font-semibold text-[var(--text-primary)] mb-4">Add Password</h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-[var(--text-secondary)] mb-1">Name</label>
              <input
                type="text"
                [(ngModel)]="newPassword.name"
                placeholder="e.g., Gmail Account"
                class="w-full px-3 py-2 bg-[var(--secondary-bg)] rounded-lg border border-[var(--border-color)]"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-[var(--text-secondary)] mb-1">Username</label>
              <input
                type="text"
                [(ngModel)]="newPassword.username"
                placeholder="e.g., user@example.com"
                class="w-full px-3 py-2 bg-[var(--secondary-bg)] rounded-lg border border-[var(--border-color)]"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-[var(--text-secondary)] mb-1">Password</label>
              <div class="flex gap-2">
                <input
                  [type]="showPassword ? 'text' : 'password'"
                  [(ngModel)]="newPassword.password"
                  class="flex-1 px-3 py-2 bg-[var(--secondary-bg)] rounded-lg border border-[var(--border-color)]"
                />
                <button 
                  class="btn-secondary p-2" 
                  (click)="showPassword = !showPassword"
                  [title]="showPassword ? 'Hide password' : 'Show password'"
                >
                  @if (showPassword) {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  }
                </button>
                <button 
                  class="btn-secondary p-2" 
                  (click)="showGenerateOptions = true"
                  title="Generate password"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-[var(--text-secondary)] mb-1">URL (optional)</label>
              <input
                type="url"
                [(ngModel)]="newPassword.url"
                placeholder="e.g., https://gmail.com"
                class="w-full px-3 py-2 bg-[var(--secondary-bg)] rounded-lg border border-[var(--border-color)]"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-[var(--text-secondary)] mb-1">Notes (optional)</label>
              <textarea
                [(ngModel)]="newPassword.notes"
                rows="3"
                class="w-full px-3 py-2 bg-[var(--secondary-bg)] rounded-lg border border-[var(--border-color)]"
              ></textarea>
            </div>
          </div>

          <div class="mt-6 flex justify-end gap-2">
            <button class="btn-secondary" (click)="close()">Cancel</button>
            <button class="btn-primary" (click)="save()">Save Password</button>
          </div>
        </div>
      </div>

      @if (showGenerateOptions) {
        <div class="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50">
          <div class="bg-[var(--primary-bg)] p-6 rounded-lg w-full max-w-md">
            <h3 class="text-xl font-semibold text-[var(--text-primary)] mb-4">Generate Password</h3>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-[var(--text-secondary)] mb-1">Length</label>
                <input
                  type="number"
                  [(ngModel)]="generatorOptions.length"
                  class="w-full px-3 py-2 bg-[var(--secondary-bg)] rounded-lg border border-[var(--border-color)]"
                  min="8"
                  max="64"
                />
              </div>

              <div class="space-y-2">
                <label class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    [(ngModel)]="generatorOptions.includeUppercase"
                    class="rounded border-[var(--border-color)]"
                  />
                  <span class="text-[var(--text-primary)]">Uppercase letters</span>
                </label>
                <label class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    [(ngModel)]="generatorOptions.includeLowercase"
                    class="rounded border-[var(--border-color)]"
                  />
                  <span class="text-[var(--text-primary)]">Lowercase letters</span>
                </label>
                <label class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    [(ngModel)]="generatorOptions.includeNumbers"
                    class="rounded border-[var(--border-color)]"
                  />
                  <span class="text-[var(--text-primary)]">Numbers</span>
                </label>
                <label class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    [(ngModel)]="generatorOptions.includeSymbols"
                    class="rounded border-[var(--border-color)]"
                  />
                  <span class="text-[var(--text-primary)]">Symbols</span>
                </label>
              </div>

              <div>
                <input
                  type="text"
                  [value]="generatedPassword"
                  readonly
                  class="w-full px-3 py-2 bg-[var(--secondary-bg)] rounded-lg border border-[var(--border-color)] mb-2"
                />
                <div class="flex gap-2">
                  <button class="btn-primary flex-1" (click)="generatePassword()">Generate</button>
                  <button class="btn-secondary flex-1" (click)="useGeneratedPassword()">Use Password</button>
                </div>
              </div>
            </div>

            <div class="mt-6 flex justify-end">
              <button class="btn-secondary" (click)="showGenerateOptions = false">Close</button>
            </div>
          </div>
        </div>
      }
    }
  `
})
export class AddPasswordModalComponent {
  @Input() isOpen = false;
  @Input() groupId?: string;
  @Output() closeModal = new EventEmitter<void>();
  @Output() savePassword = new EventEmitter<PasswordEntry>();

  showPassword = false;
  showGenerateOptions = false;
  generatedPassword = '';

  newPassword: Partial<PasswordEntry> = {
    name: '',
    username: '',
    password: '',
    url: '',
    notes: ''
  };

  generatorOptions: PasswordGeneratorOptions = {
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true
  };

  close(): void {
    this.resetForm();
    this.closeModal.emit();
  }

  save(): void {
    if (this.newPassword.name && this.newPassword.username && this.newPassword.password) {
      const password: PasswordEntry = {
        id: crypto.randomUUID(),
        ownerId : crypto.randomUUID(),
        groupId: this.groupId,
        name: this.newPassword.name,
        username: this.newPassword.username,
        password: this.newPassword.password,
        url: this.newPassword.url,
        notes: this.newPassword.notes,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.savePassword.emit(password);
      this.resetForm();
      this.close();
    }
  }

  generatePassword(): void {
    const chars = {
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      numbers: '0123456789',
      symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    };

    let validChars = '';
    if (this.generatorOptions.includeUppercase) validChars += chars.uppercase;
    if (this.generatorOptions.includeLowercase) validChars += chars.lowercase;
    if (this.generatorOptions.includeNumbers) validChars += chars.numbers;
    if (this.generatorOptions.includeSymbols) validChars += chars.symbols;

    let password = '';
    for (let i = 0; i < this.generatorOptions.length; i++) {
      const randomIndex = Math.floor(Math.random() * validChars.length);
      password += validChars[randomIndex];
    }

    this.generatedPassword = password;
  }

  useGeneratedPassword(): void {
    this.newPassword.password = this.generatedPassword;
    this.showGenerateOptions = false;
  }

  private resetForm(): void {
    this.newPassword = {
      name: '',
      username: '',
      password: '',
      url: '',
      notes: ''
    };
    this.showPassword = false;
    this.showGenerateOptions = false;
    this.generatedPassword = '';
  }
}