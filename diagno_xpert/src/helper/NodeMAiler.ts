import nodemailer from "nodemailer";
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  secure: true,
  auth: {
    user: "memankhadim@gmail.com",
    pass: process.env.mailpass,
  },
});

async function sendEmail(email: string, html: string,subject?:string) {
  const info = await transporter.sendMail({
    from: 'DiagnoXpert <memankhadim@gmail.com>', 
    to: email,
    subject: subject || "DiagnoXpert Notification",
    html: html,  
  });

  console.log("Message sent: %s", info.messageId);
}

export  {sendEmail};
