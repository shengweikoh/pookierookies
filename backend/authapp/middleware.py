from firebase_admin import auth as firebase_auth
from django.http import JsonResponse

class FirebaseAuthenticationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        auth_header = request.headers.get('Authorization')
        if auth_header:
            try:
                token = auth_header.split(' ')[1]
                decoded_token = firebase_auth.verify_id_token(token)
                request.user = decoded_token  # Attach the user info to the request
            except Exception as e:
                return JsonResponse({'error': 'Invalid token'}, status=401)
        else:
            request.user = None
        return self.get_response(request)
