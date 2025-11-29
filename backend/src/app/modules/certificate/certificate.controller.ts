import { Request, Response } from 'express';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import certificateService from './certificate.service';

class CertificateController {
  // Generate certificate
  generateCertificate = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const { courseId } = req.body;
    const result = await certificateService.generateCertificate(userId, courseId);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Certificate generated successfully',
      data: result,
    });
  });

  // Get my certificates
  getMyCertificates = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const result = await certificateService.getUserCertificates(userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Certificates retrieved successfully',
      data: result,
    });
  });

  // Get certificate by ID
  getCertificateById = catchAsync(async (req: Request, res: Response) => {
    const { certificateId } = req.params;
    const result = await certificateService.getCertificateById(certificateId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Certificate retrieved successfully',
      data: result,
    });
  });

  // Verify certificate
  verifyCertificate = catchAsync(async (req: Request, res: Response) => {
    const { code } = req.params;
    const result = await certificateService.verifyCertificate(code);

    sendResponse(res, {
      statusCode: 200,
      success: result.valid,
      message: result.message || 'Certificate verified successfully',
      data: result.certificate,
    });
  });

  // Revoke certificate (admin only)
  revokeCertificate = catchAsync(async (req: Request, res: Response) => {
    const { certificateId } = req.params;
    const result = await certificateService.revokeCertificate(certificateId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: result.message,
    });
  });

  // Get certificate stats
  getCertificateStats = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const result = await certificateService.getCertificateStats(userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Certificate statistics retrieved successfully',
      data: result,
    });
  });
}

export default new CertificateController();
