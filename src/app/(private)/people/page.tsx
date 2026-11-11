import Link from "next/link";
import {requireMember} from "@/lib/auth";
export default async function People({searchParams}:{searchParams:Promise<{q?:string;page?:string;age?:string}>}){
 const {db,member}=await requireMember();const p=await searchParams;
 const page=Math.max(1,Math.floor(Number(p.page)||1)),size=25;
 let query=db.from("people").select("id,first_name,last_name,email,phone,instagram,age_classification,contact_status,created_at,person_roles(role_types(name)),person_affiliations(affiliations(name))",{count:"exact"})
  .eq("organization_id",member.organization_id).is("archived_at",null);
 if(p.q?.trim()) {
  const safe=p.q.trim().replace(/[,()%]/g,"");
  if(safe) query=query.or(`first_name.ilike.%${safe}%,last_name.ilike.%${safe}%,email.ilike.%${safe}%,instagram.ilike.%${safe}%`);
 }
 if(["under_21","21_plus","unknown"].includes(p.age||"")) query=query.eq("age_classification",p.age!);
 const {data,error,count}=await query.order("created_at",{ascending:false}).range((page-1)*size,page*size-1);
 return <div className="space-y-6">
  <div className="flex justify-between items-center gap-4"><div><h1 className="text-3xl font-bold">People</h1><p className="text-muted">Canonical contact database · {count??0} records</p></div>
   {member.role!=="viewer"&&<Link className="action" href="/people/new">Add person</Link>}</div>
  <form className="panel flex flex-wrap gap-3"><input className="flex-1 min-w-[220px]" name="q" defaultValue={p.q??""} placeholder="Search name, email or Instagram"/>
   <select className="!w-auto" name="age" defaultValue={p.age??""}><option value="">All ages</option><option value="21_plus">21+</option><option value="under_21">Under 21</option><option value="unknown">Unknown</option></select>
   <button className="action">Filter</button></form>
  <div className="panel overflow-x-auto">
   {error?<p role="alert">Unable to load contacts: {error.message}</p>:data?.length===0?<p className="text-muted">No contacts found. Add a person or adjust your filters.</p>:
    <table className="w-full min-w-[850px]"><thead><tr>{["Name","Roles","Affiliations","Age","Instagram","Phone","Status"].map(x=><th key={x}>{x}</th>)}</tr></thead>
     <tbody>{data?.map(person=><tr key={person.id}>
      <td><Link href={`/people/${person.id}`} className="font-medium underline">{person.first_name} {person.last_name}</Link></td>
      <td>{(person.person_roles as unknown as {role_types:{name:string}|null}[])?.map(x=>x.role_types?.name).filter(Boolean).join(", ")||"—"}</td>
      <td>{(person.person_affiliations as unknown as {affiliations:{name:string}|null}[])?.map(x=>x.affiliations?.name).filter(Boolean).join(", ")||"—"}</td>
      <td>{person.age_classification.replaceAll("_"," ")}</td><td>{person.instagram??"—"}</td><td>{person.phone??"—"}</td><td>{person.contact_status.replaceAll("_"," ")}</td>
     </tr>)}</tbody></table>}
  </div>
  <div className="flex gap-4 items-center text-sm">
   {page>1&&<Link className="underline" href={`/people?${new URLSearchParams({q:p.q??"",age:p.age??"",page:String(page-1)})}`}>Previous</Link>}
   <span>Page {page}</span>
   {page*size<(count??0)&&<Link className="underline" href={`/people?${new URLSearchParams({q:p.q??"",age:p.age??"",page:String(page+1)})}`}>Next</Link>}
  </div>
 </div>;
}
