
import { useState, useEffect } from 'react';

export const useEditTimer = (createdAt: string, editWindowMinutes: number = 1) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [canEdit, setCanEdit] = useState<boolean>(false);

  useEffect(() => {
    const createdTime = new Date(createdAt).getTime();
    const now = Date.now();
    const editWindowMs = editWindowMinutes * 60 * 1000; // Convert minutes to milliseconds
    const timeElapsed = now - createdTime;
    const remaining = editWindowMs - timeElapsed;

    if (remaining > 0) {
      setTimeLeft(Math.ceil(remaining / 1000)); // Convert to seconds
      setCanEdit(true);

      const interval = setInterval(() => {
        const currentNow = Date.now();
        const currentRemaining = editWindowMs - (currentNow - createdTime);
        
        if (currentRemaining > 0) {
          setTimeLeft(Math.ceil(currentRemaining / 1000));
        } else {
          setTimeLeft(0);
          setCanEdit(false);
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setTimeLeft(0);
      setCanEdit(false);
    }
  }, [createdAt, editWindowMinutes]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    canEdit,
    timeLeft,
    formattedTime: formatTime(timeLeft)
  };
};
