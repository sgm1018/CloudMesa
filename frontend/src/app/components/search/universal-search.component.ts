import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { SearchResult, SearchFilters } from '../../interfaces';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'app-universal-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative">
      <div class="flex items-center gap-2 mb-2">
        <input
          type="search"
          [(ngModel)]="searchQuery"
          (ngModelChange)="onSearchInput($event)"
          placeholder="Search files, passwords, and more..."
          class="flex-1 px-4 py-2 bg-[var(--secondary-bg)] text-[var(--text-primary)] rounded-lg border border-[var(--border-color)]"
        />
        <button
          class="btn-secondary p-2"
          [class.bg-[var(--accent)]]="showFilters"
          [class.text-white]="showFilters"
          (click)="showFilters = !showFilters"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        </button>
      </div>

      @if (showFilters) {
        <div class="absolute right-0 mt-1 w-64 p-4 bg-[var(--card-bg)] rounded-lg shadow-lg border border-[var(--border-color)] z-10">
          <h4 class="font-medium text-[var(--text-primary)] mb-2">Filter Results</h4>
          <div class="space-y-2">
            @for (type of availableTypes; track type.value) {
              <label class="flex items-center gap-2">
                <input
                  type="checkbox"
                  [checked]="filters.types.includes(type.value)"
                  (change)="toggleFilter(type.value)"
                  class="rounded border-[var(--border-color)]"
                />
                <span class="text-[var(--text-primary)]">
                  {{ type.icon }} {{ type.label }}
                </span>
              </label>
            }
          </div>
        </div>
      }

      @if (results.length > 0) {
        <div class="absolute left-0 right-0 mt-1 bg-[var(--card-bg)] rounded-lg shadow-lg border border-[var(--border-color)] max-h-96 overflow-y-auto z-50">
          @for (category of categorizedResults; track category.type) {
            @if (category.items.length > 0) {
              <div class="p-2">
                <h4 class="text-sm font-medium text-[var(--text-secondary)] px-3 py-1">
                  {{ getCategoryLabel(category.type) }}
                </h4>
                @for (result of category.items; track result.item.id) {
                  <button
                    class="w-full px-3 py-2 flex items-center gap-3 hover:bg-[var(--secondary-bg)] rounded-lg text-left"
                    (click)="selectResult(result)"
                  >
                    <span class="text-xl">{{ result.icon }}</span>
                    <div>
                      <p class="text-[var(--text-primary)]">{{ getName(result) }}</p>
                      <p class="text-sm text-[var(--text-secondary)]">{{ getDescription(result) }}</p>
                    </div>
                  </button>
                }
              </div>
            }
          }
        </div>
      }
    </div>
  `
})
export class UniversalSearchComponent implements OnInit, OnDestroy {
  searchQuery = '';
  showFilters = false;
  results: SearchResult[] = [];
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  filters: SearchFilters = {
    types: ['password', 'file', 'folder', 'password-group'],
    query: ''
  };

  availableTypes = [
    { value: 'password', label: 'Passwords', icon: '🔑' },
    { value: 'file', label: 'Files', icon: '📄' },
    { value: 'folder', label: 'Folders', icon: '📁' },
    { value: 'password-group', label: 'Password Groups', icon: '👥' }
  ];

  constructor(private searchService: SearchService) {}

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.filters.query = query;
      this.search();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchInput(query: string): void {
    this.searchSubject.next(query);
  }

  toggleFilter(type: 'password' | 'file' | 'folder' | 'password-group'): void {
    const index = this.filters.types.indexOf(type);
    if (index === -1) {
      this.filters.types.push(type);
    } else {
      this.filters.types.splice(index, 1);
    }
    this.search();
  }

  get categorizedResults(): { type: string; items: SearchResult[] }[] {
    const categories = this.filters.types.map(type => ({
      type,
      items: this.results.filter(result => result.type === type)
    }));
    return categories.filter(category => category.items.length > 0);
  }

  getCategoryLabel(type: string): string {
    const typeInfo = this.availableTypes.find(t => t.value === type);
    return typeInfo ? `${typeInfo.icon} ${typeInfo.label}` : type;
  }

  getName(result: SearchResult): string {
    const item = result.item as any;
    return item.name || 'Unnamed item';
  }

  getDescription(result: SearchResult): string {
    const item = result.item as any;
    switch (result.type) {
      case 'password':
        return item.username || '';
      case 'file':
      case 'folder':
        return item.path || '';
      case 'password-group':
        return `${item.description || ''} · ${item.isPrivate ? 'Private' : 'Shared'}`;
      default:
        return '';
    }
  }

  selectResult(result: SearchResult): void {
    console.log('Selected:', result);
    // Implement navigation or action based on selection
  }

  private search(): void {
    this.searchService.search(this.filters.query).subscribe(
      results => this.results = results.filter(result => 
        this.filters.types.includes(result.type)
      )
    );
  }
}