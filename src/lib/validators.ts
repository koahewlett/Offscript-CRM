import {z} from "zod";
const optionalText=(max:number)=>z.string().trim().max(max).optional().transform(x=>x||null);
export const personSchema=z.object({
 first_name:z.string().trim().min(1).max(120),
 last_name:z.string().trim().min(1).max(120),
 preferred_name:optionalText(120),
 email:z.union([z.email().max(320),z.literal("")]).transform(x=>x||null),
 phone:optionalText(40),
 instagram:optionalText(120),
 city:optionalText(120),
 age_classification:z.enum(["under_21","21_plus","unknown"]),
 contact_status:z.enum(["new","contacted","interested","active","inactive","do_not_contact"]),
 notes:optionalText(5000),
 role_ids:z.array(z.uuid()).max(40).default([]),
 affiliation_ids:z.array(z.uuid()).max(40).default([])
});
export type PersonInput=z.infer<typeof personSchema>;
