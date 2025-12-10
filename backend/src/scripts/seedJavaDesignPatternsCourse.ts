import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Course } from '../app/modules/course/course.model';
import Lesson from '../app/modules/microLessons/lesson.model';
import { Quiz } from '../app/modules/quiz/quiz.model';

dotenv.config();

const instructorId = '6936d94f56aed05b85859e21';
const courseName = 'Java Design Patterns Masterclass';

const courseData = {
  title: 'Java Design Patterns Masterclass - Complete Guide',
  description: 'জাভা ডিজাইন প্যাটার্নের সম্পূর্ণ গাইড। শিখুন 32+ Design Patterns (GoF + J2EE) এবং তাদের real-world applications। Creational, Structural, Behavioral এবং J2EE Patterns master করুন। Enterprise-level Java applications তৈরির জন্য essential patterns এর complete course।',
  instructor: instructorId,
  author: instructorId,
  category: 'Programming',
  topic: 'Java Design Patterns',
  difficulty: 'intermediate',
  level: 'intermediate',
  language: 'bn',
  duration: 2400, // 40 hours
  thumbnail: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800',
  price: 0,
  isPremium: false,
  tags: ['Java', 'Design Patterns', 'OOP', 'Software Architecture', 'Best Practices', 'Gang of Four', 'J2EE', 'Enterprise'],
  learningOutcomes: [
    '32+ Design Patterns (GoF + J2EE) সম্পূর্ণভাবে বুঝতে পারবেন',
    'Creational Patterns: Factory, Abstract Factory, Singleton, Builder, Prototype',
    'Structural Patterns: Adapter, Bridge, Composite, Decorator, Facade, Flyweight, Proxy, Filter',
    'Behavioral Patterns: Chain of Responsibility, Command, Interpreter, Iterator, Mediator, Memento, Observer, State, Strategy, Template, Visitor',
    'J2EE Patterns: MVC, Business Delegate, DAO, Front Controller, Service Locator, Transfer Object',
    'সঠিক পরিস্থিতিতে সঠিক pattern ব্যবহার করতে পারবেন',
    'Design Patterns ব্যবহার করে maintainable এবং scalable code লিখতে পারবেন',
    'Real-world problems solve করতে পারবেন design patterns দিয়ে',
    'Enterprise Java applications এ patterns apply করতে পারবেন',
    'Industry-standard best practices follow করতে পারবেন',
  ],
  prerequisites: [
    'জাভা প্রোগ্রামিং এর basic জ্ঞান',
    'Object-Oriented Programming concepts বোঝা',
    'Classes, Inheritance, Polymorphism, Interfaces সম্পর্কে ধারণা',
    'Java Collections Framework এর basic knowledge',
  ],
  isPublished: true,
};

