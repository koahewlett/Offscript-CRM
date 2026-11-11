"use client";
import {useRouter} from "next/navigation";
import {useState} from "react";
export function ArchiveButton({id}:{id:string}){
 const router=useRouter();const [error,setError]=useState("");
 return <div><button className="action-secondary" onClick={async()=>{
  if(!window.confirm("Archive this contact?"))return;
  const response=await fetch(`/api/people/${id}`,{method:"DELETE"});
  if(!response.ok){setError("Archive failed");return;}
  router.push("/people");router.refresh();
 }}>Archive person</button>{error&&<p role="alert">{error}</p>}</div>;
}
