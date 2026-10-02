<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Bebbek AVM

Premium bebek & çocuk ürünleri **katalog** sitesi. Sepet/ödeme yok; akış: keşif → kategori → filtre → ürün → WhatsApp.
Stack: Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind v4 · Prisma 6 + MySQL · zod v4 · jose (admin oturumu).

## Çalıştırma

```sh
npm install                 # prisma generate otomatik çalışır
cp .env.example .env        # değerleri doldurun
npm run db:local            # (opsiyonel) proje içi MySQL, port 3307, veri .local/ altında
npx prisma migrate deploy   # şemayı uygula (geliştirmede: npm run db:migrate)
npm run db:seed             # demo katalog + ADMIN_EMAIL/ADMIN_PASSWORD ile admin kullanıcısı
npm run dev                 # http://localhost:3000 — admin: /admin
```

- Aynı projede yalnızca **bir** `next dev` çalışabilir; ikincisi reddedilir.
- `src/app/globals.css` içindeki `@import "tailwindcss" source("../")` Tailwind taramasını `src/` ile sınırlar. Kaldırılırsa Turbopack `.local/mysql.sock` soketini okumaya çalışıp çöker.

## Doğrulama

```sh
npm run typecheck && npm run lint && npm run build
```

Test paketi yok; değişiklikleri tarayıcıda kontrol edin (ana sayfa, `/kategori/bebek-arabalari?marka=...`, bir ürün sayfası, `/admin`).

## Yapı

- `src/app/(site)` — public sayfalar. `src/app/admin/(panel)` — korumalı admin (her action `requireAdmin()` + `revalidateSite()` çağırır).
- `src/lib/catalog` — sorgular, filtre/facet mantığı (`filters.ts`, `listing.ts`). Filtreler URL query'sindedir; filtreli URL'ler `noindex,follow` + temiz canonical.
- `src/lib/settings-defaults.ts` — tüm site ayar anahtarları ve varsayılanları; admin ayar formları `src/lib/admin/settings-groups.ts` üzerinden tanımlanır.
- `src/lib/home-sections.ts` — ana sayfa bölüm anahtarları; yeni bölüm eklerken `src/app/(site)/page.tsx` renderer'ına da ekleyin.
- Görseller: `src/lib/uploads.ts` (Cloudinary veya yerel `UPLOAD_DIR`, `/media/...` route'u ile sunulur). Kaydedilebilir görsel URL'leri yalnızca `/...` veya `https://res.cloudinary.com/...`.
- WhatsApp linkleri: `src/lib/whatsapp.ts` (numara admin › WhatsApp'tan gelir; boşsa butonlar gizlenir).

## Deploy

- Vercel: GitHub `bariscanyonel60/bebbekavmtokat` reposunun `main` dalına her push otomatik production deploy'dur. `vercel.json` build komutu `sh scripts/vercel-build.sh` (bölge `fra1`).
- `DATABASE_URL` tanımlıysa build `prisma migrate deploy && next build` çalıştırır (internetten erişilebilen MySQL gerekir).
- `DATABASE_URL` yoksa **demo modu**: `scripts/demo-db.mjs` şemanın SQLite kopyasını (`prisma/demo/`, gitignore'da) üretip seed verisini yükler; `src/lib/db.ts` bunu kullanır, `robots.txt` tüm siteyi engeller. Admin değişiklikleri sunucu örneğinin `/tmp` kopyasına yazılır, kalıcı değildir. Gerçek DB bağlanınca Vercel'e `DATABASE_URL` eklenip redeploy edilir; kod değişikliği gerekmez.
- Prisma kodu hem MySQL hem SQLite istemcisiyle derlenmeli: `skipDuplicates`, `mode: "insensitive"`, raw SQL gibi MySQL'e özgü özellikler kullanmayın.
- Production'da `AUTH_SECRET` güçlü ve benzersiz olmalı; `SITE_URL=https://bebbekavm.com`.
- Serverless (Vercel/Netlify) için Cloudinary değişkenleri zorunlu; yerel upload klasörü kalıcı değildir.

## Dokunma

- `.env`, `.local/` (yerel MySQL verisi), `.data/` (yüklenen görseller) — commit edilmez, silinmez.
- Production veritabanına `db:seed` çalıştırmayın (seed varsayılan olarak uzak DB'yi reddeder; `SEED_ALLOW_REMOTE` ile bilerek açılır).
- Yukarıdaki `nextjs-agent-rules` bloğu `next dev` tarafından yönetilir.
