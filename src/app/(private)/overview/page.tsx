import Link from "next/link";
import {requireMember} from "@/lib/auth";
export default async function Overview(){
 const {db,member}=await requireMember();
 const [people,events,promoters]=await Promise.all([
  db.from("people").select("id",{count:"exact",head:true}).eq("organization_id",member.organization_id).is("archived_at",null),
  db.from("events").select("id",{count:"exact",head:true}).eq("organization_id",member.organization_id).gte("starts_at",new Date().toISOString()),
  db.from("person_roles").select("person_id,role_types!inner(name)",{count:"exact",head:true}).eq("organization_id",member.organization_id).eq("role_types.name","Promoter")
 ]);
 const cards=[["Contacts",people.count, "/people"],["Upcoming events",events.count,"/events"],["Promoter role assignments",promoters.count,"/promoters"]];
 return <section className="space-y-7">
  <div><p className="tracking-widest text-muted text-xs">OFFSCRIPT / MANAGEMENT</p><h1 className="text-3xl font-bold mt-2">Overview</h1>
   <p className="text-muted mt-2">Live organization records. No sample sales are included.</p></div>
  <div className="grid md:grid-cols-3 gap-4">{cards.map(([label,value,href])=><Link href={String(href)} key={String(label)} className="panel block hover:border-muted">
   <p className="text-muted text-sm">{label}</p><p className="text-4xl font-bold mt-5">{value??"—"}</p></Link>)}</div>
  <div className="panel"><h2 className="font-bold mb-2">POSH sales reporting</h2><p className="text-muted">
  Not configured. Verified sales, promoter attribution, and revenue charts will become available only after supported POSH data ingestion and reconciliation are implemented.</p></div>
 </section>;
}
