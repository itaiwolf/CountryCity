from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def home():
   return "Welcome to the Home Page!"

@app.route('/play')
def play():
    return render_template('play.html')


if __name__ == "__main__":
    app.run()