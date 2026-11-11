import {requireEditor} from "@/lib/auth";
import {PersonForm} from "@/components/person-form";
export default async function NewPerson(){
 const {db,member}=await requireEditor();
 const [r,a]=await Promise.all([
  db.from("role_types").select("id,name").eq("organization_id",member.organization_id).order("name"),
  db.from("affiliations").select("id,name").eq("organization_id",member.organization_id).order("name")
 ]);
 return <><h1 className="text-3xl font-bold mb-7">Add a person</h1><PersonForm roles={r.data??[]} affiliations={a.data??[]}/></>;
}
