import ProfileCard from '@/components/Profile/ProfileCard';
import { BookOpen, Award, FileText, BarChart3, Users, Target, GraduationCap, School } from 'lucide-react';
import { useState, useEffect } from 'react';
import { studentService } from '@/api/studentService';
import type { Student } from '@/api/studentService';

export default function StudentProfile() {
  const [student, setStudent] = useState<Student | null>(null);

  useEffect(() => {
    fetchStudentProfile();
  }, []);

  const fetchStudentProfile = async () => {
    try {
      const response = await studentService.getMyProfile();
      if (response.success) {
        setStudent(response.data);
      }
    } catch (error) {
      console.error("Error fetching student profile:", error);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">
          Profile {student?.rollNumber && `(${student.rollNumber})`}
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">View your student account and academic progress</p>
      </div>

      <ProfileCard
        title="Student Profile"
        description="Your personal learning dashboard and academic information"
      >
        {/* Student specific information */}
        <div className="space-y-4">
          {/* Grade-Section Information */}
          {student && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Academic Information</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <School className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Grade</p>
                    <p className="text-sm text-blue-700">Grade {student.grade}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Section</p>
                    <p className="text-sm text-blue-700">{student.section}</p>
                  </div>
                </div>
              </div>
              {student.school && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <div className="flex items-center gap-3">
                    <School className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">School</p>
                      <p className="text-sm text-blue-700">{student.school.name}</p>
                      <p className="text-xs text-blue-600">{student.school.city}, {student.school.state}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-3">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Account Type</p>
              <p className="text-sm text-muted-foreground">Student</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Target className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Learning Focus</p>
              <p className="text-sm text-muted-foreground">Engage with educational content and assessments</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Educational Resources</p>
              <p className="text-sm text-muted-foreground">Access learning materials and study resources</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Progress Tracking</p>
              <p className="text-sm text-muted-foreground">Monitor your learning progress and module completion</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Award className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Assessments</p>
              <p className="text-sm text-muted-foreground">Take assessments and view your results</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Mentor Support</p>
              <p className="text-sm text-muted-foreground">Receive guidance from your assigned mentor</p>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2">Student Learning Journey</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Access educational resources and materials</li>
              <li>• Complete learning modules at your own pace</li>
              <li>• Take assessments to test your knowledge</li>
              <li>• Track your progress and achievements</li>
              <li>• Receive support from your mentor</li>
              <li>• Earn certificates for completed courses</li>
            </ul>
          </div>
        </div>
      </ProfileCard>
    </div>
  );
}
