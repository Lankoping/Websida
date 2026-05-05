# Köparprofiler (buyer_profiles)

Beskriver `buyer_profiles`-tabellen och hur man använder importfunktionerna.

Schema & migration
- Fil: `drizzle/migrations/0004_buyer_profiles.sql` — skapar tabellen `buyer_profiles` med fälten `id, name, email, phone, address, external_id, notes, created_at, updated_at`.
- Kör migrationer med:

```bash
npm run migrate
```

Server-API
- `getBuyerProfilesFn()` — GET, lista alla köparprofiler.
- `createBuyerProfileFn(data)` — POST, skapa ny profil.
- `updateBuyerProfileFn(data)` — POST, uppdatera befintlig profil (inkluderar `id`).
- `deleteBuyerProfileFn(id)` — POST, radera profil.
- `importTicketToBuyerProfileFn(ticketId)` — POST, importera enskild biljett till en profil (matchar på e-post om möjligt).
- `importEventToBuyerProfilesFn(eventId)` — POST, bulk-importera alla deltagare från ett event.

Accesskontroll
- Alla API-anrop kräver administratörs-/personal-behörighet via befintliga `requireStaffUser`-funktioner.

UI
- Admin-vy: `/admin/buyers` (lista + skapa/redigera/radera) — skapad.
- Importknapp finns på event-översikten i `/admin/tickets/events` med bekräftelse och laddningsindikator.

Produktionsnoteringar
- Importfunktionen försöker matcha befintliga profiler på e-post för att undvika dubbletter.
- Säkerhetskontroller och aktivitetsloggning finns på serversidan.

Nästa steg
- Skriva enhetstester för API och importflöde.
