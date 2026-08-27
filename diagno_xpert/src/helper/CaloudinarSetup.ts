import { v2 as cloudinary } from "cloudinary"; 

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const ImageHandeler=async ({user,file,data}:{user:any,file:any,data:any})=>{

     if (file) {
    const previousPublicId = user?.profilePicture?.Location;
    if (previousPublicId) {
      const destroyResponse: any = await cloudinary.uploader.destroy(previousPublicId, {
        invalidate: true,
      });

      if (!["ok", "not found"].includes(destroyResponse?.result)) {
        throw new Error("Failed to delete previous profile picture from Cloudinary.");
      }
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResponse: any = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "DiagnoXpert" }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        })
        .end(buffer);
    });

   return data.profilePicture = {
      Url: uploadResponse.secure_url,
      Location: uploadResponse.public_id,
    };
  }

}