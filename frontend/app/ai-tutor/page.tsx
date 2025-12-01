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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { aiAPI, ttsAPI, asrAPI } from '@/services/api.service';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
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
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const quickPrompts = [
    { icon: HelpCircle, text: 'Explain this concept', color: 'blue' },
    { icon: Lightbulb, text: 'Give me study tips', color: 'yellow' },
    { icon: BookOpen, text: 'Summarize this lesson', color: 'green' },
    { icon: Target, text: 'Practice questions', color: 'purple' },
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

    try {
      const response = await aiAPI.chat({
        message: messageText,
        conversationHistory: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.data.response || "I'm here to help! Could you please rephrase your question?",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      toast.error('Failed to get response');
      console.error(error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologize, but I'm having trouble responding right now. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceInput = async () => {
    if (isRecording) {
      setIsRecording(false);
      // Stop recording logic
      return;
    }

    setIsRecording(true);
    try {
      // Simulated voice recording - in real implementation, use Web Speech API or ASR service
      toast.info('Voice recording started...');
      
      // Placeholder for actual ASR implementation
      setTimeout(() => {
        setIsRecording(false);
        toast.success('Voice recorded! Processing...');
      }, 3000);
    } catch (error: any) {
      setIsRecording(false);
      toast.error('Failed to record voice');
    }
  };

  const handleTextToSpeech = async (text: string) => {
    if (isSpeaking) {
      audioRef.current?.pause();
      setIsSpeaking(false);
      return;
    }

    try {
      setIsSpeaking(true);
      const response = await ttsAPI.textToSpeech({ text });
      
      if (response.data.data.audioUrl) {
        const audio = new Audio(response.data.data.audioUrl);
        if (audioRef.current) {
          audioRef.current.pause();
        }
        (audioRef as any).current = audio;
        audio.onended = () => setIsSpeaking(false);
        audio.play();
      }
    } catch (error: any) {
      setIsSpeaking(false);
      toast.error('Failed to play audio');
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
    toast.success('Conversation reset');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-fuchsia-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="mb-2">
                  ← Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-8 h-8 text-violet-600" />
                AI Learning Tutor
              </h1>
              <p className="text-gray-600 mt-1">Your personal AI assistant for learning</p>
            </div>
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Chat
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  AI Tutor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/90 text-sm">
                  I can help you with explanations, study tips, practice questions, and more!
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Prompts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {quickPrompts.map((prompt, index) => {
                    const Icon = prompt.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => handleSendMessage(prompt.text)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all hover:shadow-md ${
                          prompt.color === 'blue' ? 'bg-blue-50 hover:bg-blue-100' :
                          prompt.color === 'yellow' ? 'bg-yellow-50 hover:bg-yellow-100' :
                          prompt.color === 'green' ? 'bg-green-50 hover:bg-green-100' :
                          'bg-purple-50 hover:bg-purple-100'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${
                          prompt.color === 'blue' ? 'text-blue-600' :
                          prompt.color === 'yellow' ? 'text-yellow-600' :
                          prompt.color === 'green' ? 'text-green-600' :
                          'text-purple-600'
                        }`} />
                        <span className="text-sm font-medium text-gray-700 text-left">
                          {prompt.text}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-violet-600" />
                  <span>Natural conversation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4 text-violet-600" />
                  <span>Voice input</span>
                </div>
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-violet-600" />
                  <span>Text-to-speech</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-600" />
                  <span>Context-aware responses</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-[calc(100vh-200px)] flex flex-col">
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
                        message.role === 'user' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`rounded-2xl px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-1 px-2">
                        <span className="text-xs text-gray-500">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {message.role === 'assistant' && (
                          <button
                            onClick={() => handleTextToSpeech(message.content)}
                            className="text-gray-400 hover:text-violet-600 transition-colors"
                          >
                            <Volume2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-white">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-violet-600" />
                        <span className="text-sm text-gray-600">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </CardContent>

              {/* Input Area */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex gap-3">
                  <button
                    onClick={handleVoiceInput}
                    className={`p-3 rounded-lg transition-colors ${
                      isRecording
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Mic className="w-5 h-5" />
                  </button>
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
                    disabled={!input.trim() || loading}
                    className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Press Enter to send • Shift+Enter for new line
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
