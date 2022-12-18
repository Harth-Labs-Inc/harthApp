import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;

// import { MongoClient } from "mongodb";
// import App from "next/app";

// export function connectToDatabase() {
//   const { MONGODB_URI, NODE_ENV } = process.env;
//   const options = {
//     useUnifiedTopology: true,
//     useNewUrlParser: true,
//   };

//   if (!App.db) {
//     App.client = new MongoClient(MONGODB_URI, options);
//     App.clientPromise = App.client.connect();
//   }
//   return new Promise((resolve) => {
//     async function callConnection() {
//       let db;
//       console.log("asking for db connetion");
//       if (!App.db) {
//         console.log("has to build new");
//         db = await App.clientPromise;
//         App.db = db;
//       } else {
//         db = App.db;
//         console.log("has existing");
//       }
//       resolve({ db: db.db("blarg") });
//     }
//     callConnection();
//   });
// }
// oldest
// import { MongoClient } from "mongodb";

// const { MONGODB_URI, MONGODB_DB } = process.env;

// if (!MONGODB_URI) {
//   throw new Error(
//     "Please define the MONGODB_URI environment variable inside .env.local"
//   );
// }

// if (!MONGODB_DB) {
//   throw new Error(
//     "Please define the MONGODB_DB environment variable inside .env.local"
//   );
// }

// let cached = global.mongo;

// if (!cached) {
//   cached = global.mongo = { conn: null, promise: null };
// }
// export async function connectToDatabase() {
//   return new Promise((resolve) => {
//     MongoClient.connect(
//       MONGODB_URI,
//       {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//       },
//       function (err, db) {
//         if (err) {
//           console.log(err, "mongo err");
//         }
//         resolve({ db: db.db("blarg") });
//       }
//     );
//   });
// }
// export async function connectToDatabase() {
//     if (cached.conn) {
//         return cached.conn;
//     }

//     if (!cached.promise) {
//         const opts = {
//             useNewUrlParser: true,
//             useUnifiedTopology: true,
//         };
//         console.log(MONGODB_URI, "MONGODB_URI");
//         cached.promise = MongoClient.connect(MONGODB_URI, opts).then(
//             (client) => {
//                 return {
//                     client,
//                     db: client.db(MONGODB_DB),
//                 };
//             }
//         );
//     }
//     cached.conn = await cached.promise;
//     return cached.conn;
// }
