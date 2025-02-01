import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { BoardState, Card, List } from "../types/board";

const INITIAL_LISTS: List[] = [
  {
    id: "todo",
    title: "To Do",
    cards: [],
  },
  {
    id: "doing",
    title: "Doing",
    cards: [],
  },
  {
    id: "done",
    title: "Done",
    cards: [],
  },
];

interface BoardStore extends BoardState {
  addList: (title: string) => void;
  deleteList: (id: string) => void;
  updateListTitle: (id: string, title: string) => void;
  addCard: (listId: string, title: string) => void;
  updateCard: (card: Card) => void;
  deleteCard: (listId: string, cardId: string) => void;
  moveCard: (
    cardId: string,
    fromListId: string,
    toListId: string,
    newIndex: number
  ) => void;
  moveList: (fromIndex: number, toIndex: number) => void;
  resetBoard: () => void;
  moveCardInList: (listId: string, oldIndex: number, newIndex: number) => void;
}

export const useBoardStore = create<BoardStore>()(
  persist(
    (set) => ({
      lists: INITIAL_LISTS,
      addList: (title) =>
        set((state) => ({
          lists: [
            ...state.lists,
            { id: crypto.randomUUID(), title, cards: [] },
          ],
        })),
      deleteList: (id) =>
        set((state) => ({
          lists: state.lists.filter(
            (list) =>
              INITIAL_LISTS.some((initial) => initial.id === list.id) ||
              list.id !== id
          ),
        })),
      updateListTitle: (id, title) =>
        set((state) => ({
          lists: state.lists.map((list) =>
            INITIAL_LISTS.some((initial) => initial.id === list.id)
              ? list
              : list.id === id
              ? { ...list, title }
              : list
          ),
        })),
      addCard: (listId, title) =>
        set((state) => ({
          lists: state.lists.map((list) =>
            list.id === listId
              ? {
                  ...list,
                  cards: [
                    ...list.cards,
                    { id: crypto.randomUUID(), title, listId, description: "" },
                  ],
                }
              : list
          ),
        })),
      updateCard: (updatedCard) => {
        console.log("Updated card:", updatedCard);
        set((state) => ({
          lists: state.lists.map((list) =>
            list.id === updatedCard.listId
              ? {
                  ...list,
                  cards: list.cards.map((card) =>
                    card.id === updatedCard.id
                      ? { ...card, ...updatedCard }
                      : card
                  ),
                }
              : list
          ),
        }));
      },
      deleteCard: (listId, cardId) =>
        set((state) => ({
          lists: state.lists.map((list) =>
            list.id === listId
              ? {
                  ...list,
                  cards: list.cards.filter((card) => card.id !== cardId),
                }
              : list
          ),
        })),
      moveCard: (cardId, fromListId, toListId, newIndex) =>
        set((state) => {
          const fromList = state.lists.find((list) => list.id === fromListId);
          const toList = state.lists.find((list) => list.id === toListId);
          if (!fromList || !toList) return state;

          const cardIndex = fromList.cards.findIndex(
            (card) => card.id === cardId
          );
          if (cardIndex === -1) return state;

          const [movedCard] = fromList.cards.splice(cardIndex, 1);
          movedCard.listId = toListId;
          toList.cards.splice(newIndex, 0, movedCard);

          return { lists: [...state.lists] };
        }),
      moveList: (fromIndex, toIndex) =>
        set((state) => {
          const newLists = [...state.lists];
          const [movedList] = newLists.splice(fromIndex, 1);
          newLists.splice(toIndex, 0, movedList);
          return { lists: newLists };
        }),
      resetBoard: () => set({ lists: INITIAL_LISTS }),
      moveCardInList: (listId, oldIndex, newIndex) =>
        set((state) => ({
          lists: state.lists.map((list) =>
            list.id === listId
              ? {
                  ...list,
                  cards: arrayMove(list.cards, oldIndex, newIndex),
                }
              : list
          ),
        })),
    }),
    {
      name: "board-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

function arrayMove<T>(array: T[], from: number, to: number) {
  const newArray = array.slice();
  newArray.splice(
    to < 0 ? newArray.length + to : to,
    0,
    newArray.splice(from, 1)[0]
  );
  return newArray;
}
