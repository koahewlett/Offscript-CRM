import Link from "next/link";
import {requireMember} from "@/lib/auth";
export default async function Events(){
 const {db,member}=await requireMember();
 const {data,error}=await db.from("events").select("id,name,starts_at,time_zone,status,venues(name)").eq("organization_id",member.organization_id).order("starts_at",{ascending:false}).limit(100);
 return <div className="space-y-6"><div className="flex justify-between"><h1 className="text-3xl font-bold">Events</h1>{member.role!=="viewer"&&<Link className="action" href="/events/new">New event</Link>}</div>
 <div className="panel overflow-x-auto">{error?<p role="alert">{error.message}</p>:!data?.length?<p className="text-muted">No events yet.</p>:
 <table className="w-full"><thead><tr><th>Event</th><th>Starts</th><th>Status</th><th>Venue</th></tr></thead><tbody>
 {data.map(e=><tr key={e.id}><td className="font-semibold">{e.name}</td><td>{new Date(e.starts_at).toLocaleString()} ({e.time_zone})</td><td>{e.status}</td><td>{(e.venues as unknown as {name:string}|null)?.name??"—"}</td></tr>)}
 </tbody></table>}</div></div>;
}
