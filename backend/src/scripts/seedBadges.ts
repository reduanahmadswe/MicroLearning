import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Badge } from '../app/modules/badge/badge.model';

dotenv.config();

const badges = [
  // ============ STREAK BADGES ============
  {
    name: '🔥 First Flame',
    description: '৩ দিন পরপর শেখার ধারাবাহিকতা বজায় রাখুন। আপনার শেখার যাত্রার শুরু!',
    icon: '🔥',
    criteria: {
      type: 'streak',
      threshold: 3,
    },
    rarity: 'common',
    xpReward: 50,
    isActive: true,
  },
  {
    name: '🔥 Week Warrior',
    description: '৭ দিন পরপর শেখার consistency maintain করুন। অসাধারণ!',
    icon: '🔥',
    criteria: {
      type: 'streak',
      threshold: 7,
    },
    rarity: 'common',
    xpReward: 100,
    isActive: true,
  },
  {
    name: '🔥 Two Week Champion',
    description: '১৪ দিনের streak complete করুন। আপনি সত্যিই dedicated!',
    icon: '🔥',
    criteria: {
      type: 'streak',
      threshold: 14,
    },
    rarity: 'rare',
    xpReward: 200,
    isActive: true,
  },
  {
    name: '🔥 Monthly Master',
    description: '৩০ দিনের streak! আপনি একজন true learner!',
    icon: '🔥',
    criteria: {
      type: 'streak',
      threshold: 30,
    },
    rarity: 'rare',
    xpReward: 500,
    isActive: true,
  },
  {
    name: '🔥 Unstoppable Force',
    description: '৬০ দিনের streak! কিছুই আপনাকে থামাতে পারে না!',
    icon: '🔥',
    criteria: {
      type: 'streak',
      threshold: 60,
    },
    rarity: 'epic',
    xpReward: 1000,
    isActive: true,
  },
  {
    name: '🔥 Century Achiever',
    description: '১০০ দিনের streak! আপনি একজন legend!',
    icon: '🔥',
    criteria: {
      type: 'streak',
      threshold: 100,
    },
    rarity: 'legendary',
    xpReward: 2000,
    isActive: true,
  },

  // ============ LESSONS COMPLETED BADGES ============
  {
    name: '📚 First Steps',
    description: 'প্রথম ৫টি lesson complete করুন। শুরুটা ভালো হয়েছে!',
    icon: '📚',
    criteria: {
      type: 'lessons_completed',
      threshold: 5,
    },
    rarity: 'common',
    xpReward: 50,
    isActive: true,
  },
  {
    name: '📚 Knowledge Seeker',
    description: '১০টি lesson complete! শেখার আগ্রহ দেখে ভালো লাগছে!',
    icon: '📚',
    criteria: {
      type: 'lessons_completed',
      threshold: 10,
    },
    rarity: 'common',
    xpReward: 100,
    isActive: true,
  },
  {
    name: '📚 Learning Enthusiast',
    description: '২৫টি lesson শেষ করেছেন! অসাধারণ progress!',
    icon: '📚',
    criteria: {
      type: 'lessons_completed',
      threshold: 25,
    },
    rarity: 'rare',
    xpReward: 250,
    isActive: true,
  },
  {
    name: '📚 Half Century',
    description: '৫০টি lesson complete! আপনি একজন serious learner!',
    icon: '📚',
    criteria: {
      type: 'lessons_completed',
      threshold: 50,
    },
    rarity: 'rare',
    xpReward: 500,
    isActive: true,
  },
  {
    name: '📚 Lesson Master',
    description: '১০০টি lesson completed! Outstanding achievement!',
    icon: '📚',
    criteria: {
      type: 'lessons_completed',
      threshold: 100,
    },
    rarity: 'epic',
    xpReward: 1000,
    isActive: true,
  },
  {
    name: '📚 Knowledge Titan',
    description: '২০০টি lesson! আপনি knowledge এর ভাণ্ডার!',
    icon: '📚',
    criteria: {
      type: 'lessons_completed',
      threshold: 200,
    },
    rarity: 'legendary',
    xpReward: 2500,
    isActive: true,
  },

  // ============ QUIZ PERFECT BADGES ============
  {
    name: '🎯 First Perfect',
    description: 'প্রথম quiz এ ১০০% score করুন! Excellent work!',
    icon: '🎯',
    criteria: {
      type: 'quiz_perfect',
      threshold: 1,
    },
    rarity: 'common',
    xpReward: 50,
    isActive: true,
  },
  {
    name: '🎯 Quiz Ace',
    description: '৫টি quiz এ perfect score! আপনি brilliant!',
    icon: '🎯',
    criteria: {
      type: 'quiz_perfect',
      threshold: 5,
    },
    rarity: 'rare',
    xpReward: 200,
    isActive: true,
  },
  {
    name: '🎯 Perfect Scorer',
    description: '১০টি quiz এ ১০০%! Amazing consistency!',
    icon: '🎯',
    criteria: {
      type: 'quiz_perfect',
      threshold: 10,
    },
    rarity: 'rare',
    xpReward: 400,
    isActive: true,
  },
  {
    name: '🎯 Quiz Legend',
    description: '২৫টি perfect quiz! আপনি quiz master!',
    icon: '🎯',
    criteria: {
      type: 'quiz_perfect',
      threshold: 25,
    },
    rarity: 'epic',
    xpReward: 1000,
    isActive: true,
  },
  {
    name: '🎯 Ultimate Quiz God',
    description: '৫০টি perfect quiz! Unbelievable mastery!',
    icon: '🎯',
    criteria: {
      type: 'quiz_perfect',
      threshold: 50,
    },
    rarity: 'legendary',
    xpReward: 2500,
    isActive: true,
  },

  // ============ XP MILESTONE BADGES ============
  {
    name: '⭐ Rising Star',
    description: '১০০ XP অর্জন করুন! আপনার যাত্রা শুরু হয়েছে!',
    icon: '⭐',
    criteria: {
      type: 'xp_milestone',
      threshold: 100,
    },
    rarity: 'common',
    xpReward: 50,
    isActive: true,
  },
  {
    name: '⭐ Bright Mind',
    description: '৫০০ XP earned! Keep up the great work!',
    icon: '⭐',
    criteria: {
      type: 'xp_milestone',
      threshold: 500,
    },
    rarity: 'common',
    xpReward: 100,
    isActive: true,
  },
  {
    name: '⭐ Knowledge Hunter',
    description: '১০০০ XP milestone! আপনি dedicated!',
    icon: '⭐',
    criteria: {
      type: 'xp_milestone',
      threshold: 1000,
    },
    rarity: 'rare',
    xpReward: 200,
    isActive: true,
  },
  {
    name: '⭐ XP Collector',
    description: '২৫০০ XP! Outstanding progress!',
    icon: '⭐',
    criteria: {
      type: 'xp_milestone',
      threshold: 2500,
    },
    rarity: 'rare',
    xpReward: 500,
    isActive: true,
  },
  {
    name: '⭐ Power Learner',
    description: '৫০০০ XP achieved! You are unstoppable!',
    icon: '⭐',
    criteria: {
      type: 'xp_milestone',
      threshold: 5000,
    },
    rarity: 'epic',
    xpReward: 1000,
    isActive: true,
  },
  {
    name: '⭐ XP Titan',
    description: '১০,০০০ XP! আপনি true champion!',
    icon: '⭐',
    criteria: {
      type: 'xp_milestone',
      threshold: 10000,
    },
    rarity: 'epic',
    xpReward: 2000,
    isActive: true,
  },
  {
    name: '⭐ XP Legend',
    description: '২৫,০০০ XP! Legendary achievement!',
    icon: '⭐',
    criteria: {
      type: 'xp_milestone',
      threshold: 25000,
    },
    rarity: 'legendary',
    xpReward: 5000,
    isActive: true,
  },

  // ============ FLASHCARD MASTERED BADGES ============
  {
    name: '💡 Memory Starter',
    description: '১০টি flashcard master করুন! Good start!',
    icon: '💡',
    criteria: {
      type: 'flashcard_mastered',
      threshold: 10,
    },
    rarity: 'common',
    xpReward: 50,
    isActive: true,
  },
  {
    name: '💡 Memory Builder',
    description: '২৫টি flashcard mastered! আপনার memory শক্তিশালী!',
    icon: '💡',
    criteria: {
      type: 'flashcard_mastered',
      threshold: 25,
    },
    rarity: 'rare',
    xpReward: 150,
    isActive: true,
  },
  {
    name: '💡 Recall Master',
    description: '৫০টি flashcard complete! Excellent retention!',
    icon: '💡',
    criteria: {
      type: 'flashcard_mastered',
      threshold: 50,
    },
    rarity: 'rare',
    xpReward: 300,
    isActive: true,
  },
  {
    name: '💡 Memory Champion',
    description: '১০০টি flashcard mastered! Amazing memory!',
    icon: '💡',
    criteria: {
      type: 'flashcard_mastered',
      threshold: 100,
    },
    rarity: 'epic',
    xpReward: 750,
    isActive: true,
  },
  {
    name: '💡 Memory God',
    description: '২৫০টি flashcard! Phenomenal retention power!',
    icon: '💡',
    criteria: {
      type: 'flashcard_mastered',
      threshold: 250,
    },
    rarity: 'legendary',
    xpReward: 2000,
    isActive: true,
  },

  // ============ TOPIC MASTERED BADGES ============
  {
    name: '🎓 HTML Basics Master',
    description: 'HTML এর basics পুরোপুরি শিখে ফেলেছেন! Great job!',
    icon: '🎓',
    criteria: {
      type: 'topic_mastered',
      threshold: 1,
      topic: 'HTML',
    },
    rarity: 'common',
    xpReward: 100,
    isActive: true,
  },
  {
    name: '🎓 CSS Styling Expert',
    description: 'CSS mastery achieved! আপনি design করতে পারবেন!',
    icon: '🎓',
    criteria: {
      type: 'topic_mastered',
      threshold: 1,
      topic: 'CSS',
    },
    rarity: 'common',
    xpReward: 100,
    isActive: true,
  },
  {
    name: '🎓 JavaScript Ninja',
    description: 'JavaScript master! আপনি interactive web apps বানাতে পারবেন!',
    icon: '🎓',
    criteria: {
      type: 'topic_mastered',
      threshold: 1,
      topic: 'JavaScript',
    },
    rarity: 'rare',
    xpReward: 200,
    isActive: true,
  },
  {
    name: '🎓 React Developer',
    description: 'React framework master করেছেন! Modern web development ready!',
    icon: '🎓',
    criteria: {
      type: 'topic_mastered',
      threshold: 1,
      topic: 'React',
    },
    rarity: 'epic',
    xpReward: 500,
    isActive: true,
  },
  {
    name: '🎓 Node.js Backend Pro',
    description: 'Node.js mastered! Server-side development champion!',
    icon: '🎓',
    criteria: {
      type: 'topic_mastered',
      threshold: 1,
      topic: 'Node.js',
    },
    rarity: 'epic',
    xpReward: 500,
    isActive: true,
  },
  {
    name: '🎓 Python Programmer',
    description: 'Python programming master! Versatile developer!',
    icon: '🎓',
    criteria: {
      type: 'topic_mastered',
      threshold: 1,
      topic: 'Python',
    },
    rarity: 'rare',
    xpReward: 300,
    isActive: true,
  },
  {
    name: '🎓 Database Architect',
    description: 'Database design mastered! Data management expert!',
    icon: '🎓',
    criteria: {
      type: 'topic_mastered',
      threshold: 1,
      topic: 'Database',
    },
    rarity: 'epic',
    xpReward: 400,
    isActive: true,
  },
  {
    name: '🎓 Git Version Control',
    description: 'Git ও GitHub master! Team collaboration ready!',
    icon: '🎓',
    criteria: {
      type: 'topic_mastered',
      threshold: 1,
      topic: 'Git',
    },
    rarity: 'common',
    xpReward: 150,
    isActive: true,
  },
  {
    name: '🎓 Algorithm Master',
    description: 'Data Structures & Algorithms mastered! Problem solving champion!',
    icon: '🎓',
    criteria: {
      type: 'topic_mastered',
      threshold: 1,
      topic: 'DSA',
    },
    rarity: 'legendary',
    xpReward: 1000,
    isActive: true,
  },

  // ============ SPECIAL ACHIEVEMENT BADGES ============
  {
    name: '🏆 Early Adopter',
    description: 'Platform এর প্রথম দিকের user! Thank you for joining!',
    icon: '🏆',
    criteria: {
      type: 'xp_milestone',
      threshold: 1,
    },
    rarity: 'rare',
    xpReward: 500,
    isActive: true,
  },
  {
    name: '🚀 Fast Learner',
    description: '১ সপ্তাহে ২৫টি lesson complete! You are fast!',
    icon: '🚀',
    criteria: {
      type: 'lessons_completed',
      threshold: 25,
    },
    rarity: 'epic',
    xpReward: 750,
    isActive: true,
  },
  {
    name: '💪 Dedication Award',
    description: 'প্রতিদিন কমপক্ষে ১ ঘণ্টা শেখার commitment!',
    icon: '💪',
    criteria: {
      type: 'streak',
      threshold: 30,
    },
    rarity: 'epic',
    xpReward: 1000,
    isActive: true,
  },
  {
    name: '🎖️ Perfect Scorer',
    description: 'সব quiz এ ৯০% এর উপরে score! Excellence!',
    icon: '🎖️',
    criteria: {
      type: 'quiz_perfect',
      threshold: 20,
    },
    rarity: 'legendary',
    xpReward: 2000,
    isActive: true,
  },
  {
    name: '🌟 Community Helper',
    description: 'অন্যদের সাহায্য করেছেন forum এ! Thank you!',
    icon: '🌟',
    criteria: {
      type: 'xp_milestone',
      threshold: 500,
    },
    rarity: 'rare',
    xpReward: 300,
    isActive: true,
  },
  {
    name: '👑 Ultimate Champion',
    description: 'সব categories এ excellence! You are the best!',
    icon: '👑',
    criteria: {
      type: 'xp_milestone',
      threshold: 50000,
    },
    rarity: 'legendary',
    xpReward: 10000,
    isActive: true,
  },
];

