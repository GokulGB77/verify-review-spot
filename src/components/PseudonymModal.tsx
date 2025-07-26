
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { X, AlertCircle } from 'lucide-react';

interface PseudonymModalProps {
  open: boolean;
  user: User;
  onComplete: () => void;
}

const PseudonymModal = ({ open, user, onComplete }: PseudonymModalProps) => {
  const [pseudonym, setPseudonym] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
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
    setError('');
    
    const trimmedPseudonym = pseudonym.trim();
    
    if (!trimmedPseudonym) {
      setError('Please enter a pseudonym to continue.');
      return;
    }

    if (!validatePseudonym(trimmedPseudonym)) {
      setError('Pseudonym can only contain letters, numbers, underscores, and hyphens. No spaces allowed.');
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
        setError('This pseudonym is already taken. Please choose another one.');
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
          setError('This pseudonym is already taken. Please choose another one.');
        } else {
          setError('Failed to set pseudonym. Please try again.');
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

  const handleClose = () => {
    // Skip setting pseudonym and complete the sign-in process
    onComplete();
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute -top-2 -right-2 h-8 w-8 rounded-full"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
          <DialogTitle>Add a pseudonym to your profile</DialogTitle>
          <DialogDescription>
            Add a pseudonym to your profile so that the reviews will be posted in that name keeping your real name private.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div>
            <Label htmlFor="pseudonym">Pseudonym</Label>
            <Input
              id="pseudonym"
              type="text"
              value={pseudonym}
              onChange={(e) => {
                setPseudonym(e.target.value);
                if (error) setError(''); // Clear error when user starts typing
              }}
              placeholder="Enter your pseudonym (letters, numbers, _, - only)"
              className="mt-1"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Only letters, numbers, underscores, and hyphens allowed. No spaces. This cannot be changed once set.
            </p>
          </div>
          
          <div className="flex justify-between space-x-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Skip for now
            </Button>
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
