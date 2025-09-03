# PRD — BOM Manager “CircuitHub (temp)”

*(GitHub pour projets électroniques perso → prêt à devenir multi-utilisateurs)*

## 1) Vision & Objectifs

* **Problème** : Les BOM partagées en Excel sont peu lisibles, sans visuel, et compliquent l’estimation des coûts & la commande.
* **Vision** : Une web-app sobre (style GitHub) où chaque **projet** regroupe sa **BOM** reliée à des **librairies de composants**, avec **images**, **datasheets**, **prix**, **liens fournisseurs**, **versionning léger** et **import CSV**.
* **Objectifs V1** :

  1. Import CSV fiable, 2) Page Projet claire (table BOM + previews + coût total),
  2. Bibliothèques réutilisables, 4) Auth simple mais prête à scaler, 5) Dark mode,
  3. Fichier **CIRCUITME.md** par projet (markdown), 7) Versionning par diffs.

## 2) Utilisateurs & Cas d’usage

* **Utilisateur initial** : toi (usage perso).
* **À terme** : makers, électroniciens, équipes open-hardware.
* **Cas d’usage clés** :

  * Créer un **projet** (+ fichiers .gerber/.pcb en pièces jointes).
  * **Importer** une BOM depuis CSV, mapper les colonnes, dédupliquer les composants.
  * **Parcourir** et **rechercher** dans les **librairies** (références, footprints, specs).
  * **Prévisualiser** images & datasheets, **calculer** coûts (Σ qty×prix).
  * **Versionner** la BOM (commits de diffs, labels “v1, v2…”).
  * **Exporter** la BOM (CSV/JSON).
  * Lire/éditer **CIRCUITME.md** du projet (markdown preview).

## 3) Portée Fonctionnelle (MVP)

* **Auth** : login email+mot de passe (sécurisé), sessions serveur. Prêt pour OAuth plus tard.
* **Home** : grille/liste de projets. Clic → ouvre la **Page Projet** dans nouvel onglet.
* **Page Projet** :

  * En-tête : nom, description courte, tags, actions (Importer CSV, Exporter, Nouvelle version).
  * **Table BOM** : colonne image (miniature), ref, MPN, footprint, qty, prix unitaire, fournisseur (lien), coût total ligne, liens datasheet/image.
  * **Sommaire coûts** (carte) : coût total, nb de lignes, nb de fournisseurs.
  * **Fichiers** : .gerber/.pcb/.pdf listés avec taille & date (download).
  * **CIRCUITME.md** : éditeur markdown + preview.
  * **Historique** : liste des “commits BOM” (diffs).
* **Librairies** :

  * Collections de composants réutilisables.
  * Fiche composant : image, MPN, ref interne, footprint, attributs libres, prix unitaire, fournisseurs, stock (champ présent mais facultatif).
* **Import CSV** :

  * Wizard en 3 étapes : upload → mappage de colonnes → déduplication/validation.
  * Sauvegarde en **draft** → confirmation = commit.
* **Export** : CSV + JSON (structure décrite plus bas).
* **Dark Mode** : auto (pref système) + toggle manuel.
* **Versionning BOM** : stockage en diffs (ajout/suppression/maj champs) + snapshot périodique.

## 4) Hors-périmètre (post-MVP)

* APIs fournisseurs (Mouser/DigiKey/LCSC).
* Multi-tenant public, partages & permissions fines.
* Graphiques avancés (par fournisseur, par catégorie).
* Webhooks & intégrations (GitHub, Octopart).
* OCR/parseur PDF de BOM.

## 5) UX / UI (principes)

* **Sobre, dense mais lisible**. Grille cards façon GitHub/Projects.
* Table BOM type “spreadsheet” (sticky header, inline edits basiques).
* Icônes/miniatures pour visuels.
* **Accessibilité** : contrastes AA, focus visibles, shortcuts (/\*\* pour rechercher).
* **Dark mode** par défaut si possible (électronique → docs nocturnes 😄).

## 6) Architecture Technique (TypeScript/.tsx)

### 6.1 Stack

* **Frontend / Server** : **Next.js (App Router) + React (.tsx)**
* **DB** : **PostgreSQL** (relations propres) + colonnes **JSONB** pour attributs flexibles.
* **ORM** : **Prisma**
* **Auth** : **Auth.js** (ex-NextAuth), **Argon2id** pour hash mots de passe.
* **API** : **tRPC** (end-to-end types) + **REST** minimal (export, webhooks) + génération **OpenAPI** via tRPC-OpenAPI (préparé pour intégrations).
* **Uploads** : adaptateur fichiers (local dev) + interface “StorageDriver” → **S3 compatible** plus tard (MinIO, R2…).
* **State client** : React Query (fetch/caching), Zod pour validation.
* **UI kit** : shadcn/ui + Tailwind, lucide-react icônes, react-markdown pour CIRCUITME.md.

### 6.2 Modules (Design modulaire)

