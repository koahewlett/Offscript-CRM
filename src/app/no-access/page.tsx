import {LogoutButton} from "@/components/logout-button";
export default function NoAccess(){return <main className="max-w-lg mx-auto mt-24 panel"><h1 className="text-2xl font-bold">Access not granted</h1><p className="text-muted my-4">Your account is not an active member of an OFFSCRIPT organization. Ask an owner to invite you.</p><LogoutButton/></main>}
