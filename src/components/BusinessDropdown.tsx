
import React, { useState, useEffect } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBusinesses } from '@/hooks/useBusinesses';

interface BusinessDropdownProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const BusinessDropdown = ({ value, onChange, placeholder = "Select business..." }: BusinessDropdownProps) => {
  const [open, setOpen] = useState(false);
  const { data: businesses, isLoading } = useBusinesses();

  // Find selected business for display
  const selectedBusiness = businesses?.find(business => business.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedBusiness ? (
            <span className="truncate">
              {selectedBusiness.name} (ID: {selectedBusiness.id.slice(0, 8)}...)
            </span>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Search by business name or ID..." 
          />
          <CommandList>
            {isLoading ? (
              <CommandEmpty>Loading businesses...</CommandEmpty>
            ) : !businesses || businesses.length === 0 ? (
              <CommandEmpty>No businesses found.</CommandEmpty>
            ) : (
              <CommandGroup>
                {businesses.map((business) => (
                  <CommandItem
                    key={business.id}
                    value={`${business.name} ${business.id} ${business.category}`}
                    onSelect={() => {
                      onChange(business.id);
                      setOpen(false);
                    }}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === business.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{business.name}</span>
                      <span className="text-xs text-gray-500">
                        {business.category} • ID: {business.id.slice(0, 8)}...
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default BusinessDropdown;
