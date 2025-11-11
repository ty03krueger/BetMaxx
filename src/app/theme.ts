import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#f7d31fff" },  // BetMaxx green
    secondary: { main: "#f98911ff" },
    background: { default: "#0e1116", paper: "#151a21" },
  },
  typography: {
    h3: { fontWeight: 700 },
    fontFamily: [
      "Inter","system-ui","-apple-system","Segoe UI","Roboto",
      "Helvetica Neue","Arial","sans-serif",
    ].join(","),
  },
  shape: { borderRadius: 12 },
});

export default theme;
