-- OFFSCRIPT HQ: tenant isolation and initial CRM/event model.
create extension if not exists pgcrypto;

create type public.member_role as enum ('owner','manager','viewer');
create type public.age_group as enum ('under_21','21_plus','unknown');
create type public.event_state as enum ('planning','announced','on_sale','completed','canceled');

create table public.organizations (
 id uuid primary key default gen_random_uuid(),
 name text not null,
 created_at timestamptz not null default now()
);
create table public.organization_members (
 organization_id uuid not null references public.organizations(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 role public.member_role not null default 'viewer',
 active boolean not null default true,
 created_at timestamptz not null default now(),
 primary key (organization_id,user_id)
);
create index organization_members_user on public.organization_members(user_id);

-- SECURITY DEFINER helpers avoid recursive RLS in membership policies.
create function public.is_org_member(org uuid)
returns boolean language sql stable security definer set search_path=''
as $$ select exists(select 1 from public.organization_members m where m.organization_id=org and m.user_id=(select auth.uid()) and m.active) $$;
create function public.can_edit_org(org uuid)
returns boolean language sql stable security definer set search_path=''
as $$ select exists(select 1 from public.organization_members m where m.organization_id=org and m.user_id=(select auth.uid()) and m.active and m.role in ('owner','manager')) $$;
create function public.is_org_owner(org uuid)
returns boolean language sql stable security definer set search_path=''
as $$ select exists(select 1 from public.organization_members m where m.organization_id=org and m.user_id=(select auth.uid()) and m.active and m.role='owner') $$;
revoke all on function public.is_org_member(uuid),public.can_edit_org(uuid),public.is_org_owner(uuid) from public;
grant execute on function public.is_org_member(uuid),public.can_edit_org(uuid),public.is_org_owner(uuid) to authenticated;

create table public.role_types (
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null references public.organizations(id) on delete cascade,
 name text not null,
 unique(organization_id,name),
 unique(organization_id,id)
);
create table public.affiliations (
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null references public.organizations(id) on delete cascade,
 name text not null,
 category text not null default 'other',
 unique(organization_id,name),
 unique(organization_id,id)
);
create table public.people (
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null references public.organizations(id) on delete cascade,
 first_name text not null check (length(trim(first_name))>0),
 last_name text not null check (length(trim(last_name))>0),
 preferred_name text,
 email text,
 phone text,
 instagram text,
 city text,
 age_classification public.age_group not null default 'unknown',
 contact_status text not null default 'new' check (contact_status in ('new','contacted','interested','active','inactive','do_not_contact')),
 notes text,
 archived_at timestamptz,
 created_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(organization_id,id)
);
create index people_org_name on public.people(organization_id,last_name,first_name);
create index people_org_email on public.people(organization_id,lower(email));
create index people_org_phone on public.people(organization_id,phone);
create table public.person_roles (
 organization_id uuid not null references public.organizations(id) on delete cascade,
 person_id uuid not null,
 role_id uuid not null,
 primary key(person_id,role_id),
 foreign key (organization_id,person_id) references public.people(organization_id,id) on delete cascade,
 foreign key (organization_id,role_id) references public.role_types(organization_id,id) on delete cascade
);
create table public.person_affiliations (
 organization_id uuid not null references public.organizations(id) on delete cascade,
 person_id uuid not null,
 affiliation_id uuid not null,
 status text not null default 'active',
 primary key(person_id,affiliation_id),
 foreign key (organization_id,person_id) references public.people(organization_id,id) on delete cascade,
 foreign key (organization_id,affiliation_id) references public.affiliations(organization_id,id) on delete cascade
);
create table public.contact_notes (
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null,
 person_id uuid not null,
 author_id uuid references auth.users(id) on delete set null,
 body text not null check(length(trim(body))>0),
 created_at timestamptz not null default now(),
 foreign key (organization_id,person_id) references public.people(organization_id,id) on delete cascade
);
create table public.venues (
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null references public.organizations(id) on delete cascade,
 name text not null,
 address text, city text, capacity integer check(capacity>=0), notes text,
 created_at timestamptz not null default now(),
 unique(organization_id,id)
);
create table public.events (
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null references public.organizations(id) on delete cascade,
 name text not null, description text,
 starts_at timestamptz not null, time_zone text not null default 'America/Phoenix',
 venue_id uuid,
 status public.event_state not null default 'planning',
 posh_event_url text, posh_event_identifier text,
 capacity integer check(capacity>=0),
 target_ticket_sales integer check(target_ticket_sales>=0),
 budget_cents bigint check(budget_cents>=0),
 notes text,
 created_at timestamptz not null default now(),
 unique(organization_id,id),
 foreign key (organization_id,venue_id) references public.venues(organization_id,id)
);
create index events_org_start on public.events(organization_id,starts_at);
create table public.event_assignments (
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null references public.organizations(id) on delete cascade,
 event_id uuid not null,
 person_id uuid not null,
 role_name text not null,
 status text not null default 'pending',
 starts_at timestamptz, ends_at timestamptz,
 compensation_cents bigint check (compensation_cents>=0),
 notes text,
 created_at timestamptz not null default now(),
 unique(organization_id,event_id,person_id,role_name),
 foreign key (organization_id,event_id) references public.events(organization_id,id) on delete cascade,
 foreign key (organization_id,person_id) references public.people(organization_id,id)
);
create table public.audit_logs (
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null references public.organizations(id) on delete cascade,
 actor_id uuid references auth.users(id) on delete set null,
 action text not null, entity_type text not null, entity_id uuid,
 metadata jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);

create function public.touch_people() returns trigger language plpgsql set search_path=''
as $$ begin new.updated_at=now(); return new; end $$;
create trigger people_updated before update on public.people
for each row execute function public.touch_people();

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.role_types enable row level security;
alter table public.affiliations enable row level security;
alter table public.people enable row level security;
alter table public.person_roles enable row level security;
alter table public.person_affiliations enable row level security;
alter table public.contact_notes enable row level security;
alter table public.venues enable row level security;
alter table public.events enable row level security;
alter table public.event_assignments enable row level security;
alter table public.audit_logs enable row level security;

create policy org_read on public.organizations for select to authenticated using(public.is_org_member(id));
create policy member_read on public.organization_members for select to authenticated using(public.is_org_member(organization_id));
create policy member_owner_insert on public.organization_members for insert to authenticated with check(public.is_org_owner(organization_id));
create policy member_owner_update on public.organization_members for update to authenticated using(public.is_org_owner(organization_id)) with check(public.is_org_owner(organization_id));
create policy member_owner_delete on public.organization_members for delete to authenticated using(public.is_org_owner(organization_id));

do $$
declare t text;
begin
 foreach t in array array['role_types','affiliations','people','person_roles','person_affiliations','contact_notes','venues','events','event_assignments'] loop
  execute format('create policy %I on public.%I for select to authenticated using(public.is_org_member(organization_id))',t||'_read',t);
  execute format('create policy %I on public.%I for insert to authenticated with check(public.can_edit_org(organization_id))',t||'_insert',t);
  execute format('create policy %I on public.%I for update to authenticated using(public.can_edit_org(organization_id)) with check(public.can_edit_org(organization_id))',t||'_update',t);
  execute format('create policy %I on public.%I for delete to authenticated using(public.can_edit_org(organization_id))',t||'_delete',t);
 end loop;
end $$;
create policy audit_read on public.audit_logs for select to authenticated using(public.is_org_member(organization_id));
create policy audit_insert on public.audit_logs for insert to authenticated with check(public.can_edit_org(organization_id) and actor_id=(select auth.uid()));

-- Bootstrap requires a trusted admin to create an organization and initial owner via the SQL editor.
-- Never expose service-role credentials to a browser or an unauthenticated bootstrap endpoint.
