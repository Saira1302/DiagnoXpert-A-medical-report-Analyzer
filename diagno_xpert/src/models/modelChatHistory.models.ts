import mongoose, { Schema } from "mongoose";

export type ChatMessageRole = "user" | "assistant";
export type ChatMessageType = "text" | "scan";

export interface IModelChatMessage {
  _id?: mongoose.Types.ObjectId;
  role: ChatMessageRole;
  type: ChatMessageType;
  content?: string;
  fileName?: string;
  userQuestion?: string;
  result?: unknown;
  createdAt?: Date;
}

export interface IModelChatHistory {
  userId: Schema.Types.ObjectId;
  title: string;
  messages: IModelChatMessage[];
}

const messageSchema = new Schema<IModelChatMessage>(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    type: {
      type: String,
      enum: ["text", "scan"],
      required: true,
    },
    content: { type: String },
    fileName: { type: String },
    userQuestion: { type: String },
    result: { type: Schema.Types.Mixed, default: null },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    minimize: false,
    strict: false,
  },
);

const modelChatHistorySchema: Schema<IModelChatHistory> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: "New Chat",
    },
    messages: {
      type: [messageSchema],
      default: [],
    },
  },
  { timestamps: true, minimize: false },
);

const ModelChatHistory =
  mongoose.models.ModelChatHistory ||
  mongoose.model<IModelChatHistory>("ModelChatHistory", modelChatHistorySchema);

export default ModelChatHistory;
