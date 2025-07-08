import { Badge } from "@/components/ui/badge";
import { Coins } from 'lucide-react';

interface TokenDisplayProps {
  tokens: number;
  className?: string;
  showIcon?: boolean;
}

const TokenDisplay = ({ tokens, className = "", showIcon = true }: TokenDisplayProps) => {
  return (
    <Badge 
      variant="secondary" 
      className={`bg-yellow-100 text-yellow-800 border-yellow-200 ${className}`}
    >
      {showIcon && <Coins className="h-3 w-3 mr-1" />}
      {tokens} {tokens === 1 ? 'Token' : 'Tokens'}
    </Badge>
  );
};

export default TokenDisplay;