const seedBadges = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/microlearning-db');
    console.log('📦 Connected to MongoDB\n');

    console.log('🏅 Starting to create badges...\n');
    console.log('='.repeat(70));

    // Delete existing badges
    const existingBadges = await Badge.find();
    if (existingBadges.length > 0) {
      await Badge.deleteMany({});
      console.log(`🗑️  Deleted ${existingBadges.length} existing badges\n`);
    }

    const createdBadges = [];

    // Create badges
    for (let i = 0; i < badges.length; i++) {
      const badgeData = badges[i];
      
      const badge = await Badge.create(badgeData);
      createdBadges.push(badge);
      
      const rarityColor = {
        common: '⚪',
        rare: '🔵',
        epic: '🟣',
        legendary: '🟡',
      }[badge.rarity];

      console.log(`${rarityColor} ${badge.name}`);
      console.log(`   📝 ${badge.description}`);
      console.log(`   🎯 Type: ${badge.criteria.type} | Threshold: ${badge.criteria.threshold}`);
      if (badge.criteria.topic) {
        console.log(`   📚 Topic: ${badge.criteria.topic}`);
      }
      console.log(`   ⭐ XP Reward: ${badge.xpReward}`);
      console.log('');
    }

    // Summary by rarity
    console.log('\n' + '='.repeat(70));
    console.log('✨ Badge Creation Summary');
    console.log('='.repeat(70));
    console.log(`🏅 Total Badges: ${createdBadges.length}`);
    console.log(`\n📊 By Rarity:`);
    console.log(`   ⚪ Common: ${createdBadges.filter(b => b.rarity === 'common').length}`);
    console.log(`   🔵 Rare: ${createdBadges.filter(b => b.rarity === 'rare').length}`);
    console.log(`   🟣 Epic: ${createdBadges.filter(b => b.rarity === 'epic').length}`);
    console.log(`   🟡 Legendary: ${createdBadges.filter(b => b.rarity === 'legendary').length}`);

    console.log(`\n🎯 By Category:`);
    console.log(`   🔥 Streak: ${createdBadges.filter(b => b.criteria.type === 'streak').length}`);
    console.log(`   📚 Lessons: ${createdBadges.filter(b => b.criteria.type === 'lessons_completed').length}`);
    console.log(`   🎯 Quiz: ${createdBadges.filter(b => b.criteria.type === 'quiz_perfect').length}`);
    console.log(`   ⭐ XP: ${createdBadges.filter(b => b.criteria.type === 'xp_milestone').length}`);
    console.log(`   💡 Flashcard: ${createdBadges.filter(b => b.criteria.type === 'flashcard_mastered').length}`);
    console.log(`   🎓 Topic: ${createdBadges.filter(b => b.criteria.type === 'topic_mastered').length}`);

    const totalXpReward = createdBadges.reduce((sum, b) => sum + b.xpReward, 0);
    console.log(`\n💰 Total XP Rewards Available: ${totalXpReward.toLocaleString()}`);

    console.log('\n✅ All badges created successfully!');
    console.log('🎉 Achievement system is ready!\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedBadges();
