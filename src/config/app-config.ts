import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Platform Office Console",
  version: packageJson.version,
  copyright: `© ${currentYear}, BIGDROPS Platform Office.`,
  meta: {
    title: "Platform Office Console - BIGDROPS Operations Console",
    description: "Platform Office Console is a mobile-first operations control plane for BIGDROPS platform operators.",
  },
};
