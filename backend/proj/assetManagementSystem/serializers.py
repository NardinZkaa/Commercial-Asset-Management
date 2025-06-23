from rest_framework import serializers
from .models import Branch, Category, Asset, CustomUser, AuditSession, Compliance, AssetHistory, Attachment
from django.utils import timezone

class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = ['id', 'name', 'code', 'is_deleted']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'code', 'is_deleted']

class UserSerializer(serializers.ModelSerializer):
    branch = BranchSerializer(read_only=True)
    branch_id = serializers.PrimaryKeyRelatedField(
        queryset=Branch.objects.filter(is_deleted=False), source='branch', write_only=True, required=False
    )

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'user_type', 'branch', 'branch_id', 'department']

class AssetSerializer(serializers.ModelSerializer):
    branch = BranchSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    branch_id = serializers.PrimaryKeyRelatedField(
        queryset=Branch.objects.filter(is_deleted=False), source='branch', write_only=True
    )
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.filter(is_deleted=False), source='category', write_only=True
    )
    assigned_to = UserSerializer(read_only=True)
    assigned_to_id = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all(), source='assigned_to', write_only=True, required=False
    )

    class Meta:
        model = Asset
        fields = [
            'id', 'branch', 'branch_id', 'category', 'category_id', 'asset_serial_number',
            'description', 'qr_code', 'qr_code_identifier', 'photo', 'status', 'condition',
            'purchase_price', 'current_value', 'purchase_date', 'vendor', 'next_audit_date',
            'assigned_to', 'assigned_to_id'
        ]

class AuditSessionSerializer(serializers.ModelSerializer):
    scanned_assets = AssetSerializer(many=True, read_only=True)
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = AuditSession
        fields = ['id', 'start_time', 'end_time', 'scanned_assets', 'created_by']

class ComplianceSerializer(serializers.ModelSerializer):
    assets = AssetSerializer(many=True, read_only=True)
    asset_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Asset.objects.all(), source='assets', write_only=True, required=False
    )

    class Meta:
        model = Compliance
        fields = [
            'id', 'title', 'category', 'status', 'last_audit', 'next_audit', 'score',
            'requirements', 'completed', 'description', 'assets', 'asset_ids'
        ]

class AssetHistorySerializer(serializers.ModelSerializer):
    asset = AssetSerializer(read_only=True)
    user = UserSerializer(read_only=True)
    asset_id = serializers.PrimaryKeyRelatedField(
        queryset=Asset.objects.all(), source='asset', write_only=True
    )
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all(), source='user', write_only=True, required=False
    )

    class Meta:
        model = AssetHistory
        fields = ['id', 'asset', 'asset_id', 'user', 'user_id', 'assigned_date', 'unassigned_date']

class AttachmentSerializer(serializers.ModelSerializer):
    assignment = AssetHistorySerializer(read_only=True)
    assignment_id = serializers.PrimaryKeyRelatedField(
        queryset=AssetHistory.objects.all(), source='assignment', write_only=True
    )

    class Meta:
        model = Attachment
        fields = ['id', 'assignment', 'assignment_id', 'file', 'file_type']