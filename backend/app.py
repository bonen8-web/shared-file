import os
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy #עוזר להתחבר מול SQL בצורה נוחה ופשוטה יותר
from flask_bcrypt import Bcrypt #מצפין את הסיסמה של היוזר
from flask_cors import CORS #חיבור לפרונט של ריאקט

app = Flask(__name__)
CORS(app) #מאפשר לדפדפן לפנות לשרת שלי
bcrypt = Bcrypt(app)

# Connection String:
DB_USER = "root"
DB_PASS = "Ss100200"
DB_HOST = "127.0.0.1"
DB_NAME = "MyPetTimeApp"

app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}/{DB_NAME}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)


# Users:
class User(db.Model):
    __tablename__ = 'Users' 
    
    user_id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.TIMESTAMP, server_default=db.func.current_timestamp())
    
    pets = db.relationship('Pet', backref='owner', lazy=True)
    tasks = db.relationship('Task', backref='owner', lazy=True)


# Pets:
class Pet(db.Model):
    __tablename__ = 'Pets'
    
    pet_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    species = db.Column(db.String(50))
    breed = db.Column(db.String(50))
    birth_date = db.Column(db.Date)
    gender = db.Column(db.Enum('Male', 'Female'), nullable=True)
    
    user_id = db.Column(db.Integer, db.ForeignKey('Users.user_id'), nullable=False)
    
    
    tasks = db.relationship('Task', backref='pet', lazy=True)


# Tasks:
class Task(db.Model):
    __tablename__ = 'Tasks'
    
    task_id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    due_date = db.Column(db.DateTime, nullable=True)
    is_completed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.TIMESTAMP, server_default=db.func.current_timestamp())
    
    user_id = db.Column(db.Integer, db.ForeignKey('Users.user_id'), nullable=False)
    pet_id = db.Column(db.Integer, db.ForeignKey('Pets.pet_id'), nullable=True)


# DogParks:
class DogPark(db.Model):
    __tablename__ = 'DogParks'
    
    park_id = db.Column(db.Integer, primary_key=True)
    city = db.Column(db.String(100), nullable=False)
    park_name = db.Column(db.String(150), nullable=False)
    address = db.Column(db.String(255))
    rating = db.Column(db.DECIMAL(2, 1), nullable=True)
    notes = db.Column(db.Text)
    

# Try to connect to server. Testing DogPark table:
@app.route('/api/test_db_connection')
def test_db():
    print("!!!!!! --- בדיקה חדשה, הגעתי לפונקציית TEST_DB --- !!!!!!")
    try:
        park_count = db.session.query(DogPark).count()
        return jsonify({
            'status': 'success',
            'message': f"החיבור ל-DB הצליח! יש {park_count} גינות כלבים בטבלה."
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f"החיבור ל-DB נכשל: {str(e)}"
        }), 500

######################################################################################################################

#API's:

######## Register New User ########
@app.route('/api/register', methods=['POST'])
def register_user():
    data = request.get_json()
    
    # Check if the user exists:
    existing_user = User.query.filter_by(email=data['email']).first()
    if existing_user:
        return jsonify({'status': 'error', 'message': 'Email already exists'}), 400
    
    # Encrypt Password
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    
    
    first_name = data['first_name']
    last_name = data.get('last_name') 
    
    new_user = User(
        email=data['email'],
        password_hash=hashed_password,
        first_name=first_name,
        last_name=last_name  
    )
    
    # Add new user to USERS table:
    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({
            'status': 'success',
            'message': f'User {new_user.email} created successfully!',
            'user_id': new_user.user_id
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500

######## User Login ########
@app.route('/api/login', methods=['POST'])
def login_user():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()

    if user and bcrypt.check_password_hash(user.password_hash, data['password']):
        return jsonify({'status': 'success', 'message': f' Welcome!{user.first_name}!'}), 200

    return jsonify({'status': 'error', 'message': 'Error! Check your email or password'}), 401
    
############################################################################################################################
    # Run server:
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)

############################################################################################################################