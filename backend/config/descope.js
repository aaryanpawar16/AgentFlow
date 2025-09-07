import DescopeClient from "@descope/node-sdk";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.DESCOPE_PROJECT_ID) {
  throw new Error("❌ Missing DESCOPE_PROJECT_ID in .env file");
}

const descope = DescopeClient({ projectId: process.env.DESCOPE_PROJECT_ID });

export default descope;
