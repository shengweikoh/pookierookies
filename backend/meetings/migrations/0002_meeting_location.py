# Generated by Django 5.1.4 on 2025-01-12 15:33

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("meetings", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="meeting",
            name="location",
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
