import { useState } from "react";
import { Users, Plus, UserPlus, Mail, DollarSign, Trash2, Edit, Check, X, Crown, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  useGetUserSharingGroupsQuery,
  useCreateSharingGroupMutation,
  useAddMemberMutation,
  useRemoveMemberMutation,
} from "@/api/sharingApi";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";

export default function FamilySharing() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("groups");
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isInviteMemberOpen, setIsInviteMemberOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");

  // Form states
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"member" | "admin">("member");

  // API hooks
  const { data: groupsData, isLoading } = useGetUserSharingGroupsQuery();
  const [createGroup, { isLoading: isCreating }] = useCreateSharingGroupMutation();
  const [addMember, { isLoading: isInviting }] = useAddMemberMutation();
  const [removeMember, { isLoading: isRemoving }] = useRemoveMemberMutation();

  const groups = groupsData?.data || [];

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a group name",
        variant: "destructive",
      });
      return;
    }

    try {
      await createGroup({
        name: groupName.trim(),
        description: groupDescription.trim(),
      }).unwrap();

      toast({
        title: "Success!",
        description: "Sharing group created successfully",
      });

      setGroupName("");
      setGroupDescription("");
      setIsCreateGroupOpen(false);
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast({
        title: "Error",
        description: err.data?.message || "Failed to create group",
        variant: "destructive",
      });
    }
  };

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    try {
      await addMember({
        id: selectedGroupId,
        data: {
          email: inviteEmail.trim(),
          role: inviteRole,
        },
      }).unwrap();

      toast({
        title: "Success!",
        description: "Member invited successfully",
      });

      setInviteEmail("");
      setInviteRole("member");
      setIsInviteMemberOpen(false);
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast({
        title: "Error",
        description: err.data?.message || "Failed to invite member",
        variant: "destructive",
      });
    }
  };

  const handleRemoveMember = async (groupId: string, memberId: string) => {
    try {
      await removeMember({ id: groupId, memberId }).unwrap();
      
      toast({
        title: "Success!",
        description: "Member removed successfully",
      });
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast({
        title: "Error",
        description: err.data?.message || "Failed to remove member",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen aura-bg">
      <div className="p-8">
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold gradient-text">Family & Team Sharing</h1>
              <p className="text-muted-foreground mt-1">Manage shared subscriptions and split costs</p>
            </div>
            <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Group
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Sharing Group</DialogTitle>
                  <DialogDescription>
                    Create a new group to share subscriptions with family or friends
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="group-name">Group Name</Label>
                    <Input 
                      id="group-name" 
                      placeholder="e.g., Family Plan, Roommates" 
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="group-description">Description (Optional)</Label>
                    <Textarea 
                      id="group-description" 
                      placeholder="Brief description of the group" 
                      value={groupDescription}
                      onChange={(e) => setGroupDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateGroupOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreateGroup} disabled={isCreating}>
                    {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Group
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Summary Stats */}
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <div className="glass rounded-2xl p-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Groups</p>
                  <h3 className="text-2xl font-bold mt-1">{groups.length}</h3>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 animate-fade-in animation-delay-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Members</p>
                  <h3 className="text-2xl font-bold mt-1">
                    {groups.reduce((acc, g) => acc + (g.memberCount || 0), 0)}
                  </h3>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
                  <UserPlus className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 animate-fade-in animation-delay-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Shared Subscriptions</p>
                  <h3 className="text-2xl font-bold mt-1">
                    {groups.reduce((acc, g) => acc + (g.subscriptionCount || 0), 0)}
                  </h3>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/20">
                  <Shield className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 animate-fade-in animation-delay-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Your Monthly Share</p>
                  <h3 className="text-2xl font-bold mt-1">
                    ${groups.reduce((acc, g) => acc + (g.userShare || 0), 0).toFixed(2)}
                  </h3>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/20">
                  <DollarSign className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="glass">
              <TabsTrigger value="groups" className="gap-2">
                <Users className="h-4 w-4" />
                My Groups
              </TabsTrigger>
              <TabsTrigger value="invitations" className="gap-2">
                <Mail className="h-4 w-4" />
                Invitations
                <Badge variant="default" className="ml-1 h-5 px-2">0</Badge>
              </TabsTrigger>
            </TabsList>

            {/* Groups Tab */}
            <TabsContent value="groups" className="space-y-6">
              {groups.length === 0 ? (
                <div className="glass rounded-2xl p-12">
                  <div className="text-center space-y-4">
                    <div className="flex justify-center">
                      <div className="p-4 rounded-full bg-primary/10">
                        <Users className="h-12 w-12 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">No sharing groups yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Create your first group to start splitting subscription costs
                      </p>
                      <Button onClick={() => setIsCreateGroupOpen(true)} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Create Your First Group
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                groups.map((group, index) => (
                  <div
                    key={group._id}
                    className="glass rounded-2xl p-6 animate-fade-in cursor-pointer hover:border-primary/50 transition-all"
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => navigate(`/sharing-groups/${group._id}`)}
                  >
                    {/* Group Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold">{group.name}</h3>
                          <Badge variant="outline">{group.memberCount} members</Badge>
                        </div>
                        {group.description && (
                          <p className="text-sm text-muted-foreground">{group.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Dialog open={isInviteMemberOpen && selectedGroupId === group._id} onOpenChange={(open) => {
                          setIsInviteMemberOpen(open);
                          if (open) setSelectedGroupId(group._id);
                        }}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="gap-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedGroupId(group._id);
                              }}
                            >
                              <UserPlus className="h-4 w-4" />
                              Invite
                            </Button>
                          </DialogTrigger>
                          <DialogContent onClick={(e) => e.stopPropagation()}>
                            <DialogHeader>
                              <DialogTitle>Invite Member to {group.name}</DialogTitle>
                              <DialogDescription>
                                Send an invitation to join this sharing group
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="invite-email">Email Address</Label>
                                <Input 
                                  id="invite-email" 
                                  type="email" 
                                  placeholder="friend@example.com" 
                                  value={inviteEmail}
                                  onChange={(e) => setInviteEmail(e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="invite-role">Role</Label>
                                <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as "member" | "admin")}>
                                  <SelectTrigger id="invite-role">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="admin">Admin - Can manage members and subscriptions</SelectItem>
                                    <SelectItem value="member">Member - Can view and split costs</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsInviteMemberOpen(false)}>Cancel</Button>
                              <Button onClick={handleInviteMember} disabled={isInviting}>
                                {isInviting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Send Invitation
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/sharing-groups/${group._id}`);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Members List */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold mb-3">Members</h4>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {group.members.map((member) => (
                          <div key={member.user._id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>{member.user.username.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm truncate">{member.user.username}</p>
                                {member.role === "owner" && <Crown className="h-3 w-3 text-yellow-500" />}
                              </div>
                              <p className="text-xs text-muted-foreground truncate">{member.user.email}</p>
                            </div>
                            {member.role !== "owner" && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveMember(group._id, member.user._id);
                                }}
                                disabled={isRemoving}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shared Subscriptions */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold">Shared Subscriptions</h4>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/sharing-groups/${group._id}#subscriptions`);
                          }}
                        >
                          <Plus className="h-4 w-4" />
                          Add Subscription
                        </Button>
                      </div>
                      {group.sharedSubscriptions.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                          No subscriptions shared yet
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {group.sharedSubscriptions.map((sub) => (
                            <div key={sub.subscription._id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                  <h5 className="font-medium">{sub.subscription.name}</h5>
                                  <Badge variant="secondary" className="text-xs capitalize">
                                    {sub.splitType} Split
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {group.memberCount} members
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">{sub.subscription.currency} {sub.subscription.price}</p>
                                <p className="text-xs text-muted-foreground">per month</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Group Summary */}
                    <div className="mt-6 pt-6 border-t border-border">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Group Spending</p>
                          <p className="text-2xl font-bold">${group.totalMonthly?.toFixed(2) || "0.00"}/mo</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Your Share</p>
                          <p className="text-2xl font-bold text-primary">${group.userShare?.toFixed(2) || "0.00"}/mo</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            {/* Invitations Tab */}
            <TabsContent value="invitations" className="space-y-4">
              <div className="glass rounded-2xl p-12">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="p-4 rounded-full bg-muted">
                      <Mail className="h-12 w-12 text-muted-foreground" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">No pending invitations</h3>
                    <p className="text-muted-foreground">
                      You don't have any pending group invitations at the moment
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}