import React from "react";

export interface HomeCardProps {
    title?: React.ReactNode;
    description?: React.ReactNode;
    icon?: React.ComponentType<{ size?: number; className?: string }> | null;
    imageUrl?: string;
    className?: string;
}

const HomeCard = ({ title, description, icon: Icon, imageUrl, className }: HomeCardProps) => {
    return (
        <div className={className}>
            {Icon && <Icon size={48} className="text-blue-500 w-44 h-20 m-auto mb-2" />}
            {imageUrl && <img src={imageUrl} alt={typeof title === "string" ? title : "Card image"} className="w-22 h-22 mb-2 m-auto rounded-full" />}
            <p className="text-md font-bold pt-4 text-center">{title}</p>
            <p>{description}</p>
        </div>
    );
};

export default HomeCard;