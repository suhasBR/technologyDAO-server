const { MongoClient } = require("mongodb");

async function main() {
  /**
   * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
   * See https://docs.mongodb.com/drivers/node/ for more details
   */
  const uri =
    "mongodb+srv://suhasbr:orQApynvmxPTe6u0@projectmvp.iz6x5c1.mongodb.net/technologydao?authSource=admin&replicaSet=atlas-dq2ykm-shard-0&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=true";

  /**
   * The Mongo Client you will use to interact with your database
   * See https://mongodb.github.io/node-mongodb-native/3.6/api/MongoClient.html for more details
   * In case: '[MONGODB DRIVER] Warning: Current Server Discovery and Monitoring engine is deprecated...'
   * pass option { useUnifiedTopology: true } to the MongoClient constructor.
   * const client =  new MongoClient(uri, {useUnifiedTopology: true})
   */
  const client = new MongoClient(uri);

  try {
    // Connect to the MongoDB cluster
    await client.connect();

    // Make the appropriate DB calls
    const db = client.db("technologydao");
    const coll = db.collection("articles");

    await coll.updateMany(
      {  },
      [
        {
          '$addFields': {
            'cidURL':null
          }
        }
      ],
      { }
    );
  } finally {
    // Close the connection to the MongoDB cluster
    await client.close();
  }
}

main().catch(console.error);