const lessonsData: any[] = [
  // Lesson 1: Design Patterns - Home
  {
    title: 'Design Patterns - Home',
    description: 'Java Design Patterns course এ স্বাগতম! এই lesson এ আপনি জানবেন course structure, learning path এবং কিভাবে শুরু করবেন।',
    topic: 'Java Design Patterns',
    difficulty: 'beginner',
    estimatedTime: 20,
    author: instructorId,
    content: `# Design Patterns - স্বাগতম!

## 🎯 Course এ স্বাগতম!

এই comprehensive course এ আপনি শিখবেন **Java Design Patterns** এর সম্পূর্ণ guide। Software development এর world এ Design Patterns হলো proven solutions যা আপনার code কে আরো maintainable, scalable এবং efficient করে তুলবে।

## 📚 কোর্সের বিষয়বস্তু

এই course এ আমরা cover করবো:

### 1. **Creational Patterns** (৫টি)
Object creation এর জন্য:
- ✅ **Singleton Pattern** - একটি মাত্র instance
- ✅ **Factory Pattern** - Object তৈরির কারখানা
- ✅ **Abstract Factory Pattern** - Factory এর factory
- ✅ **Builder Pattern** - Complex object construction
- ✅ **Prototype Pattern** - Object cloning

### 2. **Structural Patterns** (৮টি)
Object এর structure এবং composition:
- ✅ **Adapter Pattern** - Interface compatibility
- ✅ **Bridge Pattern** - Abstraction থেকে implementation আলাদা
- ✅ **Composite Pattern** - Tree structure
- ✅ **Decorator Pattern** - Dynamic functionality
- ✅ **Facade Pattern** - Simplified interface
- ✅ **Flyweight Pattern** - Memory optimization
- ✅ **Proxy Pattern** - Controlled access
- ✅ **Filter Pattern** - Filtering criteria

### 3. **Behavioral Patterns** (১১টি)
Object এর behavior এবং communication:
- ✅ **Chain of Responsibility** - Request handling chain
- ✅ **Command Pattern** - Request as object
- ✅ **Interpreter Pattern** - Language interpreter
- ✅ **Iterator Pattern** - Sequential access
- ✅ **Mediator Pattern** - Communication mediator
- ✅ **Memento Pattern** - State restoration
- ✅ **Observer Pattern** - Event notification
- ✅ **State Pattern** - State-based behavior
- ✅ **Strategy Pattern** - Algorithm selection
- ✅ **Template Pattern** - Algorithm skeleton
- ✅ **Visitor Pattern** - Operations on elements

### 4. **J2EE Patterns** (৮টি)
Enterprise application patterns:
- ✅ **MVC Pattern** - Model-View-Controller
- ✅ **Business Delegate** - Business tier access
- ✅ **DAO Pattern** - Data access abstraction
- ✅ **Front Controller** - Centralized request handling
- ✅ **Intercepting Filter** - Pre/Post processing
- ✅ **Service Locator** - Service lookup
- ✅ **Transfer Object** - Data transfer
- ✅ **Composite Entity** - Business entity representation

## 🎓 শেখার পদ্ধতি

প্রতিটি pattern এর জন্য আমরা শিখবো:

### 📖 1. **Theory**
- Pattern কী এবং কেন ব্যবহার করবেন
- Problem যা solve করে
- Pattern এর structure

### 💻 2. **Code Examples**
- ছোট ছোট code snippets
- Step-by-step implementation
- Complete working examples

### 🌟 3. **Real-World Scenarios**
- Practical use cases
- Industry examples
- Best practices

### ❓ 4. **Practice Questions**
- Understanding check
- Scenario-based questions
- Implementation challenges

## 🚀 কোর্স শেষে আপনি পারবেন

✅ **32+ Design Patterns** বুঝতে এবং implement করতে
✅ **Maintainable Code** লিখতে
✅ **Complex Problems** solve করতে
✅ **Industry Standards** follow করতে
✅ **Enterprise Applications** তৈরি করতে

## 💡 কেন Design Patterns শিখবেন?

### 1. **Code Quality** 📈
- Clean এবং organized code
- Easy to understand
- Less bugs

### 2. **Reusability** 🔄
- DRY principle follow
- Proven solutions
- Time-saving

### 3. **Communication** 💬
- Common vocabulary
- Team collaboration
- Better documentation

### 4. **Career Growth** 🎯
- Industry requirement
- Senior developer skills
- Interview preparation

## 📋 Prerequisites

আপনার থাকা উচিত:
- ✅ Java basics জ্ঞান
- ✅ OOP concepts বোঝা
- ✅ Classes, Interfaces জানা
- ✅ Practice করার আগ্রহ

## 🎯 Learning Path

1. **Start** → Introduction এবং basics
2. **Learn** → Each pattern deeply
3. **Practice** → Code examples
4. **Apply** → Real projects
5. **Master** → All patterns

## 📝 Study Tips

### ✅ Do's:
- একটা pattern complete করে next এ যান
- Code examples নিজে লিখে practice করুন
- Real-world examples খুঁজুন
- Notes নিন

### ❌ Don'ts:
- সব patterns একসাথে শিখতে যাবেন না
- শুধু theory পড়ে থাকবেন না
- Code না লিখে এগিয়ে যাবেন না
- Pattern overuse করবেন না

## 🔥 Let's Begin!

আপনি এখন **Java Design Patterns** journey শুরু করতে প্রস্তুত! 

প্রথম lesson এ আমরা শিখবো **Design Patterns Overview** - একটা complete picture যেখানে সব patterns এর introduction থাকবে।

**Ready? Let's dive in!** 🚀

---

## 📌 Quick Navigation

- 📖 Next: **Design Patterns - Overview**
- 🏠 Home: Current
- 📚 All Patterns: Coming soon

**Happy Learning! 💪**`,
    lessonOrder: 1,
    duration: 20,
    videoUrl: 'https://www.youtube.com/watch?v=tv-_1er1mWI',
    isPremium: false,
    isPublished: true,
  },

  // Lesson 2: Design Patterns - Overview
  {
    title: 'Design Patterns - Overview',
    description: 'Design Patterns এর complete overview। জানুন GoF patterns, categories এবং কখন কোন pattern ব্যবহার করবেন।',
    topic: 'Java Design Patterns',
    difficulty: 'beginner',
    estimatedTime: 35,
    author: instructorId,
    content: `# Design Patterns - সম্পূর্ণ Overview

## 🎯 Design Pattern কী?

**Design Pattern** হলো software design এর recurring problems এর **proven solutions**। এগুলো হলো best practices যা experienced developers রা বছরের পর বছর ধরে ব্যবহার করে আসছেন।

### সহজ উদাহরণ 🏠

মনে করুন আপনি একটা ঘর তৈরি করছেন:
- **Without Pattern**: প্রতিবার নতুন design করবেন (সময় নষ্ট, ভুল হতে পারে)
- **With Pattern**: Proven architectural designs ব্যবহার করবেন (দ্রুত, নির্ভরযোগ্য)

## 📚 Design Patterns এর ইতিহাস

### Gang of Four (GoF) 📖

**1994 সালে** চারজন software engineer একটি revolutionary বই লিখেন:

- **Erich Gamma**
- **Richard Helm**
- **Ralph Johnson**
- **John Vlissides**

তারা **23টি Design Pattern** identify করেন যা আজও ব্যাপকভাবে ব্যবহৃত হয়।

## 🎨 Pattern এর ৩টি Main Category

### 1️⃣ Creational Patterns (সৃষ্টি সংক্রান্ত)

**উদ্দেশ্য**: Object creation mechanism প্রদান করা

**৫টি Patterns:**

| Pattern | Purpose | Example |
|---------|---------|---------|
| **Singleton** | একটি মাত্র instance | Database connection |
| **Factory** | Object creation logic hide | Payment gateway selection |
| **Abstract Factory** | Related objects family | UI components (Windows/Mac) |
| **Builder** | Complex object construction | Computer configuration |
| **Prototype** | Object cloning | Document templates |

**কখন ব্যবহার করবেন:**
- Object creation complex হলে
- Object creation logic hide করতে চাইলে
- নির্দিষ্ট number এর instance চাইলে

### 2️⃣ Structural Patterns (কাঠামোগত)

**উদ্দেশ্য**: Objects এর structure এবং relationship manage করা

**৮টি Patterns:**

| Pattern | Purpose | Example |
|---------|---------|---------|
| **Adapter** | Incompatible interfaces connect | Card reader adapter |
| **Bridge** | Abstraction & implementation separate | Remote control & TV |
| **Composite** | Tree structure represent | File system |
| **Decorator** | Dynamic functionality add | Pizza toppings |
| **Facade** | Complex system simplified | Home theater |
| **Flyweight** | Memory optimize with sharing | Text editor characters |
| **Proxy** | Controlled access | Image loading |
| **Filter** | Objects filter করা | Search results filtering |

**কখন ব্যবহার করবেন:**
- Objects এর relationship সহজ করতে
- Functionality dynamically যোগ করতে
- Complex systems simplify করতে

### 3️⃣ Behavioral Patterns (আচরণগত)

**উদ্দেশ্য**: Objects এর মধ্যে communication এবং responsibility

**১১টি Patterns:**

| Pattern | Purpose | Example |
|---------|---------|---------|
| **Chain of Responsibility** | Request chain এ pass | Customer support |
| **Command** | Request as object | Remote control buttons |
| **Interpreter** | Language interpreter | Calculator |
| **Iterator** | Sequential access | Collection traversal |
| **Mediator** | Object communication centralize | Chat room |
| **Memento** | State save & restore | Text editor undo |
| **Observer** | Event notification | Newsletter subscription |
| **State** | Behavior based on state | Order status |
| **Strategy** | Algorithm selection | Payment methods |
| **Template** | Algorithm skeleton define | Data processing |
| **Visitor** | Operations on elements | Tax calculation |

**কখন ব্যবহার করবেন:**
- Objects এর মধ্যে interaction define করতে
- Behavior runtime এ change করতে
- Communication simplify করতে

## 🎯 Pattern Selection Guide

### কোন Pattern কখন?

\`\`\`
Object Creation? → Creational Patterns
    ├─ একটা instance? → Singleton
    ├─ Different types? → Factory/Abstract Factory
    ├─ Complex setup? → Builder
    └─ Copy existing? → Prototype

Object Structure? → Structural Patterns
    ├─ Incompatible interface? → Adapter
    ├─ Add functionality? → Decorator
    ├─ Simplify complex? → Facade
    └─ Tree structure? → Composite

Object Behavior? → Behavioral Patterns
    ├─ Event notification? → Observer
    ├─ Algorithm selection? → Strategy
    ├─ Request handling? → Chain of Responsibility
    └─ State-based behavior? → State
\`\`\`

## 💡 Pattern ব্যবহারের নিয়ম

### ✅ Do's (করণীয়):

1. **Understand the Problem First**
   - Pattern শেখার আগে problem বুঝুন
   - কখন কোন pattern fit করবে জানুন

2. **Start Simple**
   - সহজ patterns দিয়ে শুরু করুন
   - Gradually complex patterns এ যান

3. **Practice with Examples**
   - Real-world examples implement করুন
   - নিজের projects এ apply করুন

4. **Know When NOT to Use**
   - Simple problems এ pattern overuse করবেন না
   - Pattern for pattern's sake না

### ❌ Don'ts (বর্জনীয়):

1. **Don't Force Patterns**
   - প্রয়োজন ছাড়া pattern use করবেন না
   - Simple solution থাকলে তাই ব্যবহার করুন

2. **Don't Mix Too Many**
   - একসাথে অনেক patterns ব্যবহার না করা ভালো
   - Code complex হয়ে যায়

3. **Don't Ignore Context**
   - প্রতিটি pattern এর সঠিক use case আছে
   - Context বুঝে ব্যবহার করুন

## 🔑 Key Principles

### SOLID Principles সাথে Relation:

1. **S - Single Responsibility**
   - প্রতিটি class একটি কাজ করবে
   - Patterns এটা maintain করে

2. **O - Open/Closed**
   - Extension এর জন্য open
   - Modification এর জন্য closed
   - Strategy, Decorator patterns follow করে

3. **L - Liskov Substitution**
   - Subtypes replace করা যাবে
   - Factory patterns এ important

4. **I - Interface Segregation**
   - Specific interfaces ভালো
   - Adapter pattern এ helpful

5. **D - Dependency Inversion**
   - Abstraction এর উপর depend
   - Factory patterns implement করে

## 📊 Pattern Usage Statistics

Industry তে সবচেয়ে বেশি ব্যবহৃত patterns:

1. **Singleton** - 95% projects
2. **Factory** - 85% projects
3. **Observer** - 75% projects
4. **Decorator** - 70% projects
5. **Strategy** - 65% projects

## 🎓 Learning Roadmap

### Phase 1: Foundation (1-2 weeks)
- ✅ Singleton Pattern
- ✅ Factory Pattern
- ✅ Observer Pattern

### Phase 2: Intermediate (2-3 weeks)
- ✅ Builder Pattern
- ✅ Adapter Pattern
- ✅ Strategy Pattern
- ✅ Decorator Pattern

### Phase 3: Advanced (3-4 weeks)
- ✅ Abstract Factory
- ✅ Proxy Pattern
- ✅ Command Pattern
- ✅ State Pattern

### Phase 4: Expert (4-6 weeks)
- ✅ All remaining patterns
- ✅ Pattern combinations
- ✅ Real-world projects

## 🚀 Next Steps

এখন আমরা শুরু করবো **Creational Patterns** দিয়ে। First pattern হবে **Factory Pattern** - যা অনেক common এবং useful!

---

## 📝 Quick Quiz

**প্রশ্ন ১**: Design Patterns কতটি main category তে divided?
- A) 2টি
- B) 3টি ✅
- C) 4টি
- D) 5টি

**প্রশ্ন ২**: Gang of Four কতটি pattern identify করেছিলেন?
- A) 20টি
- B) 23টি ✅
- C) 25টি
- D) 30টি

**প্রশ্ন ৩**: Singleton Pattern কোন category তে পড়ে?
- A) Creational ✅
- B) Structural
- C) Behavioral
- D) J2EE

**প্রশ্ন ৪**: কোন pattern event notification এর জন্য?
- A) Strategy
- B) Factory
- C) Observer ✅
- D) Adapter

---

**Ready for Creational Patterns? Let's go! 🎯**`,
    lessonOrder: 2,
    duration: 35,
    videoUrl: 'https://www.youtube.com/watch?v=BWprw8UHIzA',
    isPremium: false,
    isPublished: true,
  },

  // Lesson 3: Creational Design Patterns
  {
    title: 'Creational Design Patterns - Introduction',
    description: 'Creational Patterns এর পরিচিতি। শিখুন Singleton, Factory, Builder, Prototype এবং Abstract Factory patterns।',
    topic: 'Creational Patterns',
    difficulty: 'intermediate',
    estimatedTime: 40,
    author: instructorId,
    content: `# Creational Design Patterns - সম্পূর্ণ গাইড

## 🎯 Creational Patterns কী?

**Creational Design Patterns** হলো এমন patterns যা **object creation mechanism** এর সাথে সম্পর্কিত। এগুলো code কে আরো flexible এবং reusable করে তোলে object creation process কে control করার মাধ্যমে।

## 🤔 কেন Creational Patterns প্রয়োজন?

### সমস্যা (Without Pattern):

\`\`\`java
// ❌ Direct object creation - Tight coupling
public class Application {
    public void start() {
        DatabaseConnection db = new MySQLConnection();
        db.connect();
        
        // পরে PostgreSQL use করতে চাইলে?
        // সব জায়গায় code change করতে হবে!
    }
}
\`\`\`

### সমাধান (With Pattern):

\`\`\`java
// ✅ Factory Pattern - Loose coupling
public class Application {
    public void start() {
        DatabaseConnection db = DatabaseFactory.getConnection("mysql");
        db.connect();
        
        // শুধু parameter change করলেই হবে!
        // db = DatabaseFactory.getConnection("postgresql");
    }
}
\`\`\`

## 📚 পাঁচটি Creational Patterns

### 1️⃣ Singleton Pattern 🔐

**Purpose**: নিশ্চিত করা যে একটি class এর শুধুমাত্র **একটি instance** থাকবে।

**কখন ব্যবহার করবেন:**
- Database connection pool
- Logger classes
- Configuration settings
- Cache managers

**Real-World Example:**
President of a country - একসময়ে শুধু একজন!

**Code Snippet:**

\`\`\`java
public class DatabaseConnection {
    private static DatabaseConnection instance;
    
    // Private constructor
    private DatabaseConnection() {
        System.out.println("Database connected!");
    }
    
    // Public method to get instance
    public static DatabaseConnection getInstance() {
        if (instance == null) {
            instance = new DatabaseConnection();
        }
        return instance;
    }
}

// Usage
DatabaseConnection db1 = DatabaseConnection.getInstance();
DatabaseConnection db2 = DatabaseConnection.getInstance();
System.out.println(db1 == db2); // true - Same instance!
\`\`\`

**Advantages:**
✅ Memory efficient
✅ Global access point
✅ Lazy initialization possible

**Disadvantages:**
❌ Testing difficult
❌ Global state issues
❌ Multithreading challenges

---

### 2️⃣ Factory Pattern 🏭

**Purpose**: Object creation logic কে **encapsulate** করা একটি method এ।

**কখন ব্যবহার করবেন:**
- Object creation complex
- Runtime এ type decide হয়
- নতুন types frequently যোগ হয়

**Real-World Example:**
Restaurant - আপনি order করেন, kitchen decide করে কিভাবে তৈরি করবে।

**Code Snippet:**

\`\`\`java
// Step 1: Interface
interface Notification {
    void send(String message);
}

// Step 2: Implementations
class EmailNotification implements Notification {
    public void send(String message) {
        System.out.println("Email sent: " + message);
    }
}

class SMSNotification implements Notification {
    public void send(String message) {
        System.out.println("SMS sent: " + message);
    }
}

// Step 3: Factory
class NotificationFactory {
    public static Notification createNotification(String type) {
        if (type.equals("EMAIL")) {
            return new EmailNotification();
        } else if (type.equals("SMS")) {
            return new SMSNotification();
        }
        return null;
    }
}

// Usage
Notification notif = NotificationFactory.createNotification("EMAIL");
notif.send("Hello World!");
\`\`\`

**Advantages:**
✅ Loose coupling
✅ Easy to extend
✅ Single Responsibility

**Disadvantages:**
❌ Many classes তৈরি হয়
❌ Simple cases এ overkill

---

### 3️⃣ Abstract Factory Pattern 🏗️

**Purpose**: **Related objects এর families** তৈরি করা একটি interface দিয়ে।

**কখন ব্যবহার করবেন:**
- Multiple related products
- Platform-specific objects
- Consistency maintain করতে

**Real-World Example:**
Furniture shop - Modern style বা Victorian style, সব furniture একসাথে match করবে।

**Code Snippet:**

\`\`\`java
// Abstract Products
interface Button { void render(); }
interface Checkbox { void render(); }

// Windows Products
class WindowsButton implements Button {
    public void render() {
        System.out.println("Rendering Windows button");
    }
}
class WindowsCheckbox implements Checkbox {
    public void render() {
        System.out.println("Rendering Windows checkbox");
    }
}

// Mac Products
class MacButton implements Button {
    public void render() {
        System.out.println("Rendering Mac button");
    }
}
class MacCheckbox implements Checkbox {
    public void render() {
        System.out.println("Rendering Mac checkbox");
    }
}

// Abstract Factory
interface GUIFactory {
    Button createButton();
    Checkbox createCheckbox();
}

// Concrete Factories
class WindowsFactory implements GUIFactory {
    public Button createButton() { return new WindowsButton(); }
    public Checkbox createCheckbox() { return new WindowsCheckbox(); }
}

class MacFactory implements GUIFactory {
    public Button createButton() { return new MacButton(); }
    public Checkbox createCheckbox() { return new MacCheckbox(); }
}

// Usage
GUIFactory factory = new WindowsFactory();
Button button = factory.createButton();
Checkbox checkbox = factory.createCheckbox();
button.render();
checkbox.render();
\`\`\`

---

### 4️⃣ Builder Pattern 🏗️

**Purpose**: **Complex objects** কে step by step construct করা।

**কখন ব্যবহার করবেন:**
- Many optional parameters
- Object creation complex
- Immutable objects চান

**Real-World Example:**
Computer assembly - CPU, RAM, Storage step by step যোগ করা।

**Code Snippet:**

\`\`\`java
public class Computer {
    private String CPU;
    private String RAM;
    private String storage;
    private String GPU;
    
    private Computer(ComputerBuilder builder) {
        this.CPU = builder.CPU;
        this.RAM = builder.RAM;
        this.storage = builder.storage;
        this.GPU = builder.GPU;
    }
    
    public static class ComputerBuilder {
        private String CPU;
        private String RAM;
        private String storage = "256GB"; // default
        private String GPU = "Integrated"; // default
        
        public ComputerBuilder(String CPU, String RAM) {
            this.CPU = CPU;
            this.RAM = RAM;
        }
        
        public ComputerBuilder setStorage(String storage) {
            this.storage = storage;
            return this;
        }
        
        public ComputerBuilder setGPU(String GPU) {
            this.GPU = GPU;
            return this;
        }
        
        public Computer build() {
            return new Computer(this);
        }
    }
}

// Usage - Clean and readable!
Computer gamingPC = new Computer.ComputerBuilder("Intel i9", "32GB")
    .setStorage("1TB SSD")
    .setGPU("RTX 4090")
    .build();
\`\`\`

---

### 5️⃣ Prototype Pattern 🐑

**Purpose**: Existing objects **clone** করে নতুন objects তৈরি করা।

**কখন ব্যবহার করবেন:**
- Object creation expensive
- Similar objects তৈরি করতে
- Object copies চান

**Real-World Example:**
Document templates - একটা template clone করে নতুন documents তৈরি।

**Code Snippet:**

\`\`\`java
// Prototype interface
interface Cloneable {
    Object clone();
}

// Concrete prototype
class Document implements Cloneable {
    private String title;
    private String content;
    
    public Document(String title, String content) {
        this.title = title;
        this.content = content;
    }
    
    // Clone method
    public Object clone() {
        return new Document(this.title, this.content);
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public void display() {
        System.out.println("Title: " + title);
        System.out.println("Content: " + content);
    }
}

// Usage
Document original = new Document("Template", "Default content");
Document copy = (Document) original.clone();
copy.setTitle("New Document");
copy.display();
\`\`\`

## 📊 Comparison Table

| Pattern | Object Count | Complexity | Use Case |
|---------|--------------|------------|----------|
| **Singleton** | 1 instance | Low | Database, Logger |
| **Factory** | Multiple types | Medium | Payment methods |
| **Abstract Factory** | Families | High | UI components |
| **Builder** | Complex object | Medium | Configuration |
| **Prototype** | Clone | Low | Document templates |

## 🎯 Pattern Selection Guide

\`\`\`
Need single instance? → Singleton
Need different types? → Factory
Need related families? → Abstract Factory
Need complex setup? → Builder
Need to copy object? → Prototype
\`\`\`

## 💡 Best Practices

### ✅ Do's:
1. Pattern ব্যবহারের আগে problem বুঝুন
2. Simple solution prefer করুন
3. Code maintainability focus করুন
4. Documentation লিখুন

### ❌ Don'ts:
1. Pattern overuse করবেন না
2. Simple problems এ complex pattern না
3. Performance ignore করবেন না
4. Team standards violate করবেন না

## 🚀 Next Lesson

পরবর্তী lesson এ আমরা **Factory Pattern** deeply শিখবো:
- Complete implementation
- Real-world scenarios
- Code examples
- Best practices

**Ready? Let's master Factory Pattern! 🎯**`,
    lessonOrder: 3,
    duration: 40,
    videoUrl: 'https://www.youtube.com/watch?v=EcFVTgRHJLM',
    isPremium: false,
    isPublished: true,
  },

  // Lesson 4: Factory Pattern - Complete Guide
  {
    title: 'Design Patterns - Factory Pattern (Complete)',
    description: 'Factory Pattern এর complete implementation। Real-world examples, code snippets এবং best practices সহ।',
    topic: 'Factory Pattern',
    difficulty: 'intermediate',
    estimatedTime: 60,
    author: instructorId,
    content: `# Factory Pattern - সম্পূর্ণ গাইড

## 🎯 Factory Pattern কী?

**Factory Pattern** হলো একটি **Creational Design Pattern** যা object creation logic কে encapsulate করে একটি separate method বা class এ। Client code সরাসরি \`new\` keyword ব্যবহার করে না, বরং factory method call করে object পায়।

## 🤔 কেন Factory Pattern?

### Problem Scenario:

\`\`\`java
// ❌ Without Factory - Tight Coupling
public class PaymentService {
    public void processPayment(String type, double amount) {
        if (type.equals("BKASH")) {
            BkashPayment payment = new BkashPayment();
            payment.pay(amount);
        } else if (type.equals("NAGAD")) {
            NagadPayment payment = new NagadPayment();
            payment.pay(amount);
        } else if (type.equals("ROCKET")) {
            RocketPayment payment = new RocketPayment();
            payment.pay(amount);
        }
        // নতুন payment method যোগ করতে code modify করতে হবে!
    }
}
\`\`\`

**Problems:**
- ❌ High coupling
- ❌ Violates Open/Closed Principle
- ❌ Hard to maintain
- ❌ Testing difficult

## ✅ Solution: Factory Pattern

### Step 1: Create Interface

\`\`\`java
// Payment interface - Common contract
public interface Payment {
    void pay(double amount);
    String getPaymentMethod();
}
\`\`\`

### Step 2: Concrete Implementations

\`\`\`java
// Bkash Implementation
public class BkashPayment implements Payment {
    @Override
    public void pay(double amount) {
        System.out.println("Processing bKash payment: " + amount + " BDT");
        // bKash API integration
    }
    
    @Override
    public String getPaymentMethod() {
        return "bKash";
    }
}

// Nagad Implementation
public class NagadPayment implements Payment {
    @Override
    public void pay(double amount) {
        System.out.println("Processing Nagad payment: " + amount + " BDT");
        // Nagad API integration
    }
    
    @Override
    public String getPaymentMethod() {
        return "Nagad";
    }
}

// Rocket Implementation
public class RocketPayment implements Payment {
    @Override
    public void pay(double amount) {
        System.out.println("Processing Rocket payment: " + amount + " BDT");
        // Rocket API integration
    }
    
    @Override
    public String getPaymentMethod() {
        return "Rocket";
    }
}
\`\`\`

### Step 3: Factory Class

\`\`\`java
// Payment Factory - Creates payment objects
public class PaymentFactory {
    
    // Factory method
    public static Payment createPayment(String type) {
        if (type == null || type.isEmpty()) {
            throw new IllegalArgumentException("Payment type cannot be null or empty");
        }
        
        switch (type.toUpperCase()) {
            case "BKASH":
                return new BkashPayment();
            case "NAGAD":
                return new NagadPayment();
            case "ROCKET":
                return new RocketPayment();
            default:
                throw new IllegalArgumentException("Unknown payment type: " + type);
        }
    }
}
\`\`\`

### Step 4: Client Code (Clean!)

\`\`\`java
// ✅ With Factory - Loose Coupling
public class PaymentService {
    public void processPayment(String type, double amount) {
        try {
            // Factory creates the object
            Payment payment = PaymentFactory.createPayment(type);
            
            // Use the object
            System.out.println("Selected: " + payment.getPaymentMethod());
            payment.pay(amount);
            
            System.out.println("Payment successful!");
        } catch (IllegalArgumentException e) {
            System.err.println("Error: " + e.getMessage());
        }
    }
}

// Main Application
public class Main {
    public static void main(String[] args) {
        PaymentService service = new PaymentService();
        
        // Different payment methods
        service.processPayment("BKASH", 1500.00);
        service.processPayment("NAGAD", 2000.00);
        service.processPayment("ROCKET", 1000.00);
    }
}
\`\`\`

**Output:**
\`\`\`
Selected: bKash
Processing bKash payment: 1500.0 BDT
Payment successful!
Selected: Nagad
Processing Nagad payment: 2000.0 BDT
Payment successful!
Selected: Rocket
Processing Rocket payment: 1000.0 BDT
Payment successful!
\`\`\`

## 🌟 Real-World Example: Notification System

### Complete Implementation:

\`\`\`java
// 1. Notification Interface
public interface Notification {
    void send(String recipient, String message);
    boolean validate(String recipient);
}

// 2. Email Notification
public class EmailNotification implements Notification {
    @Override
    public void send(String recipient, String message) {
        System.out.println("📧 Sending email to: " + recipient);
        System.out.println("Message: " + message);
        // SMTP integration
    }
    
    @Override
    public boolean validate(String recipient) {
        return recipient.contains("@");
    }
}

// 3. SMS Notification
public class SMSNotification implements Notification {
    @Override
    public void send(String recipient, String message) {
        System.out.println("📱 Sending SMS to: " + recipient);
        System.out.println("Message: " + message);
        // SMS gateway integration
    }
    
    @Override
    public boolean validate(String recipient) {
        return recipient.matches("\\d{11}");
    }
}

// 4. Push Notification
public class PushNotification implements Notification {
    @Override
    public void send(String recipient, String message) {
        System.out.println("🔔 Sending push notification to: " + recipient);
        System.out.println("Message: " + message);
        // FCM integration
    }
    
    @Override
    public boolean validate(String recipient) {
        return recipient.startsWith("device_");
    }
}

// 5. WhatsApp Notification (নতুন যোগ করা সহজ!)
public class WhatsAppNotification implements Notification {
    @Override
    public void send(String recipient, String message) {
        System.out.println("💬 Sending WhatsApp to: " + recipient);
        System.out.println("Message: " + message);
        // WhatsApp Business API
    }
    
    @Override
    public boolean validate(String recipient) {
        return recipient.matches("\\+\\d{11,}");
    }
}

// 6. Notification Factory
public class NotificationFactory {
    
    public static Notification createNotification(String type) {
        switch (type.toUpperCase()) {
            case "EMAIL":
                return new EmailNotification();
            case "SMS":
                return new SMSNotification();
            case "PUSH":
                return new PushNotification();
            case "WHATSAPP":
                return new WhatsAppNotification();
            default:
                throw new IllegalArgumentException("Unsupported notification type: " + type);
        }
    }
    
    // Overloaded method with priority
    public static Notification createNotification(String type, boolean isUrgent) {
        Notification notification = createNotification(type);
        
        if (isUrgent) {
            System.out.println("⚡ URGENT notification!");
        }
        
        return notification;
    }
}

// 7. Notification Service
public class NotificationService {
    
    public void sendNotification(String type, String recipient, String message) {
        try {
            // Create notification using factory
            Notification notification = NotificationFactory.createNotification(type);
            
            // Validate recipient
            if (!notification.validate(recipient)) {
                System.err.println("Invalid recipient format!");
                return;
            }
            
            // Send notification
            notification.send(recipient, message);
            System.out.println("✅ Notification sent successfully!\\n");
            
        } catch (Exception e) {
            System.err.println("❌ Error: " + e.getMessage() + "\\n");
        }
    }
}

// 8. Complete Application
public class NotificationApp {
    public static void main(String[] args) {
        NotificationService service = new NotificationService();
        
        // Email notification
        service.sendNotification("EMAIL", 
            "user@example.com", 
            "Welcome to our platform!");
        
        // SMS notification
        service.sendNotification("SMS", 
            "01712345678", 
            "Your OTP is 123456");
        
        // Push notification
        service.sendNotification("PUSH", 
            "device_abc123", 
            "You have a new message");
        
        // WhatsApp notification
        service.sendNotification("WHATSAPP", 
            "+8801712345678", 
            "Order confirmed!");
        
        // Invalid notification type
        service.sendNotification("TELEGRAM", 
            "@username", 
            "Test message");
    }
}
\`\`\`

**Complete Output:**
\`\`\`
📧 Sending email to: user@example.com
Message: Welcome to our platform!
✅ Notification sent successfully!

📱 Sending SMS to: 01712345678
Message: Your OTP is 123456
✅ Notification sent successfully!

🔔 Sending push notification to: device_abc123
Message: You have a new message
✅ Notification sent successfully!

💬 Sending WhatsApp to: +8801712345678
Message: Order confirmed!
✅ Notification sent successfully!

❌ Error: Unsupported notification type: TELEGRAM
\`\`\`

## 🎯 Real-World Scenario: E-commerce

### Problem:
একটা e-commerce platform এ different shipping methods আছে:
- Standard Shipping
- Express Shipping
- Same Day Delivery
- International Shipping

### Complete Solution:

\`\`\`java
// Shipping Interface
public interface Shipping {
    double calculateCost(double weight, String destination);
    int getDeliveryDays();
    String getTrackingInfo();
}

// Standard Shipping
public class StandardShipping implements Shipping {
    @Override
    public double calculateCost(double weight, String destination) {
        return weight * 10; // 10 BDT per kg
    }
    
    @Override
    public int getDeliveryDays() {
        return 5;
    }
    
    @Override
    public String getTrackingInfo() {
        return "STD-" + System.currentTimeMillis();
    }
}

// Express Shipping
public class ExpressShipping implements Shipping {
    @Override
    public double calculateCost(double weight, String destination) {
        return weight * 25; // 25 BDT per kg
    }
    
    @Override
    public int getDeliveryDays() {
        return 2;
    }
    
    @Override
    public String getTrackingInfo() {
        return "EXP-" + System.currentTimeMillis();
    }
}

// Same Day Delivery
public class SameDayDelivery implements Shipping {
    @Override
    public double calculateCost(double weight, String destination) {
        return weight * 50 + 100; // Base 100 BDT + 50/kg
    }
    
    @Override
    public int getDeliveryDays() {
        return 1;
    }
    
    @Override
    public String getTrackingInfo() {
        return "SDD-" + System.currentTimeMillis();
    }
}

// Shipping Factory
public class ShippingFactory {
    public static Shipping createShipping(String type, String city) {
        switch (type.toUpperCase()) {
            case "STANDARD":
                return new StandardShipping();
            case "EXPRESS":
                return new ExpressShipping();
            case "SAME_DAY":
                // Same day শুধু নির্দিষ্ট cities এ available
                if (city.equalsIgnoreCase("Dhaka") || 
                    city.equalsIgnoreCase("Chittagong")) {
                    return new SameDayDelivery();
                } else {
                    throw new IllegalArgumentException(
                        "Same day delivery not available in " + city);
                }
            default:
                throw new IllegalArgumentException("Unknown shipping type");
        }
    }
}

// Order Service
public class OrderService {
    public void processOrder(String shippingType, String city, double weight) {
        try {
            // Create shipping using factory
            Shipping shipping = ShippingFactory.createShipping(shippingType, city);
            
            // Calculate cost
            double cost = shipping.calculateCost(weight, city);
            int days = shipping.getDeliveryDays();
            String tracking = shipping.getTrackingInfo();
            
            // Display info
            System.out.println("📦 Order Details:");
            System.out.println("   Shipping: " + shippingType);
            System.out.println("   Destination: " + city);
            System.out.println("   Weight: " + weight + " kg");
            System.out.println("   Cost: " + cost + " BDT");
            System.out.println("   Delivery: " + days + " days");
            System.out.println("   Tracking: " + tracking);
            System.out.println("   Status: ✅ Order Confirmed\\n");
            
        } catch (Exception e) {
            System.err.println("❌ Error: " + e.getMessage() + "\\n");
        }
    }
}

// Main Application
public class EcommerceApp {
    public static void main(String[] args) {
        OrderService orderService = new OrderService();
        
        // Standard shipping
        orderService.processOrder("STANDARD", "Sylhet", 2.5);
        
        // Express shipping
        orderService.processOrder("EXPRESS", "Dhaka", 1.5);
        
        // Same day delivery (Dhaka - Available)
        orderService.processOrder("SAME_DAY", "Dhaka", 1.0);
        
        // Same day delivery (Sylhet - Not available)
        orderService.processOrder("SAME_DAY", "Sylhet", 1.0);
    }
}
\`\`\`

## 📝 Practice Questions

### Question 1: Basic Understanding
**Scenario:** আপনি একটা Restaurant Management System তৈরি করছেন যেখানে different types এর dishes আছে (Appetizer, MainCourse, Dessert)। Factory Pattern ব্যবহার করে implement করুন।

**Solution Approach:**
\`\`\`java
interface Dish {
    void prepare();
    double getPrice();
}

class Appetizer implements Dish { /* implementation */ }
class MainCourse implements Dish { /* implementation */ }
class Dessert implements Dish { /* implementation */ }

class DishFactory {
    public static Dish createDish(String type) {
        // Your implementation
    }
}
\`\`\`

### Question 2: Advanced
**Scenario:** একটা Document Management System এ different formats (PDF, Word, Excel) এর documents আছে। প্রতিটি format এর জন্য আলাদা processing logic আছে। Factory Pattern দিয়ে solution করুন।

### Question 3: Real-World
**Scenario:** একটা Banking System এ different account types (Savings, Current, Fixed Deposit) আছে। প্রতিটির interest calculation আলাদা। Factory Pattern implement করুন।

## ✅ Advantages

1. **Loose Coupling** - Client code concrete classes থেকে independent
2. **Open/Closed Principle** - নতুন types যোগ করা সহজ, existing code modify না করে
3. **Single Responsibility** - Creation logic separate
4. **Code Reusability** - Factory method reuse করা যায়
5. **Testing Easy** - Mock objects ব্যবহার করা সহজ

## ❌ Disadvantages

1. **Complexity** - অনেক classes এবং interfaces তৈরি হয়
2. **Overkill** - Simple cases এ unnecessary
3. **Indirection** - Extra layer of abstraction

## 🎯 When to Use?

### ✅ Use করুন যখন:
- Object creation logic complex
- Runtime এ type decide করতে হয়
- নতুন types frequently যোগ হয়
- Creation code কে client code থেকে separate করতে চান

### ❌ Use করবেন না যখন:
- খুব simple object creation
- Types fixed এবং কম
- Performance critical (extra method call)

## 🚀 Summary

Factory Pattern শিখলেন! এখন আপনি:
- ✅ Object creation logic encapsulate করতে পারবেন
- ✅ Flexible এবং maintainable code লিখতে পারবেন
- ✅ New types সহজে যোগ করতে পারবেন
- ✅ Real-world problems solve করতে পারবেন

**Next Lesson: Abstract Factory Pattern - আরো powerful! 🎯**`,
    lessonOrder: 4,
    duration: 60,
    videoUrl: 'https://www.youtube.com/watch?v=EcFVTgRHJLM',
    isPremium: false,
    isPublished: true,
  },
];

