
interface ProfileData {
  username: string | null;
  full_name: string | null;
  pseudonym: string | null;
  display_name_preference: string | null;
}

export const getDisplayName = (profile: ProfileData | null): string => {
  if (!profile) {
    return 'Anonymous Reviewer';
  }

  const { username, full_name, pseudonym, display_name_preference } = profile;

  // If user prefers full name and has one
  if (display_name_preference === 'full_name' && full_name) {
    return full_name;
  }

  // If user prefers pseudonym and has one
  if (display_name_preference === 'pseudonym' && pseudonym) {
    return pseudonym;
  }

  // Fall back to username if available
  if (username) {
    return username;
  }

  // Fall back to pseudonym if available
  if (pseudonym) {
    return pseudonym;
  }

  // Fall back to full name if available
  if (full_name) {
    return full_name;
  }

  // Final fallback
  return 'Anonymous Reviewer';
};
