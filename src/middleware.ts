import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
 let res = NextResponse.next({ request:req });
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const anon=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url || !anon) return res;
 const client=createServerClient(url,anon,{
  cookies:{
   getAll:()=>req.cookies.getAll(),
   setAll(items) {
    items.forEach(({name,value})=>req.cookies.set(name,value));
    res=NextResponse.next({request:req});
    items.forEach(({name,value,options})=>res.cookies.set(name,value,options));
   }
  }
 });
 // Refresh expired sessions; authorization is independently enforced by server functions and RLS.
 await client.auth.getUser();
 return res;
}
export const config={matcher:["/((?!_next/static|_next/image|favicon.ico).*)"]};
