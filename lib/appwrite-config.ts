import { Client, Account, Databases, Teams, Storage } from "appwrite";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? "";
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? "";
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID ?? "";

// Collections IDs
export const COLLECTIONS = {
  ORGANIZATIONS:
    process.env.NEXT_PUBLIC_APPWRITE_ORGANIZATIONS_COLLECTION_ID ?? "",
  PROJECTS: process.env.NEXT_PUBLIC_APPWRITE_PROJECTS_COLLECTION_ID ?? "",
  CONTENT: process.env.NEXT_PUBLIC_APPWRITE_CONTENT_COLLECTION_ID ?? "",
  USERS: process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID ?? "",
  INTEGRATIONS:
    process.env.NEXT_PUBLIC_APPWRITE_INTEGRATIONS_COLLECTION_ID ?? "",
};
console.log(endpoint);
console.log(projectId);

const client = new Client().setEndpoint(endpoint).setProject(projectId);

const account = new Account(client);
const databases = new Databases(client);
const teams = new Teams(client);
const storage = new Storage(client);

export { client, account, databases, teams, storage, databaseId };
