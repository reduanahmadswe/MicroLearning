import { Course, Enrollment, CoursePayment } from './course.model';
import Lesson from '../microLessons/lesson.model';
import User from '../auth/auth.model';
import ApiError from '../../../utils/ApiError';
import { ICreateCourseRequest } from './course.types';

class CourseService {
  // Create course
  async createCourse(userId: string, courseData: ICreateCourseRequest) {
    let estimatedDuration = 0;
    
    // Verify all lessons exist if lessons provided
    if (courseData.lessons && courseData.lessons.length > 0) {
      const lessonIds = courseData.lessons.map((l) => l.lesson);
      const lessons = await Lesson.find({ _id: { $in: lessonIds } });

      if (lessons.length !== lessonIds.length) {
        throw new ApiError(400, 'One or more lessons not found');
      }

      // Calculate estimated duration
      estimatedDuration = lessons.reduce(
        (total, lesson) => total + lesson.estimatedTime,
        0
      );
    }

    const course = await Course.create({
      ...courseData,
      author: userId,
      estimatedDuration,
      lessons: courseData.lessons || [],
      isPublished: true, // Auto-publish courses created by instructors
    });

    return await Course.findById(course._id)
      .populate('author', 'name profilePicture')
      .populate('lessons.lesson', 'title estimatedTime difficulty')
      .lean();
  }

