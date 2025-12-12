import mongoose from "mongoose";
import { ChatSession } from "../models/chatSession.model";
import { listInternships } from "./internship.service";
import { getStudentApplications } from "./application.service";

interface ChatResponse {
  reply: string;
  suggestions?: string[];
  data?: any;
  sessionId?: string;
}

// very simple keyword-based intent detection
const detectIntent = (text: string): "internships" | "applications" | "platform" | "fallback" => {
  const t = text.toLowerCase();

  if (t.includes("internship") || t.includes("internships") || t.includes("job")) {
    return "internships";
  }

  if (
    t.includes("application status") ||
    t.includes("my applications") ||
    t.includes("applied") ||
    (t.includes("status") && t.includes("application"))
  ) {
    return "applications";
  }

  if (
    t.includes("what is nextstep") ||
    t.includes("how to use") ||
    t.includes("help") ||
    t.includes("features")
  ) {
    return "platform";
  }

  return "fallback";
};

// very quick & dirty location / skill extraction
const extractQueryFilters = (text: string): { q?: string; location?: string } => {
  const lower = text.toLowerCase();
  let q: string | undefined;
  let location: string | undefined;

  // try to capture "for react", "for mern", etc.
  const forMatch = lower.match(/for ([a-zA-Z0-9+ ]+)/);
  if (forMatch && forMatch[1]) {
    q = forMatch[1].trim();
  }

  // try to capture "in bangalore", "at hyderabad"
  const inMatch = lower.match(/in ([a-zA-Z0-9+ ]+)/);
  if (inMatch && inMatch[1]) {
    location = inMatch[1].trim();
  }

  return { q, location };
};

const platformHelpReply = (): ChatResponse => ({
  reply:
    "I'm NextStep Assistant 👋\n\nI can help you with:\n" +
    "• Finding internships (e.g., *\"Show me MERN internships in Bangalore\"*)\n" +
    "• Checking your application status (e.g., *\"Show my applications\"*)\n" +
    "• Understanding how NextStep works.\n\n" +
    "Try asking: *\"Find remote React internships\"* or *\"Show my applications\"*.",
  suggestions: [
    "Find remote internships",
    "Show my applications",
    "How does NextStep work?",
  ],
});

const fallbackReply = (): ChatResponse => ({
  reply:
    "I'm not fully sure I understood that 🤔\n\n" +
    "You can ask me things like:\n" +
    "• *\"Show MERN internships in Bangalore\"*\n" +
    "• *\"Show my applications\"*\n" +
    "• *\"What is NextStep?\"*",
  suggestions: [
    "Show internships",
    "Show my applications",
    "What is NextStep?",
  ],
});

// main handler
export const handleStudentChatMessage = async (
  userId: string,
  message: string,
  sessionId?: string
): Promise<ChatResponse> => {
  const intent = detectIntent(message);

  // ensure a session exists
  let session = null;
  if (sessionId && mongoose.isValidObjectId(sessionId)) {
    session = await ChatSession.findById(sessionId);
  }
  if (!session) {
    session = await ChatSession.create({
      userId: new mongoose.Types.ObjectId(userId),
      messages: [],
    });
  }

  // store user message
  session.messages.push({
    sender: "user",
    text: message,
    createdAt: new Date(),
  });

  let response: ChatResponse;

  if (intent === "platform") {
    response = platformHelpReply();
  } else if (intent === "internships") {
    response = await handleInternshipIntent(userId, message);
  } else if (intent === "applications") {
    response = await handleApplicationsIntent(userId);
  } else {
    response = fallbackReply();
  }

  // store bot reply
  session.messages.push({
    sender: "bot",
    text: response.reply,
    createdAt: new Date(),
  });
  await session.save();

  response.sessionId = session._id.toString();
  return response;
};

const handleInternshipIntent = async (
  _userId: string,
  text: string
): Promise<ChatResponse> => {
  const { q, location } = extractQueryFilters(text);

  const result = await listInternships({
    q,
    location,
    page: 1,
    limit: 5,
  });

  if (result.total === 0) {
    return {
      reply:
        "I couldn't find any internships matching your query right now 😕\n\n" +
        "Try changing your keywords or location, for example:\n" +
        "• *\"React internships in Bangalore\"*\n" +
        "• *\"Remote MERN internships\"*",
      suggestions: [
        "Show remote internships",
        "Show internships in Bangalore",
        "Show MERN internships",
      ],
    };
  }

  const lines = result.items.map((i, idx) => {
    return `${idx + 1}. **${i.title}** – ${i.location} (${i.mode})`;
  });

  const reply =
    "Here are some internships I found for you:\n\n" +
    lines.join("\n") +
    "\n\nYou can refine your search by saying things like:\n" +
    "• *\"Only remote\"*\n" +
    "• *\"In Bangalore\"*\n" +
    "• *\"For MERN stack\"*";

  return {
    reply,
    suggestions: [
      "Show more internships",
      "Show only remote internships",
      "Show internships in my city",
    ],
    data: {
      items: result.items,
      total: result.total,
    },
  };
};

const handleApplicationsIntent = async (userId: string): Promise<ChatResponse> => {
  const apps = await getStudentApplications(userId);

  if (!apps || apps.length === 0) {
    return {
      reply:
        "You haven't applied to any internships yet.\n\n" +
        "Start by searching for internships and applying to a few that match your skills 😊",
      suggestions: [
        "Show internships",
        "Find remote internships",
        "Find MERN internships",
      ],
    };
  }

  const top = apps.slice(0, 5);
  const lines = top.map((app: any, idx: number) => {
    const internship: any = app.internshipId || {};
    const title = internship.title || "Unknown internship";
    const status = app.status || "applied";
    return `${idx + 1}. **${title}** – Status: *${status}*`;
  });

  const reply =
    "Here are your recent applications:\n\n" +
    lines.join("\n") +
    (apps.length > 5
      ? `\n\n…and ${apps.length - 5} more.`
      : "") +
    "\n\nYou can apply to more internships or wait for updates from companies.";

  return {
    reply,
    data: { applications: top },
    suggestions: [
      "Show more internships",
      "What internships should I apply to?",
    ],
  };
};
