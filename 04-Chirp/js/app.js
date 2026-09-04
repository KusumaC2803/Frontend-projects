/* ============================================================
   CHIRP — SUPABASE CONNECTED APP
   ============================================================ */

const chirpSupabase = window.appSupabase;

const state = {
  posts: [],
  liked: new Set(),
  reposted: new Set(),
  profiles: new Map(),
  currentUser: null
};

const FALLBACK_AVATAR = "images/profile-image-1.jpg";


/* ============================================================
   UTILITIES
   ============================================================ */

function showToast(message) {
  const toast = document.getElementById("toast");

  if (!toast) return;

  toast.textContent = message;
  toast.classList.remove("hidden");

  clearTimeout(window.toastTimer);

  window.toastTimer = setTimeout(() => {
    toast.classList.add("hidden");
  }, 2200);
}


function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}


function timeAgo(value) {
  const timestamp = new Date(value).getTime();

  if (!Number.isFinite(timestamp)) {
    return "";
  }

  const seconds = Math.max(
    1,
    Math.floor((Date.now() - timestamp) / 1000)
  );

  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h`;
  }

  const days = Math.floor(hours / 24);

  return `${days}d`;
}


function normalizeHandle(handle) {
  if (!handle) {
    return "@user";
  }

  return handle.startsWith("@")
    ? handle
    : `@${handle}`;
}


/* ============================================================
   AUTHENTICATION
   ============================================================ */

async function getAuthenticatedUser() {

  if (!chirpSupabase) {
    throw new Error(
      "Supabase client is missing. Check js/supabase.js."
    );
  }

  const {
    data,
    error
  } = await chirpSupabase.auth.getSession();

  if (error) {
    throw error;
  }

  return data?.session?.user || null;
}


/* ============================================================
   PROFILE
   ============================================================ */

function profileFor(id) {

  return state.profiles.get(id) || {
    id,

    name:
      id === state.currentUser?.id
        ? state.currentUser.name
        : "User",

    handle:
      id === state.currentUser?.id
        ? state.currentUser.handle
        : "@user",

    avatar:
      id === state.currentUser?.id
        ? state.currentUser.avatar
        : FALLBACK_AVATAR
  };
}


function updateCurrentUserUI() {

  const user = state.currentUser;

  if (!user) return;

  const avatar =
    document.getElementById("currentUserAvatar");

  const name =
    document.getElementById("currentUserName");

  const handle =
    document.getElementById("currentUserHandle");

  if (avatar) {
    avatar.src =
      user.avatar || FALLBACK_AVATAR;
  }

  if (name) {
    name.textContent =
      user.name || "User";
  }

  if (handle) {
    handle.textContent =
      normalizeHandle(user.handle);
  }
}


async function ensureProfile(user) {

  const metadata =
    user.user_metadata || {};

  const emailName =
    user.email?.split("@")[0] || "user";

  const name =
    metadata.name ||
    metadata.full_name ||
    emailName ||
    "User";

  let handle =
    metadata.handle ||
    emailName ||
    `user_${user.id.slice(0, 8)}`;

  handle = handle
    .replace(/^@/, "")
    .replace(/[^a-zA-Z0-9_]/g, "")
    .toLowerCase();

  if (!handle) {
    handle = `user_${user.id.slice(0, 8)}`;
  }

  const avatar =
    metadata.avatar_url ||
    metadata.picture ||
    FALLBACK_AVATAR;


  /* ----------------------------------------------------------
     Try normal profile upsert
     ---------------------------------------------------------- */

  let result =
    await chirpSupabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          name,
          handle,
          avatar_url: avatar
        },
        {
          onConflict: "id"
        }
      )
      .select()
      .single();


  /* ----------------------------------------------------------
     Duplicate handle
     ---------------------------------------------------------- */

  if (
    result.error &&
    result.error.code === "23505"
  ) {

    handle =
      `${handle}_${user.id
        .replace(/-/g, "")
        .slice(0, 6)}`;

    result =
      await chirpSupabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            name,
            handle,
            avatar_url: avatar
          },
          {
            onConflict: "id"
          }
        )
        .select()
        .single();
  }


  if (result.error) {
    throw result.error;
  }


  applyProfile(
    user,
    result.data
  );
}


function applyProfile(
  authUser,
  profile
) {

  state.currentUser = {

    id: authUser.id,

    name:
      profile?.name ||
      authUser.user_metadata?.name ||
      "User",

    handle:
      normalizeHandle(
        profile?.handle ||
        authUser.email?.split("@")[0]
      ),

    avatar:
      profile?.avatar_url ||
      FALLBACK_AVATAR,

    email:
      authUser.email || ""
  };


  state.profiles.set(
    authUser.id,
    {
      id: authUser.id,

      name:
        state.currentUser.name,

      handle:
        state.currentUser.handle,

      avatar:
        state.currentUser.avatar
    }
  );


  updateCurrentUserUI();
}


async function loadProfiles(userIds) {

  const ids = [
    ...new Set(
      (userIds || []).filter(Boolean)
    )
  ];

  if (!ids.length) {
    return;
  }


  const {
    data,
    error
  } =
    await chirpSupabase
      .from("profiles")
      .select(
        "id,name,handle,avatar_url"
      )
      .in(
        "id",
        ids
      );


  if (error) {
    throw error;
  }


  (data || []).forEach(
    (profile) => {

      state.profiles.set(
        profile.id,
        {
          id: profile.id,

          name:
            profile.name ||
            "User",

          handle:
            normalizeHandle(
              profile.handle
            ),

          avatar:
            profile.avatar_url ||
            FALLBACK_AVATAR
        }
      );
    }
  );
}


/* ============================================================
   LOAD FEED
   ============================================================ */

async function loadFeed() {

  const feed =
    document.getElementById("feed");

  if (!feed) {
    return;
  }


  feed.innerHTML = `
    <div class="empty">
      Loading Chirp feed...
    </div>
  `;


  /* ----------------------------------------------------------
     POSTS
     ---------------------------------------------------------- */

  const {
    data: posts,
    error: postError
  } =
    await chirpSupabase
      .from("posts")
      .select(
        "id,user_id,content,image_url,created_at,updated_at"
      )
      .order(
        "created_at",
        {
          ascending: false
        }
      )
      .limit(100);


  if (postError) {
    throw postError;
  }


  const rows = posts || [];

  const postIds =
    rows.map(
      post => post.id
    );

  const userIds =
    rows.map(
      post => post.user_id
    );


  await loadProfiles(userIds);


  /* ----------------------------------------------------------
     LIKES / REPOSTS / COMMENTS
     ---------------------------------------------------------- */

  const [
    likesResult,
    repostsResult,
    commentsResult
  ] = await Promise.all([

    postIds.length

      ? chirpSupabase
          .from("likes")
          .select(
            "post_id,user_id"
          )
          .in(
            "post_id",
            postIds
          )

      : Promise.resolve({
          data: [],
          error: null
        }),


    postIds.length

      ? chirpSupabase
          .from("reposts")
          .select(
            "post_id,user_id"
          )
          .in(
            "post_id",
            postIds
          )

      : Promise.resolve({
          data: [],
          error: null
        }),


    postIds.length

      ? chirpSupabase
          .from("comments")
          .select(
            "id,post_id,user_id,parent_id,content,created_at"
          )
          .in(
            "post_id",
            postIds
          )
          .order(
            "created_at",
            {
              ascending: true
            }
          )

      : Promise.resolve({
          data: [],
          error: null
        })
  ]);


  if (likesResult.error) {
    throw likesResult.error;
  }

  if (repostsResult.error) {
    throw repostsResult.error;
  }

  if (commentsResult.error) {
    throw commentsResult.error;
  }


  const likes =
    likesResult.data || [];

  const reposts =
    repostsResult.data || [];

  const comments =
    commentsResult.data || [];


  await loadProfiles(
    comments.map(
      comment => comment.user_id
    )
  );


  /* ----------------------------------------------------------
     CURRENT USER LIKES
     ---------------------------------------------------------- */

  state.liked =
    new Set(
      likes
        .filter(
          row =>
            row.user_id ===
            state.currentUser.id
        )
        .map(
          row =>
            row.post_id
        )
    );


  /* ----------------------------------------------------------
     CURRENT USER REPOSTS
     ---------------------------------------------------------- */

  state.reposted =
    new Set(
      reposts
        .filter(
          row =>
            row.user_id ===
            state.currentUser.id
        )
        .map(
          row =>
            row.post_id
        )
    );


  /* ----------------------------------------------------------
     LIKE COUNTS
     ---------------------------------------------------------- */

  const likeCount =
    new Map();

  likes.forEach(
    row => {

      likeCount.set(
        row.post_id,
        (
          likeCount.get(
            row.post_id
          ) || 0
        ) + 1
      );

    }
  );


  /* ----------------------------------------------------------
     REPOST COUNTS
     ---------------------------------------------------------- */

  const repostCount =
    new Map();

  reposts.forEach(
    row => {

      repostCount.set(
        row.post_id,
        (
          repostCount.get(
            row.post_id
          ) || 0
        ) + 1
      );

    }
  );


  /* ----------------------------------------------------------
     COMMENT MAP
     ---------------------------------------------------------- */

  const commentMap =
    new Map();

  comments.forEach(
    comment => {

      if (
        !commentMap.has(
          comment.post_id
        )
      ) {

        commentMap.set(
          comment.post_id,
          []
        );
      }


      commentMap
        .get(comment.post_id)
        .push({

          id:
            comment.id,

          userId:
            comment.user_id,

          content:
            comment.content,

          parentId:
            comment.parent_id,

          createdAt:
            comment.created_at

        });
    }
  );


  /* ----------------------------------------------------------
     FINAL STATE
     ---------------------------------------------------------- */

  state.posts =
    rows.map(
      post => ({

        id:
          post.id,

        userId:
          post.user_id,

        content:
          post.content || "",

        image:
          post.image_url || "",

        createdAt:
          post.created_at,

        likes:
          likeCount.get(
            post.id
          ) || 0,

        reposts:
          repostCount.get(
            post.id
          ) || 0,

        comments:
          commentMap.get(
            post.id
          ) || []

      })
    );


  renderFeed();
}


/* ============================================================
   RENDER COMMENT
   ============================================================ */

function renderComment(comment) {

  const user =
    profileFor(
      comment.userId
    );


  return `
    <div class="comment">

      <img
        class="comment-avatar"
        src="${escapeHtml(user.avatar)}"
        alt=""
      >

      <div class="comment-body">

        <div>
          <strong>
            ${escapeHtml(user.name)}
          </strong>

          <span class="comment-meta">
            ${escapeHtml(user.handle)}
            ·
            ${timeAgo(comment.createdAt)}
          </span>
        </div>

        <div>
          ${escapeHtml(comment.content)}
        </div>

      </div>

    </div>
  `;
}


/* ============================================================
   RENDER POST
   ============================================================ */

function renderPost(post) {

  const user =
    profileFor(
      post.userId
    );

  const comments =
    post.comments || [];

  const liked =
    state.liked.has(
      post.id
    );

  const reposted =
    state.reposted.has(
      post.id
    );


  return `
    <article
      class="post"
      data-post-id="${escapeHtml(post.id)}"
    >

      <img
        class="post-avatar"
        src="${escapeHtml(user.avatar)}"
        alt="${escapeHtml(user.name)}"
      >


      <div class="post-main">

        <div class="post-header">

          <span class="post-name">
            ${escapeHtml(user.name)}
          </span>

          <span class="post-handle">
            ${escapeHtml(user.handle)}
          </span>

          <span class="post-time">
            · ${timeAgo(post.createdAt)}
          </span>

        </div>


        ${
          post.content
            ? `
              <div class="post-content">
                ${escapeHtml(post.content)}
              </div>
            `
            : ""
        }


        ${
          post.image
            ? `
              <img
                class="post-image"
                src="${escapeHtml(post.image)}"
                alt="Post media"
                loading="lazy"
              >
            `
            : ""
        }


        <div class="post-actions">


          <!-- COMMENT -->

          <button
            class="action comment-action"
            data-action="comment"
            type="button"
            aria-label="Comment"
          >
            💬
            <span>
              ${comments.length}
            </span>
          </button>


          <!-- REPOST -->

          <button
            class="action ${reposted ? "reposted" : ""}"
            data-action="repost"
            type="button"
            aria-label="Repost"
          >
            🔁
            <span>
              ${post.reposts}
            </span>
          </button>


          <!-- LIKE -->

          <button
            class="action ${liked ? "active" : ""}"
            data-action="like"
            type="button"
            aria-label="Like"
          >
            ${liked ? "♥" : "♡"}
            <span>
              ${post.likes}
            </span>
          </button>

        </div>


        <!-- COMMENTS -->

        <div
          class="comment-panel hidden"
          id="comments-${escapeHtml(post.id)}"
        >

          ${
            comments.length

              ? comments
                  .map(renderComment)
                  .join("")

              : `
                <div class="comment-empty">
                  No replies yet.
                </div>
              `
          }


          <form
            class="comment-form"
            data-comment-form="${escapeHtml(post.id)}"
          >

            <input
              name="comment"
              placeholder="Post your reply"
              maxlength="280"
              autocomplete="off"
              required
            >

            <button
              class="primary-btn"
              type="submit"
            >
              Reply
            </button>

          </form>

        </div>

      </div>

    </article>
  `;
}


/* ============================================================
   RENDER FEED
   ============================================================ */

function renderFeed() {

  const feed =
    document.getElementById("feed");

  if (!feed) {
    return;
  }


  if (!state.posts.length) {

    feed.innerHTML = `
      <div class="empty">
        No posts yet.<br>
        Be the first to post!
      </div>
    `;

    return;
  }


  feed.innerHTML =
    [...state.posts]
      .sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      )
      .map(renderPost)
      .join("");
}


/* ============================================================
   IMAGE UPLOAD
   ============================================================ */

async function uploadPostImage(file) {

  if (!file) {
    return "";
  }


  if (!file.type.startsWith("image/")) {

    throw new Error(
      "Please select a valid image."
    );
  }


  if (file.size > 3 * 1024 * 1024) {

    throw new Error(
      "Image must be smaller than 3 MB."
    );
  }


  const extension =
    file.name
      .split(".")
      .pop()
      ?.toLowerCase() ||
    "jpg";


  const filePath =
    `${state.currentUser.id}/${crypto.randomUUID()}.${extension}`;


  const {
    error
  } =
    await chirpSupabase
      .storage
      .from("post-media")
      .upload(
        filePath,
        file,
        {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type
        }
      );


  if (error) {
    throw error;
  }


  const {
    data
  } =
    chirpSupabase
      .storage
      .from("post-media")
      .getPublicUrl(
        filePath
      );


  return data?.publicUrl || "";
}


/* ============================================================
   COMPOSER
   ============================================================ */

function setupComposer() {

  const form =
    document.getElementById("postForm");

  const textarea =
    document.getElementById("postContent");

  const fileInput =
    document.getElementById("postImage");

  const preview =
    document.getElementById("imagePreview");

  const previewImg =
    document.getElementById("previewImg");

  const removePreview =
    document.getElementById("removePreview");


  if (
    !form ||
    !textarea ||
    !fileInput
  ) {
    console.warn(
      "Composer elements not found."
    );

    return;
  }


  /* ----------------------------------------------------------
     IMAGE PREVIEW
     ---------------------------------------------------------- */

  fileInput.addEventListener(
    "change",
    () => {

      const file =
        fileInput.files?.[0];

      if (!file) {
        return;
      }


      if (!file.type.startsWith("image/")) {

        showToast(
          "Please select a valid image."
        );

        fileInput.value = "";

        return;
      }


      if (file.size > 3 * 1024 * 1024) {

        showToast(
          "Image must be smaller than 3 MB."
        );

        fileInput.value = "";

        return;
      }


      if (
        preview &&
        previewImg
      ) {

        const reader =
          new FileReader();

        reader.onload =
          event => {

            previewImg.src =
              event.target.result;

            preview.classList.remove(
              "hidden"
            );

          };

        reader.readAsDataURL(
          file
        );
      }

    }
  );


  /* ----------------------------------------------------------
     REMOVE IMAGE
     ---------------------------------------------------------- */

  if (removePreview) {

    removePreview.addEventListener(
      "click",
      () => {

        fileInput.value = "";

        if (previewImg) {
          previewImg.removeAttribute(
            "src"
          );
        }

        if (preview) {
          preview.classList.add(
            "hidden"
          );
        }

      }
    );
  }


  /* ----------------------------------------------------------
     CREATE POST
     ---------------------------------------------------------- */

  form.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      if (!state.currentUser) {

        showToast(
          "Please log in again."
        );

        return;
      }


      const content =
        textarea.value.trim();

      const file =
        fileInput.files?.[0];


      if (
        !content &&
        !file
      ) {

        showToast(
          "Write something or add an image."
        );

        return;
      }


      if (content.length > 280) {

        showToast(
          "Post must be 280 characters or less."
        );

        return;
      }


      const button =
        form.querySelector(
          'button[type="submit"]'
        );


      if (button) {

        button.disabled = true;
        button.textContent = "Posting...";
      }


      try {

        let imageUrl = "";


        /* IMAGE */

        if (file) {

          imageUrl =
            await uploadPostImage(
              file
            );
        }


        /* DATABASE INSERT */

        const {
          error
        } =
          await chirpSupabase
            .from("posts")
            .insert({

              user_id:
                state.currentUser.id,

              content:
                content,

              image_url:
                imageUrl || null

            });


        if (error) {
          throw error;
        }


        /* CLEAR FORM */

        textarea.value = "";

        if (removePreview) {
          removePreview.click();
        } else {
          fileInput.value = "";
        }


        /* REFRESH */

        await loadFeed();

        showToast(
          "Post published!"
        );


      } catch (error) {

        console.error(
          "Create post error:",
          error
        );

        showToast(
          error.message ||
          "Unable to publish post."
        );


      } finally {

        if (button) {

          button.disabled = false;
          button.textContent = "Post";
        }
      }

    }
  );
}


/* ============================================================
   FEED ACTIONS
   ============================================================ */

function setupFeedActions() {

  const feed =
    document.getElementById("feed");

  if (!feed) {
    return;
  }


  /* ----------------------------------------------------------
     BUTTON ACTIONS
     ---------------------------------------------------------- */

  feed.addEventListener(
    "click",
    async event => {

      const button =
        event.target.closest(
          "[data-action]"
        );

      if (!button) {
        return;
      }


      const article =
        event.target.closest(
          "[data-post-id]"
        );

      if (!article) {
        return;
      }


      const postId =
        article.dataset.postId;


      const post =
        state.posts.find(
          item =>
            item.id === postId
        );


      if (!post) {
        return;
      }


      const action =
        button.dataset.action;


      /* COMMENT */

      if (
        action === "comment"
      ) {

        const panel =
          document.getElementById(
            `comments-${postId}`
          );

        if (panel) {
          panel.classList.toggle(
            "hidden"
          );
        }

        return;
      }


      button.disabled = true;


      try {

        /* ----------------------------------------------------
           LIKE
           ---------------------------------------------------- */

        if (
          action === "like"
        ) {

          if (
            state.liked.has(
              postId
            )
          ) {

            const {
              error
            } =
              await chirpSupabase
                .from("likes")
                .delete()
                .eq(
                  "post_id",
                  postId
                )
                .eq(
                  "user_id",
                  state.currentUser.id
                );


            if (error) {
              throw error;
            }


          } else {

            const {
              error
            } =
              await chirpSupabase
                .from("likes")
                .insert({

                  post_id:
                    postId,

                  user_id:
                    state.currentUser.id

                });


            if (error) {
              throw error;
            }
          }


          await loadFeed();

          showToast(
            state.liked.has(postId)
              ? "Liked!"
              : "Like removed."
          );
        }


        /* ----------------------------------------------------
           REPOST
           ---------------------------------------------------- */

        if (
          action === "repost"
        ) {

          if (
            state.reposted.has(
              postId
            )
          ) {

            const {
              error
            } =
              await chirpSupabase
                .from("reposts")
                .delete()
                .eq(
                  "post_id",
                  postId
                )
                .eq(
                  "user_id",
                  state.currentUser.id
                );


            if (error) {
              throw error;
            }


          } else {

            const {
              error
            } =
              await chirpSupabase
                .from("reposts")
                .insert({

                  post_id:
                    postId,

                  user_id:
                    state.currentUser.id

                });


            if (error) {
              throw error;
            }
          }


          await loadFeed();

          showToast(
            state.reposted.has(postId)
              ? "Reposted!"
              : "Repost removed."
          );
        }


      } catch (error) {

        console.error(
          "Action error:",
          error
        );

        showToast(
          error.message ||
          "Action failed."
        );


      } finally {

        button.disabled = false;
      }

    }
  );


  /* ----------------------------------------------------------
     COMMENTS
     ---------------------------------------------------------- */

  feed.addEventListener(
    "submit",
    async event => {

      const form =
        event.target.closest(
          "[data-comment-form]"
        );

      if (!form) {
        return;
      }


      event.preventDefault();


      const postId =
        form.dataset.commentForm;

      const input =
        form.elements.comment;

      const content =
        input.value.trim();


      if (!content) {
        return;
      }


      const button =
        form.querySelector(
          'button[type="submit"]'
        );


      if (button) {

        button.disabled = true;
        button.textContent = "Replying...";
      }


      try {

        const {
          error
        } =
          await chirpSupabase
            .from("comments")
            .insert({

              post_id:
                postId,

              user_id:
                state.currentUser.id,

              content:
                content,

              parent_id:
                null

            });


        if (error) {
          throw error;
        }


        await loadFeed();


        document
          .getElementById(
            `comments-${postId}`
          )
          ?.classList.remove(
            "hidden"
          );


        showToast(
          "Reply added!"
        );


      } catch (error) {

        console.error(
          "Comment error:",
          error
        );

        showToast(
          error.message ||
          "Unable to add reply."
        );


      } finally {

        if (button) {

          button.disabled = false;
          button.textContent = "Reply";
        }
      }

    }
  );
}


/* ============================================================
   REALTIME
   ============================================================ */

function setupRealtime() {

  if (!chirpSupabase) {
    return;
  }


  chirpSupabase
    .channel("chirp-live-feed")

    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "posts"
      },
      () => {

        loadFeed()
          .catch(
            error =>
              console.error(
                "Realtime posts error:",
                error
              )
          );

      }
    )

    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "likes"
      },
      () => {

        loadFeed()
          .catch(
            error =>
              console.error(
                "Realtime likes error:",
                error
              )
          );

      }
    )

    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "reposts"
      },
      () => {

        loadFeed()
          .catch(
            error =>
              console.error(
                "Realtime reposts error:",
                error
              )
          );

      }
    )

    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "comments"
      },
      () => {

        loadFeed()
          .catch(
            error =>
              console.error(
                "Realtime comments error:",
                error
              )
          );

      }
    )

    .subscribe();
}


/* ============================================================
   LOGOUT
   ============================================================ */

function setupSupabaseAuth() {

  const logout =
    document.getElementById(
      "logoutBtn"
    );

  if (!logout) {
    return;
  }


  logout.addEventListener(
    "click",
    async () => {

      logout.disabled = true;
      logout.textContent = "Logging out...";


      try {

        const {
          error
        } =
          await chirpSupabase
            .auth
            .signOut();


        if (error) {
          throw error;
        }


        window.location.href =
          "login.html";


      } catch (error) {

        console.error(
          "Logout error:",
          error
        );

        showToast(
          error.message ||
          "Unable to log out."
        );


        logout.disabled = false;
        logout.textContent = "Logout";
      }

    }
  );
}


/* ============================================================
   SIDEBAR
   ============================================================ */

function setupSidebar() {

  const sidebar =
    document.querySelector(
      ".layout__left-sidebar"
    );

  const toggle =
    document.getElementById(
      "menuToggle"
    );

  const overlay =
    document.getElementById(
      "sidebarOverlay"
    );


  if (
    !sidebar ||
    !toggle ||
    !overlay
  ) {
    return;
  }


  function closeSidebar() {

    sidebar.classList.remove(
      "sidebar-open"
    );

    overlay.classList.add(
      "hidden"
    );

    overlay.setAttribute(
      "aria-hidden",
      "true"
    );

    toggle.setAttribute(
      "aria-expanded",
      "false"
    );

    toggle.setAttribute(
      "aria-label",
      "Open sidebar"
    );
  }


  toggle.addEventListener(
    "click",
    () => {

      const open =
        sidebar.classList.toggle(
          "sidebar-open"
        );


      overlay.classList.toggle(
        "hidden",
        !open
      );


      overlay.setAttribute(
        "aria-hidden",
        String(!open)
      );


      toggle.setAttribute(
        "aria-expanded",
        String(open)
      );


      toggle.setAttribute(
        "aria-label",
        open
          ? "Close sidebar"
          : "Open sidebar"
      );

    }
  );


  overlay.addEventListener(
    "click",
    closeSidebar
  );


  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Escape"
      ) {
        closeSidebar();
      }

    }
  );
}


/* ============================================================
   INITIALIZE
   ============================================================ */

async function initializeAuthenticatedApp() {

  try {

    /* SUPABASE */

    if (!chirpSupabase) {

      throw new Error(
        "Supabase client is missing. Check js/supabase.js."
      );
    }


    /* SESSION */

    const user =
      await getAuthenticatedUser();


    if (!user) {

      window.location.href =
        "login.html";

      return;
    }


    /* PROFILE */

    await ensureProfile(user);


    /* FEED */

    await loadFeed();


    /* UI */

    setupComposer();

    setupFeedActions();

    setupSupabaseAuth();

    setupSidebar();

    setupRealtime();


    /* AUTH LISTENER */

    chirpSupabase.auth.onAuthStateChange(
      (event, session) => {

        if (
          event === "SIGNED_OUT"
        ) {

          window.location.href =
            "login.html";
        }

      }
    );


    console.log(
      "Chirp initialized successfully."
    );


  } catch (error) {

    console.error(
      "Chirp initialization error:",
      error
    );


    const feed =
      document.getElementById(
        "feed"
      );


    if (feed) {

      feed.innerHTML = `
        <div class="empty">
          Unable to load Chirp.
          <br>
          <small>
            ${escapeHtml(
              error.message ||
              "Unknown error"
            )}
          </small>
        </div>
      `;
    }


    showToast(
      error.message ||
      "Unable to load Chirp."
    );
  }
}


/* ============================================================
   START
   ============================================================ */

document.addEventListener(
  "DOMContentLoaded",
  initializeAuthenticatedApp
);