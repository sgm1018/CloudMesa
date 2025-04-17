import { Injectable } from "@angular/core";
import { ItemDto } from "../shared/dto/item/item.dto";
import { BehaviorSubject } from "rxjs";
import { ItemCls } from "../shared/dto/item/Item.cls";

@Injectable({
  providedIn: "root",
})
export class ItemService {
  private itemsSubject = new BehaviorSubject<ItemCls[]>([]);
  items$ = this.itemsSubject.asObservable();

  private filteredItemsSubject = new BehaviorSubject<ItemCls[]>([]);
  filteredItems$ = this.filteredItemsSubject.asObservable();

  selectedItems : ItemCls[] = [];


  constructor() {
    const mockItems: ItemCls[] = [
      new ItemCls({
        _id: "1",
        name: "Documents",
        userId: "user1",
        type: "folder",
        parentId: undefined,
        encryptedMetadata: {
          name: "encryptedName",
          mimeType: undefined,
          notes: undefined,
          username: undefined,
          password: undefined,
          url: undefined,
          description: undefined,
          color: undefined,
          icon: undefined,
        },
        encryption: {
          iv: "iv",
          algorithm: "AES-256-GCM",
          encryptedKey: "encryptedKey",
        },
        sharedWith: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      new ItemCls({
        _id: "2",
        name: "Documents",
        userId: "user1",
        type: "file",
        parentId: undefined,
        encryptedMetadata: {
          name: "encryptedName",
          mimeType: undefined,
          notes: undefined,
          username: undefined,
          password: undefined,
          url: undefined,
          description: undefined,
          color: undefined,
          icon: undefined,
        },
        encryption: {
          iv: "iv",
          algorithm: "AES-256-GCM",
          encryptedKey: "encryptedKey",
        },
        sharedWith: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ];
    this.itemsSubject.next(mockItems);
  }

  getItems() {
    return this.itemsSubject.getValue();
  }

  setItems(items: ItemCls[]) {
    this.itemsSubject.next(items);
    this.setFilteredItems(items); // Update filtered items whenever items change
  }

  getfilteredItems() {
    return this.filteredItemsSubject.getValue();
  }
  setFilteredItems(items: ItemCls[]) {
    this.filteredItemsSubject.next(items);
  }
  addItem(item: ItemCls) {
    const items = this.getItems();
    items.push(item);
    this.setItems(items);
  }
  deleteItem(itemId: string) {
    const items = this.getItems().filter((item) => item.getDto()._id !== itemId);
    this.setItems(items);
  }

  getSelectedItems(){
    return this.selectedItems;
  }
  addSelectedItem(item: ItemCls){
    if(!this.selectedItems.some(i => i.getDto()._id === item.getDto()._id)){
      this.selectedItems.push(item);
    }
  }

  removeSelectedItem(item: ItemCls){
    this.selectedItems = this.selectedItems.filter(i => i.getDto()._id !== item.getDto()._id);
  }


  deleteSelectedItems() {
    const selectedItems = this.getSelectedItems();
    //delete api logic there
  }
  moveSelectedItems(newParentId: string) {
    const selectedItems = this.getSelectedItems();
    //move api logic there
  }

  
  
}
