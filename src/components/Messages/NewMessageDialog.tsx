import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageSquarePlus, Search } from "lucide-react";
import { getAvailableUsers, type User } from "@/api/messageService";
import { cn } from "@/lib/utils";

interface NewMessageDialogProps {
  onSelectUser: (userId: string) => void;
}

const NewMessageDialog: React.FC<NewMessageDialogProps> = ({ onSelectUser }) => {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadUsers();
    }
  }, [open]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredUsers(
        users.filter(
          (user) =>
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, users]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await getAvailableUsers();
      setUsers(response.users);
      setFilteredUsers(response.users);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectUser = (userId: string) => {
    onSelectUser(userId);
    setOpen(false);
    setSearchQuery("");
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "superadmin":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "leadmentor":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "schooladmin":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "mentor":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "student":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "superadmin":
        return "Super Admin";
      case "leadmentor":
        return "Lead Mentor";
      case "schooladmin":
        return "School Admin";
      case "mentor":
        return "School Mentor";
      case "student":
        return "Student";
      default:
        return role;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <MessageSquarePlus className="h-4 w-4" />
          New Message
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Start New Conversation</DialogTitle>
          <DialogDescription>
            Select a user to start messaging with
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <ScrollArea className="h-[400px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <p className="text-sm text-muted-foreground">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex items-center justify-center h-40">
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "No users found" : "No users available"}
                </p>
              </div>
            ) : (
              <div className="space-y-2 pr-4">
                {filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => handleSelectUser(user._id)}
                    className="p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {user.name}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={cn("text-xs", getRoleColor(user.role))}
                      >
                        {getRoleLabel(user.role)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewMessageDialog;

