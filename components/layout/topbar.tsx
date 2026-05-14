"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { logoutAction } from "@/app/(auth)/actions";
import { initials } from "@/lib/utils";

export function Topbar({
  userEmail,
  userName,
}: {
  userEmail: string;
  userName: string | null;
}) {
  return (
    <header className="h-16 border-b bg-card px-6 flex items-center justify-end gap-4 sticky top-0 z-20">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-10 px-2 gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{initials(userName ?? userEmail)}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium hidden sm:inline">
              {userName ?? userEmail.split("@")[0]}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{userName ?? "—"}</span>
              <span className="text-xs text-muted-foreground font-normal truncate">
                {userEmail}
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <form action={logoutAction}>
            <DropdownMenuItem asChild>
              <button type="submit" className="w-full cursor-pointer">
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </DropdownMenuItem>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
