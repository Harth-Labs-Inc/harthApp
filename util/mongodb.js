import { MongoClient } from "mongodb";

const uri =
  process.env.NODE_ENV !== "production" || process.env.IS_QA_ENV === "true"
    ? process.env.MONGODB_URI_QA
    : process.env.MONGODB_URI;

if (!uri) {
  throw new Error(
    "Invalid/Missing environment variable: 'MONGODB_URI' or 'MONGODB_URI_QA'"
  );
}

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 2000,
};

let client;

const connectClient = async (retries = 2) => {
  if (client && client.topology?.isConnected()) {
    return client;
  }

  if (client && !client.topology.isConnected()) {
    await client.close();
    client = null;
  }

  client = new MongoClient(uri, options);

  try {
    await client.connect();
    return client;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);

    if (client) {
      await client.close();
      client = null;
    }

    if (retries > 0) {
      await new Promise((res) => setTimeout(res, 1500));
      return connectClient(retries - 1);
    }

    throw error;
  }
};

const clientPromise = connectClient();

export default clientPromise;
