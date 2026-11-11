"use client";
import {useState} from "react";
import {supabaseBrowser} from "@/lib/supabase/browser";
export function PasswordReset(){
 const [password,setPassword]=useState("");const [result,setResult]=useState("");
 return <form className="space-y-4" onSubmit={async e=>{e.preventDefault();const {error}=await supabaseBrowser().auth.updateUser({password});setResult(error?.message??"Password updated. You can now sign in.");}}>
 <label>New password<input type="password" minLength={12} required value={password} onChange={e=>setPassword(e.target.value)}/></label>
 <button className="action">Update password</button><p role="status">{result}</p></form>
}
