import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { marked } from 'marked';
import { FileItem } from '../../interfaces';
import { FileFiltersComponent, FileFilters } from '../file-filters/file-filters.component';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'app-file-list',
  standalone: true,
  imports: [CommonModule, FileFiltersComponent],
  template: `
    <div class="p-4">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-text-primary">My Files</h2>
        <div class="flex gap-3">
          <button class="btn-secondary flex items-center gap-2 hover:scale-105 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Upload File
          </button>
          <button class="btn-primary flex items-center gap-2 hover:scale-105 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Folder
          </button>
        </div>
      </div>

      <app-file-filters
        [filters]="filters"
        (filtersChange)="onFiltersChange($event)"
        class="mb-6"
      />

      @if (selectedItems.length > 0) {
        <div class="mb-6 flex items-center gap-3 p-4 bg-secondary-bg rounded-lg border border-[var(--border-color)]">
          <span class="text-text-secondary">{{ selectedItems.length }} items selected</span>
          <div class="flex gap-3 ml-auto">
            <button class="btn-danger flex items-center gap-2 hover:scale-105 transition-transform" (click)="deleteSelected()">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
            <button class="btn-secondary flex items-center gap-2 hover:scale-105 transition-transform" (click)="moveSelected()">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Move
            </button>
            <button class="btn-primary flex items-center gap-2 hover:scale-105 transition-transform" (click)="shareSelected()">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
          </div>
        </div>
      }

      <div class="grid gap-4">
        <!-- Header -->
        <div class="grid grid-cols-12 px-4 py-2 text-sm font-medium text-text-secondary">
          <div class="col-span-6">Name</div>
          <div class="col-span-2">Size</div>
          <div class="col-span-3">Modified</div>
          <div class="col-span-1"></div>
        </div>

        @for (item of filteredItems; track item.id) {
          <div 
            class="grid grid-cols-12 items-center px-4 py-3 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] hover:bg-secondary-bg transition-colors group"
            [class.bg-[var(--accent)]]="item.selected">
            <div class="col-span-6 flex items-center gap-3">
              <div class="flex items-center gap-3">
                <input
                  type="checkbox"
                  [checked]="item.selected"
                  (change)="toggleSelect(item)"
                  class="w-4 h-4 rounded border-[var(--border-color)] text-[var(--accent)] focus:ring-[var(--accent)]"
                />
                @if (item.type === 'folder') {
                  <div class="p-2 rounded-lg bg-[var(--accent)]/10">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                } @else {
                  <div class="p-2 rounded-lg bg-secondary-bg">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                }
              </div>
              <div class="min-w-0">
                <p class="text-text-primary font-medium truncate">{{ item.name }}</p>
                @if (item.type === 'file') {
                  <p class="text-xs text-text-secondary">{{ item.mimeType }}</p>
                }
              </div>
              @if (item.shared) {
                <div class="ml-2 p-1 rounded-full bg-[var(--accent)]/10">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </div>
              }
            </div>
            <div class="col-span-2 text-sm text-text-secondary">
              {{ item.size || '--' }}
            </div>
            <div class="col-span-3 text-sm text-text-secondary">
              {{ item.modifiedDate | date:'medium' }}
            </div>
            <div class="col-span-1 opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-2">
              <button class="p-1 hover:bg-secondary-bg rounded-lg transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          </div>
        }
      </div>

      @if (readmeContent) {
        <div class="mt-8 prose prose-sm text-text-primary max-w-none p-6 bg-secondary-bg rounded-lg border border-[var(--border-color)]" [innerHTML]="readmeContent">
        </div>
      }
    </div>
  `
})
export class FileListComponent implements OnInit {
  items: FileItem[] = [];
  filteredItems: FileItem[] = [];
  readmeContent: string = '';
  
  filters: FileFilters = {
    type: 'all',
    shared: 'all',
    sortBy: 'name',
    sortOrder: 'asc'
  };

  get selectedItems(): FileItem[] {
    return this.items.filter((item) => item.selected);
  }

  constructor(private searchService: SearchService) {}

  ngOnInit() {
    // Mock data
    this.items = [
      {
        id: '1',
        name: 'Documents',
        type: 'folder',
        modifiedDate: new Date(),
        selected: false,
        shared: true,
        owner: 'user1',
        path: '/Documents'
      },
      {
        id: '2',
        name: 'report.pdf',
        type: 'file',
        size: '2.5 MB',
        modifiedDate: new Date(),
        selected: false,
        shared: false,
        owner: 'user1',
        mimeType: 'application/pdf',
        path: '/report.pdf'
      },
      {
        id: '3',
        name: 'README.md',
        type: 'file',
        size: '4 KB',
        modifiedDate: new Date(),
        selected: false,
        shared: false,
        owner: 'user1',
        mimeType: 'text/markdown',
        path: '/README.md'
      }
    ];

    // Initialize search service with all files
    this.searchService.setFiles(this.items);
    
    // Apply initial filters
    this.applyFilters();

    // Mock README content
    const mockReadme = `
# Project Documentation
## Overview
This is a sample README file that demonstrates Markdown rendering.

- Feature 1
- Feature 2
- Feature 3

\`\`\`typescript
const example = "Hello World";
\`\`\`
    `;
    //this.readmeContent = marked(mockReadme);  // Fixed: Uncommented and properly set
  }

  onFiltersChange(newFilters: FileFilters): void {
    this.filters = newFilters;
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.items];

    // Apply type filter
    if (this.filters.type !== 'all') {
      filtered = filtered.filter(item => 
        this.filters.type === 'files' ? item.type === 'file' : item.type === 'folder'
      );
    }

    // Apply shared filter
    if (this.filters.shared !== 'all') {
      filtered = filtered.filter(item =>
        this.filters.shared === 'shared' ? item.shared : !item.shared
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (this.filters.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = a.modifiedDate.getTime() - b.modifiedDate.getTime();
          break;
        case 'size':
          const aSize = a.size ? parseFloat(a.size) : 0;
          const bSize = b.size ? parseFloat(b.size) : 0;
          comparison = aSize - bSize;
          break;
      }

      return this.filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    this.filteredItems = filtered;
  }

  toggleSelect(item: FileItem): void {
    item.selected = !item.selected;
  }

  uploadFile(): void {
    console.log('Upload file');
  }

  createFolder(): void {
    console.log('Create folder');
  }

  deleteSelected(): void {
    console.log('Delete selected:', this.selectedItems);
  }

  moveSelected(): void {
    console.log('Move selected:', this.selectedItems);
  }

  shareSelected(): void {
    console.log('Share selected:', this.selectedItems);
  }
}