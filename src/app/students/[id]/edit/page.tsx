"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { StudentForm } from "@/components/students/student-form";
import { useStudentStore } from "@/lib/student-store";
import type { Student, StudentFormData } from "@/types/student";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function EditStudentPage() {
  const params = useParams();
  const router = useRouter();
  const { getStudentById, updateStudent, isInitialized } = useStudentStore();
  const { toast } = useToast();
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const studentId = typeof params.id === 'string' ? params.id : '';

  useEffect(() => {
    if (isInitialized && studentId) {
      const foundStudent = getStudentById(studentId);
      if (foundStudent) {
        setStudent(foundStudent);
      } else {
        toast({ title: "Error", description: "Student not found.", variant: "destructive" });
        router.push("/");
      }
      setIsLoading(false);
    } else if (isInitialized && !studentId) {
      toast({ title: "Error", description: "Invalid student ID.", variant: "destructive" });
      router.push("/");
      setIsLoading(false);
    }
  }, [isInitialized, studentId, getStudentById, router, toast]);

  const handleSubmit = (data: StudentFormData) => {
    if (!student) return;
    setIsSubmitting(true);
    try {
      const updatedData = {
        studentIdExt: data.studentIdExt,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        enrollmentDate: data.enrollmentDate.toISOString().split('T')[0],
        profilePictureUrl: data.profilePictureUrl,
        courses: data.courses.map(course => ({
          id: crypto.randomUUID(), // Or try to preserve existing IDs if needed, for simplicity new IDs
          name: course.name,
          grade: course.grade,
          credits: parseFloat(course.credits) || 0,
        })),
        academicNotes: data.academicNotes,
      };
      updateStudent(student.id, updatedData);
      toast({
        title: "Profile Updated",
        description: `${data.fullName}'s profile has been successfully updated.`,
      });
      router.push(`/students/${student.id}`); // Redirect to profile page
    } catch (error) {
      console.error("Failed to update student:", error);
      toast({
        title: "Update Failed",
        description: "An error occurred while updating the profile. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><p>Loading student data for editing...</p></div>;
  }

  if (!student) {
    return <div className="flex justify-center items-center h-screen"><p>Student not found.</p></div>;
  }
  
  const initialFormData: StudentFormData = {
    ...student,
    enrollmentDate: new Date(student.enrollmentDate), // Convert string to Date for form
    courses: student.courses.map(c => ({...c, credits: String(c.credits)})) // Convert credits to string for form
  };


  return (
    <>
      <PageHeader
        title={`Edit Profile: ${student.fullName}`}
        description="Update the student's information below."
      />
       <Button variant="outline" onClick={() => router.push(`/students/${student.id}`)} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Profile
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Update Student Information</CardTitle>
        </CardHeader>
        <CardContent>
          <StudentForm
            initialData={initialFormData}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitButtonText="Update Profile"
          />
        </CardContent>
      </Card>
    </>
  );
}
