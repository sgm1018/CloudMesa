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
<div class="max-w-7xl mx-auto">
  <div class="px-6 py-8">
    <div class="flex items-center text-sm text-text-secondary mb-3">
      <button class="hover:text-[var(--accent)] transition-colors">Home</button>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
      <span class="font-medium text-text-primary">My Files</span>
    </div>
    
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 mb-8">

      <app-file-filters
        [filters]="filters"
        (filtersChange)="onFiltersChange($event)"
        class="bg-[var(--card-bg)] rounded-xl p-4]"
      />
      <div class="flex gap-3">
        <button class="btn-secondary flex items-center gap-2 px-4 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span>Upload</span>
        </button>
        <button class="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>New</span>
        </button>
      </div>
    </div>

    <div class="mb-5">

    </div>

    @if (selectedItems.length > 0) {
      <div class="mb-8 animate-slide-down">
        <div class="flex items-center gap-4 p-2 bg-[var(--accent)]/5 rounded-xl border border-[var(--accent)]/20 shadow-sm">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-medium">
              {{ selectedItems.length }}
            </div>
            <span class="text-text-primary font-medium">items selected</span>
          </div>
          
          <div class="flex gap-3 ml-auto">
            <button class="btn-danger flex items-center gap-2 px-4 py-1 rounded-lg hover:bg-red-600 hover:text-white transition-colors duration-200" (click)="deleteSelected()">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
            <button class="btn-secondary flex items-center gap-2 px-4 py-1 rounded-lg transition-colors duration-200" (click)="moveSelected()">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Move
            </button>
            <button class="btn-primary flex items-center gap-2 px-4 py-1 rounded-lg transition-colors duration-200" (click)="shareSelected()">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
          </div>
        </div>
      </div>
    }

    <div class="bg-[var(--card-bg)] rounded-xl shadow-sm border border-[var(--border-color)] overflow-hidden">
      <div class="grid grid-cols-12 px-6 py-4 bg-[var(--card-bg)] border-b border-[var(--border-color)] sticky top-0">
        <div class="col-span-6 flex items-center gap-2">
          <input
            type="checkbox"
            class="w-4 h-4 rounded border-[var(--border-color)] text-[var(--accent)] focus:ring-[var(--accent)]"
          />
          <span class="font-medium text-text-primary">Name</span>
        </div>
        <div class="col-span-2 font-medium text-text-primary">Size</div>
        <div class="col-span-3 font-medium text-text-primary">Modified</div>
        <div class="col-span-1"></div>
      </div>

      <div class="divide-y divide-[var(--border-color)]">
        @for (item of filteredItems; track item.id) {
          <div 
            class="grid grid-cols-12 items-center px-6 py-1 hover:bg-secondary-bg/50 transition-colors group"
            [class.bg-[var(--accent)]="item.selected"
            [class.border-l-4]="item.selected"
            [class.border-l-[var(--accent)]="item.selected"
          >
            <div class="col-span-6 flex items-center gap-3">
              <div class="flex items-center gap-3">
                <input
                  type="checkbox"
                  [checked]="item.selected"
                  (change)="toggleSelect(item)"
                  class="w-4 h-4 rounded border-[var(--border-color)] text-[var(--accent)] focus:ring-[var(--accent)]"
                />
                
                @if (item.type === 'folder') {
                  <div class="p-2.5 rounded-xl bg-[var(--accent)]/10 backdrop-blur-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                } @else if (item.mimeType?.includes('pdf')) {
                  <div class="p-2.5 rounded-xl bg-red-500/10">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      <text x="12" y="16" text-anchor="middle" font-size="7" font-weight="bold" fill="currentColor">PDF</text>
                    </svg>
                  </div>
                } @else if (item.mimeType?.includes('markdown')) {
                  <div class="p-2.5 rounded-xl bg-purple-500/10">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      <text x="12" y="16" text-anchor="middle" font-size="7" font-weight="bold" fill="currentColor">MD</text>
                    </svg>
                  </div>
                } @else {
                  <div class="p-2.5 rounded-xl bg-blue-500/10">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                }
              </div>
              
              <div class="min-w-0 pr-4">
                <p class="font-medium text-text-primary truncate">{{ item.name }}</p>
                @if (item.type === 'file') {
                  <p class="text-xs text-text-secondary mt-0.5 flex items-center gap-2">
                    <span>{{ item.mimeType }}</span>
                    @if (item.owner !== 'user1') {
                      <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        Owned by {{ item.owner }}
                      </span>
                    }
                  </p>
                }
              </div>
              
              @if (item.shared) {
                <div class="ml-auto flex-shrink-0 tooltip" data-tip="Shared with others">
                  <div class="p-1.5 rounded-full bg-[var(--accent)]/10 group-hover:bg-[var(--accent)]/20 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </div>
                </div>
              }
            </div>
            
            <div class="col-span-2 text-text-secondary font-medium flex items-center">
              <span class="px-2.5 py-1 rounded-full bg-secondary-bg text-xs">{{ item.size || '--' }}</span>
            </div>
            
            <div class="col-span-3 text-text-secondary">
              {{ item.modifiedDate | date:'MMM d, y, h:mm a' }}
            </div>
            
            <div class="col-span-1 opacity-0 group-hover:opacity-100 transition-all duration-200 flex justify-end gap-1">
              <button class="p-2 rounded-lg hover:bg-secondary-bg transition-colors" aria-label="Download">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
              <button class="p-2 rounded-lg hover:bg-secondary-bg transition-colors" aria-label="More options">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          </div>
        }
      </div>
      
      @if (filteredItems.length === 0) {
        <div class="flex flex-col items-center justify-center py-16 px-4">
          <div class="w-24 h-24 rounded-full bg-secondary-bg flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-text-primary mb-2">No files found</h3>
          <p class="text-text-secondary text-center max-w-sm">
            No files match your current filters. Try adjusting your search or upload a new file.
          </p>
          <button class="btn-primary mt-6 px-5 py-2 rounded-lg">Upload files</button>
        </div>
      }
    </div>

    @if (readmeContent) {
      <div class="mt-8">
        <div class="bg-[var(--card-bg)] rounded-xl shadow-sm border border-[var(--border-color)] overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)]">
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-lg bg-purple-500/10">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 class="font-semibold text-lg text-text-primary">README.md</h3>
            </div>
            <button class="p-2 rounded-lg hover:bg-secondary-bg transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          <div class="p-6 prose prose-sm dark:prose-invert max-w-none" [innerHTML]="readmeContent"></div>
        </div>
      </div>
    }
  </div>
</div>
  `,
  styles: [`
    .animate-slide-down {
      animation: slideDown 0.3s ease;
    }
    
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .tooltip {
      position: relative;
    }
    
    .tooltip:hover::after {
      content: attr(data-tip);
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      background-color: var(--card-bg);
      color: var(--text-primary);
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      white-space: nowrap;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      z-index: 10;
      margin-bottom: 5px;
      border: 1px solid var(--border-color);
    }
  `]
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