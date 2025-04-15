import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchResult } from '../../interfaces';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (results.length > 0) {
      <div class="absolute top-full left-0 right-0 mt-1 bg-[var(--card-bg)] rounded-lg shadow-lg border border-[var(--border-color)] max-h-96 overflow-y-auto z-50">
        @for (result of results; track result.item.id) {
          <div class="p-3 hover:bg-[var(--secondary-bg)] cursor-pointer border-b border-[var(--border-color)] last:border-b-0">
            <div class="flex items-center gap-3">
              @if (result.type === 'folder') {
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              }
              <div>
                <div class="text-[var(--text-primary)] font-medium">{{ result.item.name }}</div>
                <!-- <div class="text-[var(--text-secondary)] text-sm">{{ result.item.path }}</div> -->
              </div>
            </div>
          </div>
        }
      </div>
    }
  `
})
export class SearchResultsComponent {
  @Input() results: SearchResult[] = [];
}