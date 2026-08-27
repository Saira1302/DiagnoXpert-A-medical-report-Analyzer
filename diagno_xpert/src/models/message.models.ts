import mongoose, { Schema } from "mongoose";

export interface IMessage {
  conversationId: Schema.Types.ObjectId;
  senderId: Schema.Types.ObjectId;
  text: string;
  read: boolean;
}

const messageSchema: Schema<IMessage> = new Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: { type: String, required: true, trim: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const Message =
  mongoose.models.Message || mongoose.model<IMessage>("Message", messageSchema);

export default Message;
