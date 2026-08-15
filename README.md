# TIL Academia

A **Today I Learned** journaling app with AI-powered note formatting. Write raw notes or use the rich text editor, and let GPT-4o-mini transform them into well-structured Markdown entries. Organize your learnings into topics and share them via public profiles.

## Features

- **Two entry modes**: Raw notes (AI-formatted via OpenAI) or manual rich text editing (TipTap)
- **AI formatting**: Paste messy notes, get clean Markdown back
- **Topics**: Group TILs into topics for browsing and filtering
- **Public profiles**: Each user gets a shareable profile at `/[userId]`
- **Shareable TILs**: Every entry has a public page at `/til/[id]`
- **Browse view**: Auto-generated index of recent entries and categories
- **Full-text search**: Search titles, topics, tags, and content
- **Date filtering**: Filter entries by predefined ranges or a custom date
- **Dark mode**: System-aware theme toggle
- **Google OAuth**: Sign in with your Google account
- **Dockerized**: Ready for containerized deployment

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + Typography plugin |
| Database | PostgreSQL 17 |
| ORM | Prisma v7 |
| Auth | NextAuth v5 (Google OAuth) |
| Editor | TipTap v3 (rich text) |
| AI | OpenAI GPT-4o-mini |
| Deployment | Docker (multi-stage build) |

## Getting Started

### Prerequisites

- Node.js >= 22
- PostgreSQL 17 (or Docker)
- A Google OAuth client ID and secret
- (Optional) An OpenAI API key

### Setup

1. Clone the repository:
   ```sh
   git clone https://github.com/Abhishek-1337/Til-Academia.git
   cd Til-Academia
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Copy the environment template and fill in your values:
   ```sh
   cp .env.example .env
   ```

   Required variables:

   | Variable | Description |
   |---|---|
   | `DATABASE_URL` | PostgreSQL connection string (e.g. `postgresql://user:pass@localhost:5432/til`) |
   | `AUTH_URL` | The base URL of your app (e.g. `http://localhost:3000`) |
   | `AUTH_SECRET` | A random string for NextAuth encryption (`openssl rand -base64 32`) |
   | `AUTH_GOOGLE_ID` | Your Google OAuth client ID |
   | `AUTH_GOOGLE_SECRET` | Your Google OAuth client secret |

4. Set up the database:
   ```sh
   npm run db:migrate
   ```

5. Start the development server:
   ```sh
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

### Docker (alternative)

```sh
docker compose up --build
```

The app will be available at `http://localhost:3000`.

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Build for production (standalone) |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:push` | Push schema to DB (no migration) |

## Usage

1. **Sign in** with Google using the button in the top-right corner.
2. Set your **OpenAI API key** via the settings input (stored in localStorage, never sent to the server).
3. Create a TIL by clicking **+ New**:
   - **AI Parse**: Paste unformatted notes, click **AI Format**, review, and save.
   - **Manual Entry**: Write directly in the rich text editor.
4. Add a **title** and **topic** to organize your entries.
5. Use the **sidebar** to search, filter by date, browse topics, or toggle dark mode.
6. Share your profile at `/[userId]` or an individual entry at `/til/[id]`.

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/tils` | Not required | List TILs (supports `topic` and `userId` query params) |
| POST | `/api/tils` | Required | Create a new TIL |
| GET | `/api/tils/[id]` | Not required | Get a single TIL |
| PUT | `/api/tils/[id]` | Required (owner) | Update a TIL |
| DELETE | `/api/tils/[id]` | Required (owner) | Delete a TIL |
| GET | `/api/topics` | Required | List the user's topics (supports `q` query param) |
| POST | `/api/topics` | Required | Create a topic |
| POST | `/api/format` | Not required | Send raw text to OpenAI for formatting (requires `apiKey` in body) |
| GET/POST | `/api/auth/[...nextauth]` | Varies | NextAuth authentication handlers |

## Project Structure

```
src/
├── app/
│   ├── [username]/             # Public user profile
│   ├── api/
│   │   ├── auth/[...nextauth]/ # NextAuth route handler
│   │   ├── format/             # OpenAI formatting proxy
│   │   ├── tils/               # TIL CRUD endpoints
│   │   └── topics/             # Topic list/create endpoints
│   ├── til/[id]/               # Individual TIL page
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Main app page
├── components/
│   ├── ApiKeyInput.tsx         # OpenAI API key input
│   ├── AuthButton.tsx          # Google sign-in/out button
│   ├── BrowseView.tsx          # Recent entries + category index
│   ├── ProfileContent.tsx      # Profile page content
│   ├── RichEditor.tsx          # TipTap editor
│   ├── SessionProvider.tsx     # NextAuth session wrapper
│   ├── Sidebar.tsx             # Search, filters, theme toggle
│   ├── TagInput.tsx            # Tag chip input
│   ├── TilCard.tsx             # TIL card display
│   ├── TilForm.tsx             # TIL create/edit form
│   ├── TilList.tsx             # Filtered TIL list
│   └── TopicCombobox.tsx       # Topic selection input
└── lib/
    ├── auth.ts                 # NextAuth config
    ├── markdown.ts             # Markdown rendering/sanitization
    ├── prisma.ts               # Prisma client singleton
    └── store.ts                # API client + localStorage helpers
```

## Database

PostgreSQL with Prisma ORM. Schema includes:

- **User** — Google-authenticated users
- **Account / Session / VerificationToken** — NextAuth tables
- **Til** — Journal entries with `title`, `raw`, `formatted`, `tags`, `topic`, and `createdAt`
- **Topic** — User-defined categories (unique per user)
