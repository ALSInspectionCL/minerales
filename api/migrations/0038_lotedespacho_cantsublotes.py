# Generated by Django 5.1.1 on 2025-01-27 02:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0037_despachoembarque_lotedespacho_bodeganave_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='lotedespacho',
            name='cantSubLotes',
            field=models.IntegerField(blank=True, null=True),
        ),
    ]
