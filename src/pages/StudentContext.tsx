import { createContext, useContext, useState, ReactNode } from 'react';

interface StudentData {
  name: string;
  email: string;
  enrollmentId: string;
  mobileNumber: string;
  securityCode: string;
}

interface StudentContextType {
  studentData: StudentData | null;
  setStudentData: (data: StudentData) => void;
}

// Initialize context with proper typing
const StudentContext = createContext<StudentContextType>({
  studentData: null,
  setStudentData: () => {},
});

export const StudentProvider = ({ children }: { children: ReactNode }) => {
  const [studentData, setStudentData] = useState<StudentData | null>(null);

  const handleSetStudentData = (data: StudentData) => {
    setStudentData(data);
  };

  return (
    <StudentContext.Provider 
      value={{ 
        studentData, 
        setStudentData: handleSetStudentData 
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = () => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return context;
};
