import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import { SearchService } from '../../services/search.service';
import { SearchResultsComponent } from '../search-results/search-results.component';
import { User, SearchResult } from '../../interfaces';
import { Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, SearchResultsComponent],
  template: `
    <nav class="bg-[var(--primary-bg)] border-b border-[var(--border-color)] px-4 py-3 flex justify-between items-center">
      <div class="flex items-center gap-4">
        <button class="lg:hidden btn-secondary" (click)="toggleSidebar()">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 class="text-2xl font-bold text-[var(--text-primary)]">CloudMesa</h1>
      </div>

      <div class="flex-1 max-w-2xl mx-4">
        <div class="relative">
          <input
            type="search"
            placeholder="Search files and folders..."
            class="w-full px-4 py-2 bg-[var(--secondary-bg)] text-[var(--text-primary)] rounded-lg border border-[var(--border-color)]"
            (input)="onSearchInput($event)"
          />
          <app-search-results [results]="searchResults" />
        </div>
      </div>

      <div class="flex items-center gap-4">
        <button class="btn-secondary" (click)="toggleDarkMode()">
          @if (!(darkMode$ | async)) {
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          } @else {
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
            </svg>
          }
        </button>

        <div class="relative">
          <button class="btn-secondary flex items-center gap-2" (click)="toggleUserMenu()">
            <div class="w-8 h-8 rounded-full bg-[var(--accent)] text-white flex items-center justify-center">
              {{ currentUser.name[0].toUpperCase() }}
            </div>
          </button>
          @if (showUserMenu) {
            <div class="absolute right-0 mt-2 w-48 bg-[var(--card-bg)] rounded-lg shadow-lg border border-[var(--border-color)]">
              <a href="#" class="block px-4 py-2 text-[var(--text-primary)] hover:bg-[var(--secondary-bg)]">Profile</a>
              <a href="#" class="block px-4 py-2 text-[var(--text-primary)] hover:bg-[var(--secondary-bg)]">Settings</a>
              <a href="#" class="block px-4 py-2 text-[var(--text-primary)] hover:bg-[var(--secondary-bg)]">Sign out</a>
            </div>
          }
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent implements OnInit, OnDestroy {
  darkMode$ = this.themeService.darkMode$;
  showUserMenu = false;
  searchResults: SearchResult[] = [];
  private searchInputSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  currentUser: User = {
    id: '1',
    name: 'User',
    email: 'user@example.com'
  };

  constructor(
    private themeService: ThemeService,
    private searchService: SearchService
  ) {}

  ngOnInit(): void {
    this.searchInputSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => this.searchService.search(query)),
      takeUntil(this.destroy$)
    ).subscribe(results => {
      this.searchResults = results;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchInput(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.searchInputSubject.next(query);
  }

  toggleDarkMode(): void {
    this.themeService.toggleDarkMode();
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  toggleSidebar(): void {
    // Implement sidebar toggle logic
  }
}