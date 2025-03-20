import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileItem } from '../../interfaces';

export interface FileFilters {
  type: 'all' | 'files' | 'folders';
  shared: 'all' | 'shared' | 'private';
  sortBy: 'name' | 'date' | 'size';
  sortOrder: 'asc' | 'desc';
}

@Component({
  selector: 'app-file-filters',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-4 mb-4 flex-wrap">
      <div class="flex items-center gap-2">
        <label class="text-[var(--text-secondary)]">Type:</label>
        <select 
          class="px-3 py-1.5 bg-[var(--secondary-bg)] text-[var(--text-primary)] rounded-lg border border-[var(--border-color)]"
          [value]="filters.type"
          (change)="updateFilters('type', $event)"
        >
          <option value="all">All</option>
          <option value="files">Files</option>
          <option value="folders">Folders</option>
        </select>
      </div>

      <div class="flex items-center gap-2">
        <label class="text-[var(--text-secondary)]">Show:</label>
        <select 
          class="px-3 py-1.5 bg-[var(--secondary-bg)] text-[var(--text-primary)] rounded-lg border border-[var(--border-color)]"
          [value]="filters.shared"
          (change)="updateFilters('shared', $event)"
        >
          <option value="all">All Items</option>
          <option value="shared">Shared</option>
          <option value="private">Private</option>
        </select>
      </div>

      <div class="flex items-center gap-2">
        <label class="text-[var(--text-secondary)]">Sort by:</label>
        <select 
          class="px-3 py-1.5 bg-[var(--secondary-bg)] text-[var(--text-primary)] rounded-lg border border-[var(--border-color)]"
          [value]="filters.sortBy"
          (change)="updateFilters('sortBy', $event)"
        >
          <option value="name">Name</option>
          <option value="date">Date</option>
          <option value="size">Size</option>
        </select>
        <button 
          class="btn-secondary p-1.5"
          (click)="toggleSortOrder()"
        >
          @if (filters.sortOrder === 'asc') {
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9M3 12h5m0 0v8m0-8h2" />
            </svg>
          } @else {
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9M3 12h5m0 0v8m0-8h2" transform="rotate(180 12 12)" />
            </svg>
          }
        </button>
      </div>
    </div>
  `
})
export class FileFiltersComponent {
  @Input() filters: FileFilters = {
    type: 'all',
    shared: 'all',
    sortBy: 'name',
    sortOrder: 'asc'
  };

  @Output() filtersChange = new EventEmitter<FileFilters>();

  updateFilters(key: keyof FileFilters, event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.filters = { ...this.filters, [key]: value };
    this.filtersChange.emit(this.filters);
  }

  toggleSortOrder(): void {
    this.filters = {
      ...this.filters,
      sortOrder: this.filters.sortOrder === 'asc' ? 'desc' : 'asc'
    };
    this.filtersChange.emit(this.filters);
  }
}