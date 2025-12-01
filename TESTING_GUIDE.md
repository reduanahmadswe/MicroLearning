# 🧪 Quick Testing Guide

## Prerequisites
```bash
# Backend running on http://localhost:5000
# Frontend running on http://localhost:3000

# Test Accounts Needed:
1. Instructor Account (role: instructor)
2. Student Account (role: learner)
3. Admin Account (role: admin) - optional
```

---

## 🎯 Quick Test Flow (5 minutes)

### 1. Instructor Creates Course Structure (2 min)

#### Step 1.1: Create Course
```
URL: http://localhost:3000/instructor/courses/create

Fill:
- Title: "Quick Test Course"
- Description: "Test course for workflow verification"
- Topic: "Testing"
- Difficulty: "beginner"
- Course Type: Free (toggle)
- Thumbnail: (optional, use placeholder)

Click: "Create Course"
Expected: ✅ Course created, redirected to course list
```

#### Step 1.2: Create Lesson 1
```
URL: http://localhost:3000/instructor/courses/[courseId]/lessons/create

Fill:
- Title: "Test Lesson 1"
- Description: "First test lesson"
- Content: "This is test content for lesson 1. This must be at least 50 characters long to pass validation."
- Topic: "Testing Basics"
- Difficulty: "beginner"
- Estimated Time: 10

Click: "Create Lesson"
Expected: ✅ Prompt appears "Create quiz now?"
Action: Click "Yes"
```

#### Step 1.3: Create Quiz for Lesson 1
```
URL: http://localhost:3000/instructor/courses/[courseId]/lessons/[lessonId]/quiz/create

Verify:
- ⚠️ Warning banner shows "80% or higher"
- Course title displayed
- Lesson title displayed

Add Question 1:
- Type: MCQ
- Question: "What is 2 + 2?"
- Options: ["3", "4", "5", "6"]
- Correct Answer: "4"
- Points: 10

Add Question 2:
- Type: True/False
- Question: "The sky is blue"
- Correct Answer: "true"
- Points: 10

Click: "Create Quiz"
Expected: ✅ Quiz created, redirected to course lessons page
```

#### Step 1.4: Create Lesson 2
```
URL: http://localhost:3000/instructor/courses/[courseId]/lessons/create

Fill:
- Title: "Test Lesson 2"
- Description: "Second test lesson"
- Content: "This is test content for lesson 2. Must also be at least 50 characters."
- Topic: "Testing Advanced"
- Difficulty: "beginner"
- Estimated Time: 15

Click: "Create Lesson"
Expected: ✅ Lesson created
Action: Click "No" when prompted (we'll create quiz later)
```

#### Step 1.5: Verify Lessons Page
```
URL: http://localhost:3000/instructor/courses/[courseId]/lessons

Verify:
✅ Lesson 1: Order badge "1", "Always Unlocked", "Quiz Created" (blue)
✅ Lesson 2: Order badge "2", "Requires Previous Quiz", "No Quiz" (red)
✅ "Create Quiz" button visible for Lesson 2
```

---

### 2. Student Tests Access & Unlocking (3 min)

#### Step 2.1: Enroll in Course
```
Logout instructor → Login as student

URL: http://localhost:3000/courses

Find: "Quick Test Course"
Click: Course card

Verify:
✅ Badge shows "Free"
✅ Button shows "Enroll for Free"
✅ Lesson 1 visible with "Always Unlocked" badge
✅ Lesson 2 visible with "Pass Previous Quiz (80%+)" badge

Click: "Enroll for Free"
Expected: ✅ Success message, progress bar shows 0%
```

#### Step 2.2: Access Lesson 1 (Should Work)
```
URL: http://localhost:3000/courses/[courseId]

Click: "Start" button on Lesson 1

Expected:
✅ Lesson content loads
✅ Header shows "Lesson 1" badge or "Always Unlocked" badge
✅ Content is visible
✅ "Take Quiz" button visible with text "Pass with 80%+ to unlock next"
```

