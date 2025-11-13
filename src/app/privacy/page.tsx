// src/app/privacy/page.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { Box, Stack, Typography, Divider } from "@mui/material";
import { alpha } from "@mui/material/styles";

export default function PrivacyPage() {
  return (
    <Box
      sx={{
        maxWidth: 900,
        mx: "auto",
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 4, sm: 6 },
      }}
    >
      <Stack spacing={3}>
        {/* Header */}
        <Stack spacing={1.5}>
          <Typography
            variant="overline"
            sx={{ letterSpacing: 2, opacity: 0.7 }}
          >
            BetMaxx
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 900 }}>
            Privacy Policy
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            Last updated: November 2025
          </Typography>
        </Stack>

        <Divider sx={{ borderColor: alpha("#FFFFFF", 0.16) }} />

        {/* Intro */}
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          BetMaxx (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is
          committed to safeguarding your privacy. This Privacy Policy explains
          what information we collect, how we use it, and the choices you have.
          By using BetMaxx, you agree to the practices described here. If you do
          not agree with this policy, please do not use the site.
        </Typography>

        {/* 1. Information We Collect */}
        <Stack spacing={1.5}>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            1. Information We Collect
          </Typography>

          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            1.1 Account Information
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            If you create an account on BetMaxx, we may collect:
          </Typography>
          <Box component="ul" sx={{ pl: 3, m: 0 }}>
            <Typography component="li" variant="body2" sx={{ opacity: 0.9 }}>
              Email address
            </Typography>
            <Typography component="li" variant="body2" sx={{ opacity: 0.9 }}>
              Display name (optional)
            </Typography>
            <Typography component="li" variant="body2" sx={{ opacity: 0.9 }}>
              Account creation time
            </Typography>
            <Typography component="li" variant="body2" sx={{ opacity: 0.9 }}>
              User-selected preferences (favorite teams, preferred sportsbooks,
              saved lines)
            </Typography>
          </Box>

          <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 1.5 }}>
            1.2 Usage Information
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            We collect basic usage analytics to help us understand how BetMaxx
            is used and to improve performance. This may include:
          </Typography>
          <Box component="ul" sx={{ pl: 3, m: 0 }}>
            <Typography component="li" variant="body2" sx={{ opacity: 0.9 }}>
              Pages and screens viewed
            </Typography>
            <Typography component="li" variant="body2" sx={{ opacity: 0.9 }}>
              Basic device and browser information
            </Typography>
            <Typography component="li" variant="body2" sx={{ opacity: 0.9 }}>
              Error logs and performance data
            </Typography>
          </Box>

          <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 1.5 }}>
            1.3 Click Tracking
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            When you click a sportsbook link from BetMaxx, we may track:
          </Typography>
          <Box component="ul" sx={{ pl: 3, m: 0 }}>
            <Typography component="li" variant="body2" sx={{ opacity: 0.9 }}>
              That a click occurred
            </Typography>
            <Typography component="li" variant="body2" sx={{ opacity: 0.9 }}>
              Which sportsbook link was clicked
            </Typography>
            <Typography component="li" variant="body2" sx={{ opacity: 0.9 }}>
              The approximate time of the click
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
            This click tracking is used for analytics, product improvement, and
            potential future affiliate relationships.{" "}
            <strong>
              It is not tied to individual user identities or specific accounts.
            </strong>
          </Typography>
        </Stack>

        {/* 2. What We Do Not Collect */}
        <Stack spacing={1.5}>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            2. What We Do Not Collect
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            BetMaxx is an odds comparison and line-shopping tool. We do{" "}
            <strong>not</strong>:
          </Typography>
          <Box component="ul" sx={{ pl: 3, m: 0 }}>
            <Typography component="li" variant="body2" sx={{ opacity: 0.9 }}>
              Collect or store your betting history or wagers placed
            </Typography>
            <Typography component="li" variant="body2" sx={{ opacity: 0.9 }}>
              Store your payment, banking, or financial details
            </Typography>
            <Typography component="li" variant="body2" sx={{ opacity: 0.9 }}>
              Retrieve or access data from external sportsbooks about your
              accounts
            </Typography>
            <Typography component="li" variant="body2" sx={{ opacity: 0.9 }}>
              Intentionally collect sensitive personal information such as
              government IDs or health information
            </Typography>
            <Typography component="li" variant="body2" sx={{ opacity: 0.9 }}>
              Track your physical location beyond what your browser normally
              transmits for basic web operations
            </Typography>
          </Box>
        </Stack>

        {/* 3. How We Use Your Information */}
        <Stack spacing={1.5}>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            3. How We Use Your Information
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            We use the information we collect to:
          </Typography>
          <Box component="ul" sx={{ pl: 3, m: 0 }}>
            <Typography component="li" variant="body2" sx={{ opacity: 0.9 }}>
              Maintain and secure your account
            </Typography>
            <Typography component="li" variant="body2" sx={{ opacity: 0.9 }}>
              Save your preferences (favorites, books, saved lines) across
              sessions
            </Typography>
            <Typography component="li" variant="body2" sx={{ opacity: 0.9 }}>
              Personalize your experience within the app
            </Typography>
            <Typography component="li" variant="body2" sx={{ opacity: 0.9 }}>
              Improve product performance and reliability
            </Typography>
            <Typography component="li" variant="body2" sx={{ opacity: 0.9 }}>
              Analyze anonymized usage patterns and click counts
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            We do <strong>not</strong> use your data for ad targeting, and we do{" "}
            <strong>not</strong> run third-party advertising networks on BetMaxx
            at this time.
          </Typography>
        </Stack>

        {/* 4. Data Sharing */}
        <Stack spacing={1.5}>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            4. Data Sharing
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            We do <strong>not</strong> sell, rent, or trade your personal data.
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
            We may share anonymous, aggregated analytics (for example, total
            click counts for a particular sportsbook) for product or business
            purposes. These aggregates do not identify individual users.
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
            We may also disclose information if we reasonably believe it is
            necessary to:
          </Typography>
          <Box component="ul" sx={{ pl: 3, m: 0 }}>
            <Typography component="li" variant="body2" sx={{ opacity: 0.9 }}>
              Comply with a legal obligation or valid legal process
            </Typography>
            <Typography component="li" variant="body2" sx={{ opacity: 0.9 }}>
              Enforce our{" "}
              <Link href="/terms" style={{ textDecoration: "underline" }}>
                Terms of Service
              </Link>
            </Typography>
            <Typography component="li" variant="body2" sx={{ opacity: 0.9 }}>
              Protect the rights, property, or safety of BetMaxx, our users, or
              the public
            </Typography>
          </Box>
        </Stack>

        {/* 5. Storage & Security */}
        <Stack spacing={1.5}>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            5. Data Storage & Security
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            BetMaxx uses modern cloud infrastructure and security controls,
            including:
          </Typography>
          <Box component="ul" sx={{ pl: 3, m: 0 }}>
            <Typography component="li" variant="body2" sx={{ opacity: 0.9 }}>
              Firebase Authentication for user login
            </Typography>
            <Typography component="li" variant="body2" sx={{ opacity: 0.9 }}>
              Firestore security rules for database access
            </Typography>
            <Typography component="li" variant="body2" sx={{ opacity: 0.9 }}>
              HTTPS encryption for data in transit
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            No system can be guaranteed 100% secure, but we aim to use
            reasonable safeguards appropriate to the nature of the data we
            store.
          </Typography>
        </Stack>

        {/* 6. Cookies & Local Storage */}
        <Stack spacing={1.5}>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            6. Cookies & Local Storage
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            BetMaxx uses limited cookies and browser storage to keep the site
            functional and pleasant to use. This may include:
          </Typography>
          <Box component="ul" sx={{ pl: 3, m: 0 }}>
            <Typography component="li" variant="body2" sx={{ opacity: 0.9 }}>
              Authentication cookies to keep you signed in
            </Typography>
            <Typography component="li" variant="body2" sx={{ opacity: 0.9 }}>
              Local storage keys for UI preferences and saved filters
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            We do not use third-party advertising pixels or cross-site ad
            tracking cookies.
          </Typography>
        </Stack>

        {/* 7. Your Choices */}
        <Stack spacing={1.5}>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            7. Your Choices
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            As a BetMaxx user, you can:
          </Typography>
          <Box component="ul" sx={{ pl: 3, m: 0 }}>
            <Typography component="li" variant="body2" sx={{ opacity: 0.9 }}>
              Update your favorite teams and sportsbooks in your account
              settings
            </Typography>
            <Typography component="li" variant="body2" sx={{ opacity: 0.9 }}>
              Add or remove saved lines at any time
            </Typography>
            <Typography component="li" variant="body2" sx={{ opacity: 0.9 }}>
              Log out of your account to stop new session-based data from being
              associated with your profile
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Full account deletion tools are planned for a future release. Until
            then, you may contact us directly to request account removal (see
            Contact Us below).
          </Typography>
        </Stack>

        {/* 8. Children’s Privacy */}
        <Stack spacing={1.5}>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            8. Children’s Privacy
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            BetMaxx is intended for adults over the age of 18, or the legal
            betting age in your jurisdiction. We do not knowingly collect
            personal information from children. If we learn that we have
            unintentionally collected data from a minor, we will take reasonable
            steps to delete it.
          </Typography>
        </Stack>

        {/* 9. Changes */}
        <Stack spacing={1.5}>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            9. Changes to This Policy
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            We may update this Privacy Policy from time to time as BetMaxx
            evolves. When we make changes, we will update the &quot;Last
            updated&quot; date at the top of this page. In some cases, we may
            provide additional notice (such as a banner or in-app message).
          </Typography>
        </Stack>

        {/* 10. Contact */}
        <Stack spacing={1.5}>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            10. Contact Us
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            If you have any questions or concerns about this Privacy Policy, or
            if you would like to request data deletion or clarification, you can
            contact us at:
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            📩 <strong>support@betmaxx.app</strong>
          </Typography>
        </Stack>

        <Divider sx={{ borderColor: alpha("#FFFFFF", 0.16), mt: 3 }} />

        <Typography variant="caption" sx={{ opacity: 0.6 }}>
          This Privacy Policy is provided for informational purposes only and
          does not constitute legal advice.
        </Typography>
      </Stack>
    </Box>
  );
}
