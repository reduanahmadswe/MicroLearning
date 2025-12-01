import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../app/modules/auth/auth.model';
import Lesson from '../app/modules/microLessons/lesson.model';
import { Quiz } from '../app/modules/quiz/quiz.model';
import { Course } from '../app/modules/course/course.model';
import Flashcard from '../app/modules/flashcard/flashcard.model';
import { Post, Group } from '../app/modules/forum/forum.model';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/microlearning';

// Sample data arrays
const topics = ['JavaScript', 'Python', 'React', 'Node.js', 'MongoDB', 'TypeScript', 'CSS', 'HTML', 'Docker', 'Kubernetes'];
const categories = ['Programming', 'Web Development', 'Data Science', 'DevOps', 'Mobile Development', 'AI/ML', 'Database', 'Cloud Computing'];
const difficulties = ['beginner', 'intermediate', 'advanced'];

const lessonTitles = [
  'Introduction to {topic}', 'Getting Started with {topic}', 'Advanced {topic} Concepts',
  '{topic} Best Practices', 'Mastering {topic}', '{topic} for Beginners',
  'Deep Dive into {topic}', '{topic} Tips and Tricks', 'Common {topic} Mistakes',
  'Building Projects with {topic}', '{topic} Performance Optimization', '{topic} Security',
];

const quizTypes = ['mcq', 'true-false', 'fill-blank'];

const forumPostTitles = [
  'How to get started with {topic}?', 'Best practices for {topic}',
  'Common mistakes in {topic}', 'Tips for learning {topic}',
  'Resources for {topic}', 'Career in {topic}', '{topic} vs alternatives',
  'Latest trends in {topic}', 'Interview questions for {topic}',
];

// Helper functions
const randomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomNumber = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateLessonContent = (topic: string) => `
# Introduction to ${topic}

## Overview
This lesson covers the fundamentals of ${topic} and how to apply them in real-world scenarios.

## What You'll Learn
- Core concepts of ${topic}
- Best practices and patterns
- Common use cases
- Hands-on examples

## Content

### Section 1: Basics
${topic} is a powerful technology that enables developers to build efficient applications. 
Understanding the core principles is essential for mastering this skill.

### Section 2: Key Concepts
1. **Concept 1**: Description of first key concept
2. **Concept 2**: Description of second key concept  
3. **Concept 3**: Description of third key concept

### Section 3: Practical Examples
\`\`\`javascript
// Example code for ${topic}
function example() {
  console.log('Learning ${topic}!');
  return true;
}
\`\`\`

## Summary
By completing this lesson, you now understand the fundamentals of ${topic} and can apply these concepts in your projects.

## Next Steps
- Practice with exercises
- Build a small project
- Explore advanced topics
`;

