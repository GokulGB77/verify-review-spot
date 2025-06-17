import { useState, useEffect } from 'react';

const TypingAnimation = () => {
  const words = [
    "EdTech Platforms",
    "Education Institutions", 
    "Financial Services",
    "E-commerce Sites",
    "Online Courses",
    "Digital Products",
    "Service Providers"
  ];

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typeSpeed, setTypeSpeed] = useState(150);

  useEffect(() => {
    const currentWord = words[currentWordIndex];
    
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        if (currentText.length < currentWord.length) {
          setCurrentText(currentWord.slice(0, currentText.length + 1));
          setTypeSpeed(150);
        } else {
          // Finished typing, start deleting after a pause
          setTypeSpeed(2000);
          setIsDeleting(true);
        }
      } else {
        // Deleting
        if (currentText.length > 0) {
          setCurrentText(currentText.slice(0, -1));
          setTypeSpeed(100);
        } else {
          // Finished deleting, move to next word
          setIsDeleting(false);
          setCurrentWordIndex((prev) => (prev + 1) % words.length);
          setTypeSpeed(500);
        }
      }
    }, typeSpeed);

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentWordIndex, typeSpeed, words]);

  return (
    <div className="text-center">
      <div className="text-2xl md:text-3xl font-bold text-blue-600 h-4 flex items-center justify-center">
        <span className="border-r-2 border-blue-600 pr-1 animate-pulse">
          {currentText}
        </span>
      </div>
      <div className="mt-4 mb-6 text-lg text-gray-500">
        and many more entities...
      </div>
    </div>
  );
};

export default TypingAnimation;