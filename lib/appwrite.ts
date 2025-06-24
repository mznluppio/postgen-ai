import { Client, Account, Databases } from "appwrite";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? "";
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? "";

const client = new Client().setEndpoint(endpoint).setProject(projectId);

const account = new Account(client);
const databases = new Databases(client);

export { client, account, databases };
