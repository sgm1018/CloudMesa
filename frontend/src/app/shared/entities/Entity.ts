export class Entity {
    _id?: string;
    
    createdAt: Date = new Date(Date.now());
  
    updatedAt: Date = new Date(Date.now());
  
    userCreator?: string;
    
    userUpdater?: string;
  }