#### Step 2.3: Try Access Lesson 2 (Should Be Locked)
```
URL: http://localhost:3000/courses/[courseId]

Click: Lesson 2 (should be disabled/locked)
OR manually navigate to: http://localhost:3000/lessons/[lesson2Id]

Expected:
✅ Locked page appears
✅ Shows 🔒 icon
✅ Message: "This lesson is locked. You must pass the quiz for 'Test Lesson 1'..."
✅ Shows unlock instructions (4 steps)
✅ "Back to Course" button visible
```

#### Step 2.4: Take Lesson 1 Quiz (Fail Test)
```
URL: http://localhost:3000/lessons/[lesson1Id]

Click: "Take Quiz"
URL changes to: http://localhost:3000/quiz/[quizId]

Verify:
✅ Shows "You must score 80% or higher to pass"
✅ 2 questions displayed

Answer INCORRECTLY:
- Question 1: Select "3" (wrong)
- Question 2: Select "false" (wrong)

Click: "Submit"

Expected:
✅ Result page shows:
   - "❌ You didn't pass this time"
   - Score: 0% (0/20 points)
   - "You need 80% to pass"
   - "Retry Quiz" button visible

Click: "Back to Course"
```

#### Step 2.5: Verify Lesson 2 Still Locked
```
URL: http://localhost:3000/courses/[courseId]

Verify:
✅ Lesson 2 still shows "Pass Previous Quiz (80%+)" badge
✅ Lesson 2 "Start" button disabled or shows lock icon
```

#### Step 2.6: Retry Quiz (Pass Test)
```
URL: http://localhost:3000/lessons/[lesson1Id]

Click: "Take Quiz"

Answer CORRECTLY:
- Question 1: Select "4" ✅
- Question 2: Select "true" ✅

Click: "Submit"

Expected:
✅ Result page shows:
   - "✅ Congratulations! You Passed!"
   - Score: 100% (20/20 points)
   - "Next lesson unlocked!"
   - "View Next Lesson" button visible
```

#### Step 2.7: Verify Lesson 2 Unlocked
```
Click: "View Next Lesson"
OR navigate to: http://localhost:3000/courses/[courseId]

Verify:
✅ Lesson 2 now shows "Start" button (enabled)
✅ Progress bar updated (50% if 2 lessons total)
✅ Lesson 1 shows checkmark or "Review" button

Click: "Start" on Lesson 2

Expected:
✅ Lesson 2 content loads successfully
✅ No locked page
```

---

## ✅ Test Checklist

### Instructor Features
- [ ] Create course (free/paid)
- [ ] Create lesson under course
- [ ] Auto-order assignment works
- [ ] Create quiz for lesson
- [ ] Verify quiz status badges
- [ ] Manage lessons page shows correct info
- [ ] Cannot create duplicate quiz
- [ ] Edit lesson works
- [ ] Delete lesson works

### Student Features
- [ ] Browse courses
- [ ] View course details
- [ ] Enroll in free course (instant)
- [ ] View paid course (shows price, payment required)
- [ ] View enrolled course with progress
- [ ] Lesson 1 shows "Always Unlocked"
- [ ] Lesson 2+ shows "Pass Previous Quiz (80%+)"
- [ ] Access Lesson 1 (works)
- [ ] Try access Lesson 2 before quiz (locked)
- [ ] Take quiz, fail (< 80%)
- [ ] Verify next lesson still locked
- [ ] Retry quiz, pass (>= 80%)
- [ ] Verify next lesson unlocked
- [ ] Access next lesson (works)

### Access Control
- [ ] Guest cannot access lessons
- [ ] Not enrolled student cannot access lessons
- [ ] Enrolled student can access unlocked lessons only
- [ ] Direct URL to locked lesson is blocked
- [ ] Locked page shows clear instructions

### Validation
- [ ] Cannot create lesson without course
- [ ] Cannot create quiz without course
- [ ] Cannot create quiz without lesson
- [ ] Cannot create duplicate quiz
- [ ] Content validation works (min 50 chars)
- [ ] Time validation works (1-60 min)

### Progress & Certificates
- [ ] Progress updates after quiz pass
- [ ] Progress bar shows correct percentage
- [ ] Completing all lessons triggers certificate
- [ ] Certificate appears in /certificates
- [ ] Certificate shows correct details

---

## 🐛 Common Issues & Fixes

### Issue 1: Lesson 2 not unlocking after quiz pass
**Symptoms:** Passed quiz with 80%+, but Lesson 2 still shows locked

