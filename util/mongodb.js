import { MongoClient } from "mongodb";
import { resolve } from "styled-jsx/css";

const { MONGODB_URI, MONGODB_DB } = process.env;

if (!MONGODB_URI) {
    throw new Error(
        "Please define the MONGODB_URI environment variable inside .env.local"
    );
}

if (!MONGODB_DB) {
    throw new Error(
        "Please define the MONGODB_DB environment variable inside .env.local"
    );
}

let cached = global.mongo;

if (!cached) {
    cached = global.mongo = { conn: null, promise: null };
}
export async function connectToDatabase() {
    return new Promise((resolve) => {
        MongoClient.connect(
            MONGODB_URI,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            },
            function (err, db) {
                if (err) {
                    console.log(err, "mongo err");
                }
                resolve(db);
            }
        );
    });
}
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
