"use client";

import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { employeeAIChatWithHR } from '@/ai/flows/employee-ai-chat-with-hr';
import { useAuth } from '@/hooks/use-auth';
import { Bot, Loader2, Send } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { LeaveRequest } from '@/lib/types';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'ai', text: "Hello! I'm your AI HR assistant. How can I help you today? You can ask me about your leave requests." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const firestore = useFirestore();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const leaveRequestsQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.id, 'leaveRequests') : null),
    [user, firestore]
  );
  const { data: leaveRequests } = useCollection<LeaveRequest>(leaveRequestsQuery);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const result = await employeeAIChatWithHR({ 
        message: input,
        leaveRequests: JSON.stringify(leaveRequests || []),
      });
      const aiMessage: Message = { sender: 'ai', text: result.response };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = { sender: 'ai', text: "Sorry, I'm having trouble connecting. Please try again later." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] w-full max-w-4xl mx-auto">
      <div className="flex-1 overflow-hidden rounded-lg border shadow-sm">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-6 space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start gap-4 ${message.sender === 'user' ? 'justify-end' : ''}`}
              >
                {message.sender === 'ai' && (
                  <Avatar className="h-9 w-9 border">
                    <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground">
                      <Bot className="h-5 w-5" />
                    </div>
                  </Avatar>
                )}
                <div
                  className={`max-w-[75%] rounded-lg p-3 text-sm ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p>{message.text}</p>
                </div>
                {message.sender === 'user' && user && (
                  <Avatar className="h-9 w-9 border">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-start gap-4">
                <Avatar className="h-9 w-9 border">
                  <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground">
                    <Bot className="h-5 w-5" />
                  </div>
                </Avatar>
                <div className="max-w-[75%] rounded-lg p-3 text-sm bg-muted flex items-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Thinking...
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
      <form
        onSubmit={handleSendMessage}
        className="flex items-center gap-2 p-4 border-t"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your benefits, leave policy, etc..."
          autoComplete="off"
          disabled={loading}
          className="flex-1"
        />
        <Button type="submit" disabled={!input.trim() || loading}>
          <Send className="h-4 w-4" />
          <span className="sr-only">Send</span>
        </Button>
      </form>
    </div>
  );
}
