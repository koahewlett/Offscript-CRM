import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export type MemberRole = "owner"|"manager"|"viewer";

export async function requireMember() {
 const db=await supabaseServer();
 const {data:{user},error}=await db.auth.getUser();
 if(error || !user) redirect("/login");
 const {data:member,error:memberErr}=await db
 .from("organization_members").select("organization_id,role")
 .eq("user_id",user.id).eq("active",true).order("created_at",{ascending:true}).limit(1).maybeSingle();
 if(memberErr || !member) redirect("/no-access");
 return {db,user,member:member as {organization_id:string;role:MemberRole}};
}
export async function requireEditor() {
 const context=await requireMember();
 if(context.member.role==="viewer") redirect("/no-access");
 return context;
}
