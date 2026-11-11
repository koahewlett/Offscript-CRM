import {requireEditor} from "@/lib/auth";
import {EventForm} from "@/components/event-form";
export default async function NewEvent(){
 const {db,member}=await requireEditor();
 const {data}=await db.from("venues").select("id,name").eq("organization_id",member.organization_id).order("name");
 return <><h1 className="text-3xl font-bold mb-6">Create event</h1><EventForm venues={data??[]}/></>;
}
