from google.cloud import firestore

# Initialize Firestore client
db = firestore.Client()

def save_token_to_firestore(user_id, access_token, refresh_token, expiry_date):
    """Save or update the user's token in Firestore."""
    db.collection('user_tokens').document(user_id).set({
        'access_token': access_token,
        'refresh_token': refresh_token,
        'expiry_date': expiry_date
    })