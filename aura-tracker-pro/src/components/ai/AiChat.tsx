// components/ai/AiChat.tsx - Voice-Enabled Version with Feedback

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, User, Bot, Check, X, Mic, MicOff, Sparkles, Volume2, VolumeX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import { useNavigate } from "react-router-dom";
import { SubscriptionFormDialog } from "./SubscriptionFormDialog";
import { useVoiceRecognition } from "@/hooks/use-voice-recognition";
import { useVoiceFeedback, setVoiceEnabled } from "@/hooks/use-voice-feedback";

interface ActionParameters {
  prefillData?: Record<string, unknown>;
  subscription?: Record<string, unknown>;
  subscriptionId?: string;
  [key: string]: unknown;
}

interface MessageAction {
  type: string;
  parameters: ActionParameters;
  needsConfirmation?: boolean;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  action?: MessageAction;
}

interface AIResponse {
  message: string;
  responseType: string;
  action?: string;
  parameters?: ActionParameters;
  needsConfirmation?: boolean;
}

interface ErrorResponse {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
}

export function AiChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your AI subscription assistant. I can help you add, manage, or analyze your subscriptions. You can type or use voice commands. What would you like to do?",
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
  const [formData, setFormData] = useState<Record<string, unknown>>({});

  // Voice Recognition Hook
  const {
    isListening,
    isSupported,
    transcript,
    startListening,
    stopListening,
    error: voiceError,
  } = useVoiceRecognition({
    onResult: (text) => {
      setInput(text);
      // Play sound when speech is captured
      playBeep();
    },
    onError: (error) => {
      toast({
        title: "Voice Error",
        description: error,
        variant: "destructive",
      });
    },
  });

  // Voice Feedback Hook
  const { announce, playBeep, voiceEnabled, soundEnabled } = useVoiceFeedback();
  const [localVoiceEnabled, setLocalVoiceEnabled] = useState(voiceEnabled);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Announce welcome message on mount
  useEffect(() => {
    const welcomeMessage = messages[0].content;
    announce(welcomeMessage);
  }, []); // Only run once on mount

  // Show voice error if any
  useEffect(() => {
    if (voiceError) {
      toast({
        title: "Voice Recognition Error",
        description: voiceError,
        variant: "destructive",
      });
    }
  }, [voiceError, toast]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    
    // Stop listening if active
    if (isListening) {
      stopListening();
    }
    
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await api.post<{ data: AIResponse }>("/ai/chat", {
        message: userMessage,
        conversationHistory: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      const aiResponse = response.data.data;
      const assistantMessage = aiResponse.message;

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: assistantMessage,
          action: aiResponse.responseType === "action" ? {
            type: aiResponse.action || "",
            parameters: aiResponse.parameters || {},
            needsConfirmation: aiResponse.needsConfirmation,
          } : undefined,
        },
      ]);

      // Announce AI response with voice feedback
      announce(assistantMessage);

      // Handle form-related actions immediately
      if (aiResponse.responseType === "action") {
        handleAIAction(aiResponse);
      }
    } catch (err) {
      const error = err as ErrorResponse;
      
      if (error.response?.status === 401) {
        toast({
          title: "Session Expired",
          description: "Please login again",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const errorMessage = "Sorry, I encountered an error. Please try again.";
      
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to process message",
        variant: "destructive",
      });
      
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: errorMessage,
        },
      ]);

      // Announce error with voice
      announce(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAIAction = (aiResponse: AIResponse) => {
    const { action, parameters } = aiResponse;

    switch (action) {
      case "show_subscription_form":
        setFormMode("create");
        setFormData(parameters?.prefillData || {});
        setShowForm(true);
        break;

      case "show_update_form":
        setFormMode("update");
        setFormData(parameters?.subscription || {});
        setShowForm(true);
        break;
    }
  };

  const handleExecuteAction = async (action: MessageAction) => {
    try {
      const response = await api.post<{ message: string }>("/ai/execute-action", {
        action: action.type,
        parameters: action.parameters,
      });

      const successMessage = "Action completed successfully!";

      toast({
        title: "Success",
        description: response.data.message,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `✅ ${successMessage}`,
        },
      ]);

      // Announce success
      announce(successMessage);

      if (action.type === "delete_subscription") {
        window.location.reload();
      }
    } catch (err) {
      const error = err as ErrorResponse;
      
      if (error.response?.status === 401) {
        toast({
          title: "Session Expired",
          description: "Please login again",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const errorMessage = "Failed to execute action";
      
      toast({
        title: "Error",
        description: error.response?.data?.message || errorMessage,
        variant: "destructive",
      });

      // Announce error
      announce(errorMessage);
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

    // Announce success
    announce(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleVoice = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
      // Announce listening started
      playBeep();
    }
  };

  const toggleVoiceFeedback = () => {
    const newState = !localVoiceEnabled;
    setLocalVoiceEnabled(newState);
    setVoiceEnabled(newState);
    
    // Provide feedback about the toggle
    if (newState) {
      announce("Voice feedback enabled");
    } else {
      toast({
        title: "Voice Feedback Disabled",
        description: "You won't hear AI responses",
      });
    }
  };

  return (
    <>
      <Card className="flex flex-col h-[600px] glass">
        {/* Voice Controls Header */}
        <div className="p-3 bg-muted/50 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">AI Assistant</span>
          </div>
          
          {/* Voice Feedback Toggle */}
          <Button
            onClick={toggleVoiceFeedback}
            size="sm"
            variant="ghost"
            className="h-8 gap-2 transition-smooth"
            title={localVoiceEnabled ? "Disable voice feedback" : "Enable voice feedback"}
          >
            {localVoiceEnabled ? (
              <>
                <Volume2 className="h-4 w-4 text-primary" />
                <span className="text-xs">Voice: On</span>
              </>
            ) : (
              <>
                <VolumeX className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs">Voice: Off</span>
              </>
            )}
          </Button>
        </div>

        {/* Voice Not Supported Warning */}
        {!isSupported && (
          <div className="p-3 bg-warning/10 border-b border-warning/20">
            <p className="text-xs text-warning flex items-center gap-2">
              <MicOff className="h-3 w-3" />
              Voice input is not supported in your browser. Please use Chrome, Edge, or Safari.
            </p>
          </div>
        )}

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
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 glow-accent">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              
              <div className="flex flex-col gap-2 max-w-[80%]">
                <div
                  className={cn(
                    "rounded-2xl px-4 py-3 transition-smooth",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground glow-primary"
                      : "bg-muted"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>

                {message.action && message.action.needsConfirmation && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleExecuteAction(message.action!)}
                      className="flex items-center gap-2 transition-smooth hover:glow-primary"
                    >
                      <Check className="h-4 w-4" />
                      Confirm
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const cancelMessage = "Action cancelled. How else can I help?";
                        setMessages((prev) => [
                          ...prev,
                          {
                            role: "assistant",
                            content: cancelMessage,
                          },
                        ]);
                        announce(cancelMessage);
                      }}
                      className="transition-smooth"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              {message.role === "user" && (
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 glow-primary">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center glow-accent">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-muted rounded-2xl px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area with Voice */}
        <div className="p-4 border-t border-border/50 bg-card/50 backdrop-blur-sm">
          {/* Real-time transcript display */}
          {isListening && transcript && (
            <div className="mb-2 p-2 rounded-lg bg-primary/10 border border-primary/20 animate-pulse">
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <Sparkles className="h-3 w-3 text-primary animate-spin" />
                Listening: <span className="text-foreground">{transcript}</span>
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isListening ? "Listening..." : "Ask me anything or use voice..."}
              disabled={isLoading || isListening}
              className={cn(
                "flex-1 transition-smooth",
                isListening && "border-primary glow-border"
              )}
            />
            
            {/* Voice Button */}
            {isSupported && (
              <Button
                onClick={toggleVoice}
                disabled={isLoading}
                size="icon"
                variant={isListening ? "default" : "outline"}
                className={cn(
                  "transition-smooth",
                  isListening && "glow-primary animate-pulse"
                )}
                title={isListening ? "Stop listening" : "Start voice input"}
              >
                {isListening ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
            )}

            {/* Send Button */}
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="transition-smooth hover:glow-primary"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Voice Status Indicator */}
          {isListening && (
            <div className="mt-2 flex items-center justify-center gap-2">
              <div className="flex gap-1">
                <div className="h-2 w-1 bg-primary rounded-full animate-pulse animation-delay-100"></div>
                <div className="h-3 w-1 bg-primary rounded-full animate-pulse animation-delay-200"></div>
                <div className="h-2 w-1 bg-primary rounded-full animate-pulse animation-delay-300"></div>
              </div>
              <span className="text-xs text-muted-foreground">Voice active</span>
            </div>
          )}
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