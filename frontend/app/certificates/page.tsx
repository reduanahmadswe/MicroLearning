'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { Award, Download, Share2, CheckCircle } from 'lucide-react';

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

export default function CertificatesPage() {
  const router = useRouter();
  const { token } = useAuthStore();

  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/v1/certificates/my-certificates', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCertificates(res.data.data);
    } catch (error: any) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (certificate: Certificate) => {
    // TODO: Implement PDF generation and download
    alert('PDF download feature coming soon!');
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Certificates</h1>
          <p className="text-gray-600">View and download your course completion certificates</p>
        </div>

        {certificates.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Award size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              No certificates yet
            </h2>
            <p className="text-gray-500 mb-6">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert) => (
              <div
                key={cert._id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden cursor-pointer"
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
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Issued to:</span>
                      <p className="font-medium">{cert.metadata.userName}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Date:</span>
                      <p className="font-medium">
                        {new Date(cert.metadata.completionDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Certificate ID:</span>
                      <p className="font-mono text-xs">{cert.certificateId}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(cert);
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
                      className="flex-1 border border-gray-300 px-3 py-2 rounded text-sm hover:bg-gray-50 flex items-center justify-center gap-2"
                    >
                      <Share2 size={16} />
                      Share
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Certificate Detail Modal */}
        {selectedCertificate && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedCertificate(null)}
          >
            <div
              className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Certificate Preview */}
              <div className="border-8 border-double border-blue-600 m-8 p-12 bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="text-center">
                  <Award size={80} className="mx-auto text-yellow-600 mb-6" />
                  
                  <h1 className="text-4xl font-bold text-gray-800 mb-2">
                    Certificate of Completion
                  </h1>
                  
                  <div className="w-32 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto my-6"></div>
                  
                  <p className="text-lg text-gray-600 mb-8">
                    This is to certify that
                  </p>
                  
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">
                    {selectedCertificate.metadata.userName}
                  </h2>
                  
                  <p className="text-lg text-gray-600 mb-4">
                    has successfully completed the course
                  </p>
                  
                  <h3 className="text-2xl font-semibold text-blue-600 mb-8">
                    "{selectedCertificate.course.title}"
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-8 mb-8 text-sm text-gray-600">
                    <div>
                      <p className="font-semibold mb-1">Completion Date</p>
                      <p>{new Date(selectedCertificate.metadata.completionDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Total Lessons</p>
                      <p>{selectedCertificate.metadata.totalLessons}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-end mt-12 pt-8 border-t border-gray-300">
                    <div className="text-left">
                      <div className="w-48 border-t border-gray-400 pt-2">
                        <p className="font-semibold">{selectedCertificate.metadata.instructor}</p>
                        <p className="text-sm text-gray-600">Instructor</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">Certificate ID</p>
                      <p className="font-mono text-sm">{selectedCertificate.certificateId}</p>
                      <p className="text-xs text-gray-500 mt-1">Verification Code</p>
                      <p className="font-mono text-sm">{selectedCertificate.verificationCode}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="p-6 bg-gray-50 flex gap-3 justify-end">
                <button
                  onClick={() => setSelectedCertificate(null)}
                  className="px-6 py-2 border border-gray-300 rounded hover:bg-white"
                >
                  Close
                </button>
                <button
                  onClick={() => handleDownload(selectedCertificate)}
                  className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
                >
                  <Download size={18} />
                  Download PDF
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
