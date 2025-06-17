

 const featuredReviews = [
    {
      id: 1,
      businessName: "Tech Academy Pro",
      rating: 4.2,
      reviewCount: 156,
      verificationLevel: "Verified Graduate",
      category: "EdTech",
      badge: "verified",
    },
    {
      id: 2,
      businessName: "Digital Skills Institute",
      rating: 3.8,
      reviewCount: 89,
      verificationLevel: "Verified User",
      category: "Education",
      badge: "verified",
    },
    {
      id: 3,
      businessName: "Career Boost Academy",
      rating: 2.1,
      reviewCount: 234,
      verificationLevel: "Mixed Verification",
      category: "EdTech",
      badge: "mixed",
    },
  ];


    const recentlyAddedEntities = [
    {
      id: 1,
      businessName: "SkillUp Learning",
      category: "EdTech",
      location: "Bangalore, India",
      addedDays: 2,
      description: "A new-age platform for upskilling and certification courses."
    },
    {
      id: 2,
      businessName: "EduBridge Solutions",
      category: "Education",
      location: "Mumbai, India",
      addedDays: 5,
      description: "Connecting students with top educators and mentors."
    },
    {
      id: 3,
      businessName: "NextGen Academy",
      category: "EdTech",
      location: "Delhi, India",
      addedDays: 7,
      description: "Innovative learning solutions for the digital generation."
    }
  ];

    const allReviews = [
      {
        id: '1',
        businessId: '1',
        businessName: 'Tech Academy Pro',
        businessCategory: 'EdTech',
        userName: 'Priya Sharma',
        userBadge: 'Verified Graduate' as const,
        rating: 4,
        date: '2024-01-15',
        title: 'Excellent curriculum and job placement support',
        content: 'Completed the full-stack development course. The curriculum is up-to-date with industry standards. Got placed within 2 months of completion.',
        isVerified: true,
        proofProvided: true,
        upvotes: 23,
        downvotes: 2,
        businessLocation: 'Mumbai, Maharashtra'
      },
      {
        id: '2',
        businessId: '2',
        businessName: 'Digital Skills Institute',
        businessCategory: 'Education',
        userName: 'Rahul Kumar',
        userBadge: 'Verified User' as const,
        rating: 3,
        date: '2024-01-12',
        title: 'Good content but poor support',
        content: 'The course content is comprehensive but the support team is unresponsive. Had to wait weeks for query resolution.',
        isVerified: true,
        proofProvided: false,
        upvotes: 15,
        downvotes: 5,
        businessLocation: 'Delhi, NCR'
      },
      {
        id: '3',
        businessId: '3',
        businessName: 'Career Boost Academy',
        businessCategory: 'EdTech',
        userName: 'Sneha Patel',
        userBadge: 'Unverified User' as const,
        rating: 2,
        date: '2024-01-10',
        title: 'Overpromised and underdelivered',
        content: 'The marketing materials promised a lot but the actual course quality was disappointing. No job assistance as advertised.',
        isVerified: false,
        proofProvided: false,
        upvotes: 8,
        downvotes: 12,
        businessLocation: 'Bangalore, Karnataka'
      },
      {
        id: '4',
        businessId: '1',
        businessName: 'Tech Academy Pro',
        businessCategory: 'EdTech',
        userName: 'Amit Singh',
        userBadge: 'Verified Graduate' as const,
        rating: 5,
        date: '2024-01-08',
        title: 'Life-changing experience',
        content: 'Switched careers from marketing to tech after this course. The mentors are industry experts and provide real-world insights.',
        isVerified: true,
        proofProvided: true,
        upvotes: 31,
        downvotes: 1,
        businessLocation: 'Mumbai, Maharashtra'
      },
      {
        id: '5',
        businessId: '4',
        businessName: 'CodeMaster Institute',
        businessCategory: 'EdTech',
        userName: 'Anita Gupta',
        userBadge: 'Verified Employee' as const,
        rating: 4,
        date: '2024-01-05',
        title: 'Great for beginners',
        content: 'As someone who works in the industry, I can say their beginner courses are well-structured. Good foundation building.',
        isVerified: true,
        proofProvided: true,
        upvotes: 19,
        downvotes: 3,
        businessLocation: 'Pune, Maharashtra'
      }
    ];

    const businesses = [
    {
      id: '1',
      name: 'Tech Academy Pro',
      category: 'EdTech',
      description: 'Leading technology bootcamp offering full-stack development, data science, and AI/ML courses with guaranteed job placement assistance.',
      rating: 4.2,
      reviewCount: 156,
      verificationStatus: 'Verified' as const,
      location: 'Mumbai, Maharashtra',
      website: 'https://techacademypro.com',
      phone: '+91 98765 43210',
      hasSubscription: true
    },
    {
      id: '2',
      name: 'Digital Skills Institute',
      category: 'Education',
      description: 'Comprehensive digital marketing and business skills training institute with flexible learning options and industry partnerships.',
      rating: 3.8,
      reviewCount: 89,
      verificationStatus: 'Claimed' as const,
      location: 'Delhi, NCR',
      website: 'https://digitalskills.edu',
      phone: '+91 87654 32109',
      hasSubscription: false
    },
    {
      id: '3',
      name: 'Career Boost Academy',
      category: 'EdTech',
      description: 'Professional development and career transition programs focusing on emerging technologies and soft skills development.',
      rating: 2.1,
      reviewCount: 234,
      verificationStatus: 'Unclaimed' as const,
      location: 'Bangalore, Karnataka',
      hasSubscription: false
    },
    {
      id: '4',
      name: 'CodeMaster Institute',
      category: 'EdTech',
      description: 'Specialized coding bootcamp for beginners and professionals looking to upskill in programming languages and frameworks.',
      rating: 4.5,
      reviewCount: 127,
      verificationStatus: 'Verified' as const,
      location: 'Pune, Maharashtra',
      website: 'https://codemaster.edu',
      phone: '+91 76543 21098',
      hasSubscription: true
    },
    {
      id: '5',
      name: 'Business Leadership Hub',
      category: 'Professional Training',
      description: 'Executive education and leadership development programs for mid-level to senior management professionals.',
      rating: 4.7,
      reviewCount: 67,
      verificationStatus: 'Verified' as const,
      location: 'Hyderabad, Telangana',
      website: 'https://businessleadership.hub',
      phone: '+91 65432 10987',
      hasSubscription: true
    },
    {
      id: '6',
      name: 'Creative Arts Academy',
      category: 'Arts & Design',
      description: 'Fine arts, graphic design, and digital media courses with hands-on training and portfolio development support.',
      rating: 3.9,
      reviewCount: 43,
      verificationStatus: 'Claimed' as const,
      location: 'Chennai, Tamil Nadu',
      website: 'https://creativearts.academy',
      hasSubscription: false
    }
  ];

export  { featuredReviews, recentlyAddedEntities,allReviews,businesses };
