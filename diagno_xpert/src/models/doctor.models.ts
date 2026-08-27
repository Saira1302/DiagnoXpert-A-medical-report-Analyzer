import mongoose, { Schema } from "mongoose";

export interface IDoctor {
    userId: Schema.Types.ObjectId;
    speciality: string;
    experience: number;
    ratingAvg: number;
    reviews: {
        ObjectId: Schema.Types.ObjectId;
    };
    fee: number;
    city: string;
    languages: string[];
    conditions: string[];
    availableDays: string[];
    qualification: string;
    about: string;
    active: boolean;
  }

const doctorSchema: Schema<IDoctor> = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    speciality: {
        type: String
    },
    experience: {
        type: Number
    },
    ratingAvg: {
        type: Number
    },
    reviews: {
        type: [Schema.Types.ObjectId],
        ref: "Review",
    },
    fee: {
        type: Number
    },
    city: {
        type: String
    },
    languages: {
        type: [String]
    },
    conditions: {
        type: [String],
    },
    availableDays: {
        type: [String]
    },
    qualification: {
        type: String
    },
    about: {
        type: String
    },  
    active: {
        type: Boolean,
        default: false
    },
}, { timestamps: true });

const Doctor = mongoose.models.Doctor || mongoose.model<IDoctor>("Doctor", doctorSchema);

export default Doctor;
