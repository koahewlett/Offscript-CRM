-- Atomically persist a person and their role/affiliation links.
create or replace function public.save_person(
 p_org uuid, p_payload jsonb, p_id uuid default null
) returns uuid
language plpgsql security invoker set search_path=''
as $$
declare v_id uuid;
begin
 if not public.can_edit_org(p_org) then raise exception 'Not authorized'; end if;
 if p_id is null then
  insert into public.people(
   organization_id,first_name,last_name,preferred_name,email,phone,instagram,city,
   age_classification,contact_status,notes,created_by
  ) values (
   p_org,p_payload->>'first_name',p_payload->>'last_name',p_payload->>'preferred_name',
   nullif(p_payload->>'email',''),p_payload->>'phone',p_payload->>'instagram',p_payload->>'city',
   coalesce((p_payload->>'age_classification')::public.age_group,'unknown'),
   coalesce(p_payload->>'contact_status','new'),p_payload->>'notes',auth.uid()
  ) returning id into v_id;
 else
  update public.people set
   first_name=p_payload->>'first_name',last_name=p_payload->>'last_name',
   preferred_name=p_payload->>'preferred_name',email=nullif(p_payload->>'email',''),
   phone=p_payload->>'phone',instagram=p_payload->>'instagram',city=p_payload->>'city',
   age_classification=(p_payload->>'age_classification')::public.age_group,
   contact_status=p_payload->>'contact_status',notes=p_payload->>'notes'
  where id=p_id and organization_id=p_org returning id into v_id;
  if v_id is null then raise exception 'Person not found'; end if;
  delete from public.person_roles where organization_id=p_org and person_id=v_id;
  delete from public.person_affiliations where organization_id=p_org and person_id=v_id;
 end if;
 insert into public.person_roles (organization_id,person_id,role_id)
 select p_org,v_id,x::uuid from jsonb_array_elements_text(coalesce(p_payload->'role_ids','[]'::jsonb)) x;
 insert into public.person_affiliations (organization_id,person_id,affiliation_id)
 select p_org,v_id,x::uuid from jsonb_array_elements_text(coalesce(p_payload->'affiliation_ids','[]'::jsonb)) x;
 insert into public.audit_logs (organization_id,actor_id,action,entity_type,entity_id)
 values(p_org,auth.uid(),case when p_id is null then 'create' else 'update' end,'person',v_id);
 return v_id;
end $$;
revoke all on function public.save_person(uuid,jsonb,uuid) from public;
grant execute on function public.save_person(uuid,jsonb,uuid) to authenticated;
