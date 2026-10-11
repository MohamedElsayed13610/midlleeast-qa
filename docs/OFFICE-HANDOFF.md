# Office deployment handoff

This project is prepared so it can be deployed from an office-owned Vercel account without changing application code.

## Required Vercel environment variables

- `NEXT_PUBLIC_SITE_URL` — final HTTPS origin, for example `https://your-domain.com`
- `LAWFIRM_CMS_ENABLED=true`
- `SUPABASE_URL` — the office CMS/consultation Supabase project URL
- `SUPABASE_PUBLISHABLE_KEY` — publishable key only; never a service-role key
- `ADMIN_ALLOWED_ORIGINS` — comma-separated trusted origins. Include the final domain and any intentionally retained admin/preview origin.
- `CONSULTATION_HASH_SALT` — recommended random 32+ character value
- `GOOGLE_SITE_VERIFICATION` — optional

## Production checklist

1. Create/import the project under the office-owned Vercel account.
2. Add the environment variables above for Production. Add the CMS variables to Preview too if preview testing should use live CMS content.
3. Deploy and verify `/`, `/en`, `/consultation`, `/team`, and representative Arabic/English service pages.
4. Connect the final domain in Vercel.
5. Set `NEXT_PUBLIC_SITE_URL` to the final domain and add the same domain to `ADMIN_ALLOWED_ORIGINS`, then redeploy.
6. Update DNS at the domain provider using the exact records shown by Vercel.
7. Verify HTTPS, sitemap, robots, Arabic/English language switching, contact links, and consultation submission.

No account passwords, private tokens or service-role secrets should be committed to Git.
