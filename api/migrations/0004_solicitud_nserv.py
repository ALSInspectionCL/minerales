# Generated by Django 5.1.1 on 2024-10-15 16:05

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_despacho_recepcion_nservicio_alter_recepcion_nlote_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='solicitud',
            name='nServ',
            field=models.ForeignKey( on_delete=django.db.models.deletion.CASCADE, to='api.servicio'),
            preserve_default=False,
        ),
    ]
