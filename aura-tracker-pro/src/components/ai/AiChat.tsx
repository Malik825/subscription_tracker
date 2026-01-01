// components/ai/AIChat.tsx - Enhanced Version with Form Integration

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, User, Bot, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import { useNavigate } from "react-router-dom";
import { SubscriptionFormDialog } from "./SubscriptionFormDialog";

interface Message {
  role: "user" | "assistant";
  content: string;
  action?: {
    type: string;
    parameters: any;
    needsConfirmation?: boolean;
  };
}

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your AI subscription assistant. I can help you add, manage, or analyze your subscriptions. What would you like to do?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "update">("create");
  const [formData, setFormData] = useState<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await api.post("/ai/chat", {
        message: userMessage,
        conversationHistory: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      const aiResponse = response.data.data;

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: aiResponse.message,
          action: aiResponse.responseType === "action" ? {
            type: aiResponse.action,
            parameters: aiResponse.parameters,
            needsConfirmation: aiResponse.needsConfirmation,
          } : undefined,
        },
      ]);

      // Handle form-related actions immediately
      if (aiResponse.responseType === "action") {
        handleAIAction(aiResponse);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast({
          title: "Session Expired",
          description: "Please login again",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to process message",
        variant: "destructive",
      });
      
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAIAction = (aiResponse: any) => {
    const { action, parameters } = aiResponse;

    switch (action) {
      case "show_subscription_form":
        // Show create form with optional prefill
        setFormMode("create");
        setFormData(parameters?.prefillData || {});
        setShowForm(true);
        break;

      case "show_update_form":
        // Show update form with existing subscription data
        setFormMode("update");
        setFormData(parameters?.subscription || {});
        setShowForm(true);
        break;

      // Other actions are handled via confirmation buttons
    }
  };

  const handleExecuteAction = async (action: any) => {
    try {
      const response = await api.post("/ai/execute-action", {
        action: action.type,
        parameters: action.parameters,
      });

      toast({
        title: "Success",
        description: response.data.message,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "✅ Action completed successfully!",
        },
      ]);

      // Refresh subscriptions if needed
      if (action.type === "delete_subscription") {
        window.location.reload(); // Or use your state management
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast({
          title: "Session Expired",
          description: "Please login again",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to execute action",
        variant: "destructive",
      });
    }
  };

  const handleFormSuccess = (message: string) => {
    setShowForm(false);
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: message,
      },
    ]);
    
    toast({
      title: "Success",
      description: message,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <Card className="flex flex-col h-[600px]">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex gap-3",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              
              <div className="flex flex-col gap-2 max-w-[80%]">
                <div
                  className={cn(
                    "rounded-2xl px-4 py-3",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>

                {message.action && message.action.needsConfirmation && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleExecuteAction(message.action)}
                      className="flex items-center gap-2"
                    >
                      <Check className="h-4 w-4" />
                      Confirm
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setMessages((prev) => [
                          ...prev,
                          {
                            role: "assistant",
                            content: "Action cancelled. How else can I help?",
                          },
                        ]);
                      }}
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              {message.role === "user" && (
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-muted rounded-2xl px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your subscriptions..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="icon"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Subscription Form Dialog */}
      <SubscriptionFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        mode={formMode}
        initialData={formData}
        onSuccess={handleFormSuccess}
      />
    </>
  );
}