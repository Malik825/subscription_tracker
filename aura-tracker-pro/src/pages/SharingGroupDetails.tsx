import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Users,
  DollarSign,
  Settings as SettingsIcon,
  Plus,
  Loader2,
  Receipt,
} from "lucide-react";
import { useGetSharingGroupByIdQuery } from "@/api/sharingApi";
import { useGetPaymentSummaryQuery } from "@/api/paymentTrackingApi";
import { CostSplitCalculator } from "@/components/CostSplitCalculator";
import { PaymentTracking } from "@/components/PaymentTracking";


export default function SharingGroupDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: groupData, isLoading } = useGetSharingGroupByIdQuery(id!);
  const { data: paymentSummary } = useGetPaymentSummaryQuery(id!);

  const group = groupData?.data;
  const payments = paymentSummary?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

if (!group) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Group Not Found</h2>
          <Button onClick={() => navigate("/family-sharing")}>
            Back to Groups
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen aura-bg">
      <div className="p-8">
        <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/sharing-groups")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold gradient-text">{group.name}</h1>
                {group.description && (
                  <p className="text-muted-foreground mt-1">{group.description}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <CostSplitCalculator />
              <Button
                variant="outline"
                onClick={() => navigate(`/sharing-groups/${id}/settings`)}
                className="gap-2"
              >
                <SettingsIcon className="h-4 w-4" />
                Settings
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="glass p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Members</p>
                  <p className="text-2xl font-bold">{group.memberCount}</p>
                </div>
              </div>
            </Card>

            <Card className="glass p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Receipt className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Subscriptions</p>
                  <p className="text-2xl font-bold">{group.subscriptionCount}</p>
                </div>
              </div>
            </Card>

            <Card className="glass p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <DollarSign className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Your Share</p>
                  <p className="text-2xl font-bold text-green-500">
                    ${group.userShare?.toFixed(2)}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="glass p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <DollarSign className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Monthly</p>
                  <p className="text-2xl font-bold">${group.totalMonthly?.toFixed(2)}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="glass">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Members Card */}
                <Card className="glass p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Members</h3>
                    <Badge variant="secondary">{group.memberCount}</Badge>
                  </div>
                  <div className="space-y-3">
                    {group.members.map((member) => (
                      <div key={member.user._id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10">
                              {member.user.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{member.user.username}</p>
                            <p className="text-xs text-muted-foreground">{member.user.email}</p>
                          </div>
                        </div>
                        <Badge variant={member.role === "owner" ? "default" : "secondary"}>
                          {member.role}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Payment Summary Card */}
                {payments && (
                  <Card className="glass p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">This Month's Payments</h3>
                      <PaymentTracking groupName={group.name} />
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Paid</span>
                        <span className="font-semibold text-green-500">
                          {payments.paidCount}/{payments.paidCount + payments.pendingCount + payments.overdueCount}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Expected</span>
                        <span className="font-semibold">${payments.totalExpected.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Received</span>
                        <span className="font-semibold text-green-500">
                          ${payments.totalPaid.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-border">
                        <span className="text-muted-foreground">Outstanding</span>
                        <span className="font-semibold text-yellow-500">
                          ${payments.totalPending.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Subscriptions Tab */}
            <TabsContent value="subscriptions" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Shared Subscriptions</h3>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Subscription
                </Button>
              </div>

              {group.sharedSubscriptions.length === 0 ? (
                <Card className="glass p-12">
                  <div className="text-center space-y-4">
                    <p className="text-muted-foreground">No subscriptions shared yet</p>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Your First Subscription
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {group.sharedSubscriptions.map((sub) => (
                    <Card key={sub.subscription._id} className="glass p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{sub.subscription.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Split Type: <span className="capitalize">{sub.splitType}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">
                            {sub.subscription.currency} {sub.subscription.price}
                          </p>
                          <p className="text-xs text-muted-foreground">total/month</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Members Tab */}
            <TabsContent value="members" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Group Members</h3>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Invite Member
                </Button>
              </div>

              <div className="grid gap-4">
                {group.members.map((member) => (
                  <Card key={member.user._id} className="glass p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-primary/10 text-lg">
                            {member.user.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{member.user.username}</p>
                          <p className="text-sm text-muted-foreground">{member.user.email}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Joined {new Date(member.joinedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant={member.role === "owner" ? "default" : "secondary"}>
                        {member.role}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments">
              <PaymentTracking groupName={group.name} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}