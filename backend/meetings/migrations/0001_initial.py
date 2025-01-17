# Generated by Django 5.1.4 on 2025-01-12 15:32

import uuid
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Meeting",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "meetingId",
                    models.UUIDField(default=uuid.uuid4, editable=False, unique=True),
                ),
                ("name", models.CharField(max_length=100)),
                ("agenda", models.TextField()),
                ("attendees", models.JSONField()),
                ("date_range", models.JSONField()),
                ("creation_date", models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]
