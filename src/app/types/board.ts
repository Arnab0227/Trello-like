export interface Card {
    id: string
    title: string
    description?: string
    dueDate?: string
    listId: string
  }
  
  export interface List {
    id: string
    title: string
    cards: Card[]
  }
  
  export interface BoardState {
    lists: List[]
  }
  
  