# here we can work whit the data
# the updates are in the migrations folder

from django.db import models

class Person(models.Model):
    firs_name = models.CharField(max_length=200)

