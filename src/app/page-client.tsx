"use client"

import { Button } from "@/components/ui/button"
import { Board } from "./components/board"
import { useBoardStore } from "./store/board-store"
import { Trello } from 'lucide-react';
export function PageClient() {
  const resetBoard = useBoardStore((state) => state.resetBoard)

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b px-6 py-3  bg-black text-white">
        <div className="flex items-center gap-2">
        <Trello />
        <h1 className="text-2xl font-bold">Trello Like</h1>
        </div>
        
        <Button
          variant="outline"
          className="bg-white text-black"
          onClick={() => {
            if (confirm("Are you sure you want to reset the board?")) {
              resetBoard()
            }
          }}
        >
          Reset Board
        </Button>
      </header>
      <Board />
    </div>
  )
}