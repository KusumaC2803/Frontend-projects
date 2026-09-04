-- ============================================================
-- CHIRP DATABASE SCHEMA
-- ============================================================

-- ============================================================
-- PROFILES
-- ============================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,

  name text not null default 'User',

  handle text not null unique,

  avatar_url text,

  bio text default '',

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()
);


-- ============================================================
-- POSTS
-- ============================================================

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references public.profiles(id)
    on delete cascade,

  content text not null default '',

  image_url text,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now(),

  constraint posts_content_length
    check (char_length(content) <= 280),

  constraint posts_not_empty
    check (
      char_length(trim(content)) > 0
      or image_url is not null
    )
);


-- ============================================================
-- COMMENTS
-- ============================================================

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),

  post_id uuid not null
    references public.posts(id)
    on delete cascade,

  user_id uuid not null
    references public.profiles(id)
    on delete cascade,

  parent_id uuid
    references public.comments(id)
    on delete cascade,

  content text not null,

  created_at timestamptz not null default now(),

  constraint comments_content_length
    check (
      char_length(content) <= 280
    ),

  constraint comments_content_not_empty
    check (
      char_length(trim(content)) > 0
    )
);


-- ============================================================
-- LIKES
-- ============================================================

create table if not exists public.likes (

  post_id uuid not null
    references public.posts(id)
    on delete cascade,

  user_id uuid not null
    references public.profiles(id)
    on delete cascade,

  created_at timestamptz not null default now(),

  primary key (post_id, user_id)
);


-- ============================================================
-- REPOSTS
-- ============================================================

create table if not exists public.reposts (

  post_id uuid not null
    references public.posts(id)
    on delete cascade,

  user_id uuid not null
    references public.profiles(id)
    on delete cascade,

  created_at timestamptz not null default now(),

  primary key (post_id, user_id)
);


-- ============================================================
-- FOLLOWS
-- ============================================================

create table if not exists public.follows (

  follower_id uuid not null
    references public.profiles(id)
    on delete cascade,

  following_id uuid not null
    references public.profiles(id)
    on delete cascade,

  created_at timestamptz not null default now(),

  primary key (
    follower_id,
    following_id
  ),

  constraint no_self_follow
    check (
      follower_id <> following_id
    )
);


-- ============================================================
-- NOTIFICATIONS
-- ============================================================

create table if not exists public.notifications (

  id uuid primary key default gen_random_uuid(),

  recipient_id uuid not null
    references public.profiles(id)
    on delete cascade,

  actor_id uuid not null
    references public.profiles(id)
    on delete cascade,

  type text not null,

  post_id uuid
    references public.posts(id)
    on delete cascade,

  comment_id uuid
    references public.comments(id)
    on delete cascade,

  read boolean not null default false,

  created_at timestamptz not null default now()
);


-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists posts_created_at_idx
on public.posts(created_at desc);


create index if not exists posts_user_id_idx
on public.posts(user_id);


create index if not exists comments_post_id_idx
on public.comments(post_id);


create index if not exists comments_created_at_idx
on public.comments(created_at);


create index if not exists likes_post_id_idx
on public.likes(post_id);


create index if not exists likes_user_id_idx
on public.likes(user_id);


create index if not exists reposts_post_id_idx
on public.reposts(post_id);


create index if not exists reposts_user_id_idx
on public.reposts(user_id);


create index if not exists follows_follower_id_idx
on public.follows(follower_id);


create index if not exists follows_following_id_idx
on public.follows(following_id);


create index if not exists notifications_recipient_id_idx
on public.notifications(recipient_id);


-- ============================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles
enable row level security;

alter table public.posts
enable row level security;

alter table public.comments
enable row level security;

alter table public.likes
enable row level security;

alter table public.reposts
enable row level security;

alter table public.follows
enable row level security;

alter table public.notifications
enable row level security;


-- ============================================================
-- PROFILES POLICIES
-- ============================================================

drop policy if exists "Profiles are publicly readable"
on public.profiles;

create policy "Profiles are publicly readable"
on public.profiles
for select
to authenticated
using (true);


drop policy if exists "Users can create their own profile"
on public.profiles;

create policy "Users can create their own profile"
on public.profiles
for insert
to authenticated
with check (
  auth.uid() = id
);


drop policy if exists "Users can update their own profile"
on public.profiles;

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (
  auth.uid() = id
)
with check (
  auth.uid() = id
);


-- ============================================================
-- POSTS POLICIES
-- ============================================================

drop policy if exists "Authenticated users can read posts"
on public.posts;

create policy "Authenticated users can read posts"
on public.posts
for select
to authenticated
using (true);


drop policy if exists "Users can create their own posts"
on public.posts;

create policy "Users can create their own posts"
on public.posts
for insert
to authenticated
with check (
  auth.uid() = user_id
);


drop policy if exists "Users can update their own posts"
on public.posts;

create policy "Users can update their own posts"
on public.posts
for update
to authenticated
using (
  auth.uid() = user_id
)
with check (
  auth.uid() = user_id
);


drop policy if exists "Users can delete their own posts"
on public.posts;

create policy "Users can delete their own posts"
on public.posts
for delete
to authenticated
using (
  auth.uid() = user_id
);


-- ============================================================
-- COMMENTS POLICIES
-- ============================================================

drop policy if exists "Authenticated users can read comments"
on public.comments;

create policy "Authenticated users can read comments"
on public.comments
for select
to authenticated
using (true);


drop policy if exists "Users can create comments"
on public.comments;

create policy "Users can create comments"
on public.comments
for insert
to authenticated
with check (
  auth.uid() = user_id
);


drop policy if exists "Users can update their comments"
on public.comments;

create policy "Users can update their comments"
on public.comments
for update
to authenticated
using (
  auth.uid() = user_id
)
with check (
  auth.uid() = user_id
);


drop policy if exists "Users can delete their comments"
on public.comments;

create policy "Users can delete their comments"
on public.comments
for delete
to authenticated
using (
  auth.uid() = user_id
);


-- ============================================================
-- LIKES POLICIES
-- ============================================================

drop policy if exists "Authenticated users can read likes"
on public.likes;

create policy "Authenticated users can read likes"
on public.likes
for select
to authenticated
using (true);


drop policy if exists "Users can like posts"
on public.likes;

create policy "Users can like posts"
on public.likes
for insert
to authenticated
with check (
  auth.uid() = user_id
);


drop policy if exists "Users can remove their likes"
on public.likes;

create policy "Users can remove their likes"
on public.likes
for delete
to authenticated
using (
  auth.uid() = user_id
);


-- ============================================================
-- REPOST POLICIES
-- ============================================================

drop policy if exists "Authenticated users can read reposts"
on public.reposts;

create policy "Authenticated users can read reposts"
on public.reposts
for select
to authenticated
using (true);


drop policy if exists "Users can create reposts"
on public.reposts;

create policy "Users can create reposts"
on public.reposts
for insert
to authenticated
with check (
  auth.uid() = user_id
);


drop policy if exists "Users can remove their reposts"
on public.reposts;

create policy "Users can remove their reposts"
on public.reposts
for delete
to authenticated
using (
  auth.uid() = user_id
);


-- ============================================================
-- FOLLOW POLICIES
-- ============================================================

drop policy if exists "Authenticated users can read follows"
on public.follows;

create policy "Authenticated users can read follows"
on public.follows
for select
to authenticated
using (true);


drop policy if exists "Users can follow others"
on public.follows;

create policy "Users can follow others"
on public.follows
for insert
to authenticated
with check (
  auth.uid() = follower_id
);


drop policy if exists "Users can unfollow"
on public.follows;

create policy "Users can unfollow"
on public.follows
for delete
to authenticated
using (
  auth.uid() = follower_id
);


-- ============================================================
-- NOTIFICATION POLICIES
-- ============================================================

drop policy if exists "Users can read their notifications"
on public.notifications;

create policy "Users can read their notifications"
on public.notifications
for select
to authenticated
using (
  auth.uid() = recipient_id
);


drop policy if exists "Users can create notifications"
on public.notifications;

create policy "Users can create notifications"
on public.notifications
for insert
to authenticated
with check (
  auth.uid() = actor_id
);


drop policy if exists "Users can update their notifications"
on public.notifications;

create policy "Users can update their notifications"
on public.notifications
for update
to authenticated
using (
  auth.uid() = recipient_id
)
with check (
  auth.uid() = recipient_id
);


drop policy if exists "Users can delete their notifications"
on public.notifications;

create policy "Users can delete their notifications"
on public.notifications
for delete
to authenticated
using (
  auth.uid() = recipient_id
);