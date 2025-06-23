from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

app_name = 'assetManagementSystem'

urlpatterns = [
    # Authentication
    path('auth/login/', views.login_view, name='login'),
    path('auth/logout/', views.logout_view, name='logout'),
    path('auth/register/', views.register_view, name='register'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Dashboard
    path('dashboard/', views.dashboard_view, name='dashboard'),
    
    # Branches
    path('branches/', views.BranchListCreateView.as_view(), name='branch_list_create'),
    path('branches/<uuid:branch_id>/', views.BranchDetailView.as_view(), name='branch_detail'),
    path('branches/<uuid:branch_id>/restore/', views.restore_branch, name='restore_branch'),
    
    # Categories
    path('categories/', views.CategoryListCreateView.as_view(), name='category_list_create'),
    path('categories/<uuid:category_id>/', views.CategoryDetailView.as_view(), name='category_detail'),
    path('categories/<uuid:category_id>/restore/', views.restore_category, name='restore_category'),
    
    # Assets
    path('assets/', views.AssetListCreateView.as_view(), name='asset_list_create'),
    path('assets/<uuid:asset_id>/', views.AssetDetailView.as_view(), name='asset_detail'),
    path('assets/<uuid:asset_id>/qr/', views.generate_asset_qr, name='generate_asset_qr'),
    path('assets/export/', views.asset_export, name='asset_export'),
    
    # Audit Sessions
    path('audit/start/', views.AuditSessionCreateView.as_view(), name='start_audit'),
    path('audit/scan/', views.AuditSessionScanView.as_view(), name='scan_qr_code'),
    path('audit/end/', views.AuditSessionEndView.as_view(), name='end_audit'),
    path('audit/tasks/', views.audit_tasks_view, name='audit_tasks'),
    
    # Compliance
    path('compliance/', views.ComplianceListCreateView.as_view(), name='compliance_list_create'),
    path('compliance/<str:compliance_id>/', views.ComplianceDetailView.as_view(), name='compliance_detail'),
    path('compliance/timeline/', views.compliance_timeline, name='compliance_timeline'),
    path('compliance/<str:compliance_id>/report/', views.compliance_report, name='compliance_report'),
    
    # Assignments
    path('assignments/', views.AssignmentCreateView.as_view(), name='assign_asset'),
    path('assignments/<uuid:assignment_id>/', views.AssignmentDeleteView.as_view(), name='delete_assignment'),
    path('assignments/employees/', views.employees_with_assets, name='employees_with_assets'),
    path('assignments/<uuid:assignment_id>/agreement/', views.assignment_agreement, name='assignment_agreement'),
    
    # Attachments
    path('attachments/', views.AttachmentCreateView.as_view(), name='upload_attachment'),
    path('attachments/<uuid:assignment_id>/', views.AttachmentListView.as_view(), name='get_attachments'),
    path('attachments/<uuid:attachment_id>/delete/', views.AttachmentDeleteView.as_view(), name='delete_attachment'),
    
    # Analytics
    path('analytics/lifecycle/', views.analytics_lifecycle, name='analytics_lifecycle'),
    path('analytics/asset-status/', views.analytics_asset_status, name='analytics_asset_status'),
    path('analytics/ownership-changes/', views.analytics_ownership_changes, name='analytics_ownership_changes'),
    path('analytics/ownership-period/', views.analytics_ownership_period, name='analytics_ownership_period'),
    path('analytics/asset-value-trend/', views.analytics_asset_value_trend, name='analytics_asset_value_trend'),
    path('analytics/category-distribution/', views.analytics_category_distribution, name='analytics_category_distribution'),
    path('analytics/utilization-rate/', views.analytics_utilization_rate, name='analytics_utilization_rate'),
    path('analytics/depreciation/', views.analytics_depreciation, name='analytics_depreciation'),
    path('analytics/metrics/', views.analytics_metrics, name='analytics_metrics'),
    
    # Profile/Settings
    path('profile/', views.profile_view, name='profile'),
    path('settings/', views.settings_view, name='settings'),
]