export const getUserInitials = (name: string): string => {
  if (!name || typeof name !== 'string') {
    return "";
  }
  return name
    .split(" ")
    .map((n) => n.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export const getAvatarColor = (name: string): string => {
  if (!name || typeof name !== 'string') {
    // Return a default color if name is not provided or invalid
    return "bg-gray-500";
  }
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-red-500",
    "bg-yellow-500",
    "bg-indigo-500",
    "bg-pink-500",
  ];
  // Simple hash function to get a somewhat consistent color for a name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash % colors.length);
  return colors[index] || "bg-gray-500"; // Fallback just in case
};
