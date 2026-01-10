import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, X, Loader2 } from "lucide-react";
import { useCreateSharingGroupMutation } from "@/api/sharingApi";
import { useToast } from "@/hooks/use-toast";

interface CreateSharingGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateSharingGroupDialog({ open, onOpenChange }: CreateSharingGroupDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [memberEmails, setMemberEmails] = useState<string[]>([]);
  const [currentEmail, setCurrentEmail] = useState("");
  
  const [createGroup, { isLoading }] = useCreateSharingGroupMutation();
  const { toast } = useToast();

  const handleAddEmail = () => {
    const email = currentEmail.trim();
    if (!email) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    if (memberEmails.includes(email)) {
      toast({
        title: "Duplicate Email",
        description: "This email has already been added",
        variant: "destructive",
      });
      return;
    }

    setMemberEmails([...memberEmails, email]);
    setCurrentEmail("");
  };

  const handleRemoveEmail = (email: string) => {
    setMemberEmails(memberEmails.filter((e) => e !== email));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: "Group Name Required",
        description: "Please enter a name for your sharing group",
        variant: "destructive",
      });
      return;
    }

    try {
      await createGroup({
        name: name.trim(),
        description: description.trim(),
        members: memberEmails,
      }).unwrap();

      toast({
        title: "Success!",
        description: "Sharing group created successfully",
      });

      setName("");
      setDescription("");
      setMemberEmails([]);
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast({
        title: "Error",
        description: err.data?.message || "Failed to create sharing group",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Sharing Group</DialogTitle>
          <DialogDescription>
            Create a group to split subscription costs with others
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Group Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Group Name *</Label>
            <Input
              id="name"
              placeholder="Family Plan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Shared streaming subscriptions for family"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Add Members */}
          <div className="space-y-2">
            <Label>Add Members (Optional)</Label>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="member@example.com"
                value={currentEmail}
                onChange={(e) => setCurrentEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddEmail();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddEmail}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Press Enter or click Add to include a member
            </p>
          </div>

          {/* Member List */}
          {memberEmails.length > 0 && (
            <div className="space-y-2">
              <Label>Members ({memberEmails.length})</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {memberEmails.map((email) => (
                  <div
                    key={email}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted"
                  >
                    <span className="text-sm">{email}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleRemoveEmail(email)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="flex-1"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Group
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}