```
/apps/web (Next.js)
/packages/
  /ui           (composants UI réutilisables: Table, Card, Uploader, MarkdownEditor)
  /api          (routeurs tRPC, schémas zod, types partagés)
  /db           (prisma schema, migrations, seed)
  /core         (domain logic: CSV import, diff engine, pricing)
  /storage      (StorageDriver: local | s3)
  /auth         (auth server, policies, RBAC futur)
```

Monorepo **Turborepo** conseillé (builds rapides, partage de types).

### 6.3 Schéma de données (PostgreSQL + Prisma)

Principales tables (simplifiées) :

**users**

* id (uuid), email (unique), hash, name, createdAt

**projects**

* id (uuid), ownerId → users.id
* name, description, tags (string\[])
* readmePath (CIRCUITME.md), createdAt, updatedAt

**project\_files**

* id, projectId, path, filename, mime, size, createdAt

**libraries**

* id, ownerId, name, description?

**components**

* id (uuid)
* libraryId → libraries.id
* refInternal (text), mpn (text), footprint (text)
* attributes (jsonb) ← libre: {voltage, tolerance, package, …}
* imageUrl (text?), datasheetUrl (text?)
* unitPrice (numeric(12,4)), currency (text, default 'EUR')
* suppliers (jsonb\[]) ← \[{name,url,sku}]
* stock (int?)  // présent mais optionnel
* createdAt, updatedAt
* unique(libId, mpn) partielle si souhaité

**project\_bom\_items**

* id
* projectId → projects.id
* componentId → components.id (nullable si ligne “ad-hoc”)
* lineLabel (text?) // ref textuelle si pas de composant lié
* quantity (int)
* unitPriceOverride (numeric?) // si override
* notes (text?)
* attributesOverride (jsonb?)
* suppliersOverride (jsonb?)
* createdAt, updatedAt

**bom\_commits**

* id, projectId, authorId, message
* diff (jsonb) // {added:\[…], removed:\[…], changed:\[{id, before, after}]}
* createdAt

**snapshots**

* id, projectId, bomJson (jsonb), createdAt  // pour restore & perf

Indexes utiles :

* components(mpn), components(footprint), components USING GIN (attributes).
* project\_bom\_items(projectId).
* full-text (tsvector) sur components(refInternal, mpn, footprint).

### 6.4 Formats d’échange

**CSV attendu (flexible, mappé par wizard)** :

```
Ref,MPN,Footprint,Qty,UnitPrice,Currency,SupplierName,SupplierURL,ImageURL,DatasheetURL,Notes
```

Le wizard permet de mapper n’importe quelles colonnes (ex. “Qty” → quantity).

**JSON export (par projet)** :

```json
{
  "project": {"id":"...", "name":"...", "tags":["..."]},
  "bom": [
    {
      "ref":"R1",
      "mpn":"RC0603FR-0710KL",
      "footprint":"0603",
      "quantity":10,
      "unitPrice":0.012,
      "currency":"EUR",
      "suppliers":[{"name":"LCSC","url":"..."}],
      "imageUrl":"...",
      "datasheetUrl":"...",
      "attributes":{"tolerance":"1%","power":"0.1W"}
    }
  ],
  "total": {"currency":"EUR","value":0.12}
}
```

### 6.5 Workflows clés

**Import CSV → BOM commit**

1. Upload CSV → preview 50 lignes.
2. Mapping colonnes (auto-guess + correction manuelle).
3. Déduplication : tentative de match **MPN** contre `components`; sinon création “ad-hoc”.
4. Validation (qty>0, prix≥0, URLs valides).
5. Résumé (Δ vs BOM actuelle) → **commit** avec message (“import CSV 2025-08-31”).
6. Option : créer ou rattacher à une **library**.

**Versionning (diff-first)**

* Chaque changement produit un **bom\_commit.diff**.
* Snapshots BOM réguliers (p.ex. toutes les 50 modifications) pour restore rapide.
* Affichage diff : +ajout / −suppression / \~modifs (qty, prix, supplier, attrs).

**Calcul prix total**

* Ligne = `quantity × (unitPriceOverride || component.unitPrice)`.
* Projet = Σ lignes (arrondi 4 décimales). **Pas de taux FX** en V1.

**Fichiers & CIRCUITME.md**

* Upload (glisser-déposer). Stockage local `storage/projects/<id>/...` en dev.
* **StorageDriver** (interface) → S3 (MinIO/R2) en prod.
* CIRCUITME.md rendu via react-markdown (safe), éditeur markdown simple.

### 6.6 Sécurité & conformité

* **Auth** sessions httpOnly, CSRF safe, rate-limit login, **Argon2id**.
* Validation **Zod** sur toutes les entrées (API & client).
* **RBAC prêt** (roles: owner, collaborator, viewer) — activable plus tard.
* Uploads : whitelist MIME, taille max (ex. 25 MB), scan basique (extension).
* Logs d’audit (auth, import, export, delete).
* Backups DB (pg\_dump quotidien) + retention locale (dev) / objet (prod).

### 6.7 Perf & qualité

* Pagination serveur (BOM > 1k lignes).
* Indexes (voir plus haut).
* Caching React Query + revalidation.
* Tests : unit (core), intégration (API), e2e (Playwright).
* CI : lint (ESLint), type-check, tests, Prisma migrate validate.

