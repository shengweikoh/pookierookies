from firebase_admin import firestore

db = firestore.client()

def create_admin_profile(user_id, email, name):
    # Reference to the document in the "profiles" collection
    profile_ref = db.collection('profiles').document(user_id)

    # Check if the document already exists
    if profile_ref.get().exists:
        print(f"Admin profile already exists for user: {email} (UID: {user_id})")
        return  # Do not create another document if it already exists

    # If it doesn't exist, create the document
    profile_ref.set({
        'userId': user_id,
        'name': name,
        'email': email
    })
    print(f"Admin profile created for user: {email} (UID: {user_id})")

def create_user_profile(user_id, email, name):
    # Reference to the document in the "users" collection
    user_ref = db.collection('users').document(user_id)

    # Check if the document already exists
    if user_ref.get().exists:
        print(f"User profile already exists for user: {email} (UID: {user_id})")
        return  # Do not create another document if it already exists

    # If it doesn't exist, create the document
    user_ref.set({
        'userId': user_id,
        'name': name,
        'email': email
    })
    print(f"User profile created for user: {email} (UID: {user_id})")