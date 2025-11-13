// src/app/terms/page.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  Link as MUILink,
} from "@mui/material";
import { alpha } from "@mui/material/styles";

export default function TermsPage() {
  return (
    <Box
      sx={{
        minHeight: "70vh",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        px: 2,
        py: 6,
      }}
    >
      <Card
        variant="outlined"
        sx={{
          maxWidth: 900,
          width: "100%",
          borderRadius: 4,
          backgroundColor: alpha("#FFFFFF", 0.03),
          border: `1px solid ${alpha("#FFFFFF", 0.1)}`,
          backdropFilter: "blur(10px)",
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={2.5}>
            {/* Header */}
            <Stack spacing={0.5}>
              <Typography
                variant="overline"
                sx={{ letterSpacing: 2, opacity: 0.8 }}
              >
                BetMaxx
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, lineHeight: 1.1 }}>
                Terms of Use
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                Last updated: November 12, 2025
              </Typography>
            </Stack>

            {/* Intro */}
            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              These Terms of Use (&quot;Terms&quot;) govern your access to and use of
              the BetMaxx website, products, and services (collectively, the
              &quot;Service&quot;). By accessing or using BetMaxx, you agree to be
              bound by these Terms. If you do not agree, you may not use the
              Service.
            </Typography>

            <Section title="1. No Wagering or Financial Advice">
              <Bullet>
                BetMaxx is an{" "}
                <strong>odds comparison and information tool only</strong>. We do
                not accept, manage, or settle bets, and we are not a sportsbook,
                casino, or bookmaker.
              </Bullet>
              <Bullet>
                Nothing on BetMaxx is, or should be taken as,{" "}
                <strong>financial, investment, or betting advice</strong>. Any
                decisions you make based on information from the Service are made
                solely at your own risk.
              </Bullet>
              <Bullet>
                You are solely responsible for ensuring that any betting activity
                you engage in is lawful in your jurisdiction and that you comply
                with all applicable laws and regulations.
              </Bullet>
            </Section>

            <Section title="2. Eligibility">
              <Bullet>
                BetMaxx is intended for users who are{" "}
                <strong>at least 18 years old</strong>, and in some jurisdictions
                you may be required to be 21 or older to legally place bets with
                third-party sportsbooks. By using the Service, you represent and
                warrant that you meet the age requirements in your jurisdiction.
              </Bullet>
              <Bullet>
                You may not use the Service if doing so is prohibited by the laws
                of your country, state, or region.
              </Bullet>
            </Section>

            <Section title="3. Third-Party Sportsbooks & Links">
              <Bullet>
                BetMaxx may display odds, lines, logos, and links from{" "}
                <strong>third-party sportsbooks</strong>. These third parties are
                not controlled by BetMaxx.
              </Bullet>
              <Bullet>
                When you click through to a sportsbook, you leave BetMaxx and are
                subject to that sportsbook&apos;s own terms, rules, and privacy
                policies. We do not endorse, guarantee, or assume responsibility
                for any content, products, or services offered by third parties.
              </Bullet>
              <Bullet>
                Any promotions, bonuses, or offers shown via BetMaxx are{" "}
                <strong>subject to change</strong> and may differ from what is
                shown once you land on the sportsbook.
              </Bullet>
            </Section>

            <Section title="4. Accuracy of Information">
              <Bullet>
                We aim to provide timely, accurate odds and market information,
                but <strong>we do not guarantee</strong> that any data on the
                Service is complete, correct, or up to date.
              </Bullet>
              <Bullet>
                Odds and lines can move rapidly. Always{" "}
                <strong>verify current odds directly on the sportsbook</strong>{" "}
                before placing any bet.
              </Bullet>
              <Bullet>
                BetMaxx will not be liable for any loss or damage arising from
                reliance on information obtained via the Service.
              </Bullet>
            </Section>

            <Section title="5. User Accounts">
              <Bullet>
                If you create an account, you are responsible for maintaining the{" "}
                <strong>confidentiality of your login credentials</strong> and for
                all activity that occurs under your account.
              </Bullet>
              <Bullet>
                You agree to provide accurate information and to notify us of any
                unauthorized use of your account or other security breach.
              </Bullet>
            </Section>

            <Section title="6. Acceptable Use">
              <Bullet>You agree not to:</Bullet>
              <Bullet indent>
                • Use the Service for any illegal or unauthorized purpose;
              </Bullet>
              <Bullet indent>
                • Attempt to scrape, harvest, or reverse-engineer the Service in
                violation of our or third-party providers&apos; terms;
              </Bullet>
              <Bullet indent>
                • Interfere with or disrupt the operation of the Service, servers,
                or networks;
              </Bullet>
              <Bullet indent>
                • Use BetMaxx in any way that could damage, disable, or impair the
                Service or anyone else&apos;s experience.
              </Bullet>
            </Section>

            <Section title="7. Intellectual Property">
              <Bullet>
                The BetMaxx name, logo, design, and all original content on the
                Service are{" "}
                <strong>
                  owned by or licensed to BetMaxx and protected by IP laws
                </strong>
                .
              </Bullet>
              <Bullet>
                You may not copy, modify, distribute, or create derivative works
                from the Service&apos;s content except as allowed by law or with
                our prior written consent.
              </Bullet>
            </Section>

            <Section title="8. Disclaimer of Warranties">
              <Bullet>
                The Service is provided on an{" "}
                <strong>&quot;AS IS&quot; and &quot;AS AVAILABLE&quot;</strong>{" "}
                basis, without warranties of any kind, whether express or implied.
              </Bullet>
              <Bullet>
                To the fullest extent permitted by law, BetMaxx disclaims all
                warranties, including but not limited to implied warranties of
                merchantability, fitness for a particular purpose, and
                non-infringement.
              </Bullet>
            </Section>

            <Section title="9. Limitation of Liability">
              <Bullet>
                To the maximum extent allowed by law, BetMaxx and its owners,
                affiliates, and partners will{" "}
                <strong>
                  not be liable for any indirect, incidental, special, or
                  consequential damages
                </strong>{" "}
                arising out of or in connection with your use of the Service.
              </Bullet>
              <Bullet>
                Your sole and exclusive remedy for dissatisfaction with the
                Service is to stop using BetMaxx.
              </Bullet>
            </Section>

            <Section title="10. Changes to These Terms">
              <Bullet>
                We may update these Terms from time to time. When we do, we will
                update the &quot;Last updated&quot; date above.{" "}
              </Bullet>
              <Bullet>
                Your continued use of the Service after changes take effect
                constitutes your acceptance of the revised Terms.
              </Bullet>
            </Section>

            <Section title="11. Contact">
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                If you have questions about these Terms or BetMaxx in general,
                you can reach us at{" "}
                <MUILink
                  href="mailto:support@betmaxx.app"
                  underline="hover"
                  sx={{ fontWeight: 500 }}
                >
                  support@betmaxx.app
                </MUILink>{" "}
                (placeholder email).
              </Typography>
            </Section>

            {/* Back link */}
            <Box sx={{ pt: 2 }}>
              <MUILink
                component={Link}
                href="/"
                underline="hover"
                sx={{ fontSize: 14 }}
              >
                ← Back to Home
              </MUILink>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Stack spacing={0.75}>
      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
        {title}
      </Typography>
      <Stack spacing={0.5}>{children}</Stack>
    </Stack>
  );
}

function Bullet({
  children,
  indent,
}: {
  children: React.ReactNode;
  indent?: boolean;
}) {
  return (
    <Stack direction="row" spacing={1} sx={{ pl: indent ? 2 : 0 }}>
      {!indent && (
        <Box
          sx={{
            mt: "7px",
            width: 4,
            height: 4,
            borderRadius: "50%",
            backgroundColor: "#FFD600",
            flexShrink: 0,
          }}
        />
      )}
      <Typography variant="body2" sx={{ opacity: 0.85 }}>
        {children}
      </Typography>
    </Stack>
  );
}
