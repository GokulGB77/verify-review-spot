
export interface ReviewFormData {
  businessId: string;
  businessName: string;
  title: string;
  rating: number;
  content: string;
  proofFile: File | null;
  reviewSpecificBadge: string;
  proofRemark: string;
}

export interface UserProfile {
  id: string;
  pseudonym: string | null;
  pseudonym_set: boolean;
  main_badge: string | null;
  is_verified: boolean;
}
