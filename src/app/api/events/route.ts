import {NextResponse} from "next/server";
import {z} from "zod";
import {requireEditor} from "@/lib/auth";
const schema=z.object({
 name:z.string().trim().min(1).max(200),
 description:z.string().max(5000).optional(),
 starts_at:z.iso.datetime({offset:true}),
 time_zone:z.string().min(1).max(100),
 status:z.enum(["planning","announced","on_sale","completed","canceled"]),
 venue_id:z.union([z.uuid(),z.null()])
});
export async function POST(req:Request){
 const {db,member}=await requireEditor();
 const parsed=schema.safeParse(await req.json().catch(()=>null));
 if(!parsed.success)return NextResponse.json({error:"Invalid event",issues:parsed.error.issues},{status:400});
 const {data,error}=await db.from("events").insert({...parsed.data,organization_id:member.organization_id}).select("id").single();
 if(error)return NextResponse.json({error:error.message},{status:400});
 return NextResponse.json(data,{status:201});
}
