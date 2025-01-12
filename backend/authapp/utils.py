from firebase_admin import firestore

db = firestore.client()

def create_user_profile(user_id, email):
    name = email.split('@')[0]
    db.collection('profiles').document(user_id).set({
        'userId': user_id,
        'name': name,
        'email': email,
    })