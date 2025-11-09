
"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/use-auth"
import { User } from "@/lib/types"
import Link from "next/link"
import { ThemeToggle } from "./theme-toggle"
import { useSidebar } from "./ui/sidebar"
import { CreditCard, LogOut, Settings, User as UserIcon } from "lucide-react"

export function UserNav({ user }: { user: User }) {
  const { logout } = useAuth()
  const { isMobile, state } = useSidebar();

  if (!user) return null;

  if (state === 'collapsed' && !isMobile) {
     return (
       <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
           <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                {user.email}
                </p>
            </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem>
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Billing</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
            </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
     )
  }

  return (
    <div className="flex items-center gap-2 border rounded-md p-2 w-full">
        <Avatar className="h-9 w-9">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 truncate">
            <p className="text-sm font-medium leading-none truncate">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground truncate">
                {user.email}
            </p>
        </div>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                 <Button variant="ghost" size="icon" className="h-7 w-7">
                    <LogOut />
                </Button>
            </DropdownMenuTrigger>
             <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    </div>
  )
}
