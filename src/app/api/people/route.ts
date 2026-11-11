import {NextResponse} from "next/server";
import {requireEditor} from "@/lib/auth";
import {personSchema} from "@/lib/validators";

export async function POST(request:Request) {
 const {db,member}=await requireEditor();
 const parsed=personSchema.safeParse(await request.json().catch(()=>null));
 if(!parsed.success) return NextResponse.json({error:"Invalid person data",issues:parsed.error.issues},{status:400});
 const {data,error}=await db.rpc("save_person",{p_org:member.organization_id,p_payload:parsed.data,p_id:null});
 if(error) return NextResponse.json({error:error.message},{status:400});
 return NextResponse.json({id:data},{status:201});
}
