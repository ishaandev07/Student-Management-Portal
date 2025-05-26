"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { StudentForm } from "@/components/students/student-form";
import { useStudentStore } from "@/lib/student-store";
import type { StudentFormData } from "@/types/student";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO } from "date-fns";

export default function EnrollStudentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addStudent } = useStudentStore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialFormData, setInitialFormData] = useState<StudentFormData | undefined>(undefined);

  useEffect(() => {
    if (searchParams.get('fromTranscript') === 'true') {
      const storedData = localStorage.getItem('transcriptEnrollData');
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          setInitialFormData({
            ...parsedData,
            enrollmentDate: parsedData.enrollmentDate ? parseISO(parsedData.enrollmentDate) : new Date(),
            profilePictureUrl: parsedData.profilePictureUrl || "",
            academicNotes: parsedData.academicNotes || "",
            phone: parsedData.phone || "",
            address: parsedData.address || "",
          });
          localStorage.removeItem('transcriptEnrollData'); // Clean up
          toast({
            title: "Data Prefilled",
            description: "Student information from transcript has been prefilled.",
          });
        } catch (e) {
          console.error("Error parsing transcript data for enrollment:", e);
        }
      }
    }
  }, [searchParams, toast]);


  const handleSubmit = (data: StudentFormData) => {
    setIsSubmitting(true);
    try {
      const newStudent = {
        studentIdExt: data.studentIdExt,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        enrollmentDate: format(data.enrollmentDate, "yyyy-MM-dd"),
        profilePictureUrl: data.profilePictureUrl || `https://placehold.co/100x100.png?text=${data.fullName.charAt(0)}`,
        courses: data.courses.map(course => ({
          id: crypto.randomUUID(),
          name: course.name,
          grade: course.grade,
          credits: parseFloat(course.credits) || 0,
        })),
        academicNotes: data.academicNotes,
      };
      addStudent(newStudent);
      toast({
        title: "Student Enrolled",
        description: `${data.fullName} has been successfully enrolled.`,
      });
      router.push("/"); // Redirect to student directory
    } catch (error) {
      console.error("Failed to enroll student:", error);
      toast({
        title: "Enrollment Failed",
        description: "An error occurred while enrolling the student. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Enroll New Student"
        description="Fill in the details below to register a new student in the system."
      />
      <Card>
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
        </CardHeader>
        <CardContent>
          <StudentForm 
            initialData={initialFormData}
            onSubmit={handleSubmit} 
            isSubmitting={isSubmitting}
            submitButtonText="Enroll Student"
          />
        </CardContent>
      </Card>
    </>
  );
}
