# Use the official Python image
FROM python:3.10-slim

# Set the working directory
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt /app/

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the Django project files
COPY . /app/

# Expose the application port
EXPOSE 8080

# Set the command to run the Django development server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8080"]
