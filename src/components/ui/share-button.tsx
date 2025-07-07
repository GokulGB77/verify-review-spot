import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Share } from 'lucide-react';

interface ShareButtonProps {
  entityName: string;
  entityId: string;
  rating?: number;
  description?: string;
}

const ShareButton = ({ entityName, entityId, rating, description }: ShareButtonProps) => {
  const currentUrl = window.location.origin;
  const profileUrl = `${currentUrl}/entity/${entityId}`;
  
  const shareText = `Check out ${entityName} on VerifyReviewSpot! ${rating ? `⭐ ${rating.toFixed(1)}/5` : ''} ${description ? `- ${description}` : ''}`;
  
  const shareToWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${profileUrl}`)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareToLinkedIn = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`;
    window.open(linkedinUrl, '_blank');
  };

  const shareToInstagram = () => {
    // Instagram doesn't have direct URL sharing, so we copy to clipboard
    navigator.clipboard.writeText(`${shareText}\n\n${profileUrl}`)
      .then(() => {
        alert('Link copied to clipboard! You can now paste it in your Instagram story or post.');
      })
      .catch(() => {
        alert('Failed to copy link. Please copy manually: ' + profileUrl);
      });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl)
      .then(() => {
        alert('Link copied to clipboard!');
      })
      .catch(() => {
        alert('Failed to copy link. Please copy manually: ' + profileUrl);
      });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="lg">
          <Share className="h-4 w-4 mr-2" />
          Share
        </Button>
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
          Copy Link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShareButton;