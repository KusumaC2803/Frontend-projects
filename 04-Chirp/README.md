# Chirp — Real-Time Twitter/X Clone

A portfolio-ready social feed UI upgraded from the original static Twitter-style markup.

## Current version

The project runs immediately in **demo mode** with no backend setup:
- Create posts
- Like/unlike posts
- Repost/unrepost posts
- Comment/reply
- Image preview before posting
- Local persistence with `localStorage`
- Responsive three-column layout
- Skeleton loading placeholders
- Login/signup demo pages

## Production upgrade path

The project includes a Supabase-ready foundation:
- `js/supabase.js` for Supabase client configuration
- `supabase/schema.sql` for PostgreSQL tables
- CDN-loaded Supabase JavaScript client
- Structure for Authentication, Storage and Realtime

### Connect Supabase

1. Create a Supabase project.
2. Open `supabase/schema.sql` in the Supabase SQL Editor and run it.
3. Create a Storage bucket named `post-media`.
4. Configure Authentication providers:
   - Email/password
   - Google OAuth
5. Put your project URL and anon/publishable key in `js/supabase.js`.
6. Replace the demo localStorage data layer with Supabase queries/realtime subscriptions.

> Never put a Supabase service-role key in frontend code. Only use the public anon/publishable key.

## Run locally

Because this is a browser project, use a local static server instead of opening `index.html` directly.

### Option 1 — VS Code Live Server
Open the folder in VS Code and use Live Server.

### Option 2 — Python
```bash
python -m http.server 5500
```
Then open:
`http://localhost:5500`

### Option 3 — Node
```bash
npx serve .
```

## Project structure

```text
twitter-clone/
├── index.html
├── login.html
├── signup.html
├── index-original.html
├── css/
│   ├── global.css
│   ├── app.css
│   ├── auth.css
│   └── blocks/
├── js/
│   ├── app.js
│   ├── auth.js
│   └── supabase.js
├── images/
├── svg/
├── supabase/
│   └── schema.sql
├── .gitignore
├── package.json
└── README.md
```

## Portfolio description

**Chirp — Real-Time Social Media Platform**

Built a responsive Twitter/X-style social media application with interactive feed functionality, media previews, comments, likes, reposts, loading states, authentication screens, and a Supabase/PostgreSQL-ready architecture.

**Tech:** HTML, CSS, JavaScript, Supabase, PostgreSQL, Authentication, Storage, Realtime

## Next recommended implementation

For the production version, wire `app.js` to Supabase for:
1. Auth session management
2. Profiles
3. Posts CRUD
4. Image Storage
5. Likes/reposts
6. Nested comments
7. Realtime subscriptions
8. Row Level Security policies