## 7) API (tRPC routers principaux)

* `auth`: signUp, signIn, signOut, getSession
* `projects`: list, create, getById, update, delete
* `projects.files`: upload, list, remove
* `projects.readme`: get, update
* `projects.bom`: get, exportCSV, exportJSON
* `projects.bom.import`: parseCSV, mapColumns, validate, commit
* `projects.bom.commit`: list, getDiff, revert (post-MVP)
* `libraries`: list, create, getById, update, delete
* `components`: upsert, search, getById, delete

*(Expose REST read-only pour `GET /projects/:id/bom.csv` & `.json` via tRPC-OpenAPI.)*

## 8) Spécifications UI (résumé)

* **Home** : grille de projets (card: nom, tags, derniers commits, coût total).
* **Projet** :

  * Tabs : *BOM* | *Files* | *CIRCUITME.md* | *History*.
  * Boutons rapides : Import CSV, Export, New Version.
  * Table BOM : tri (ref, MPN, prix, qty), filtre (fournisseur, footprint).
  * Carte **Coût total** + breakdown (par fournisseur) **post-MVP**.
* **Libraries** : liste, recherche plein-texte (MPN, footprint).
* **Dark mode** : via class `dark`, toggle stocké (localStorage) + media query.

## 9) Non-fonctionnel

* **Disponibilité** : perso/dev ; prêt à passer en prod mono-région.
* **Scalabilité** : stateless front, DB verticale; storage objet externe.
* **Observabilité** : logs structurés (pino), métriques basiques (req/s).

## 10) Roadmap

**MVP (Semaine 1→4)**

1. Bootstrap monorepo, Prisma schema, Auth, StorageDriver (local), UI de base.
2. Modules Projects/Libraries/Components, import CSV (parse + map + validation).
3. Page Projet complète : table BOM, coût total, files, CIRCUITME.md, dark mode.
4. Versionning diffs + snapshots, Export CSV/JSON, tests essentiels.

**Post-MVP (Semaine 5→8)**

* Recherche avancée (full-text), tags, filtres.
* Rôles (collaborators/viewers), partage lien.
* Stock visible (sans automations).
* Export PDF de la BOM (print-friendly).

**v1 publique**

* Storage S3, déploiement Postgres géré, OAuth (GitHub/Google), quotas, backups gérés.

## 11) Exemples concrets

**Exemple JSON composant**

```json
{
  "id": "cmp_5f3a…",
  "libraryId": "lib_main",
  "refInternal": "R_10k_0603",
  "mpn": "RC0603FR-0710KL",
  "footprint": "0603",
  "attributes": {"tolerance":"1%","power":"0.1W","voltage":"50V"},
  "imageUrl": "https://…/r_0603.png",
  "datasheetUrl": "https://…/rc_series.pdf",
  "unitPrice": 0.012,
  "currency": "EUR",
  "suppliers": [{"name":"LCSC","url":"https://…/C25804","sku":"C25804"}],
  "stock": 150
}
```

**Exemple diff de commit BOM**

```json
{
  "added":[{"ref":"C3","mpn":"CL10A106KP8NNNC","qty":2,"unitPrice":0.03}],
  "removed":[{"ref":"R7"}],
  "changed":[{"ref":"U1","before":{"qty":1},"after":{"qty":2}}]
}
```

---

# Architecture de code (squelette .tsx)

```
apps/
  web/
    app/
      (marketing)/          // futur
      dashboard/
        page.tsx
      projects/
        page.tsx
        [id]/
          page.tsx          // tabs BOM/Files/CIRCUITME/History
      api/                  // route handlers (trpc + rest export)
    components/
      ui/                   // shadcn compos reuse
      bom/
        BomTable.tsx
        ImportWizard.tsx
        DiffView.tsx
      files/
        FileList.tsx
        Uploader.tsx
      markdown/
        Editor.tsx
        Viewer.tsx
    styles/globals.css
    lib/
      trpc.ts
      theme.ts
packages/
  api/
    src/router/
      index.ts
      auth.ts
      projects.ts
      bom.ts
      libraries.ts
      components.ts
  core/
    csv/parse.ts
    csv/map.ts
    bom/diff.ts
    pricing/total.ts
  db/
    schema.prisma
    client.ts
  storage/
    index.ts        // interface
    local.ts
    s3.ts           // futur
  auth/
    server.ts       // Auth.js config (Argon2id)
  ui/
    src/…           // design system tailwind/shadcn
```

---

## Décisions finales validées (d’après tes réponses)

* **Auth dès le départ**, prête pour le scale.
* **Stock** présent mais secondaire (pas d’API fournisseur pour l’instant).
* **Versionning** par diffs + snapshots (type “commits”).
* **Import CSV** inclus **dès le MVP** (et export CSV/JSON aussi).
* **Home** → liste de projets; **Page Projet** en nouvel onglet.
* **Dark mode** obligatoire.
* **CIRCUITME.md** par projet (markdown).
* **DB** : **PostgreSQL + Prisma + JSONB**, API **tRPC** (OpenAPI possible).
* **Stockage fichiers** pluggable : Local dev → S3 plus tard.

---
