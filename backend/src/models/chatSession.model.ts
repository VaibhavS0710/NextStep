import mongoose, { Document, Schema } from "mongoose";

export type ChatSender = "user" | "bot";

export interface IChatMessage {
  sender: ChatSender;
  text: string;
  createdAt: Date;
}

export interface IChatSession extends Document {
  userId: mongoose.Types.ObjectId;
  messages: IChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    sender: {
      type: String,
      enum: ["user", "bot"],
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const ChatSessionSchema = new Schema<IChatSession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    messages: {
      type: [ChatMessageSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export const ChatSession = mongoose.model<IChatSession>(
  "ChatSession",
  ChatSessionSchema
);
