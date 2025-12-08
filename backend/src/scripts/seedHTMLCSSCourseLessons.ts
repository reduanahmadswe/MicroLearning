import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Course } from '../app/modules/course/course.model';
import Lesson from '../app/modules/microLessons/lesson.model';
import { Quiz } from '../app/modules/quiz/quiz.model';

dotenv.config();

const courseId = '6936da50d8c40e708b2fc485';
const authorId = '6936d94f56aed05b85859e21';


// HTML & CSS Course Lessons
const lessonsData = [
  // Lesson 1: HTML Introduction
  {
    title: 'HTML কি এবং কেন শিখবেন?',
    description: 'HTML এর পরিচিতি, ইতিহাস এবং আধুনিক web development এ এর গুরুত্ব সম্পর্কে জানুন।',
    content: `# HTML কি এবং কেন শিখবেন?

## HTML কি?

HTML (HyperText Markup Language) হলো web pages তৈরির মূল ভিত্তি। এটি একটি markup language যা web pages এর structure এবং content define করে।

## HTML এর বৈশিষ্ট্য

- **Markup Language**: Programming language নয়, content এর structure define করে
- **Tags Based**: Opening এবং closing tags দিয়ে elements তৈরি হয়
- **Browser Interpreted**: সব browser HTML বুঝতে পারে
- **Easy to Learn**: নতুনদের জন্য খুবই সহজ
- **Foundation of Web**: সকল website এর base হলো HTML

## কেন HTML শিখবেন?

1. **Web Development এর Base**: সকল web development শুরু হয় HTML দিয়ে
2. **সহজ এবং Essential**: কোন web technology শিখতে হলে HTML জানা must
3. **চাকরির জন্য প্রয়োজনীয়**: প্রতিটি web developer job এ HTML জানা লাগে
4. **নিজের Website**: নিজের website বা blog তৈরি করতে পারবেন
5. **Other Technologies**: React, Angular শেখার আগে HTML জানতে হবে

## HTML এর ব্যবহার

- Website এবং Web Applications
- Email Templates
- Landing Pages
- Blog এবং Portfolio
- E-commerce Sites
- Documentation Pages

## HTML এর সংস্করণ

- HTML 1.0 (1991)
- HTML 2.0 (1995)
- HTML 4.01 (1999)
- **HTML5 (2014)** - বর্তমানে ব্যবহৃত সর্বশেষ version

## HTML5 এর নতুন Features

- Semantic Elements (\`<header>\`, \`<nav>\`, \`<article>\`)
- Video এবং Audio support
- Canvas for graphics
- Local Storage
- Geolocation
- Better form controls

## কিভাবে কাজ করে?

1. আপনি HTML code লিখেন
2. Browser সেই code read করে
3. Browser content render করে screen এ show করে

HTML হলো web এর backbone - এটা না শিখলে web development সম্ভব না!
`,
    topic: 'Web Development',
    tags: ['HTML', 'Introduction', 'Basics', 'Web Development'],
    difficulty: 'beginner',
    estimatedTime: 15,
    media: [
      {
        type: 'video',
        url: 'https://www.youtube.com/watch?v=pQN-pnXPaVg',
        title: 'HTML Introduction in Bangla',
        duration: 900,
      },
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1621839673705-6617adf9e890?w=800',
    keyPoints: [
      'HTML হলো HyperText Markup Language',
      'Web pages এর structure তৈরি করে',
      'HTML5 হলো latest version',
      'সব web development এর foundation',
    ],
    order: 1,
    isPublished: true,
    isPremium: false,
  },
  // Lesson 2: HTML Document Structure
  {
    title: 'HTML Document Structure এবং Basic Setup',
    description: 'HTML document এর structure, basic tags এবং প্রথম HTML page তৈরি করুন।',
    content: `# HTML Document Structure এবং Basic Setup

## Basic HTML Document Structure

প্রতিটি HTML document এর একটি standard structure আছে:

\`\`\`html
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>আমার প্রথম Website</title>
</head>
<body>
    <h1>স্বাগতম!</h1>
    <p>এটি আমার প্রথম HTML page।</p>
</body>
</html>
\`\`\`

## প্রতিটি অংশের ব্যাখ্যা

### 1. DOCTYPE Declaration
\`\`\`html
<!DOCTYPE html>
\`\`\`
- Browser কে বলে এটি HTML5 document
- সবসময় document এর শুরুতে থাকে
- Case insensitive

### 2. HTML Tag
\`\`\`html
<html lang="bn">
\`\`\`
- Root element, সব content এর মধ্যে থাকে
- \`lang\` attribute দিয়ে language specify করা হয়
- "bn" মানে বাংলা, "en" মানে English

### 3. Head Section
\`\`\`html
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Title</title>
</head>
\`\`\`

**Head এ কি থাকে:**
- **Meta tags**: Page সম্পর্কে information
- **Title**: Browser tab এ যে নাম দেখায়
- **CSS Links**: External stylesheets
- **Scripts**: JavaScript files

### 4. Meta Tags

**Charset:**
\`\`\`html
<meta charset="UTF-8">
\`\`\`
- Character encoding set করে
- UTF-8 সব language support করে (বাংলা, English, etc.)

**Viewport:**
\`\`\`html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
\`\`\`
- Mobile responsive এর জন্য অত্যন্ত জরুরী
- Device এর screen size অনুযায়ী adjust করে

**Description:**
\`\`\`html
<meta name="description" content="আমার website এর বর্ণনা">
\`\`\`
- Search engines এ show হয়
- SEO এর জন্য important

### 5. Body Section
\`\`\`html
<body>
    <!-- সব visible content এখানে -->
</body>
\`\`\`
- Page এ যা দেখা যায় সব body এর মধ্যে থাকে
- Text, images, videos, forms সব এখানে

## Development Environment Setup

### Text Editor
- **VS Code** (Highly Recommended)
- Sublime Text
- Notepad++

### VS Code Extensions
1. **Live Server** - Live preview দেখার জন্য
2. **Auto Rename Tag** - Tags rename করা সহজ হয়
3. **HTML CSS Support** - Better autocomplete
4. **Prettier** - Code formatting

### প্রথম HTML File তৈরি

1. একটি folder তৈরি করুন (যেমন: my-website)
2. \`index.html\` নামে file তৈরি করুন
3. VS Code এ type করুন \`!\` এবং Enter চাপুন (Emmet shortcut)
4. Basic structure automatically তৈরি হবে
5. Live Server দিয়ে browser এ দেখুন

## HTML Comments

\`\`\`html
<!-- এটি একটি comment -->
<!-- 
    Multiple line
    comment
-->
\`\`\`

**Comments এর ব্যবহার:**
- Code explain করার জন্য
- Temporary code hide করার জন্য
- Team members দের জন্য notes

## Best Practices

1. সবসময় proper indentation ব্যবহার করুন
2. Lowercase tags ব্যবহার করুন
3. Always close your tags
4. Meaningful comments লিখুন
5. UTF-8 charset অবশ্যই use করুন
`,
    topic: 'Web Development',
    tags: ['HTML', 'Structure', 'Setup', 'Document'],
    difficulty: 'beginner',
    estimatedTime: 20,
    media: [
      {
        type: 'video',
        url: 'https://www.youtube.com/watch?v=kUMe1FH4CHE',
        title: 'HTML Document Structure Bangla',
        duration: 1200,
      },
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
    keyPoints: [
      'DOCTYPE declaration HTML5 define করে',
      'Head section এ meta information থাকে',
      'Body তে visible content থাকে',
      'Meta viewport responsive design এর জন্য জরুরী',
    ],
    order: 2,
    isPublished: true,
    isPremium: false,
  },
  // Lesson 3: HTML Elements and Tags
  {
    title: 'HTML Elements ও Tags - Headings, Paragraphs, Links',
    description: 'HTML এর মৌলিক elements যেমন headings, paragraphs, links, images শিখুন।',
    content: `# HTML Elements ও Tags

## Headings (শিরোনাম)

HTML এ 6 level এর heading আছে:

\`\`\`html
<h1>এটি Heading 1 - সবচেয়ে বড়</h1>
<h2>এটি Heading 2</h2>
<h3>এটি Heading 3</h3>
<h4>এটি Heading 4</h4>
<h5>এটি Heading 5</h5>
<h6>এটি Heading 6 - সবচেয়ে ছোট</h6>
\`\`\`

**গুরুত্বপূর্ণ তথ্য:**
- \`<h1>\` একটি page এ শুধু একবার use করা উচিত (main title)
- Heading hierarchy maintain করুন (h1 → h2 → h3)
- SEO এর জন্য proper heading structure জরুরী

## Paragraphs (অনুচ্ছেদ)

\`\`\`html
<p>এটি একটি paragraph। এখানে আপনি যেকোনো text লিখতে পারবেন।</p>

<p>প্রতিটি paragraph আলাদা block হিসেবে show হয়।</p>
\`\`\`

## Text Formatting

### Bold Text
\`\`\`html
<strong>গুরুত্বপূর্ণ text</strong>
<b>Bold text</b>
\`\`\`
- \`<strong>\` semantic importance দেয় (recommended)
- \`<b>\` শুধু bold করে

### Italic Text
\`\`\`html
<em>Emphasized text</em>
<i>Italic text</i>
\`\`\`

### Other Formatting
\`\`\`html
<u>Underlined text</u>
<mark>Highlighted text</mark>
<small>ছোট text</small>
<del>মুছে ফেলা text</del>
<ins>নতুন যোগ করা text</ins>
<sub>Subscript</sub> এবং <sup>Superscript</sup>
\`\`\`

## Links (লিংক)

### Basic Link
\`\`\`html
<a href="https://www.google.com">Google এ যান</a>
\`\`\`

### New Tab এ Open
\`\`\`html
<a href="https://www.google.com" target="_blank">নতুন tab এ খুলুন</a>
\`\`\`

### Same Page Link
\`\`\`html
<a href="about.html">About পেজে যান</a>
\`\`\`

### Email Link
\`\`\`html
<a href="mailto:info@example.com">Email পাঠান</a>
\`\`\`

### Phone Link
\`\`\`html
<a href="tel:+8801712345678">ফোন করুন</a>
\`\`\`

### Section Link (Anchor)
\`\`\`html
<a href="#section1">Section 1 এ যান</a>

<!-- Page এর কোথাও -->
<div id="section1">
    <h2>Section 1</h2>
</div>
\`\`\`

## Images (ছবি)

### Basic Image
\`\`\`html
<img src="image.jpg" alt="ছবির বর্ণনা">
\`\`\`

### Size সহ Image
\`\`\`html
<img src="image.jpg" alt="ছবি" width="300" height="200">
\`\`\`

### Image as Link
\`\`\`html
<a href="page.html">
    <img src="thumbnail.jpg" alt="Thumbnail">
</a>
\`\`\`

**Image Best Practices:**
- সবসময় \`alt\` attribute use করুন (accessibility এর জন্য)
- Proper file format use করুন (JPG, PNG, WebP, SVG)
- Image optimize করে রাখুন (file size কম রাখুন)
- Descriptive file names ব্যবহার করুন

## Line Breaks এবং Horizontal Rules

### Line Break
\`\`\`html
<p>প্রথম লাইন<br>দ্বিতীয় লাইন</p>
\`\`\`

### Horizontal Line
\`\`\`html
<hr>
\`\`\`

## Lists (তালিকা)

### Unordered List (Bullet Points)
\`\`\`html
<ul>
    <li>প্রথম আইটেম</li>
    <li>দ্বিতীয় আইটেম</li>
    <li>তৃতীয় আইটেম</li>
</ul>
\`\`\`

### Ordered List (নম্বর সহ)
\`\`\`html
<ol>
    <li>প্রথম ধাপ</li>
    <li>দ্বিতীয় ধাপ</li>
    <li>তৃতীয় ধাপ</li>
</ol>
\`\`\`

### Nested Lists
\`\`\`html
<ul>
    <li>Main Item 1
        <ul>
            <li>Sub Item 1</li>
            <li>Sub Item 2</li>
        </ul>
    </li>
    <li>Main Item 2</li>
</ul>
\`\`\`

## Practical Example

\`\`\`html
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <title>আমার Portfolio</title>
</head>
<body>
    <h1>আমার নাম</h1>
    
    <p>আমি একজন <strong>Web Developer</strong>। আমি <em>HTML এবং CSS</em> শিখছি।</p>
    
    <h2>আমার Skills</h2>
    <ul>
        <li>HTML5</li>
        <li>CSS3</li>
        <li>JavaScript</li>
    </ul>
    
    <h2>যোগাযোগ</h2>
    <p>
        <a href="mailto:me@example.com">Email করুন</a> |
        <a href="tel:+8801712345678">ফোন করুন</a>
    </p>
    
    <hr>
    
    <p><small>&copy; 2025 সর্বস্বত্ব সংরক্ষিত</small></p>
</body>
</html>
\`\`\`

এই basic elements দিয়ে আপনি একটি simple কিন্তু functional webpage তৈরি করতে পারবেন!
`,
    topic: 'Web Development',
    tags: ['HTML', 'Elements', 'Tags', 'Links', 'Images'],
    difficulty: 'beginner',
    estimatedTime: 25,
    media: [
      {
        type: 'video',
        url: 'https://www.youtube.com/watch?v=MDLn5-zSQQI',
        title: 'HTML Elements and Tags Tutorial',
        duration: 1500,
      },
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800',
    keyPoints: [
      'h1 থেকে h6 পর্যন্ত heading levels',
      'Links তৈরিতে <a> tag ব্যবহার',
      'Images এ alt attribute অবশ্যই দিতে হবে',
      'Lists unordered (ul) ও ordered (ol) দুই ধরনের',
    ],
    order: 3,
    isPublished: true,
    isPremium: false,
  },
  // Lesson 4: HTML Forms
  {
    title: 'HTML Forms - Input Fields ও Data Collection',
    description: 'HTML forms তৈরি করুন এবং বিভিন্ন ধরনের input fields ব্যবহার শিখুন।',
    content: `# HTML Forms - Input Fields ও Data Collection

## Form কি এবং কেন ব্যবহার করি?

Form ব্যবহার করে user থেকে data collect করা হয়:
- Login/Registration
- Contact Forms
- Search Boxes
- Payment Information
- Survey/Feedback

## Basic Form Structure

\`\`\`html
<form action="/submit" method="POST">
    <!-- Form fields এখানে -->
    <button type="submit">Submit</button>
</form>
\`\`\`

**Form Attributes:**
- \`action\`: Data কোথায় যাবে (URL)
- \`method\`: Data কিভাবে পাঠাবে (GET বা POST)

## Text Input Fields

### Single Line Text
\`\`\`html
<label for="name">নাম:</label>
<input type="text" id="name" name="name" placeholder="আপনার নাম লিখুন">
\`\`\`

### Email Input
\`\`\`html
<label for="email">ইমেইল:</label>
<input type="email" id="email" name="email" required>
\`\`\`

### Password Input
\`\`\`html
<label for="password">পাসওয়ার্ড:</label>
<input type="password" id="password" name="password" minlength="8">
\`\`\`

### Number Input
\`\`\`html
<label for="age">বয়স:</label>
<input type="number" id="age" name="age" min="1" max="120">
\`\`\`

### Telephone
\`\`\`html
<label for="phone">ফোন:</label>
<input type="tel" id="phone" name="phone" pattern="[0-9]{11}">
\`\`\`

### URL
\`\`\`html
<label for="website">ওয়েবসাইট:</label>
<input type="url" id="website" name="website">
\`\`\`

## Multi-line Text

\`\`\`html
<label for="message">বার্তা:</label>
<textarea id="message" name="message" rows="5" cols="30"></textarea>
\`\`\`

## Selection Inputs

### Radio Buttons (একটি select করা যায়)
\`\`\`html
<p>লিঙ্গ:</p>
<input type="radio" id="male" name="gender" value="male">
<label for="male">পুরুষ</label>

<input type="radio" id="female" name="gender" value="female">
<label for="female">মহিলা</label>

<input type="radio" id="other" name="gender" value="other">
<label for="other">অন্যান্য</label>
\`\`\`

### Checkboxes (একাধিক select করা যায়)
\`\`\`html
<p>আগ্রহের বিষয়:</p>
<input type="checkbox" id="html" name="skills" value="html">
<label for="html">HTML</label>

<input type="checkbox" id="css" name="skills" value="css">
<label for="css">CSS</label>

<input type="checkbox" id="js" name="skills" value="js">
<label for="js">JavaScript</label>
\`\`\`

### Dropdown (Select)
\`\`\`html
<label for="city">শহর নির্বাচন করুন:</label>
<select id="city" name="city">
    <option value="">-- নির্বাচন করুন --</option>
    <option value="dhaka">ঢাকা</option>
    <option value="chittagong">চট্টগ্রাম</option>
    <option value="sylhet">সিলেট</option>
    <option value="rajshahi">রাজশাহী</option>
</select>
\`\`\`

## Date and Time Inputs

\`\`\`html
<!-- Date -->
<input type="date" name="birthdate">

<!-- Time -->
<input type="time" name="appointment">

<!-- Date and Time -->
<input type="datetime-local" name="meeting">

<!-- Month -->
<input type="month" name="month">

<!-- Week -->
<input type="week" name="week">
\`\`\`

## Other Input Types

### File Upload
\`\`\`html
<label for="avatar">ছবি আপলোড:</label>
<input type="file" id="avatar" name="avatar" accept="image/*">
\`\`\`

### Color Picker
\`\`\`html
<label for="color">রং নির্বাচন:</label>
<input type="color" id="color" name="color" value="#ff0000">
\`\`\`

### Range Slider
\`\`\`html
<label for="volume">ভলিউম:</label>
<input type="range" id="volume" name="volume" min="0" max="100" value="50">
\`\`\`

### Hidden Input
\`\`\`html
<input type="hidden" name="user_id" value="12345">
\`\`\`

## Form Buttons

\`\`\`html
<!-- Submit Button -->
<button type="submit">সাবমিট করুন</button>
<input type="submit" value="সাবমিট করুন">

<!-- Reset Button -->
<button type="reset">রিসেট করুন</button>

<!-- Regular Button -->
<button type="button">ক্লিক করুন</button>
\`\`\`

## Input Attributes

### Required
\`\`\`html
<input type="text" name="username" required>
\`\`\`

### Placeholder
\`\`\`html
<input type="text" placeholder="আপনার নাম">
\`\`\`

### Disabled
\`\`\`html
<input type="text" value="Disabled" disabled>
\`\`\`

### Readonly
\`\`\`html
<input type="text" value="Read only" readonly>
\`\`\`

### Maxlength
\`\`\`html
<input type="text" maxlength="10">
\`\`\`

### Pattern (Validation)
\`\`\`html
<input type="text" pattern="[A-Za-z]{3,}">
\`\`\`

### Autofocus
\`\`\`html
<input type="text" autofocus>
\`\`\`

### Autocomplete
\`\`\`html
<input type="email" autocomplete="email">
\`\`\`

## Complete Contact Form Example

\`\`\`html
<form action="/submit-contact" method="POST">
    <h2>যোগাযোগ ফর্ম</h2>
    
    <!-- Name -->
    <div>
        <label for="name">নাম: *</label>
        <input type="text" id="name" name="name" required>
    </div>
    
    <!-- Email -->
    <div>
        <label for="email">ইমেইল: *</label>
        <input type="email" id="email" name="email" required>
    </div>
    
    <!-- Phone -->
    <div>
        <label for="phone">ফোন:</label>
        <input type="tel" id="phone" name="phone">
    </div>
    
    <!-- Subject -->
    <div>
        <label for="subject">বিষয়:</label>
        <select id="subject" name="subject">
            <option value="general">সাধারণ জিজ্ঞাসা</option>
            <option value="support">সাপোর্ট</option>
            <option value="feedback">ফিডব্যাক</option>
        </select>
    </div>
    
    <!-- Message -->
    <div>
        <label for="message">বার্তা: *</label>
        <textarea id="message" name="message" rows="5" required></textarea>
    </div>
    
    <!-- Subscribe -->
    <div>
        <input type="checkbox" id="subscribe" name="subscribe">
        <label for="subscribe">নিউজলেটার সাবস্ক্রাইব করুন</label>
    </div>
    
    <!-- Submit -->
    <button type="submit">পাঠান</button>
    <button type="reset">রিসেট</button>
</form>
\`\`\`

## Form Validation

HTML5 তে built-in validation আছে:
- \`required\` - ফিল্ড অবশ্যই পূরণ করতে হবে
- \`type="email"\` - Valid email চেক করে
- \`type="url"\` - Valid URL চেক করে
- \`min\`, \`max\` - সংখ্যার range
- \`minlength\`, \`maxlength\` - Text length
- \`pattern\` - Custom regex validation

## Best Practices

1. সবসময় \`<label>\` ব্যবহার করুন
2. \`name\` attribute অবশ্যই দিন
3. Meaningful \`id\` এবং \`name\` ব্যবহার করুন
4. Required fields mark করুন
5. Helpful placeholder text দিন
6. Form সুবিধাজনক করে organize করুন
`,
    topic: 'Web Development',
    tags: ['HTML', 'Forms', 'Input', 'Validation'],
    difficulty: 'beginner',
    estimatedTime: 30,
    media: [
      {
        type: 'video',
        url: 'https://www.youtube.com/watch?v=fNcJuPIZ2WE',
        title: 'HTML Forms Complete Tutorial',
        duration: 1800,
      },
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800',
    keyPoints: [
      'Forms দিয়ে user data collect করা যায়',
      'বিভিন্ন input type আছে (text, email, password, etc.)',
      'Radio buttons একটি, checkbox একাধিক select করা যায়',
      'HTML5 built-in validation support করে',
    ],
    order: 4,
    isPublished: true,
    isPremium: false,
  },
  // Lesson 5: Semantic HTML
  {
    title: 'Semantic HTML5 Elements',
    description: 'Modern HTML5 semantic elements ব্যবহার করে meaningful structure তৈরি করুন।',
    content: `# Semantic HTML5 Elements

## Semantic HTML কি?

Semantic HTML মানে হলো এমন HTML elements যা তাদের content এর meaning clear করে দেয়। শুধু presentation নয়, element এর purpose বোঝা যায়।

**Non-semantic:** \`<div>\`, \`<span>\` - কিছু বোঝায় না
**Semantic:** \`<header>\`, \`<article>\`, \`<footer>\` - purpose clear

## কেন Semantic HTML?

1. **SEO**: Search engines better বুঝতে পারে
2. **Accessibility**: Screen readers এর জন্য helpful
3. **Maintainability**: Code বুঝতে সহজ
4. **Professional**: Modern standard practice

## Main Semantic Elements

### Header
\`\`\`html
<header>
    <h1>Website Title</h1>
    <nav>
        <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
        </ul>
    </nav>
</header>
\`\`\`
- Page বা section এর উপরের অংশ
- Logo, navigation থাকতে পারে

### Nav (Navigation)
\`\`\`html
<nav>
    <ul>
        <li><a href="/">হোম</a></li>
        <li><a href="/about">আমাদের সম্পর্কে</a></li>
        <li><a href="/services">সেবাসমূহ</a></li>
        <li><a href="/contact">যোগাযোগ</a></li>
    </ul>
</nav>
\`\`\`
- Navigation links এর জন্য
- Menu, breadcrumbs

### Main
\`\`\`html
<main>
    <!-- Page এর main content -->
    <h1>Welcome</h1>
    <p>Main content here...</p>
</main>
\`\`\`
- Page এর প্রধান content
- প্রতি page এ শুধু একটি \`<main>\`

### Article
\`\`\`html
<article>
    <h2>Blog Post Title</h2>
    <p>Published: January 1, 2025</p>
    <p>Article content...</p>
</article>
\`\`\`
- Self-contained content
- Blog posts, news articles, comments
- Independently distributable

### Section
\`\`\`html
<section>
    <h2>আমাদের সেবা</h2>
    <p>আমরা যেসব সেবা প্রদান করি...</p>
</section>
\`\`\`
- Thematic grouping of content
- সাধারণত heading সহ থাকে
- Generic container

### Aside
\`\`\`html
<aside>
    <h3>সম্পর্কিত লিঙ্ক</h3>
    <ul>
        <li><a href="#">Link 1</a></li>
        <li><a href="#">Link 2</a></li>
    </ul>
</aside>
\`\`\`
- Sidebar content
- Related links, ads
- Main content থেকে আলাদা কিছু

### Footer
\`\`\`html
<footer>
    <p>&copy; 2025 Company Name</p>
    <p>Contact: info@example.com</p>
</footer>
\`\`\`
- Page বা section এর নিচের অংশ
- Copyright, contact info, links

## Content Semantic Elements

### Figure এবং Figcaption
\`\`\`html
<figure>
    <img src="chart.jpg" alt="Sales Chart">
    <figcaption>২০২৫ সালের বিক্রয় চার্ট</figcaption>
</figure>
\`\`\`
- Images, diagrams, code listings
- Caption সহ content

### Time
\`\`\`html
<p>Event: <time datetime="2025-01-15T19:00">১৫ জানুয়ারি, সন্ধ্যা ৭টা</time></p>
\`\`\`
- Date এবং time represent করে
- Machine-readable format

### Mark
\`\`\`html
<p>এটি <mark>highlighted</mark> text</p>
\`\`\`
- Highlighted text
- Search results এ ব্যবহার হয়

### Details এবং Summary
\`\`\`html
<details>
    <summary>আরও পড়ুন</summary>
    <p>এখানে লুকানো content আছে যা click করলে দেখা যাবে।</p>
</details>
\`\`\`
- Collapsible content
- FAQ sections এর জন্য perfect

## Complete Page Structure Example

\`\`\`html
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <title>আমার ব্লগ</title>
</head>
<body>
    <!-- Header -->
    <header>
        <h1>আমার ব্লগ</h1>
        <nav>
            <ul>
                <li><a href="#home">হোম</a></li>
                <li><a href="#about">সম্পর্কে</a></li>
                <li><a href="#contact">যোগাযোগ</a></li>
            </ul>
        </nav>
    </header>

    <!-- Main Content -->
    <main>
        <!-- Article 1 -->
        <article>
            <header>
                <h2>HTML5 শেখার গাইড</h2>
                <p>লিখেছেন: <strong>জন ডো</strong></p>
                <p><time datetime="2025-01-01">১ জানুয়ারি, ২০২৫</time></p>
            </header>
            
            <section>
                <h3>পরিচিতি</h3>
                <p>HTML5 হলো...</p>
            </section>
            
            <section>
                <h3>বৈশিষ্ট্য</h3>
                <p>HTML5 এর মূল বৈশিষ্ট্যগুলো হলো...</p>
            </section>
            
            <footer>
                <p>ট্যাগ: HTML, Web Development</p>
            </footer>
        </article>

        <!-- Article 2 -->
        <article>
            <h2>CSS3 এর নতুন ফিচার</h2>
            <p>CSS3 এ অনেক নতুন features যোগ হয়েছে...</p>
        </article>
    </main>

    <!-- Sidebar -->
    <aside>
        <section>
            <h3>জনপ্রিয় পোস্ট</h3>
            <ul>
                <li><a href="#">JavaScript Basics</a></li>
                <li><a href="#">Responsive Design</a></li>
            </ul>
        </section>
        
        <section>
            <h3>ক্যাটাগরি</h3>
            <ul>
                <li><a href="#">HTML</a></li>
                <li><a href="#">CSS</a></li>
                <li><a href="#">JavaScript</a></li>
            </ul>
        </section>
    </aside>

    <!-- Footer -->
    <footer>
        <p>&copy; 2025 আমার ব্লগ। সর্বস্বত্ব সংরক্ষিত।</p>
        <nav>
            <a href="#privacy">গোপনীয়তা</a> |
            <a href="#terms">শর্তাবলী</a>
        </nav>
    </footer>
</body>
</html>
\`\`\`

## Div vs Semantic Elements

### ❌ খারাপ Practice (শুধু div)
\`\`\`html
<div class="header">
    <div class="nav">...</div>
</div>
<div class="main">
    <div class="article">...</div>
</div>
<div class="footer">...</div>
\`\`\`

### ✅ ভালো Practice (Semantic)
\`\`\`html
<header>
    <nav>...</nav>
</header>
<main>
    <article>...</article>
</main>
<footer>...</footer>
\`\`\`

## কখন কোনটা ব্যবহার করবেন?

- **header**: Page/section এর top
- **nav**: Navigation links
- **main**: Primary content (page এ একবার)
- **article**: Self-contained content
- **section**: Thematic grouping
- **aside**: Sidebar/tangential content
- **footer**: Page/section এর bottom
- **div**: যখন কোন semantic element fit না হয়

## Benefits Summary

1. **Better SEO** - Search engines better rank করে
2. **Accessibility** - Screen readers friendly
3. **Code Readability** - Easily maintainable
4. **Future-proof** - Modern standard
5. **Professional** - Industry best practice

Semantic HTML ব্যবহার করা মানে professional এবং accessible web তৈরি করা!
`,
    topic: 'Web Development',
    tags: ['HTML5', 'Semantic', 'Structure', 'Accessibility'],
    difficulty: 'beginner',
    estimatedTime: 25,
    media: [
      {
        type: 'video',
        url: 'https://www.youtube.com/watch?v=kGW8Al_cga4',
        title: 'HTML5 Semantic Elements',
        duration: 1500,
      },
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800',
    keyPoints: [
      'Semantic elements content এর meaning বোঝায়',
      'SEO এবং accessibility এর জন্য important',
      '<header>, <nav>, <main>, <footer> মূল elements',
      '<article> এবং <section> content organize করে',
    ],
    order: 5,
    isPublished: true,
    isPremium: false,
  },
  // Lesson 6: CSS Introduction
  {
    title: 'CSS - Cascading Style Sheets পরিচিতি',
    description: 'CSS কি, কিভাবে কাজ করে এবং HTML এর সাথে CSS link করার পদ্ধতি শিখুন।',
    content: `# CSS - Cascading Style Sheets পরিচিতি

## CSS কি?

CSS (Cascading Style Sheets) হলো একটি stylesheet language যা HTML elements কে style করার জন্য ব্যবহার করা হয়। HTML যদি হয় structure, CSS হলো design এবং presentation।

## CSS এর প্রয়োজনীয়তা

**HTML ছাড়া:**
- শুধু plain text
- কোন color, font, layout নেই
- খুবই basic look

**CSS সহ:**
- সুন্দর colors এবং fonts
- Professional layout
- Responsive design
- Animations এবং effects

## CSS কিভাবে কাজ করে?

CSS এর তিনটি অংশ:

\`\`\`css
selector {
    property: value;
}
\`\`\`

**Example:**
\`\`\`css
h1 {
    color: blue;
    font-size: 32px;
}
\`\`\`

- **Selector**: কোন element কে style করবে (h1)
- **Property**: কি change করবে (color, font-size)
- **Value**: কি value দিবে (blue, 32px)

## CSS Add করার ৩টি পদ্ধতি

### 1. Inline CSS (Element এর মধ্যে)

\`\`\`html
<h1 style="color: red; font-size: 24px;">Heading</h1>
<p style="color: blue;">Paragraph</p>
\`\`\`

**ব্যবহার:**
- Quick test এর জন্য
- Single element style করার জন্য

**অসুবিধা:**
- Maintainability কম
- Reusability নেই
- Professional নয়

### 2. Internal CSS (Head এ)

\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <style>
        h1 {
            color: red;
            font-size: 24px;
        }
        
        p {
            color: blue;
            line-height: 1.6;
        }
    </style>
</head>
<body>
    <h1>Heading</h1>
    <p>Paragraph</p>
</body>
</html>
\`\`\`

**ব্যবহার:**
- Single page website
- Page-specific styles

**সুবিধা:**
- Separate style থেকে structure
- একসাথে অনেক elements style করা যায়

### 3. External CSS (আলাদা file) ⭐ Best Practice

**HTML File:**
\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>Heading</h1>
    <p>Paragraph</p>
</body>
</html>
\`\`\`

**style.css File:**
\`\`\`css
h1 {
    color: red;
    font-size: 24px;
}

p {
    color: blue;
    line-height: 1.6;
}
\`\`\`

**সুবিধা:**
- একটি CSS file অনেক HTML pages এ use করা যায়
- Maintainable
- Clean code
- Professional approach

## Basic CSS Syntax Rules

### Comments
\`\`\`css
/* এটি একটি comment */

/* 
Multi-line
comment
*/
\`\`\`

### Multiple Properties
\`\`\`css
h1 {
    color: blue;
    font-size: 32px;
    text-align: center;
    font-weight: bold;
}
\`\`\`

### Multiple Selectors
\`\`\`css
h1, h2, h3 {
    color: navy;
    font-family: Arial, sans-serif;
}
\`\`\`

## Common CSS Properties

### Text Properties
\`\`\`css
p {
    color: #333;              /* Text color */
    font-size: 16px;          /* Font size */
    font-family: Arial;       /* Font */
    font-weight: bold;        /* Bold */
    font-style: italic;       /* Italic */
    text-align: center;       /* Alignment */
    text-decoration: underline; /* Underline */
    line-height: 1.6;         /* Line spacing */
    letter-spacing: 2px;      /* Letter spacing */
}
\`\`\`

### Background Properties
\`\`\`css
body {
    background-color: #f0f0f0;
    background-image: url('bg.jpg');
    background-size: cover;
    background-repeat: no-repeat;
}
\`\`\`

### Size Properties
\`\`\`css
div {
    width: 300px;
    height: 200px;
    max-width: 100%;
    min-height: 150px;
}
\`\`\`

## Color Values in CSS

### Color Names
\`\`\`css
h1 { color: red; }
p { color: blue; }
\`\`\`

### Hex Codes
\`\`\`css
h1 { color: #ff0000; }  /* Red */
p { color: #0000ff; }   /* Blue */
\`\`\`

### RGB
\`\`\`css
h1 { color: rgb(255, 0, 0); }  /* Red */
p { color: rgb(0, 0, 255); }   /* Blue */
\`\`\`

### RGBA (Alpha = Transparency)
\`\`\`css
div { background-color: rgba(0, 0, 0, 0.5); }  /* 50% transparent black */
\`\`\`

## Units in CSS

### Absolute Units
- **px** (pixels): \`font-size: 16px;\`
- **pt** (points): \`font-size: 12pt;\`

### Relative Units
- **%** (percent): \`width: 50%;\`
- **em**: Parent এর relative
- **rem**: Root এর relative
- **vw**: Viewport width
- **vh**: Viewport height

## Complete Example

**index.html:**
\`\`\`html
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <title>আমার স্টাইলিশ পেজ</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <h1>স্বাগতম আমার ওয়েবসাইটে</h1>
        <nav>
            <a href="#home">হোম</a>
            <a href="#about">পরিচিতি</a>
            <a href="#contact">যোগাযোগ</a>
        </nav>
    </header>
    
    <main>
        <article>
            <h2>প্রথম আর্টিকেল</h2>
            <p>এটি একটি paragraph যেখানে আমি CSS সম্পর্কে লিখছি।</p>
        </article>
    </main>
    
    <footer>
        <p>&copy; 2025 আমার ওয়েবসাইট</p>
    </footer>
</body>
</html>
\`\`\`

**style.css:**
\`\`\`css
/* General Styles */
body {
    font-family: 'Segoe UI', Tahoma, sans-serif;
    margin: 0;
    padding: 0;
    background-color: #f5f5f5;
    color: #333;
}

/* Header Styles */
header {
    background-color: #2c3e50;
    color: white;
    padding: 20px;
    text-align: center;
}

header h1 {
    margin: 0;
    font-size: 36px;
}

/* Navigation */
nav a {
    color: white;
    text-decoration: none;
    margin: 0 15px;
    font-size: 18px;
}

nav a:hover {
    color: #3498db;
}

/* Main Content */
main {
    max-width: 800px;
    margin: 40px auto;
    padding: 20px;
    background-color: white;
}

article h2 {
    color: #2c3e50;
    border-bottom: 2px solid #3498db;
    padding-bottom: 10px;
}

article p {
    line-height: 1.8;
    font-size: 16px;
}

/* Footer */
footer {
    background-color: #34495e;
    color: white;
    text-align: center;
    padding: 20px;
    margin-top: 40px;
}
\`\`\`

## CSS Best Practices

1. **External CSS ব্যবহার করুন** - সবসময়
2. **Meaningful names** - Class এবং ID এর
3. **Comments লিখুন** - Code explain করার জন্য
4. **Organize করুন** - Related styles একসাথে রাখুন
5. **Consistent formatting** - Proper indentation
6. **Avoid inline styles** - যতটা সম্ভব
7. **Mobile-first approach** - Responsive design এর জন্য

## Browser Developer Tools

সব modern browser এ Developer Tools আছে:
- **Chrome**: F12 বা Right-click → Inspect
- **Firefox**: F12 বা Right-click → Inspect Element
- **Edge**: F12

**Developer Tools দিয়ে:**
- Live CSS edit করতে পারবেন
- Elements inspect করতে পারবেন
- Colors test করতে পারবেন
- Responsive design test করতে পারবেন

CSS হলো web design এর মূল ভিত্তি - এটা master করলে beautiful websites তৈরি করতে পারবেন!
`,
    topic: 'Web Development',
    tags: ['CSS', 'Styling', 'Introduction', 'Design'],
    difficulty: 'beginner',
    estimatedTime: 25,
    media: [
      {
        type: 'video',
        url: 'https://www.youtube.com/watch?v=1PnVor36_40',
        title: 'CSS Introduction Tutorial Bangla',
        duration: 1500,
      },
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800',
    keyPoints: [
      'CSS দিয়ে HTML elements style করা হয়',
      'External CSS সবচেয়ে ভালো practice',
      'Selector, property, value - CSS এর তিন অংশ',
      'Color, font, size - basic CSS properties',
    ],
    order: 6,
    isPublished: true,
    isPremium: false,
  },
  // Lesson 7: CSS Selectors
  {
    title: 'CSS Selectors - Element, Class, ID এবং আরও',
    description: 'CSS এর বিভিন্ন selector types শিখুন এবং efficiently elements select করুন।',
    content: `# CSS Selectors

## Selector কি?

Selector দিয়ে আমরা নির্দিষ্ট HTML elements কে select করি যেগুলোতে CSS apply করবো।

## Basic Selectors

### 1. Element Selector (Tag Selector)

\`\`\`css
p {
    color: blue;
}

h1 {
    font-size: 32px;
}

/* সব paragraphs এ apply হবে */
\`\`\`

### 2. Class Selector

**HTML:**
\`\`\`html
<p class="highlight">এই paragraph highlighted</p>
<div class="highlight">এই div ও highlighted</div>
\`\`\`

**CSS:**
\`\`\`css
.highlight {
    background-color: yellow;
    font-weight: bold;
}
\`\`\`

- Class selector শুরু হয় **dot (.)** দিয়ে
- একই class অনেক elements এ ব্যবহার করা যায়
- একটি element এ multiple classes থাকতে পারে

**Multiple Classes:**
\`\`\`html
<p class="text-large text-blue">Multiple classes</p>
\`\`\`

### 3. ID Selector

**HTML:**
\`\`\`html
<div id="header">Header Content</div>
\`\`\`

**CSS:**
\`\`\`css
#header {
    background-color: navy;
    color: white;
}
\`\`\`

- ID selector শুরু হয় **hash (#)** দিয়ে
- একটি ID শুধু একবার use করা যায় per page
- Class এর চেয়ে specific

### 4. Universal Selector

\`\`\`css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

/* সব elements এ apply হবে */
\`\`\`

## Combinator Selectors

### Descendant Selector (Space)

\`\`\`css
div p {
    color: red;
}

/* div এর ভিতরের সব p elements */
\`\`\`

**HTML:**
\`\`\`html
<div>
    <p>এটি red হবে</p>
    <section>
        <p>এটিও red হবে (nested)</p>
    </section>
</div>
<p>এটি red হবে না</p>
\`\`\`

### Child Selector (>)

\`\`\`css
div > p {
    color: blue;
}

/* শুধু direct children */
\`\`\`

**HTML:**
\`\`\`html
<div>
    <p>এটি blue হবে (direct child)</p>
    <section>
        <p>এটি blue হবে না (not direct child)</p>
    </section>
</div>
\`\`\`

### Adjacent Sibling (+)

\`\`\`css
h2 + p {
    font-weight: bold;
}

/* h2 এর পরে immediately যে p আছে */
\`\`\`

### General Sibling (~)

\`\`\`css
h2 ~ p {
    color: gray;
}

/* h2 এর পরে সব p elements */
\`\`\`

## Attribute Selectors

### Basic Attribute
\`\`\`css
input[type="text"] {
    border: 1px solid blue;
}

a[target="_blank"] {
    color: red;
}
\`\`\`

### Contains Value
\`\`\`css
a[href*="google"] {
    color: green;
}

/* href এ "google" আছে এমন links */
\`\`\`

### Starts With
\`\`\`css
a[href^="https"] {
    color: blue;
}

/* https দিয়ে শুরু হয় এমন links */
\`\`\`

### Ends With
\`\`\`css
a[href$=".pdf"] {
    color: red;
}

/* .pdf দিয়ে শেষ হয় এমন links */
\`\`\`

## Pseudo-class Selectors

### Link States
\`\`\`css
a:link {
    color: blue;
}

a:visited {
    color: purple;
}

a:hover {
    color: red;
    text-decoration: underline;
}

a:active {
    color: orange;
}
\`\`\`

### First and Last Child
\`\`\`css
li:first-child {
    font-weight: bold;
}

li:last-child {
    border-bottom: none;
}
\`\`\`

### Nth Child
\`\`\`css
/* Even rows */
tr:nth-child(even) {
    background-color: #f2f2f2;
}

/* Odd rows */
tr:nth-child(odd) {
    background-color: white;
}

/* Every 3rd element */
li:nth-child(3n) {
    color: red;
}

/* Specific element */
li:nth-child(2) {
    color: blue;
}
\`\`\`

### Other Useful Pseudo-classes
\`\`\`css
input:focus {
    border-color: blue;
    outline: 2px solid lightblue;
}

input:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}

input:checked {
    /* Checkbox/radio checked state */
}

p:not(.special) {
    color: gray;
}
\`\`\`

## Pseudo-element Selectors

### Before and After
\`\`\`css
p::before {
    content: "📝 ";
}

p::after {
    content: " ✓";
}
\`\`\`

### First Letter and Line
\`\`\`css
p::first-letter {
    font-size: 2em;
    font-weight: bold;
    color: red;
}

p::first-line {
    font-weight: bold;
}
\`\`\`

### Selection
\`\`\`css
::selection {
    background-color: yellow;
    color: black;
}
\`\`\`

## Group Selectors

\`\`\`css
h1, h2, h3 {
    font-family: Arial, sans-serif;
    color: navy;
}

.btn, .button, input[type="button"] {
    padding: 10px 20px;
    border-radius: 5px;
}
\`\`\`

## Specificity (কোনটা জিতবে?)

CSS এ specificity হলো priority system:

1. **Inline styles** (1000 points)
2. **IDs** (100 points)
3. **Classes, attributes, pseudo-classes** (10 points)
4. **Elements, pseudo-elements** (1 point)

**Example:**
\`\`\`css
p { color: black; }           /* 1 point */
.text { color: blue; }        /* 10 points */
p.text { color: green; }      /* 11 points */
#content { color: red; }      /* 100 points */
\`\`\`

### !important
\`\`\`css
p {
    color: blue !important;
}

/* সবচেয়ে বেশি priority, কিন্তু avoid করা উচিত */
\`\`\`

## Practical Example

\`\`\`css
/* Reset */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

/* Typography */
body {
    font-family: Arial, sans-serif;
    line-height: 1.6;
}

/* Header */
header {
    background: #333;
    color: white;
    padding: 20px;
}

header h1 {
    font-size: 2em;
}

/* Navigation */
nav a {
    color: white;
    text-decoration: none;
    padding: 10px 15px;
}

nav a:hover {
    background: #555;
}

nav a.active {
    background: #007bff;
}

/* Main Content */
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.card {
    border: 1px solid #ddd;
    padding: 20px;
    margin: 10px 0;
}

.card:hover {
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.card h2 {
    color: #333;
    margin-bottom: 10px;
}

.card p:first-of-type {
    font-weight: bold;
}

/* Buttons */
.btn {
    display: inline-block;
    padding: 10px 20px;
    background: #007bff;
    color: white;
    text-decoration: none;
    border-radius: 5px;
}

.btn:hover {
    background: #0056b3;
}

.btn-danger {
    background: #dc3545;
}

.btn-danger:hover {
    background: #c82333;
}

/* Lists */
ul.checklist li::before {
    content: "✓ ";
    color: green;
    font-weight: bold;
}

/* Links */
a[target="_blank"]::after {
    content: " ↗";
}

a[href^="mailto"]::before {
    content: "📧 ";
}
\`\`\`

## Best Practices

1. **Class > ID**: বেশিরভাগ ক্ষেত্রে class use করুন
2. **Avoid !important**: যতটা সম্ভব
3. **Keep specificity low**: Maintainable রাখার জন্য
4. **Use meaningful names**: \`.btn-primary\` ভালো, \`.blue-btn\` খারাপ
5. **Group related selectors**: Code clean রাখুন
6. **Comment your code**: বড় projects এ helpful

CSS Selectors properly বুঝলে যেকোনো element efficiently style করতে পারবেন!
`,
    topic: 'Web Development',
    tags: ['CSS', 'Selectors', 'Targeting', 'Specificity'],
    difficulty: 'beginner',
    estimatedTime: 30,
    media: [
      {
        type: 'video',
        url: 'https://www.youtube.com/watch?v=l1mER1bV0N0',
        title: 'CSS Selectors Complete Guide',
        duration: 1800,
      },
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1508317469940-e3de49ba902e?w=800',
    keyPoints: [
      'Element, Class (.), ID (#) - basic selectors',
      'Pseudo-classes যেমন :hover, :first-child',
      'Specificity determine করে কোন style apply হবে',
      'Combinators দিয়ে nested elements select করা যায়',
    ],
    order: 7,
    isPublished: true,
    isPremium: false,
  },
  // Lesson 8: CSS Box Model
  {
    title: 'CSS Box Model - Margin, Padding, Border',
    description: 'CSS Box Model বুঝুন এবং spacing, borders properly control করতে শিখুন।',
    content: `# CSS Box Model

## Box Model কি?

CSS এ প্রতিটি element একটি rectangular box। Box Model এ চারটি অংশ আছে:

\`\`\`
┌─────────────────── Margin ─────────────────────┐
│ ┌───────────────── Border ─────────────────┐   │
│ │ ┌─────────────── Padding ───────────┐   │   │
│ │ │                                    │   │   │
│ │ │          Content                   │   │   │
│ │ │                                    │   │   │
│ │ └────────────────────────────────────┘   │   │
│ └──────────────────────────────────────────┘   │
└────────────────────────────────────────────────┘
\`\`\`

1. **Content**: Actual content (text, images)
2. **Padding**: Content এর চারপাশের space
3. **Border**: Padding এর চারপাশের line
4. **Margin**: Border এর বাইরের space

## Width এবং Height

\`\`\`css
div {
    width: 300px;
    height: 200px;
}
\`\`\`

**Default:** Width এবং height শুধু content area এর জন্য

## Padding (ভিতরের space)

### সব দিকে same
\`\`\`css
div {
    padding: 20px;
}
\`\`\`

### আলাদা আলাদা
\`\`\`css
div {
    padding-top: 10px;
    padding-right: 20px;
    padding-bottom: 15px;
    padding-left: 25px;
}
\`\`\`

### Shorthand
\`\`\`css
/* All sides */
padding: 20px;

/* Top/Bottom, Left/Right */
padding: 10px 20px;

/* Top, Left/Right, Bottom */
padding: 10px 20px 15px;

/* Top, Right, Bottom, Left (clockwise) */
padding: 10px 20px 15px 25px;
\`\`\`

## Border

### Basic Border
\`\`\`css
div {
    border: 2px solid black;
}
\`\`\`

### আলাদা properties
\`\`\`css
div {
    border-width: 2px;
    border-style: solid;
    border-color: blue;
}
\`\`\`

### Border Styles
\`\`\`css
border-style: solid;    /* ─────── */
border-style: dashed;   /* ─ ─ ─ ─  */
border-style: dotted;   /* · · · ·  */
border-style: double;   /* ═══════ */
border-style: groove;   /* 3D effect */
border-style: ridge;    /* 3D effect */
border-style: inset;    /* 3D effect */
border-style: outset;   /* 3D effect */
border-style: none;     /* No border */
\`\`\`

### Specific Sides
\`\`\`css
div {
    border-top: 1px solid black;
    border-right: 2px dashed blue;
    border-bottom: 3px dotted red;
    border-left: 4px double green;
}
\`\`\`

### Border Radius (Rounded corners)
\`\`\`css
div {
    border-radius: 10px;
}

/* Circle */
div {
    width: 100px;
    height: 100px;
    border-radius: 50%;
}

/* Different corners */
border-radius: 10px 20px 30px 40px;
\`\`\`

## Margin (বাইরের space)

### Same as Padding
\`\`\`css
div {
    margin: 20px;
}

/* Specific sides */
margin-top: 10px;
margin-right: 20px;
margin-bottom: 15px;
margin-left: 25px;

/* Shorthand */
margin: 10px 20px 15px 25px;
\`\`\`

### Center Align
\`\`\`css
div {
    width: 800px;
    margin: 0 auto;  /* Horizontally center */
}
\`\`\`

### Negative Margin
\`\`\`css
div {
    margin-top: -20px;  /* উপরে টেনে নিয়ে আসবে */
}
\`\`\`

## Box Sizing

### Content Box (Default)
\`\`\`css
div {
    box-sizing: content-box;
    width: 300px;
    padding: 20px;
    border: 5px solid black;
}

/* Total width = 300 + 40 + 10 = 350px */
\`\`\`

### Border Box (Recommended)
\`\`\`css
div {
    box-sizing: border-box;
    width: 300px;
    padding: 20px;
    border: 5px solid black;
}

/* Total width = 300px (padding এবং border included) */
\`\`\`

### Universal Box Sizing (Best Practice)
\`\`\`css
* {
    box-sizing: border-box;
}
\`\`\`

## Display Property

\`\`\`css
/* Block: Full width, new line */
div {
    display: block;
}

/* Inline: শুধু content এর width */
span {
    display: inline;
}

/* Inline-block: Inline কিন্তু width/height set করা যায় */
button {
    display: inline-block;
}

/* None: Hide element */
div {
    display: none;
}
\`\`\`

## Complete Card Example

\`\`\`css
.card {
    /* Box Model */
    width: 300px;
    padding: 20px;
    margin: 20px auto;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-sizing: border-box;
    
    /* Visual */
    background-color: white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.card-header {
    padding-bottom: 15px;
    margin-bottom: 15px;
    border-bottom: 2px solid #f0f0f0;
}

.card-title {
    margin: 0 0 10px 0;
    font-size: 24px;
}

.card-body {
    padding: 15px 0;
}

.card-footer {
    padding-top: 15px;
    margin-top: 15px;
    border-top: 1px solid #f0f0f0;
}

.btn {
    display: inline-block;
    padding: 10px 20px;
    margin: 5px;
    border: 2px solid #007bff;
    border-radius: 5px;
    background-color: #007bff;
    color: white;
}
\`\`\`

Box Model master করলে perfect spacing এবং layout তৈরি করতে পারবেন!
`,
    topic: 'Web Development',
    tags: ['CSS', 'Box Model', 'Layout', 'Spacing'],
    difficulty: 'beginner',
    estimatedTime: 25,
    media: [
      {
        type: 'video',
        url: 'https://www.youtube.com/watch?v=rIO5326FgPE',
        title: 'CSS Box Model Explained',
        duration: 1500,
      },
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    keyPoints: [
      'Box Model: Content, Padding, Border, Margin',
      'box-sizing: border-box সবসময় use করুন',
      'Margin auto দিয়ে center align করা যায়',
      'border-radius দিয়ে rounded corners',
    ],
    order: 8,
    isPublished: true,
    isPremium: false,
  },
  // Lesson 9: Typography and Colors
  {
    title: 'CSS Typography এবং Colors',
    description: 'Text styling, fonts, colors এবং modern typography techniques শিখুন।',
    content: `# CSS Typography এবং Colors

## Font Properties

### Font Family
\`\`\`css
body {
    font-family: 'Arial', 'Helvetica', sans-serif;
}

/* Web Safe Fonts */
font-family: Arial, sans-serif;
font-family: 'Times New Roman', serif;
font-family: 'Courier New', monospace;
font-family: Georgia, serif;
font-family: Verdana, sans-serif;
\`\`\`

### Google Fonts
**HTML:**
\`\`\`html
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap" rel="stylesheet">
\`\`\`

**CSS:**
\`\`\`css
body {
    font-family: 'Roboto', sans-serif;
}
\`\`\`

### Font Size
\`\`\`css
h1 { font-size: 32px; }
p { font-size: 16px; }

/* Relative units */
p { font-size: 1rem; }     /* Root em */
span { font-size: 0.875em; } /* Parent relative */
\`\`\`

### Font Weight
\`\`\`css
p {
    font-weight: normal;   /* 400 */
    font-weight: bold;     /* 700 */
    font-weight: lighter;
    font-weight: bolder;
    font-weight: 100;      /* Thin */
    font-weight: 900;      /* Black */
}
\`\`\`

### Font Style
\`\`\`css
p {
    font-style: normal;
    font-style: italic;
    font-style: oblique;
}
\`\`\`

## Text Properties

### Text Align
\`\`\`css
h1 { text-align: center; }
p { text-align: left; }
div { text-align: right; }
p { text-align: justify; }
\`\`\`

### Text Decoration
\`\`\`css
a {
    text-decoration: none;           /* Remove underline */
    text-decoration: underline;
    text-decoration: overline;
    text-decoration: line-through;
}
\`\`\`

### Text Transform
\`\`\`css
h1 { text-transform: uppercase; }   /* UPPERCASE */
h2 { text-transform: lowercase; }   /* lowercase */
h3 { text-transform: capitalize; }  /* Capitalize Each Word */
\`\`\`

### Line Height
\`\`\`css
p {
    line-height: 1.6;      /* Recommended */
    line-height: 24px;
    line-height: 150%;
}
\`\`\`

### Letter Spacing
\`\`\`css
h1 {
    letter-spacing: 2px;
    letter-spacing: 0.1em;
}
\`\`\`

### Word Spacing
\`\`\`css
p {
    word-spacing: 5px;
}
\`\`\`

### Text Shadow
\`\`\`css
h1 {
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    /* x-offset y-offset blur color */
}

/* Multiple shadows */
h1 {
    text-shadow: 
        2px 2px 4px red,
        -2px -2px 4px blue;
}
\`\`\`

## Color Values

### Color Names
\`\`\`css
p { color: red; }
div { background-color: blue; }
\`\`\`

### Hexadecimal
\`\`\`css
p { color: #ff0000; }      /* Red */
p { color: #00ff00; }      /* Green */
p { color: #0000ff; }      /* Blue */
p { color: #333; }         /* Shorthand for #333333 */
\`\`\`

### RGB
\`\`\`css
p { color: rgb(255, 0, 0); }      /* Red */
p { color: rgb(0, 255, 0); }      /* Green */
p { color: rgb(0, 0, 255); }      /* Blue */
\`\`\`

### RGBA (with Alpha/Transparency)
\`\`\`css
div { 
    background-color: rgba(0, 0, 0, 0.5);  /* 50% transparent black */
}
\`\`\`

### HSL (Hue, Saturation, Lightness)
\`\`\`css
p { color: hsl(0, 100%, 50%); }      /* Red */
p { color: hsl(120, 100%, 50%); }    /* Green */
p { color: hsl(240, 100%, 50%); }    /* Blue */
\`\`\`

### HSLA (with Alpha)
\`\`\`css
div { 
    background-color: hsla(240, 100%, 50%, 0.5);
}
\`\`\`

## Color Properties

### Text Color
\`\`\`css
p {
    color: #333;
}
\`\`\`

### Background Color
\`\`\`css
div {
    background-color: #f5f5f5;
}
\`\`\`

### Border Color
\`\`\`css
div {
    border: 2px solid #007bff;
}
\`\`\`

## Modern Typography Example

\`\`\`css
/* Import Google Font */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');

/* Reset and Base */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Poppins', sans-serif;
    font-size: 16px;
    line-height: 1.6;
    color: #333;
    background-color: #f9f9f9;
}

/* Headings */
h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    line-height: 1.2;
    margin-bottom: 1rem;
    color: #2c3e50;
}

h1 {
    font-size: 2.5rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 2px;
}

h2 {
    font-size: 2rem;
}

h3 {
    font-size: 1.75rem;
}

/* Paragraphs */
p {
    margin-bottom: 1rem;
    color: #555;
}

p.lead {
    font-size: 1.25rem;
    font-weight: 300;
    color: #666;
}

/* Links */
a {
    color: #007bff;
    text-decoration: none;
    transition: color 0.3s;
}

a:hover {
    color: #0056b3;
    text-decoration: underline;
}

/* Lists */
ul, ol {
    margin-left: 2rem;
    margin-bottom: 1rem;
}

li {
    margin-bottom: 0.5rem;
}

/* Blockquote */
blockquote {
    border-left: 4px solid #007bff;
    padding-left: 1.5rem;
    margin: 1.5rem 0;
    font-style: italic;
    color: #666;
}

/* Code */
code {
    font-family: 'Courier New', monospace;
    background-color: #f4f4f4;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 0.9em;
    color: #e83e8c;
}

/* Highlight */
.highlight {
    background-color: #fff3cd;
    padding: 2px 6px;
    border-radius: 3px;
}

/* Muted Text */
.text-muted {
    color: #6c757d;
    font-size: 0.9rem;
}

/* Text Colors */
.text-primary { color: #007bff; }
.text-success { color: #28a745; }
.text-danger { color: #dc3545; }
.text-warning { color: #ffc107; }
.text-info { color: #17a2b8; }

/* Text Alignment */
.text-left { text-align: left; }
.text-center { text-align: center; }
.text-right { text-align: right; }

/* Font Weights */
.font-light { font-weight: 300; }
.font-normal { font-weight: 400; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }

/* Text Transforms */
.uppercase { text-transform: uppercase; }
.lowercase { text-transform: lowercase; }
.capitalize { text-transform: capitalize; }
\`\`\`

## Color Schemes

### Monochromatic
\`\`\`css
:root {
    --primary-dark: #003d82;
    --primary: #0066cc;
    --primary-light: #3399ff;
    --primary-lighter: #99ccff;
}
\`\`\`

### Complementary
\`\`\`css
:root {
    --primary: #007bff;    /* Blue */
    --accent: #ff7b00;     /* Orange */
}
\`\`\`

### Professional Palette
\`\`\`css
:root {
    /* Colors */
    --primary: #2c3e50;
    --secondary: #34495e;
    --accent: #3498db;
    --success: #2ecc71;
    --warning: #f39c12;
    --danger: #e74c3c;
    
    /* Grays */
    --gray-100: #f8f9fa;
    --gray-200: #e9ecef;
    --gray-300: #dee2e6;
    --gray-400: #ced4da;
    --gray-500: #adb5bd;
    --gray-600: #6c757d;
    --gray-700: #495057;
    --gray-800: #343a40;
    --gray-900: #212529;
    
    /* Text */
    --text-primary: #212529;
    --text-secondary: #6c757d;
    --text-muted: #adb5bd;
}
\`\`\`

Typography এবং colors properly use করলে professional এবং readable websites তৈরি করতে পারবেন!
`,
    topic: 'Web Development',
    tags: ['CSS', 'Typography', 'Colors', 'Fonts'],
    difficulty: 'beginner',
    estimatedTime: 25,
    media: [
      {
        type: 'video',
        url: 'https://www.youtube.com/watch?v=yfoY53QXEnI',
        title: 'CSS Typography and Colors Tutorial',
        duration: 1500,
      },
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800',
    keyPoints: [
      'Google Fonts ব্যবহার করে custom fonts add করা যায়',
      'line-height 1.6 readability এর জন্য ভালো',
      'Colors: hex, rgb, rgba, hsl - বিভিন্ন format',
      'text-shadow দিয়ে text effects তৈরি করা যায়',
    ],
    order: 9,
    isPublished: true,
    isPremium: false,
  },
  // Lesson 10: CSS Flexbox
  {
    title: 'CSS Flexbox - Modern Layout System',
    description: 'Flexbox ব্যবহার করে responsive এবং flexible layouts তৈরি করুন।',
    content: `# CSS Flexbox

## Flexbox কি?

Flexbox (Flexible Box Layout) হলো একটি modern CSS layout system যা elements কে efficiently arrange এবং distribute করে। এটি responsive design এর জন্য perfect।

## Flex Container Setup

\`\`\`css
.container {
    display: flex;
}
\`\`\`

এটি করলে container flex container হয়ে যাবে এবং direct children গুলো flex items হবে।

## Main Axis vs Cross Axis

- **Main Axis**: Flex direction এর direction (default: horizontal)
- **Cross Axis**: Main axis এর perpendicular

## Flex Container Properties

### flex-direction
\`\`\`css
.container {
    flex-direction: row;            /* → Default: left to right */
    flex-direction: row-reverse;    /* ← Right to left */
    flex-direction: column;         /* ↓ Top to bottom */
    flex-direction: column-reverse; /* ↑ Bottom to top */
}
\`\`\`

### justify-content (Main Axis)
\`\`\`css
.container {
    justify-content: flex-start;    /* শুরুতে (default) */
    justify-content: flex-end;      /* শেষে */
    justify-content: center;        /* মাঝখানে */
    justify-content: space-between; /* Equal space between */
    justify-content: space-around;  /* Equal space around */
    justify-content: space-evenly;  /* Perfect equal space */
}
\`\`\`

### align-items (Cross Axis)
\`\`\`css
.container {
    align-items: stretch;     /* Full height (default) */
    align-items: flex-start;  /* উপরে */
    align-items: flex-end;    /* নিচে */
    align-items: center;      /* মাঝখানে */
    align-items: baseline;    /* Text baseline */
}
\`\`\`

### flex-wrap
\`\`\`css
.container {
    flex-wrap: nowrap;       /* একই line এ (default) */
    flex-wrap: wrap;         /* Multiple lines এ যাবে */
    flex-wrap: wrap-reverse; /* Reverse order এ wrap */
}
\`\`\`

### align-content (Multiple Lines)
\`\`\`css
.container {
    flex-wrap: wrap;
    align-content: flex-start;
    align-content: flex-end;
    align-content: center;
    align-content: space-between;
    align-content: space-around;
    align-content: stretch;
}
\`\`\`

### gap (Spacing)
\`\`\`css
.container {
    gap: 20px;              /* All gaps */
    row-gap: 20px;          /* Vertical gaps */
    column-gap: 30px;       /* Horizontal gaps */
}
\`\`\`

## Flex Item Properties

### flex-grow
\`\`\`css
.item {
    flex-grow: 0;  /* Default: Grow নয় */
    flex-grow: 1;  /* Available space নিবে */
    flex-grow: 2;  /* Double space নিবে */
}
\`\`\`

### flex-shrink
\`\`\`css
.item {
    flex-shrink: 1;  /* Default: Shrink হবে */
    flex-shrink: 0;  /* Shrink হবে না */
}
\`\`\`

### flex-basis
\`\`\`css
.item {
    flex-basis: 200px;  /* Initial size */
    flex-basis: 30%;    /* Percentage */
    flex-basis: auto;   /* Content based (default) */
}
\`\`\`

### flex Shorthand
\`\`\`css
.item {
    flex: 1;                    /* flex-grow: 1 */
    flex: 0 1 auto;            /* grow shrink basis */
    flex: 1 1 200px;           /* Common pattern */
}
\`\`\`

### align-self
\`\`\`css
.item {
    align-self: auto;        /* Default */
    align-self: flex-start;
    align-self: flex-end;
    align-self: center;
    align-self: stretch;
}
\`\`\`

### order
\`\`\`css
.item-1 { order: 2; }
.item-2 { order: 1; }
.item-3 { order: 3; }

/* Visual order: item-2, item-1, item-3 */
\`\`\`

## Practical Examples

### Centered Content
\`\`\`css
.container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
}
\`\`\`

### Navigation Bar
\`\`\`css
nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
}

nav ul {
    display: flex;
    gap: 2rem;
    list-style: none;
}
\`\`\`

### Card Grid
\`\`\`css
.card-container {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
}

.card {
    flex: 1 1 300px;  /* Minimum 300px, will grow */
    padding: 20px;
    border: 1px solid #ddd;
}
\`\`\`

### Holy Grail Layout
\`\`\`css
body {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

header, footer {
    flex-shrink: 0;
}

main {
    display: flex;
    flex: 1;
}

aside {
    flex: 0 0 250px;
}

article {
    flex: 1;
}
\`\`\`

### Responsive Gallery
\`\`\`css
.gallery {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    padding: 20px;
}

.gallery-item {
    flex: 1 1 calc(33.333% - 15px);
    min-width: 250px;
}

.gallery-item img {
    width: 100%;
    height: auto;
}
\`\`\`

Flexbox master করলে modern responsive layouts easily তৈরি করতে পারবেন!
`,
    topic: 'Web Development',
    tags: ['CSS', 'Flexbox', 'Layout', 'Responsive'],
    difficulty: 'intermediate',
    estimatedTime: 35,
    media: [
      {
        type: 'video',
        url: 'https://www.youtube.com/watch?v=JJSoEo8JSnc',
        title: 'Flexbox Tutorial Bangla',
        duration: 2100,
      },
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
    keyPoints: [
      'display: flex দিয়ে flex container তৈরি করা হয়',
      'justify-content main axis control করে',
      'align-items cross axis control করে',
      'flex-wrap দিয়ে multiple lines এ যাওয়া যায়',
    ],
    order: 10,
    isPublished: true,
    isPremium: false,
  },
  // Lesson 11: CSS Grid Layout
  {
    title: 'CSS Grid - 2D Layout System',
    description: 'CSS Grid ব্যবহার করে complex 2D layouts তৈরি করুন।',
    content: `# CSS Grid Layout

## Grid কি?

CSS Grid হলো একটি powerful 2D layout system। Flexbox 1-dimensional (row অথবা column), Grid 2-dimensional (row এবং column একসাথে)।

## Grid Container Setup

\`\`\`css
.container {
    display: grid;
}
\`\`\`

## Grid Template

### grid-template-columns
\`\`\`css
.container {
    display: grid;
    grid-template-columns: 200px 200px 200px;  /* 3 columns */
    grid-template-columns: 1fr 1fr 1fr;        /* Equal columns */
    grid-template-columns: 1fr 2fr 1fr;        /* Middle দ্বিগুণ */
    grid-template-columns: repeat(3, 1fr);     /* 3 equal columns */
    grid-template-columns: repeat(4, 250px);   /* 4 columns of 250px */
}
\`\`\`

### grid-template-rows
\`\`\`css
.container {
    grid-template-rows: 100px 200px 100px;
    grid-template-rows: repeat(3, 150px);
    grid-template-rows: auto 1fr auto;  /* Header, content, footer */
}
\`\`\`

### fr Unit (Fraction)
\`\`\`css
.container {
    grid-template-columns: 1fr 2fr 1fr;
    /* 25% 50% 25% approximately */
}
\`\`\`

### auto-fill vs auto-fit
\`\`\`css
/* auto-fill: Empty columns রাখবে */
.container {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}

/* auto-fit: Empty columns remove করবে */
.container {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}
\`\`\`

## Gaps (Spacing)

\`\`\`css
.container {
    gap: 20px;               /* All gaps */
    row-gap: 20px;           /* Vertical */
    column-gap: 30px;        /* Horizontal */
    grid-gap: 20px 30px;     /* Older syntax */
}
\`\`\`

## Placing Grid Items

### grid-column
\`\`\`css
.item {
    grid-column: 1 / 3;      /* Column 1 থেকে 3 পর্যন্ত */
    grid-column: 1 / span 2; /* 1 থেকে শুরু, 2 columns */
    grid-column: 1 / -1;     /* Full width */
}
\`\`\`

### grid-row
\`\`\`css
.item {
    grid-row: 1 / 3;         /* Row 1 to 3 */
    grid-row: 2 / span 2;    /* 2 থেকে 2 rows */
}
\`\`\`

### grid-area (Shorthand)
\`\`\`css
.item {
    grid-area: 1 / 1 / 3 / 3;
    /* row-start / col-start / row-end / col-end */
}
\`\`\`

## Alignment

### justify-items (Horizontal)
\`\`\`css
.container {
    justify-items: start;
    justify-items: end;
    justify-items: center;
    justify-items: stretch;  /* Default */
}
\`\`\`

### align-items (Vertical)
\`\`\`css
.container {
    align-items: start;
    align-items: end;
    align-items: center;
    align-items: stretch;    /* Default */
}
\`\`\`

### justify-content & align-content
\`\`\`css
.container {
    justify-content: start | end | center | stretch | space-around | space-between | space-evenly;
    align-content: start | end | center | stretch | space-around | space-between | space-evenly;
}
\`\`\`

## Named Grid Areas

\`\`\`css
.container {
    display: grid;
    grid-template-areas:
        "header header header"
        "sidebar content content"
        "footer footer footer";
    grid-template-columns: 200px 1fr 1fr;
    grid-template-rows: auto 1fr auto;
}

.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.content { grid-area: content; }
.footer  { grid-area: footer; }
\`\`\`

## Practical Examples

### Basic Blog Layout
\`\`\`css
.blog-layout {
    display: grid;
    grid-template-columns: 250px 1fr;
    grid-template-rows: auto 1fr auto;
    min-height: 100vh;
    gap: 20px;
}

.header {
    grid-column: 1 / -1;
}

.sidebar {
    grid-row: 2;
}

.content {
    grid-row: 2;
}

.footer {
    grid-column: 1 / -1;
}
\`\`\`

### Responsive Grid Gallery
\`\`\`css
.gallery {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    padding: 20px;
}

.gallery-item img {
    width: 100%;
    height: 200px;
    object-fit: cover;
}
\`\`\`

### Dashboard Layout
\`\`\`css
.dashboard {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(3, 200px);
    gap: 15px;
}

.card-large {
    grid-column: span 2;
    grid-row: span 2;
}

.card-wide {
    grid-column: span 2;
}

.card-tall {
    grid-row: span 2;
}
\`\`\`

### Magazine Layout
\`\`\`css
.magazine {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    grid-auto-rows: 200px;
    gap: 15px;
}

.feature-article {
    grid-column: span 4;
    grid-row: span 2;
}

.side-article {
    grid-column: span 2;
}

.small-article {
    grid-column: span 2;
}
\`\`\`

Grid হলো complex layouts এর জন্য perfect solution!
`,
    topic: 'Web Development',
    tags: ['CSS', 'Grid', 'Layout', '2D'],
    difficulty: 'intermediate',
    estimatedTime: 35,
    media: [
      {
        type: 'video',
        url: 'https://www.youtube.com/watch?v=EFafSYg-PkI',
        title: 'CSS Grid Tutorial',
        duration: 2100,
      },
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=800',
    keyPoints: [
      'Grid 2D layout system (rows এবং columns)',
      'fr unit দিয়ে flexible sizing',
      'grid-template-areas দিয়ে named layouts',
      'auto-fit/auto-fill responsive grids এর জন্য',
    ],
    order: 11,
    isPublished: true,
    isPremium: false,
  },
  // Lesson 12: Responsive Design
  {
    title: 'Responsive Web Design এবং Media Queries',
    description: 'সব device এ perfect দেখায় এমন responsive websites তৈরি করুন।',
    content: `# Responsive Web Design

## Responsive Design কি?

Responsive Web Design মানে হলো এমন website যা সব device এ (mobile, tablet, desktop) ভালো দেখায় এবং কাজ করে।

## Meta Viewport Tag

**প্রথমেই HTML এ এটি add করুন:**

\`\`\`html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
\`\`\`

এটি ছাড়া responsive design কাজ করবে না!

## Media Queries

### Basic Syntax

\`\`\`css
@media (max-width: 768px) {
    /* এই styles শুধু 768px বা তার নিচে apply হবে */
    .container {
        width: 100%;
    }
}
\`\`\`

### Common Breakpoints

\`\`\`css
/* Mobile First Approach (Recommended) */

/* Base styles (Mobile) */
body {
    font-size: 14px;
}

/* Tablet (768px and up) */
@media (min-width: 768px) {
    body {
        font-size: 16px;
    }
}

/* Desktop (1024px and up) */
@media (min-width: 1024px) {
    body {
        font-size: 18px;
    }
}

/* Large Desktop (1200px and up) */
@media (min-width: 1200px) {
    .container {
        max-width: 1140px;
    }
}
\`\`\`

### Standard Breakpoints

\`\`\`css
/* Extra Small (Mobile) */
@media (max-width: 575px) { }

/* Small (Mobile Landscape) */
@media (min-width: 576px) and (max-width: 767px) { }

/* Medium (Tablet) */
@media (min-width: 768px) and (max-width: 991px) { }

/* Large (Desktop) */
@media (min-width: 992px) and (max-width: 1199px) { }

/* Extra Large (Large Desktop) */
@media (min-width: 1200px) { }
\`\`\`

## Responsive Units

### Relative Units
\`\`\`css
/* em: Parent এর relative */
.child {
    font-size: 1.5em;  /* Parent এর 1.5x */
}

/* rem: Root (html) এর relative */
.element {
    font-size: 1.5rem;  /* 24px if root is 16px */
    padding: 2rem;      /* 32px */
}

/* Percentage */
.container {
    width: 80%;
    max-width: 1200px;
}

/* Viewport Units */
.hero {
    height: 100vh;      /* Full viewport height */
    width: 100vw;       /* Full viewport width */
}

.sidebar {
    width: 30vw;        /* 30% of viewport width */
}
\`\`\`

## Responsive Images

### Basic Responsive Image
\`\`\`css
img {
    max-width: 100%;
    height: auto;
}
\`\`\`

### Picture Element
\`\`\`html
<picture>
    <source media="(min-width: 1024px)" srcset="large.jpg">
    <source media="(min-width: 768px)" srcset="medium.jpg">
    <img src="small.jpg" alt="Responsive">
</picture>
\`\`\`

### object-fit
\`\`\`css
img {
    width: 100%;
    height: 300px;
    object-fit: cover;      /* Crop to fill */
    object-fit: contain;    /* Fit inside */
    object-fit: fill;       /* Stretch */
}
\`\`\`

## Responsive Typography

\`\`\`css
/* Fluid Typography */
html {
    font-size: 16px;
}

@media (min-width: 768px) {
    html {
        font-size: 18px;
    }
}

@media (min-width: 1024px) {
    html {
        font-size: 20px;
    }
}

/* Now use rem for all font sizes */
h1 {
    font-size: 2.5rem;  /* Automatically scales */
}

p {
    font-size: 1rem;
}
\`\`\`

### clamp() Function
\`\`\`css
h1 {
    font-size: clamp(1.5rem, 5vw, 3rem);
    /* min, preferred, max */
}
\`\`\`

## Flexbox Responsive

\`\`\`css
.container {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
}

.item {
    flex: 1 1 300px;  /* Minimum 300px, will wrap */
}

/* Mobile */
@media (max-width: 768px) {
    .container {
        flex-direction: column;
    }
    
    .item {
        flex: 1 1 100%;
    }
}
\`\`\`

## Grid Responsive

\`\`\`css
.grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
}

/* Automatically responsive! */

/* Manual control */
@media (max-width: 768px) {
    .grid {
        grid-template-columns: 1fr;
    }
}
\`\`\`

## Complete Responsive Example

\`\`\`css
/* Base Styles (Mobile First) */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: Arial, sans-serif;
    font-size: 16px;
    line-height: 1.6;
}

.container {
    width: 100%;
    padding: 0 15px;
    margin: 0 auto;
}

/* Header */
header {
    background: #333;
    color: white;
    padding: 1rem;
}

nav ul {
    display: flex;
    flex-direction: column;
    list-style: none;
    gap: 10px;
}

/* Main Content */
.content {
    padding: 20px 0;
}

.grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
}

.card {
    padding: 20px;
    border: 1px solid #ddd;
}

.card img {
    width: 100%;
    height: auto;
}

/* Tablet (768px and up) */
@media (min-width: 768px) {
    .container {
        max-width: 720px;
        padding: 0 20px;
    }
    
    nav ul {
        flex-direction: row;
        justify-content: space-between;
    }
    
    .grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

/* Desktop (1024px and up) */
@media (min-width: 1024px) {
    .container {
        max-width: 960px;
    }
    
    .grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

/* Large Desktop (1200px and up) */
@media (min-width: 1200px) {
    .container {
        max-width: 1140px;
    }
    
    .grid {
        grid-template-columns: repeat(4, 1fr);
    }
}

/* Print Styles */
@media print {
    nav, footer {
        display: none;
    }
    
    body {
        font-size: 12pt;
    }
}
\`\`\`

## Mobile First vs Desktop First

### Mobile First (Recommended)
\`\`\`css
/* Base: Mobile */
.element { width: 100%; }

/* Scale up */
@media (min-width: 768px) {
    .element { width: 50%; }
}
\`\`\`

### Desktop First
\`\`\`css
/* Base: Desktop */
.element { width: 50%; }

/* Scale down */
@media (max-width: 767px) {
    .element { width: 100%; }
}
\`\`\`

## Testing Responsive Design

1. **Browser DevTools**: F12 → Responsive mode
2. **Real devices**: Actual mobile/tablet testing
3. **Online tools**: BrowserStack, ResponsiveDesignChecker
4. **Chrome DevTools Device Toolbar**: Ctrl+Shift+M

Responsive design properly করলে সব users এর জন্য perfect experience তৈরি করতে পারবেন!
`,
    topic: 'Web Development',
    tags: ['CSS', 'Responsive', 'Media Queries', 'Mobile'],
    difficulty: 'intermediate',
    estimatedTime: 30,
    media: [
      {
        type: 'video',
        url: 'https://www.youtube.com/watch?v=srvUrASNj0s',
        title: 'Responsive Web Design Tutorial',
        duration: 1800,
      },
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
    keyPoints: [
      'Meta viewport tag অবশ্যই HTML এ add করতে হবে',
      'Media queries দিয়ে breakpoints define করা হয়',
      'Mobile-first approach recommended',
      'Relative units (rem, %, vw/vh) ব্যবহার করুন',
    ],
    order: 12,
    isPublished: true,
    isPremium: false,
  },
  // Lesson 13: CSS Transitions and Animations
  {
    title: 'CSS Transitions ও Animations',
    description: 'CSS দিয়ে smooth transitions এবং engaging animations তৈরি করুন।',
    content: `# CSS Transitions ও Animations

## CSS Transitions

Transitions দিয়ে property changes smooth করা যায়।

### Basic Transition
\`\`\`css
button {
    background-color: blue;
    transition: background-color 0.3s ease;
}

button:hover {
    background-color: red;
}
\`\`\`

### Transition Properties
\`\`\`css
.element {
    /* property | duration | timing-function | delay */
    transition: all 0.3s ease 0s;
    
    /* Multiple properties */
    transition: 
        background-color 0.3s ease,
        transform 0.5s ease-in-out,
        box-shadow 0.2s linear;
}
\`\`\`

### Timing Functions
\`\`\`css
transition-timing-function: ease;        /* Slow start & end */
transition-timing-function: linear;      /* Constant speed */
transition-timing-function: ease-in;     /* Slow start */
transition-timing-function: ease-out;    /* Slow end */
transition-timing-function: ease-in-out; /* Slow start & end */
transition-timing-function: cubic-bezier(0.1, 0.7, 1.0, 0.1);
\`\`\`

### Practical Examples
\`\`\`css
/* Button Hover */
.btn {
    padding: 10px 20px;
    background: #007bff;
    color: white;
    border: none;
    transition: all 0.3s ease;
}

.btn:hover {
    background: #0056b3;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

/* Card Hover */
.card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 16px rgba(0,0,0,0.2);
}

/* Link Underline */
a {
    position: relative;
    text-decoration: none;
}

a::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background: blue;
    transition: width 0.3s ease;
}

a:hover::after {
    width: 100%;
}
\`\`\`

## CSS Animations

Animations দিয়ে complex multi-step animations তৈরি করা যায়।

### Basic Animation
\`\`\`css
@keyframes slideIn {
    from {
        transform: translateX(-100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

.element {
    animation: slideIn 1s ease-out;
}
\`\`\`

### Animation Properties
\`\`\`css
.element {
    animation-name: slideIn;
    animation-duration: 1s;
    animation-timing-function: ease;
    animation-delay: 0.5s;
    animation-iteration-count: infinite;
    animation-direction: alternate;
    animation-fill-mode: forwards;
    animation-play-state: running;
    
    /* Shorthand */
    animation: slideIn 1s ease 0.5s infinite alternate forwards;
}
\`\`\`

### Keyframes with Percentages
\`\`\`css
@keyframes bounce {
    0% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-50px);
    }
    100% {
        transform: translateY(0);
    }
}

.ball {
    animation: bounce 1s ease-in-out infinite;
}
\`\`\`

## Popular Animation Examples

### Fade In
\`\`\`css
@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

.fade-in {
    animation: fadeIn 1s ease-in;
}
\`\`\`

### Slide Down
\`\`\`css
@keyframes slideDown {
    from {
        transform: translateY(-100%);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.dropdown {
    animation: slideDown 0.3s ease-out;
}
\`\`\`

### Pulse
\`\`\`css
@keyframes pulse {
    0%, 100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.1);
    }
}

.pulse {
    animation: pulse 2s ease-in-out infinite;
}
\`\`\`

### Spin (Loading)
\`\`\`css
@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

.loader {
    width: 50px;
    height: 50px;
    border: 5px solid #f3f3f3;
    border-top: 5px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}
\`\`\`

### Shake
\`\`\`css
@keyframes shake {
    0%, 100% {
        transform: translateX(0);
    }
    10%, 30%, 50%, 70%, 90% {
        transform: translateX(-10px);
    }
    20%, 40%, 60%, 80% {
        transform: translateX(10px);
    }
}

.shake {
    animation: shake 0.5s ease;
}
\`\`\`

### Glow Effect
\`\`\`css
@keyframes glow {
    0%, 100% {
        box-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #0073e6;
    }
    50% {
        box-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 30px #0073e6;
    }
}

.glow-button {
    animation: glow 2s ease-in-out infinite;
}
\`\`\`

## Transform Functions

\`\`\`css
/* Translate */
transform: translateX(50px);
transform: translateY(-20px);
transform: translate(50px, -20px);

/* Scale */
transform: scale(1.5);
transform: scaleX(2);
transform: scaleY(0.5);

/* Rotate */
transform: rotate(45deg);
transform: rotateX(45deg);
transform: rotateY(45deg);
transform: rotateZ(45deg);

/* Skew */
transform: skewX(20deg);
transform: skewY(10deg);

/* Multiple Transforms */
transform: translate(50px, 100px) rotate(45deg) scale(1.2);
\`\`\`

## Complete Interactive Button
\`\`\`css
.interactive-btn {
    position: relative;
    padding: 15px 30px;
    background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 50px;
    font-size: 18px;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.3s ease;
}

.interactive-btn::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
}

.interactive-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.interactive-btn:hover::before {
    width: 300px;
    height: 300px;
}

.interactive-btn:active {
    transform: translateY(-1px);
}
\`\`\`

Animations properly use করলে websites কে interactive এবং engaging করা যায়!
`,
    topic: 'Web Development',
    tags: ['CSS', 'Animations', 'Transitions', 'Effects'],
    difficulty: 'intermediate',
    estimatedTime: 30,
    media: [
      {
        type: 'video',
        url: 'https://www.youtube.com/watch?v=zHUpx90NerM',
        title: 'CSS Animations Tutorial',
        duration: 1800,
      },
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1550063873-ab792950096b?w=800',
    keyPoints: [
      'Transitions simple property changes এর জন্য',
      'Animations complex multi-step effects এর জন্য',
      '@keyframes দিয়ে animation steps define করা হয়',
      'Transform functions: translate, scale, rotate, skew',
    ],
    order: 13,
    isPublished: true,
    isPremium: false,
  },
  // Lesson 14: Modern CSS Features
  {
    title: 'Modern CSS Features - Variables, calc(), এবং আরও',
    description: 'CSS Variables, calc function, এবং modern CSS techniques শিখুন।',
    content: `# Modern CSS Features

## CSS Variables (Custom Properties)

### Defining Variables
\`\`\`css
:root {
    --primary-color: #007bff;
    --secondary-color: #6c757d;
    --font-size-base: 16px;
    --spacing-unit: 8px;
    --border-radius: 4px;
}
\`\`\`

### Using Variables
\`\`\`css
.button {
    background-color: var(--primary-color);
    font-size: var(--font-size-base);
    padding: calc(var(--spacing-unit) * 2);
    border-radius: var(--border-radius);
}

/* Fallback value */
.element {
    color: var(--text-color, #333);
}
\`\`\`

### Theme Switching
\`\`\`css
/* Light Theme */
:root {
    --bg-color: #ffffff;
    --text-color: #333333;
}

/* Dark Theme */
[data-theme="dark"] {
    --bg-color: #1a1a1a;
    --text-color: #f0f0f0;
}

body {
    background-color: var(--bg-color);
    color: var(--text-color);
    transition: all 0.3s ease;
}
\`\`\`

## calc() Function

\`\`\`css
/* Basic Math */
.element {
    width: calc(100% - 80px);
    height: calc(100vh - 60px);
    padding: calc(var(--spacing-unit) * 3);
}

/* Combining Units */
.sidebar {
    width: calc(25% - 20px);
    margin: calc(2rem + 10px);
}

/* Complex Calculations */
.grid-item {
    width: calc((100% / 3) - 20px);
}
\`\`\`

## clamp() Function

\`\`\`css
/* Responsive Font Size */
h1 {
    font-size: clamp(1.5rem, 5vw, 3rem);
    /* min, preferred, max */
}

/* Responsive Width */
.container {
    width: clamp(300px, 90%, 1200px);
}
\`\`\`

## min() and max() Functions

\`\`\`css
/* min() - smallest value */
.element {
    width: min(90%, 1200px);
    /* যেটা ছোট সেটা use হবে */
}

/* max() - largest value */
.element {
    width: max(50%, 400px);
    /* যেটা বড় সেটা use হবে */
}
\`\`\`

## CSS Filters

\`\`\`css
img {
    filter: blur(5px);
    filter: brightness(150%);
    filter: contrast(200%);
    filter: grayscale(100%);
    filter: hue-rotate(90deg);
    filter: invert(100%);
    filter: opacity(50%);
    filter: saturate(200%);
    filter: sepia(100%);
    
    /* Multiple filters */
    filter: brightness(110%) contrast(120%) saturate(130%);
}

/* Hover Effect */
img {
    filter: grayscale(100%);
    transition: filter 0.3s ease;
}

img:hover {
    filter: grayscale(0%);
}
\`\`\`

## CSS Backdrop Filter

\`\`\`css
.glass-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    padding: 20px;
}
\`\`\`

## CSS Gradients

### Linear Gradient
\`\`\`css
.element {
    background: linear-gradient(to right, #667eea, #764ba2);
    background: linear-gradient(45deg, #f093fb 0%, #f5576c 100%);
    background: linear-gradient(to bottom, #4facfe 0%, #00f2fe 100%);
}
\`\`\`

### Radial Gradient
\`\`\`css
.element {
    background: radial-gradient(circle, #667eea 0%, #764ba2 100%);
    background: radial-gradient(ellipse at center, #f093fb 0%, #f5576c 100%);
}
\`\`\`

### Conic Gradient
\`\`\`css
.pie-chart {
    background: conic-gradient(
        red 0deg 90deg,
        blue 90deg 180deg,
        green 180deg 360deg
    );
}
\`\`\`

## CSS Shapes

\`\`\`css
/* Circle */
.circle {
    width: 100px;
    height: 100px;
    border-radius: 50%;
}

/* Triangle */
.triangle {
    width: 0;
    height: 0;
    border-left: 50px solid transparent;
    border-right: 50px solid transparent;
    border-bottom: 100px solid #007bff;
}

/* Hexagon */
.hexagon {
    width: 100px;
    height: 57.74px;
    background: #007bff;
    position: relative;
}

.hexagon::before {
    content: "";
    position: absolute;
    top: -28.87px;
    left: 0;
    width: 0;
    height: 0;
    border-left: 50px solid transparent;
    border-right: 50px solid transparent;
    border-bottom: 28.87px solid #007bff;
}
\`\`\`

## aspect-ratio Property

\`\`\`css
.video-container {
    aspect-ratio: 16 / 9;
    width: 100%;
}

.square {
    aspect-ratio: 1 / 1;
    width: 200px;
}
\`\`\`

## Object-fit & Object-position

\`\`\`css
img {
    width: 300px;
    height: 200px;
    object-fit: cover;           /* Crop */
    object-fit: contain;         /* Fit */
    object-fit: fill;            /* Stretch */
    object-position: center;     /* Position */
    object-position: top right;
}
\`\`\`

## Scroll Behavior

\`\`\`css
html {
    scroll-behavior: smooth;
}

/* Now anchor links will scroll smoothly */
\`\`\`

## Scroll Snap

\`\`\`css
.scroll-container {
    scroll-snap-type: y mandatory;
    overflow-y: scroll;
    height: 100vh;
}

.section {
    scroll-snap-align: start;
    height: 100vh;
}
\`\`\`

## CSS Grid and Flexbox Gap

\`\`\`css
/* Flexbox Gap (Modern) */
.flex-container {
    display: flex;
    gap: 20px;
    row-gap: 20px;
    column-gap: 30px;
}

/* Grid Gap */
.grid-container {
    display: grid;
    gap: 20px;
}
\`\`\`

## Complete Modern Design System

\`\`\`css
:root {
    /* Colors */
    --primary-50: #e3f2fd;
    --primary-500: #2196f3;
    --primary-900: #0d47a1;
    
    /* Spacing */
    --space-1: 0.25rem;
    --space-2: 0.5rem;
    --space-3: 0.75rem;
    --space-4: 1rem;
    --space-6: 1.5rem;
    --space-8: 2rem;
    
    /* Typography */
    --font-sans: system-ui, -apple-system, sans-serif;
    --font-mono: 'Courier New', monospace;
    
    /* Border Radius */
    --radius-sm: 0.25rem;
    --radius-md: 0.5rem;
    --radius-lg: 1rem;
    --radius-full: 9999px;
    
    /* Shadows */
    --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}

/* Utility Classes */
.container {
    width: min(90%, 1200px);
    margin-inline: auto;
    padding-inline: var(--space-4);
}

.card {
    background: white;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    padding: var(--space-6);
}

.btn {
    padding: var(--space-3) var(--space-6);
    background: var(--primary-500);
    color: white;
    border: none;
    border-radius: var(--radius-full);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn:hover {
    background: var(--primary-900);
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}
\`\`\`

Modern CSS features use করলে cleaner, maintainable এবং powerful stylesheets লিখতে পারবেন!
`,
    topic: 'Web Development',
    tags: ['CSS', 'Modern', 'Variables', 'Advanced'],
    difficulty: 'intermediate',
    estimatedTime: 25,
    media: [
      {
        type: 'video',
        url: 'https://www.youtube.com/watch?v=WyxzAU3p8CE',
        title: 'Modern CSS Features',
        duration: 1500,
      },
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800',
    keyPoints: [
      'CSS Variables দিয়ে reusable values তৈরি করা যায়',
      'calc() function dynamic calculations এর জন্য',
      'clamp() responsive values এর জন্য perfect',
      'Filters এবং backdrop-filter visual effects এর জন্য',
    ],
    order: 14,
    isPublished: true,
    isPremium: false,
  },
  // Lesson 15: Final Project
  {
    title: 'Final Project - Complete Portfolio Website',
    description: 'HTML এবং CSS দিয়ে একটি সম্পূর্ণ professional portfolio website তৈরি করুন।',
    content: `# Final Project - Portfolio Website

## Project Overview

এই final project এ আমরা একটি complete responsive portfolio website তৈরি করবো যেখানে সব শেখা concepts apply করবো:

- Semantic HTML5
- CSS Grid এবং Flexbox
- Responsive Design
- Animations এবং Transitions
- Modern CSS Features

## Project Structure

\`\`\`
portfolio/
│
├── index.html
├── css/
│   └── style.css
├── images/
│   ├── profile.jpg
│   ├── project1.jpg
│   ├── project2.jpg
│   └── project3.jpg
└── js/
    └── script.js (optional)
\`\`\`

## HTML Structure

\`\`\`html
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="আমার Professional Portfolio">
    <title>আমার Portfolio - Web Developer</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <!-- Navigation -->
    <header class="header">
        <nav class="navbar">
            <div class="container">
                <a href="#" class="logo">MyPortfolio</a>
                <ul class="nav-menu">
                    <li><a href="#home">হোম</a></li>
                    <li><a href="#about">পরিচিতি</a></li>
                    <li><a href="#skills">দক্ষতা</a></li>
                    <li><a href="#projects">প্রজেক্টস</a></li>
                    <li><a href="#contact">যোগাযোগ</a></li>
                </ul>
            </div>
        </nav>
    </header>

    <!-- Hero Section -->
    <section id="home" class="hero">
        <div class="container">
            <div class="hero-content">
                <h1 class="hero-title">হ্যালো, আমি <span>আপনার নাম</span></h1>
                <p class="hero-subtitle">Web Developer & Designer</p>
                <p class="hero-description">
                    আমি HTML, CSS, JavaScript দিয়ে beautiful এবং responsive websites তৈরি করি।
                </p>
                <div class="hero-buttons">
                    <a href="#projects" class="btn btn-primary">আমার কাজ দেখুন</a>
                    <a href="#contact" class="btn btn-secondary">যোগাযোগ করুন</a>
                </div>
            </div>
        </div>
    </section>

    <!-- About Section -->
    <section id="about" class="about">
        <div class="container">
            <h2 class="section-title">আমার সম্পর্কে</h2>
            <div class="about-content">
                <div class="about-image">
                    <img src="images/profile.jpg" alt="Profile">
                </div>
                <div class="about-text">
                    <h3>আমি একজন Web Developer</h3>
                    <p>
                        আমি web development এ passionate এবং নতুন technologies শিখতে ভালোবাসি।
                        আমার goal হলো user-friendly এবং visually appealing websites তৈরি করা।
                    </p>
                    <div class="about-info">
                        <div class="info-item">
                            <strong>নাম:</strong>
                            <span>আপনার নাম</span>
                        </div>
                        <div class="info-item">
                            <strong>অবস্থান:</strong>
                            <span>ঢাকা, বাংলাদেশ</span>
                        </div>
                        <div class="info-item">
                            <strong>ইমেইল:</strong>
                            <span>email@example.com</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Skills Section -->
    <section id="skills" class="skills">
        <div class="container">
            <h2 class="section-title">আমার দক্ষতা</h2>
            <div class="skills-grid">
                <div class="skill-card">
                    <div class="skill-icon">🌐</div>
                    <h3>HTML5</h3>
                    <div class="progress-bar">
                        <div class="progress" style="width: 90%;"></div>
                    </div>
                    <span class="percentage">90%</span>
                </div>
                
                <div class="skill-card">
                    <div class="skill-icon">🎨</div>
                    <h3>CSS3</h3>
                    <div class="progress-bar">
                        <div class="progress" style="width: 85%;"></div>
                    </div>
                    <span class="percentage">85%</span>
                </div>
                
                <div class="skill-card">
                    <div class="skill-icon">⚡</div>
                    <h3>JavaScript</h3>
                    <div class="progress-bar">
                        <div class="progress" style="width: 75%;"></div>
                    </div>
                    <span class="percentage">75%</span>
                </div>
                
                <div class="skill-card">
                    <div class="skill-icon">📱</div>
                    <h3>Responsive Design</h3>
                    <div class="progress-bar">
                        <div class="progress" style="width: 88%;"></div>
                    </div>
                    <span class="percentage">88%</span>
                </div>
            </div>
        </div>
    </section>

    <!-- Projects Section -->
    <section id="projects" class="projects">
        <div class="container">
            <h2 class="section-title">আমার প্রজেক্টস</h2>
            <div class="projects-grid">
                <article class="project-card">
                    <img src="images/project1.jpg" alt="Project 1">
                    <div class="project-info">
                        <h3>E-commerce Website</h3>
                        <p>HTML, CSS, JavaScript দিয়ে তৈরি একটি modern e-commerce site।</p>
                        <div class="project-links">
                            <a href="#" class="btn-small">Live Demo</a>
                            <a href="#" class="btn-small">Code</a>
                        </div>
                    </div>
                </article>
                
                <article class="project-card">
                    <img src="images/project2.jpg" alt="Project 2">
                    <div class="project-info">
                        <h3>Portfolio Template</h3>
                        <p>Responsive portfolio template Flexbox এবং Grid দিয়ে।</p>
                        <div class="project-links">
                            <a href="#" class="btn-small">Live Demo</a>
                            <a href="#" class="btn-small">Code</a>
                        </div>
                    </div>
                </article>
                
                <article class="project-card">
                    <img src="images/project3.jpg" alt="Project 3">
                    <div class="project-info">
                        <h3>Landing Page</h3>
                        <p>Modern animations সহ beautiful landing page।</p>
                        <div class="project-links">
                            <a href="#" class="btn-small">Live Demo</a>
                            <a href="#" class="btn-small">Code</a>
                        </div>
                    </div>
                </article>
            </div>
        </div>
    </section>

    <!-- Contact Section -->
    <section id="contact" class="contact">
        <div class="container">
            <h2 class="section-title">যোগাযোগ করুন</h2>
            <form class="contact-form">
                <div class="form-group">
                    <input type="text" placeholder="আপনার নাম" required>
                </div>
                <div class="form-group">
                    <input type="email" placeholder="ইমেইল" required>
                </div>
                <div class="form-group">
                    <textarea rows="5" placeholder="আপনার বার্তা" required></textarea>
                </div>
                <button type="submit" class="btn btn-primary">পাঠান</button>
            </form>
            
            <div class="social-links">
                <a href="#">GitHub</a>
                <a href="#">LinkedIn</a>
                <a href="#">Twitter</a>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <p>&copy; 2025 আপনার নাম। সর্বস্বত্ব সংরক্ষিত।</p>
        </div>
    </footer>
</body>
</html>
\`\`\`

## CSS Highlights (Main Features)

\`\`\`css
:root {
    --primary: #667eea;
    --secondary: #764ba2;
    --dark: #2c3e50;
    --light: #f8f9fa;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html {
    scroll-behavior: smooth;
}

body {
    font-family: 'Segoe UI', system-ui, sans-serif;
    line-height: 1.6;
    color: var(--dark);
}

/* Responsive Container */
.container {
    width: min(90%, 1200px);
    margin-inline: auto;
    padding-inline: 1rem;
}

/* Hero Section with Gradient */
.hero {
    min-height: 100vh;
    display: flex;
    align-items: center;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    color: white;
}

/* Grid Layout for Projects */
.projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}

/* Card Hover Effects */
.project-card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.project-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

/* Responsive Navigation */
@media (max-width: 768px) {
    .nav-menu {
        flex-direction: column;
    }
    
    .projects-grid {
        grid-template-columns: 1fr;
    }
}
\`\`\`

## Key Features Implemented

1. ✅ Semantic HTML5 elements
2. ✅ CSS Variables for theming
3. ✅ Flexbox for navigation
4. ✅ CSS Grid for layouts
5. ✅ Responsive design with media queries
6. ✅ Smooth scroll behavior
7. ✅ Hover animations
8. ✅ Modern gradients
9. ✅ Form styling
10. ✅ Mobile-first approach

## Customization Tips

1. **Colors**: Change CSS variables in :root
2. **Fonts**: Import Google Fonts
3. **Images**: Replace with your own
4. **Content**: Update text with your information
5. **Sections**: Add or remove as needed

## Next Steps

এই project complete করার পর:
- GitHub এ upload করুন
- GitHub Pages এ host করুন
- Resume/CV তে link দিন
- Social media তে share করুন

🎉 Congratulations! আপনি HTML & CSS complete করেছেন!
`,
    topic: 'Web Development',
    tags: ['HTML', 'CSS', 'Project', 'Portfolio'],
    difficulty: 'beginner',
    estimatedTime: 60,
    media: [
      {
        type: 'video',
        url: 'https://www.youtube.com/watch?v=ZFQkb26UD1Y',
        title: 'Portfolio Website Tutorial',
        duration: 3600,
      },
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
    keyPoints: [
      'সব শেখা concepts একসাথে apply করা হয়েছে',
      'Semantic HTML structure ব্যবহার করা হয়েছে',
      'Fully responsive design',
      'Professional portfolio ready to deploy',
    ],
    order: 15,
    isPublished: true,
    isPremium: false,
  },
];

// Quizzes Data
const quizzesData = [
  // Quiz 1: HTML Introduction
  {
    title: 'HTML পরিচিতি কুইজ',
    description: 'HTML এর basics সম্পর্কে আপনার জ্ঞান পরীক্ষা করুন।',
    topic: 'Web Development',
    difficulty: 'beginner',
    lessonOrder: 1,
    timeLimit: 10,
    passingScore: 70,
    questions: [
      {
        type: 'mcq',
        question: 'HTML এর full form কি?',
        options: [
          'Hyper Text Markup Language',
          'High Text Machine Language',
          'Hyper Transfer Markup Language',
          'Home Tool Markup Language',
        ],
        correctAnswer: 'Hyper Text Markup Language',
        explanation: 'HTML এর পূর্ণরূপ হলো HyperText Markup Language যা web pages তৈরির ভিত্তি।',
        points: 1,
      },
      {
        type: 'true-false',
        question: 'HTML একটি programming language।',
        options: ['True', 'False'],
        correctAnswer: 'False',
        explanation: 'HTML একটি markup language, programming language নয়। এটি structure define করে।',
        points: 1,
      },
      {
        type: 'mcq',
        question: 'HTML5 কোন সালে release হয়?',
        options: ['2010', '2012', '2014', '2016'],
        correctAnswer: '2014',
        explanation: 'HTML5 officially 2014 সালে W3C recommendation হিসেবে release হয়।',
        points: 1,
      },
      {
        type: 'mcq',
        question: 'Web development এর তিনটি core technology কি?',
        options: [
          'HTML, CSS, JavaScript',
          'HTML, PHP, MySQL',
          'CSS, Python, Ruby',
          'JavaScript, Java, C++',
        ],
        correctAnswer: 'HTML, CSS, JavaScript',
        explanation: 'HTML (structure), CSS (styling), এবং JavaScript (functionality) web এর core technologies।',
        points: 1,
      },
      {
        type: 'mcq',
        question: 'HTML এর কোন version এ semantic elements যুক্ত হয়?',
        options: ['HTML 4.01', 'HTML5', 'HTML 3.2', 'XHTML'],
        correctAnswer: 'HTML5',
        explanation: 'HTML5 এ <header>, <nav>, <article> এর মতো semantic elements যুক্ত হয়েছে।',
        points: 1,
      },
    ],
  },
  // Quiz 2: HTML Document Structure
  {
    title: 'HTML Document Structure কুইজ',
    description: 'HTML document এর structure সম্পর্কে কুইজ।',
    topic: 'Web Development',
    difficulty: 'beginner',
    lessonOrder: 2,
    timeLimit: 10,
    passingScore: 70,
    questions: [
      {
        type: 'mcq',
        question: 'DOCTYPE declaration কেন ব্যবহার করা হয়?',
        options: [
          'Browser কে বলার জন্য এটি HTML5 document',
          'Page এর title set করার জন্য',
          'CSS link করার জন্য',
          'JavaScript add করার জন্য',
        ],
        correctAnswer: 'Browser কে বলার জন্য এটি HTML5 document',
        explanation: '<!DOCTYPE html> browser কে inform করে যে এটি HTML5 document।',
        points: 1,
      },
      {
        type: 'mcq',
        question: '<head> section এ কি থাকে?',
        options: [
          'Page এর content',
          'Meta information এবং title',
          'Images এবং videos',
          'Forms এবং buttons',
        ],
        correctAnswer: 'Meta information এবং title',
        explanation: '<head> এ meta tags, title, CSS links, এবং অন্যান্য meta information থাকে।',
        points: 1,
      },
      {
        type: 'true-false',
        question: 'UTF-8 charset সব language support করে।',
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: 'UTF-8 একটি universal character encoding যা বাংলা, English সহ সব language support করে।',
        points: 1,
      },
      {
        type: 'mcq',
        question: 'Viewport meta tag কেন important?',
        options: [
          'SEO এর জন্য',
          'Responsive design এর জন্য',
          'Fast loading এর জন্য',
          'Security এর জন্য',
        ],
        correctAnswer: 'Responsive design এর জন্য',
        explanation: 'Viewport meta tag mobile devices এ সঠিকভাবে page display করার জন্য essential।',
        points: 1,
      },
      {
        type: 'mcq',
        question: 'HTML comment কিভাবে লিখতে হয়?',
        options: [
          '// This is comment',
          '/* This is comment */',
          '<!-- This is comment -->',
          '# This is comment',
        ],
        correctAnswer: '<!-- This is comment -->',
        explanation: 'HTML এ comment লিখতে <!-- --> ব্যবহার করা হয়।',
        points: 1,
      },
    ],
  },
  // Quiz 3: HTML Elements
  {
    title: 'HTML Elements ও Tags কুইজ',
    description: 'HTML elements এবং tags সম্পর্কে কুইজ।',
    topic: 'Web Development',
    difficulty: 'beginner',
    lessonOrder: 3,
    timeLimit: 12,
    passingScore: 70,
    questions: [
      {
        type: 'mcq',
        question: 'একটি page এ কয়টি <h1> tag থাকা উচিত?',
        options: ['1টি', '2টি', '3টি', 'যত ইচ্ছা'],
        correctAnswer: '1টি',
        explanation: 'SEO এবং accessibility এর জন্য একটি page এ শুধু একটি <h1> থাকা উচিত।',
        points: 1,
      },
      {
        type: 'mcq',
        question: '<strong> এবং <b> এর মধ্যে পার্থক্য কি?',
        options: [
          'কোন পার্থক্য নেই',
          '<strong> semantic importance দেয়, <b> শুধু bold করে',
          '<b> বড় করে, <strong> ছোট করে',
          '<strong> italic করে',
        ],
        correctAnswer: '<strong> semantic importance দেয়, <b> শুধু bold করে',
        explanation: '<strong> semantic meaning দেয় যে text important, <b> শুধু visual bold effect।',
        points: 1,
      },
      {
        type: 'mcq',
        question: 'Image tag এ কোন attribute অবশ্যই থাকতে হবে?',
        options: ['src', 'alt', 'width', 'height'],
        correctAnswer: 'alt',
        explanation: 'alt attribute accessibility এর জন্য অত্যন্ত জরুরী এবং SEO তে সাহায্য করে।',
        points: 1,
      },
      {
        type: 'true-false',
        question: 'Ordered list এ <ol> tag ব্যবহার করা হয়।',
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: '<ol> ordered list (numbered) এবং <ul> unordered list (bullets) এর জন্য।',
        points: 1,
      },
      {
        type: 'mcq',
        question: 'New tab এ link open করতে কোন attribute ব্যবহার করতে হয়?',
        options: [
          'target="_blank"',
          'open="new"',
          'newtab="true"',
          'window="new"',
        ],
        correctAnswer: 'target="_blank"',
        explanation: 'target="_blank" attribute new tab এ link open করে।',
        points: 1,
      },
    ],
  },
  // Quiz 4: HTML Forms
  {
    title: 'HTML Forms কুইজ',
    description: 'HTML forms এবং input fields সম্পর্কে কুইজ।',
    topic: 'Web Development',
    difficulty: 'beginner',
    lessonOrder: 4,
    timeLimit: 12,
    passingScore: 70,
    questions: [
      {
        type: 'mcq',
        question: 'Form এর method attribute এর values কি কি?',
        options: [
          'GET এবং POST',
          'SEND এবং RECEIVE',
          'PUT এবং DELETE',
          'SUBMIT এবং RESET',
        ],
        correctAnswer: 'GET এবং POST',
        explanation: 'Form method হতে পারে GET (URL এ data) অথবা POST (body তে data)।',
        points: 1,
      },
      {
        type: 'mcq',
        question: 'Radio buttons এবং checkboxes এর মধ্যে পার্থক্য কি?',
        options: [
          'Radio তে একটি, checkbox এ একাধিক select করা যায়',
          'কোন পার্থক্য নেই',
          'Radio বড়, checkbox ছোট',
          'Radio square, checkbox round',
        ],
        correctAnswer: 'Radio তে একটি, checkbox এ একাধিক select করা যায়',
        explanation: 'Radio buttons group এ একটি মাত্র option, checkbox এ multiple select করা যায়।',
        points: 1,
      },
      {
        type: 'true-false',
        question: 'Required attribute দিয়ে form validation করা যায়।',
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: 'HTML5 required attribute built-in validation provide করে।',
        points: 1,
      },
      {
        type: 'mcq',
        question: 'Email input validation এর জন্য কোন input type ব্যবহার করবেন?',
        options: [
          'type="email"',
          'type="text"',
          'type="mail"',
          'type="address"',
        ],
        correctAnswer: 'type="email"',
        explanation: 'type="email" automatic email format validation করে।',
        points: 1,
      },
      {
        type: 'mcq',
        question: '<textarea> এর rows attribute কি define করে?',
        options: [
          'Visible rows সংখ্যা',
          'Maximum characters',
          'Width',
          'Border size',
        ],
        correctAnswer: 'Visible rows সংখ্যা',
        explanation: 'rows attribute textarea এর visible line/row সংখ্যা set করে।',
        points: 1,
      },
    ],
  },
  // Quiz 5: Semantic HTML
  {
    title: 'Semantic HTML5 কুইজ',
    description: 'Semantic HTML elements সম্পর্কে কুইজ।',
    topic: 'Web Development',
    difficulty: 'beginner',
    lessonOrder: 5,
    timeLimit: 10,
    passingScore: 70,
    questions: [
      {
        type: 'true-false',
        question: 'Semantic HTML SEO improve করতে সাহায্য করে।',
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: 'Semantic elements search engines কে content better বুঝতে সাহায্য করে।',
        points: 1,
      },
      {
        type: 'mcq',
        question: 'একটি page এ কয়টি <main> element থাকা উচিত?',
        options: ['1টি', '2টি', '3টি', 'যত ইচ্ছা'],
        correctAnswer: '1টি',
        explanation: '<main> element প্রতি page এ শুধু একবার ব্যবহার করা উচিত।',
        points: 1,
      },
      {
        type: 'mcq',
        question: '<article> element কখন ব্যবহার করবেন?',
        options: [
          'Self-contained content এর জন্য',
          'Navigation menu এর জন্য',
          'Footer এর জন্য',
          'Sidebar এর জন্য',
        ],
        correctAnswer: 'Self-contained content এর জন্য',
        explanation: '<article> independently distributable content এর জন্য (blog posts, news articles)।',
        points: 1,
      },
      {
        type: 'mcq',
        question: '<aside> element সাধারণত কোথায় ব্যবহার হয়?',
        options: [
          'Sidebar এবং related content',
          'Main heading',
          'Navigation',
          'Footer',
        ],
        correctAnswer: 'Sidebar এবং related content',
        explanation: '<aside> main content থেকে আলাদা tangential content এর জন্য।',
        points: 1,
      },
      {
        type: 'true-false',
        question: '<div> একটি semantic element।',
        options: ['True', 'False'],
        correctAnswer: 'False',
        explanation: '<div> একটি non-semantic element। এটার meaning নেই।',
        points: 1,
      },
    ],
  },
];

// Main seeding function
const seedHTMLCSSLessons = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/microlearning-db');
    console.log('📦 Connected to MongoDB\n');

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      console.error(`❌ Course with ID ${courseId} not found!`);
      process.exit(1);
    }

    console.log(`📚 Course found: ${course.title}`);
    console.log(`👨‍🏫 Author ID: ${authorId}\n`);
    console.log('🚀 Starting to create lessons and quizzes...\n');
    console.log('='.repeat(60));

    // Delete existing lessons and quizzes for this course
    const existingLessons = await Lesson.find({ course: courseId });
    const lessonIds = existingLessons.map(l => l._id);
    
    if (lessonIds.length > 0) {
      await Quiz.deleteMany({ lesson: { $in: lessonIds } });
      await Lesson.deleteMany({ course: courseId });
      console.log(`🗑️  Deleted ${existingLessons.length} existing lessons\n`);
    }

    const createdLessons: any[] = [];
    const createdQuizzes: any[] = [];

    // Create lessons
    for (const lessonData of lessonsData) {
      const lesson = await Lesson.create({
        ...lessonData,
        course: courseId,
        author: authorId,
      });

      createdLessons.push(lesson);
      console.log(`✅ Lesson ${lesson.order}: ${lesson.title}`);
      console.log(`   ⏱️  Duration: ${lesson.estimatedTime} minutes`);
      console.log(`   📊 Difficulty: ${lesson.difficulty}`);
      console.log(`   ${lesson.isPremium ? '💰 Premium' : '🆓 Free'}`);

      // Create quiz for this lesson
      const quizData = quizzesData.find(q => q.lessonOrder === lesson.order);
      if (quizData) {
        const quiz = await Quiz.create({
          ...quizData,
          lesson: lesson._id,
          course: courseId,
          author: authorId,
          isPublished: true,
          isPremium: lesson.isPremium,
        });

        createdQuizzes.push(quiz);
        console.log(`   📋 Quiz: ${quiz.title} (${quiz.questions.length} questions)\n`);
      } else {
        console.log(`   ⚠️  No quiz found for lesson ${lesson.order}\n`);
      }
    }

    // Update course with lessons
    const courseLessons = createdLessons.map((lesson, index) => ({
      lesson: lesson._id,
      order: index + 1,
      isOptional: false,
    }));

    await Course.findByIdAndUpdate(courseId, {
      lessons: courseLessons,
      estimatedDuration: createdLessons.reduce((sum, l) => sum + l.estimatedTime, 0),
    });

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✨ Course Content Creation Summary');
    console.log('='.repeat(60));
    console.log(`📚 Course: ${course.title}`);
    console.log(`📝 Total Lessons: ${createdLessons.length}`);
    console.log(`📋 Total Quizzes: ${createdQuizzes.length}`);
    console.log(`⏱️  Total Duration: ${createdLessons.reduce((sum, l) => sum + l.estimatedTime, 0)} minutes`);
    console.log(`🆓 Free Lessons: ${createdLessons.filter(l => !l.isPremium).length}`);
    console.log(`💰 Premium Lessons: ${createdLessons.filter(l => l.isPremium).length}`);

    console.log('\n📝 Lessons Created:');
    createdLessons.forEach(lesson => {
      const quiz = createdQuizzes.find(q => q.lesson.toString() === lesson._id.toString());
      console.log(`   ${lesson.order}. ${lesson.title} (${lesson.estimatedTime}min)`);
      console.log(`      ${lesson.isPremium ? '💰 Premium' : '🆓 Free'} | ${lesson.difficulty}`);
      if (quiz) {
        console.log(`      📋 Quiz: ${quiz.questions.length} questions, ${quiz.timeLimit}min`);
      }
    });

    console.log('\n✅ All lessons and quizzes created successfully!');
    console.log('🎉 HTML & CSS Course is now ready with complete content!\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedHTMLCSSLessons();
