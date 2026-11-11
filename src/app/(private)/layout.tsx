import Link from "next/link";
import {requireMember} from "@/lib/auth";
import {LogoutButton} from "@/components/logout-button";
const navigation=[
 ["Overview","/overview"],["People","/people"],["Promoters","/promoters"],["Events","/events"],
 ["Talent & Staff","/talent"],["Venues","/venues"],["Analytics","/analytics"],
 ["Imports & Integrations","/integrations"],["Settings","/settings"]
];
export default async function PrivateLayout({children}:{children:React.ReactNode}){
 const {user,member}=await requireMember();
 return <div className="min-h-screen md:flex">
  <aside className="md:w-64 border-r border-line px-4 py-6 md:min-h-screen">
   <div className="text-xl font-black tracking-widest mb-1">OFFSCRIPT</div>
   <p className="text-xs text-muted tracking-widest mb-8">HQ / INTERNAL</p>
   <nav aria-label="Main navigation" className="flex md:flex-col gap-1 overflow-x-auto">
    {navigation.map(([name,url])=><Link key={url} className="whitespace-nowrap rounded-lg px-3 py-2 text-sm hover:bg-panel" href={url}>{name}</Link>)}
   </nav>
   <div className="text-xs text-muted border-t border-line pt-4 mt-8 break-all">{user.email}<div className="capitalize mt-1 mb-3">{member.role}</div><LogoutButton/></div>
  </aside>
  <main className="flex-1 min-w-0 px-5 md:px-10 py-8 max-w-[1800px]">{children}</main>
 </div>;
}
