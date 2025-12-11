import sys
import os

# הוסף את תיקיית הפרויקט ל-Python path
sys.path.insert(0, os.path.dirname(__file__))

# ייבוא האפליקציה מ-app.py
from app import app as application

# זה נדרש עבור Passenger ב-cPanel

