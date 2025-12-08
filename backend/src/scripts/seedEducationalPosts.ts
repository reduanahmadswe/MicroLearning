import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Post } from '../app/modules/post/post.model';

dotenv.config();

const userId = '692d9126f7c9d038b0e3ee2f';

const educationalPosts = [
  {
    content: `🚀 JavaScript Array Methods যা প্রতিটি Developer জানা উচিত!

আজ শিখলাম JavaScript এর powerful array methods সম্পর্কে। এগুলো code কে অনেক clean এবং readable করে:

✅ map() - Transform করার জন্য
✅ filter() - Conditional filtering
✅ reduce() - একটা single value তে convert
✅ find() - নির্দিষ্ট element খুঁজে বের করা
✅ some() & every() - Boolean checks

Example:
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
// Output: [2, 4, 6, 8, 10]

কোন array method আপনি সবচেয়ে বেশি ব্যবহার করেন? 💭

#JavaScript #WebDevelopment #Programming #LearningInPublic`,
    type: 'learning',
    visibility: 'public',
  },
  {
    content: `📚 Algorithm Complexity বোঝার সহজ উপায় - Big O Notation

Big O Notation শিখছি, এটা algorithm এর efficiency measure করতে ব্যবহার হয়:

⏱️ O(1) - Constant Time (সবচেয়ে ভালো)
⏱️ O(log n) - Logarithmic Time
⏱️ O(n) - Linear Time
⏱️ O(n log n) - Linearithmic Time
⏱️ O(n²) - Quadratic Time
⏱️ O(2ⁿ) - Exponential Time (সবচেয়ে খারাপ)

Real Example:
Array lookup করতে O(1) লাগে কিন্তু nested loops এ O(n²) time লাগে!

Optimization করার সময় এটা জানা অনেক কাজে লাগে। 🎯

#DataStructures #Algorithms #BigO #ComputerScience #ProblemSolving`,
    type: 'learning',
    visibility: 'public',
  },
  {
    content: `💡 CSS Flexbox দিয়ে Perfect Layout তৈরি করলাম!

আজকে একটা responsive navigation bar বানালাম শুধু Flexbox দিয়ে। No Bootstrap, No Framework! 🎨

যেই properties ব্যবহার করলাম:
✨ display: flex
✨ justify-content: space-between
✨ align-items: center
✨ gap: 20px

Result: Mobile-friendly, clean, এবং professional looking navbar! 📱💻

CSS এর power সত্যিই amazing যখন properly use করা হয়। আগে framework এ depend করতাম, এখন নিজেই design করতে পারি! 🚀

কে কে pure CSS পছন্দ করেন? 🙋‍♂️

#CSS #WebDesign #Frontend #Flexbox #ResponsiveDesign`,
    type: 'learning',
    images: ['https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800'],
    visibility: 'public',
  },
  {
    content: `🎯 Problem Solving Tips যা আমার coding journey তে সাহায্য করেছে:

1️⃣ Problem কে ছোট ছোট parts এ ভাগ করো
2️⃣ কাগজে বা whiteboard এ diagram আঁকো
3️⃣ Edge cases নিয়ে চিন্তা করো
4️⃣ Brute force solution দিয়ে শুরু করো, তারপর optimize করো
5️⃣ Similar problems খুঁজো এবং pattern শেখো
6️⃣ Code লেখার আগে pseudocode লিখো
7️⃣ Test cases লিখো এবং manually trace করো
8️⃣ Stuck হলে break নাও, fresh mind দিয়ে আবার try করো

"The best way to learn problem solving is by solving problems!" 💪

LeetCode এ daily 2-3 problems solve করি। Consistency is key! 🔑

#ProblemSolving #CodingTips #DSA #LeetCode #Programming`,
    type: 'learning',
    visibility: 'public',
  },
  {
    content: `🔥 Git Commands যা প্রতিদিন ব্যবহার করি:

Version control ছাড়া modern development impossible! আজ আমার most used Git commands share করছি:

📌 Basic Commands:
• git init - নতুন repo শুরু করতে
• git add . - সব changes stage করতে
• git commit -m "message" - changes save করতে
• git push origin main - remote এ push করতে

🔧 Advanced:
• git branch feature-name - নতুন branch
• git checkout branch-name - branch switch
• git merge - branches merge করতে
• git stash - temporary save
• git log --oneline - commit history

Pro tip: .gitignore file অবশ্যই use করবেন! 🎯

#Git #GitHub #VersionControl #DevOps #Programming`,
    type: 'learning',
    visibility: 'public',
  },
  {
    content: `🎓 আজকের Study Session - React Hooks Deep Dive!

3 ঘণ্টা React Hooks নিয়ে পড়াশোনা করলাম। Key takeaways: 📝

🪝 useState - State management
🪝 useEffect - Side effects & lifecycle
🪝 useContext - Global state sharing
🪝 useReducer - Complex state logic
🪝 useMemo - Performance optimization
🪝 useCallback - Function memoization
🪝 useRef - DOM references

একটা Todo App বানিয়ে সব hooks practice করলাম। Hands-on learning সবচেয়ে effective! 💪

Custom hooks ও বানানো শিখলাম - এটা code reusability অনেক বাড়ায়! 🚀

React developers, কোন hook আপনার favorite? 🤔

#React #ReactHooks #JavaScript #Frontend #LearningJourney`,
    type: 'learning',
    images: ['https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800'],
    visibility: 'public',
  },
  {
    content: `💻 Database Design Best Practices যা শিখলাম:

MongoDB দিয়ে কাজ করতে গিয়ে কিছু important lessons শিখলাম: 🎯

1️⃣ Proper indexing করো - Query performance বাড়ে
2️⃣ Embedding vs Referencing - সঠিক approach choose করো
3️⃣ Schema validation ব্যবহার করো
4️⃣ Avoid deep nesting (max 3-4 levels)
5️⃣ Use meaningful field names
6️⃣ Plan for scalability from day one
7️⃣ Regular backups নাও
8️⃣ Monitor performance metrics

একটা e-commerce project এ এই principles apply করে query time 70% reduce করতে পেরেছি! 🚀

Database design হলো foundation - ভালো design না থাকলে পরে অনেক problem হয়। 

#MongoDB #Database #Backend #WebDevelopment #BestPractices`,
    type: 'learning',
    visibility: 'public',
  },
  {
    content: `🎥 Today's Learning: API Development with Node.js & Express

RESTful API তৈরির complete process শিখলাম আজ! 🚀

📋 What I built:
✅ User Authentication (JWT)
✅ CRUD Operations
✅ Error Handling Middleware
✅ Input Validation
✅ Rate Limiting
✅ API Documentation (Swagger)

Code Example:
app.post('/api/users', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

Backend development এর মজা আলাদা! Logic building skills অনেক improve হয় 💪

#NodeJS #Express #API #Backend #WebDevelopment`,
    type: 'learning',
    video: 'https://www.youtube.com/watch?v=fgTGADljAeg',
    visibility: 'public',
  },
  {
    content: `📱 Responsive Design Principles আমি যা follow করি:

Mobile-first approach এ website design করতে গিয়ে এই principles সবচেয়ে কাজে লেগেছে: 🎨

📐 Design Principles:
1. Mobile-first approach (320px থেকে শুরু)
2. Flexible grid layouts (%, em, rem units)
3. Flexible images (max-width: 100%)
4. Media queries for breakpoints
5. Touch-friendly buttons (min 44x44px)
6. Readable fonts (min 16px for body)
7. Avoid horizontal scrolling
8. Test on real devices

Breakpoints আমি যা use করি:
📱 Mobile: 320px - 767px
📱 Tablet: 768px - 1023px
💻 Desktop: 1024px+

এখন সব projects এ mobile users প্রায় 60%+, তাই responsive design must! 🎯

#ResponsiveDesign #MobileFirst #WebDesign #CSS #UXDesign`,
    type: 'learning',
    images: ['https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800'],
    visibility: 'public',
  },
  {
    content: `🏆 30 Days Coding Challenge - Day 30 Complete! 

আজ আমার 30 days coding challenge শেষ হলো! 🎉

📊 What I Accomplished:
✅ 90+ LeetCode problems solved
✅ 5টা mini projects complete
✅ HTML, CSS, JavaScript mastered
✅ React basics শিখলাম
✅ Git/GitHub workflow শিখলাম
✅ Portfolio website বানালাম

🎯 Key Learnings:
• Consistency beats intensity
• Break down complex problems
• Learn by building projects
• Join developer communities
• Never stop learning!

Starting Point: Complete beginner
Current: Can build full-stack apps! 🚀

Next Goal: Master TypeScript & Next.js 💪

যারা coding শিখছো, হাল ছেড়ো না! Every expert was once a beginner. 

#100DaysOfCode #CodingChallenge #WebDevelopment #LearningJourney #Programming`,
    type: 'achievement',
    video: 'https://www.youtube.com/watch?v=8S6z4p4R_oA',
    visibility: 'public',
    metadata: {
      achievement: '30 Days Coding Challenge Completed',
    },
  },
];

