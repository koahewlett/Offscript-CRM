"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
export function CatalogForm({kind}:{kind:"role"|"affiliation"}){
 const [name,setName]=useState("");const [category,setCategory]=useState("other");const [error,setError]=useState("");
 const router=useRouter();
 return <form className="flex flex-wrap gap-2 mt-3" onSubmit={async e=>{
  e.preventDefault();setError("");
  const res=await fetch("/api/settings/catalog",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({kind,name,category})});
  const result=await res.json();if(!res.ok){setError(result.error||"Cannot save");return;}
  setName("");router.refresh();
 }}>
 <input className="!w-auto flex-1 min-w-[150px]" placeholder={`New ${kind} name`} value={name} onChange={e=>setName(e.target.value)} required/>
 {kind==="affiliation"&&<select className="!w-auto" value={category} onChange={e=>setCategory(e.target.value)}>
  {["fraternity","sorority","university","student_organization","entertainment_company","venue","business","other"].map(c=><option key={c} value={c}>{c.replaceAll("_"," ")}</option>)}
 </select>}
 <button className="action">Add</button>{error&&<p role="alert">{error}</p>}
 </form>;
}
