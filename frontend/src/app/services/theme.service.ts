import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkMode = new BehaviorSubject<boolean>(false);
  darkMode$ = this.darkMode.asObservable();

  constructor() {
    // Check if user has a theme preference
    const isDark = localStorage.getItem('darkMode') === 'true';
    this.setDarkMode(isDark);
  }

  toggleDarkMode(): void {
    this.setDarkMode(!this.darkMode.value);
  }

  private setDarkMode(isDark: boolean): void {
    this.darkMode.next(isDark);
    localStorage.setItem('darkMode', isDark.toString());
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}