'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MessageCircle,
  Send,
  Mic,
  Volume2,
  RotateCcw,
  BookOpen,
  Lightbulb,
  HelpCircle,
  Sparkles,
  Loader2,
  User,
  Bot,
  Target,
  Plus,
  Trash2,
  Clock,
  ChevronRight,
  History,
  X,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { aiTutorAPI, ttsAPI, asrAPI } from '@/services/api.service';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import MarkdownRenderer from '@/components/MarkdownRenderer';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface ChatSession {
  _id: string;
  title?: string;
  topic?: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export default function AITutorPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI Learning Tutor. I'm here to help you with your studies. Ask me anything about your lessons, explain concepts, or get study tips!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [showMobileHistory, setShowMobileHistory] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ show: boolean; sessionId: string | null }>({ show: false, sessionId: null });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!token) {
      router.push('/auth/login');
      return;
    }
    loadSessions();
  }, [token]);

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(prev => prev + (prev ? ' ' : '') + transcript);
          setIsRecording(false);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          toast.error('Voice recognition failed. Please try again.');
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const loadSessions = async () => {
    try {
      setLoadingSessions(true);
      const response = await aiTutorAPI.getSessions(1, 50);

      // Check if response has data
      if (response?.data?.data) {
        setSessions(response.data.data);
      } else {
        setSessions([]);
      }
    } catch (error: any) {
      console.error('Failed to load sessions:', error);
      // Don't show error toast on initial load if user is not logged in
      if (error?.response?.status !== 401) {
        // Silently fail - user might not be logged in yet
      }
      setSessions([]);
    } finally {
      setLoadingSessions(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Add empty assistant message for streaming
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const response = await aiTutorAPI.chat({
        message: messageText,
        sessionId: sessionId,
        conversationHistory: messages
          .filter(m => m.role !== 'assistant' || m.id !== '1')
          .map((m) => ({
            role: m.role,
            content: m.content,
          })),
      });

      if (response.data.data.sessionId) {
        setSessionId(response.data.data.sessionId);
        loadSessions(); // Refresh sessions list
      }

      const fullResponse = response.data.data.response || "I'm here to help! Could you please rephrase your question?";

      // Simulate streaming effect
      let currentIndex = 0;
      const streamInterval = setInterval(() => {
        if (currentIndex < fullResponse.length) {
          const chunkSize = Math.floor(Math.random() * 3) + 1;
          const chunk = fullResponse.slice(currentIndex, currentIndex + chunkSize);
          currentIndex += chunkSize;

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: fullResponse.slice(0, currentIndex) }
                : msg
            )
          );
        } else {
          clearInterval(streamInterval);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, isStreaming: false }
                : msg
            )
          );
        }
      }, 30);

    } catch (error: any) {
      toast.error('Failed to get response');
      console.error(error);

      setMessages((prev) =>
        prev.filter((msg) => msg.id !== assistantMessageId)
      );

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: "Hello! I'm your AI Learning Tutor. How can I help you today?",
        timestamp: new Date(),
      },
    ]);
    setSessionId(undefined);
    toast.success('New conversation started');
  };

  const loadSession = async (session: ChatSession) => {
    try {
      const response = await aiTutorAPI.getSession(session._id);
      const sessionData = response.data.data;

      const loadedMessages: Message[] = sessionData.messages.map((msg: any, index: number) => ({
        id: `${session._id}-${index}`,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp),
      }));

      setMessages(loadedMessages);
      setSessionId(session._id);
      toast.success('Session loaded');
    } catch (error) {
      toast.error('Failed to load session');
      console.error(error);
    }
  };

  const deleteSession = async (sessionIdToDelete: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setDeleteConfirmation({ show: true, sessionId: sessionIdToDelete });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation.sessionId) return;

    try {
      await aiTutorAPI.deleteSession(deleteConfirmation.sessionId);
      setSessions(prev => prev.filter(s => s._id !== deleteConfirmation.sessionId));

      if (deleteConfirmation.sessionId === sessionId) {
        handleReset();
      }

      toast.success('Conversation deleted');
    } catch (error) {
      toast.error('Failed to delete conversation');
      console.error(error);
    } finally {
      setDeleteConfirmation({ show: false, sessionId: null });
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation({ show: false, sessionId: null });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleVoiceRecording = () => {
    if (!recognitionRef.current) {
      toast.error('Voice recognition is not supported in your browser');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        toast.info('Listening... Speak now');
      } catch (error) {
        console.error('Failed to start recording:', error);
        toast.error('Failed to start voice recording');
        setIsRecording(false);
      }
    }
  };

  const getSessionTitle = (session: ChatSession) => {
    if (session.title) return session.title;
    if (session.topic) return session.topic;

    const firstUserMessage = session.messages?.find(m => m.role === 'user');
    if (firstUserMessage) {
      return firstUserMessage.content.substring(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '');
    }

    return 'New Conversation';
  };

  const formatSessionDate = (date: Date) => {
    const now = new Date();
    const sessionDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;

    return sessionDate.toLocaleDateString();
  };

  const quickPrompts = [
    { icon: HelpCircle, text: 'Explain this concept', color: 'blue' },
    { icon: Lightbulb, text: 'Give me study tips', color: 'yellow' },
    { icon: BookOpen, text: 'Summarize this lesson', color: 'green' },
    { icon: Target, text: 'Practice questions', color: 'purple' },
  ];

  return (
    <div className="min-h-screen bg-page-gradient">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 sm:w-96 h-64 sm:h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob dark:bg-primary/10"></div>
        <div className="absolute top-40 right-10 w-64 sm:w-96 h-64 sm:h-96 bg-secondary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 dark:bg-secondary/10"></div>
        <div className="absolute -bottom-8 left-1/2 w-64 sm:w-96 h-64 sm:h-96 bg-accent/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000 dark:bg-accent/10"></div>
      </div>

      <div className="relative z-10 h-screen flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden bg-background/90 backdrop-blur-sm border-b border-border/50 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-teal-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-bold text-foreground">AI Tutor</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMobileHistory(true)}
                className="gap-1 h-8 px-2 border-border/50 hover:bg-muted"
              >
                <History className="w-4 h-4 text-foreground" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="gap-1 h-8 px-2 border-border/50 hover:bg-muted"
              >
                <Plus className="w-3 h-3 text-foreground" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="max-w-7xl mx-auto h-full">
            <div className="flex gap-0 lg:gap-6 h-full px-0 lg:px-4 lg:py-6">
              {/* Left Sidebar - Chat History (Desktop Only) */}
              <div className="hidden lg:block w-80 flex-shrink-0 h-full">
                <Card className="h-full flex flex-col border border-border/50 shadow-xl bg-background/90 backdrop-blur-sm">
                  <CardHeader className="border-b border-border/50 bg-muted/50 flex-shrink-0 p-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                        <Clock className="w-5 h-5 text-primary" />
                        Chat History
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleReset}
                        className="gap-1 h-8 px-2 border-border/50 hover:bg-muted"
                      >
                        <Plus className="w-3 h-3 text-foreground" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 overflow-y-auto p-3" style={{ maxHeight: 'calc(100vh - 10rem)' }}>
                    {loadingSessions ? (
                      <div className="flex items-center justify-center h-32">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    ) : sessions.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No conversations yet</p>
                        <p className="text-xs mt-1">Start chatting to save</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {sessions.map((session) => (
                          <div
                            key={session._id}
                            onClick={() => loadSession(session)}
                            className={`group relative p-3 rounded-lg border transition-all cursor-pointer hover:shadow-md ${sessionId === session._id
                              ? 'bg-primary/10 border-primary/50 shadow-sm'
                              : 'bg-card border-border/50 hover:border-border'
                              }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-foreground truncate">
                                  {getSessionTitle(session)}
                                </h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatSessionDate(session.updatedAt)}
                                </p>
                                <p className="text-xs text-muted-foreground/80 mt-1">
                                  {session.messages?.length || 0} messages
                                </p>
                              </div>
                              <button
                                onClick={(e) => deleteSession(session._id, e)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded"
                                title="Delete conversation"
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </button>
                            </div>

                            {sessionId === session._id && (
                              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <ChevronRight className="w-4 h-4 text-primary" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Main Chat Area */}
              <div className="flex-1 flex flex-col h-full">
                <Card className="h-full flex flex-col border-0 lg:border lg:border-border/50 shadow-none lg:shadow-xl bg-background lg:bg-background/90 lg:backdrop-blur-sm rounded-none lg:rounded-2xl">
                  {/* Desktop Header */}
                  <CardHeader className="hidden lg:block border-b border-border/50 bg-muted/50 flex-shrink-0 p-4 lg:p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 lg:gap-3">
                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-green-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Sparkles className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-lg lg:text-xl font-extrabold text-foreground">AI Learning Tutor</h2>
                          <p className="text-xs text-muted-foreground font-normal">Your personal study assistant</p>
                        </div>
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleReset}
                        className="gap-2 border-border/50 hover:bg-muted"
                      >
                        <Plus className="w-4 h-4 text-foreground" />
                        <span className="hidden sm:inline text-foreground">New Chat</span>
                      </Button>
                    </div>
                  </CardHeader>

                  {/* Messages */}
                  <CardContent
                    className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4"
                    style={{
                      maxHeight: 'calc(100vh - 180px)',
                      minHeight: 'calc(100vh - 180px)'
                    }}
                  >
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-2 sm:gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                          } animate-fadeIn`}
                      >
                        {/* Avatar */}
                        <div
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full sm:rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${message.role === 'user'
                            ? 'bg-gradient-to-br from-green-600 to-teal-600'
                            : 'bg-gradient-to-br from-emerald-600 to-cyan-600'
                            } text-white`}
                        >
                          {message.role === 'user' ? (
                            <User className="w-4 h-4 sm:w-5 sm:h-5" />
                          ) : (
                            <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                          )}
                        </div>

                        {/* Message Content */}
                        <div
                          className={`flex-1 min-w-0 ${message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}`}
                        >
                          <div
                            className={`max-w-[75%] sm:max-w-[80%] lg:max-w-2xl rounded-2xl px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base shadow-sm overflow-hidden ${message.role === 'user'
                              ? 'bg-gradient-to-br from-green-600 to-teal-600 text-white'
                              : 'bg-muted/50 text-foreground border border-border/50'
                              }`}
                          >
                            {message.role === 'assistant' ? (
                              <div className="prose prose-sm dark:prose-invert max-w-none overflow-hidden break-words overflow-x-auto">
                                <MarkdownRenderer content={message.content} />
                                {message.isStreaming && (
                                  <span className="inline-block w-1.5 h-4 bg-primary ml-1 animate-pulse"></span>
                                )}
                              </div>
                            ) : (
                              <p className="whitespace-pre-wrap break-words overflow-wrap-anywhere">{message.content}</p>
                            )}
                          </div>
                          <p className={`text-xs text-muted-foreground mt-1 px-1 ${message.role === 'user' ? 'text-right' : 'text-left'
                            }`}>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}

                    {loading && !messages.some(m => m.isStreaming) && (
                      <div className="flex gap-3 animate-fadeIn">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full sm:rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-emerald-600 to-cyan-600 text-white shadow-md">
                          <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div className="bg-muted/50 rounded-2xl px-4 py-3 border border-border/50 shadow-sm">
                          <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        </div>
                      </div>
                    )}

                    {/* Quick Prompts - Show only on first message */}
                    {messages.length === 1 && !loading && (
                      <div className="mt-6 sm:mt-8 space-y-3">
                        <p className="text-sm font-semibold text-muted-foreground text-center">Quick Start Prompts:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                          {quickPrompts.map((prompt, index) => {
                            const Icon = prompt.icon;
                            return (
                              <button
                                key={index}
                                onClick={() => handleSendMessage(prompt.text)}
                                className="flex items-center gap-2 sm:gap-3 p-3 rounded-xl border-2 border-border/50 hover:border-primary/50 bg-card hover:bg-muted transition-all text-left group"
                              >
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                                </div>
                                <span className="text-xs sm:text-sm font-medium text-foreground group-hover:text-primary">
                                  {prompt.text}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </CardContent>

                  {/* Input Area */}
                  <div className="border-t border-border/50 p-3 sm:p-4 bg-background/50 lg:bg-muted/30 flex-shrink-0 rounded-b-none lg:rounded-b-2xl backdrop-blur-sm">
                    <div className="flex gap-2">
                      <Button
                        onClick={toggleVoiceRecording}
                        variant={isRecording ? "destructive" : "outline"}
                        size="icon"
                        disabled={loading}
                        className={`flex-shrink-0 border-border/50 ${isRecording ? "animate-pulse" : "hover:bg-muted"}`}
                        title={isRecording ? "Stop recording" : "Start voice input"}
                      >
                        <Mic className={`w-4 h-4 sm:w-5 sm:h-5 ${isRecording ? "text-white" : "text-foreground"}`} />
                      </Button>
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask me anything..."
                        className="flex-1 bg-background text-foreground border-input focus:border-primary focus:ring-primary text-sm sm:text-base placeholder:text-muted-foreground"
                        disabled={loading}
                      />
                      <Button
                        onClick={() => handleSendMessage()}
                        disabled={loading || !input.trim()}
                        className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 shadow-md flex-shrink-0 text-white"
                        size="icon"
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 text-center hidden sm:block">
                      Press Enter to send • Shift+Enter for new line
                    </p>
                  </div>

                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Chat History Drawer */}
        {showMobileHistory && (
          <>
            {/* Backdrop */}
            <div
              className="lg:hidden fixed inset-0 bg-black/50 z-40 animate-fadeIn"
              onClick={() => setShowMobileHistory(false)}
            />

            {/* Drawer */}
            <div className="lg:hidden fixed inset-y-0 right-0 w-80 max-w-[85vw] bg-background z-50 shadow-2xl transform transition-transform duration-300 ease-out">
              <div className="h-full flex flex-col">
                {/* Drawer Header */}
                <div className="bg-muted/50 border-b border-border/50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" />
                      <h2 className="text-lg font-bold text-foreground">Chat History</h2>
                    </div>
                    <button
                      onClick={() => setShowMobileHistory(false)}
                      className="p-1 hover:bg-muted rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                {/* Drawer Content */}
                <div className="flex-1 overflow-y-auto p-3">
                  {loadingSessions ? (
                    <div className="flex items-center justify-center h-32">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No conversations yet</p>
                      <p className="text-xs mt-1">Start chatting to save</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {sessions.map((session) => (
                        <div
                          key={session._id}
                          onClick={() => {
                            loadSession(session);
                            setShowMobileHistory(false);
                          }}
                          className={`group relative p-3 rounded-lg border transition-all cursor-pointer hover:shadow-md ${sessionId === session._id
                            ? 'bg-primary/10 border-primary/50 shadow-sm'
                            : 'bg-card border-border/50 hover:border-border'
                            }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-foreground truncate">
                                {getSessionTitle(session)}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatSessionDate(session.updatedAt)}
                              </p>
                              <p className="text-xs text-muted-foreground/80 mt-1">
                                {session.messages?.length || 0} messages
                              </p>
                            </div>
                            <button
                              onClick={(e) => deleteSession(session._id, e)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded"
                              title="Delete conversation"
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </button>
                          </div>

                          {sessionId === session._id && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                              <ChevronRight className="w-4 h-4 text-primary" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Drawer Footer */}
                <div className="border-t border-border/50 p-3">
                  <Button
                    onClick={() => {
                      handleReset();
                      setShowMobileHistory(false);
                    }}
                    className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Conversation
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmation.show && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 z-50 animate-fadeIn"
              onClick={cancelDelete}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <Card className="w-full max-w-md border-0 shadow-2xl bg-card animate-scaleIn">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    {/* Icon */}
                    <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                      <AlertTriangle className="w-8 h-8 text-destructive" />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      Delete Conversation?
                    </h3>

                    {/* Message */}
                    <p className="text-muted-foreground mb-6">
                      Are you sure you want to delete this conversation? This action cannot be undone.
                    </p>

                    {/* Buttons */}
                    <div className="flex gap-3 w-full">
                      <Button
                        onClick={cancelDelete}
                        variant="outline"
                        className="flex-1 border-border/50 hover:bg-muted"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={confirmDelete}
                        className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
