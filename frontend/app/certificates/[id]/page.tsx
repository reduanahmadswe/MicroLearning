'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Award, 
  Download, 
  Share2, 
  ChevronLeft,
  Calendar,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { certificatesAPI, coursesAPI } from '../../../services/api.service';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

export default function CertificateViewPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const certificateId = params.id as string;
  const courseId = searchParams.get('course');
  
  const [certificate, setCertificate] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, [certificateId, courseId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (certificateId && certificateId !== 'view') {
        // Load specific certificate by ID
        const certResponse = await certificatesAPI.getCertificateById(certificateId);
        setCertificate(certResponse.data.data);
        
        // Load course details
        if (certResponse.data.data.course) {
          const courseResponse = await coursesAPI.getCourse(certResponse.data.data.course);
          setCourse(courseResponse.data.data);
        }
      } else if (courseId) {
        // Load certificate by course ID
        const certResponse = await certificatesAPI.getMyCertificates();
        const cert = certResponse.data.data.find((c: any) => c.course._id === courseId);
        
        if (cert) {
          setCertificate(cert);
          setCourse(cert.course);
        } else {
          toast.error('Certificate not found');
        }
      }
    } catch (error: any) {
      console.error('Error loading certificate:', error);
      toast.error('Failed to load certificate');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!certificateRef.current) return;
    
    try {
      setDownloading(true);
      toast.info('Generating certificate...');
      
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
      });
      
      const link = document.createElement('a');
      link.download = `certificate-${course?.title || 'course'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast.success('Certificate downloaded!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download certificate');
    } finally {
      setDownloading(false);
    }
  };

  const handleShareLinkedIn = () => {
    const url = `${window.location.origin}/certificates/${certificate._id}`;
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=600');
  };

  const handleShareFacebook = () => {
    const url = `${window.location.origin}/certificates/${certificate._id}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=600');
  };

  const handleShareTwitter = () => {
    const url = `${window.location.origin}/certificates/${certificate._id}`;
    const text = `I just completed "${course?.title}" on MicroLearning! 🎓`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=600');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading certificate...</p>
        </div>
      </div>
    );
  }

  if (!certificate || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 text-center bg-white rounded-lg shadow">
          <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Certificate Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            This certificate doesn't exist or you don't have access to it.
          </p>
          <Link href="/certificates">
            <button className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              View My Certificates
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href="/certificates"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Certificates
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Course Certificate
              </h1>
              <p className="text-gray-600">
                {course.title}
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center disabled:opacity-50"
              >
                <Download className="w-4 h-4 mr-2" />
                {downloading ? 'Generating...' : 'Download'}
              </button>
              
              <div className="relative group">
                <button className="border border-gray-300 px-4 py-2 rounded flex items-center hover:bg-gray-50">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </button>
                
                {/* Share Dropdown */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <button
                    onClick={handleShareLinkedIn}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 rounded-t-lg"
                  >
                    <ExternalLink className="w-4 h-4 text-blue-700" />
                    Share on LinkedIn
                  </button>
                  <button
                    onClick={handleShareFacebook}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4 text-blue-600" />
                    Share on Facebook
                  </button>
                  <button
                    onClick={handleShareTwitter}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 rounded-b-lg"
                  >
                    <ExternalLink className="w-4 h-4 text-blue-400" />
                    Share on Twitter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Certificate */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div 
            ref={certificateRef}
            className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-8 border-blue-600 rounded-2xl p-12"
            style={{ aspectRatio: '1.414/1' }} // A4 ratio
          >
            {/* Decorative Corner Elements */}
            <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-blue-600/30 rounded-tl-xl"></div>
            <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-blue-600/30 rounded-tr-xl"></div>
            <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-blue-600/30 rounded-bl-xl"></div>
            <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-blue-600/30 rounded-br-xl"></div>

            <div className="text-center space-y-6">
              {/* Logo/Icon */}
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                  <Award className="w-12 h-12 text-white" />
                </div>
              </div>

              {/* Title */}
              <div>
                <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  Certificate of Completion
                </h2>
                <div className="h-1 w-32 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto rounded-full"></div>
              </div>

              {/* Recipient Name */}
              <div className="py-4">
                <p className="text-sm text-gray-600 mb-2">This certifies that</p>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {certificate.userName || 'Student Name'}
                </h1>
                <p className="text-sm text-gray-600">has successfully completed</p>
              </div>

              {/* Course Title */}
              <div className="py-4">
                <h3 className="text-2xl font-bold text-blue-600 mb-2">
                  {course.title}
                </h3>
                <p className="text-gray-600">
                  {course.description?.split('\n')[0]?.substring(0, 100)}...
                </p>
              </div>

              {/* Details */}
              <div className="flex justify-center gap-8 py-4">
                <div className="text-center">
                  <Calendar className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-500 mb-1">Completed On</p>
                  <p className="font-medium text-gray-900">
                    {new Date(certificate.issuedAt || certificate.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                
                <div className="text-center">
                  <CheckCircle className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-500 mb-1">Certificate ID</p>
                  <p className="font-medium text-gray-900 font-mono text-sm">
                    {certificate.certificateId || certificate._id.substring(0, 12).toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Instructor Signature */}
              <div className="pt-8 flex justify-center gap-16">
                <div className="text-center">
                  <div className="border-t-2 border-gray-300 pt-2 w-48">
                    <p className="font-semibold text-gray-900">
                      {course.author?.name || 'Instructor'}
                    </p>
                    <p className="text-sm text-gray-500">Course Instructor</p>
                  </div>
                </div>
              </div>

              {/* Verification Code */}
              <div className="pt-6">
                <p className="text-xs text-gray-400">
                  Verify at: {window.location.origin}/verify/{certificate.verificationCode || certificate._id}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Certificate Info */}
        <div className="mt-6 p-6 bg-white rounded-lg shadow">
          <h3 className="font-semibold text-gray-900 mb-4">About This Certificate</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium text-gray-900">Verified Certificate</span>
                <p>This certificate is issued by MicroLearning and can be verified online.</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Award className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium text-gray-900">Share Your Achievement</span>
                <p>Add this certificate to your LinkedIn profile or share it on social media.</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Download className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium text-gray-900">Download & Print</span>
                <p>Download a high-quality version of your certificate for your records.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
