"use client";

import { useState } from "react";
import type { Card as CardType } from "../types/board";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardHeader } from "@/components/ui/card";
import { Calendar, Pencil, AlignLeft } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CardModal } from "./card-modal";

interface CardProps {
  card: CardType;
  onDelete: () => void;
  onUpdate: (card: CardType) => void;
}

export function TaskCard({ card, onDelete, onUpdate }: CardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: {
      type: "card",
      card,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={cn(
          "mb-2 cursor-move shadow-sm hover:shadow-md transition-shadow group relative ",
          isDragging && "opacity-50"
        )}
      >
        <CardHeader className="p-3  flex flex-row items-center gap-2">
          <div className="flex-1" onClick={() => setIsModalOpen(true)}>
            <h3 className="text-sm font-medium leading-none">{card.title}</h3>
            <h3>{card.description}</h3>
          </div>
          <div
            onClick={() => setIsModalOpen(true)}
            className="md:opacity-0 group-hover:opacity-100 transition-opacity p-1"
          >
            <Pencil className="h-4 w-4 text-muted-foreground" />
          </div>
          {card.description && (
            <div className="flex items-center text-xs text-muted-foreground">
              <AlignLeft className="h-3 w-3 mr-1" />
              <span>There is a description</span>
            </div>
          )}
          {card.dueDate && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1" />
              <span>{format(new Date(card.dueDate), "MMM d")}</span>
            </div>
          )}
        </CardHeader>
      </Card>

      <CardModal
        card={card}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    </>
  );
}
