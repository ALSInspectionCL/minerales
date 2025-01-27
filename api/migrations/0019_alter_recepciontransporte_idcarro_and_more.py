# Generated by Django 5.1.1 on 2024-11-13 17:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0018_alter_lote_porchumedad_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='recepciontransporte',
            name='idCarro',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
        migrations.AlterField(
            model_name='recepciontransporte',
            name='idCarroDestino',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
        migrations.AlterField(
            model_name='recepciontransporte',
            name='idTransporteDestino',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
        migrations.AlterField(
            model_name='recepciontransporte',
            name='sellosDestino',
            field=models.CharField(default=0, max_length=200),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='recepciontransporte',
            name='sellosOrigen',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
    ]
