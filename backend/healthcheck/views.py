from django.http import JsonResponse
from django.db import connection

def health_check(request):
    # Create a dictionary to store the health status
    health_status = {}

    # Check database connectivity
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        health_status['database'] = 'OK'
    except Exception as e:
        health_status['database'] = f'ERROR: {str(e)}'

    # Add other checks (e.g., external API, cache) as needed
    # Example:
    # health_status['external_api'] = check_external_api()
    # health_status['cache'] = check_cache()

    # Return a response
    overall_status = 'OK' if all(v == 'OK' for v in health_status.values()) else 'ERROR'
    return JsonResponse({'status': overall_status, 'details': health_status})