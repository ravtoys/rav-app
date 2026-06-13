-- Legal consent fields for RAV Club.
-- Run this before deploying the app changes that read these columns.

alter table public.profiles
add column if not exists marketing_consent boolean default false,
add column if not exists marketing_consent_at timestamptz,
add column if not exists marketing_consent_text text,
add column if not exists kids_data_consent boolean default false,
add column if not exists kids_data_consent_at timestamptz,
add column if not exists kids_data_consent_text text;

alter table public.child_profiles
add column if not exists consent_at timestamptz,
add column if not exists consent_text text;

grant update (
  full_name,
  phone,
  avatar_url,
  city,
  country,
  marketing_consent,
  marketing_consent_at,
  marketing_consent_text,
  kids_data_consent,
  kids_data_consent_at,
  kids_data_consent_text
)
on public.profiles
to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $function$
begin
  insert into public.profiles (
    id,
    full_name,
    phone,
    city,
    country,
    points,
    level,
    marketing_consent,
    marketing_consent_at,
    marketing_consent_text
  )
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'city',
    coalesce(new.raw_user_meta_data->>'country', 'Colombia'),
    100,
    'Explorador',
    coalesce((new.raw_user_meta_data->>'marketing_consent')::boolean, false),
    (new.raw_user_meta_data->>'marketing_consent_at')::timestamptz,
    new.raw_user_meta_data->>'marketing_consent_text'
  );

  insert into public.transactions (user_id, description, amount, points_change)
  values (new.id, 'Bienvenida a RAV Club', 0, 100);

  return new;
end;
$function$;
