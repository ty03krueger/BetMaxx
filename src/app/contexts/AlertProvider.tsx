"use client";
import React, { createContext, useContext, useState } from "react";
import { Snackbar, Alert } from "@mui/material";

type AlertType = "success" | "error" | "warning" | "info";

type AlertState = {
  open: boolean;
  message: string;
  type: AlertType;
};

const AlertContext = createContext<{
  setAlert: (a: AlertState) => void;
}>({
  setAlert: () => {},
});

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alert, setAlertState] = useState<AlertState>({
    open: false,
    message: "",
    type: "info",
  });

  const setAlert = (payload: AlertState) => {
    setAlertState(payload);
  };

  return (
    <AlertContext.Provider value={{ setAlert }}>
      {children}
      <Snackbar
        open={alert.open}
        autoHideDuration={2800}
        onClose={() => setAlertState({ ...alert, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={alert.type}
          variant="filled"
          onClose={() => setAlertState({ ...alert, open: false })}
          sx={{
            fontWeight: 700,
            borderRadius: 2,
            bgcolor:
              alert.type === "success"
                ? "rgba(76,175,80,0.25)"
                : alert.type === "error"
                ? "rgba(255,82,82,0.25)"
                : alert.type === "warning"
                ? "rgba(255,193,7,0.25)"
                : "rgba(33,150,243,0.25)",
            color: "#fff",
            backdropFilter: "blur(6px)",
          }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </AlertContext.Provider>
  );
}

export function useAlert() {
  return useContext(AlertContext);
}
