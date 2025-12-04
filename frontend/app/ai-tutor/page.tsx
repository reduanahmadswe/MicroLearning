'use client';

import { useEffect, useState, useRef } from 'react';
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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { aiTutorAPI, ttsAPI, asrAPI } from '@/services/api.service';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoadingSessions(true);
      const response = await aiTutorAPI.getSessions(1, 50);
      setSessions(response.data.data || []);
    } catch (error) {
      console.error('Failed to load sessions:', error);
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
    
    if (!confirm('Are you sure you want to delete this conversation?')) {
      return;
    }

    try {
      await aiTutorAPI.deleteSession(sessionIdToDelete);
      setSessions(prev => prev.filter(s => s._id !== sessionIdToDelete));
      
      if (sessionIdToDelete === sessionId) {
        handleReset();
      }
      
      toast.success('Conversation deleted');
    } catch (error) {
      toast.error('Failed to delete conversation');
      console.error(error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getSessionTitle = (session: ChatSession) => {
    if (session.title) return session.title;
    if (session.topic) return session.topic;
    
    const firstUserMessage = session.messages.find(m => m.role === 'user');
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
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-fuchsia-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6" style={{ height: 'calc(100vh - 8rem)' }}>
          {/* Left Sidebar - Chat History */}
          <div className="w-80 flex-shrink-0 h-full">
            <Card className="h-full flex flex-col">
              <CardHeader className="border-b bg-gradient-to-r from-violet-50 to-fuchsia-50 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="w-5 h-5 text-violet-600" />
                    Chat History
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    className="gap-1 h-8 px-2"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-3" style={{ maxHeight: 'calc(100vh - 14rem)' }}>
                {loadingSessions ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No conversations yet</p>
                    <p className="text-xs mt-1">Start chatting to save history</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sessions.map((session) => (
                      <div
                        key={session._id}
                        onClick={() => loadSession(session)}
                        className={`group relative p-3 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                          sessionId === session._id
                            ? 'bg-violet-50 border-violet-300'
                            : 'bg-white border-gray-200 hover:border-violet-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {getSessionTitle(session)}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatSessionDate(session.updatedAt)}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {session.messages.length} messages
                            </p>
                          </div>
                          <button
                            onClick={(e) => deleteSession(session._id, e)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded"
                            title="Delete conversation"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                        
                        {sessionId === session._id && (
                          <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            <ChevronRight className="w-4 h-4 text-violet-600" />
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
          <div className="flex-1 flex flex-col">
            <Card className="flex-1 flex flex-col">
              <CardHeader className="border-b bg-gradient-to-r from-violet-50 to-fuchsia-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-violet-600" />
                    AI Learning Tutor
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    New Chat
                  </Button>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-blue-600 to-purple-600'
                          : 'bg-gradient-to-br from-violet-600 to-fuchsia-600'
                      } text-white`}
                    >
                      {message.role === 'user' ? (
                        <User className="w-5 h-5" />
                      ) : (
                        <Bot className="w-5 h-5" />
                      )}
                    </div>

                    {/* Message Content */}
                    <div
                      className={`flex-1 max-w-3xl ${
                        message.role === 'user' ? 'text-right' : 'text-left'
                      }`}
                    >
                      <div
                        className={`inline-block rounded-2xl px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white'
                            : 'bg-gray-50 text-gray-800'
                        }`}
                      >
                        {message.role === 'assistant' ? (
                          <div>
                            <MarkdownRenderer content={message.content} />
                            {message.isStreaming && (
                              <span className="inline-block w-1.5 h-4 bg-violet-600 ml-1 animate-pulse"></span>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1 px-2">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}

                {loading && !messages.some(m => m.isStreaming) && (
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div className="bg-gray-50 rounded-2xl px-4 py-3">
                      <Loader2 className="w-5 h-5 animate-spin text-violet-600" />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </CardContent>

              {/* Input Area */}
              <div className="border-t p-4 bg-white">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about your studies..."
                    className="flex-1"
                    disabled={loading}
                  />
                  <Button
                    onClick={() => handleSendMessage()}
                    disabled={loading || !input.trim()}
                    className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
