import os
from flask import Flask, jsonify, request
from sqlalchemy import orm
from flask_sqlalchemy import SQLAlchemy #עוזר להתחבר מול SQL בצורה נוחה ופשוטה יותר
from flask_bcrypt import Bcrypt #מצפין את הסיסמה של היוזר
from flask_cors import CORS #חיבור לפרונט של ריאקט
from datetime import datetime, timedelta, timezone # משמש לתאריך יום הולדת של חיית המחמד
from werkzeug.utils import secure_filename #נשתמש כדי לנקות שמות של קבצים בשביל אבטחה
import time #נשתמש כדי להוסיף TIMESTAMP על קובץ מסמך ששמרנו
import string #נשתמש כדי ליצור את הקוד החד פעמי לחיבור יוזר לחיה קיימת
import random #נשתמש כדי ליצור את הקוד החד פעמי לחיבור יוזר לחיה קיימת

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


########## PetOwners:
# Join between Users & Pets --> רבים לרבים

pet_owners = db.Table('PetOwners',
    db.Column('user_id', db.Integer, db.ForeignKey('Users.user_id'), primary_key=True),
    db.Column('pet_id', db.Integer, db.ForeignKey('Pets.pet_id'), primary_key=True)
)


########## Users:
class User(db.Model):
    __tablename__ = 'Users' 
    
    user_id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.TIMESTAMP, server_default=db.func.current_timestamp())
    
    pets = db.relationship('Pet',secondary = pet_owners, backref = 'owners', lazy = 'dynamic')
    tasks = db.relationship('Task', backref = 'creator', foreign_keys = '[Task.user_id]', lazy = True)
    assigned_tasks = db.relationship('Task', backref = 'assignee', foreign_keys = '[Task.assigned_user_id]', lazy = 'dynamic')


########## Pets:
class Pet(db.Model):
    __tablename__ = 'Pets'
    
    pet_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    species = db.Column(db.String(50))
    breed = db.Column(db.String(50))
    birth_date = db.Column(db.Date)
    gender = db.Column(db.Enum('Male', 'Female'), nullable=True)    
    
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
    assigned_user_id = db.Column(db.Integer, db.ForeignKey('Users.user_id'), nullable = True)
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


########## ShareCodes:

class ShareCode(db.Model):
    __tablename__ = 'ShareCodes'
    code_id = db.Column(db.Integer, primary_key = True)
    share_code = db.Column(db.String(10), unique = True, nullable = False)

    pet_id = db.Column(db.Integer, db.ForeignKey('Pets.pet_id'), nullable = False)
    creator_user_id = db.Column(db.Integer, db.ForeignKey('Users.user_id'), nullable = False)
    expires_at = db.Column(db.DateTime, nullable = False, default=datetime.utcnow)

    pet = db.relationship('Pet', backref = 'share_codes')
    creator = db.relationship('User', backref = 'generated_share_codes')

    def to_dict(self):
        return {
            'code_id': self.code_id,
            'share_code': self.share_code,
            'pet_id': self.pet_id,
            'expires_at': self.expires_at.isoformat()
        }


########## MedicalInfo:
# מידע רפואי לכל חיה - יחס 1:1 עם Pet

class MedicalInfo(db.Model):
    __tablename__ = 'MedicalInfo'
    
    medical_id = db.Column(db.Integer, primary_key=True)
    pet_id = db.Column(db.Integer, db.ForeignKey('Pets.pet_id'), unique=True, nullable=False)
    
    weight = db.Column(db.DECIMAL(5, 2), nullable=True)  # משקל בק"ג
    allergies = db.Column(db.Text, nullable=True)  # אלרגיות
    medications = db.Column(db.Text, nullable=True)  # תרופות נוכחיות
    conditions = db.Column(db.Text, nullable=True)  # מצבים רפואיים
    vet_name = db.Column(db.String(100), nullable=True)  # שם הווטרינר
    vet_phone = db.Column(db.String(20), nullable=True)  # טלפון הווטרינר
    last_checkup = db.Column(db.Date, nullable=True)  # בדיקה אחרונה
    next_checkup = db.Column(db.Date, nullable=True)  # בדיקה הבאה
    notes = db.Column(db.Text, nullable=True)  # הערות נוספות
    updated_at = db.Column(db.TIMESTAMP, server_default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())
    
    pet = db.relationship('Pet', backref=db.backref('medical_info', uselist=False))


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
        return jsonify({
            'status': 'success', 
            'message': f'Welcome {user.first_name}!',
            'user_id': user.user_id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email
        }), 200

    return jsonify({'status': 'error', 'message': 'Error! Check your email or password'}), 401


