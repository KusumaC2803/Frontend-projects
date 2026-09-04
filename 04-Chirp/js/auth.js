document.addEventListener("DOMContentLoaded", () => {

  const supabase = window.appSupabase;

  // ============================================================
  // LOGIN
  // ============================================================

  const loginForm = document.getElementById("loginForm");

  if (loginForm) {

    const loginButton = document.getElementById("loginButton");
    const authMessage = document.getElementById("authMessage");

    loginForm.addEventListener("submit", async (event) => {

      event.preventDefault();

      const email = document.getElementById("loginEmail")?.value.trim();
      const password = document.getElementById("loginPassword")?.value;

      if (authMessage) {
        authMessage.textContent = "";
        authMessage.style.color = "#e0245e";
      }

      if (!email || !password) {

        if (authMessage) {
          authMessage.textContent =
            "Please enter your email and password.";
        }

        return;
      }

      if (!supabase) {

        if (authMessage) {
          authMessage.textContent =
            "Supabase is not configured. Check js/supabase.js";
        }

        return;
      }

      if (loginButton) {
        loginButton.disabled = true;
        loginButton.textContent = "Logging in...";
      }

      try {

        console.log("Attempting Supabase login...");

        const { data, error } =
          await supabase.auth.signInWithPassword({
            email: email,
            password: password
          });

        console.log("LOGIN RESULT:", data);
        console.log("LOGIN ERROR:", error);

        if (error) {
          throw error;
        }

        if (!data?.session) {
          throw new Error(
            "Login succeeded but no session was created."
          );
        }

        if (authMessage) {
          authMessage.style.color = "#00a86b";
          authMessage.textContent =
            "Login successful! Opening Chirp...";
        }

        setTimeout(() => {
          window.location.href = "index.html";
        }, 500);

      } catch (error) {

        console.error("LOGIN ERROR:", error);

        if (authMessage) {
          authMessage.style.color = "#e0245e";
          authMessage.textContent =
            error.message || "Unable to log in.";
        }

      } finally {

        if (loginButton) {
          loginButton.disabled = false;
          loginButton.textContent = "Log in";
        }

      }

    });

  }


  // ============================================================
  // SIGN UP
  // ============================================================

  const signupForm = document.getElementById("signupForm");

  if (signupForm) {

    const signupButton =
      document.getElementById("signupButton");

    const authMessage =
      document.getElementById("authMessage");

    signupForm.addEventListener("submit", async (event) => {

      event.preventDefault();

      const name =
        document.getElementById("signupName")?.value.trim();

      const handle =
        document.getElementById("signupHandle")?.value.trim();

      const email =
        document.getElementById("signupEmail")?.value.trim();

      const password =
        document.getElementById("signupPassword")?.value;

      if (authMessage) {
        authMessage.textContent = "";
        authMessage.style.color = "#e0245e";
      }

      if (!name || !handle || !email || !password) {

        if (authMessage) {
          authMessage.textContent =
            "Please fill in all fields.";
        }

        return;
      }

      if (password.length < 6) {

        if (authMessage) {
          authMessage.textContent =
            "Password must be at least 6 characters.";
        }

        return;
      }

      if (!supabase) {

        if (authMessage) {
          authMessage.textContent =
            "Supabase is not configured. Check js/supabase.js";
        }

        return;
      }

      if (signupButton) {
        signupButton.disabled = true;
        signupButton.textContent = "Creating account...";
      }

      try {

        const cleanHandle = handle
          .replace(/^@/, "")
          .replace(/[^a-zA-Z0-9_]/g, "")
          .toLowerCase();

        console.log("Attempting Supabase signup...");

        const { data, error } =
          await supabase.auth.signUp({

            email: email,

            password: password,

            options: {

              emailRedirectTo:
                window.location.origin + "/login.html",

              data: {
                name: name,
                handle: cleanHandle
              }

            }

          });

        console.log("SIGNUP RESULT:", data);
        console.log("SIGNUP ERROR:", error);

        if (error) {
          throw error;
        }

        if (authMessage) {
          authMessage.style.color = "#00a86b";
        }

        if (data.user && !data.session) {

          if (authMessage) {
            authMessage.textContent =
              "Account created! Check your email to confirm your account.";
          }

        } else {

          if (authMessage) {
            authMessage.textContent =
              "Account created successfully!";
          }

          setTimeout(() => {
            window.location.href = "index.html";
          }, 1000);

        }

      } catch (error) {

        console.error("SIGNUP ERROR:", error);

        if (authMessage) {
          authMessage.style.color = "#e0245e";
          authMessage.textContent =
            error.message || "Unable to create account.";
        }

      } finally {

        if (signupButton) {
          signupButton.disabled = false;
          signupButton.textContent = "Create account";
        }

      }

    });

  }

});