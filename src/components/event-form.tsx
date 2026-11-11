"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
export function EventForm({venues}:{venues:{id:string;name:string}[]}){
 const router=useRouter();const [error,setError]=useState("");
 const [busy,setBusy]=useState(false);
 return <form className="panel max-w-2xl space-y-5" onSubmit={async e=>{
  e.preventDefault();setBusy(true);setError("");
  const fd=new FormData(e.currentTarget);
  const local=String(fd.get("starts_at"));
  const date=new Date(local);
  if(Number.isNaN(date.valueOf())){setError("Enter a valid date");setBusy(false);return;}
  const body={name:fd.get("name"),description:fd.get("description"),starts_at:date.toISOString(),
   time_zone:fd.get("time_zone"),status:fd.get("status"),venue_id:fd.get("venue_id")||null};
  const res=await fetch("/api/events",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)});
  const result=await res.json();setBusy(false);
  if(!res.ok){setError(result.error??"Unable to create event");return;}
  router.push("/events");router.refresh();
 }}>
 <label className="block">Event name<input name="name" required maxLength={200}/></label>
 <label className="block">Description<textarea name="description" rows={3}/></label>
 <label className="block">Start date/time<input name="starts_at" type="datetime-local" required/></label>
 <label className="block">IANA time zone<input name="time_zone" defaultValue="America/Phoenix" required/></label>
 <label className="block">Status<select name="status">{["planning","announced","on_sale","completed","canceled"].map(x=><option key={x} value={x}>{x.replaceAll("_"," ")}</option>)}</select></label>
 <label className="block">Venue<select name="venue_id"><option value="">Not selected</option>{venues.map(v=><option key={v.id} value={v.id}>{v.name}</option>)}</select></label>
 {error&&<p role="alert" className="text-rose-300">{error}</p>}<button className="action" disabled={busy}>{busy?"Creating…":"Create event"}</button>
 </form>;
}
