// frontend/src/mock/mockInternships.ts

const companies = [
  "Google", "Microsoft", "Amazon", "Flipkart", "Swiggy", "Zomato",
  "Infosys", "TCS", "Wipro", "Accenture", "Adobe", "Netflix",
  "Uber", "Ola", "Paytm", "PhonePe", "CRED", "Razorpay"
];

const roles = [
  "Frontend Developer", "Backend Developer", "Full Stack Developer",
  "React Developer", "MERN Stack Developer", "Data Analyst",
  "Data Scientist", "Machine Learning Intern", "AI Engineer",
  "DevOps Engineer", "Cloud Engineer", "Cybersecurity Analyst",
  "UI/UX Designer", "Product Manager", "QA Automation Engineer"
];

const locations = [
  "Bangalore", "Hyderabad", "Delhi", "Mumbai",
  "Pune", "Chennai", "Remote"
];

const degrees = [
  "B.Tech", "B.E", "BCA", "M.Tech", "MCA", "Any Graduate"
];

const qualifications = [
  "Pursuing or Completed degree in CS/IT",
  "Strong analytical and problem-solving skills",
  "Basic understanding of programming fundamentals",
  "Hands-on experience with projects",
  "Good communication and teamwork"
];

const skillsPool = [
  "React", "Node.js", "MongoDB", "Python", "SQL", "Java",
  "Docker", "AWS", "Machine Learning", "JavaScript",
  "Tailwind", "Figma", "Linux", "Kubernetes"
];

const generateInternship = (index: number) => {
  const company = companies[index % companies.length];
  const role = roles[index % roles.length];
  const location = locations[index % locations.length];

  return {
    id: `${index + 1}`,
    title: `${role} Intern`,
    companyName: company,
    description: `Work as a ${role} Intern at ${company}, contributing to real-world projects.`,
    location,
    source: "Mock Data",
    applyUrl: "#",
    internalId: undefined,

    salary: `₹${15000 + (index % 10) * 3000}/month`,
    qualification: qualifications[index % qualifications.length],
    degree: degrees[index % degrees.length],
    experience: index % 2 === 0 ? "0–1 year" : "Fresher",
    gapYearsAllowed: index % 3 === 0 ? "Yes" : "No",
    skills: skillsPool.slice(0, (index % 5) + 2),
    aboutCompany: `${company} is a global technology company with a focus on innovation and scalable solutions.`,
    fullDescription: `
      As a ${role} Intern at ${company}, you will work with a fast-paced engineering team.
      You will be involved in real product development, collaborate with senior engineers, 
      and build scalable solutions used by real customers.

      You will gain hands-on experience, mentorship, and exposure to industry practices.
    `,
  };
};

const mockInternships = Array.from({ length: 200 }, (_, i) =>
  generateInternship(i)
);

export default mockInternships;
