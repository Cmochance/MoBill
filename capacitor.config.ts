import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.mochan.billing",
  appName: "MoBill",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
};

export default config;
