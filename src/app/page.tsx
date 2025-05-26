"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useStudentStore } from "@/lib/student-store";
import type { Student } from "@/types/student";
import { PlusCircle, Search, Edit, Trash2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function StudentDirectoryPage() {
  const { getAllStudents, deleteStudent, isInitialized } = useStudentStore();
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const { toast } = useToast();
  
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    if (isInitialized) {
      setStudents(getAllStudents());
    }
  }, [isInitialized, getAllStudents]);


  const filteredStudents = useMemo(() => {
    if (!searchTerm) return students;
    return students.filter(
      (student) =>
        student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentIdExt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

  const handleDelete = (studentId: string, studentName: string) => {
    const success = deleteStudent(studentId);
    if (success) {
      setStudents(getAllStudents()); // Refresh list
      toast({
        title: "Student Removed",
        description: `${studentName} has been removed from the system.`,
      });
    } else {
      toast({
        title: "Error",
        description: `Failed to remove ${studentName}.`,
        variant: "destructive",
      });
    }
  };

  if (!isInitialized) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-muted-foreground">Loading student data...</p>
      </div>
    );
  }
  
  return (
    <>
      <PageHeader
        title="Student Directory"
        description="Search, view, and manage student records."
        actions={
          <Link href="/enroll" passHref>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Enroll New Student
            </Button>
          </Link>
        }
      />
      <Card>
        <CardContent className="p-6">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name, ID, or email..."
                className="pl-8 w-full sm:w-1/3"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="text-center py-10">
              <h3 className="text-xl font-semibold text-muted-foreground">No Students Found</h3>
              <p className="text-muted-foreground mt-2">
                {searchTerm ? "Try adjusting your search term or " : "There are no students in the system yet. "}
                <Link href="/enroll" className="text-primary hover:underline">
                  enroll a new student
                </Link>.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Avatar</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Enrollment Date</TableHead>
                    <TableHead>Courses</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <Avatar>
                          <AvatarImage src={student.profilePictureUrl || `https://placehold.co/40x40.png`} alt={student.fullName} data-ai-hint="student avatar" />
                          <AvatarFallback>{student.fullName.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">{student.fullName}</TableCell>
                      <TableCell>{student.studentIdExt}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.enrollmentDate}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{student.courses.length}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/students/${student.id}`)}
                          aria-label={`View ${student.fullName}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/students/${student.id}/edit`)}
                          aria-label={`Edit ${student.fullName}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label={`Delete ${student.fullName}`}>
                              <Trash2 className="h-4 w-4 text-destructive" />
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
                              <AlertDialogAction
                                onClick={() => handleDelete(student.id, student.fullName)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
