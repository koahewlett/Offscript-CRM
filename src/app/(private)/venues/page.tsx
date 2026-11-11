import {requireMember} from "@/lib/auth";
export default async function Venues(){
 const {db,member}=await requireMember();
 const {data,error}=await db.from("venues").select("id,name,address,city,capacity").eq("organization_id",member.organization_id).order("name");
 return <div className="space-y-6"><h1 className="text-3xl font-bold">Venues</h1><div className="panel">{error?<p role="alert">{error.message}</p>:!data?.length?<p className="text-muted">No venues added yet.</p>:<ul>{data.map(v=><li key={v.id} className="py-3 border-b border-line">{v.name} · {v.city??"Location not provided"}</li>)}</ul>}</div>
 <p className="text-muted">Venue creation and editing screens are not implemented yet.</p></div>;
}
