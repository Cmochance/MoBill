import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.mochan.billing",
  appName: "墨风记账",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
};

export default config;
