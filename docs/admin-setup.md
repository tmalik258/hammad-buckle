# Admin setup

## Promote your first admin account

Admin access is controlled by the `role` column on the `users` table (`CUSTOMER` or `ADMIN`). After you create a normal account through signup or login, promote it once in the database:

```sql
UPDATE users
SET role = 'ADMIN'
WHERE email = 'your@email.com';
```

Then sync Supabase Auth metadata (required for storage RLS admin checks):

```sql
UPDATE auth.users au
SET raw_user_meta_data =
  COALESCE(au.raw_user_meta_data, '{}'::jsonb) || '{"role":"ADMIN"}'::jsonb
FROM public.users u
WHERE au.id::text = u.id
  AND u.email = 'your@email.com';
```

Sign out and sign back in. You should be redirected to `/admin` and see the **Admin** link in your account menu.

## How access control works

Two layers work together:

| Layer | What it protects |
|-------|------------------|
| **Next.js API / pages** | `/admin/*`, `/api/admin/*`, product/category writes, user management — checked against Prisma `users.role` |
| **Supabase Storage RLS** | Direct browser uploads to the `images` bucket — checked against JWT `user_metadata.role` |

**Source of truth for the app:** Prisma `users.role`.

**Source of truth for storage uploads:** Supabase `auth.users.raw_user_meta_data.role` (must be `ADMIN` for admin folders).

## Managing users and roles

Go to **Admin → Users** (`/admin/customers`):

- Filter by role (Customer / Admin)
- Use the inline role dropdown to promote or demote users
- Edit a user for full account details (name, email, password, active status)

Promoting a user in the admin UI also syncs `user_metadata.role` in Supabase automatically.

Safety rules:

- You cannot demote your own admin account from the UI
- The last active admin cannot be demoted or deleted

## Supabase Storage RLS (required)

If you previously added a broad policy like “any authenticated user can upload to `images`”, **remove it** and use folder-based rules instead.

Run this in **Supabase → SQL Editor**:

```sql
-- Helper: read admin role from JWT metadata
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    upper(auth.jwt() -> 'user_metadata' ->> 'role') = 'ADMIN',
    false
  );
$$;

-- Remove overly permissive policies (adjust names if yours differ)
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;

-- Public read (storefront, product images, etc.)
DROP POLICY IF EXISTS "Public can read images" ON storage.objects;
CREATE POLICY "Public can read images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');

-- Admins: catalog + storefront folders
DROP POLICY IF EXISTS "Admin upload catalog images" ON storage.objects;
CREATE POLICY "Admin upload catalog images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'images'
  AND (storage.foldername(name))[1] IN ('products', 'categories', 'storefront')
  AND public.is_admin()
);

DROP POLICY IF EXISTS "Admin update catalog images" ON storage.objects;
CREATE POLICY "Admin update catalog images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'images'
  AND (storage.foldername(name))[1] IN ('products', 'categories', 'storefront')
  AND public.is_admin()
);

DROP POLICY IF EXISTS "Admin delete catalog images" ON storage.objects;
CREATE POLICY "Admin delete catalog images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'images'
  AND (storage.foldername(name))[1] IN ('products', 'categories', 'storefront')
  AND public.is_admin()
);
```

If you previously applied the profile upload policy, run this cleanup in Supabase:

```sql
DROP POLICY IF EXISTS "Authenticated upload profiles" ON storage.objects;
```

### Upload folders in this app

| Folder | Who can upload |
|--------|----------------|
| `products/` | Admin only |
| `categories/` | Admin only |
| `storefront/` | Admin only |

## Postgres table RLS — usually not needed

This app writes to Postgres through **Prisma + `DATABASE_URL`**, which typically bypasses Postgres RLS. Securing product/category/user APIs is done in **Next.js** (`assertAdminApi`), not with table RLS.

Only add Postgres RLS if you also query tables directly from the browser with the Supabase client (this project does not).

## Prisma migrations

No new migration is required for admin roles. The `role` column already exists. Run only if your database is behind:

```bash
pnpm prisma migrate deploy
```
