
import { ReviewFormData } from '@/types/reviewForm';

export const validateForm = (formData: ReviewFormData, selectedBusiness: any) => {
  const isBasicFormValid = selectedBusiness && formData.rating > 0 && formData.content.length >= 50;
  const needsProof = formData.reviewSpecificBadge === 'proof_connection';
  const hasRequiredProof = !needsProof || (needsProof && formData.proofFile);
  
  console.log('Form validation debug:', {
    selectedBusiness: !!selectedBusiness,
    rating: formData.rating,
    contentLength: formData.content.length,
    reviewSpecificBadge: formData.reviewSpecificBadge,
    needsProof,
    hasFile: !!formData.proofFile,
    hasRequiredProof,
    isBasicFormValid
  });
  
  return {
    isBasicFormValid,
    needsProof,
    hasRequiredProof,
    canSubmit: isBasicFormValid && hasRequiredProof
  };
};

export const getBadgeColor = (badge: string) => {
  switch (badge) {
    case 'Verified User':
      return 'bg-green-100 text-green-800';
    case 'Verified Employee':
      return 'bg-blue-100 text-blue-800';
    case 'Verified Student':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
