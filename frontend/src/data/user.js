const user = {
  id: 1,
  firstName: "Mamadou",
  lastName: "Bah",
  email: "mamadou.bah@example.com",
  username: "odogwu2025",
  password: "password123",  
  role: "Full Stack Developer",
  location: "Banjul, The Gambia",
  skills: ["Java", "Spring Boot", "React", "Node.js"],
  experience: "3 years",
  availability: "Full-time",
  bio: "Passionate developer building real-world web applications.",
  avatar: "https://randomuser.me/api/portraits/men/23.jpg",
  notifications: [
  {
    id: 1,
    title: "New Job Match",
    message: "You have a new job match for Full Stack Developer at InnoTech.",
    type: "job",
    read: false,
    date: "2025-10-24T08:30:00Z"
  },
  {
    id: 2,
    title: "Message from Recruiter",
    message: "Aisha Conteh sent you a message regarding your application.",
    type: "message",
    read: false,
    date: "2025-10-23T15:45:00Z"
  },
  {
    id: 3,
    title: "Profile Viewed",
    message: "Your profile was viewed by Abdoulie Njie.",
    type: "info",
    read: true,
    date: "2025-10-22T12:00:00Z"
  },
  {
    id: 4,
    title: "Interview Scheduled",
    message: "You have an interview scheduled with TechCorp on 2025-10-28 at 10:00 AM.",
    type: "event",
    read: false,
    date: "2025-10-23T10:00:00Z"
  },
  {
    id: 5,
    title: "Skill Endorsement",
    message: "Fatou Camara endorsed your skill in React.",
    type: "social",
    read: true,
    date: "2025-10-21T09:30:00Z"
  }
]
};

export { user };