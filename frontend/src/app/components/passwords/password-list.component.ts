import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PasswordGroup, PasswordEntry, PasswordGeneratorOptions } from '../../interfaces';
import { AddPasswordModalComponent } from './add-password-modal.component';

@Component({
  selector: 'app-password-list',
  standalone: true,
  imports: [CommonModule, FormsModule, AddPasswordModalComponent],
  template: `
    <div class="p-4">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-[var(--text-primary)]">Password Manager</h2>
        <div class="flex gap-3">
          <button class="btn-secondary flex items-center gap-2 hover:scale-105 transition-transform" (click)="showPasswordGenerator = true">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            Generate Password
          </button>
          <button class="btn-primary flex items-center gap-2 hover:scale-105 transition-transform" (click)="showNewGroupModal = true">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Group
          </button>
        </div>
      </div>

      <!-- Password Groups -->
      <div class="grid gap-4 mb-8">
        @for (group of passwordGroups; track group.id) {
          <div class="bg-[var(--card-bg)] p-4 rounded-lg border border-[var(--border-color)]">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-[var(--text-primary)]">{{ group.name }}</h3>
              <button class="btn-secondary" (click)="addPasswordToGroup(group)">Add Password</button>
            </div>
            
            <!-- Passwords in group -->
            <div class="space-y-3">
              @for (entry of getPasswordsForGroup(group.id); track entry.id) {
                <div class="flex items-center justify-between p-3 bg-[var(--secondary-bg)] rounded-lg">
                  <div>
                    <p class="font-medium text-[var(--text-primary)]">{{ entry.name }}</p>
                    <p class="text-sm text-[var(--text-secondary)]">{{ entry.username }}</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <button class="p-2 hover:bg-[var(--primary-bg)] rounded-lg transition-colors" (click)="copyPassword(entry)">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    </button>
                    <button class="p-2 hover:bg-[var(--primary-bg)] rounded-lg transition-colors" (click)="editPassword(entry)">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>
        }
      </div>

      <!-- Password Generator Modal -->
      @if (showPasswordGenerator) {
        <div class="fixed inset-0 bg-gray-900/50 flex items-center justify-center">
          <div class="bg-[var(--primary-bg)] p-6 rounded-lg w-full max-w-md">
            <h3 class="text-xl font-semibold text-[var(--text-primary)] mb-4">Password Generator</h3>
            
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
                  <button class="btn-secondary flex-1" (click)="copyGeneratedPassword()">Copy</button>
                </div>
              </div>
            </div>

            <div class="mt-6 flex justify-end">
              <button class="btn-secondary" (click)="showPasswordGenerator = false">Close</button>
            </div>
          </div>
        </div>
      }

      <!-- Add Password Modal -->
      <app-add-password-modal
        [isOpen]="showAddPasswordModal"
        [groupId]="selectedGroupId"
        (closeModal)="showAddPasswordModal = false"
        (savePassword)="onSavePassword($event)"
      />
    </div>
  `
})
export class PasswordListComponent implements OnInit {
  passwordGroups: PasswordGroup[] = [];
  passwords: PasswordEntry[] = [];
  showPasswordGenerator = false;
  showNewGroupModal = false;
  showAddPasswordModal = false;
  selectedGroupId?: string;
  generatedPassword = '';
  
  generatorOptions: PasswordGeneratorOptions = {
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true
  };

  ngOnInit() {
    // Mock data
    this.passwordGroups = [
      {
        id: '1',
        name: 'Personal',
        createdAt: new Date(),
        updatedAt: new Date(),
        
      },
      {
        id: '2',
        name: 'Work',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.passwords = [
      {
        id: '1',
        groupId: '1',
        name: 'Gmail',
        username: 'user@gmail.com',
        password: 'encrypted-password-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        ownerId: 'user-id-1'
      },
      {
        id: '2',
        groupId: '1',
        name: 'Facebook',
        username: 'user@facebook.com',
        password: 'encrypted-password-2',
        createdAt: new Date(),
        updatedAt: new Date(),
        ownerId: 'user-id-1'
      }
    ];
  }

  getPasswordsForGroup(groupId: string): PasswordEntry[] {
    return this.passwords.filter(p => p.groupId === groupId);
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

  copyGeneratedPassword(): void {
    navigator.clipboard.writeText(this.generatedPassword);
  }

  copyPassword(entry: PasswordEntry): void {
    navigator.clipboard.writeText(entry.password);
  }

  editPassword(entry: PasswordEntry): void {
    console.log('Edit password:', entry);
  }

  addPasswordToGroup(group: PasswordGroup): void {
    this.selectedGroupId = group.id;
    this.showAddPasswordModal = true;
  }

  onSavePassword(password: PasswordEntry): void {
    this.passwords.push(password);
  }
}