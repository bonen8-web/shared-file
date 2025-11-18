import os
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy #עוזר להתחבר מול SQL בצורה נוחה ופשוטה יותר
from flask_bcrypt import Bcrypt #מצפין את הסיסמה של היוזר
from flask_cors import CORS #חיבור לפרונט של ריאקט
from datetime import datetime # משמש לתאריך יום הולדת של חיית המחמד
from werkzeug.utils import secure_filename #נשתמש כדי לנקות שמות של קבצים בשביל אבטחה
import time #נשתמש כדי להוסיף TIMESTAMP על קובץ מסמך ששמרנו

app = Flask(__name__)
CORS(app) #מאפשר לדפדפן לפנות לשרת שלי
bcrypt = Bcrypt(app)

# Creates new folder to contains user documents
UPLOAD_FOLDER = 'static/uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

### Connection String:
DB_USER = "root"
DB_PASS = "Ss100200"
DB_HOST = "127.0.0.1"
DB_NAME = "MyPetTimeApp"

app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}/{DB_NAME}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)


########## Users:
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


########## Pets:
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
    documents = db.relationship('Document', backref='pet', lazy=True)


########## Tasks:
class Task(db.Model):
    __tablename__ = 'Tasks'
    
    task_id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    due_date = db.Column(db.DateTime, nullable=True)
    is_completed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.TIMESTAMP, server_default=db.func.current_timestamp())
    
    user_id = db.Column(db.Integer, db.ForeignKey('Users.user_id'), nullable = False)
    pet_id = db.Column(db.Integer, db.ForeignKey('Pets.pet_id'), nullable = True)


########## DogParks:
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
    

########## Documents:
class Document(db.Model):
    __tablename__ = 'Documents'
    
    doc_id = db.Column(db.Integer, primary_key = True)
    document_name = db.Column(db.String(255), nullable = False)
    file_url = db.Column(db.String(512), nullable = False)
    upload_date = db.Column(db.TIMESTAMP, server_default = db.func.current_timestamp())
    
    pet_id = db.Column(db.Integer, db.ForeignKey('Pets.pet_id'), nullable = False)

######################################################################################################################

##############################    API's   ##############################

