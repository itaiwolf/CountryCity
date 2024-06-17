from flask import Flask, render_template, request, jsonify
from pymongo import MongoClient
from flask_cors import CORS
import logging

app = Flask(__name__)
CORS(app)

client = MongoClient('mongodb+srv://guylevy210:leguyvy210@clustertest.hkcqtoo.mongodb.net/')
db = client['CountryCity']
collection = db['country']

logging.basicConfig(level=logging.DEBUG)

@app.route('/checkvalid', methods=['GET'])
def check_valid():

    collection_name = request.args.get('collection')
    field = request.args.get('field')
    value = request.args.get('value')
    
    logging.debug(f"Collection: {collection_name}, Field: {field}, Value: {value}")

    if not all([collection_name, field, value]):
        return jsonify({'error': 'Missing data in request'}), 400
    
    collection = db[collection_name]
    query = {field : value}
    result = collection.find_one(query)
    
    if result:
        return jsonify({'valid': True})
    else:
        return jsonify({'valid': False})

@app.route('/')
def home():
   return render_template('templates/homePage.html')

@app.route('/play')
def play():
    return render_template('templates/play.html')


if __name__ == "__main__":
    app.run()