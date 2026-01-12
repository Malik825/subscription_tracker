import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, ScanLine, Lock, Crown } from "lucide-react";
import { ReceiptScanner } from "@/components/ai/ReceiptScanner";
import { AiChat } from "@/components/ai/AiChat";
import { useProFeature } from "@/hooks/useProFeature";
import { UpgradeModal } from "@/components/UpgradeModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AIAssistant() {
  const { isPro, showUpgradeModal, closeUpgradeModal, requirePro } = useProFeature();

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">AI Assistant</h1>
                <Badge variant="secondary" className="bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0">
                  <Crown className="h-3 w-3 mr-1" />
                  Pro
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Manage subscriptions with intelligent automation
              </p>
            </div>
          </div>
        </div>

        {/* Pro Lock Overlay for Free Users */}
        {!isPro ? (
          <Card className="relative overflow-hidden">
            {/* Blurred Preview */}
            <div className="opacity-30 blur-sm pointer-events-none p-6">
              <Tabs defaultValue="chat" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-md">
                  <TabsTrigger value="chat" className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    AI Chat
                  </TabsTrigger>
                  <TabsTrigger value="scanner" className="flex items-center gap-2">
                    <ScanLine className="h-4 w-4" />
                    Receipt Scanner
                  </TabsTrigger>
                </TabsList>
                <div className="h-[400px] bg-muted/20 rounded-lg mt-6" />
              </Tabs>
            </div>

            {/* Lock Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
              <div className="text-center space-y-4 p-8 max-w-md">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-600/20 flex items-center justify-center mx-auto">
                  <Lock className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Unlock AI Features</h3>
                  <p className="text-muted-foreground text-sm">
                    Get access to AI Chat and Receipt Scanner with Pro. Let AI help you manage subscriptions effortlessly.
                  </p>
                </div>
                <div className="space-y-2">
                  <ul className="text-sm text-left space-y-2 bg-muted/50 rounded-lg p-4">
                    <li className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span>AI-powered subscription management</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ScanLine className="h-4 w-4 text-primary" />
                      <span>OCR receipt scanning</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-primary" />
                      <span>Voice commands support</span>
                    </li>
                  </ul>
                </div>
                <Button onClick={requirePro} className="w-full gap-2">
                  <Crown className="h-4 w-4" />
                  Upgrade to Pro
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          /* Full Access for Pro Users */
          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                AI Chat
              </TabsTrigger>
              <TabsTrigger value="scanner" className="flex items-center gap-2">
                <ScanLine className="h-4 w-4" />
                Receipt Scanner
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="mt-6">
              <AiChat />
            </TabsContent>

            <TabsContent value="scanner" className="mt-6">
              <ReceiptScanner />
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal isOpen={showUpgradeModal} onClose={closeUpgradeModal} />
    </div>
  );
}