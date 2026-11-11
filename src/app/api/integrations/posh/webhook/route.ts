import {NextResponse} from "next/server";
// Explicitly not operational: do not accept unauthenticated order payloads,
// fabricate POSH fields, or claim an integration is connected.
export async function POST(){
 return NextResponse.json({error:"POSH ingestion not configured or verified"},{status:503});
}
