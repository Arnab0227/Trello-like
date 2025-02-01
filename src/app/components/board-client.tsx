"use client";

import { useState, useRef, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { TaskList } from "./list";
import { TaskCard } from "./card";
import { useBoardStore } from "../store/board-store";

export function BoardClient() {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [activeType, setActiveType] = useState<"list" | "card" | null>(null);
  const [newListTitle, setNewListTitle] = useState("");
  const [isAddingList, setIsAddingList] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const {
    lists,
    addList,
    deleteList,
    updateListTitle,
    addCard,
    updateCard,
    deleteCard,
    moveCard,
    moveList,
    moveCardInList,
  } = useBoardStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
    setActiveType(event.active.data.current?.type);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    if (active.id !== over.id) {
      const activeType = active.data.current?.type;
      const overType = over.data.current?.type;

      if (activeType === "list" && overType === "list") {
        const oldIndex = lists.findIndex((list) => list.id === active.id);
        const newIndex = lists.findIndex((list) => list.id === over.id);
        moveList(oldIndex, newIndex);
      } else if (activeType === "card") {
        const activeCard = active.data.current?.card;
        const overCard = over.data.current?.card;
        const overList = over.data.current?.list || { id: overCard?.listId };

        if (activeCard.listId === overList.id) {
          const listIndex = lists.findIndex((list) => list.id === overList.id);
          const oldIndex = lists[listIndex].cards.findIndex(
            (card) => card.id === activeCard.id
          );
          const newIndex = overCard
            ? lists[listIndex].cards.findIndex(
                (card) => card.id === overCard.id
              )
            : lists[listIndex].cards.length;

          moveCardInList(overList.id, oldIndex, newIndex);
        } else {
          const overCardIndex = overCard
            ? lists
                .find((list) => list.id === overList.id)
                ?.cards.findIndex((card) => card.id === overCard.id)
            : lists.find((list) => list.id === overList.id)?.cards.length;

          moveCard(
            activeCard.id,
            activeCard.listId,
            overList.id,
            overCardIndex === undefined ? 0 : overCardIndex
          );
        }
      }
    }

    setActiveId(null);
    setActiveType(null);
  };

  const handleAddList = () => {
    if (newListTitle.trim()) {
      addList(newListTitle);
      setNewListTitle("");
      setIsAddingList(false);
    }
  };

  const activeList =
    activeType === "list" && typeof activeId === "string"
      ? lists.find((list) => list.id === activeId)
      : null;

  const activeCard =
    activeType === "card" && typeof activeId === "string"
      ? lists
          .flatMap((list) => list.cards)
          .find((card) => card?.id === activeId)
      : null;

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setStartX(e.pageX - (containerRef.current?.offsetLeft || 0));
    setScrollLeft(containerRef.current?.scrollLeft || 0);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (containerRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2;
    if (containerRef.current) {
      containerRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  useEffect(() => {
    const handleMouseUpOutside = () => setIsDragging(false);
    document.addEventListener("mouseup", handleMouseUpOutside);
    return () => document.removeEventListener("mouseup", handleMouseUpOutside);
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-x-auto overflow-y-hidden cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseUp}
    >
      <div className="flex gap-4 p-4 min-w-full w-max">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 items-start">
            <SortableContext
              items={lists.map((list) => list.id)}
              strategy={horizontalListSortingStrategy}
            >
              {lists.map((list) => (
                <TaskList
                  key={list.id}
                  list={list}
                  onDelete={() => deleteList(list.id)}
                  onTitleChange={(title) => updateListTitle(list.id, title)}
                  onAddCard={(title) => addCard(list.id, title)}
                  onUpdateCard={(cardId, title) =>
                    updateCard({ id: cardId, title, listId: list.id })
                  }
                  onDeleteCard={(cardId) => deleteCard(list.id, cardId)}
                />
              ))}
            </SortableContext>

            {isAddingList ? (
              <div className="w-[272px] shrink-0">
                <div className="space-y-2">
                  <Input
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    placeholder="Enter list title..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddList();
                      if (e.key === "Escape") setIsAddingList(false);
                    }}
                    autoFocus
                  />
                  <div className="flex items-center gap-1">
                    <Button onClick={handleAddList}>Add List</Button>
                    <Button
                      variant="ghost"
                      onClick={() => setIsAddingList(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-[272px] shrink-0"
                onClick={() => setIsAddingList(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add another list
              </Button>
            )}
          </div>

          <DragOverlay>
            {activeType === "list" && activeList ? (
              <TaskList
                list={activeList}
                onDelete={() => {}}
                onTitleChange={() => {}}
                onAddCard={() => {}}
                onUpdateCard={() => {}}
                onDeleteCard={() => {}}
              />
            ) : null}
            {activeType === "card" && activeCard ? (
              <TaskCard
                card={activeCard}
                onDelete={() => {}}
                onUpdate={() => {}}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
