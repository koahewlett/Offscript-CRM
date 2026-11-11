"use client";
import {useRouter} from "next/navigation";
import {supabaseBrowser} from "@/lib/supabase/browser";
export function LogoutButton(){
 const router=useRouter();
 return <button className="text-sm text-muted underline" onClick={async()=>{await supabaseBrowser().auth.signOut();router.push("/login");router.refresh();}}>Sign out</button>;
}
