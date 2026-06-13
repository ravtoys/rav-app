-- Adds clean marketing location fields to adult customer profiles.
-- Keeps the 100-star welcome bonus trigger intact.

alter table public.profiles
add column if not exists city text,
add column if not exists country text;

grant update (full_name, phone, avatar_url, city, country)
on public.profiles
to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $function$
begin
  insert into public.profiles (id, full_name, phone, city, country, points, level)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'city',
    coalesce(new.raw_user_meta_data->>'country', 'Colombia'),
    100,
    'Explorador'
  );

  insert into public.transactions (user_id, description, amount, points_change)
  values (new.id, 'Bienvenida a RAV Club', 0, 100);

  return new;
end;
$function$;
