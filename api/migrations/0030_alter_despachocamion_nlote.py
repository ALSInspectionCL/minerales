# Generated by Django 5.1.1 on 2025-01-03 13:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0029_alter_despachocamion_nlote'),
    ]

    operations = [
        migrations.AlterField(
            model_name='despachocamion',
            name='nLote',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
    ]
