"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { extractTranscriptData, type ExtractTranscriptDataOutput } from "@/ai/flows/extract-transcript-data";
import { Loader2, UploadCloud, Send } from "lucide-react";
import { format } from "date-fns";

export default function TranscriptToolPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [transcriptDataUri, setTranscriptDataUri] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractTranscriptDataOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Check file type (text based for simplicity with current Genkit setup)
      if (!selectedFile.type.startsWith('text/') && selectedFile.type !== 'application/pdf') {
         toast({
            title: "Invalid File Type",
            description: "Please upload a text file (.txt) or PDF (.pdf). The AI works best with text-based transcripts.",
            variant: "destructive",
          });
        setFile(null);
        setTranscriptDataUri(null);
        event.target.value = ''; // Reset file input
        return;
      }

      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => {
        setTranscriptDataUri(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
      setExtractedData(null); // Clear previous results
    }
  };

  const handleExtractData = async () => {
    if (!transcriptDataUri) {
      toast({
        title: "No Transcript Uploaded",
        description: "Please upload a transcript file first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setExtractedData(null);

    try {
      const result = await extractTranscriptData({ transcriptDataUri });
      setExtractedData(result);
      toast({
        title: "Data Extracted Successfully",
        description: "Review the extracted information below.",
      });
    } catch (error) {
      console.error("Error extracting transcript data:", error);
      toast({
        title: "Extraction Failed",
        description: "An error occurred while processing the transcript. " + (error instanceof Error ? error.message : "Please try again."),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseDataForEnrollment = () => {
    if (!extractedData) return;

    const studentForEnrollment = {
      studentIdExt: extractedData.studentId,
      fullName: extractedData.studentName,
      email: "", // AI doesn't extract email, user needs to fill
      enrollmentDate: format(new Date(), "yyyy-MM-dd"), // Default to today
      courses: extractedData.courses.map(c => ({
        name: c.name,
        grade: c.grade,
        credits: String(c.credits)
      })),
    };
    // Store in localStorage to prefill on enroll page, or pass via query params (localStorage is cleaner for larger data)
    localStorage.setItem('transcriptEnrollData', JSON.stringify(studentForEnrollment));
    router.push('/enroll?fromTranscript=true');
  };


  return (
    <>
      <PageHeader
        title="Transcript Data Tool"
        description="Upload a student transcript to automatically extract key information using AI."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload Transcript</CardTitle>
            <CardDescription>
              Select a text-based transcript file (e.g., .txt, .pdf).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="transcriptFile" className="sr-only">Transcript File</Label>
              <Input
                id="transcriptFile"
                type="file"
                accept=".txt,.pdf" 
                onChange={handleFileChange}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
            </div>
            {file && (
              <p className="text-sm text-muted-foreground">Selected file: {file.name}</p>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleExtractData} disabled={isLoading || !transcriptDataUri}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UploadCloud className="mr-2 h-4 w-4" />
              )}
              {isLoading ? "Extracting..." : "Extract Data"}
            </Button>
          </CardFooter>
        </Card>

        {extractedData && (
          <Card className="md:col-span-2"> {/* Make results card span full width on larger screens if it's alone, or manage layout better */}
            <CardHeader>
              <CardTitle>Extracted Information</CardTitle>
              <CardDescription>Verify the data extracted from the transcript.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold">Student Details</h4>
                <p><strong>Name:</strong> {extractedData.studentName}</p>
                <p><strong>ID:</strong> {extractedData.studentId}</p>
              </div>
              <div>
                <h4 className="font-semibold">Courses</h4>
                {extractedData.courses.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1 max-h-60 overflow-y-auto">
                    {extractedData.courses.map((course, index) => (
                      <li key={index}>
                        {course.name} - Grade: {course.grade}, Credits: {course.credits}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No courses found.</p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleUseDataForEnrollment}>
                <Send className="mr-2 h-4 w-4" /> Use Data for Enrollment
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
       {/* Instructions or tips */}
       <Card className="mt-6">
        <CardHeader>
          <CardTitle>Tool Usage Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p> - Ensure the uploaded transcript is clear and machine-readable for best results.</p>
          <p> - The AI tool is designed to extract common data points. Complex or non-standard transcript formats might yield partial results.</p>
          <p> - Always review the extracted data for accuracy before using it.</p>
          <p> - Currently, PDF and TXT files are best supported. Image-based transcripts are not supported by this flow.</p>
        </CardContent>
      </Card>
    </>
  );
}