###############   Get User Info   ###############
@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user_info(user_id):
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'status': 'error', 'message': 'User not found'}), 404
    
    return jsonify({
        'status': 'success',
        'user': {
            'id': user.user_id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'created_at': str(user.created_at) if user.created_at else None
        }
    }), 200


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
        name = data['name'],
        species = data.get('species'),
        breed = data.get('breed'),
        gender = data.get('gender'),
        birth_date = birth_date_obj
    )
    

    # Add new pet to PETS table:
    try:
        user.pets.append(new_pet)
        db.session.add(user)
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
                            'birth_date': str(pet.birth_date) if pet.birth_date else None,
                            'is_owner': True})

    return jsonify({'status': 'success', 'pets': pets_list}), 200  


###############   Get Owners List By Pet_Id   ###############

@app.route('/api/pets/<int:pet_id>/owners', methods=['GET'])
def get_pet_owners(pet_id):
    pet = db.session.get(Pet, pet_id)

    
    # Check if the pet exists:
    if not pet:
        return jsonify({'status': 'error', 'message': 'Pet not found'}), 404
    
    #Creates owners list:
    owners_list = []
    for owner in pet.owners:
        owners_list.append({
            'user_id': owner.user_id,
            'first_name': owner.first_name,
            'email': owner.email,
        })

    return jsonify({
        'status': 'success',
        'pet_id': pet_id,
        'owners': owners_list
    }), 200

###############   Create New Task   ###############

