import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity
} from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your SWU AI assistant. How can I help you today?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const tintColor = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // Simulate AI response
  const simulateAIResponse = async (userMessage: string) => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Generate a simple response (in a real app, this would call an AI API)
    const responses = [
      "That's an interesting question! Let me think about that...",
      "I understand what you're asking. Here's my perspective on that topic.",
      "Great point! I'd be happy to help you with that.",
      "That's a complex topic. Let me break it down for you.",
      "I appreciate you sharing that with me. Here's what I think:",
      "Absolutely! I can definitely assist you with that.",
      "Thanks for asking! That's something I can help clarify.",
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    const aiResponse = `${randomResponse} You asked: "${userMessage}". This is a simulated response for demonstration purposes.`;
    
    const aiMessage: Message = {
      id: Date.now().toString() + '_ai',
      text: aiResponse,
      isUser: false,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, aiMessage]);
    setIsLoading(false);
  };

  const sendMessage = async () => {
    if (inputText.trim() === '') return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputText.trim();
    setInputText('');

    // Simulate AI response
    await simulateAIResponse(messageToSend);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <ThemedView style={[styles.header, { borderBottomColor: iconColor + '30' }]}>
        <ThemedText type="title" style={styles.headerTitle}>AI Chat</ThemedText>
        <ThemedText style={[styles.headerSubtitle, { color: iconColor }]}>
          Ask me anything!
        </ThemedText>
      </ThemedView>

      {/* Messages Area */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <ThemedView key={message.id} style={styles.messageWrapper}>
            <ThemedView 
              style={[
                styles.messageBubble,
                message.isUser ? styles.userBubble : styles.aiBubble,
                message.isUser 
                  ? { backgroundColor: tintColor } 
                  : { backgroundColor: iconColor + '20' }
              ]}
            >
              <ThemedText 
                style={[
                  styles.messageText,
                  message.isUser 
                    ? { color: '#000' } 
                    : { color: textColor }
                ]}
              >
                {message.text}
              </ThemedText>
              <ThemedText 
                style={[
                  styles.messageTime,
                  message.isUser 
                    ? { color: '#fff', opacity: 0.8 } 
                    : { color: iconColor }
                ]}
              >
                {formatTime(message.timestamp)}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <ThemedView style={styles.messageWrapper}>
            <ThemedView style={[styles.messageBubble, styles.aiBubble, { backgroundColor: iconColor + '20' }]}>
              <ActivityIndicator size="small" color={tintColor} />
              <ThemedText style={[styles.typingText, { color: iconColor }]}>
                AI is typing...
              </ThemedText>
            </ThemedView>
          </ThemedView>
        )}
      </ScrollView>

      {/* Input Area */}
      <ThemedView style={[styles.inputContainer, { borderTopColor: iconColor + '30' }]}>
        <TextInput
          style={[
            styles.textInput,
            { 
              backgroundColor: backgroundColor,
              borderColor: iconColor + '30',
              color: textColor
            }
          ]}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your message..."
          placeholderTextColor={iconColor}
          multiline
          maxLength={500}
          onSubmitEditing={sendMessage}
          blurOnSubmit={false}
        />
        <TouchableOpacity 
          style={[
            styles.sendButton,
            { 
              backgroundColor: inputText.trim() ? tintColor : iconColor + '30',
              opacity: inputText.trim() ? 1 : 0.6 
            }
          ]}
          onPress={sendMessage}
          disabled={inputText.trim() === '' || isLoading}
        >
          <Ionicons 
            name="send" 
            size={20} 
            color="#fff" 
          />
        </TouchableOpacity>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    textAlign: 'center',
    marginBottom: 4,
  },
  headerSubtitle: {
    textAlign: 'center',
    fontSize: 14,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  messageWrapper: {
    marginBottom: 12,
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    maxWidth: '80%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 8,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 8,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 12,
    alignSelf: 'flex-end',
  },
  typingText: {
    fontSize: 14,
    fontStyle: 'italic',
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 12,
    borderTopWidth: 1,
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
