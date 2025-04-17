import { UserGetDto } from './../shared/dto/user/UserGetDto';
import { ItemService } from './item.service';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { FileItem, SearchResult } from '../interfaces';
import { ItemCls } from '../shared/dto/item/Item.cls';
import { FileFilters } from '../components/file-filters/file-filters.component';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private searchQuery = new BehaviorSubject<string>('');
  searchQuery$ = this.searchQuery.asObservable();

  private filters: FileFilters = {
    type: 'all',
    shared: 'all',
    sortBy: 'name',
    sortOrder: 'asc',
    mimeType: 'all',
    parentId: undefined,
    userId: undefined,
    updatedAt: undefined,
    createdAt: undefined
  };

  constructor(private itemService: ItemService){}


  private allFiles: ItemCls[] = [];

  setFiles(files: ItemCls[]): void {
    this.allFiles = files;
  }

  updateSearchQuery(query: string): void {
    this.searchQuery.next(query);
  }

  applyFilters(): void {
    let filtered = [...this.itemService.getItems()];

    // Apply type filter
    if (this.filters.type !== 'all') {
      filtered = filtered.filter(item => item.getDto().type === this.filters.type);
    }

    // Apply shared filter
    if (this.filters.shared !== 'all') {
      filtered = filtered.filter(item =>
        this.filters.shared === 'shared' ? item.getDto().sharedWith && item.getDto().sharedWith!.length > 0 : !item.getDto().sharedWith || item.getDto().sharedWith!.length === 0
      );
    }

    // Apply MIME type filter if specified
    if (this.filters.mimeType) {
      filtered = filtered.filter(item => 
        item.getDto().encryptedMetadata.mimeType && 
        item.getDto().encryptedMetadata.mimeType!.includes(this.filters.mimeType as string)
      );
    }

    // Apply parent folder filter if specified
    if (this.filters.parentId) {
      filtered = filtered.filter(item => item.getDto().parentId === this.filters.parentId);
    }

    // Apply user filter if specified
    if (this.filters.userId) {
      filtered = filtered.filter(item => item.getDto().userId === this.filters.userId);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (this.filters.sortBy) {
        case 'name':
          comparison = a.getDto().name.localeCompare(b.getDto().name);
          break;
        case 'date':
          comparison = new Date(a.getDto().updatedAt || 0).getTime() - new Date(b.getDto().updatedAt || 0).getTime();
          break;
        case 'type':
          comparison = a.getDto().type.localeCompare(b.getDto().type);
          break;
        case 'size':
          const aSize = a.size || 0;
          const bSize = b.size || 0;
          comparison = aSize - bSize;
          break;
      }

      return this.filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    this.itemService.setFilteredItems(filtered); // Update filtered items in the item service
  }


  // search(query: string): Observable<SearchResult[]> {
  //   const normalizedQuery = query.toLowerCase().trim();
    
  //   if (!normalizedQuery) {
  //     return of([]);
  //   }

  //   return of(this.allFiles).pipe(
  //     map(files => files
  //       .filter(file => {
  //         const matchesName = file.name.toLowerCase().includes(normalizedQuery);
  //         const matchesType = file.type.toLowerCase().includes(normalizedQuery);
  //         const matchesPath = file.path.toLowerCase().includes(normalizedQuery);
  //         return matchesName || matchesType || matchesPath;
  //       })
  //       .map(item => ({
  //         type: item.type,
  //         item,
  //         matchScore: this.calculateMatchScore(item, normalizedQuery)
  //       }))
  //       .sort((a, b) => b.matchScore - a.matchScore)
  //     )
  //   );
  // }

  getFilters(): FileFilters {
    return this.filters;
  }
  setFilters(filters: FileFilters): void {
    this.filters = filters;
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