"use client";

import type { Student } from '@/types/student';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'studentHubData';

function getInitialStudents(): Student[] {
  if (typeof window === 'undefined') {
    return [];
  }
  const storedData = localStorage.getItem(STORAGE_KEY);
  if (storedData) {
    try {
      return JSON.parse(storedData);
    } catch (error) {
      console.error("Error parsing student data from localStorage:", error);
      return [];
    }
  }
  // Initialize with some dummy data if no data is stored
  return [
    {
      id: crypto.randomUUID(),
      studentIdExt: "S1001",
      fullName: "Alice Wonderland",
      email: "alice@example.com",
      phone: "123-456-7890",
      address: "123 Fantasy Lane, Dreamland",
      enrollmentDate: "2023-09-01",
      profilePictureUrl: "https://placehold.co/100x100.png",
      courses: [
        { id: crypto.randomUUID(), name: "Introduction to Magic", grade: "A", credits: 3 },
        { id: crypto.randomUUID(), name: "Advanced Potion Making", grade: "B+", credits: 4 },
      ],
      academicNotes: "Excels in creative subjects."
    },
    {
      id: crypto.randomUUID(),
      studentIdExt: "S1002",
      fullName: "Bob The Builder",
      email: "bob@example.com",
      phone: "987-654-3210",
      address: "456 Construction Rd, Toontown",
      enrollmentDate: "2022-08-15",
      profilePictureUrl: "https://placehold.co/100x100.png",
      courses: [
        { id: crypto.randomUUID(), name: "Engineering Basics", grade: "A-", credits: 4 },
        { id: crypto.randomUUID(), name: "Project Management", grade: "A", credits: 3 },
      ],
      academicNotes: "Strong practical skills."
    }
  ];
}


export function useStudentStore() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setStudents(getInitialStudents());
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    }
  }, [students, isInitialized]);

  const getAllStudents = (): Student[] => {
    return students;
  };

  const getStudentById = (id: string): Student | undefined => {
    return students.find(student => student.id === id);
  };

  const addStudent = (student: Omit<Student, 'id'>): Student => {
    const newStudent: Student = { ...student, id: crypto.randomUUID() };
    setStudents(prevStudents => [...prevStudents, newStudent]);
    return newStudent;
  };

  const updateStudent = (id: string, updatedStudentData: Partial<Omit<Student, 'id'>>): Student | undefined => {
    let updatedStudent: Student | undefined;
    setStudents(prevStudents =>
      prevStudents.map(student => {
        if (student.id === id) {
          updatedStudent = { ...student, ...updatedStudentData };
          return updatedStudent;
        }
        return student;
      })
    );
    return updatedStudent;
  };

  const deleteStudent = (id: string): boolean => {
    const studentExists = students.some(student => student.id === id);
    if (studentExists) {
      setStudents(prevStudents => prevStudents.filter(student => student.id !== id));
      return true;
    }
    return false;
  };

  return {
    students,
    isInitialized,
    getAllStudents,
    getStudentById,
    addStudent,
    updateStudent,
    deleteStudent,
  };
}
