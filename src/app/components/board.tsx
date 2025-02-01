import { BoardClient } from "./board-client";

export function Board() {
  return (
    <div className="flex h-screen overflow-auto">
      <BoardClient />
    </div>
  );
}