###############   Register New User   ###############
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
    
    # Creating user object
    new_user = User(
        email = data['email'],
        password_hash = hashed_password,
        first_name = first_name,
        last_name = last_name  
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

###############   User Login   ###############
@app.route('/api/login', methods=['POST'])
def login_user():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()

    if user and bcrypt.check_password_hash(user.password_hash, data['password']):
        return jsonify({'status': 'success', 'message': f' Welcome!{user.first_name}!'}), 200

    return jsonify({'status': 'error', 'message': 'Error! Check your email or password'}), 401


###############   Create New Pet   ###############
    
@app.route('/api/pets', methods=['POST'])
def add_pet():
    data = request.get_json()
    
    #Check that the fields are not null
    if not data.get('user_id') or not data.get('name'):
        return jsonify({'status': 'error', 'message': 'Missing user_id or pet name'}), 400
    
    # Check if the user exists:
    user = User.query.get(data['user_id'])
    if not user:
        return jsonify({'status': 'error', 'message': 'User ID not found'}), 404
    

    # Converting date object from string to date format
    birth_date_obj = None
    if data.get('birth_date'):
        try:
            birth_date_obj = datetime.strptime(data['birth_date'], '%Y-%m-%d').date()

        except ValueError:
            return jsonify({'status': 'error', 'message': 'Invalid date format. Use YYYY-MM-DD'}), 400


    #  Creating pet object
    new_pet = Pet(
        user_id=data['user_id'],
        name=data['name'],
        species=data.get('species'),
        breed=data.get('breed'),
        gender=data.get('gender'),
        birth_date = birth_date_obj
    )
    

    # Add new pet to PETS table:
    try:
        db.session.add(new_pet)
        db.session.commit()
        return jsonify({
            'status': 'success', 
            'message': 'Pet added successfully!',
            'pet_id': new_pet.pet_id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500
    

###############   Get Pets Info By User_Id  ###############

@app.route ('/api/users/<int:user_id>/pets', methods = ['GET'])

def get_user_pets(user_id):
    user = User.query.get(user_id)

    # Check if the user exists:
    if not user:
        return jsonify({'status': 'error', 'message': 'User not found.'}), 404
        
    # Creating pets list:
    pets_list = []
    for pet in user.pets:
        pets_list.append({'id': pet.pet_id, 
                            'name': pet.name, 
                            'species': pet.species, 
                            'breed': pet.breed, 
                            'gender': pet.gender, 
                            'birth_date': str(pet.birth_date) if pet.birth_date else None})

    return jsonify({'status': 'success', 'pets': pets_list}), 200  


###############   Create New Task   ###############

@app.route('/api/tasks', methods=['POST'])
def add_task():
    data = request.get_json()
    
    #Check that the fields are not null
    if not data.get('user_id') or not data.get('title'):
        return jsonify({'status': 'error', 'message': 'Missing user_id or task title'}), 400
    
    # Check if the user exists:
    user = User.query.get(data['user_id'])
    if not user:
        return jsonify({'status': 'error', 'message': 'User ID not found'}), 404

    # Check if the pet exists:
    pet_id = data.get('pet_id')
    if pet_id:
        pet = Pet.query.get(pet_id)
        if not pet:
            return jsonify({'status': 'error', 'message': 'Pet ID not found'}), 404
    

    # Converting date object from string to date format
    due_date_obj = None
    if data.get('due_date'):
        try:
            due_date_obj = datetime.strptime(data['due_date'], '%Y-%m-%d').date()

        except ValueError:
            return jsonify({'status': 'error', 'message': 'Invalid date format. Use YYYY-MM-DD'}), 400
    

    # Creating task object
    new_task = Task(
        user_id = data['user_id'],
        pet_id = data.get('pet_id'),
        title = data['title'],
        description = data.get('description'),
        is_completed = data.get('is_completed', False),
        due_date = due_date_obj
    )
    
    
    # Add new task to TASKS table:
    try:
        db.session.add(new_task)
        db.session.commit()
        return jsonify({
            'status': 'success', 
            'message': 'Task added successfully!',
            'task_id': new_task.task_id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500
    

###############   Update Task   ###############

@app.route ('/api/tasks/<int:task_id>', methods = ['PUT'])
def update_task(task_id):
    
    # Check if the task exists:
    task = Task.query.get(task_id)

    if not task:
        return jsonify({'status': 'error', 'message': 'Task not found'}), 404
    
    
    #Checks if there is any change we need to update
    data = request.get_json()

    if 'title' in data:
        task.title = data['title']
    
    if 'description' in data:
        task.description = data['description']

    if 'due_date' in data:
        try:
            task.due_date = datetime.strptime(data['due_date'], '%Y-%m-%d')
        except ValueError:
            return jsonify({'status': 'error', 'message': 'Invalid date format. Use YYYY-MM-DD'}),400
        

    if 'is_completed' in data:
        task.is_completed = data['is_completed']

    
    try:
        db.session.commit()
        return jsonify({'status': 'success',
                        'message': 'Task updated successfully.',
                        'task': {'id': task.task_id,
                                 'title': task.title,
                                 'is_completed': task.is_completed}}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500


###############   Get Tasks Info By User ID   ###############

@app.route ('/api/users/<int:user_id>/tasks', methods = ['GET'])

def get_user_tasks(user_id):
    user = User.query.get(user_id)

    # Check if the user exists:
    if not user:
        return jsonify({'status': 'error', 'message': 'User not found.'}), 404
        
    # Creating tasks list:
    tasks_list = []
    for task in user.tasks:
        tasks_list.append({'id': task.task_id,
                           'pet_id': task.pet_id, 
                            'title': task.title, 
                            'description': task.description, 
                            'is_completed': task.is_completed, 
                            'due_date': str(task.due_date) if task.due_date else None})

    return jsonify({'status': 'success', 'tasks': tasks_list}), 200 


###############   Get Dogs Park Info Filtered By City   ###############

@app.route('/api/dog_parks', methods=['GET'])
def get_dog_parks():
    
    #Checks if the user want to filter dog parks by city or not
    city_filter = request.args.get('city')

    if city_filter:
        parks = DogPark.query.filter(DogPark.city.contains(city_filter)).all()
    else:
        parks = DogPark.query.all()
    

    #Create the dog parks list
    parks_list = []

    for park in parks:
        parks_list.append({'id': park.park_id,
                           'city': park.city,
                           'name': park.park_name,
                           'address': park.address,
                           'rating': float(park.rating) if park.rating else 0,
                           'notes': park.notes})
    
    return jsonify({'status': 'success', 'count': len(parks_list), 'parks': parks_list}), 200


###############   Upload Documents   ###############

@app.route('/api/upload_document', methods = ['POST'])
def upload_file():

    #Checks if there is any file that the user wants to upload
    if 'file' not in request.files:
        return jsonify({'status': 'error', 'message': 'There is no file'}), 400
    

    file = request.files['file']
    pet_id = request.form.get('pet_id')

    #Checks that the file has name AND the pet_is is valid
    if file.filename == '' or not pet_id:
        return jsonify({'status': 'error', 'message': 'No file or missing pet_id'}), 400
    
    #If file exists ----> Add timestamp to file name
    if file:
        original_filename = secure_filename(file.filename)
        uniqe_filename = f"{int(time.time())}_{original_filename}"

        #Save file
        full_path = os.path.join(app.config['UPLOAD_FOLDER'], uniqe_filename)
        file.save(full_path)

        #Save info in SQL DB - Documents table
        new_doc = Document(pet_id = pet_id,
                           document_name = original_filename,
                           file_url = f"/static/uploads/{uniqe_filename}")
        

        try:
            db.session.add(new_doc)
            db.session.commit()
            return jsonify({'status': 'success',
                            'message': 'File uploaded seccessfully.',
                            'file_url': new_doc.file_url}), 201
        
        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)}), 500
    
    return jsonify({'status': 'error', 'message': 'Something went wrong..'}), 500   


###############   Get List Of Documents By Pet ID   ###############

@app.route('/api/pets/<int:pet_id>/documents', methods = ['GET'])
def get_pet_documents(pet_id):

    # Check if the pet exists:
    pet = Pet.query.get(pet_id)
    
    if not pet:
        return jsonify({'status': 'error', 'message': 'Pet not found'}), 404
    

    #Create list of documents
    docs_list = []
    for doc in pet.documents:
        full_url = f"{request.host_url.rstrip('/')}{doc.file_url}"

        docs_list.append({'id': doc.doc_id,
                          'name': doc.document_name,
                          'url': full_url,
                          'upload_date': str(doc.upload_date) if doc.upload_date else None}) 
    
    return jsonify({'status': 'success',
                    'documents': docs_list}), 200




############################################################################################################################
    # Run server:
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=5000, debug=True)

############################################################################################################################