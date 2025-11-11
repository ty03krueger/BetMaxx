"use client";
import * as React from "react";
import {
  Card, CardContent, Table, TableHead, TableRow,
  TableCell, TableBody, Chip, Stack, Skeleton
} from "@mui/material";

type Props = {
  market: "Moneyline" | "Spread" | "Total";
};

export default function OddsTable({ market }: Props) {
  const rows = Array.from({ length: 3 });

  return (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Chip label={`NFL · ${market}`} color="primary" />
          <Chip label="Books: DK · FD · Caesars" variant="outlined" />
        </Stack>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Game</TableCell>
              <TableCell align="right">DraftKings</TableCell>
              <TableCell align="right">FanDuel</TableCell>
              <TableCell align="right">Caesars</TableCell>
              <TableCell align="right">Best (A)</TableCell>
              <TableCell align="right">Best (B)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton width={160} /></TableCell>
                <TableCell align="right"><Skeleton width={60} /></TableCell>
                <TableCell align="right"><Skeleton width={60} /></TableCell>
                <TableCell align="right"><Skeleton width={60} /></TableCell>
                <TableCell align="right"><Skeleton width={60} /></TableCell>
                <TableCell align="right"><Skeleton width={60} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
