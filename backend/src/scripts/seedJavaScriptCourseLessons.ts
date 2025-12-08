import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Course } from '../app/modules/course/course.model';
import Lesson from '../app/modules/microLessons/lesson.model';
import { Quiz } from '../app/modules/quiz/quiz.model';

dotenv.config();

const courseId = '6936da50d8c40e708b2fc482';
const authorId = '6936d94f56aed05b85859e21';

// JavaScript Course Lessons with proper content
const lessonsData = [
  {
    title: 'JavaScript কি এবং কেন শিখবেন?',
    description: 'JavaScript এর পরিচিতি, ইতিহাস এবং আধুনিক web development এ এর গুরুত্ব সম্পর্কে জানুন।',
    content: `# JavaScript কি এবং কেন শিখবেন?

## JavaScript কি?

JavaScript হলো একটি high-level, interpreted programming language যা web pages কে interactive এবং dynamic করে তোলে। এটি web এর তিনটি core technology এর একটি (HTML, CSS, JavaScript)।

## JavaScript এর বৈশিষ্ট্য

- **Client-side Scripting**: Browser এ execute হয়
- **Lightweight**: দ্রুত এবং efficient
- **Dynamic Typing**: Variable এর type runtime এ determine হয়
- **Object-oriented**: Object-based programming support করে
- **Functional Programming**: First-class functions support করে

## কেন JavaScript শিখবেন?

1. **সবচেয়ে জনপ্রিয়**: বিশ্বের সবচেয়ে জনপ্রিয় programming language
2. **Full-stack Development**: Frontend এবং Backend দুটোতেই ব্যবহার করা যায়
3. **চাকরির সুযোগ**: বিপুল পরিমাণ job opportunity
4. **বড় Community**: বিশাল community এবং resources
5. **সহজ শুরু**: নতুনদের জন্য easy to learn

## JavaScript এর ব্যবহার

- Web Applications
- Mobile Apps (React Native, Ionic)
- Desktop Applications (Electron)
- Server-side Development (Node.js)
- Game Development
- IoT এবং আরও অনেক কিছু

## কোথায় চলে?

JavaScript মূলত browser এ চলে কিন্তু Node.js দিয়ে server এও চলে।

**Popular Browsers**: Chrome, Firefox, Safari, Edge - সব browser এই JavaScript support করে।
`,
    topic: 'JavaScript',
    tags: ['Introduction', 'Basics', 'Getting Started'],
    difficulty: 'beginner',
    estimatedTime: 15,
    media: [
      {
        type: 'video',
        url: 'https://www.youtube.com/watch?v=W6NZfCO5SIk',
        title: 'JavaScript Introduction',
        duration: 900,
      },
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800',
    keyPoints: [
      'JavaScript একটি client-side scripting language',
      'Full-stack development এর জন্য ব্যবহার হয়',
      'সবচেয়ে জনপ্রিয় programming language',
      'Browser এবং Server দুটোতেই চলে',
    ],
    order: 1,
    isPublished: true,
    isPremium: false,
  },
  {
    title: 'JavaScript Setup ও প্রথম প্রোগ্রাম',
    description: 'Development environment setup করুন এবং আপনার প্রথম JavaScript program লিখুন।',
    content: `# JavaScript Setup ও প্রথম প্রোগ্রাম

## Development Environment Setup

### 1. Browser
যেকোনো modern browser যেমন:
- Google Chrome (Recommended)
- Mozilla Firefox
- Microsoft Edge

### 2. Text Editor / IDE
- **VS Code** (Highly Recommended)
- Sublime Text
- Atom
- WebStorm

### 3. VS Code Extensions
- JavaScript (ES6) code snippets
- ESLint
- Prettier
- Live Server

## Browser Console

প্রতিটি browser এ developer console আছে যেখানে JavaScript code লিখতে এবং test করতে পারবেন।

**Chrome এ Console খুলতে**:
- Windows: \`Ctrl + Shift + J\`
- Mac: \`Cmd + Option + J\`

## প্রথম JavaScript Program

### Console এ লিখুন:
\`\`\`javascript
console.log("Hello, JavaScript!");
\`\`\`

### HTML File এ JavaScript
\`\`\`html
<!DOCTYPE html>
<html>
<head>
  <title>My First JS Program</title>
</head>
<body>
  <h1>JavaScript Demo</h1>
  
  <script>
    console.log("Hello from JavaScript!");
    alert("Welcome to JavaScript!");
    
    // Display on webpage
    document.write("Hello, World!");
  </script>
</body>
</html>
\`\`\`

### External JavaScript File
\`\`\`html
<!-- index.html -->
<!DOCTYPE html>
<html>
<head>
  <title>External JS</title>
</head>
<body>
  <h1>My Page</h1>
  <script src="script.js"></script>
</body>
</html>
\`\`\`

\`\`\`javascript
// script.js
console.log("Hello from external file!");
\`\`\`

## JavaScript কোথায় লিখবেন?

1. **<head> section এ**: Page load হওয়ার আগে execute হয়
2. **<body> এর শেষে**: Content load হওয়ার পরে execute হয় (Recommended)
3. **External file এ**: Best practice

## Comments

\`\`\`javascript
// Single line comment

/* 
  Multi-line
  comment
*/
\`\`\`

## Practice Exercise

একটি HTML file তৈরি করুন এবং:
1. Console এ আপনার নাম print করুন
2. Alert দিয়ে একটি message দেখান
3. Webpage এ একটি text display করুন
`,
    topic: 'JavaScript',
    tags: ['Setup', 'Environment', 'Hello World', 'Getting Started'],
    difficulty: 'beginner',
    estimatedTime: 20,
    media: [
      {
        type: 'video',
        url: 'https://www.youtube.com/watch?v=UPmBOBosP0g',
        title: 'JavaScript Setup Guide',
        duration: 1200,
      },
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800',
    keyPoints: [
      'VS Code হলো best editor JavaScript এর জন্য',
      'Browser console দিয়ে quick test করা যায়',
      'External JS file ব্যবহার করা best practice',
      'Script tag body এর শেষে রাখা উচিত',
    ],
    order: 2,
    isPublished: true,
    isPremium: false,
  },
  {
    title: 'Variables এবং Data Types',
    description: 'JavaScript এর variables (var, let, const) এবং বিভিন্ন data types সম্পর্কে বিস্তারিত জানুন।',
    content: `# Variables এবং Data Types

## Variables কি?

Variable হলো data store করার container। এটি memory তে একটি নাম দেয়া location।

## Variable Declaration

### var (Old way - এখন avoid করা উচিত)
\`\`\`javascript
var name = "Arif";
var age = 25;
\`\`\`

### let (Modern - value change করা যায়)
\`\`\`javascript
let name = "Arif";
name = "Karim"; // ✅ Works
let age = 25;
age = 26; // ✅ Works
\`\`\`

### const (Modern - value change করা যায় না)
\`\`\`javascript
const name = "Arif";
name = "Karim"; // ❌ Error!

const age = 25;
age = 26; // ❌ Error!

const PI = 3.1416; // ✅ Perfect for constants
\`\`\`

## Naming Rules

✅ **Valid Names**:
\`\`\`javascript
let userName = "Arif";
let user_name = "Arif";
let userName2 = "Arif";
let $price = 100;
let _id = 123;
\`\`\`

❌ **Invalid Names**:
\`\`\`javascript
let 2user = "Arif";      // Can't start with number
let user-name = "Arif";   // No hyphens
let let = "Arif";         // Can't use keywords
\`\`\`

## Data Types

JavaScript এ দুই ধরনের data types আছে:

### 1. Primitive Types

#### String (Text)
\`\`\`javascript
let name = "Ariful Islam";
let message = 'Hello World';
let greeting = \`Welcome \${name}\`; // Template literal
\`\`\`

#### Number
\`\`\`javascript
let age = 25;
let price = 99.99;
let negative = -10;
\`\`\`

#### Boolean
\`\`\`javascript
let isActive = true;
let isPremium = false;
\`\`\`

#### Undefined
\`\`\`javascript
let x;
console.log(x); // undefined
\`\`\`

#### Null
\`\`\`javascript
let user = null; // Intentionally empty
\`\`\`

#### Symbol (Advanced)
\`\`\`javascript
let id = Symbol('id');
\`\`\`

#### BigInt (Very large numbers)
\`\`\`javascript
let bigNum = 1234567890123456789012345678901234567890n;
\`\`\`

### 2. Reference Types

#### Object
\`\`\`javascript
let person = {
  name: "Arif",
  age: 25,
  city: "Dhaka"
};
\`\`\`

#### Array
\`\`\`javascript
let fruits = ["Apple", "Banana", "Mango"];
let numbers = [1, 2, 3, 4, 5];
\`\`\`

#### Function
\`\`\`javascript
function greet() {
  console.log("Hello!");
}
\`\`\`

## Type Checking

\`\`\`javascript
typeof "Hello"        // "string"
typeof 25             // "number"
typeof true           // "boolean"
typeof undefined      // "undefined"
typeof null           // "object" (bug in JavaScript)
typeof []             // "object"
typeof {}             // "object"
typeof function(){}   // "function"
\`\`\`

## Type Conversion

### String Conversion
\`\`\`javascript
let num = 123;
let str = String(num);  // "123"
let str2 = num + "";    // "123"
\`\`\`

### Number Conversion
\`\`\`javascript
let str = "123";
let num = Number(str);  // 123
let num2 = +str;        // 123
let num3 = parseInt(str); // 123
let num4 = parseFloat("123.45"); // 123.45
\`\`\`

### Boolean Conversion
\`\`\`javascript
Boolean(1)          // true
Boolean(0)          // false
Boolean("")         // false
Boolean("hello")    // true
Boolean(null)       // false
Boolean(undefined)  // false
\`\`\`

## Practice Examples

\`\`\`javascript
// Variables
let firstName = "Ariful";
let lastName = "Islam";
let fullName = firstName + " " + lastName;

const birthYear = 1998;
let currentYear = 2024;
let age = currentYear - birthYear;

console.log("Name:", fullName);
console.log("Age:", age);

// Data Types
let isStudent = true;
let marks = 85.5;
let grade = "A";

console.log(typeof isStudent); // boolean
console.log(typeof marks);     // number
console.log(typeof grade);     // string
\`\`\`

## Best Practices

1. ✅ Use \`const\` by default
2. ✅ Use \`let\` when value will change
3. ❌ Avoid \`var\`
4. ✅ Use meaningful names
5. ✅ Use camelCase for variables
6. ✅ Use UPPERCASE for constants
`,
    topic: 'JavaScript',
    tags: ['Variables', 'Data Types', 'var', 'let', 'const'],
    difficulty: 'beginner',
    estimatedTime: 30,
    media: [
      {
        type: 'video',
        url: 'https://www.youtube.com/watch?v=pCh-ULNEGdk',
        title: 'JavaScript Variables and Data Types',
        duration: 1800,
      },
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800',
    keyPoints: [
      'let এবং const ব্যবহার করুন, var নয়',
      'const দিয়ে যা change হবে না তা declare করুন',
      '7টি primitive data types আছে',
      'typeof operator দিয়ে type check করা যায়',
    ],
    order: 3,
    isPublished: true,
    isPremium: false,
  },
  {
    title: 'Operators এবং Expressions',
    description: 'JavaScript এর বিভিন্ন operators (arithmetic, comparison, logical) এবং expressions শিখুন।',
    content: `# Operators এবং Expressions

## Operators কি?

Operators হলো special symbols যা operations perform করে।

## 1. Arithmetic Operators (গাণিতিক)

\`\`\`javascript
let a = 10;
let b = 5;

console.log(a + b);  // 15 (Addition)
console.log(a - b);  // 5  (Subtraction)
console.log(a * b);  // 50 (Multiplication)
console.log(a / b);  // 2  (Division)
console.log(a % b);  // 0  (Modulus/Remainder)
console.log(a ** b); // 100000 (Exponentiation)

// Increment/Decrement
let x = 10;
x++;  // x = 11 (Post-increment)
++x;  // x = 12 (Pre-increment)
x--;  // x = 11 (Post-decrement)
--x;  // x = 10 (Pre-decrement)
\`\`\`

## 2. Assignment Operators

\`\`\`javascript
let x = 10;

x += 5;  // x = x + 5  → 15
x -= 3;  // x = x - 3  → 12
x *= 2;  // x = x * 2  → 24
x /= 4;  // x = x / 4  → 6
x %= 4;  // x = x % 4  → 2
\`\`\`

## 3. Comparison Operators (তুলনা)

\`\`\`javascript
let a = 10;
let b = "10";

// Equality
console.log(a == b);   // true (value check only)
console.log(a === b);  // false (value + type check) ✅ Use this
console.log(a != b);   // false
console.log(a !== b);  // true

// Comparison
console.log(5 > 3);    // true
console.log(5 < 3);    // false
console.log(5 >= 5);   // true
console.log(5 <= 4);   // false
\`\`\`

**Important**: সবসময় \`===\` এবং \`!==\` ব্যবহার করুন!

## 4. Logical Operators

\`\`\`javascript
let age = 25;
let hasLicense = true;

// AND (&&) - Both must be true
console.log(age >= 18 && hasLicense); // true

// OR (||) - At least one must be true
console.log(age < 18 || hasLicense);  // true

// NOT (!) - Reverse the boolean
console.log(!hasLicense);             // false

// Examples
let isAdult = age >= 18;
let canDrive = isAdult && hasLicense;
console.log(canDrive); // true
\`\`\`

## 5. String Operators

\`\`\`javascript
let firstName = "Ariful";
let lastName = "Islam";

// Concatenation
let fullName = firstName + " " + lastName;
console.log(fullName); // "Ariful Islam"

// Template Literals (Modern way) ✅
let greeting = \`Hello, \${firstName} \${lastName}!\`;
console.log(greeting); // "Hello, Ariful Islam!"

let age = 25;
let message = \`I am \${age} years old\`;
console.log(message); // "I am 25 years old"
\`\`\`

## 6. Ternary Operator (Conditional)

\`\`\`javascript
// Syntax: condition ? valueIfTrue : valueIfFalse

let age = 20;
let status = age >= 18 ? "Adult" : "Minor";
console.log(status); // "Adult"

// More examples
let marks = 85;
let grade = marks >= 80 ? "A" : marks >= 60 ? "B" : "C";
console.log(grade); // "A"

let isLoggedIn = true;
let message = isLoggedIn ? "Welcome!" : "Please login";
\`\`\`

## 7. Type Operators

\`\`\`javascript
console.log(typeof "Hello");     // "string"
console.log(typeof 123);          // "number"
console.log(typeof true);         // "boolean"

let person = { name: "Arif" };
console.log(person instanceof Object); // true
\`\`\`

## Operator Precedence (অগ্রাধিকার)

\`\`\`javascript
let result = 10 + 5 * 2;  // 20 (not 30)
// Multiplication first, then addition

// Use parentheses for clarity
let result2 = (10 + 5) * 2;  // 30
\`\`\`

**Order (High to Low)**:
1. () Parentheses
2. ** Exponentiation
3. *, /, % Multiplication, Division, Modulus
4. +, - Addition, Subtraction
5. <, >, <=, >= Comparison
6. ==, ===, !=, !== Equality
7. && Logical AND
8. || Logical OR
9. ? : Ternary

## Real-World Examples

### Example 1: Calculate Total Price
\`\`\`javascript
let price = 100;
let quantity = 3;
let discount = 10; // percentage

let subtotal = price * quantity;
let discountAmount = (subtotal * discount) / 100;
let total = subtotal - discountAmount;

console.log(\`Subtotal: ৳\${subtotal}\`);
console.log(\`Discount: ৳\${discountAmount}\`);
console.log(\`Total: ৳\${total}\`);
\`\`\`

### Example 2: Age Verification
\`\`\`javascript
let age = 17;
let hasParentConsent = true;

let canRegister = age >= 18 || (age >= 13 && hasParentConsent);
console.log(\`Can register: \${canRegister}\`);
\`\`\`

### Example 3: Grade Calculator
\`\`\`javascript
let marks = 75;

let grade = marks >= 80 ? "A+" :
            marks >= 70 ? "A"  :
            marks >= 60 ? "B"  :
            marks >= 50 ? "C"  :
            marks >= 40 ? "D"  : "F";

console.log(\`Grade: \${grade}\`);
\`\`\`

## Practice Exercises

1. দুটি number এর sum, difference, product, quotient calculate করুন
2. Temperature Celsius থেকে Fahrenheit এ convert করুন
3. একজন person এর age calculate করুন (birth year দিয়ে)
4. Check করুন কেউ vote দিতে পারবে কিনা (age >= 18)
5. Calculate করুন একটি circle এর area (πr²)
`,
    topic: 'JavaScript',
    tags: ['Operators', 'Arithmetic', 'Comparison', 'Logical'],
    difficulty: 'beginner',
    estimatedTime: 35,
    media: [
      {
        type: 'video',
        url: 'https://www.youtube.com/watch?v=FZzyij43A54',
        title: 'JavaScript Operators',
        duration: 2100,
      },
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800',
    keyPoints: [
      'সবসময় === ব্যবহার করুন == নয়',
      'Template literals ব্যবহার করে string concatenation করুন',
      'Ternary operator সহজ conditions এর জন্য perfect',
      'Operator precedence বুঝে code লিখুন',
    ],
    order: 4,
    isPublished: true,
    isPremium: false,
  },
  {
    title: 'Conditional Statements (if-else, switch)',
    description: 'Decision making এর জন্য if-else এবং switch statements শিখুন।',
    content: `# Conditional Statements

## Decision Making

Programs এ decision making করার জন্য conditional statements ব্যবহার করা হয়।

## 1. if Statement

\`\`\`javascript
let age = 20;

if (age >= 18) {
  console.log("You are an adult");
}
// Output: "You are an adult"
\`\`\`

## 2. if...else Statement

\`\`\`javascript
let age = 15;

if (age >= 18) {
  console.log("You are an adult");
} else {
  console.log("You are a minor");
}
// Output: "You are a minor"
\`\`\`

## 3. if...else if...else Statement

\`\`\`javascript
let marks = 85;

if (marks >= 80) {
  console.log("Grade: A+");
} else if (marks >= 70) {
  console.log("Grade: A");
} else if (marks >= 60) {
  console.log("Grade: B");
} else if (marks >= 50) {
  console.log("Grade: C");
} else if (marks >= 40) {
  console.log("Grade: D");
} else {
  console.log("Grade: F");
}
// Output: "Grade: A+"
\`\`\`

## 4. Nested if

\`\`\`javascript
let age = 25;
let hasLicense = true;

if (age >= 18) {
  if (hasLicense) {
    console.log("You can drive");
  } else {
    console.log("Get a license first");
  }
} else {
  console.log("You are too young to drive");
}
\`\`\`

## 5. switch Statement

Multiple conditions check করার জন্য switch statement ব্যবহার করা যায়।

\`\`\`javascript
let day = 3;
let dayName;

switch (day) {
  case 1:
    dayName = "Sunday";
    break;
  case 2:
    dayName = "Monday";
    break;
  case 3:
    dayName = "Tuesday";
    break;
  case 4:
    dayName = "Wednesday";
    break;
  case 5:
    dayName = "Thursday";
    break;
  case 6:
    dayName = "Friday";
    break;
  case 7:
    dayName = "Saturday";
    break;
  default:
    dayName = "Invalid day";
}

console.log(dayName); // "Tuesday"
\`\`\`

**Important**: \`break\` না দিলে পরের cases ও execute হবে!

## Truthy and Falsy Values

JavaScript এ কিছু values "falsy" (false হিসেবে treat হয়):

**Falsy Values**:
- \`false\`
- \`0\`
- \`""\` (empty string)
- \`null\`
- \`undefined\`
- \`NaN\`

**Truthy Values**: Falsy ছাড়া সব!

\`\`\`javascript
if (0) {
  console.log("Won't execute");
}

if ("") {
  console.log("Won't execute");
}

if ("Hello") {
  console.log("Will execute!"); // ✅
}

if (42) {
  console.log("Will execute!"); // ✅
}
\`\`\`

## Real-World Examples

### Example 1: User Authentication
\`\`\`javascript
let username = "arif123";
let password = "secret";

if (username === "arif123" && password === "secret") {
  console.log("✅ Login successful!");
} else {
  console.log("❌ Invalid credentials!");
}
\`\`\`

### Example 2: Discount Calculator
\`\`\`javascript
let totalAmount = 5000;
let discount = 0;

if (totalAmount >= 10000) {
  discount = 20;
} else if (totalAmount >= 5000) {
  discount = 10;
} else if (totalAmount >= 2000) {
  discount = 5;
}

let finalAmount = totalAmount - (totalAmount * discount / 100);
console.log(\`Discount: \${discount}%\`);
console.log(\`Final Amount: ৳\${finalAmount}\`);
\`\`\`

### Example 3: Season Checker
\`\`\`javascript
let month = 7; // July

let season;
switch (month) {
  case 12:
  case 1:
  case 2:
    season = "Winter (শীতকাল)";
    break;
  case 3:
  case 4:
  case 5:
    season = "Spring (বসন্তকাল)";
    break;
  case 6:
  case 7:
  case 8:
    season = "Monsoon (বর্ষাকাল)";
    break;
  case 9:
  case 10:
  case 11:
    season = "Autumn (শরৎকাল)";
    break;
  default:
    season = "Invalid month";
}

console.log(\`Season: \${season}\`);
\`\`\`

### Example 4: Age Category
\`\`\`javascript
let age = 35;
let category;

if (age < 13) {
  category = "Child";
} else if (age < 20) {
  category = "Teenager";
} else if (age < 60) {
  category = "Adult";
} else {
  category = "Senior Citizen";
}

console.log(\`Category: \${category}\`);
\`\`\`

### Example 5: BMI Calculator
\`\`\`javascript
let weight = 70; // kg
let height = 1.75; // meters

let bmi = weight / (height * height);
let status;

if (bmi < 18.5) {
  status = "Underweight";
} else if (bmi < 25) {
  status = "Normal";
} else if (bmi < 30) {
  status = "Overweight";
} else {
  status = "Obese";
}

console.log(\`BMI: \${bmi.toFixed(2)}\`);
console.log(\`Status: \${status}\`);
\`\`\`

## Best Practices

1. ✅ Use meaningful conditions
2. ✅ Always use \`===\` instead of \`==\`
3. ✅ Use \`{}\` braces even for single line
4. ✅ Consider using ternary for simple conditions
5. ✅ Use switch for multiple exact value checks
6. ✅ Don't forget \`break\` in switch cases
7. ✅ Handle default/else cases

## Common Mistakes

❌ **Missing braces**:
\`\`\`javascript
// Bad
if (age >= 18)
  console.log("Adult");
  console.log("Can vote"); // Always executes!

// Good
if (age >= 18) {
  console.log("Adult");
  console.log("Can vote");
}
\`\`\`

❌ **Using = instead of ===**:
\`\`\`javascript
// Bad
if (age = 18) { } // Assignment, not comparison!

// Good
if (age === 18) { }
\`\`\`

## Practice Exercises

1. Check করুন একটি number positive, negative নাকি zero
2. Check করুন একটি year leap year কিনা
3. Find করুন তিনটি number এর মধ্যে largest
4. Grade system তৈরি করুন marks অনুযায়ী
5. Traffic light system তৈরি করুন (Red, Yellow, Green)
`,
    topic: 'JavaScript',
    tags: ['Conditionals', 'if-else', 'switch', 'Decision Making'],
    difficulty: 'beginner',
    estimatedTime: 30,
    media: [
      {
        type: 'video',
        url: 'https://www.youtube.com/watch?v=IsG4Xd6LlsM',
        title: 'JavaScript Conditionals',
        duration: 1800,
      },
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=800',
    keyPoints: [
      'if-else decision making এর জন্য ব্যবহার হয়',
      'switch একাধিক exact values check করতে ভালো',
      'সবসময় break ব্যবহার করুন switch এ',
      'Truthy/Falsy values বুঝুন',
    ],
    order: 5,
    isPublished: true,
    isPremium: false,
  },
];

// Quiz data for each lesson
const quizzesData = [
  // Quiz 1: JavaScript Introduction
  {
    title: 'JavaScript বেসিক কুইজ',
    description: 'JavaScript এর পরিচিতি এবং মৌলিক ধারণা সম্পর্কে আপনার জ্ঞান পরীক্ষা করুন।',
    topic: 'JavaScript',
    difficulty: 'beginner',
    lessonOrder: 1,
    timeLimit: 10,
    passingScore: 70,
    questions: [
      {
        type: 'mcq',
        question: 'JavaScript কোন ধরনের programming language?',
        options: [
          'Compiled language',
          'Interpreted language',
          'Assembly language',
          'Machine language',
        ],
        correctAnswer: 'Interpreted language',
        explanation: 'JavaScript একটি interpreted language যা runtime এ browser বা Node.js দ্বারা execute হয়।',
        points: 1,
      },
      {
        type: 'mcq',
        question: 'JavaScript কোথায় execute হয়?',
        options: [
          'শুধু Browser এ',
          'শুধু Server এ',
          'Browser এবং Server দুটোতেই',
          'শুধু Mobile এ',
        ],
        correctAnswer: 'Browser এবং Server দুটোতেই',
        explanation: 'JavaScript browser এ execute হয় এবং Node.js দিয়ে server-side এও চলে।',
        points: 1,
      },
      {
        type: 'true-false',
        question: 'JavaScript এবং Java একই programming language।',
        options: ['True', 'False'],
        correctAnswer: 'False',
        explanation: 'JavaScript এবং Java সম্পূর্ণ আলাদা দুটি programming language। শুধু নাম similar।',
        points: 1,
      },
      {
        type: 'mcq',
        question: 'Web development এর তিনটি core technology কি কি?',
        options: [
          'HTML, CSS, Python',
          'HTML, CSS, JavaScript',
          'HTML, Java, CSS',
          'PHP, CSS, JavaScript',
        ],
        correctAnswer: 'HTML, CSS, JavaScript',
        explanation: 'HTML (structure), CSS (styling), এবং JavaScript (functionality) হলো web development এর core technologies।',
        points: 1,
      },
      {
        type: 'mcq',
        question: 'Node.js কি?',
        options: [
          'একটি browser',
          'একটি programming language',
          'JavaScript runtime environment',
          'একটি database',
        ],
        correctAnswer: 'JavaScript runtime environment',
        explanation: 'Node.js হলো একটি JavaScript runtime environment যা server-side এ JavaScript চালায়।',
        points: 1,
      },
    ],
  },
  // Quiz 2: Setup and First Program
  {
    title: 'Setup এবং প্রথম প্রোগ্রাম কুইজ',
    description: 'Development environment setup এবং basic programming সম্পর্কে কুইজ।',
    topic: 'JavaScript',
    difficulty: 'beginner',
    lessonOrder: 2,
    timeLimit: 10,
    passingScore: 70,
    questions: [
      {
        type: 'mcq',
        question: 'Browser console খোলার shortcut key কি? (Chrome)',
        options: [
          'Ctrl + Shift + J',
          'Ctrl + Shift + K',
          'Ctrl + Alt + J',
          'Ctrl + J',
        ],
        correctAnswer: 'Ctrl + Shift + J',
        explanation: 'Chrome browser এ Ctrl + Shift + J দিয়ে console খোলা যায়।',
        points: 1,
      },
      {
        type: 'mcq',
        question: 'Console এ output দেখানোর জন্য কোন method ব্যবহার করা হয়?',
        options: [
          'print()',
          'console.log()',
          'alert()',
          'display()',
        ],
        correctAnswer: 'console.log()',
        explanation: 'console.log() method দিয়ে console এ output print করা হয়।',
        points: 1,
      },
      {
        type: 'mcq',
        question: 'External JavaScript file এর extension কি?',
        options: [
          '.javascript',
          '.script',
          '.js',
          '.jscript',
        ],
        correctAnswer: '.js',
        explanation: 'JavaScript files এর extension হলো .js',
        points: 1,
      },
      {
        type: 'true-false',
        question: 'Script tag সবসময় head section এ রাখা উচিত।',
        options: ['True', 'False'],
        correctAnswer: 'False',
        explanation: 'Best practice হলো script tag body এর শেষে রাখা যাতে HTML content আগে load হয়।',
        points: 1,
      },
      {
        type: 'mcq',
        question: 'Single line comment এর syntax কি?',
        options: [
          '/* comment */',
          '// comment',
          '# comment',
          '<!-- comment -->',
        ],
        correctAnswer: '// comment',
        explanation: '// দিয়ে single line comment এবং /* */ দিয়ে multi-line comment লেখা হয়।',
        points: 1,
      },
    ],
  },
  // Quiz 3: Variables and Data Types
  {
    title: 'Variables এবং Data Types কুইজ',
    description: 'Variables declaration এবং data types সম্পর্কে আপনার জ্ঞান যাচাই করুন।',
    topic: 'JavaScript',
    difficulty: 'beginner',
    lessonOrder: 3,
    timeLimit: 15,
    passingScore: 70,
    questions: [
      {
        type: 'mcq',
        question: 'কোন keyword দিয়ে constant variable declare করা হয়?',
        options: [
          'var',
          'let',
          'const',
          'constant',
        ],
        correctAnswer: 'const',
        explanation: 'const keyword দিয়ে constant (যার value change হবে না) variable declare করা হয়।',
        points: 1,
      },
      {
        type: 'true-false',
        question: 'let দিয়ে declare করা variable এর value change করা যায়।',
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: 'let দিয়ে declare করা variable এর value পরে change করা যায়।',
        points: 1,
      },
      {
        type: 'mcq',
        question: 'typeof "Hello" এর output কি?',
        options: [
          'text',
          'string',
          'char',
          'word',
        ],
        correctAnswer: 'string',
        explanation: 'typeof operator দিয়ে type check করলে "Hello" এর type string আসবে।',
        points: 1,
      },
      {
        type: 'mcq',
        question: 'JavaScript এ কয়টি primitive data types আছে?',
        options: [
          '5',
          '6',
          '7',
          '8',
        ],
        correctAnswer: '7',
        explanation: 'JavaScript এ 7টি primitive types: string, number, boolean, undefined, null, symbol, bigint।',
        points: 1,
      },
      {
        type: 'true-false',
        question: 'Variable name number দিয়ে শুরু করা যায়।',
        options: ['True', 'False'],
        correctAnswer: 'False',
        explanation: 'Variable name letter, underscore (_) বা dollar sign ($) দিয়ে শুরু করতে হয়, number দিয়ে নয়।',
        points: 1,
      },
      {
        type: 'mcq',
        question: 'let x; এর পরে x এর value কি হবে?',
        options: [
          '0',
          'null',
          'undefined',
          'empty',
        ],
        correctAnswer: 'undefined',
        explanation: 'Variable declare করে value assign না করলে তার value undefined হয়।',
        points: 1,
      },
    ],
  },
  // Quiz 4: Operators
  {
    title: 'Operators কুইজ',
    description: 'JavaScript operators এবং expressions সম্পর্কে কুইজ।',
    topic: 'JavaScript',
    difficulty: 'beginner',
    lessonOrder: 4,
    timeLimit: 15,
    passingScore: 70,
    questions: [
      {
        type: 'mcq',
        question: '10 + 5 * 2 এর result কত?',
        options: [
          '30',
          '20',
          '17',
          '15',
        ],
        correctAnswer: '20',
        explanation: 'Operator precedence অনুযায়ী multiplication আগে হয়: 5*2=10, তারপর 10+10=20।',
        points: 1,
      },
      {
        type: 'mcq',
        question: '=== এবং == এর মধ্যে পার্থক্য কি?',
        options: [
          'কোন পার্থক্য নেই',
          '=== value এবং type দুটোই check করে',
          '== value এবং type দুটোই check করে',
          '=== শুধু type check করে',
        ],
        correctAnswer: '=== value এবং type দুটোই check করে',
        explanation: '=== (strict equality) value এবং type দুটোই check করে, কিন্তু == শুধু value check করে।',
        points: 1,
      },
      {
        type: 'mcq',
        question: '5 % 2 এর result কত?',
        options: [
          '2',
          '2.5',
          '1',
          '0',
        ],
        correctAnswer: '1',
        explanation: '% হলো modulus operator যা remainder/ভাগশেষ দেয়। 5÷2 = 2 remainder 1।',
        points: 1,
      },
      {
        type: 'true-false',
        question: 'true && false এর result true হবে।',
        options: ['True', 'False'],
        correctAnswer: 'False',
        explanation: 'AND (&&) operator এ দুটো operand-ই true হতে হয়। এখানে একটি false তাই result false।',
        points: 1,
      },
      {
        type: 'mcq',
        question: 'String concatenation এর জন্য কোন operator ব্যবহার হয়?',
        options: [
          '-',
          '+',
          '*',
          '&',
        ],
        correctAnswer: '+',
        explanation: '+ operator দিয়ে string concatenation করা হয়। যেমন: "Hello" + " World"',
        points: 1,
      },
      {
        type: 'mcq',
        question: 'let x = 10; x += 5; এর পরে x এর value কত?',
        options: [
          '10',
          '5',
          '15',
          '50',
        ],
        correctAnswer: '15',
        explanation: 'x += 5 মানে x = x + 5, তাই 10 + 5 = 15।',
        points: 1,
      },
    ],
  },
  // Quiz 5: Conditional Statements
  {
    title: 'Conditional Statements কুইজ',
    description: 'if-else এবং switch statements সম্পর্কে কুইজ।',
    topic: 'JavaScript',
    difficulty: 'beginner',
    lessonOrder: 5,
    timeLimit: 15,
    passingScore: 70,
    questions: [
      {
        type: 'mcq',
        question: 'if statement এর syntax কোনটি সঠিক?',
        options: [
          'if x > 10 { }',
          'if (x > 10) { }',
          'if x > 10 then { }',
          'if [x > 10] { }',
        ],
        correctAnswer: 'if (x > 10) { }',
        explanation: 'if statement এর syntax: if (condition) { code }',
        points: 1,
      },
      {
        type: 'true-false',
        question: 'switch statement এ break না দিলে পরের cases ও execute হবে।',
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: 'switch এ break না দিলে fall-through হয় এবং পরের cases ও execute হয়।',
        points: 1,
      },
      {
        type: 'mcq',
        question: 'কোনটি falsy value?',
        options: [
          '"0"',
          '1',
          '0',
          '"false"',
        ],
        correctAnswer: '0',
        explanation: '0 হলো falsy value। কিন্তু "0" (string) এবং 1 truthy values।',
        points: 1,
      },
      {
        type: 'mcq',
        question: 'Ternary operator এর syntax কোনটি?',
        options: [
          'condition ? true : false',
          'condition : true ? false',
          'if condition then true else false',
          'condition then true or false',
        ],
        correctAnswer: 'condition ? true : false',
        explanation: 'Ternary operator: condition ? valueIfTrue : valueIfFalse',
        points: 1,
      },
      {
        type: 'true-false',
        question: 'Empty string ("") একটি truthy value।',
        options: ['True', 'False'],
        correctAnswer: 'False',
        explanation: 'Empty string ("") হলো falsy value। Non-empty string truthy।',
        points: 1,
      },
      {
        type: 'mcq',
        question: 'switch statement এ default case কখন execute হয়?',
        options: [
          'সবসময়',
          'কখনোই না',
          'কোন case match না করলে',
          'শুধু প্রথম case match করলে',
        ],
        correctAnswer: 'কোন case match না করলে',
        explanation: 'default case execute হয় যখন কোন case এর সাথে value match করে না।',
        points: 1,
      },
    ],
  },
];

const seedJavaScriptLessons = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/microlearning-db');
    console.log('📊 Connected to database');

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      console.error('❌ Course not found!');
      process.exit(1);
    }

    console.log(`📚 Found course: ${course.title}`);
    console.log(`👨‍🏫 Author ID: ${authorId}\n`);

    // Check existing lessons
    const existingLessons = await Lesson.find({ course: courseId });
    if (existingLessons.length > 0) {
      console.log(`⚠️  Found ${existingLessons.length} existing lessons. Skipping creation.`);
      console.log('ℹ️  Delete existing lessons first if you want to recreate.\n');
      process.exit(0);
    }

    const createdLessons: any[] = [];
    const createdQuizzes: any[] = [];

    // Create lessons
    console.log('📝 Creating lessons...\n');
    for (const lessonData of lessonsData) {
      const lesson = await Lesson.create({
        ...lessonData,
        author: authorId,
        course: courseId,
      });

      createdLessons.push(lesson);
      console.log(`✅ Lesson ${lesson.order}: ${lesson.title}`);

      // Find and create corresponding quiz
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
    console.log('🎉 Course is now ready with complete content!\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedJavaScriptLessons();
