
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, ScanLine } from "lucide-react";
import { ReceiptScanner } from "@/components/ai/ReceiptScanner";
import { AIChat } from "@/components/ai/AiChat";

export default function AIAssistant() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">AI Assistant</h1>
              <p className="text-muted-foreground">
                Manage subscriptions with intelligent automation
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
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
            <AIChat />
          </TabsContent>

          <TabsContent value="scanner" className="mt-6">
            <ReceiptScanner />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}