const seedEducationalPosts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/microlearning-db');
    console.log('📦 Connected to MongoDB\n');

    console.log(`👤 Creating posts for user: ${userId}\n`);
    console.log('🚀 Starting to create educational posts...\n');
    console.log('='.repeat(60));

    // Delete existing posts by this user
    const existingPosts = await Post.find({ user: userId });
    if (existingPosts.length > 0) {
      await Post.deleteMany({ user: userId });
      console.log(`🗑️  Deleted ${existingPosts.length} existing posts\n`);
    }

    const createdPosts = [];

    // Create posts with random reactions
    for (let i = 0; i < educationalPosts.length; i++) {
      const postData = educationalPosts[i];
      
      // Generate random reactions
      const numReactions = Math.floor(Math.random() * 50) + 10; // 10-60 reactions
      const reactions = [];
      const reactionTypes = ['like', 'love', 'celebrate', 'insightful', 'curious'];
      
      for (let j = 0; j < numReactions; j++) {
        reactions.push({
          user: new mongoose.Types.ObjectId(),
          type: reactionTypes[Math.floor(Math.random() * reactionTypes.length)],
          createdAt: new Date(),
        });
      }

      const post = await Post.create({
        ...postData,
        user: userId,
        reactions,
        comments: [],
        shares: [],
      });

      createdPosts.push(post);
      
      const mediaInfo = post.images?.length 
        ? `images (${post.images.length})` 
        : post.video 
        ? 'video' 
        : 'text only';

      console.log(`✅ Post ${i + 1}: ${post.type.toUpperCase()} post created`);
      console.log(`   📝 Length: ${post.content.length} characters`);
      console.log(`   📎 Media: ${mediaInfo}`);
      console.log(`   ❤️  Reactions: ${post.reactions.length}`);
      console.log('');
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✨ Educational Posts Creation Summary');
    console.log('='.repeat(60));
    console.log(`👤 User ID: ${userId}`);
    console.log(`📝 Total Posts: ${createdPosts.length}`);
    console.log(`📊 Post Types:`);
    console.log(`   - Learning Posts: ${createdPosts.filter(p => p.type === 'learning').length}`);
    console.log(`   - Achievement Posts: ${createdPosts.filter(p => p.type === 'achievement').length}`);
    console.log(`   - With Images: ${createdPosts.filter(p => p.images && p.images.length > 0).length}`);
    console.log(`   - With Video: ${createdPosts.filter(p => p.video).length}`);
    console.log(`❤️  Total Reactions: ${createdPosts.reduce((sum, p) => sum + (p.reactions?.length || 0), 0)}`);

    console.log('\n📝 Posts Created:');
    createdPosts.forEach((post, index) => {
      const firstLine = post.content.split('\n')[0];
      console.log(`   ${index + 1}. ${firstLine.substring(0, 50)}...`);
      console.log(`      Type: ${post.type} | Reactions: ${post.reactions.length}`);
    });

    console.log('\n✅ All educational posts created successfully!');
    console.log('🎉 Feed is now populated with quality content!\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedEducationalPosts();
