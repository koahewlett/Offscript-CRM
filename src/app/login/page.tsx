import {LoginForm} from "@/components/login-form";
export default function Login(){
 return <main className="min-h-screen flex items-center justify-center px-4">
   <div className="panel w-full max-w-md">
    <div className="text-xs tracking-[.3em] text-muted mb-3">PRIVATE OPERATIONS</div>
    <h1 className="text-3xl font-bold mb-2">OFFSCRIPT HQ</h1>
    <p className="text-muted mb-8">Sign in with your approved management account.</p>
    <LoginForm/>
   </div>
 </main>;
}
