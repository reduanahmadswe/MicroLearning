import { Types } from 'mongoose';
import {
  AIProvider,
  IGenerateLessonRequest,
  IGeneratedLesson,
  IGenerateQuizRequest,
  IGeneratedQuiz,
  IGenerateFlashcardRequest,
  IGeneratedFlashcardSet,
  IChatRequest,
  IChatResponse,
} from './ai.types';

/**
 * Mock AI Service - Works without API Key
 * Perfect for development and testing
 */

/**
 * Generate Mock Lesson
 */
export const generateMockLesson = async (
  userId: Types.ObjectId,
  data: IGenerateLessonRequest
): Promise<IGeneratedLesson> => {
  const { topic, difficulty = 'beginner', duration = 10 } = data;

  const mockLesson: IGeneratedLesson = {
    title: `${topic}: A Comprehensive Guide`,
    content: `# Introduction to ${topic}

## What is ${topic}?

${topic} is an important concept that helps you understand fundamental principles in this domain. This micro-lesson will give you a solid foundation.

## Key Concepts

### 1. Basic Understanding
When learning about ${topic}, it's essential to start with the fundamentals. Think of it as building blocks - each concept supports the next.

### 2. Practical Applications
In real-world scenarios, ${topic} is used extensively. Here's how:
- **Application 1**: Solving everyday problems
- **Application 2**: Improving efficiency
- **Application 3**: Creating better solutions

### 3. Advanced Insights
As you progress, you'll discover that ${topic} connects to many other areas. This interconnection makes it even more valuable to master.

## How to Apply This Knowledge

1. **Start Small**: Begin with simple examples
2. **Practice Regularly**: Consistency is key
3. **Build Projects**: Apply what you learn
4. **Teach Others**: Sharing knowledge solidifies understanding

## Common Mistakes to Avoid

- Rushing through fundamentals
- Not practicing enough
- Ignoring edge cases
- Skipping documentation

## Conclusion

${topic} is a valuable skill that opens many doors. Keep practicing, stay curious, and don't be afraid to experiment!`,
    
    summary: `This lesson covers the fundamentals of ${topic}, including basic concepts, practical applications, and how to apply this knowledge effectively. Perfect for ${difficulty} level learners.`,
    
    examples: [
      `**Example 1**: Basic Implementation\nLet's say you want to use ${topic} in a real project. Start by identifying your goal, then break it down into smaller steps.`,
      `**Example 2**: Advanced Usage\nOnce you're comfortable with basics, you can combine ${topic} with other techniques to create powerful solutions.`,
      `**Example 3**: Real-World Scenario\nMany companies use ${topic} to improve their products. Here's how you can apply the same principles.`
    ],
    
    keyPoints: [
      `${topic} is fundamental to understanding this domain`,
      'Start with basics before moving to advanced concepts',
      'Practice regularly to build muscle memory',
      'Real-world applications make learning more meaningful',
      'Common mistakes can be avoided with proper guidance',
      'Teaching others helps solidify your own understanding',
      'Continuous learning keeps you updated with best practices'
    ],
    
    estimatedDuration: duration,
    difficulty: difficulty,
    
    metadata: {
      topic: topic,
      generatedBy: 'openai' as AIProvider,
      generatedAt: new Date(),
      tokens: 500,
    },
  };

  return mockLesson;
};

/**
 * Generate Mock Quiz
 */
export const generateMockQuiz = async (
  userId: Types.ObjectId,
  data: IGenerateQuizRequest
): Promise<IGeneratedQuiz> => {
  const { topic, numberOfQuestions = 5, difficulty = 'beginner' } = data;

  const questions = [];
  
  for (let i = 1; i <= numberOfQuestions; i++) {
    questions.push({
      question: `Question ${i}: What is the most important aspect of ${topic}?`,
      type: 'multiple-choice' as const,
      options: [
        'Understanding the fundamentals',
        'Memorizing syntax',
        'Skipping documentation',
        'Avoiding practice'
      ],
      correctAnswer: 'Understanding the fundamentals',
      explanation: `Understanding fundamentals is crucial when learning ${topic}. It provides a strong foundation for advanced concepts.`,
      difficulty: difficulty,
      points: difficulty === 'beginner' ? 5 : difficulty === 'intermediate' ? 10 : 15,
    });
  }

  const mockQuiz: IGeneratedQuiz = {
    title: `${topic} Quiz - ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Level`,
    description: `Test your knowledge of ${topic} with this ${numberOfQuestions}-question quiz. Each question is designed to reinforce key concepts.`,
    questions: questions,
    totalPoints: questions.reduce((sum, q) => sum + q.points, 0),
    estimatedDuration: numberOfQuestions * 2, // 2 minutes per question
    metadata: {
      topic: topic,
      generatedBy: 'openai' as AIProvider,
      generatedAt: new Date(),
      tokens: 300,
    },
  };

  return mockQuiz;
};

/**
 * Generate Mock Flashcards
 */
export const generateMockFlashcards = async (
  userId: Types.ObjectId,
  data: IGenerateFlashcardRequest
): Promise<IGeneratedFlashcardSet> => {
  const { topic, numberOfCards = 10 } = data;

  const cards = [];
  
  for (let i = 1; i <= numberOfCards; i++) {
    cards.push({
      front: `Key Concept ${i} of ${topic}`,
      back: `This is an important concept that helps you understand ${topic} better. Make sure to review this regularly and practice applying it in different contexts.`,
      difficulty: 'intermediate' as const,
      tags: [topic.toLowerCase(), 'concept', `card-${i}`],
    });
  }

  const mockFlashcards: IGeneratedFlashcardSet = {
    title: `${topic} Flashcard Set`,
    description: `Master ${topic} with these ${numberOfCards} carefully crafted flashcards. Use spaced repetition for best results.`,
    cards: cards,
    metadata: {
      topic: topic,
      generatedBy: 'openai' as AIProvider,
      generatedAt: new Date(),
      tokens: 200,
    },
  };

  return mockFlashcards;
};

/**
 * Mock Chat Response
 */
export const generateMockChat = async (
  userId: Types.ObjectId,
  data: IChatRequest
): Promise<IChatResponse> => {
  const { message, context } = data;

  const responses = [
    `That's a great question about "${message}"! Let me help you understand this better. ${context?.topic ? `Based on the context you provided about ${context.topic}..., ` : ''}The key thing to remember is that learning is a journey, not a destination.`,
    
    `I understand you're asking about "${message}". Here's what you need to know: This is a fundamental concept that builds upon previous knowledge. Try breaking it down into smaller parts and practice each one separately.`,
    
    `Excellent question! Regarding "${message}" - think of it this way: Every expert was once a beginner. The important thing is to keep practicing and don't be afraid to make mistakes. ${context ? 'Looking at your context, ' : ''}I'd recommend starting with the basics and gradually building up complexity.`,
    
    `Thanks for asking about "${message}"! This is actually a common question. The best approach is to: 1) Understand the fundamentals, 2) Practice with real examples, 3) Review regularly. ${context ? 'In your specific case, ' : ''}Focus on one concept at a time for best results.`,
  ];

  const randomResponse = responses[Math.floor(Math.random() * responses.length)];

  return {
    message: randomResponse,
    sessionId: new Types.ObjectId().toString(),
    metadata: {
      tokens: 150,
      provider: 'openai' as AIProvider,
    },
  };
};
