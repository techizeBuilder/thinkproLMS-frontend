import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, X } from "lucide-react";
import { ServiceDetails, ServiceSection } from "@/api/schoolService";

interface ServiceFormProps {
  serviceDetails: ServiceDetails | null;
  onChange: (serviceDetails: ServiceDetails | null) => void;
}

const COMMON_SUBJECTS = [
  "Mathematics",
  "Science",
  "English",
  "Hindi",
  "Social Studies",
  "Computer Science",
  "Physical Education",
  "Art",
  "Music",
  "Economics",
  "Business Studies",
  "Accountancy",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "Geography",
  "Political Science",
  "Psychology",
  "Sociology",
];

export default function ServiceForm({ serviceDetails, onChange }: ServiceFormProps) {
  const [customSubject, setCustomSubject] = useState("");

  const updateServiceDetails = (updates: Partial<ServiceDetails>) => {
    const current = serviceDetails || {
      serviceType: "",
      mentors: [],
      grades: [],
      subjects: [],
      sections: [],
    };
    onChange({ ...current, ...updates });
  };

  const handleMentorChange = (mentor: "School Mentor" | "Thinker Mentor", checked: boolean) => {
    const currentMentors = serviceDetails?.mentors || [];
    if (checked) {
      updateServiceDetails({ mentors: [...currentMentors, mentor] });
    } else {
      updateServiceDetails({ mentors: currentMentors.filter(m => m !== mentor) });
    }
  };

  const handleGradeChange = (grade: number, checked: boolean) => {
    const currentGrades = serviceDetails?.grades || [];
    if (checked) {
      updateServiceDetails({ grades: [...currentGrades, grade].sort() });
    } else {
      updateServiceDetails({ grades: currentGrades.filter(g => g !== grade) });
    }
  };

  const handleSubjectChange = (subject: string, checked: boolean) => {
    const currentSubjects = serviceDetails?.subjects || [];
    if (checked) {
      updateServiceDetails({ subjects: [...currentSubjects, subject] });
    } else {
      updateServiceDetails({ subjects: currentSubjects.filter(s => s !== subject) });
    }
  };

  const addCustomSubject = () => {
    if (customSubject.trim() && !serviceDetails?.subjects.includes(customSubject.trim())) {
      const currentSubjects = serviceDetails?.subjects || [];
      updateServiceDetails({ subjects: [...currentSubjects, customSubject.trim()] });
      setCustomSubject("");
    }
  };

  const removeSubject = (subject: string) => {
    const currentSubjects = serviceDetails?.subjects || [];
    updateServiceDetails({ subjects: currentSubjects.filter(s => s !== subject) });
  };

  const addSection = () => {
    const currentSections = serviceDetails?.sections || [];
    const newSection: ServiceSection = { grade: 1, numberOfSections: 1 };
    updateServiceDetails({ sections: [...currentSections, newSection] });
  };

  const updateSection = (index: number, field: keyof ServiceSection, value: number) => {
    const currentSections = serviceDetails?.sections || [];
    const updatedSections = [...currentSections];
    updatedSections[index] = { ...updatedSections[index], [field]: value };
    updateServiceDetails({ sections: updatedSections });
  };

  const removeSection = (index: number) => {
    const currentSections = serviceDetails?.sections || [];
    updateServiceDetails({ sections: currentSections.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Service Details</h3>

      {/* Service Type */}
      <div className="space-y-2">
        <Label htmlFor="serviceType">Service Type *</Label>
        <Input
          id="serviceType"
          value={serviceDetails?.serviceType || ""}
          onChange={(e) => updateServiceDetails({ serviceType: e.target.value })}
          placeholder="Enter service type"
          required
        />
      </div>

      {/* Mentor Selection */}
      <div className="space-y-3">
        <Label>Mentor Type *</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="school-mentor"
              checked={serviceDetails?.mentors.includes("School Mentor") || false}
              onCheckedChange={(checked) => handleMentorChange("School Mentor", checked as boolean)}
            />
            <Label htmlFor="school-mentor">School Mentor</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="thinker-mentor"
              checked={serviceDetails?.mentors.includes("Thinker Mentor") || false}
              onCheckedChange={(checked) => handleMentorChange("Thinker Mentor", checked as boolean)}
            />
            <Label htmlFor="thinker-mentor">Thinker Mentor</Label>
          </div>
        </div>
      </div>

      {/* Grade Selection */}
      <div className="space-y-3">
        <Label>Grades Opted *</Label>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((grade) => (
            <div key={grade} className="flex items-center space-x-2">
              <Checkbox
                id={`grade-${grade}`}
                checked={serviceDetails?.grades.includes(grade) || false}
                onCheckedChange={(checked) => handleGradeChange(grade, checked as boolean)}
              />
              <Label htmlFor={`grade-${grade}`} className="text-sm">
                Grade {grade}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Subject Selection */}
      <div className="space-y-3">
        <Label>Subjects *</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {COMMON_SUBJECTS.map((subject) => (
            <div key={subject} className="flex items-center space-x-2">
              <Checkbox
                id={`subject-${subject}`}
                checked={serviceDetails?.subjects.includes(subject) || false}
                onCheckedChange={(checked) => handleSubjectChange(subject, checked as boolean)}
              />
              <Label htmlFor={`subject-${subject}`} className="text-sm">
                {subject}
              </Label>
            </div>
          ))}
        </div>

        {/* Custom Subject Input */}
        <div className="flex gap-2">
          <Input
            value={customSubject}
            onChange={(e) => setCustomSubject(e.target.value)}
            placeholder="Add custom subject"
            onKeyPress={(e) => e.key === 'Enter' && addCustomSubject()}
          />
          <Button type="button" variant="outline" size="sm" onClick={addCustomSubject}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Selected Subjects */}
        {serviceDetails?.subjects && serviceDetails.subjects.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Selected Subjects:</Label>
            <div className="flex flex-wrap gap-2">
              {serviceDetails.subjects.map((subject) => (
                <div
                  key={subject}
                  className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm"
                >
                  {subject}
                  <button
                    type="button"
                    onClick={() => removeSubject(subject)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sections */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Number of Sections by Grade *</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSection}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Section
          </Button>
        </div>

        {serviceDetails?.sections && serviceDetails.sections.length > 0 ? (
          <div className="space-y-3">
            {serviceDetails.sections.map((section, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`section-grade-${index}`}>Grade</Label>
                    <Select
                      value={section.grade.toString()}
                      onValueChange={(value) => updateSection(index, 'grade', parseInt(value))}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => i + 1).map((grade) => (
                          <SelectItem key={grade} value={grade.toString()}>
                            {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`section-count-${index}`}>Number of Sections</Label>
                    <Input
                      id={`section-count-${index}`}
                      type="number"
                      min="1"
                      value={section.numberOfSections}
                      onChange={(e) => updateSection(index, 'numberOfSections', parseInt(e.target.value) || 1)}
                      className="w-32"
                    />
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSection(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 mt-6"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <p>No sections added yet.</p>
            <p className="text-sm">Click "Add Section" to specify grade-wise sections.</p>
          </div>
        )}
      </div>
    </div>
  );
}
