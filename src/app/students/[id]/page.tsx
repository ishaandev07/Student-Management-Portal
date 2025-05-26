"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useStudentStore } from "@/lib/student-store";
import type { Student, CourseEntry } from "@/types/student";
import { Edit, Trash2, ArrowLeft, Phone, Mail, MapPin, CalendarDays, BookOpen } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { getStudentById, deleteStudent, isInitialized } = useStudentStore();
  const { toast } = useToast();
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const studentId = typeof params.id === 'string' ? params.id : '';

  useEffect(() => {
    if (isInitialized && studentId) {
      const foundStudent = getStudentById(studentId);
      if (foundStudent) {
        setStudent(foundStudent);
      } else {
        // Handle student not found, e.g., redirect or show error
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


  const handleDelete = () => {
    if (!student) return;
    const success = deleteStudent(student.id);
    if (success) {
      toast({
        title: "Student Removed",
        description: `${student.fullName} has been removed.`,
      });
      router.push("/");
    } else {
      toast({
        title: "Error",
        description: `Failed to remove ${student.fullName}.`,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><p>Loading student profile...</p></div>;
  }

  if (!student) {
     // This case should ideally be handled by the useEffect redirect, but as a fallback:
    return <div className="flex justify-center items-center h-screen"><p>Student not found.</p></div>;
  }

  return (
    <>
      <PageHeader
        title={student.fullName}
        description={`Student ID: ${student.studentIdExt}`}
        actions={
          <div className="flex gap-2">
            <Link href={`/students/${student.id}/edit`} passHref>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" /> Edit Profile
              </Button>
            </Link>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Student
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete {student.fullName}'s record.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        }
      />

      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Directory
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="items-center text-center">
              <Avatar className="w-24 h-24 mb-4">
                <AvatarImage src={student.profilePictureUrl || `https://placehold.co/100x100.png`} alt={student.fullName} data-ai-hint="student portrait" />
                <AvatarFallback className="text-3xl">{student.fullName.split(" ").map(n => n[0]).join("")}</AvatarFallback>
              </Avatar>
              <CardTitle className="text-2xl">{student.fullName}</CardTitle>
              <CardDescription>Student ID: {student.studentIdExt}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm">
              <Separator className="my-4" />
              <div className="space-y-2">
                <div className="flex items-center">
                  <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{student.email}</span>
                </div>
                {student.phone && (
                  <div className="flex items-center">
                    <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{student.phone}</span>
                  </div>
                )}
                {student.address && (
                  <div className="flex items-start">
                    <MapPin className="mr-2 mt-1 h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span>{student.address}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Enrolled: {student.enrollmentDate}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="mr-2 h-5 w-5 text-primary" />
                Academic Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {student.academicNotes && (
                <div className="mb-4 p-3 bg-muted/50 rounded-md">
                  <h4 className="font-semibold mb-1">Academic Notes:</h4>
                  <p className="text-sm text-muted-foreground">{student.academicNotes}</p>
                </div>
              )}
              
              <h4 className="font-semibold mb-2 text-md">Courses:</h4>
              {student.courses.length > 0 ? (
                <ul className="space-y-3">
                  {student.courses.map((course: CourseEntry) => (
                    <li key={course.id} className="p-3 border rounded-md hover:shadow-sm transition-shadow">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-foreground">{course.name}</span>
                        <Badge variant="outline">{course.credits} Credits</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Grade: {course.grade}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No courses registered for this student.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
