from django.db import models

# Create your models here.
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.core.files import File
import qrcode
import uuid
from io import BytesIO
import datetime

USER_TYPES = [
    ('Basic', 'View Branch Data and Create Branch Assets'),
    ('Auditor', 'Create Audit Reports'),
    ('Admin', 'Full Access'),
]

class Branch(models.Model):
    name = models.CharField(max_length=100, choices=[
        ('Main Branch', 'Main Branch'),
        ('North Branch', 'North Branch'),
        ('East Branch', 'East Branch'),
    ])
    code = models.CharField(max_length=10, unique=True)
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return self.name

    def delete(self, *args, **kwargs):
        if self.employee_set.exists() or self.assets.exists():
            raise ValidationError("Cannot delete branch with associated employees or assets.")
        super().delete(*args, **kwargs)

class CustomUser(AbstractUser):
    user_type = models.CharField(max_length=50, choices=USER_TYPES, default='Basic')
    branch = models.ForeignKey(Branch, on_delete=models.SET_NULL, null=True, blank=True)
    department = models.CharField(max_length=100, choices=[
        ('Engineering', 'Engineering'),
        ('Marketing', 'Marketing'),
        ('Design', 'Design'),
        ('HR', 'HR'),
    ], null=True, blank=True)

    def __str__(self):
        return self.username

class Category(models.Model):
    name = models.CharField(max_length=100, choices=[
        ('Electronics', 'Electronics'),
        ('Furniture', 'Furniture'),
        ('Vehicles', 'Vehicles'),
        ('Equipment', 'Equipment'),
    ])
    code = models.CharField(max_length=10, unique=True)
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return self.name

class Asset(models.Model):
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Inactive', 'Inactive'),
        ('Under Maintenance', 'Under Maintenance'),
        ('Retired', 'Retired'),
    ]
    CONDITION_CHOICES = [
        ('Excellent', 'Excellent'),
        ('Good', 'Good'),
        ('Fair', 'Fair'),
        ('Poor', 'Poor'),
    ]

    branch = models.ForeignKey(Branch, on_delete=models.PROTECT, related_name='assets')
    category = models.ForeignKey(Category, on_delete=models.PROTECT)
    asset_serial_number = models.CharField(max_length=50, unique=True, blank=True)
    description = models.TextField(blank=True, null=True)
    qr_code = models.ImageField(upload_to='qr_codes/', blank=True)
    qr_code_identifier = models.CharField(max_length=100, unique=True, blank=True)
    photo = models.ImageField(upload_to='asset_photos/', blank=True, null=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Active')
    condition = models.CharField(max_length=50, choices=CONDITION_CHOICES, default='Good')
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    current_value = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    purchase_date = models.DateField(null=True, blank=True)
    vendor = models.CharField(max_length=100, blank=True, null=True)
    next_audit_date = models.DateField(null=True, blank=True)
    assigned_to = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_assets')

    def __str__(self):
        return self.asset_serial_number

    def save(self, *args, **kwargs):
        if not self.asset_serial_number:
            self.asset_serial_number = self.generate_unique_serial_number()
        if not self.qr_code_identifier:
            self.qr_code_identifier = str(uuid.uuid4())
        self.generate_qr_code()
        super().save(*args, **kwargs)

    def generate_unique_serial_number(self):
        branch_code = self.branch.code
        category_code = self.category.code
        last_asset = Asset.objects.filter(branch=self.branch, category=self.category).order_by('-asset_serial_number').first()
        incremental_number = 100000 if not last_asset else int(last_asset.asset_serial_number.split('-')[-1]) + 1
        return f"{branch_code}-{category_code}-{incremental_number:06d}"

    def generate_qr_code(self):
        if not self.qr_code_identifier:
            raise ValidationError("QR code identifier required.")
        qr_data = f"{self.asset_serial_number}"  # Use serial number for QR code
        qr = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_L, box_size=10, border=4)
        qr.add_data(qr_data)
        qr.make(fit=True)
        img = qr.make_image(fill='black', back_color='white')
        buffer = BytesIO()
        img.save(buffer, format="PNG")
        buffer.seek(0)
        self.qr_code.save(f"qr_{self.asset_serial_number}.png", File(buffer), save=False)

class AuditSession(models.Model):
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    scanned_assets = models.ManyToManyField(Asset, related_name='audit_sessions')
    created_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"Audit Session {self.id} - {self.start_time}"

class Compliance(models.Model):
    STATUS_CHOICES = [
        ('Compliant', 'Compliant'),
        ('Action Required', 'Action Required'),
        ('Non-Compliant', 'Non-Compliant'),
    ]
    CATEGORY_CHOICES = [
        ('Security', 'Security'),
        ('Financial', 'Financial'),
        ('Privacy', 'Privacy'),
        ('Environmental', 'Environmental'),
    ]

    id = models.CharField(max_length=50, primary_key=True)  # e.g., COMP-001
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES)
    last_audit = models.DateField(null=True, blank=True)
    next_audit = models.DateField(null=True, blank=True)
    score = models.IntegerField(default=0)
    requirements = models.IntegerField(default=0)
    completed = models.IntegerField(default=0)
    description = models.TextField(blank=True, null=True)
    assets = models.ManyToManyField(Asset, related_name='compliances', blank=True)

    def __str__(self):
        return self.title

class AssetHistory(models.Model):
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name='history')
    user = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True)
    assigned_date = models.DateTimeField(auto_now_add=True)
    unassigned_date = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.asset.serial_number} - {self.user.username if self.user else 'N/A'}"

class Attachment(models.Model):
    assignment = models.ForeignKey(AssetHistory, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='attachments/')
    file_type = models.CharField(max_length=100, blank=True)

    def save(self, *args, **kwargs):
        if not self.file_type:
            self.file_type = self.file.name.split('.')[-1]
        super().save(*args, **kwargs)

    def __str__(self):
        return self.file.name