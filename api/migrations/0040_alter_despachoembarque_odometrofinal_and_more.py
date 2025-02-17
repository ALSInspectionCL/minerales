# Generated by Django 5.1.1 on 2025-01-27 02:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0039_alter_despachoembarque_fechafinal_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='despachoembarque',
            name='odometroFinal',
            field=models.DecimalField(decimal_places=2, max_digits=10),
        ),
        migrations.AlterField(
            model_name='despachoembarque',
            name='odometroInicial',
            field=models.DecimalField(decimal_places=2, max_digits=10),
        ),
        migrations.AlterField(
            model_name='despachoembarque',
            name='pesoLote',
            field=models.DecimalField(decimal_places=2, max_digits=10),
        ),
        migrations.AlterField(
            model_name='despachoembarque',
            name='porcHumedad',
            field=models.DecimalField(decimal_places=2, max_digits=10),
        ),
    ]
