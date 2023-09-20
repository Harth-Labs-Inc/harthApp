import clientPromise from "./mongodb";

const getClientWithCheck = async (promise) => {
  try {
    const client = await promise;
    if (client?.topology?.isConnected()) {
      return client;
    }
    return await clientPromise;
  } catch (error) {
    console.log("Error occurred. Returning a new client.", error);
    return await clientPromise;
  }
};

export default getClientWithCheck;
