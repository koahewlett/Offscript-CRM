"use client";
import {useRouter} from "next/navigation";
import {useState} from "react";

type Choice={id:string;name:string};
type Person={
 id:string;first_name:string;last_name:string;preferred_name:string|null;email:string|null;
 phone:string|null;instagram:string|null;city:string|null;notes:string|null;
 age_classification:string;contact_status:string;
};
export function PersonForm({person,roles,affiliations,selectedRoles=[],selectedAffiliations=[]}:{
 person?:Person;roles:Choice[];affiliations:Choice[];
 selectedRoles?:string[];selectedAffiliations?:string[];
}){
 const router=useRouter();
 const [error,setError]=useState("");const [saving,setSaving]=useState(false);
 const [roleIds,setRoleIds]=useState<string[]>(selectedRoles);
 const [affIds,setAffIds]=useState<string[]>(selectedAffiliations);
 function flip(id:string,setter:React.Dispatch<React.SetStateAction<string[]>>) {
  setter(old=>old.includes(id)?old.filter(x=>x!==id):[...old,id]);
 }
 async function save(e:React.FormEvent<HTMLFormElement>) {
  e.preventDefault();setSaving(true);setError("");
  const fd=new FormData(e.currentTarget);
  const fields=["first_name","last_name","preferred_name","email","phone","instagram","city","age_classification","contact_status","notes"];
  const payload:Record<string,unknown>={};
  for(const field of fields) payload[field]=String(fd.get(field)??"");
  payload.role_ids=roleIds;payload.affiliation_ids=affIds;
  try{
   const res=await fetch(person?`/api/people/${person.id}`:"/api/people",{
    method:person?"PATCH":"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)
   });
   const result=await res.json();
   if(!res.ok) throw Error(result.error||"Save failed");
   router.push(`/people/${result.id}`);router.refresh();
  }catch(err){setError(err instanceof Error?err.message:"Save failed");}finally{setSaving(false);}
 }
 const input=(name:keyof Person,label:string,required=false)=><label className="text-sm block" key={name}>{label}<input name={name} defaultValue={String(person?.[name]??"")} required={required} maxLength={name==="notes"?5000:320}/></label>;
 return <form onSubmit={save} className="space-y-6 max-w-3xl">
  <div className="panel grid grid-cols-1 sm:grid-cols-2 gap-4">
   {input("first_name","First name",true)}{input("last_name","Last name",true)}
   {input("preferred_name","Preferred name")}{input("email","Email")}
   {input("phone","Phone")}{input("instagram","Instagram")}
   {input("city","City")}
   <label className="text-sm">Age classification<select name="age_classification" defaultValue={person?.age_classification??"unknown"}>
    <option value="unknown">Unknown</option><option value="under_21">Under 21</option><option value="21_plus">21+</option>
   </select></label>
   <label className="text-sm">Relationship status<select name="contact_status" defaultValue={person?.contact_status??"new"}>
    {["new","contacted","interested","active","inactive","do_not_contact"].map(x=><option key={x} value={x}>{x.replaceAll("_"," ")}</option>)}
   </select></label>
  </div>
  <div className="panel"><h2 className="font-bold mb-3">Roles (select multiple)</h2>
   {roles.length===0?<p className="text-muted text-sm">Create role types in Settings first.</p>:<div className="grid grid-cols-2 md:grid-cols-3 gap-2">
    {roles.map(x=><label key={x.id} className="text-sm flex gap-2"><input className="!w-auto" type="checkbox" checked={roleIds.includes(x.id)} onChange={()=>flip(x.id,setRoleIds)}/>{x.name}</label>)}
   </div>}
  </div>
  <div className="panel"><h2 className="font-bold mb-3">Affiliations (select multiple)</h2>
   {affiliations.length===0?<p className="text-muted text-sm">Create affiliations in Settings first.</p>:<div className="grid grid-cols-2 md:grid-cols-3 gap-2">
    {affiliations.map(x=><label key={x.id} className="text-sm flex gap-2"><input className="!w-auto" type="checkbox" checked={affIds.includes(x.id)} onChange={()=>flip(x.id,setAffIds)}/>{x.name}</label>)}
   </div>}
  </div>
  <label className="text-sm block">Internal notes<textarea name="notes" rows={4} defaultValue={person?.notes??""}/></label>
  {error&&<p className="text-rose-300" role="alert">{error}</p>}
  <button className="action" disabled={saving}>{saving?"Saving…":"Save person"}</button>
 </form>
}
