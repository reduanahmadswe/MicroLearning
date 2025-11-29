import { z } from 'zod';

export const generateCertificateValidation = z.object({
  body: z.object({
    courseId: z.string({
      required_error: 'Course ID is required',
    }),
  }),
});

export const verifyCertificateValidation = z.object({
  params: z.object({
    code: z.string({
      required_error: 'Verification code is required',
    }),
  }),
});
