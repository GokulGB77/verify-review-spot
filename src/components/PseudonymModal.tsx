
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface PseudonymModalProps {
  open: boolean;
  user: User;
  onComplete: () => void;
}

const PseudonymModal = ({ open, user, onComplete }: PseudonymModalProps) => {
  const [pseudonym, setPseudonym] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const validatePseudonym = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return false;
    
    // Check format: only letters, numbers, underscore, and hyphen
    const isValidFormat = /^[a-zA-Z0-9_-]+$/.test(trimmed);
    return isValidFormat;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedPseudonym = pseudonym.trim();
    
    if (!trimmedPseudonym) {
      toast({
        title: 'Pseudonym required',
        description: 'Please enter a pseudonym to continue.',
        variant: 'destructive',
      });
      return;
    }

    if (!validatePseudonym(trimmedPseudonym)) {
      toast({
        title: 'Invalid pseudonym format',
        description: 'Pseudonym can only contain letters, numbers, underscores, and hyphens. No spaces allowed.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Check if pseudonym already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('pseudonym', trimmedPseudonym)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingUser) {
        toast({
          title: 'Pseudonym unavailable',
          description: 'This pseudonym is already taken. Please choose another one.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      // Update user profile with pseudonym
      const { error } = await supabase
        .from('profiles')
        .update({
          pseudonym: trimmedPseudonym,
          pseudonym_set: true,
        })
        .eq('id', user.id);

      if (error) {
        // Handle unique constraint violation
        if (error.code === '23505') {
          toast({
            title: 'Pseudonym unavailable',
            description: 'This pseudonym is already taken. Please choose another one.',
            variant: 'destructive',
          });
        } else {
          throw error;
        }
        setIsSubmitting(false);
        return;
      }

      toast({
        title: 'Pseudonym set successfully',
        description: 'Your reviews will now be posted under this pseudonym.',
      });

      onComplete();
    } catch (error) {
      console.error('Error setting pseudonym:', error);
      toast({
        title: 'Error',
        description: 'Failed to set pseudonym. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={e => e.preventDefault()} onEscapeKeyDown={e => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Add a pseudonym to your profile</DialogTitle>
          <DialogDescription>
            Add a pseudonym to your profile so that the reviews will be posted in that name keeping your real name private.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="pseudonym">Pseudonym</Label>
            <Input
              id="pseudonym"
              type="text"
              value={pseudonym}
              onChange={(e) => setPseudonym(e.target.value)}
              placeholder="Enter your pseudonym (letters, numbers, _, - only)"
              className="mt-1"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Only letters, numbers, underscores, and hyphens allowed. No spaces. This cannot be changed once set.
            </p>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="submit" disabled={isSubmitting || !pseudonym.trim()}>
              {isSubmitting ? 'Setting...' : 'Set Pseudonym'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PseudonymModal;
