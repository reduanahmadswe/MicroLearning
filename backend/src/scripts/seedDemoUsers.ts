import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from '../app/modules/auth/auth.model';

dotenv.config();

const DEMO_USERS_COUNT = 50;
const DEFAULT_PASSWORD = '12345678';

// Real and diverse Bangladeshi users with detailed profiles
const realUsers = [
  {
    name: 'আরিফুল ইসলাম',
    nameEn: 'Ariful Islam',
    bio: 'সফটওয়্যার ইঞ্জিনিয়ার | প্রোগ্রামিং শিখতে ভালোবাসি | Web Development এ আগ্রহী',
    phone: '+8801712345678',
    interests: ['Web Development', 'JavaScript', 'React', 'Node.js'],
    goals: ['Full Stack Developer হতে চাই', 'MERN Stack শিখব'],
    city: 'Dhaka',
    profession: 'Software Engineer'
  },
  {
    name: 'তাসনিম আক্তার',
    nameEn: 'Tasnim Akter',
    bio: 'UI/UX Designer | সুন্দর ডিজাইন তৈরি করতে ভালোবাসি | Figma Expert',
    phone: '+8801823456789',
    interests: ['UI/UX Design', 'Figma', 'Adobe XD', 'Graphic Design'],
    goals: ['Professional Designer', 'Freelancing শুরু করব'],
    city: 'Chittagong',
    profession: 'UI/UX Designer'
  },
  {
    name: 'রাকিবুল হাসান',
    nameEn: 'Rakibul Hasan',
    bio: 'Data Science enthusiast | Python Lover | ML/AI শিখছি',
    phone: '+8801934567890',
    interests: ['Data Science', 'Python', 'Machine Learning', 'AI'],
    goals: ['Data Scientist', 'AI Expert হতে চাই'],
    city: 'Sylhet',
    profession: 'Data Analyst'
  },
  {
    name: 'সাদিয়া ইসলাম',
    nameEn: 'Sadia Islam',
    bio: 'Digital Marketer | Content Creator | SEO Specialist',
    phone: '+8801645678901',
    interests: ['Digital Marketing', 'SEO', 'Content Writing', 'Social Media'],
    goals: ['Marketing Expert', 'নিজের Agency খুলব'],
    city: 'Rajshahi',
    profession: 'Digital Marketer'
  },
  {
    name: 'মেহেদী হাসান',
    nameEn: 'Mehedi Hasan',
    bio: 'Mobile App Developer | Flutter & React Native | Gaming Apps তৈরি করি',
    phone: '+8801756789012',
    interests: ['Mobile Development', 'Flutter', 'React Native', 'Gaming'],
    goals: ['Top App Developer', 'নিজের App Startup'],
    city: 'Khulna',
    profession: 'Mobile Developer'
  },
  {
    name: 'নুসরাত জাহান',
    nameEn: 'Nusrat Jahan',
    bio: 'Graphic Designer | ব্র্যান্ডিং Expert | লোগো ডিজাইনে পারদর্শী',
    phone: '+8801867890123',
    interests: ['Graphic Design', 'Branding', 'Logo Design', 'Illustrator'],
    goals: ['Creative Director', 'International Client'],
    city: 'Barisal',
    profession: 'Graphic Designer'
  },
  {
    name: 'ফাহিম আহমেদ',
    nameEn: 'Fahim Ahmed',
    bio: 'Blockchain Developer | Cryptocurrency enthusiast | Smart Contract Developer',
    phone: '+8801978901234',
    interests: ['Blockchain', 'Cryptocurrency', 'Solidity', 'Web3'],
    goals: ['Blockchain Expert', 'DeFi Platform তৈরি'],
    city: 'Dhaka',
    profession: 'Blockchain Developer'
  },
  {
    name: 'আয়েশা সিদ্দিকা',
    nameEn: 'Ayesha Siddika',
    bio: 'Content Writer | Blogger | SEO Content Specialist | বাংলা ও ইংরেজিতে লিখি',
    phone: '+8801689012345',
    interests: ['Content Writing', 'Blogging', 'SEO', 'Creative Writing'],
    goals: ['Professional Writer', 'নিজের Blog'],
    city: 'Cumilla',
    profession: 'Content Writer'
  },
  {
    name: 'তানভীর রহমান',
    nameEn: 'Tanvir Rahman',
    bio: 'DevOps Engineer | Cloud Computing | AWS & Azure Expert',
    phone: '+8801790123456',
    interests: ['DevOps', 'Cloud Computing', 'AWS', 'Docker', 'Kubernetes'],
    goals: ['Senior DevOps Engineer', 'Cloud Architect'],
    city: 'Dhaka',
    profession: 'DevOps Engineer'
  },
  {
    name: 'জান্নাতুল ফেরদৌস',
    nameEn: 'Jannatul Ferdous',
    bio: 'Video Editor | Motion Graphics | YouTube Content Creator',
    phone: '+8801601234567',
    interests: ['Video Editing', 'Motion Graphics', 'Adobe Premiere', 'After Effects'],
    goals: ['Professional Video Editor', 'নিজের Production House'],
    city: 'Chittagong',
    profession: 'Video Editor'
  },
  {
    name: 'শাহরিয়ার কবীর',
    nameEn: 'Shahriar Kabir',
    bio: 'Cyber Security Analyst | Ethical Hacker | Network Security Expert',
    phone: '+8801512345678',
    interests: ['Cyber Security', 'Ethical Hacking', 'Network Security', 'Penetration Testing'],
    goals: ['Security Expert', 'CEH Certification'],
    city: 'Dhaka',
    profession: 'Security Analyst'
  },
  {
    name: 'রুমানা আক্তার',
    nameEn: 'Rumana Akter',
    bio: 'Business Analyst | Project Manager | Agile Methodology Expert',
    phone: '+8801423456789',
    interests: ['Business Analysis', 'Project Management', 'Agile', 'Scrum'],
    goals: ['Senior PM', 'PMP Certification'],
    city: 'Sylhet',
    profession: 'Business Analyst'
  },
  {
    name: 'নাফিস সাদিক',
    nameEn: 'Nafis Sadik',
    bio: 'Game Developer | Unity3D | Unreal Engine | Mobile Gaming',
    phone: '+8801334567890',
    interests: ['Game Development', 'Unity', 'Unreal Engine', 'C#', '3D Modeling'],
    goals: ['Game Studio', 'International Game Release'],
    city: 'Dhaka',
    profession: 'Game Developer'
  },
  {
    name: 'সুমাইয়া খানম',
    nameEn: 'Sumaiya Khanam',
    bio: 'HR Professional | Talent Acquisition | Employee Engagement Specialist',
    phone: '+8801245678901',
    interests: ['Human Resources', 'Recruitment', 'Training', 'Employee Development'],
    goals: ['HR Director', 'Organizational Development'],
    city: 'Rajshahi',
    profession: 'HR Manager'
  },
  {
    name: 'ইমরান হোসেন',
    nameEn: 'Imran Hossain',
    bio: 'Financial Analyst | Stock Market Investor | Cryptocurrency Trader',
    phone: '+8801156789012',
    interests: ['Finance', 'Stock Market', 'Crypto Trading', 'Investment'],
    goals: ['Investment Banker', 'CFA Certification'],
    city: 'Dhaka',
    profession: 'Financial Analyst'
  },
  {
    name: 'তামান্না সুলতানা',
    nameEn: 'Tamanna Sultana',
    bio: 'Fashion Designer | Textile Design | Traditional & Modern Wear',
    phone: '+8801967890123',
    interests: ['Fashion Design', 'Textile', 'Traditional Clothing', 'Modern Fashion'],
    goals: ['Fashion Brand', 'International Fashion Week'],
    city: 'Chittagong',
    profession: 'Fashion Designer'
  },
  {
    name: 'রাফি আহমেদ',
    nameEn: 'Rafi Ahmed',
    bio: 'E-commerce Entrepreneur | Dropshipping Expert | Online Business',
    phone: '+8801878901234',
    interests: ['E-commerce', 'Dropshipping', 'Online Marketing', 'Business'],
    goals: ['Successful E-commerce', 'Million Dollar Revenue'],
    city: 'Dhaka',
    profession: 'Entrepreneur'
  },
  {
    name: 'নিশাত তাসনিম',
    nameEn: 'Nishat Tasnim',
    bio: 'Photographer | Portrait & Wedding Photography | Visual Storyteller',
    phone: '+8801789012345',
    interests: ['Photography', 'Portrait', 'Wedding', 'Photo Editing', 'Lightroom'],
    goals: ['Professional Photographer', 'International Exhibition'],
    city: 'Sylhet',
    profession: 'Photographer'
  },
  {
    name: 'সাকিব হাসান',
    nameEn: 'Sakib Hasan',
    bio: 'IoT Developer | Embedded Systems | Arduino & Raspberry Pi Expert',
    phone: '+8801690123456',
    interests: ['IoT', 'Embedded Systems', 'Arduino', 'Raspberry Pi', 'Hardware'],
    goals: ['IoT Solutions', 'Smart Home Products'],
    city: 'Khulna',
    profession: 'IoT Developer'
  },
  {
    name: 'মারিয়া সুলতানা',
    nameEn: 'Maria Sultana',
    bio: 'Nutritionist | Health Coach | Fitness Enthusiast | Healthy Lifestyle',
    phone: '+8801501234567',
    interests: ['Nutrition', 'Health', 'Fitness', 'Wellness', 'Diet Planning'],
    goals: ['Health Consultant', 'নিজের Wellness Center'],
    city: 'Dhaka',
    profession: 'Nutritionist'
  },
  {
    name: 'রিয়াদ হোসেন',
    nameEn: 'Riad Hossain',
    bio: 'Architect | Urban Planner | Sustainable Design Advocate',
    phone: '+8801412345678',
    interests: ['Architecture', 'Urban Planning', 'Sustainable Design', '3D Modeling'],
    goals: ['Lead Architect', 'Green Building Projects'],
    city: 'Chittagong',
    profession: 'Architect'
  },
  {
    name: 'শামসুন্নাহার',
    nameEn: 'Shamsunnahar',
    bio: 'Teacher | Educational Content Creator | Online Course Developer',
    phone: '+8801323456789',
    interests: ['Teaching', 'Education', 'Course Development', 'E-learning'],
    goals: ['Educational Platform', 'Impact করতে চাই Education-এ'],
    city: 'Rajshahi',
    profession: 'Teacher'
  },
  {
    name: 'আসিফ ইকবাল',
    nameEn: 'Asif Iqbal',
    bio: 'Legal Advisor | Corporate Law | Startup Consultant',
    phone: '+8801234567890',
    interests: ['Law', 'Corporate Legal', 'Startup Consulting', 'Legal Tech'],
    goals: ['Senior Partner', 'Own Law Firm'],
    city: 'Dhaka',
    profession: 'Legal Advisor'
  },
  {
    name: 'তাহমিনা আক্তার',
    nameEn: 'Tahmina Akter',
    bio: 'Social Media Manager | Influencer Marketing | Brand Strategy',
    phone: '+8801145678901',
    interests: ['Social Media', 'Influencer Marketing', 'Brand Strategy', 'Content Creation'],
    goals: ['Social Media Director', 'Agency Owner'],
    city: 'Dhaka',
    profession: 'Social Media Manager'
  },
  {
    name: 'হাসান মাহমুদ',
    nameEn: 'Hasan Mahmud',
    bio: 'Civil Engineer | Construction Management | Infrastructure Projects',
    phone: '+8801956789012',
    interests: ['Civil Engineering', 'Construction', 'Project Management', 'AutoCAD'],
    goals: ['Project Director', 'Large Infrastructure Projects'],
    city: 'Chittagong',
    profession: 'Civil Engineer'
  },
  {
    name: 'সাবরিনা সুলতানা',
    nameEn: 'Sabrina Sultana',
    bio: 'Pharmacist | Medical Research | Healthcare Professional',
    phone: '+8801867890123',
    interests: ['Pharmacy', 'Medical Research', 'Healthcare', 'Drug Development'],
    goals: ['Clinical Pharmacist', 'Research Publication'],
    city: 'Dhaka',
    profession: 'Pharmacist'
  },
  {
    name: 'জাহিদ হাসান',
    nameEn: 'Zahid Hasan',
    bio: 'Electrical Engineer | Power Systems | Renewable Energy',
    phone: '+8801778901234',
    interests: ['Electrical Engineering', 'Power Systems', 'Solar Energy', 'Renewable'],
    goals: ['Energy Expert', 'Sustainable Energy Solutions'],
    city: 'Khulna',
    profession: 'Electrical Engineer'
  },
  {
    name: 'ফারহানা ইয়াসমিন',
    nameEn: 'Farhana Yasmin',
    bio: 'Psychologist | Mental Health Counselor | Wellness Coach',
    phone: '+8801689012345',
    interests: ['Psychology', 'Mental Health', 'Counseling', 'Wellness'],
    goals: ['Clinical Psychologist', 'Mental Health Center'],
    city: 'Dhaka',
    profession: 'Psychologist'
  },
  {
    name: 'নাইম ইসলাম',
    nameEn: 'Naim Islam',
    bio: 'Journalist | News Reporter | Documentary Filmmaker',
    phone: '+8801590123456',
    interests: ['Journalism', 'News Reporting', 'Documentary', 'Storytelling'],
    goals: ['Investigative Journalist', 'Award Winning Reporter'],
    city: 'Dhaka',
    profession: 'Journalist'
  },
  {
    name: 'সানজিদা খাতুন',
    nameEn: 'Sanjida Khatun',
    bio: 'Accountant | Tax Consultant | Financial Planning Expert',
    phone: '+8801401234567',
    interests: ['Accounting', 'Taxation', 'Financial Planning', 'Auditing'],
    goals: ['CA Certification', 'Own Accounting Firm'],
    city: 'Chittagong',
    profession: 'Accountant'
  },
  {
    name: 'মুনতাসির মামুন',
    nameEn: 'Muntasir Mamun',
    bio: 'Robotics Engineer | Automation | AI Robotics',
    phone: '+8801312345678',
    interests: ['Robotics', 'Automation', 'AI', 'Machine Learning', 'Electronics'],
    goals: ['Robotics Expert', 'Industrial Automation'],
    city: 'Dhaka',
    profession: 'Robotics Engineer'
  },
  {
    name: 'সুমাইয়া আফরিন',
    nameEn: 'Sumaiya Afrin',
    bio: 'Interior Designer | Space Planning | Residential & Commercial Design',
    phone: '+8801223456789',
    interests: ['Interior Design', 'Space Planning', 'Furniture Design', '3D Visualization'],
    goals: ['Lead Designer', 'Design Studio'],
    city: 'Dhaka',
    profession: 'Interior Designer'
  },
  {
    name: 'তৌহিদ রহমান',
    nameEn: 'Towhid Rahman',
    bio: 'Network Engineer | IT Infrastructure | System Administrator',
    phone: '+8801134567890',
    interests: ['Networking', 'IT Infrastructure', 'System Administration', 'Server Management'],
    goals: ['Network Architect', 'CCIE Certification'],
    city: 'Sylhet',
    profession: 'Network Engineer'
  },
  {
    name: 'নাজমুল হুদা',
    nameEn: 'Nazmul Huda',
    bio: 'Agricultural Scientist | Sustainable Farming | AgriTech',
    phone: '+8801945678901',
    interests: ['Agriculture', 'Sustainable Farming', 'AgriTech', 'Research'],
    goals: ['Agricultural Innovation', 'Food Security'],
    city: 'Rajshahi',
    profession: 'Agricultural Scientist'
  },
  {
    name: 'তানজিলা আক্তার',
    nameEn: 'Tanjila Akter',
    bio: 'Voice Artist | Dubbing Artist | Voice Over Professional',
    phone: '+8801856789012',
    interests: ['Voice Acting', 'Dubbing', 'Voice Over', 'Audio Production'],
    goals: ['Top Voice Artist', 'International Projects'],
    city: 'Dhaka',
    profession: 'Voice Artist'
  },
  {
    name: 'রাশেদ আল মামুন',
    nameEn: 'Rashed Al Mamun',
    bio: 'Real Estate Developer | Property Investment | Urban Development',
    phone: '+8801767890123',
    interests: ['Real Estate', 'Property', 'Investment', 'Urban Development'],
    goals: ['Real Estate Tycoon', 'Large Projects'],
    city: 'Dhaka',
    profession: 'Real Estate Developer'
  },
  {
    name: 'আফিয়া জান্নাত',
    nameEn: 'Afia Jannat',
    bio: 'Makeup Artist | Beauty Blogger | Bridal Makeup Specialist',
    phone: '+8801678901234',
    interests: ['Makeup', 'Beauty', 'Bridal Makeup', 'Beauty Blogging'],
    goals: ['Celebrity Makeup Artist', 'নিজের Salon'],
    city: 'Chittagong',
    profession: 'Makeup Artist'
  },
  {
    name: 'সাইফুল ইসলাম',
    nameEn: 'Saiful Islam',
    bio: 'Environmental Scientist | Climate Change Researcher | Sustainability',
    phone: '+8801589012345',
    interests: ['Environment', 'Climate Change', 'Sustainability', 'Research'],
    goals: ['Environmental Policy', 'Climate Action'],
    city: 'Sylhet',
    profession: 'Environmental Scientist'
  },
  {
    name: 'নাদিয়া নাওয়ার',
    nameEn: 'Nadia Nawar',
    bio: 'Event Planner | Wedding Planner | Corporate Events',
    phone: '+8801490123456',
    interests: ['Event Planning', 'Wedding Planning', 'Corporate Events', 'Management'],
    goals: ['Top Event Planner', 'Event Management Company'],
    city: 'Dhaka',
    profession: 'Event Planner'
  },
  {
    name: 'মাহমুদুল হাসান',
    nameEn: 'Mahmudul Hasan',
    bio: 'Mechanical Engineer | Manufacturing | Product Design',
    phone: '+8801301234567',
    interests: ['Mechanical Engineering', 'Manufacturing', 'Product Design', 'CAD'],
    goals: ['Design Engineer', 'Innovation in Manufacturing'],
    city: 'Chittagong',
    profession: 'Mechanical Engineer'
  },
  {
    name: 'সাবিহা খান',
    nameEn: 'Sabiha Khan',
    bio: 'Travel Blogger | Tour Guide | Adventure Enthusiast',
    phone: '+8801212345678',
    interests: ['Travel', 'Tourism', 'Photography', 'Adventure', 'Blogging'],
    goals: ['Travel Influencer', 'Travel Agency'],
    city: 'Dhaka',
    profession: 'Travel Blogger'
  },
  {
    name: 'শফিকুল ইসলাম',
    nameEn: 'Shafiqul Islam',
    bio: 'Database Administrator | SQL Expert | Data Management',
    phone: '+8801123456789',
    interests: ['Database', 'SQL', 'Data Management', 'PostgreSQL', 'MongoDB'],
    goals: ['Senior DBA', 'Database Architect'],
    city: 'Dhaka',
    profession: 'Database Administrator'
  },
  {
    name: 'মুশফিকা জাহান',
    nameEn: 'Mushfiqa Jahan',
    bio: 'Yoga Instructor | Fitness Trainer | Wellness Expert',
    phone: '+8801934567890',
    interests: ['Yoga', 'Fitness', 'Wellness', 'Meditation', 'Health'],
    goals: ['Certified Yoga Master', 'Wellness Center'],
    city: 'Chittagong',
    profession: 'Yoga Instructor'
  },
  {
    name: 'রাকিব আহমেদ',
    nameEn: 'Rakib Ahmed',
    bio: 'Music Producer | Sound Engineer | Composer',
    phone: '+8801845678901',
    interests: ['Music Production', 'Sound Engineering', 'Composing', 'Audio Mixing'],
    goals: ['Top Music Producer', 'Recording Studio'],
    city: 'Dhaka',
    profession: 'Music Producer'
  },
  {
    name: 'তাসফিয়া নূর',
    nameEn: 'Tasfia Noor',
    bio: 'Biotechnology Researcher | Genetic Engineering | Lab Scientist',
    phone: '+8801756789012',
    interests: ['Biotechnology', 'Genetic Engineering', 'Research', 'Lab Work'],
    goals: ['Research Scientist', 'Biotech Innovation'],
    city: 'Dhaka',
    profession: 'Biotechnology Researcher'
  },
  {
    name: 'নাফিজ আরাফাত',
    nameEn: 'Nafiz Arafat',
    bio: 'Stand-up Comedian | Content Creator | Entertainment Professional',
    phone: '+8801667890123',
    interests: ['Comedy', 'Stand-up', 'Content Creation', 'Entertainment'],
    goals: ['Famous Comedian', 'Comedy Shows'],
    city: 'Dhaka',
    profession: 'Comedian'
  },
  {
    name: 'লামিয়া সুলতানা',
    nameEn: 'Lamia Sultana',
    bio: 'Veterinarian | Animal Care | Pet Healthcare Professional',
    phone: '+8801578901234',
    interests: ['Veterinary', 'Animal Care', 'Pet Healthcare', 'Animal Welfare'],
    goals: ['Veterinary Specialist', 'Animal Hospital'],
    city: 'Chittagong',
    profession: 'Veterinarian'
  },
  {
    name: 'শাহরিয়ার হোসেন',
    nameEn: 'Shahriar Hossain',
    bio: 'Logistics Manager | Supply Chain | Operations Management',
    phone: '+8801489012345',
    interests: ['Logistics', 'Supply Chain', 'Operations', 'Warehouse Management'],
    goals: ['Supply Chain Director', 'Logistics Innovation'],
    city: 'Dhaka',
    profession: 'Logistics Manager'
  },
  {
    name: 'আফসানা মিমী',
    nameEn: 'Afsana Mimi',
    bio: 'Children Book Author | Illustrator | Storyteller',
    phone: '+8801390123456',
    interests: ['Writing', 'Illustration', 'Children Stories', 'Creative Arts'],
    goals: ['Published Author', 'Award Winning Books'],
    city: 'Dhaka',
    profession: 'Author'
  },
  {
    name: 'তামিম ইকবাল',
    nameEn: 'Tamim Iqbal',
    bio: 'Sports Coach | Fitness Trainer | Cricket Academy',
    phone: '+8801201234567',
    interests: ['Sports', 'Cricket', 'Fitness', 'Coaching', 'Training'],
    goals: ['Professional Coach', 'Sports Academy'],
    city: 'Chittagong',
    profession: 'Sports Coach'
  }
];

