import { Course, Enrollment } from './course.model';
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

    return {
      courses,
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
      .populate('lessons.lesson', 'title description estimatedTime difficulty')
      .lean();

    if (!course) {
      throw new ApiError(404, 'Course not found');
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

    // Check if course is paid - require payment/order verification
    if (course.isPremium && course.price && course.price > 0) {
      // TODO: Add payment verification here
      // For now, checking if user has premium or admin role
      const user = await User.findById(userId);
      if (!user?.isPremium && user?.role !== 'admin') {
        throw new ApiError(403, 'Payment required for this course. Please complete the payment first.');
      }
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

  // Get user enrollments
  async getUserEnrollments(userId: string) {
    const enrollments = await Enrollment.find({ user: userId })
      .populate({
        path: 'course',
        select: 'title description thumbnailUrl difficulty estimatedDuration',
        populate: {
          path: 'author',
          select: 'name profilePicture',
        },
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

  // Get instructor analytics
  async getInstructorAnalytics(userId: string) {
    const courses = await Course.find({ author: userId }).lean();
    const courseIds = courses.map((c) => c._id);

    // Get all enrollments for instructor's courses
    const enrollments = await Enrollment.find({ course: { $in: courseIds } })
      .populate('user', 'name email')
      .populate('course', 'title')
      .lean();

    // Calculate statistics
    const totalCourses = courses.length;
    const totalStudents = new Set(enrollments.map((e) => e.user._id.toString())).size;
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

    return {
      totalCourses,
      totalStudents,
      totalEnrollments,
      completedEnrollments,
      completionRate: totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0,
      averageProgress: Math.round(avgProgress),
      totalRevenue,
      recentEnrollments,
      courses: courses.map((c) => ({
        id: c._id,
        title: c.title,
        enrolledCount: c.enrolledCount || 0,
        price: c.price || 0,
        isPublished: c.isPublished,
      })),
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
}

export default new CourseService();
