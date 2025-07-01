import React, { useState, useRef } from 'react';

const testimonials1 = [
  {
    text: "We adopted DevTools conventions as our standard, and it saves lots of time from reinventing things ourselves.",
    author: "Sarah Chen",
    company: "TechCorp",
    avatar: "SC"
  },
  {
    text: "Thanks to DevTools, we can seamlessly scale our applications without concerns about performance issues.",
    author: "Michael Rodriguez",
    company: "ScaleUp Inc",
    avatar: "MR"
  },
  {
    text: "Underrated: DevTools 🚀",
    author: "Alex Kim",
    company: "StartupLab",
    avatar: "AK"
  },
  {
    text: "Entire SaaS businesses have been built on top of the DevTools ecosystem. Have been loving the recent performance improvements as well 🔥",
    author: "Jessica Park",
    company: "BuildFast",
    avatar: "JP"
  },
  {
    text: "With DevTools, we migrated our core production system with zero downtime. I can't imagine building systems without it.",
    author: "David Thompson",
    company: "Enterprise Solutions",
    avatar: "DT"
  },
  {
    text: "DevTools helps us unify data access from multiple systems into a single API. It means we can move very quickly whilst staying flexible.",
    author: "Emma Wilson",
    company: "DataFlow",
    avatar: "EW"
  }
];

const testimonials2 = [
  {
    text: "DevTools has a low learning curve. Productivity becomes higher because it gets combined with end-to-end type-safety.",
    author: "Ryan Martinez",
    company: "TypeSafe Co",
    avatar: "RM"
  },
  {
    text: "It's the kind of DX that lets me get stuff done in between my daughter's naps.",
    author: "Lisa Johnson",
    company: "Freelancer",
    avatar: "LJ"
  },
  {
    text: "I have been using DevTools since day one, and it has become my number one choice. The DX is just unbeaten.",
    author: "Tom Anderson",
    company: "DevFirst",
    avatar: "TA"
  },
  {
    text: "DevTools handled 670,000+ requests during peak traffic with zero downtime. Not bad for accidentally being load tested!",
    author: "Nina Patel",
    company: "HighLoad Systems",
    avatar: "NP"
  },
  {
    text: "DevTools spares me the hassle of keeping systems in sync, allowing me to develop with complete confidence.",
    author: "Chris Brown",
    company: "SyncTech",
    avatar: "CB"
  },
  {
    text: "I like how the DevTools docs made it easy to jump straight into using it without needing to do a huge amount of reading.",
    author: "Amanda Green",
    company: "QuickStart",
    avatar: "AG"
  }
];

const testimonials3 = [
  {
    text: "Huge fan of DevTools! The Schema file is great for AI tools. You literally never have to write boilerplate code again.",
    author: "Marcus Lee",
    company: "AI First",
    avatar: "ML"
  },
  {
    text: "I've been building backends with DevTools since the beginning, and I've got to say, it has worked like a charm.",
    author: "Sophie Turner",
    company: "Backend Pro",
    avatar: "ST"
  },
  {
    text: "I keep switching from DevTools to whatever the latest flavor is, but always end up coming back to DevTools.",
    author: "Jake Miller",
    company: "Tech Wanderer",
    avatar: "JM"
  },
  {
    text: "DevTools is a perfect fit for landing pages. We take advantage of caching to speed up queries and reduce latency.",
    author: "Priya Sharma",
    company: "FastPages",
    avatar: "PS"
  },
  {
    text: "I love how DevTools makes my life as a developer so easy. The TypeScript autocompletion is the best I've used.",
    author: "Oliver Davis",
    company: "TypeScript Pro",
    avatar: "OD"
  },
  {
    text: "I love the DevTools typing system! Our authentication service relies heavily on it.",
    author: "Rachel Adams",
    company: "AuthFlow",
    avatar: "RA"
  }
];