  // Get all courses
  async getCourses(
    page: number = 1,
    limit: number = 10,
    filters: {
      topic?: string;
      difficulty?: string;
      isPremium?: string;
      author?: string;
    } = {}
  ) {
    const query: any = { isPublished: true };

    if (filters.topic) {
      query.topic = { $regex: filters.topic, $options: 'i' };
    }

    if (filters.difficulty) {
      query.difficulty = filters.difficulty;
    }

    if (filters.isPremium) {
      query.isPremium = filters.isPremium === 'true';
    }

    if (filters.author) {
      query.author = filters.author;
    }

    const skip = (page - 1) * limit;

    const [courses, total] = await Promise.all([
      Course.find(query)
        .populate('author', 'name profilePicture')
        .sort({ enrolledCount: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Course.countDocuments(query),
    ]);

    // Add lesson count for each course
    const coursesWithLessonCount = await Promise.all(
      courses.map(async (course) => {
        const lessonCount = await Lesson.countDocuments({ 
          course: course._id, 
          isPublished: true 
        });
        return {
          ...course,
          lessons: [], // Empty array to maintain structure
          lessonCount, // Add lesson count field
        };
      })
    );

    return {
      courses: coursesWithLessonCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get course by ID or slug
  async getCourseById(identifier: string, userId?: string) {
    const course = await Course.findOne({
      $or: [{ _id: identifier }, { slug: identifier }],
    })
      .populate('author', 'name profilePicture bio')
      .lean();

    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    // Fetch lessons directly from Lesson collection instead of course.lessons array
    const lessons = await Lesson.find({ 
      course: course._id,
      isPublished: true 
    })
      .select('title description estimatedTime difficulty order')
      .sort({ order: 1 })
      .lean();

    
    if (lessons.length > 0) {
    }

    // Check enrollment status if user is provided
    let isEnrolled = false;
    let enrollment = null;

    if (userId) {
      enrollment = await Enrollment.findOne({
        user: userId,
        course: course._id,
      }).lean();

      isEnrolled = !!enrollment;
    }

    return {
      ...course,
      lessons: lessons, // Use lessons from Lesson collection
      isEnrolled,
      enrollment,
    };
  }

  // Update course
  async updateCourse(courseId: string, userId: string, userRole: string, updateData: any) {
    const course = await Course.findById(courseId);

    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    // Check authorization
    if (course.author.toString() !== userId && userRole !== 'admin') {
      throw new ApiError(403, 'You are not authorized to update this course');
    }

    // If lessons are being updated, recalculate duration
    if (updateData.lessons) {
      const lessonIds = updateData.lessons.map((l: any) => l.lesson);
      const lessons = await Lesson.find({ _id: { $in: lessonIds } });

      if (lessons.length !== lessonIds.length) {
        throw new ApiError(400, 'One or more lessons not found');
      }

      updateData.estimatedDuration = lessons.reduce(
        (total, lesson) => total + lesson.estimatedTime,
        0
      );
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('author', 'name profilePicture')
      .populate('lessons.lesson', 'title estimatedTime difficulty');

    return updatedCourse;
  }

  // Delete course
  async deleteCourse(courseId: string, userId: string, userRole: string) {
    const course = await Course.findById(courseId);

    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    // Check authorization
    if (course.author.toString() !== userId && userRole !== 'admin') {
      throw new ApiError(403, 'You are not authorized to delete this course');
    }

    await course.deleteOne();

    return { message: 'Course deleted successfully' };
  }

  // Enroll in course
  async enrollInCourse(userId: string, courseId: string) {
    const course = await Course.findById(courseId);

    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    if (!course.isPublished) {
      throw new ApiError(400, 'Course is not published yet');
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
    });

    if (existingEnrollment) {
      throw new ApiError(400, 'Already enrolled in this course');
    }

    // Check if course is premium - require payment verification
    if (course.isPremium && course.price && course.price > 0) {
      // Check if payment has been completed
      const completedPayment = await CoursePayment.findOne({
        user: userId,
        course: courseId,
        paymentStatus: 'completed',
      });

      if (!completedPayment) {
        throw new ApiError(
          403, 
          'Payment required for this premium course. Please initiate payment first.'
        );
      }

      // Payment verified - proceed with enrollment
    }

    const enrollment = await Enrollment.create({
      user: userId,
      course: courseId,
    });

    // Increment enrolled count
    course.enrolledCount += 1;
    await course.save();

    return await Enrollment.findById(enrollment._id)
      .populate('course', 'title thumbnailUrl')
      .lean();
  }

  // Get single enrollment for a course
  async getEnrollment(userId: string, courseId: string) {
    const enrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
    })
      .populate('course', 'title thumbnailUrl')
      .lean();

    if (!enrollment) {
      throw new ApiError(404, 'Not enrolled in this course');
    }


    return enrollment;
  }

  // Get user enrollments
  async getUserEnrollments(userId: string) {
    const enrollments = await Enrollment.find({ user: userId })
      .populate({
        path: 'course',
        select: 'title description thumbnailUrl difficulty estimatedDuration lessons',
        populate: [
          {
            path: 'author',
            select: 'name profilePicture',
          },
          {
            path: 'lessons.lesson',
            select: 'title description summary difficulty estimatedTime thumbnailUrl media tags views likes',
          },
        ],
      })
      .sort({ createdAt: -1 })
      .lean();

    return enrollments;
  }

  // Update enrollment progress
  async updateEnrollmentProgress(userId: string, courseId: string, lessonId: string) {
    const enrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
    });

    if (!enrollment) {
      throw new ApiError(404, 'Enrollment not found');
    }

    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    // Add lesson to completed if not already there
    if (!enrollment.completedLessons.some((id) => id.toString() === lessonId)) {
      enrollment.completedLessons.push(lessonId as any);
    }

    // Update last accessed lesson
    enrollment.lastAccessedLesson = lessonId as any;

    // Calculate progress
    const totalLessons = course.lessons.length;
    const completedLessons = enrollment.completedLessons.length;
    enrollment.progress = Math.round((completedLessons / totalLessons) * 100);

    // Mark as completed if 100%
    if (enrollment.progress === 100 && !enrollment.completedAt) {
      enrollment.completedAt = new Date();

      // Award XP for course completion
      const user = await User.findById(userId);
      if (user) {
        user.xp += 200; // 200 XP for completing a course
        const newLevel = Math.floor(user.xp / 100) + 1;
        if (newLevel > user.level) {
          user.level = newLevel;
        }
        await user.save();
      }

      // Generate certificate
      await this.generateCertificate(userId, courseId);
    }

    await enrollment.save();

    return enrollment;
  }

  // Get course statistics
  async getCourseStatistics(courseId: string) {
    const enrollments = await Enrollment.find({ course: courseId });

    const totalEnrollments = enrollments.length;
    const completedEnrollments = enrollments.filter((e) => e.progress === 100).length;
    const averageProgress =
      enrollments.reduce((sum, e) => sum + e.progress, 0) / (totalEnrollments || 1);

    return {
      totalEnrollments,
      completedEnrollments,
      completionRate: totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0,
      averageProgress: Math.round(averageProgress),
    };
  }

  // Get instructor's courses
  async getInstructorCourses(userId: string) {
    const courses = await Course.find({ author: userId })
      .populate('lessons.lesson', 'title estimatedTime')
      .sort({ createdAt: -1 })
      .lean();

    // Get enrollment counts and actual lesson counts for each course
    const coursesWithStats = await Promise.all(
      courses.map(async (course) => {
        const enrollmentCount = await Enrollment.countDocuments({ course: course._id });
        
        // Count actual lessons in database for this course
        const lessonCount = await Lesson.countDocuments({ course: course._id });
        
        return {
          ...course,
          enrollmentCount,
          lessonCount,
        };
      })
    );

    return coursesWithStats;
  }

  // Get all students enrolled in instructor's courses
  async getInstructorStudents(userId: string) {
    // Get all courses by this instructor
    const courses = await Course.find({ author: userId }).lean();
    const courseIds = courses.map((c) => c._id);

    if (courseIds.length === 0) {
      return [];
    }

    // Get all enrollments for instructor's courses
    const enrollments = await Enrollment.find({ course: { $in: courseIds } })
      .populate('user', 'name email profilePicture level xp streak createdAt')
      .populate('course', 'title thumbnail')
      .lean();

    // Group enrollments by student
    const studentMap = new Map();

    enrollments.forEach((enrollment) => {
      const student = enrollment.user as any;
      const course = enrollment.course as any;
      const studentId = student._id.toString();

      if (!studentMap.has(studentId)) {
        // Determine if student is active (accessed in last 7 days)
        const lastAccess = enrollment.updatedAt || enrollment.startedAt;
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const isActive = new Date(lastAccess) >= sevenDaysAgo;

        studentMap.set(studentId, {
          _id: student._id,
          name: student.name,
          email: student.email,
          profilePicture: student.profilePicture,
          level: student.level || 1,
          xp: student.xp || 0,
          streak: student.streak || 0,
          joinedDate: student.createdAt,
          lastActive: lastAccess,
          status: isActive ? 'active' : 'inactive',
          totalProgress: 0,
          enrolledCourses: [],
        });
      }

      const studentData = studentMap.get(studentId);

      // Add course enrollment data
      studentData.enrolledCourses.push({
        _id: course._id,
        title: course.title,
        thumbnail: course.thumbnailUrl,
        progress: enrollment.progress || 0,
        enrolledAt: enrollment.startedAt,
        lastAccessed: enrollment.updatedAt || enrollment.startedAt,
        completedLessons: enrollment.completedLessons?.length || 0,
        totalLessons: course.lessons?.length || 0,
        quizzesTaken: 0, // Will be populated from quiz module later
        averageScore: 0, // Will be populated from quiz module later
      });
    });

    // Calculate average progress for each student
    const students = Array.from(studentMap.values()).map((student) => {
      const totalProgress = student.enrolledCourses.reduce(
        (sum: number, course: any) => sum + course.progress,
        0
      );
      student.totalProgress = Math.round(
        totalProgress / (student.enrolledCourses.length || 1)
      );
      return student;
    });

    // Sort by last active date (most recent first)
    students.sort((a, b) => {
      return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
    });

    return students;
  }

  // Get instructor analytics
  async getInstructorAnalytics(userId: string) {
    const courses = await Course.find({ author: userId }).lean();
    const courseIds = courses.map((c) => c._id);

    if (courseIds.length === 0) {
      return {
        overview: {
          totalCourses: 0,
          totalStudents: 0,
          totalEnrollments: 0,
          totalRevenue: 0,
          avgProgress: 0,
          completionRate: 0,
          activeStudents: 0,
          recentEnrollments: 0,
        },
        courses: [],
        enrollmentTrend: [],
        topPerformingCourses: [],
        studentEngagement: {
          active: 0,
          inactive: 0,
          moderatelyActive: 0,
        },
        revenueByMonth: [],
      };
    }

    // Get all enrollments for instructor's courses
    const enrollments = await Enrollment.find({ course: { $in: courseIds } })
      .populate('user', 'name email')
      .populate('course', 'title')
      .lean();

    // Calculate statistics
    const totalCourses = courses.length;
    const totalStudents = new Set(enrollments.map((e) => (e.user as any)._id.toString())).size;
    const totalEnrollments = enrollments.length;
    const completedEnrollments = enrollments.filter((e) => !!e.completedAt).length;
    const totalRevenue = courses.reduce((sum, c) => sum + (c.price || 0) * (c.enrolledCount || 0), 0);

    // Get average progress
    const avgProgress =
      enrollments.length > 0
        ? enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length
        : 0;

    // Recent enrollments (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentEnrollments = enrollments.filter(
      (e) => new Date(e.startedAt) >= thirtyDaysAgo
    ).length;