const quizzesData: any[] = [];

const seedJavaDesignPatternsCourse = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/microlearning-db');
    console.log('📦 Connected to MongoDB\n');

    console.log('🎓 Starting Java Design Patterns Course Creation...\n');
    console.log('='.repeat(70));

    // Check if course already exists
    const existingCourse = await Course.findOne({ 
      title: courseName, 
      instructor: instructorId 
    });

    let course: any;
    if (existingCourse) {
      console.log(`📚 Course already exists, updating...\n`);
      course = await Course.findByIdAndUpdate(
        existingCourse._id,
        courseData,
        { new: true }
      );
      // Delete existing lessons and quizzes
      await Lesson.deleteMany({ course: course._id });
      await Quiz.deleteMany({ course: course._id });
    } else {
      console.log(`📚 Creating new course: ${courseName}\n`);
      course = await Course.create(courseData);
    }

    console.log(`✅ Course created/updated: ${course.title}`);
    console.log(`   📝 Level: ${course.level}`);
    console.log(`   ⏱️  Duration: ${course.duration} minutes`);
    console.log(`   💰 Price: ${course.price === 0 ? 'FREE' : course.price + ' BDT'}`);
    console.log('');

    // Create Lessons
    console.log('📖 Creating lessons...\n');
    const createdLessons: any[] = [];

    for (let i = 0; i < lessonsData.length; i++) {
      const lessonData = lessonsData[i];
      
      const lesson = await Lesson.create({
        ...lessonData,
        course: course._id,
      });

      createdLessons.push(lesson);
      console.log(`   ✅ Lesson ${(lesson as any).lessonOrder}: ${(lesson as any).title}`);
      console.log(`      ⏱️  Duration: ${(lesson as any).duration} min`);
    }

    // Create Quizzes
    console.log('\n📝 Creating quizzes...\n');
    const createdQuizzes: any[] = [];

    for (let i = 0; i < quizzesData.length; i++) {
      const quizData = quizzesData[i];
      
      const quiz = await Quiz.create({
        ...quizData,
        course: course._id,
      });

      createdQuizzes.push(quiz);
      console.log(`   ✅ Quiz ${(quiz as any).lessonOrder}: ${(quiz as any).title}`);
      console.log(`      ❓ Questions: ${(quiz as any).questions.length}`);
    }

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('✨ Course Creation Summary');
    console.log('='.repeat(70));
    console.log(`👨‍🏫 Instructor: Dr. Kamal Hassan`);
    console.log(`📚 Course: ${course.title}`);
    console.log(`🆔 Course ID: ${course._id}`);
    console.log(`📖 Total Lessons: ${createdLessons.length}`);
    console.log(`📝 Total Quizzes: ${createdQuizzes.length}`);
    console.log(`❓ Total Questions: ${createdQuizzes.reduce((sum, q) => sum + (q as any).questions.length, 0)}`);
    console.log(`⏱️  Total Duration: ${createdLessons.reduce((sum, l) => sum + (l as any).duration, 0)} minutes`);
    console.log(`🎯 Learning Outcomes: ${courseData.learningOutcomes.length}`);

    console.log('\n📋 Lessons Created:');
    createdLessons.forEach((lesson: any) => {
      console.log(`   ${lesson.lessonOrder}. ${lesson.title} (${lesson.duration} min)`);
    });

    console.log('\n✅ Java Design Patterns Course created successfully!');
    console.log('🎉 Students can now enroll and start learning!\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedJavaDesignPatternsCourse();
