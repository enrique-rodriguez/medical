# Generated by Django 4.0.4 on 2022-04-21 21:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_providermodel_created'),
    ]

    operations = [
        migrations.AddField(
            model_name='providermodel',
            name='approved',
            field=models.DateTimeField(blank=True, default=None, null=True, verbose_name='Date and Time Approved'),
        ),
    ]
