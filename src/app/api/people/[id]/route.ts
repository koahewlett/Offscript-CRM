import {NextResponse} from "next/server";
import {requireEditor} from "@/lib/auth";
import {personSchema} from "@/lib/validators";

export async function PATCH(request:Request,context:{params:Promise<{id:string}>}) {
 const {db,member}=await requireEditor();
 const {id}=await context.params;
 const parsed=personSchema.safeParse(await request.json().catch(()=>null));
 if(!parsed.success) return NextResponse.json({error:"Invalid person data",issues:parsed.error.issues},{status:400});
 const {data,error}=await db.rpc("save_person",{p_org:member.organization_id,p_payload:parsed.data,p_id:id});
 if(error) return NextResponse.json({error:error.message},{status:400});
 return NextResponse.json({id:data});
}
export async function DELETE(_request:Request,context:{params:Promise<{id:string}>}) {
 const {db,member,user}=await requireEditor();
 const {id}=await context.params;
 const {data,error}=await db.from("people").update({archived_at:new Date().toISOString()})
   .eq("id",id).eq("organization_id",member.organization_id).is("archived_at",null).select("id").maybeSingle();
 if(error) return NextResponse.json({error:error.message},{status:400});
 if(!data) return NextResponse.json({error:"Not found"},{status:404});
 await db.from("audit_logs").insert({organization_id:member.organization_id,actor_id:user.id,action:"archive",entity_type:"person",entity_id:id});
 return NextResponse.json({id});
}
