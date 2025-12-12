'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useAuthStore } from '@/store/authStore';
import { Award, Download, Share2, CheckCircle, Lock, Loader2 } from 'lucide-react';

interface Certificate {
  _id: string;
  certificateId: string;
  verificationCode: string;
  user: {
    name: string;
    email: string;
  };
  course: {
    _id: string;
    title: string;
  };
  metadata: {
    userName: string;
    courseName: string;
    completionDate: string;
    totalLessons: number;
    instructor: string;
  };
  createdAt: string;
}

interface EnrolledCourse {
  _id: string;
  course: {
    _id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
  };
  progress: number;
  completedAt?: string;
}

export default function CertificatesPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const certificateRef = useRef<HTMLDivElement>(null);

  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch earned certificates
      const certRes = await axios.get('https://microlearning-backend-reduan.onrender.com/api/v1/certificates/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCertificates(certRes.data.data);

      // Fetch enrolled courses
      const enrollRes = await axios.get('https://microlearning-backend-reduan.onrender.com/api/v1/courses/enrollments/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEnrolledCourses(enrollRes.data.data);
    } catch (error: any) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCertificate = async (courseId: string, courseName: string) => {
    try {
      // Check if certificate already exists
      const existingCert = certificates.find(cert => cert.course._id === courseId);

      if (existingCert) {
        // Certificate exists, show it
        setSelectedCertificate(existingCert);
      } else {
        // Certificate doesn't exist, generate it
        const generateRes = await axios.post(
          'https://microlearning-backend-reduan.onrender.com/api/v1/certificates/generate',
          { courseId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (generateRes.data.success) {
          const newCert = generateRes.data.data;
          setCertificates([...certificates, newCert]);
          setSelectedCertificate(newCert);

          // Remove from enrolled courses since it's now complete
          setEnrolledCourses(enrolledCourses.filter(e => e.course._id !== courseId));
        }
      }
    } catch (error: any) {
      console.error('Error handling certificate:', error);
      alert(error.response?.data?.message || 'Failed to load certificate');
    }
  };

  const handleDownload = async () => {
    if (!certificateRef.current) return;

    try {
      setDownloading(true);

      // Capture with specific settings to avoid clipping
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0,
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight
      });

      const imgData = canvas.toDataURL('image/png');

      // Create PDF with standard A4 landscape
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Stretches to fill A4 Page - assuming the component aspect ratio matches closely
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Certificate-${selectedCertificate?.course.title.replace(/\s+/g, '-')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = (certificate: Certificate) => {
    const shareText = `I've completed "${certificate.course.title}" and earned a certificate! 🎉`;
    const shareUrl = `${window.location.origin}/certificates/verify/${certificate.certificateId}`;

    if (navigator.share) {
      navigator.share({
        title: 'Course Certificate',
        text: shareText,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Certificate link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading certificates...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-gradient py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-8">My Certificates</h1>

        {certificates.length === 0 && enrolledCourses.length === 0 ? (
          <div className="bg-card rounded-lg shadow border border-border p-12 text-center">
            <Award size={64} className="mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No certificates yet
            </h2>
            <p className="text-muted-foreground mb-6">
              Complete a course to earn your first certificate!
            </p>
            <button
              onClick={() => router.push('/courses')}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
            >
              Browse Courses
            </button>
          </div>
        ) : (
          <div>
            {/* Earned Certificates */}
            {certificates.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Your Certificates ({certificates.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {certificates.map((cert) => (
                    <div
                      key={cert._id}
                      className="bg-card rounded-lg shadow border border-border hover:shadow-lg transition-shadow overflow-hidden cursor-pointer"
                      onClick={() => setSelectedCertificate(cert)}
                    >
                      <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-6 text-white">
                        <div className="flex items-start justify-between mb-4">
                          <Award size={40} />
                          <CheckCircle size={24} className="text-green-300" />
                        </div>
                        <h3 className="font-bold text-lg mb-2 line-clamp-2">
                          {cert.course.title}
                        </h3>
                        <p className="text-sm opacity-90">Certificate of Completion</p>
                      </div>

                      <div className="p-4">
                        <div className="space-y-2 text-sm text-foreground">
                          <div>
                            <span className="text-muted-foreground">Issued to:</span>
                            <p className="font-medium">{cert.metadata.userName}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Date:</span>
                            <p className="font-medium">
                              {new Date(cert.metadata.completionDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Certificate ID:</span>
                            <p className="font-mono text-xs">{cert.certificateId}</p>
                          </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCertificate(cert);
                            }}
                            className="flex-1 bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 flex items-center justify-center gap-2"
                          >
                            <Download size={16} />
                            Download
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShare(cert);
                            }}
                            className="flex-1 border border-border px-3 py-2 rounded text-sm hover:bg-muted flex items-center justify-center gap-2 text-foreground"
                          >
                            <Share2 size={16} />
                            Share
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Courses - Ready for Certificate */}
            {enrolledCourses.filter(e => e.completedAt && !certificates.find(cert => cert.course._id === e.course._id)).length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Ready for Certificate ({enrolledCourses.filter(e => e.completedAt && !certificates.find(cert => cert.course._id === e.course._id)).length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {enrolledCourses
                    .filter(e => e.completedAt && !certificates.find(cert => cert.course._id === e.course._id))
                    .map((enrollment) => (
                      <div
                        key={enrollment._id}
                        className="bg-card rounded-lg shadow border border-border hover:shadow-lg transition-shadow overflow-hidden"
                      >
                        <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-6 text-white">
                          <div className="flex items-start justify-between mb-4">
                            <Award size={40} />
                            <CheckCircle size={24} className="text-green-300" />
                          </div>
                          <h3 className="font-bold text-lg mb-2 line-clamp-2">
                            {enrollment.course.title}
                          </h3>
                          <p className="text-sm opacity-90">100% Complete - Generate Certificate</p>
                        </div>

                        <div className="p-4">
                          <div className="space-y-2 text-sm mb-4 text-foreground">
                            <div>
                              <span className="text-muted-foreground">Completed on:</span>
                              <p className="font-medium">
                                {enrollment.completedAt ? new Date(enrollment.completedAt).toLocaleDateString() : 'N/A'}
                              </p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Progress:</span>
                              <p className="font-medium text-green-600">{enrollment.progress}%</p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleViewCertificate(enrollment.course._id, enrollment.course.title)}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded hover:from-blue-700 hover:to-purple-700 flex items-center justify-center gap-2"
                          >
                            <Award size={16} />
                            View Certificate
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Locked Certificates - Courses in Progress */}
            {enrolledCourses.filter(e => !e.completedAt).length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Certificates in Progress ({enrolledCourses.filter(e => !e.completedAt).length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {enrolledCourses
                    .filter(e => !e.completedAt)
                    .map((enrollment) => (
                      <div
                        key={enrollment._id}
                        className="bg-card rounded-lg shadow border border-border overflow-hidden relative"
                      >
                        <div className="bg-gradient-to-br from-gray-400 to-gray-500 dark:from-gray-600 dark:to-gray-700 p-6 text-white relative">
                          {/* Lock Overlay */}
                          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center">
                            <div className="text-center">
                              <Lock size={48} className="mx-auto mb-2" />
                              <p className="text-sm font-medium">Certificate Locked</p>
                            </div>
                          </div>

                          <div className="flex items-start justify-between mb-4">
                            <Award size={40} className="opacity-50" />
                          </div>
                          <h3 className="font-bold text-lg mb-2 line-clamp-2 opacity-50">
                            {enrollment.course.title}
                          </h3>
                          <p className="text-sm opacity-75">Certificate of Completion</p>
                        </div>

                        <div className="p-4">
                          <div className="space-y-3 text-sm">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-muted-foreground">Progress:</span>
                                <span className="font-medium text-blue-600">{enrollment.progress}%</span>
                              </div>
                              <div className="w-full bg-secondary rounded-full h-2">
                                <div
                                  className="bg-blue-500 h-2 rounded-full transition-all"
                                  style={{ width: `${enrollment.progress}%` }}
                                ></div>
                              </div>
                            </div>

                            <div className="text-center pt-2">
                              <p className="text-muted-foreground text-xs mb-2">
                                Complete this course to unlock your certificate
                              </p>
                              <button
                                onClick={() => router.push(`/courses/${enrollment.course._id}`)}
                                className="w-full bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600"
                              >
                                Continue Learning
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Certificate Detail Modal */}
        {selectedCertificate && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedCertificate(null)}
          >
            <div
              className="bg-card rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Certificate Preview */}
              <div ref={certificateRef} className="relative overflow-hidden bg-white text-black m-4 sm:m-8 p-1 sm:p-2 shadow-2xl min-w-[800px] aspect-[297/210] flex flex-col justify-center">
                {/* Decorative Border - Green Theme */}
                <div className="border-[8px] border-double border-green-700 h-full p-6 sm:p-8 relative flex flex-col justify-between">

                  {/* Watermark/Background Pattern */}
                  <div className="absolute inset-0 opacity-[0.05] pointer-events-none flex items-center justify-center">
                    <Award size={400} className="text-green-800" />
                  </div>

                  {/* Corner Ornaments */}
                  <div className="absolute top-2 left-2 w-16 h-16 border-t-4 border-l-4 border-green-700"></div>
                  <div className="absolute top-2 right-2 w-16 h-16 border-t-4 border-r-4 border-green-700"></div>
                  <div className="absolute bottom-2 left-2 w-16 h-16 border-b-4 border-l-4 border-green-700"></div>
                  <div className="absolute bottom-2 right-2 w-16 h-16 border-b-4 border-r-4 border-green-700"></div>

                  <div className="text-center relative z-10 flex-1 flex flex-col justify-between py-2">
                    {/* Header */}
                    <div>
                      <div className="inline-block p-2 rounded-full bg-green-50 mb-1">
                        <Award size={40} className="text-green-700" />
                      </div>
                      <h1 className="text-3xl sm:text-4xl font-serif font-bold text-green-900 tracking-wide uppercase mb-1">
                        Certificate of Completion
                      </h1>
                      <div className="flex items-center justify-center gap-4 text-green-700">
                        <span className="h-px w-12 bg-green-700"></span>
                        <span className="text-xs font-medium tracking-widest uppercase text-teal-800">MicroLearning Platform</span>
                        <span className="h-px w-12 bg-green-700"></span>
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 italic font-serif mb-2">
                      This successfully certifies that
                    </p>

                    {/* Student Name */}
                    <div className="mb-1 relative inline-block">
                      <h2 className="text-3xl sm:text-5xl font-serif font-bold text-slate-900 border-b-2 border-green-700/50 pb-2 px-8 min-w-[300px]">
                        {selectedCertificate.metadata.userName}
                      </h2>
                    </div>

                    <p className="text-sm text-slate-600 italic font-serif mb-2">
                      has completed the rigorous requirements for the course
                    </p>

                    {/* Course Title */}
                    <h3 className="text-xl sm:text-2xl font-bold text-teal-900 mb-1 max-w-2xl mx-auto leading-tight">
                      "{selectedCertificate.course.title}"
                    </h3>

                    {/* Details Grid */}
                    <div className="flex justify-center gap-12 sm:gap-24 mb-2 text-sm text-slate-600">
                      <div className="text-center">
                        <p className="font-bold text-slate-800 text-lg mb-1">
                          {new Date(selectedCertificate.metadata.completionDate).toLocaleDateString()}
                        </p>
                        <p className="text-xs uppercase tracking-wider text-green-700 font-semibold">Completion Date</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-slate-800 text-lg mb-1">
                          {selectedCertificate.metadata.totalLessons}
                        </p>
                        <p className="text-xs uppercase tracking-wider text-green-700 font-semibold">Total Lessons</p>
                      </div>
                    </div>

                    {/* Footer / Signatures */}
                    <div className="flex flex-col sm:flex-row justify-between items-end gap-2 mt-auto pt-2 px-4 relative">
                      {/* Instructor Signature Area */}
                      <div className="text-center sm:text-left">
                        <div className="mb-2">
                          {/* Simulated Signature Font */}
                          <div className="font-serif italic text-2xl text-slate-900 min-w-[200px] border-b border-slate-400 pb-1 px-4 inline-block sm:block">
                            {selectedCertificate.metadata.instructor}
                          </div>
                        </div>
                        <p className="text-xs font-bold uppercase text-slate-700 tracking-wider">Instructor Signature</p>
                        <p className="text-xs text-slate-500 mt-1">Authorized Instructor</p>
                      </div>

                      {/* Seal */}
                      <div className="hidden sm:block absolute bottom-1 left-1/2 -translate-x-1/2">
                        <div className="w-16 h-16 rounded-full border-2 border-green-700 flex items-center justify-center opacity-90">
                          <div className="w-12 h-12 rounded-full border border-dashed border-green-600 flex items-center justify-center bg-green-50/50">
                            <Award size={24} className="text-green-700" />
                          </div>
                        </div>
                      </div>

                      {/* Verification Details */}
                      <div className="text-center sm:text-right">
                        <div className="mb-4">
                          <p className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider mb-1">Certificate ID</p>
                          <p className="font-mono text-sm font-bold text-slate-800 tracking-widest">{selectedCertificate.certificateId}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider mb-1">Verification Code</p>
                          <p className="font-mono text-xs text-slate-500">{selectedCertificate.verificationCode}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="p-6 bg-secondary/10 flex gap-3 justify-end border-t border-border">
                <button
                  onClick={() => setSelectedCertificate(null)}
                  className="px-6 py-2 border border-border rounded hover:bg-muted text-foreground"
                >
                  Close
                </button>
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {downloading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <Download size={18} />
                      Download PDF
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleShare(selectedCertificate)}
                  className="px-6 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 flex items-center gap-2"
                >
                  <Share2 size={18} />
                  Share
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