**Debug:**
```javascript
// Check quiz attempt
GET http://localhost:5000/api/v1/quizzes/[quizId]/attempts
// Should show: { passed: true, score: >= 80 }

// Check enrollment
GET http://localhost:5000/api/v1/courses/[courseId]/enrollment
// Should include lesson1Id in completedLessons array
```

**Fix:** Re-submit quiz or check backend quiz scoring logic

---

### Issue 2: "Requires course" error when creating lesson
**Symptoms:** Backend returns 400 error "Course ID is required"

**Debug:**
```javascript
// Check payload
console.log(payload);
// Should include: { course: "courseId123", ... }
```

**Fix:** Ensure course ID is passed from URL params and included in payload

---

### Issue 3: Quiz creation fails with "Lesson does not belong to course"
**Symptoms:** Backend returns 400 error

**Debug:**
```javascript
// Check lesson.course matches quiz.course
GET http://localhost:5000/api/v1/lessons/[lessonId]
// lesson.course should match the courseId you're passing
```

**Fix:** Ensure you're creating quiz from correct course context

---

### Issue 4: Cannot access lesson even though quiz passed
**Symptoms:** Locked page still appears

**Debug:**
```javascript
// Check lesson order
GET http://localhost:5000/api/v1/lessons/[lessonId]
// Verify: lesson.order is correct (2 for second lesson)

// Check previous lesson
GET http://localhost:5000/api/v1/lessons?course=[courseId]&order=1
// Should return lesson 1
```

**Fix:** Verify lesson order is sequential (1, 2, 3...) without gaps

---

## 📊 Expected Results Summary

| Action | Expected Result |
|--------|----------------|
| Create course | Course ID generated, empty lessons array |
| Create lesson 1 | Order = 1, course reference set |
| Create lesson 2 | Order = 2, course reference set |
| Create quiz | Passing score = 80%, quiz linked to lesson |
| Student enroll (free) | Instant enrollment, progress = 0% |
| Access lesson 1 | Content loads, "Always Unlocked" badge |
| Access lesson 2 (before quiz) | Locked page with instructions |
| Quiz fail (< 80%) | Score shown, "Retry" button, next lesson stays locked |
| Quiz pass (>= 80%) | Success message, next lesson unlocks, progress updates |
| Complete all lessons | Progress = 100%, certificate generated |

---

## 🚀 Quick Commands

### Check Backend Health
```bash
curl http://localhost:5000/api/v1/health
```

### Check Auth Token
```bash
# In browser console:
localStorage.getItem('token')
```

### Clear Auth (Logout)
```bash
# In browser console:
localStorage.removeItem('token')
localStorage.removeItem('user')
```

### Check Enrollment
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/v1/courses/COURSE_ID/enrollment
```

### Check Quiz Attempts
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/v1/quizzes/QUIZ_ID/attempts
```

---

## ✅ Success Criteria

All of these should work:
1. ✅ Instructor creates course → lesson → quiz workflow
2. ✅ Student enrolls in free course
3. ✅ Student accesses first lesson (always unlocked)
4. ✅ Student cannot access second lesson (locked)
5. ✅ Student takes quiz, fails → second lesson stays locked
6. ✅ Student retries quiz, passes → second lesson unlocks
7. ✅ Student can access second lesson
8. ✅ Progress updates correctly
9. ✅ All UI indicators work (badges, lock icons, progress bars)
10. ✅ Certificate generates after completing all lessons

**If all 10 criteria pass → System is working correctly! 🎉**

---

## 📝 Test Report Template

```
Test Date: ___________
Tester: ___________
Environment: Local (Backend: 5000, Frontend: 3000)

Test Results:
[ ] Instructor workflow complete
[ ] Student enrollment works
[ ] Lesson 1 accessible
[ ] Lesson 2 locked initially
[ ] Quiz fail keeps lock
[ ] Quiz pass unlocks lesson
[ ] All UI indicators correct
[ ] Progress tracking works
[ ] Certificate generation works

Issues Found:
1. ___________
2. ___________
3. ___________

Notes:
___________
___________
```

---

**Ready to test! Follow the 5-minute quick test flow above for fastest verification.** 🚀
