import {requireMember} from "@/lib/auth";
import {CatalogForm} from "@/components/catalog-form";
export default async function Settings(){
 const {db,member}=await requireMember();
 const [roles,aff]=await Promise.all([
  db.from("role_types").select("id,name").eq("organization_id",member.organization_id).order("name"),
  db.from("affiliations").select("id,name,category").eq("organization_id",member.organization_id).order("name")
 ]);
 return <div className="space-y-6"><h1 className="text-3xl font-bold">Settings</h1>
 <div className="grid md:grid-cols-2 gap-4"><section className="panel"><h2 className="font-semibold">Role types</h2>
 <ul className="text-sm text-muted my-4 space-y-1">{roles.data?.map(x=><li key={x.id}>{x.name}</li>)}</ul>
 {member.role!=="viewer"&&<CatalogForm kind="role"/>}</section>
 <section className="panel"><h2 className="font-semibold">Affiliations</h2>
 <ul className="text-sm text-muted my-4 space-y-1">{aff.data?.map(x=><li key={x.id}>{x.name} · {x.category}</li>)}</ul>
 {member.role!=="viewer"&&<CatalogForm kind="affiliation"/>}</section></div>
 <p className="text-sm text-muted">User invitations and integration configuration require a trusted administrative workflow and are not yet exposed here.</p>
 </div>;
}
