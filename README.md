# Seva

Manage your Local Organisation in one place: governance, members, events, and finances.

## Overview

Seva is a Next.js web app for local organisations (e.g. JCI chapters) to handle:

- **Governance** – Documents, bylaws, policies  
- **Membership** – Member directory and roles  
- **Events** – Event listing and details  
- **Finance** – Treasury, dues, financial summaries  
- **Board** – Position hierarchy, module-level permissions, and member assignment  
- **Settings** – General config, branding, modules, and data (export, handover)

Access is controlled by **roles** (admin, board, member) and by **board positions** with per-module access (None, View, Manage). The President (admin) is the super-admin for board setup and settings.

## Tech stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, Tailwind CSS 4, Radix UI, shadcn-style components, Lucide / Hugeicons
- **Forms / validation:** React Hook Form, Zod
- **Animation:** Motion (Framer Motion)

## Prerequisites

- Node.js 20+
- npm (or pnpm / yarn)

## Getting started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Other scripts

| Script        | Description              |
|---------------|--------------------------|
| `npm run dev` | Start dev server         |
| `npm run build` | Production build      |
| `npm run start` | Run production server |
| `npm run lint`  | Run ESLint            |

## Project structure

```
seva-fe/
├── app/                    # Next.js App Router
│   ├── (app)/               # Main app (protected)
│   │   ├── board/           # Board setup (hierarchy, permissions, assignments, preview)
│   │   ├── dashboard/       # Home
│   │   ├── events/          # Events list and detail
│   │   ├── finance/        # Finance
│   │   ├── governance/     # Governance docs
│   │   ├── members/        # Members
│   │   ├── settings/       # Settings (General, Modules, Branding, Data)
│   │   └── layout.tsx      # Protected layout + AppShell
│   ├── login/
│   ├── onboarding/
│   ├── layout.tsx          # Root layout, fonts, metadata
│   ├── providers.tsx       # Auth + ViewAs providers
│   └── globals.css
├── components/
│   ├── auth/               # ProtectedRoute
│   ├── board/              # Hierarchy builder, permissions matrix, assignments, access preview
│   ├── branding/           # Seva logo and mark
│   ├── layout/             # AppShell, page transition, site header
│   └── ui/                 # Buttons, cards, fields, inputs, select, switch, alert-dialog, etc.
├── context/
│   ├── AuthContext.tsx     # Current user, org, login, switch user
│   └── ViewAsContext.tsx   # "View as" position for access preview
├── data/mock/              # Mock data (users, orgs, board, members, events, etc.)
├── hooks/                  # e.g. useAppPaths
├── lib/
│   ├── app-modules.ts      # List of app modules (Governance, Membership, Finance, Projects)
│   ├── permissions.ts      # canAccess, canManage, getAccessLevel (role + optional position)
│   └── utils.ts            # cn, etc.
├── routes/
│   └── routenames.ts       # Route constants
└── types/
    └── index.ts            # User, Organization, BoardPosition, AppModule, etc.
```

## Features

### Authentication and organisations

- **Login** – Choose a user from mock users; no real auth yet.
- **Onboarding** – Create an organisation (name, slug, fiscal year, president theme, president name/email, currency).
- **Auth context** – Holds current user, current organisation, and list of organisations. Used across the app for permission checks and data scoping.

### Navigation and permissions

- **App shell** – Header (logo, “Viewing as” badge when preview is on, user menu), main content, bottom nav (Dashboard, Members, Events, Finance, More).
- **Permissions** – `lib/permissions.ts`: `canAccess(role, resource, position?)`, `canManage(...)`, `getAccessLevel(...)`. Resources: governance, membership, financial, projects. President (admin) always has full access; otherwise access can be driven by role or by the selected “view as” position.
- **View as** – From Board > Access preview, you can “View as” a board position; the shell and nav reflect that position’s access until you stop the preview.

### Board management (President only)

- **Hierarchy** – Tree of positions with “Add under” per node; expand/collapse; add top-level position.
- **Permissions matrix** – Rows = positions, columns = modules; each cell is None / View / Manage.
- **Member assignment** – Assign users or emails to positions.
- **Access preview** – “View as” a position to confirm what they can see.

### Settings

- **General** – Administrative year, President’s theme, fiscal year start/end dates.
- **Modules** – Enable/disable each app module (Governance, Membership, Finance, Projects) via switches.
- **Branding** – Chapter logo and letterhead upload with preview.
- **Data management** – “Export Year Archive” and “Initialize Handover Mode” (with confirmation dialog).

### UI and copy

- Shared form and button patterns (Field, Input, Button, Card, etc.).
- Human-friendly labels and descriptions; no em dashes in UI or code comments.
- Responsive layout; mobile-friendly nav.

## Key concepts

- **Organisation** – Top-level entity (e.g. a chapter). Has fiscal year, president info, currency. Data (members, events, board) is scoped by `organizationId`.
- **Board position** – Named role (e.g. President, Treasurer) with optional parent (`reportsToId`) and per-module access. Stored in mock board data; editable in Board setup.
- **App modules** – Governance, Membership, Finance, Projects. Defined in `lib/app-modules.ts`. Used in Board permissions matrix and in Settings > Modules toggles.

## Mock data

All data is in-memory under `data/mock/`. No backend or database. Use it to:

- Switch users and organisations from the header.
- Test Board setup, permissions, and “View as”.
- Try Settings and onboarding flows.

## Configuration

- **Routes** – `routes/routenames.ts`.
- **App modules** – `lib/app-modules.ts` (add/remove or relabel modules).
- **Theme** – Colours and radius in `app/globals.css` (CSS variables; primary brand colour `#002d5b`).

## Conventions

- **Copy** – Natural, human-centric labels and tooltips; no em dashes.
- **Access** – President = admin; board setup and settings restricted to admin; nav and pages respect role and optional “view as” position.
- **Flexibility** – Position names and module permission combinations are data-driven, not hardcoded.

## License

Private. All rights reserved.
