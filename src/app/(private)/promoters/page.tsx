import Link from "next/link";
import {requireMember} from "@/lib/auth";
export default async function Promoters(){
 const {db,member}=await requireMember();
 const {data,error}=await db.from("person_roles").select("person_id,people!inner(id,first_name,last_name,email,instagram,archived_at),role_types!inner(name)")
 .eq("organization_id",member.organization_id).eq("role_types.name","Promoter").is("people.archived_at",null);
 return <div className="space-y-5"><h1 className="text-3xl font-bold">Promoters</h1><p className="text-muted">Filtered from the single People database.</p>
 <div className="panel">{error?<p role="alert">{error.message}</p>:!data?.length?<p className="text-muted">No contacts have the Promoter role yet.</p>:
 <ul className="divide-y divide-line">{data.map(x=>{const p=x.people as unknown as {id:string;first_name:string;last_name:string;email:string|null};
 return <li key={x.person_id} className="py-3"><Link className="underline" href={`/people/${p.id}`}>{p.first_name} {p.last_name}</Link><span className="text-muted ml-4">{p.email??""}</span></li>;})}</ul>}</div>
 <p className="text-muted text-sm">Sales rankings require verified POSH order ingestion and are not enabled.</p></div>;
}
