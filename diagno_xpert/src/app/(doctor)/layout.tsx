import DoctorNavbar from "@/components/page/doctors/Navbar"


export default function DoctorLayout({children}:{children:React.ReactNode}){
    return(
            <div className="bg-white text-black min-h-screen w-full overflow-x-hidden">
                <DoctorNavbar/>
                {children}
            </div>
    )
}