@app.route('/api/tasks', methods=['POST'])
def add_task():
    data = request.get_json()

    creator_id = data.get('user_id')
    assigned_id = data.get('assigned_user_id')
    pet_id = data.get('pet_id')

    #Check that the fields are not null
    if not creator_id or not data.get('title'):
        return jsonify({'status': 'error', 'message': 'Missing user_id or task title'}), 400
    
    # Check if the user exists:
    user = db.session.get(User, creator_id)
    if not user:
        return jsonify({'status': 'error', 'message': 'Creator user ID not found'}), 404

   
    if pet_id:
        pet = db.session.get(Pet, pet_id)
        
         # Check if the pet exists:
        if not pet:
            return jsonify({'status': 'error', 'message': 'Pet ID not found'}), 404
        
         # Check if the pet belongs to the creator user:
        if pet not in user.pets:
            return jsonify({'status': 'error', 'message': 'Creator is not an owner of this pet. Access denied.'}), 403
        
         # Check if the pet belongs to the assigned user: 
        if assigned_id and assigned_id != creator_id:
            assignee = db.session.get(User, assigned_id)
            if not assignee or pet not in assignee.pets:
                return jsonify({'status': 'error', 'message': 'Assigned user ID is not an owner of this pet.'}), 403
    

    # Converting date object from string to date format
    due_date_obj = None
    if data.get('due_date'):
        try:
            due_date_obj = datetime.strptime(data['due_date'], '%Y-%m-%d').date()

        except ValueError:
            return jsonify({'status': 'error', 'message': 'Invalid date format. Use YYYY-MM-DD'}), 400
    

    # Creating task object
    new_task = Task(
        user_id = creator_id,
        assigned_user_id = assigned_id if assigned_id else creator_id,  #In case we dont have assigned user - the owner of this task will be the creator.
        pet_id = pet_id,
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
    tasks = Task.query.filter_by(assigned_user_id=user_id).all()

    tasks_list = []
    for task in tasks:
        # Get creator info
        creator = User.query.get(task.user_id)
        creator_name = creator.first_name if creator else 'Unknown'
        
        tasks_list.append({
            'id': task.task_id,
            'assigned_to_id': task.assigned_user_id,
            'created_by_id': task.user_id,
            'created_by_name': creator_name,
            'pet_id': task.pet_id, 
            'title': task.title,
            'description': task.description, 
            'is_completed': task.is_completed, 
            'due_date': str(task.due_date) if task.due_date else None
        })

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
        unique_filename = f"{int(time.time())}_{original_filename}"

        #Save file
        full_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(full_path)

        #Save info in SQL DB - Documents table
        new_doc = Document(pet_id = pet_id,
                           document_name = original_filename,
                           file_url = f"/static/uploads/{unique_filename}")
        

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

    #Check if the pet exists:
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



###############   Generate Share Code   ###############

### Generating Code:
def generate_unique_code(length=6):
   
    characters = string.ascii_uppercase + string.digits

    while True:
        code = ''.join(random.choice(characters) for _ in range(length))

        #Make sure this code dosent exsists
        if not ShareCode.query.filter_by(share_code=code).first():
            return code

@app.route('/api/pets/generate_code', methods=['POST'])
def generate_share_code():
    data = request.get_json()
    user_id = data.get('user_id')
    pet_id = data.get('pet_id')
    
    #Check that the fields are not null:
    if not user_id or not pet_id:
        return jsonify({'status': 'error', 'message': 'Missing user_id or pet_id'}), 400

    user = User.query.get(user_id)
    pet = Pet.query.get(pet_id)

    #Check if the user & pet exists:
    if not user or not pet:
        return jsonify({'status': 'error', 'message': 'User or Pet not found'}), 404
    
    #Checks that the user is the owner of this pet:
    if pet not in user.pets:
         return jsonify({'status': 'error', 'message': 'User is not an owner of this pet. Cannot share.'}), 403

    #Generating the code
    code = generate_unique_code(length=6)
    
    #Create expiry date:
    expiry_time = datetime.utcnow() + timedelta(hours=48)
    
    #Save info in SQL DB - ShareCodes table
    new_share_code = ShareCode(
        pet_id=pet_id,
        creator_user_id=user_id,
        share_code=code,
        expires_at=expiry_time
    )

    try:
        db.session.add(new_share_code)
        db.session.commit()
        
        return jsonify({
            'status': 'success', 
            'message': 'Share code generated successfully!',
            'share_code': code,
            'expires_at': expiry_time.isoformat()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500
    

###############   Join User To Be A Pet Owner Using Share Code   ###############

@app.route('/api/pets/join_by_code', methods=['POST'])
def join_pet_by_code():
    data = request.get_json()
    
    user_id = data.get('user_id')
    share_code = data.get('share_code')

    
    #Check that the fields are not null:
    if not user_id or not share_code:
        return jsonify({'status': 'error', 'message': 'User or Code not found'}), 400
    
    
    #Check if the user & pet exists:
    user_to_join = User.query.get(user_id)
    if not user_to_join:
        return jsonify({'status': 'error', 'message': 'Joining user not found'}), 404
    
    #Check that Share Code exsists in DB
    share_record = ShareCode.query.filter_by(share_code = share_code).first()

    if not share_record:
        return jsonify({'status': 'error', 'message': 'Invalid share code'}), 404
    
    #Checks that the code is not expired - If it is = delete it.
    if share_record.expires_at < datetime.utcnow():
        db.session.delete(share_record)
        db.session.commit()
        return jsonify({'status': 'error', 'message': 'Share code has expired'}), 400
    

    pet_to_link = Pet.query.get(share_record.pet_id)

    #Checks if the new user is already linked to this pet:
    if pet_to_link in user_to_join.pets:

        try:
            db.session.delete(share_record)
            db.session.commit()
        except:
             pass
             
        return jsonify({
            'status': 'error', 
            'message': f'You are already an owner of {pet_to_link.name}.'
        }), 400
    
    try:
        # Add new pet to PetOwners table and delete the share code we just used:
        user_to_join.pets.append(pet_to_link)
        db.session.delete(share_record)
        db.session.add(user_to_join)
        db.session.commit()
        
        return jsonify({
            'status': 'success', 
            'message': f'{user_to_join.first_name} is now a co-owner of {pet_to_link.name}!'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500

###############   Get Medical Info By Pet ID   ###############

@app.route('/api/pets/<int:pet_id>/medical-info', methods=['GET'])
def get_medical_info(pet_id):
    # Check if the pet exists:
    pet = Pet.query.get(pet_id)
    if not pet:
        return jsonify({'status': 'error', 'message': 'Pet not found'}), 404
    
    # Get medical info for this pet:
    medical = MedicalInfo.query.filter_by(pet_id=pet_id).first()
    
    if not medical:
        # Return empty medical info if none exists
        return jsonify({
            'status': 'success',
            'medical_info': None,
            'message': 'No medical info recorded yet'
        }), 200
    
    return jsonify({
        'status': 'success',
        'medical_info': {
            'pet_id': medical.pet_id,
            'weight': float(medical.weight) if medical.weight else None,
            'allergies': medical.allergies,
            'medications': medical.medications,
            'conditions': medical.conditions,
            'vet_name': medical.vet_name,
            'vet_phone': medical.vet_phone,
            'last_checkup': str(medical.last_checkup) if medical.last_checkup else None,
            'next_checkup': str(medical.next_checkup) if medical.next_checkup else None,
            'notes': medical.notes,
            'updated_at': str(medical.updated_at) if medical.updated_at else None
        }
    }), 200


###############   Update Medical Info By Pet ID   ###############

@app.route('/api/pets/<int:pet_id>/medical-info', methods=['PUT'])
def update_medical_info(pet_id):
    # Check if the pet exists:
    pet = Pet.query.get(pet_id)
    if not pet:
        return jsonify({'status': 'error', 'message': 'Pet not found'}), 404
    
    data = request.get_json()
    
    # Get existing medical info or create new one:
    medical = MedicalInfo.query.filter_by(pet_id=pet_id).first()
    
    if not medical:
        medical = MedicalInfo(pet_id=pet_id)
        db.session.add(medical)
    
    # Update fields if provided:
    if 'weight' in data:
        medical.weight = data['weight'] if data['weight'] else None
    
    if 'allergies' in data:
        medical.allergies = data['allergies']
    
    if 'medications' in data:
        medical.medications = data['medications']
    
    if 'conditions' in data:
        medical.conditions = data['conditions']
    
    if 'vet_name' in data:
        medical.vet_name = data['vet_name']
    
    if 'vet_phone' in data:
        medical.vet_phone = data['vet_phone']
    
    if 'last_checkup' in data:
        if data['last_checkup']:
            try:
                medical.last_checkup = datetime.strptime(data['last_checkup'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'status': 'error', 'message': 'Invalid date format for last_checkup. Use YYYY-MM-DD'}), 400
        else:
            medical.last_checkup = None
    
    if 'next_checkup' in data:
        if data['next_checkup']:
            try:
                medical.next_checkup = datetime.strptime(data['next_checkup'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'status': 'error', 'message': 'Invalid date format for next_checkup. Use YYYY-MM-DD'}), 400
        else:
            medical.next_checkup = None
    
    if 'notes' in data:
        medical.notes = data['notes']
    
    try:
        db.session.commit()
        return jsonify({
            'status': 'success',
            'message': 'Medical info updated successfully!',
            'medical_info': {
                'pet_id': medical.pet_id,
                'weight': float(medical.weight) if medical.weight else None,
                'allergies': medical.allergies,
                'medications': medical.medications,
                'conditions': medical.conditions,
                'vet_name': medical.vet_name,
                'vet_phone': medical.vet_phone,
                'last_checkup': str(medical.last_checkup) if medical.last_checkup else None,
                'next_checkup': str(medical.next_checkup) if medical.next_checkup else None,
                'notes': medical.notes
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500


############################################################################################################################
    # Run server:
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=5000, debug=True)

############################################################################################################################
