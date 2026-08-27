export interface CreateDoctorInput {
    userId: string;
    speciality?: string;
    experience?: number;
    fee?: number;
    city?: string;
    languages?: string[];
    conditions?: string[];
    availableDays?: string[];
    qualification?: string;
    about?: string;
    active?: boolean;
  }

export const specialties = [
        {
            name: "Child Specialist",
            image: "/doctor/child-specialist.png",
            description: "Expert pediatric care for your children",
            link: "/doctors/child-specialist"
        },
        {
            name: "Dentist",
            image: "/doctor/dentist.png",
            description: "Complete dental care and oral health",
            link: "/doctors/dentist"

        },
        {
            name: "Eye Specialist",
            image: "/doctor/eye-specialist.png",
            description: "Comprehensive eye care and vision solutions",
            link: "/doctors/eye-specialist"
        },
        {
            name: "Gastroenterologist",
            image: "/doctor/gastroenterologist.png",
            description: "Digestive system and liver specialists",
            link: "/doctors/gastroenterologist"
        },
        {
            name: "Obesity Specialist",
            image: "/doctor/obesity-specialist.png",
            description: "Weight management and nutrition experts",
            link: "/doctors/obesity-specialist"
        },
        {
            name: "Orthopedic Surgeon",
            image: "/doctor/orthopedic-surgeon.png",
            description: "Bone, joint, and muscle care specialists",
            link: "/doctors/orthopedic-surgeon"
        },
        {
            name: "Psychiatrist",
            image: "/doctor/psychiatrist.png",
            description: "Mental health and wellness support",
            link: "/doctors/psychiatrist"
        },
        {
            name: "Skin Specialist",
            image: "/doctor/skin-specialist.png",
            description: "Dermatology and skin care treatments",
            link: "/doctors/skin-specialist"
        }
    ];