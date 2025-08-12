import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Share, Copy, Check, Download } from 'lucide-react';
import QRCode from 'qrcode';
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

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
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  const currentUrl = window.location.origin;
  // Use clean slug URL without /entities/ prefix
  const reviewUrl = `${currentUrl}/${entityId}#review-${reviewId}`;

  const [isGenerating, setIsGenerating] = useState(false);

  const getDisplayReviewerName = () => reviewerName?.trim() || "Verified Reviewer";

  // Truncate review content for sharing
  const truncatedContent = reviewContent.length > 160 
    ? reviewContent.substring(0, 160) + "…" 
    : reviewContent;
  
  const buildCaption = () => `Shared on Verifyd Trust:\n${'★'.repeat(Math.round(rating))}${'☆'.repeat(5 - Math.round(rating))} “${truncatedContent}”\nSee full review here: ${reviewUrl}\n#VerifydTrust #TrustedReviews`;

  async function generateQRDataUrl(url: string) {
    return await QRCode.toDataURL(url, { margin: 0, width: 256 });
  }

  async function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
  }

  async function drawShareImage(aspect: 'square' | 'landscape'): Promise<Blob> {
    const width = aspect === 'square' ? 1080 : 1200;
    const height = aspect === 'square' ? 1080 : 675;
    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Accent bar using CSS var --primary if available
    const root = getComputedStyle(document.documentElement);
    const primary = root.getPropertyValue('--primary').trim();
    ctx.fillStyle = primary ? `hsl(${primary})` : '#0ea5e9';
    ctx.fillRect(0, 0, width, Math.round(height * 0.18));

    // Logo and tagline
    try {
      const logo = await loadImage('/favicon3.svg');
      const logoSize = Math.min(96, Math.round(height * 0.1));
      ctx.drawImage(logo, 40, 30, logoSize, logoSize);
    } catch {}

    ctx.fillStyle = '#ffffff';
    ctx.font = `600 ${Math.round(height * 0.035)}px Inter, ui-sans-serif, system-ui`;
    ctx.textBaseline = 'top';
    ctx.fillText('Verifyd Trust — Reviews You Can Actually Trust', 40 + Math.min(96, Math.round(height * 0.1)) + 24, 50);

    // Entity name
    ctx.fillStyle = '#111827';
    ctx.font = `700 ${Math.round(height * 0.06)}px Inter, ui-sans-serif, system-ui`;
    wrapText(ctx, entityName, 40, Math.round(height * 0.22), width - 320, Math.round(height * 0.08));

    // Rating stars
    ctx.fillStyle = primary ? `hsl(${primary})` : '#0ea5e9';
    ctx.font = `700 ${Math.round(height * 0.06)}px Inter, ui-sans-serif, system-ui`;
    const stars = '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
    ctx.fillText(stars, 40, Math.round(height * 0.38));

    // Review snippet box
    ctx.fillStyle = '#374151';
    ctx.font = `500 ${Math.round(height * 0.04)}px Inter, ui-sans-serif, system-ui`;
    const snippet = truncatedContent + (reviewContent.length > truncatedContent.length ? '…more' : '');
    wrapText(ctx, `“${snippet}”`, 40, Math.round(height * 0.46), width - 320, Math.round(height * 0.06));

    // Reviewer + date
    ctx.fillStyle = '#6b7280';
    ctx.font = `500 ${Math.round(height * 0.032)}px Inter, ui-sans-serif, system-ui`;
    const dateStr = new Date().toLocaleDateString();
    ctx.fillText(`${getDisplayReviewerName()} • ${dateStr}`, 40, height - 120);

    // QR code
    const qrDataUrl = await generateQRDataUrl(reviewUrl);
    const qrImg = await loadImage(qrDataUrl);
    const qrSize = 200;
    ctx.drawImage(qrImg, width - qrSize - 40, height - qrSize - 40, qrSize, qrSize);

    // Footer brand bar
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, height - 40, width, 40);
    ctx.fillStyle = '#111827';
    ctx.font = `600 ${Math.round(height * 0.028)}px Inter, ui-sans-serif, system-ui`;
    ctx.fillText('verifydtrust.com', 40, height - 34);

    return await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b as Blob), 'image/png'));
  }

  async function handleShare(platform: 'whatsapp' | 'linkedin' | 'instagram' | 'facebook' | 'twitter') {
    try {
      await navigator.clipboard.writeText(reviewUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      toast({
        description: "Link copied! Paste it into the app to share.",
      });
    } catch (e) {
      toast({
        variant: "destructive",
        description: "Failed to copy link. Please try again.",
      });
    }
  }

  function downloadBlob(filename: string, blob: Blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
  
  const shareToWhatsApp = () => handleShare('whatsapp');

  const shareToLinkedIn = () => handleShare('linkedin');

  const shareToInstagram = () => handleShare('instagram');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(buildCaption())
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        toast({
          description: "Caption copied! You can paste it anywhere.",
        });
      })
      .catch(() => {
        toast({
          variant: "destructive",
          description: "Failed to copy. Please try again.",
        });
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
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={shareToWhatsApp} className="cursor-pointer">
          <div className="h-4 w-4 mr-2 bg-green-600 rounded-sm flex items-center justify-center text-white text-xs font-bold">W</div>
          WhatsApp (copy link)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToLinkedIn} className="cursor-pointer">
          <div className="h-4 w-4 mr-2 bg-blue-600 rounded-sm flex items-center justify-center text-white text-xs font-bold">L</div>
          LinkedIn (copy link)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('facebook')} className="cursor-pointer">
          <div className="h-4 w-4 mr-2 bg-blue-700 rounded-sm flex items-center justify-center text-white text-xs font-bold">F</div>
          Facebook (copy link)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('twitter')} className="cursor-pointer">
          <div className="h-4 w-4 mr-2 bg-black rounded-sm flex items-center justify-center text-white text-xs font-bold">X</div>
          Twitter/X (copy link)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToInstagram} className="cursor-pointer">
          <div className="h-4 w-4 mr-2 bg-pink-600 rounded-sm flex items-center justify-center text-white text-xs font-bold">I</div>
          Instagram (copy link)
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={async () => {
            try {
              setIsGenerating(true);
              const blob = await drawShareImage('square');
              downloadBlob(`review-${reviewId}-square.png`, blob);
              toast({ description: 'Image downloaded.' });
            } catch (e) {
              toast({ variant: 'destructive', description: 'Failed to download image. Please try again.' });
            } finally {
              setIsGenerating(false);
            }
          }}
        >
          <Download className="h-4 w-4 mr-2" />
          Download image
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyToClipboard} className="cursor-pointer">
          {isCopied ? (
            <>
              <Check className="h-4 w-4 mr-2 text-green-600" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2 text-gray-600" />
              Copy caption
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ReviewShareButton;