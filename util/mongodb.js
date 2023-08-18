import { MongoClient } from "mongodb";

const uri =
  process.env.NODE_ENV !== "production"
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
};

let client;

const getClient = async () => {
  if (!client) {
    client = new MongoClient(uri, options);
    try {
      await client.connect();
    } catch (error) {
      client = null;
      throw error;
    }
  } else if (!client.topology.isConnected()) {
    try {
      await client.connect();
    } catch (error) {
      client = null;
      throw error;
    }
  }

  return client;
};

const clientPromise = getClient();

export default clientPromise;
