const { MongoClient } = require('mongodb');

const MONGODB_CONNECTION_STRING = 'mongodb+srv://guylevy210:leguyvy210@clustertest.hkcqtoo.mongodb.net/';
const client = new MongoClient(MONGODB_CONNECTION_STRING);

async function connectToDb() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error(err);
    }
}

connectToDb();

// Export the database connection
const db = client.db('CountryCity');
module.exports = db;
