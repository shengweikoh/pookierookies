# Generated by Django 5.1.4 on 2025-01-14 15:49

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("members", "0001_initial"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="member",
            options={"verbose_name_plural": "Members"},
        ),
        migrations.RenameField(
            model_name="member",
            old_name="member_id",
            new_name="memberId",
        ),
        migrations.AlterField(
            model_name="member",
            name="group",
            field=models.CharField(max_length=255),
        ),
        migrations.AlterField(
            model_name="member",
            name="name",
            field=models.CharField(max_length=255),
        ),
        migrations.AlterField(
            model_name="member",
            name="role",
            field=models.CharField(
                choices=[("head", "Head"), ("member", "Member")], max_length=50
            ),
        ),
    ]
