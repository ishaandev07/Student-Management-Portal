export interface CourseEntry {
  id: string; // for list keys, e.g. uuid
  name: string;
  grade: string;
  credits: number;
}

export interface Student {
  id: string; // internal unique ID, e.g. uuid
  studentIdExt: string; // External Student ID from transcript/institution
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  enrollmentDate: string; // ISO string, e.g., "2023-09-01"
  profilePictureUrl?: string; // URL to image
  courses: CourseEntry[];
  academicNotes?: string;
}

// For the form, it's easier to handle courses with react-hook-form
export interface StudentFormData {
  studentIdExt: string;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  enrollmentDate: Date; // Use Date object for DayPicker
  profilePictureUrl?: string;
  courses: {
    name: string;
    grade: string;
    credits: string; // Use string for input, parse to number on submit
  }[];
  academicNotes?: string;
}
