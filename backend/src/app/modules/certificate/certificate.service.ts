import Certificate from './certificate.model';
import { Course, Enrollment } from '../course/course.model';
import User from '../auth/auth.model';
import ApiError from '../../../utils/ApiError';
import crypto from 'crypto';

class CertificateService {
  // Generate unique certificate ID
  private generateCertificateId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `CERT-${timestamp}-${random}`;
  }

  // Generate verification code
  private generateVerificationCode(): string {
    return crypto.randomBytes(16).toString('hex').toUpperCase();
  }

  // Generate certificate
  async generateCertificate(userId: string, courseId: string) {
    // Check if course exists
    const course = await Course.findById(courseId).populate('author', 'name');
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    // Check if user completed the course
    const enrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
    });

    if (!enrollment) {
      throw new ApiError(404, 'Enrollment not found');
    }

    if (enrollment.progress < 100 || !enrollment.completedAt) {
      throw new ApiError(400, 'Course not completed yet. Complete all lessons first.');
    }

    // Check if certificate already exists
    const existingCertificate = await Certificate.findOne({
      user: userId,
      course: courseId,
    });

    if (existingCertificate) {
      return await Certificate.findById(existingCertificate._id)
        .populate('user', 'name email')
        .populate('course', 'title')
        .lean();
    }

    // Get user info
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Create certificate
    const certificate = await Certificate.create({
      user: userId,
      course: courseId,
      certificateId: this.generateCertificateId(),
      verificationCode: this.generateVerificationCode(),
      issuedDate: new Date(),
      metadata: {
        userName: user.name,
        courseName: course.title,
        completionDate: enrollment.completedAt,
        totalLessons: course.lessons.length,
        instructor: (course.author as any)?.name || 'MicroLearning',
      },
    });

    // Award bonus XP for certificate
    user.xp += 100;
    const newLevel = Math.floor(user.xp / 100) + 1;
    if (newLevel > user.level) {
      user.level = newLevel;
    }
    await user.save();

    return await Certificate.findById(certificate._id)
      .populate('user', 'name email')
      .populate('course', 'title')
      .lean();
  }

  // Get user certificates
  async getUserCertificates(userId: string) {
    const certificates = await Certificate.find({
      user: userId,
      isRevoked: false,
    })
      .populate('course', 'title thumbnailUrl difficulty')
      .sort({ issuedDate: -1 })
      .lean();

    return certificates;
  }

  // Get certificate by ID
  async getCertificateById(certificateId: string) {
    const certificate = await Certificate.findOne({ certificateId })
      .populate('user', 'name email profilePicture')
      .populate('course', 'title description difficulty')
      .lean();

    if (!certificate) {
      throw new ApiError(404, 'Certificate not found');
    }

    if (certificate.isRevoked) {
      throw new ApiError(400, 'Certificate has been revoked');
    }

    return certificate;
  }

  // Verify certificate
  async verifyCertificate(verificationCode: string) {
    const certificate = await Certificate.findOne({ verificationCode })
      .populate('user', 'name email')
      .populate('course', 'title')
      .lean();

    if (!certificate) {
      return {
        valid: false,
        message: 'Invalid verification code',
      };
    }

    if (certificate.isRevoked) {
      return {
        valid: false,
        message: 'Certificate has been revoked',
      };
    }

    return {
      valid: true,
      certificate: {
        certificateId: certificate.certificateId,
        userName: certificate.metadata.userName,
        courseName: certificate.metadata.courseName,
        issuedDate: certificate.issuedDate,
        completionDate: certificate.metadata.completionDate,
      },
    };
  }

  // Revoke certificate (admin only)
  async revokeCertificate(certificateId: string) {
    const certificate = await Certificate.findOne({ certificateId });

    if (!certificate) {
      throw new ApiError(404, 'Certificate not found');
    }

    certificate.isRevoked = true;
    await certificate.save();

    return { message: 'Certificate revoked successfully' };
  }

  // Get certificate statistics
  async getCertificateStats(userId: string) {
    const [total, thisMonth, thisYear] = await Promise.all([
      Certificate.countDocuments({ user: userId, isRevoked: false }),
      Certificate.countDocuments({
        user: userId,
        isRevoked: false,
        issuedDate: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      }),
      Certificate.countDocuments({
        user: userId,
        isRevoked: false,
        issuedDate: {
          $gte: new Date(new Date().getFullYear(), 0, 1),
        },
      }),
    ]);

    return {
      total,
      thisMonth,
      thisYear,
    };
  }
}

export default new CertificateService();
