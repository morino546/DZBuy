const path = require("path");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

const hasGoogle = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
const hasFacebook = Boolean(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET);

if (hasGoogle) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${BASE_URL}/auth/google/callback`
      },
      (accessToken, refreshToken, profile, done) => {
        const user = {
          provider: "google",
          id: profile.id,
          displayName: profile.displayName,
          emails: profile.emails || [],
          photos: profile.photos || []
        };
        done(null, user);
      }
    )
  );
}

if (hasFacebook) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: `${BASE_URL}/auth/facebook/callback`,
        profileFields: ["id", "displayName", "emails", "picture.type(large)"]
      },
      (accessToken, refreshToken, profile, done) => {
        const user = {
          provider: "facebook",
          id: profile.id,
          displayName: profile.displayName,
          emails: profile.emails || [],
          photos: profile.photos || []
        };
        done(null, user);
      }
    )
  );
}

app.get("/auth/google", (req, res, next) => {
  if (!hasGoogle) {
    return res.status(503).send("Google OAuth is not configured.");
  }
  passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
});

app.get(
  "/auth/google/callback",
  (req, res, next) => {
    if (!hasGoogle) {
      return res.status(503).send("Google OAuth is not configured.");
    }
    passport.authenticate("google", { failureRedirect: "/?auth=failed" })(req, res, next);
  },
  (req, res) => {
    res.redirect("/account.html");
  }
);

app.get("/auth/facebook", (req, res, next) => {
  if (!hasFacebook) {
    return res.status(503).send("Facebook OAuth is not configured.");
  }
  passport.authenticate("facebook", { scope: ["email"] })(req, res, next);
});

app.get(
  "/auth/facebook/callback",
  (req, res, next) => {
    if (!hasFacebook) {
      return res.status(503).send("Facebook OAuth is not configured.");
    }
    passport.authenticate("facebook", { failureRedirect: "/?auth=failed" })(req, res, next);
  },
  (req, res) => {
    res.redirect("/account.html");
  }
);

app.get("/auth/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.redirect("/");
    });
  });
});

app.get("/api/me", (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ user: null });
  }
  return res.json({ user: req.user });
});

app.get("/api/auth-status", (req, res) => {
  return res.json({
    providers: {
      google: hasGoogle,
      facebook: hasFacebook
    },
    baseUrl: BASE_URL
  });
});

app.use(express.static(path.join(__dirname)));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`DZBuy server listening on http://localhost:${PORT}`);
});