    // Calculate active students (accessed in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const activeStudents = enrollments.filter(
      (e) => new Date(e.updatedAt) >= sevenDaysAgo
    ).length;

    // Calculate student engagement
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    const moderatelyActive = enrollments.filter(
      (e) => new Date(e.updatedAt) >= fourteenDaysAgo && new Date(e.updatedAt) < sevenDaysAgo
    ).length;
    const inactive = totalEnrollments - activeStudents - moderatelyActive;

    // Get course analytics
    const courseAnalytics = courses.map((course) => {
      const courseEnrollments = enrollments.filter(
        (e) => (e.course as any)._id.toString() === course._id.toString()
      );
      const completedCount = courseEnrollments.filter((e) => !!e.completedAt).length;
      const avgCourseProgress =
        courseEnrollments.length > 0
          ? courseEnrollments.reduce((sum, e) => sum + e.progress, 0) / courseEnrollments.length
          : 0;
      const activeCourseStudents = courseEnrollments.filter(
        (e) => new Date(e.updatedAt) >= sevenDaysAgo
      ).length;

      return {
        _id: course._id,
        title: course.title,
        enrolledCount: courseEnrollments.length,
        completionRate: courseEnrollments.length > 0 ? Math.round((completedCount / courseEnrollments.length) * 100) : 0,
        avgProgress: Math.round(avgCourseProgress),
        avgRating: course.rating || 0,
        totalRevenue: (course.price || 0) * courseEnrollments.length,
        activeStudents: activeCourseStudents,
        totalLessons: course.lessons?.length || 0,
        totalQuizzes: 0, // Will be populated later
      };
    });

    // Sort courses by enrollment for top performing
    const topPerformingCourses = [...courseAnalytics]
      .sort((a, b) => b.enrolledCount - a.enrolledCount)
      .slice(0, 3)
      .map((c) => ({
        _id: c._id,
        title: c.title,
        metric: c.enrolledCount,
      }));

    // Generate enrollment trend (last 6 months)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const enrollmentTrend = [];
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const monthEnrollments = enrollments.filter((e) => {
        const enrollMonth = new Date(e.startedAt).getMonth();
        return enrollMonth === monthIndex;
      }).length;
      enrollmentTrend.push({
        month: months[monthIndex],
        enrollments: monthEnrollments,
      });
    }

    // Generate revenue by month
    const revenueByMonth = enrollmentTrend.map((trend) => ({
      month: trend.month,
      revenue: trend.enrollments * 50, // Placeholder calculation
    }));

    return {
      overview: {
        totalCourses,
        totalStudents,
        totalEnrollments,
        totalRevenue,
        avgProgress: Math.round(avgProgress),
        completionRate: totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0,
        activeStudents,
        recentEnrollments,
      },
      courses: courseAnalytics,
      enrollmentTrend,
      topPerformingCourses,
      studentEngagement: {
        active: activeStudents,
        moderatelyActive,
        inactive,
      },
      revenueByMonth,
    };
  }

  // Get course students
  async getCourseStudents(courseId: string, userId: string, userRole: string) {
    // Verify course exists and belongs to instructor
    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    if (userRole !== 'admin' && course.author.toString() !== userId) {
      throw new ApiError(403, 'You do not have permission to view this course students');
    }

    const students = await Enrollment.find({ course: courseId })
      .populate('user', 'name email profilePicture')
      .sort({ startedAt: -1 })
      .lean();

    return students.map((enrollment) => ({
      student: enrollment.user,
      enrolledAt: enrollment.startedAt,
      progress: enrollment.progress,
      isCompleted: !!enrollment.completedAt,
      completedLessons: enrollment.completedLessons,
      lastAccessedLesson: enrollment.lastAccessedLesson,
      completedAt: enrollment.completedAt,
    }));
  }

  // Generate certificate for course completion
  private async generateCertificate(userId: string, courseId: string) {
    const Certificate = require('../certificate/certificate.model').default;
    
    // Check if certificate already exists
    const existingCertificate = await Certificate.findOne({
      user: userId,
      course: courseId,
    });

    if (existingCertificate) {
      return existingCertificate;
    }

    const user = await User.findById(userId);
    const course = await Course.findById(courseId).populate('author', 'name');
    
    if (!user || !course) {
      return null;
    }

    // Generate unique certificate ID and verification code
    const certificateId = `CERT-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
    const verificationCode = `${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const certificate = await Certificate.create({
      user: userId,
      course: courseId,
      certificateId,
      verificationCode,
      metadata: {
        userName: user.name,
        courseName: course.title,
        completionDate: new Date(),
        totalLessons: course.lessons.length,
        instructor: (course.author as any)?.name || 'Instructor',
      },
    });

    return certificate;
  }

  // Toggle course publish status
  async togglePublishStatus(courseId: string, userId: string, userRole: string) {
    const course = await Course.findById(courseId);

    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    // Check if user is the author or admin
    if (course.author.toString() !== userId && userRole !== 'admin') {
      throw new ApiError(403, 'You are not authorized to publish/unpublish this course');
    }

    // Toggle publish status
    course.isPublished = !course.isPublished;
    await course.save();

    return course;
  }
}

export default new CourseService();
