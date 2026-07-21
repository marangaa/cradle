import { Config } from "@remotion/cli/config";

Config.setPublicDir("../../public");
Config.setEntryPoint("./src/index.ts");
Config.setStudioPort(3010);
Config.setCodec("h264");
Config.setPixelFormat("yuv420p");

