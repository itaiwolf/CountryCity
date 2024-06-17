from flask import Flask, render_template
from backend.db import app, db

app = Flask(__name__)

@app.route('/')
def home():
   return "Welcome to the Home Page!"

@app.route('/play')
def play():
    return render_template('play.html')

@app.route('/countries')
def home():
    try:
        print ("Welcome to the Flask MongoDB Atlas connection example!")
        # Access the 'country' collection
        collection = db.country
        
        # Retrieve all documents from the collection
        countries = collection.find()
        
        # Convert documents to a list and serialize ObjectId to string
        country_list = []
        for country in countries:
            country['_id'] = str(country['_id'])  # Convert ObjectId to string
            country_list.append(country)
        
        return jsonify(country_list)
    except Exception as e:
        return jsonify({"error": str(e)}), 500    

if __name__ == "__main__":
    app.run()

