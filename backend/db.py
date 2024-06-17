from flask import Flask, request, jsonify
from pymongo import MongoClient

app = Flask(__name__)

# Direct MongoDB Atlas connection string with password
MONGODB_CONNECTION_STRING = 'mongodb+srv://guylevy210:leguyvy210@clustertest.hkcqtoo.mongodb.net/'

# Initialize MongoDB client
client = MongoClient(MONGODB_CONNECTION_STRING)

# Select the database you want to use
db = client.get_database('CountryCity')

