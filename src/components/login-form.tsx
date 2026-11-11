"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {supabaseBrowser} from "@/lib/supabase/browser";
export function LoginForm(){
 const [email,setEmail]=useState("");
 const [password,setPassword]=useState("");
 const [error,setError]=useState("");
 const [busy,setBusy]=useState(false);
 const [reset,setReset]=useState(false);
 const router=useRouter();
 async function signIn(e:React.FormEvent) {
  e.preventDefault();setBusy(true);setError("");
  const db=supabaseBrowser();
  if(reset) {
   const {error}=await db.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin+"/reset-password"});
   setError(error?.message || "If the email is registered, a recovery message has been sent.");
  } else {
   const {error}=await db.auth.signInWithPassword({email,password});
   if(error) setError(error.message); else {router.push("/overview");router.refresh();}
  }
  setBusy(false);
 }
 return <form onSubmit={signIn} className="space-y-4">
  <label className="block text-sm">Email<input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label>
  {!reset && <label className="block text-sm">Password<input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)}/></label>}
  {error && <p role="status" className="text-sm text-amber-200">{error}</p>}
  <button className="action w-full" disabled={busy}>{busy?"Working…":reset?"Send reset email":"Sign in"}</button>
  <button className="text-sm text-muted underline" type="button" onClick={()=>{setReset(!reset);setError("");}}>{reset?"Return to sign in":"Forgot password?"}</button>
 </form>;
}
