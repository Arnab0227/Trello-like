"use client";

import { useState } from "react";
import type { List } from "../types/board";
import { useSortable } from "@dnd-kit/sortable";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash } from "lucide-react";
import { TaskCard } from "./card";
import { cn } from "@/lib/utils";

interface ListProps {
  list: List;
  onDelete: () => void;
  onTitleChange: (title: string) => void;
  onAddCard: (title: string) => void;
  onUpdateCard: (cardId: string, title: string) => void;
  onDeleteCard: (cardId: string) => void;
}

export function TaskList({
  list,
  onDelete,
  onTitleChange,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
}: ListProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");
  const isFixedList = ["todo", "doing", "done"].includes(list.id);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: list.id,
    data: {
      type: "list",
      list,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleAddCard = () => {
    if (newCardTitle.trim()) {
      onAddCard(newCardTitle);
      setNewCardTitle("");
      setIsEditing(false);
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "w-[272px] shrink-0 select-none",
        isDragging && "opacity-50"
      )}
    >
      <CardHeader className="p-3 flex flex-row items-center space-y-0">
        <CardTitle className="flex-1">
          {isFixedList ? (
            <span className="text-base font-medium">{list.title}</span>
          ) : (
            <Input
              value={list.title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="h-auto p-0 text-base font-medium border-none focus-visible:ring-1"
            />
          )}
        </CardTitle>
        {!isFixedList && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="h-8 w-8"
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-3 pt-0 flex flex-col">
        <SortableContext
          items={list.cards.map((card) => card.id)}
          strategy={verticalListSortingStrategy}
        >
          {list.cards.map((card) => (
            <TaskCard
              key={card.id}
              card={card}
              onDelete={() => onDeleteCard(card.id)}
              onUpdate={(updatedCard) =>
                onUpdateCard(updatedCard.id, updatedCard.title)
              }
            />
          ))}
        </SortableContext>
        {isEditing ? (
          <div className="space-y-2 mt-2">
            <Input
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              placeholder="Enter card title..."
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddCard();
                if (e.key === "Escape") setIsEditing(false);
              }}
              autoFocus
            />
            <div className="flex items-center gap-1">
              <Button onClick={handleAddCard} size="sm">
                Add Card
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground mt-2"
            onClick={() => setIsEditing(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add a card
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
