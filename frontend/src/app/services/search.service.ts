import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { FileItem, SearchResult } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private searchQuery = new BehaviorSubject<string>('');
  searchQuery$ = this.searchQuery.asObservable();

  private allFiles: FileItem[] = [];

  setFiles(files: FileItem[]): void {
    this.allFiles = files;
  }

  updateSearchQuery(query: string): void {
    this.searchQuery.next(query);
  }

  search(query: string): Observable<SearchResult[]> {
    const normalizedQuery = query.toLowerCase().trim();
    
    if (!normalizedQuery) {
      return of([]);
    }

    return of(this.allFiles).pipe(
      map(files => files
        .filter(file => {
          const matchesName = file.name.toLowerCase().includes(normalizedQuery);
          const matchesType = file.type.toLowerCase().includes(normalizedQuery);
          const matchesPath = file.path.toLowerCase().includes(normalizedQuery);
          return matchesName || matchesType || matchesPath;
        })
        .map(item => ({
          type: item.type,
          item,
          matchScore: this.calculateMatchScore(item, normalizedQuery)
        }))
        .sort((a, b) => b.matchScore - a.matchScore)
      )
    );
  }

  private calculateMatchScore(item: FileItem, query: string): number {
    let score = 0;
    const normalizedName = item.name.toLowerCase();
    
    if (normalizedName === query) score += 10;
    if (normalizedName.startsWith(query)) score += 5;
    if (normalizedName.includes(query)) score += 3;
    if (item.path.toLowerCase().includes(query)) score += 2;
    
    return score;
  }
}