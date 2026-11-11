import {NextResponse} from "next/server";
import {z} from "zod";
import {requireEditor} from "@/lib/auth";
const schema=z.object({kind:z.enum(["role","affiliation"]),name:z.string().trim().min(1).max(120),category:z.string().trim().max(80).optional()});
export async function POST(req:Request){
 const {db,member}=await requireEditor();
 const parsed=schema.safeParse(await req.json().catch(()=>null));
 if(!parsed.success)return NextResponse.json({error:"Invalid input"},{status:400});
 const {kind,name,category}=parsed.data;
 const table=kind==="role"?"role_types":"affiliations";
 const values=kind==="role"?{name,organization_id:member.organization_id}:{name,category:category||"other",organization_id:member.organization_id};
 const {data,error}=await db.from(table).insert(values).select("id").single();
 if(error)return NextResponse.json({error:error.message},{status:400});
 return NextResponse.json(data,{status:201});
}
