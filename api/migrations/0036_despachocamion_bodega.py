# Generated by Django 5.1.1 on 2025-01-21 15:48

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0035_remove_despachocamion_bodega'),
    ]

    operations = [
        migrations.AddField(
            model_name='despachocamion',
            name='bodega',
            field=models.ForeignKey( on_delete=django.db.models.deletion.CASCADE, to='api.bodega'),
            preserve_default=False,
        ),
    ]
