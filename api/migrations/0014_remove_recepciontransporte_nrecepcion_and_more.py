# Generated by Django 5.1.1 on 2024-11-11 13:23

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0013_alter_loterecepcion_cantbigbag_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='recepciontransporte',
            name='nRecepcion',
        ),
        migrations.AddField(
            model_name='recepciontransporte',
            name='nServicio',
            field=models.ForeignKey(default=0, on_delete=django.db.models.deletion.CASCADE, to='api.servicio'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='recepciontransporte',
            name='tipoTransporte',
            field=models.CharField(default=0, max_length=20),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='recepciontransporte',
            name='brutoDestino',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='recepciontransporte',
            name='cantTransporte',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='recepciontransporte',
            name='diferenciaHumeda',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='recepciontransporte',
            name='diferenciaSeca',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='recepciontransporte',
            name='fOrigen',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='recepciontransporte',
            name='hOrigen',
            field=models.TimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='recepciontransporte',
            name='idCarro',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='recepciontransporte',
            name='idCarroDestino',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='recepciontransporte',
            name='idTransporteDestino',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='recepciontransporte',
            name='idTransporteOrigen',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='recepciontransporte',
            name='netoHumedoDestino',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='recepciontransporte',
            name='netoHumedoOrigen',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='recepciontransporte',
            name='sellosDestino',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='recepciontransporte',
            name='sellosOrigen',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='recepciontransporte',
            name='taraDestino',
            field=models.IntegerField(blank=True, null=True),
        ),
    ]
