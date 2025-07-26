import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import SearchBar from "./SearchBar";

const HeaderSearch = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsExpanded(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={searchRef} className="relative">
      {!isExpanded ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(true)}
          className="p-2"
        >
          <Search className="h-4 w-4" />
        </Button>
      ) : (
        <div className="flex items-center gap-2">
          <div className="w-64">
            <SearchBar 
              variant="compact" 
              placeholder="Search entities..." 
              showButton={false}
              className="w-full"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
            className="p-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default HeaderSearch;