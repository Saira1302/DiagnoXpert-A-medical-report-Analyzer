import mongoose, { Schema } from "mongoose";

export type NotificationType = "message";

export interface INotification {
  userId: Schema.Types.ObjectId;
  fromUserId?: Schema.Types.ObjectId | null;
  type: NotificationType;
  title: string;
  body: string;
  link: string;
  read: boolean;
  meta?: Record<string, unknown>;
}

const notificationSchema: Schema<INotification> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    fromUserId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    type: {
      type: String,
      enum: ["message"],
      default: "message",
    },
    title: { type: String, default: "" },
    body: { type: String, default: "" },
    link: { type: String, default: "" },
    read: { type: Boolean, default: false },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

const Notification =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", notificationSchema);

export default Notification;
