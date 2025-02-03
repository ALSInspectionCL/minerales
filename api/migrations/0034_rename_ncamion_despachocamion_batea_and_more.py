# Generated by Django 5.1.1 on 2025-01-21 15:36

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0033_alter_recepciontransporte_brutodestino_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='despachocamion',
            old_name='nCamion',
            new_name='batea',
        ),
        migrations.RenameField(
            model_name='despachocamion',
            old_name='pesoBrutoCamion',
            new_name='brutoDestino',
        ),
        migrations.RenameField(
            model_name='despachocamion',
            old_name='patenteCamion',
            new_name='camion',
        ),
        migrations.RenameField(
            model_name='despachocamion',
            old_name='pesoNeto',
            new_name='diferenciaHumeda',
        ),
        migrations.RenameField(
            model_name='despachocamion',
            old_name='taraCamion',
            new_name='diferenciaSeca',
        ),
        migrations.RenameField(
            model_name='despachocamion',
            old_name='fDespacho',
            new_name='fDestino',
        ),
        migrations.RenameField(
            model_name='despachocamion',
            old_name='hDespacho',
            new_name='hDestino',
        ),
        migrations.RenameField(
            model_name='despachocamion',
            old_name='nServicio',
            new_name='sellosOrigen',
        ),
        migrations.AddField(
            model_name='despachocamion',
            name='bodega',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, to='api.bodega'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='despachocamion',
            name='fOrigen',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='despachocamion',
            name='hOrigen',
            field=models.TimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='despachocamion',
            name='netoHumedoDestino',
            field=models.DecimalField(blank=True, decimal_places=2, default=0, max_digits=20),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='despachocamion',
            name='netoHumedoOrigen',
            field=models.DecimalField(blank=True, decimal_places=2, default=0, max_digits=20),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='despachocamion',
            name='pvsa',
            field=models.CharField(default=0, max_length=200),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='despachocamion',
            name='taraDestino',
            field=models.DecimalField(blank=True, decimal_places=2, default=0, max_digits=20),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='despachocamion',
            name='nLote',
            field=models.CharField(default=0, max_length=200),
            preserve_default=False,
        ),
    ]
