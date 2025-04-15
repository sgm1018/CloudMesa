import { AuthService } from './../../services/auth.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import { SearchService } from '../../services/search.service';
import { SearchResultsComponent } from '../search-results/search-results.component';
import { User, SearchResult } from '../../interfaces';
import { Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs';
import { UserGetDto } from '../../shared/dto/user/UserGetDto';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, SearchResultsComponent],
  template: `
    <nav class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-3 flex justify-between items-center shadow-sm">
      <!-- Left: Logo & Sidebar -->
      <div class="flex items-center gap-4">
        <button class="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition" (click)="toggleSidebar()" aria-label="Open sidebar">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-700 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <!-- Center: Search -->
      <div class="flex-1 max-w-xl mx-6">
        <div class="relative">
          <input
            type="search"
            placeholder="Search files, folders, or users..."
            class="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            (input)="onSearchInput($event)"
          />
          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
            </svg>
          </span>
          <app-search-results [results]="searchResults" />
        </div>
      </div>

      <!-- Right: Actions -->
      <div class="flex items-center gap-4">
        <!-- Dark Mode Toggle -->
        <button class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition" (click)="toggleDarkMode()" aria-label="Toggle dark mode">
          @if (!(darkMode$ | async)) {
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          } @else {
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
            </svg>
          }
        </button>

        <!-- User Menu -->
        <div class="relative">
          <button class="flex flex-row items-center gap-2 px-2 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition" (click)="toggleUserMenu()" aria-label="User menu">
          @if(mockUser.avatar){
            <img class="h-8 w-8 rounded-full" [src]="mockUser.avatar" alt="User Avatar" />
          } @else{
            <img class="h-8 w-8 rounded-full" [src]="'https://ui-avatars.com/api/?name=' + (mockUser.name || 'User') + '&background=random'" alt="User Avatar" />
          } 
            <span class="hidden md:inline text-gray-800 dark:text-gray-100 font-medium">{{ mockUser.name.toUpperCase() }}</span>
            <svg class="h-4 w-4 text-gray-500 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          @if (showUserMenu) {
            <div class="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 animate-fade-in">
              <a href="#" class="block px-5 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition">Profile</a>
              <a href="#" class="block px-5 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition">Settings</a>
              <button (click)="logout()" class="w-full text-left block px-5 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 transition">Sign out</button>
            </div>
          }
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .animate-fade-in {
      animation: fadeIn 0.18s ease;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-8px);}
      to { opacity: 1; transform: translateY(0);}
    }
  `]
})
export class NavbarComponent implements OnInit, OnDestroy {
  darkMode$ = this.themeService.darkMode$;
  showUserMenu = false;
  searchResults: SearchResult[] = [];
  private searchInputSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  //TODO change mock user to real user
  user! : UserGetDto; 
  mockUser : UserGetDto = {
    email: "pr@pr.es",
    name: "admin",
    surname: "admin",
    roles: ["admin"],
    publicKey: "admin",
    maxSize: 10,
    createdAt: new Date(Date.now()),
    updatedAt: new Date(Date.now()),
  }


  constructor(
    private themeService: ThemeService,
    private searchService: SearchService,
    private authService : AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      if (!user) return;
      this.user = user;
    });
    // this.searchInputSubject.pipe(
    //   debounceTime(300),
    //   distinctUntilChanged(),
    //   switchMap(query => this.searchService.search(query)),
    //   takeUntil(this.destroy$)
    // ).subscribe(results => {
    //   this.searchResults = results;
    // });
  }
  getThemeService(): ThemeService {
    return this.themeService;
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

  getAuthService(): AuthService {
    return this.authService;
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.authService.removeSessionStorage();
        this.authService.goAuthPage();
      },
      error: (error) => {
        this.authService.removeSessionStorage();
        this.authService.goAuthPage();
      },
    });
  }
}