const TestimonialCard = ({ testimonial, onHover, onLeave }) => {
  return (
    <div 
      className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300 mb-4 flex-shrink-0 w-[440px]"
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {testimonial.avatar}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-gray-900 text-sm leading-relaxed mb-3">
            "{testimonial.text}"
          </p>
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-gray-900">{testimonial.author}</p>
            <span className="text-gray-400">•</span>
            <p className="text-sm text-gray-600">{testimonial.company}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ScrollingColumn = ({ testimonials, direction, speed }) => {
  const duplicatedTestimonials = [...testimonials, ...testimonials];
  const [isPaused, setIsPaused] = useState(false);
  const columnRef = useRef(null);
  
  const handleCardHover = () => {
    setIsPaused(true);
    if (columnRef.current) {
      columnRef.current.style.animationPlayState = 'paused';
    }
  };
  
  const handleCardLeave = () => {
    setIsPaused(false);
    if (columnRef.current) {
      columnRef.current.style.animationPlayState = 'running';
    }
  };
  
  return (
    <div className="flex flex-col overflow-hidden h-full">
      <div 
        ref={columnRef}
        className={`flex flex-col animate-scroll-${direction}`}
        style={{
          animation: `scroll-${direction} ${speed}s linear infinite`,
          animationPlayState: isPaused ? 'paused' : 'running'
        }}
      >
        {duplicatedTestimonials.map((testimonial, index) => (
          <TestimonialCard 
            key={`${testimonial.author}-${index}`} 
            testimonial={testimonial} 
            onHover={handleCardHover}
            onLeave={handleCardLeave}
          />
        ))}
      </div>
    </div>
  );
};

const ReviewScrollSection = ({ testimonials, direction, speed, title }) => {
  return (
    <div className="flex-1">
      <div className="relative">
        {/* Gradient overlays for fade effect */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-gray-50 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent z-10 pointer-events-none"></div>
        
        <div className="h-[500px] overflow-hidden flex justify-center">
          <ScrollingColumn testimonials={testimonials} direction={direction} speed={speed} />
        </div>
      </div>
    </div>
  );
};

const AnimatedTestimonials = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-16">
      <style>{`
        @keyframes scroll-up {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }
        
        @keyframes scroll-down {
          0% {
            transform: translateY(-50%);
          }
          100% {
            transform: translateY(0);
          }
        }
        
        .animate-scroll-up {
          animation: scroll-up var(--animation-duration, 40s) linear infinite;
        }
        
        .animate-scroll-down {
          animation: scroll-down var(--animation-duration, 35s) linear infinite;
        }
      `}</style>
      
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Header */}
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            BUILDING THE INTERNET’S TRUST LAYER 
          </h1>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            ONE VERIFIED REVIEW AT A TIME
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A new way to review — proof-backed, people-powered, and impossible to fake.
          </p>
        </div>

        {/* Three Review Scroll Sections */}
        <div className="flex flex-col lg:flex-row gap-2 lg:gap-3">
          {/* Left Section - Scrolling Down (Slow) */}
          <ReviewScrollSection 
            testimonials={testimonials1}
            direction="up"
            speed={90}
            title="Enterprise & Scale"
          />
          
          {/* Middle Section - Scrolling Up */}
          <ReviewScrollSection 
            testimonials={testimonials2}
            direction="down"
            speed={80}
            title="Developer Experience"
          />
          
          {/* Right Section - Scrolling Down (Fast) */}
          <ReviewScrollSection 
            testimonials={testimonials3}
            direction="up"
            speed={30}
            title="Modern Tooling"
          />
        </div>

        {/* Stats Section */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="text-4xl font-bold text-blue-600 mb-2">500K+</div>
            <div className="text-gray-600 font-medium">Verified Reviews Submitted</div>
          </div>
          <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="text-4xl font-bold text-purple-600 mb-2">15K+</div>
            <div className="text-gray-600 font-medium">Businesses Listed</div>
          </div>
          <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="text-4xl font-bold text-green-600 mb-2">600+</div>
            <div className="text-gray-600 font-medium">Daily Active Review Readers</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedTestimonials;