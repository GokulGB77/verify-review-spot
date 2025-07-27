import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Share } from 'lucide-react';

interface ReviewShareButtonProps {
  reviewId: string;
  entityName: string;
  entityId: string;
  rating: number;
  reviewContent: string;
  reviewerName?: string;
  variant?: 'icon' | 'button';
}

const ReviewShareButton = ({ 
  reviewId, 
  entityName, 
  entityId, 
  rating, 
  reviewContent, 
  reviewerName,
  variant = 'icon'
}: ReviewShareButtonProps) => {
  const currentUrl = window.location.origin;
  // Use clean slug URL without /entities/ prefix
  const reviewUrl = `${currentUrl}/${entityId}#review-${reviewId}`;
  
  // Truncate review content for sharing
  const truncatedContent = reviewContent.length > 100 
    ? reviewContent.substring(0, 100) + "..." 
    : reviewContent;
  
  const shareText = `Check out this ${rating}⭐ review of ${entityName} ${reviewerName ? `by ${reviewerName}` : ''} on Verifyd Trust!\n\n"${truncatedContent}"`;
  
  const shareToWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${reviewUrl}`)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareToLinkedIn = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(reviewUrl)}`;
    window.open(linkedinUrl, '_blank');
  };

  const shareToInstagram = () => {
    navigator.clipboard.writeText(`${shareText}\n\n${reviewUrl}`)
      .then(() => {
        alert('Review copied to clipboard! You can now paste it in your Instagram story or post.');
      })
      .catch(() => {
        alert('Failed to copy review. Please copy manually: ' + reviewUrl);
      });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${shareText}\n\n${reviewUrl}`)
      .then(() => {
        alert('Review link copied to clipboard!');
      })
      .catch(() => {
        alert('Failed to copy link. Please copy manually: ' + reviewUrl);
      });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === 'button' ? (
          <Button variant="outline" size="sm">
            <Share className="h-4 w-4 mr-2" />
            Share Review
          </Button>
        ) : (
          <Button variant="ghost" size="icon" aria-label="Share Review" className="h-8 w-8">
            <Share className="h-4 w-4" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={shareToWhatsApp} className="cursor-pointer">
          <div className="h-4 w-4 mr-2 bg-green-600 rounded-sm flex items-center justify-center text-white text-xs font-bold">W</div>
          Share on WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToLinkedIn} className="cursor-pointer">
          <div className="h-4 w-4 mr-2 bg-blue-600 rounded-sm flex items-center justify-center text-white text-xs font-bold">L</div>
          Share on LinkedIn
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToInstagram} className="cursor-pointer">
          <div className="h-4 w-4 mr-2 bg-pink-600 rounded-sm flex items-center justify-center text-white text-xs font-bold">I</div>
          Copy for Instagram
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyToClipboard} className="cursor-pointer">
          <Share className="h-4 w-4 mr-2 text-gray-600" />
          Copy Review Link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ReviewShareButton;