async function seedDemoData() {
  try {
    console.log('🌱 Starting demo data seeding...');

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get or create demo users
    let demoUsers = await User.find({ role: { $in: ['learner', 'instructor'] } }).limit(10);
    
    if (demoUsers.length === 0) {
      console.log('Creating demo users...');
      const usersToCreate = [];
      for (let i = 1; i <= 10; i++) {
        usersToCreate.push({
          name: `Demo User ${i}`,
          email: `demo${i}@example.com`,
          password: 'password123',
          role: (i <= 5 ? 'instructor' : 'learner') as 'instructor' | 'learner',
          xp: randomNumber(0, 5000),
          level: randomNumber(1, 10),
          coins: randomNumber(0, 1000),
        });
      }
      demoUsers = await User.insertMany(usersToCreate);
      console.log(`✅ Created ${demoUsers.length} demo users`);
    } else {
      console.log(`✅ Using existing ${demoUsers.length} users`);
    }

    const instructors = demoUsers.filter(u => u.role === 'instructor' || u.role === 'admin');
    const learners = demoUsers.filter(u => u.role === 'learner');
    
    // Fallback if no instructors found
    if (instructors.length === 0) {
      instructors.push(demoUsers[0]); // Use first user as instructor
    }
    if (learners.length === 0) {
      learners.push(demoUsers[0]); // Use first user as learner
    }

    // Clear existing demo data (optional - comment out if you want to keep existing data)
    // await Promise.all([
    //   Lesson.deleteMany({}),
    //   Quiz.deleteMany({}),
    //   Course.deleteMany({}),
    //   Flashcard.deleteMany({}),
    //   Post.deleteMany({}),
    // ]);
    // console.log('🗑️  Cleared existing data');

    // Seed Lessons (100)
    console.log('📚 Creating 100 lessons...');
    const lessons = [];
    for (let i = 1; i <= 100; i++) {
      const topic = randomElement(topics);
      const titleTemplate = randomElement(lessonTitles);
      const title = titleTemplate.replace('{topic}', topic);
      const slug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim() + `-${Date.now()}-${i}`;
      
      lessons.push({
        title,
        topic,
        description: `Learn about ${topic} in this comprehensive micro-lesson. Master the fundamentals and practical applications.`,
        content: generateLessonContent(topic),
        difficulty: randomElement(difficulties),
        estimatedTime: randomNumber(5, 30),
        xpReward: randomNumber(10, 50),
        coinsReward: randomNumber(5, 25),
        author: randomElement(instructors)._id,
        tags: [topic.toLowerCase(), randomElement(categories).toLowerCase()],
        isPublished: true,
        slug,
      });
    }
    const createdLessons = await Lesson.insertMany(lessons);
    console.log(`✅ Created ${createdLessons.length} lessons`);

    // Seed Quizzes (100)
    console.log('❓ Creating 100 quizzes...');
    const quizzes = [];
    for (let i = 1; i <= 100; i++) {
      const lesson = randomElement(createdLessons);
      const questionCount = randomNumber(3, 10);
      const questions = [];

      for (let q = 1; q <= questionCount; q++) {
        const type = randomElement(quizTypes);
        const question: any = {
          question: `Question ${q} for ${lesson.title}?`,
          type,
          points: randomNumber(5, 15),
        };

        if (type === 'mcq') {
          question.options = [
            `Option A for question ${q}`,
            `Option B for question ${q}`,
            `Option C for question ${q}`,
            `Option D for question ${q}`,
          ];
          question.correctAnswer = randomNumber(0, 3);
          question.explanation = `The correct answer is option ${String.fromCharCode(65 + question.correctAnswer)}.`;
        } else if (type === 'true-false') {
          question.options = ['True', 'False'];
          question.correctAnswer = randomNumber(0, 1);
          question.explanation = `The statement is ${question.correctAnswer === 0 ? 'True' : 'False'}.`;
        } else {
          question.correctAnswer = 'sample answer';
          question.explanation = 'Fill in the blank correctly.';
        }

        questions.push(question);
      }

      quizzes.push({
        title: `Quiz for ${lesson.title}`,
        description: `Test your knowledge of ${lesson.topic}`,
        lesson: lesson._id,
        topic: lesson.topic,
        questions,
        difficulty: lesson.difficulty,
        author: lesson.author,
        timeLimit: randomNumber(10, 30),
        passingScore: randomNumber(60, 80),
        xpReward: randomNumber(20, 60),
        coinsReward: randomNumber(10, 30),
      });
    }
    const createdQuizzes = await Quiz.insertMany(quizzes);
    console.log(`✅ Created ${createdQuizzes.length} quizzes`);

    // Seed Courses (100)
    console.log('🎓 Creating 100 courses...');
    const courses = [];
    for (let i = 1; i <= 100; i++) {
      const topic = randomElement(topics);
      const lessonsForCourse = createdLessons
        .filter(l => l.topic === topic)
        .slice(0, randomNumber(3, 8))
        .map((l, index) => ({
          lesson: l._id,
          order: index + 1,
          isOptional: false,
        }));

      const title = `Complete ${topic} Course ${i}`;
      const slug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim() + `-${Date.now()}-${i}`;

      courses.push({
        title,
        description: `Master ${topic} with this comprehensive course covering all essential concepts and practical applications.`,
        topic,
        difficulty: randomElement(difficulties),
        author: randomElement(instructors)._id,
        price: randomNumber(0, 99) > 70 ? randomNumber(500, 2000) : 0, // 30% free courses
        thumbnailUrl: `https://via.placeholder.com/400x225?text=${topic.replace(' ', '+')}+Course`,
        estimatedDuration: randomNumber(5, 50),
        isPremium: randomNumber(0, 99) > 70,
        lessons: lessonsForCourse,
        slug,
        prerequisites: randomNumber(0, 100) > 70 ? [`Basic understanding of ${randomElement(topics)}`] : [],
        learningOutcomes: [
          `Understand core ${topic} concepts`,
          `Build real-world projects with ${topic}`,
          `Apply best practices in ${topic}`,
          `Solve complex problems using ${topic}`,
        ],
        tags: [topic.toLowerCase(), randomElement(categories).toLowerCase()],
        isPublished: true,
        enrolledCount: randomNumber(10, 500),
        rating: randomNumber(35, 50) / 10, // 3.5 to 5.0
        ratingCount: randomNumber(5, 100),
      });
    }
    const createdCourses = await Course.insertMany(courses);
    console.log(`✅ Created ${createdCourses.length} courses`);

    // Seed Flashcards (100)
    console.log('🎴 Creating 100 flashcards...');
    const flashcards = [];
    for (let i = 1; i <= 100; i++) {
      const topic = randomElement(topics);
      const user = randomElement([...instructors, ...learners]);

      flashcards.push({
        user: user._id,
        front: `What is ${topic} concept ${i}?`,
        back: `${topic} concept ${i} is a fundamental principle that helps developers understand and implement efficient solutions.`,
        topic,
        difficulty: randomElement(difficulties),
        tags: [topic.toLowerCase(), randomElement(categories).toLowerCase()],
        masteryLevel: randomNumber(0, 5),
        nextReviewDate: new Date(Date.now() + randomNumber(1, 7) * 24 * 60 * 60 * 1000),
        reviewCount: randomNumber(0, 20),
        lastReviewedAt: new Date(Date.now() - randomNumber(1, 30) * 24 * 60 * 60 * 1000),
      });
    }
    const createdFlashcards = await Flashcard.insertMany(flashcards);
    console.log(`✅ Created ${createdFlashcards.length} flashcards`);

    // Seed Forum Groups (10)
    console.log('👥 Creating 10 forum groups...');
    const groups = [];
    for (let i = 1; i <= 10; i++) {
      const topic = randomElement(topics);
      groups.push({
        name: `${topic} Study Group ${i}`,
        description: `A community for ${topic} enthusiasts to share knowledge, ask questions, and collaborate on projects.`,
        category: randomElement(categories),
        privacy: randomElement(['public', 'public', 'public', 'private']), // 75% public
        creator: randomElement(instructors)._id,
        moderators: [randomElement(instructors)._id],
        members: [...instructors.slice(0, 2).map(u => u._id), ...learners.slice(0, 3).map(u => u._id)],
        memberCount: 5,
        postCount: 0,
        tags: [topic.toLowerCase(), 'learning', 'community'],
        isActive: true,
      });
    }
    const createdGroups = await Group.insertMany(groups);
    console.log(`✅ Created ${createdGroups.length} forum groups`);

    // Seed Forum Posts (100)
    console.log('💬 Creating 100 forum posts...');
    const forumPosts = [];
    for (let i = 1; i <= 100; i++) {
      const topic = randomElement(topics);
      const titleTemplate = randomElement(forumPostTitles);
      const title = titleTemplate.replace('{topic}', topic);
      const author = randomElement([...instructors, ...learners]);

      forumPosts.push({
        group: randomElement(createdGroups)._id,
        title,
        content: `I've been working with ${topic} for a while now and wanted to share my experience and get your thoughts. 

Here are some key points I've learned:

1. **Getting Started**: The initial learning curve can be steep, but it gets easier with practice.
2. **Best Practices**: Following community guidelines and patterns is crucial for long-term success.
3. **Common Pitfalls**: Watch out for common mistakes that beginners often make.
4. **Resources**: There are great tutorials and documentation available online.

What has been your experience with ${topic}? Any tips or advice for someone learning it?

Looking forward to hearing your thoughts!`,
        author: author._id,
        contentType: randomElement(['text', 'question', 'discussion']),
        tags: [topic.toLowerCase(), randomElement(['discussion', 'question', 'tutorial', 'help'])],
        viewCount: randomNumber(10, 1000),
        likeCount: randomNumber(0, 100),
        isPinned: randomNumber(0, 100) > 95, // 5% pinned posts
        isLocked: false,
      });
    }
    const createdPosts = await Post.insertMany(forumPosts);
    console.log(`✅ Created ${createdPosts.length} forum posts`);

    // Summary
    console.log('\n🎉 Demo data seeding completed successfully!');
    console.log('═══════════════════════════════════════════');
    console.log(`📚 Lessons:    ${createdLessons.length}`);
    console.log(`❓ Quizzes:    ${createdQuizzes.length}`);
    console.log(`🎓 Courses:    ${createdCourses.length}`);
    console.log(`🎴 Flashcards: ${createdFlashcards.length}`);
    console.log(`💬 Forum Posts: ${createdPosts.length}`);
    console.log('═══════════════════════════════════════════');
    console.log(`📊 Total Items: ${createdLessons.length + createdQuizzes.length + createdCourses.length + createdFlashcards.length + createdPosts.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDemoData();
