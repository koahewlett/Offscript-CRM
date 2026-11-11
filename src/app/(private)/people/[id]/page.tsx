import Link from "next/link";
import {notFound} from "next/navigation";
import {requireMember} from "@/lib/auth";
import {PersonForm} from "@/components/person-form";
import {ArchiveButton} from "@/components/archive-button";
export default async function PersonDetail({params}:{params:Promise<{id:string}>}){
 const {id}=await params;const {db,member}=await requireMember();
 const [personResult,r,a,pr,pa,notes]=await Promise.all([
  db.from("people").select("*").eq("organization_id",member.organization_id).eq("id",id).is("archived_at",null).maybeSingle(),
  db.from("role_types").select("id,name").eq("organization_id",member.organization_id).order("name"),
  db.from("affiliations").select("id,name").eq("organization_id",member.organization_id).order("name"),
  db.from("person_roles").select("role_id").eq("organization_id",member.organization_id).eq("person_id",id),
  db.from("person_affiliations").select("affiliation_id").eq("organization_id",member.organization_id).eq("person_id",id),
  db.from("contact_notes").select("id,body,created_at").eq("organization_id",member.organization_id).eq("person_id",id).order("created_at",{ascending:false}).limit(30)
 ]);
 const person=personResult.data;if(!person)notFound();
 return <div className="space-y-6"><Link href="/people" className="text-muted underline">← People</Link>
  <div className="flex items-center justify-between gap-4"><h1 className="text-3xl font-bold">{person.first_name} {person.last_name}</h1>
  {member.role!=="viewer"&&<ArchiveButton id={id}/>}</div>
  {member.role==="viewer"?<div className="panel space-y-3"><p>Email: {person.email??"—"}</p><p>Phone: {person.phone??"—"}</p><p>Instagram: {person.instagram??"—"}</p><p>Age classification: {person.age_classification}</p></div>:
   <PersonForm person={person} roles={r.data??[]} affiliations={a.data??[]}
    selectedRoles={(pr.data??[]).map(x=>x.role_id)} selectedAffiliations={(pa.data??[]).map(x=>x.affiliation_id)}/>}
  <section className="panel"><h2 className="font-semibold mb-3">Recent notes</h2>
  {(notes.data??[]).length?notes.data?.map(n=><div key={n.id} className="py-3 border-b border-line"><p>{n.body}</p><p className="text-xs text-muted">{new Date(n.created_at).toLocaleString()}</p></div>):<p className="text-muted">No notes yet.</p>}
  </section></div>;
}
