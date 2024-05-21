import { Platform } from "react-native";

// Address to stripe server running on local machine
const LOCAL_URL =
  Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000";
// Address to stripe server running on Glitch
const GLITCH_URL = "https://rigorous-heartbreaking-cephalopod.glitch.me";

export const API_URL = __DEV__ ? LOCAL_URL : GLITCH_URL;
