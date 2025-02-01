import { Trello } from "lucide-react";
export function Footer() {
  return (
    <footer className=" py-6 text-center text-sm text-white bg-black rounded-b-xl">
      <div className="flex justify-between px-5">
        <div className="flex items-center gap-2">
          <Trello />
          <p>Trello Like App</p>
        </div>

        <p> Created by Arnab Bhattacharyya</p>
      </div>
    </footer>
  );
}