const getRandomElement = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const difficulties = ['beginner', 'intermediate', 'advanced'];
const learningStyles = ['visual', 'auditory', 'kinesthetic'];
const languages = ['bn', 'en'];

const generateDemoUsers = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/microlearning-db');
    console.log('📊 Connected to database');

    // Hash password once (same for all users)
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    console.log('🔒 Password hashed');

    // Check how many demo users already exist
    const existingCount = await User.countDocuments({
      email: { $regex: /^user\d+@microlearning\.com$/ }
    });
    console.log(`📝 Found ${existingCount} existing demo users`);

    const usersToCreate: any[] = [];

    // === CREATE ADMIN ===
    const adminEmail = 'admin@microlearning.com';
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      usersToCreate.push({
        name: 'Admin User',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        isVerified: true,
        isActive: true,
        profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin&backgroundColor=ff6b6b',
        bio: 'System Administrator | Managing MicroLearning Platform',
        phone: '+8801700000001',
        xp: 50000,
        coins: 100000,
        level: 50,
        streak: {
          current: 365,
          longest: 365,
          lastActivityDate: new Date()
        },
        badges: [],
        preferences: {
          interests: ['Platform Management', 'Administration', 'User Support'],
          goals: ['Maintain Platform Excellence', 'User Growth'],
          dailyLearningTime: 60,
          preferredDifficulty: 'advanced',
          language: 'en',
          learningStyle: 'visual'
        },
        isPremium: true,
        premiumExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      });
      console.log('✅ Admin user added to creation queue');
    } else {
      console.log('⏭️  Admin already exists');
    }

    // === CREATE INSTRUCTORS ===
    const instructors = [
      {
        name: 'Dr. Kamal Hassan',
        nameEn: 'Dr. Kamal Hassan',
        email: 'instructor1@microlearning.com',
        bio: 'Senior Software Engineer & Instructor | 10+ years experience | MERN Stack Expert | Teaching is my passion',
        phone: '+8801700000002',
        interests: ['Web Development', 'JavaScript', 'React', 'Node.js', 'Teaching'],
        goals: ['Empower 10,000+ Students', 'Create World-Class Courses'],
        profession: 'Senior Instructor'
      },
      {
        name: 'Fahima Rahman',
        nameEn: 'Fahima Rahman',
        email: 'instructor2@microlearning.com',
        bio: 'Data Science Instructor | PhD in AI/ML | Published Researcher | Making AI accessible to everyone',
        phone: '+8801700000003',
        interests: ['Data Science', 'Machine Learning', 'Python', 'AI', 'Research'],
        goals: ['Democratize AI Education', 'Build Next-Gen Data Scientists'],
        profession: 'Lead Data Science Instructor'
      }
    ];

    for (const instructor of instructors) {
      const exists = await User.findOne({ email: instructor.email });
      if (!exists) {
        const xpValue = getRandomInt(20000, 40000);
        const levelValue = Math.floor(xpValue / 1000) + 1;
        
        usersToCreate.push({
          name: instructor.nameEn,
          email: instructor.email,
          password: hashedPassword,
          role: 'instructor',
          isVerified: true,
          isActive: true,
          profilePicture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${instructor.nameEn}&backgroundColor=ffd93d`,
          bio: instructor.bio,
          phone: instructor.phone,
          xp: xpValue,
          coins: getRandomInt(5000, 20000),
          level: levelValue > 40 ? 40 : levelValue,
          streak: {
            current: getRandomInt(100, 300),
            longest: getRandomInt(200, 400),
            lastActivityDate: new Date()
          },
          badges: [],
          preferences: {
            interests: instructor.interests,
            goals: instructor.goals,
            dailyLearningTime: getRandomInt(120, 300),
            preferredDifficulty: 'advanced',
            language: getRandomElement(languages),
            learningStyle: getRandomElement(learningStyles)
          },
          isPremium: true,
          premiumExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        });
        console.log(`✅ Instructor ${instructor.email} added to creation queue`);
      } else {
        console.log(`⏭️  Instructor ${instructor.email} already exists`);
      }
    }

    for (let i = 1; i <= DEMO_USERS_COUNT; i++) {
      const email = `user${i}@microlearning.com`;
      
      // Check if user already exists
      const exists = await User.findOne({ email });
      if (exists) {
        console.log(`⏭️  Skipping ${email} (already exists)`);
        continue;
      }

      const userData = realUsers[i - 1];
      const xpValue = getRandomInt(500, 15000);
      const levelValue = Math.floor(xpValue / 1000) + 1; // 1 XP = 1000 level roughly
      const streakDays = getRandomInt(0, 60);
      
      usersToCreate.push({
        name: userData.nameEn,
        email,
        password: hashedPassword,
        role: i <= 5 ? 'instructor' : 'learner', // First 5 as instructors
        isVerified: true,
        isActive: true,
        profilePicture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.nameEn}&backgroundColor=b6e3f4,c0aede,d1d4f9`,
        bio: userData.bio,
        phone: userData.phone,
        
        // Gamification
        xp: xpValue,
        coins: getRandomInt(100, 5000),
        level: levelValue > 20 ? 20 : levelValue,
        streak: {
          current: streakDays,
          longest: streakDays + getRandomInt(0, 30),
          lastActivityDate: new Date(Date.now() - getRandomInt(0, 2) * 24 * 60 * 60 * 1000)
        },
        badges: [],
        
        // Learning Preferences
        preferences: {
          interests: userData.interests,
          goals: userData.goals,
          dailyLearningTime: getRandomInt(15, 180), // 15 minutes to 3 hours
          preferredDifficulty: getRandomElement(difficulties),
          language: getRandomElement(languages),
          learningStyle: getRandomElement(learningStyles)
        },
        
        // Premium (30% chance)
        isPremium: Math.random() > 0.7,
        premiumExpiresAt: Math.random() > 0.7 ? new Date(Date.now() + getRandomInt(30, 365) * 24 * 60 * 60 * 1000) : undefined,
      });
    }

    if (usersToCreate.length > 0) {
      await User.insertMany(usersToCreate);
      console.log(`✅ Created ${usersToCreate.length} new users`);
      console.log('\n👥 Users Created:');
      usersToCreate.forEach(user => {
        console.log(`   📧 ${user.email} | ${user.name} | Role: ${user.role}`);
      });
    } else {
      console.log('ℹ️  All users already exist');
    }

    // Show summary
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalInstructors = await User.countDocuments({ role: 'instructor' });
    const totalLearners = await User.countDocuments({ role: 'learner' });
    const totalDemoUsers = await User.countDocuments({
      email: { $regex: /^user\d+@microlearning\.com$/ }
    });
    
    console.log(`\n📊 Database Summary:`);
    console.log(`   👑 Admins: ${totalAdmins}`);
    console.log(`   👨‍🏫 Instructors: ${totalInstructors}`);
    console.log(`   👨‍🎓 Learners: ${totalLearners}`);
    console.log(`   🎭 Demo Users: ${totalDemoUsers}`);
    console.log(`\n📧 Login Credentials:`);
    console.log(`   Admin: admin@microlearning.com`);
    console.log(`   Instructor 1: instructor1@microlearning.com`);
    console.log(`   Instructor 2: instructor2@microlearning.com`);
    console.log(`   Demo: user1@microlearning.com to user${DEMO_USERS_COUNT}@microlearning.com`);
    console.log(`   🔑 Password for all: ${DEFAULT_PASSWORD}`);
    console.log('\n✨ Users seeded successfully!');
    console.log('\n🖼️  Profile pictures: High-quality avatar images');
    console.log('📱 Complete profiles: Phone, Bio, Interests, Goals');
    console.log('🎮 Gamification: XP, Levels, Streaks, Coins');
    console.log('⚙️  Preferences: Learning style, Difficulty, Daily time');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding demo users:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

generateDemoUsers();
