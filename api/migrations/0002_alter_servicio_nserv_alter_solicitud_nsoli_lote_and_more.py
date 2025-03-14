# Generated by Django 5.1.1 on 2024-10-10 15:41

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='servicio',
            name='nServ',
            field=models.IntegerField(unique=True),
        ),
        migrations.AlterField(
            model_name='solicitud',
            name='nSoli',
            field=models.IntegerField(unique=True),
        ),
        migrations.CreateModel(
            name='Lote',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nLote', models.IntegerField(unique=True)),
                ('fLote', models.DateField()),
                ('obs', models.CharField(max_length=200)),
                ('tipoTransporte', models.CharField(max_length=200)),
                ('cantCamiones', models.IntegerField()),
                ('cantVagones', models.IntegerField()),
                ('cantBigbag', models.IntegerField()),
                ('pesoBrutoHumedo', models.IntegerField()),
                ('pesoTara', models.IntegerField()),
                ('pesoNetoHumedo', models.IntegerField()),
                ('porcHumedad', models.IntegerField()),
                ('pesoNetoSeco', models.IntegerField()),
                ('diferenciaPeso', models.IntegerField()),
                ('servicio', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.servicio')),
                ('solicitud', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.solicitud')),
            ],
        ),
        migrations.CreateModel(
            name='Recepcion',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nRecepcion', models.IntegerField()),
                ('cantTransporte', models.IntegerField()),
                ('fOrigen', models.DateField()),
                ('hOrigen', models.TimeField()),
                ('idTransporteOrigen', models.IntegerField()),
                ('idCarro', models.IntegerField()),
                ('sellosOrigen', models.IntegerField()),
                ('netoHumedoOrigen', models.IntegerField()),
                ('idTransporteDestino', models.IntegerField()),
                ('idCarroDestino', models.IntegerField()),
                ('sellosDestino', models.IntegerField()),
                ('brutoDestino', models.IntegerField()),
                ('taraDestino', models.IntegerField()),
                ('netoHumedoDestino', models.IntegerField()),
                ('diferenciaHumeda', models.IntegerField()),
                ('diferenciaSeca', models.IntegerField()),
                ('nLote', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.lote')),
            ],
        ),
    ]
