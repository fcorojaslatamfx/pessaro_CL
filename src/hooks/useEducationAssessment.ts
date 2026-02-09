import { useState } from 'react';

export const useEducationAssessment = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [courseType, setCourseType] = useState<string>('');

  const openAssessment = (type: string = 'general') => {
    setCourseType(type);
    setIsOpen(true);
  };

  const closeAssessment = () => {
    setIsOpen(false);
    setCourseType('');
  };

  return {
    isOpen,
    courseType,
    openAssessment,
    closeAssessment,
  };
};