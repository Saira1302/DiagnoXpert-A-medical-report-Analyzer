import mongoose, { Schema } from "mongoose";

export interface IConversation {
  participants: Schema.Types.ObjectId[];
  lastMessage?: string;
  lastMessageAt?: Date | null;
  lastMessageSender?: Schema.Types.ObjectId | null;
  unread: Map<string, number>;
}

const conversationSchema: Schema<IConversation> = new Schema(
  {
    participants: [
      { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    ],
    lastMessage: { type: String, default: "" },
    lastMessageAt: { type: Date, default: null },
    lastMessageSender: { type: Schema.Types.ObjectId, ref: "User", default: null },
    unread: { type: Map, of: Number, default: {} },
  },
  { timestamps: true },
);

conversationSchema.index({ participants: 1, updatedAt: -1 });

const Conversation =
  mongoose.models.Conversation ||
  mongoose.model<IConversation>("Conversation", conversationSchema);

export default Conversation;
