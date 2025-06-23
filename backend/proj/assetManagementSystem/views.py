from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Count, Sum, Avg, Q
from django.http import HttpResponse
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from io import BytesIO
import pandas as pd
from .models import Branch, Category, Asset, CustomUser, AuditSession, Compliance, AssetHistory, Attachment
from .serializers import (
    BranchSerializer, CategorySerializer, AssetSerializer, UserSerializer,
    AuditSessionSerializer, ComplianceSerializer, AssetHistorySerializer, AttachmentSerializer
)

# Permission Helpers
def is_auditor(user):
    return user.user_type == 'Auditor' or user.is_superuser

def is_branch_user(user):
    return user.user_type == 'Basic' or user.is_superuser

class SuperuserOrAuditorPermission(IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and (request.user.is_superuser or request.user.user_type == 'Auditor')

class SuperuserOrBranchUserPermission(IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and (request.user.user_type == 'Basic' or request.user.is_superuser)

# Authentication Views
@api_view(['POST'])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(request, username=username, password=password)
    if user:
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        })
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    # JWT logout handled on frontend by discarding tokens
    return Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)

@api_view(['POST'])
def register_view(request):
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    confirm_password = request.data.get('confirm_password')
    user_type = request.data.get('user_type', 'Basic')
    branch_id = request.data.get('branch_id')
    department = request.data.get('department')

    if password != confirm_password:
        return Response({'error': 'Passwords do not match'}, status=status.HTTP_400_BAD_REQUEST)
    if CustomUser.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
    if CustomUser.objects.filter(email=email).exists():
        return Response({'error': 'Email already registered'}, status=status.HTTP_400_BAD_REQUEST)

    user = CustomUser.objects.create_user(
        username=username,
        email=email,
        password=password,
        user_type=user_type,
        branch_id=branch_id,
        department=department
    )
    return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)

# Dashboard View
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_view(request):
    assets = Asset.objects.all()
    if is_branch_user(request.user) and request.user.branch:
        assets = assets.filter(branch=request.user.branch)

    total_assets = assets.count()
    total_value = assets.aggregate(total_value=Sum('current_value'))['total_value'] or 0
    compliance_stats = Compliance.objects.aggregate(
        compliant=Count('id', filter=Q(status='Compliant')),
        action_required=Count('id', filter=Q(status='Action Required')),
        non_compliant=Count('id', filter=Q(status='Non-Compliant')),
        avg_score=Avg('score')
    )

    return Response({
        'total_assets': total_assets,
        'total_value': total_value,
        'compliance_stats': compliance_stats
    })

# Branch Views
class BranchListCreateView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        branches = Branch.objects.filter(is_deleted=False)
        serializer = BranchSerializer(branches, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = BranchSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class BranchDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, branch_id):
        branch = get_object_or_404(Branch, id=branch_id)
        serializer = BranchSerializer(branch)
        return Response(serializer.data)

    def put(self, request, branch_id):
        branch = get_object_or_404(Branch, id=branch_id)
        serializer = BranchSerializer(branch, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, branch_id):
        branch = get_object_or_404(Branch, id=branch_id)
        if Asset.objects.filter(branch=branch).exists():
            return Response({'error': 'Cannot delete branch with associated assets'}, status=status.HTTP_400_BAD_REQUEST)
        branch.is_deleted = True
        branch.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def restore_branch(request, branch_id):
    branch = get_object_or_404(Branch, id=branch_id)
    if Branch.objects.filter(code=branch.code, is_deleted=False).exists():
        return Response({'error': 'A branch with this code already exists'}, status=status.HTTP_400_BAD_REQUEST)
    branch.is_deleted = False
    branch.save()
    return Response({'message': 'Branch restored'}, status=status.HTTP_200_OK)

# Category Views
class CategoryListCreateView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        categories = Category.objects.filter(is_deleted=False)
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CategoryDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, category_id):
        category = get_object_or_404(Category, id=category_id)
        serializer = CategorySerializer(category)
        return Response(serializer.data)

    def put(self, request, category_id):
        category = get_object_or_404(Category, id=category_id)
        serializer = CategorySerializer(category, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, category_id):
        category = get_object_or_404(Category, id=category_id)
        if Asset.objects.filter(category=category).exists():
            return Response({'error': 'Cannot delete category with associated assets'}, status=status.HTTP_400_BAD_REQUEST)
        category.is_deleted = True
        category.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def restore_category(request, category_id):
    category = get_object_or_404(Category, id=category_id)
    if Category.objects.filter(code=category.code, is_deleted=False).exists():
        return Response({'error': 'A category with this code already exists'}, status=status.HTTP_400_BAD_REQUEST)
    category.is_deleted = False
    category.save()
    return Response({'message': 'Category restored'}, status=status.HTTP_200_OK)

# Asset Views
class AssetListCreateView(APIView):
    permission_classes = [SuperuserOrBranchUserPermission]

    def get(self, request):
        assets = Asset.objects.all()
        if is_branch_user(request.user) and request.user.branch:
            assets = assets.filter(branch=request.user.branch)
        
        search_query = request.query_params.get('search', '')
        branch_filter = request.query_params.get('branch', '')
        category_filter = request.query_params.get('category', '')
        status_filter = request.query_params.get('status', '')

        if search_query:
            assets = assets.filter(Q(asset_serial_number__icontains=search_query) | Q(description__icontains=search_query))
        if branch_filter:
            assets = assets.filter(branch__id=branch_filter)
        if category_filter:
            assets = assets.filter(category__id=category_filter)
        if status_filter:
            assets = assets.filter(status=status_filter)

        serializer = AssetSerializer(assets, many=True)
        return Response(serializer.data)

    def post(self, request):
        if is_branch_user(request.user) and request.user.branch and request.data.get('branch_id') != str(request.user.branch.id):
            return Response({'error': 'You can only create assets for your branch'}, status=status.HTTP_403_FORBIDDEN)
        serializer = AssetSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AssetDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, asset_id):
        asset = get_object_or_404(Asset, id=asset_id)
        serializer = AssetSerializer(asset)
        return Response(serializer.data)

    def put(self, request, asset_id):
        asset = get_object_or_404(Asset, id=asset_id)
        if is_branch_user(request.user) and request.user.branch and asset.branch != request.user.branch:
            return Response({'error': 'You can only edit assets in your branch'}, status=status.HTTP_403_FORBIDDEN)
        serializer = AssetSerializer(asset, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, asset_id):
        asset = get_object_or_404(Asset, id=asset_id)
        if is_branch_user(request.user) and request.user.branch and asset.branch != request.user.branch:
            return Response({'error': 'You can only delete assets in your branch'}, status=status.HTTP_403_FORBIDDEN)
        asset.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
@permission_classes([SuperuserOrBranchUserPermission])
def generate_asset_qr(request, asset_id):
    asset = get_object_or_404(Asset, id=asset_id)
    if is_branch_user(request.user) and request.user.branch and asset.branch != request.user.branch:
        return Response({'error': 'You can only generate QR codes for assets in your branch'}, status=status.HTTP_403_FORBIDDEN)

    buffer = BytesIO()
    pdf = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=30)
    elements = []
    qr_width, qr_height = 200, 200
    page_width, page_height = letter
    x = (page_width - qr_width) / 2
    y = (page_height - qr_height) / 2
    elements.append(Image(asset.qr_code.path, width=qr_width, height=qr_height, hAlign='CENTER'))
    pdf.build(elements)
    buffer.seek(0)
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="sticker_{asset.asset_serial_number}.pdf"'
    response.write(buffer.getvalue())
    buffer.close()
    return response

@api_view(['GET'])
@permission_classes([SuperuserOrBranchUserPermission])
def asset_export(request):
    assets = Asset.objects.all()
    if is_branch_user(request.user) and request.user.branch:
        assets = assets.filter(branch=request.user.branch)

    branch_filter = request.query_params.get('branch', '')
    category_filter = request.query_params.get('category', '')
    status_filter = request.query_params.get('status', '')

    if branch_filter:
        assets = assets.filter(branch__id=branch_filter)
    if category_filter:
        assets = assets.filter(category__id=category_filter)
    if status_filter:
        assets = assets.filter(status=status_filter)

    data = [
        {
            'serial_number': asset.asset_serial_number,
            'description': asset.description,
            'branch': asset.branch.name if asset.branch else 'N/A',
            'category': asset.category.name if asset.category else 'N/A',
            'status': asset.status,
            'condition': asset.condition,
            'current_value': str(asset.current_value),
            'purchase_date': asset.purchase_date,
            'vendor': asset.vendor,
        }
        for asset in assets
    ]
    df = pd.DataFrame(data)
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="assets_export.csv"'
    df.to_csv(response, index=False)
    return response

# Audit Session Views
class AuditSessionCreateView(APIView):
    permission_classes = [SuperuserOrAuditorPermission]

    def post(self, request):
        audit_session = AuditSession.objects.create(created_by=request.user)
        serializer = AuditSessionSerializer(audit_session)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class AuditSessionScanView(APIView):
    permission_classes = [SuperuserOrAuditorPermission]

    def post(self, request):
        qr_code_identifier = request.data.get('qr_code')
        audit_session_id = request.session.get('audit_session_id')
        try:
            asset = Asset.objects.get(qr_code_identifier=qr_code_identifier)
            if is_auditor(request.user) and request.user.branch and asset.branch != request.user.branch:
                return Response({'error': 'Asset not in your branch'}, status=status.HTTP_403_FORBIDDEN)
            audit_session = AuditSession.objects.get(id=audit_session_id)
            audit_session.scanned_assets.add(asset)
            return Response({
                'asset': AssetSerializer(asset).data
            })
        except Asset.DoesNotExist:
            return Response({'error': 'Asset not found'}, status=status.HTTP_404_NOT_FOUND)
        except AuditSession.DoesNotExist:
            return Response({'error': 'No active audit session'}, status=status.HTTP_400_BAD_REQUEST)

class AuditSessionEndView(APIView):
    permission_classes = [SuperuserOrAuditorPermission]

    def post(self, request):
        audit_session_id = request.session.get('audit_session_id')
        try:
            audit_session = AuditSession.objects.get(id=audit_session_id)
            audit_session.end_time = timezone.now()
            audit_session.save()
            scanned_assets = audit_session.scanned_assets.all()
            all_assets = Asset.objects.all()
            if is_auditor(request.user) and request.user.branch:
                all_assets = all_assets.filter(branch=request.user.branch)
            not_scanned_assets = all_assets.exclude(id__in=scanned_assets.values_list('id', flat=True))

            buffer = BytesIO()
            pdf = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=30)
            elements = []
            stylesheet = getSampleStyleSheet()
            title_style = stylesheet['Title']
            heading_style = stylesheet['Heading2']
            body_style = stylesheet['BodyText']
            summary_header_style = ParagraphStyle(
                'SummaryHeader',
                parent=stylesheet['Heading2'],
                fontSize=16,
                leading=20,
                alignment=1
            )

            elements.append(Paragraph("Asset Audit Report", title_style))
            elements.append(Spacer(1, 20))
            session_data = [
                [Paragraph(f"<b>Session ID:</b> {audit_session.id}", body_style)],
                [Paragraph(f"<b>Start Time:</b> {audit_session.start_time.strftime('%Y-%m-%d %H:%M:%S')}", body_style)],
                [Paragraph(f"<b>End Time:</b> {audit_session.end_time.strftime('%Y-%m-%d %H:%M:%S')}", body_style)]
            ]
            session_table = Table(session_data, colWidths=[(letter[0] - 60)])
            session_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#cce5ff')),
                ('BOX', (0, 0), (-1, -1), 0.5, colors.blue),
                ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.blue),
                ('LEFTPADDING', (0, 0), (-1, -1), 6),
                ('RIGHTPADDING', (0, 0), (-1, -1), 6),
                ('TOPPADDING', (0, 0), (-1, -1), 4),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ]))
            elements.append(session_table)
            elements.append(Spacer(1, 20))

            branch_count = scanned_assets.values('branch__name').annotate(count=Count('id'))
            summary_text = ", ".join([f"{item['count']} assets in {item['branch__name']}" for item in branch_count]) or "No scanned assets."
            elements.append(Paragraph("Summary:", summary_header_style))
            elements.append(Paragraph(summary_text, body_style))
            elements.append(Spacer(1, 20))

            elements.append(Paragraph("Scanned Assets", heading_style))
            elements.append(Spacer(1, 12))
            scanned_data = [["Description", "Serial Number", "Branch", "Category", "Photo"]]
            for asset in scanned_assets:
                photo_obj = Paragraph("No Photo", body_style)
                if asset.photo:
                    try:
                        photo_obj = Image(asset.photo.path, width=50, height=50)
                    except:
                        pass
                scanned_data.append([
                    asset.description or 'N/A',
                    asset.asset_serial_number,
                    asset.branch.name if asset.branch else 'N/A',
                    asset.category.name if asset.category else 'N/A',
                    photo_obj
                ])
            scanned_table = Table(scanned_data, colWidths=[(letter[0] - 60 - 50) / 4] * 4 + [50])
            scanned_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#003366')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 11),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
                ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#cce5ff')),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#99ccff')),
            ]))
            elements.append(scanned_table)
            elements.append(Spacer(1, 20))

            elements.append(Paragraph("Missing Assets", heading_style))
            elements.append(Spacer(1, 12))
            missing_data = [["Serial Number", "Description", "Branch", "Category"]]
            for asset in not_scanned_assets:
                missing_data.append([
                    asset.asset_serial_number,
                    asset.description or 'N/A',
                    asset.branch.name if asset.branch else 'N/A',
                    asset.category.name if asset.category else 'N/A'
                ])
            missing_table = Table(missing_data, colWidths=[(letter[0] - 60) / 4] * 4)
            missing_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#003366')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 11),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
                ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#cce5ff')),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#99ccff')),
            ]))
            elements.append(missing_table)

            def add_page_number(canvas, doc):
                canvas.setFont("Helvetica", 9)
                canvas.drawRightString(letter[0] - 30, 15, f"Page {canvas.getPageNumber()}")

            pdf.build(elements, onFirstPage=add_page_number, onLaterPages=add_page_number)
            buffer.seek(0)
            response = HttpResponse(content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="audit_report_{audit_session.id}.pdf"'
            response.write(buffer.getvalue())
            buffer.close()
            if 'audit_session_id' in request.session:
                del request.session['audit_session_id']
            return response
        except AuditSession.DoesNotExist:
            return Response({'error': 'Invalid audit session'}, status=status.HTTP_400_BAD_REQUEST)

# Compliance Views
class ComplianceListCreateView(APIView):
    permission_classes = [SuperuserOrAuditorPermission]

    def get(self, request):
        compliances = Compliance.objects.all()
        category_filter = request.query_params.get('category', '')
        if category_filter:
            compliances = compliances.filter(category=category_filter)
        serializer = ComplianceSerializer(compliances, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ComplianceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ComplianceDetailView(APIView):
    permission_classes = [SuperuserOrAuditorPermission]

    def get(self, request, compliance_id):
        compliance = get_object_or_404(Compliance, id=compliance_id)
        serializer = ComplianceSerializer(compliance)
        return Response(serializer.data)

    def put(self, request, compliance_id):
        compliance = get_object_or_404(Compliance, id=compliance_id)
        serializer = ComplianceSerializer(compliance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, compliance_id):
        compliance = get_object_or_404(Compliance, id=compliance_id)
        compliance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
@permission_classes([SuperuserOrAuditorPermission])
def compliance_timeline(request):
    compliances = Compliance.objects.filter(next_audit__lte=timezone.now().date() + timezone.timedelta(days=90))
    serializer = ComplianceSerializer(compliances, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([SuperuserOrAuditorPermission])
def compliance_report(request, compliance_id):
    compliance = get_object_or_404(Compliance, id=compliance_id)
    buffer = BytesIO()
    pdf = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=30)
    elements = []
    stylesheet = getSampleStyleSheet()
    title_style = stylesheet['Title']
    heading_style = stylesheet['Heading2']
    body_style = stylesheet['BodyText']

    elements.append(Paragraph(f"Compliance Report: {compliance.title}", title_style))
    elements.append(Spacer(1, 20))
    data = [
        [Paragraph(f"<b>ID:</b> {compliance.id}", body_style)],
        [Paragraph(f"<b>Category:</b> {compliance.category}", body_style)],
        [Paragraph(f"<b>Status:</b> {compliance.status}", body_style)],
        [Paragraph(f"<b>Score:</b> {compliance.score}", body_style)],
        [Paragraph(f"<b>Requirements:</b> {compliance.completed}/{compliance.requirements}", body_style)],
        [Paragraph(f"<b>Last Audit:</b> {compliance.last_audit or 'N/A'}", body_style)],
        [Paragraph(f"<b>Next Audit:</b> {compliance.next_audit or 'N/A'}", body_style)],
        [Paragraph(f"<b>Description:</b> {compliance.description or 'N/A'}", body_style)],
    ]
    table = Table(data, colWidths=[letter[0] - 60])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#cce5ff')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.blue),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.blue),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(table)
    elements.append(Spacer(1, 20))

    elements.append(Paragraph("Associated Assets", heading_style))
    elements.append(Spacer(1, 12))
    asset_data = [["Serial Number", "Description", "Branch", "Category"]]
    for asset in compliance.assets.all():
        asset_data.append([
            asset.asset_serial_number,
            asset.description or 'N/A',
            asset.branch.name if asset.branch else 'N/A',
            asset.category.name if asset.category else 'N/A'
        ])
    asset_table = Table(asset_data, colWidths=[(letter[0] - 60) / 4] * 4)
    asset_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#003366')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#cce5ff')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#99ccff')),
    ]))
    elements.append(asset_table)

    def add_page_number(canvas, doc):
        canvas.setFont("Helvetica", 9)
        canvas.drawRightString(letter[0] - 30, 15, f"Page {canvas.getPageNumber()}")

    pdf.build(elements, onFirstPage=add_page_number, onLaterPages=add_page_number)
    buffer.seek(0)
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="compliance_report_{compliance.id}.pdf"'
    response.write(buffer.getvalue())
    buffer.close()
    return response

# Assignment Views
class AssignmentCreateView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        user_id = request.data.get('user_id')
        asset_ids = request.data.get('asset_ids', [])
        if not user_id or not asset_ids:
            return Response({'error': 'User and at least one asset required'}, status=status.HTTP_400_BAD_REQUEST)
        
        existing = AssetHistory.objects.filter(user_id=user_id, asset_id__in=asset_ids, unassigned_date__isnull=True)
        if existing.exists():
            return Response({'error': 'Some assets already assigned to this user'}, status=status.HTTP_400_BAD_REQUEST)
        
        assignments = [AssetHistory(user_id=user_id, asset_id=asset_id) for asset_id in asset_ids]
        AssetHistory.objects.bulk_create(assignments)
        for asset_id in asset_ids:
            asset = Asset.objects.get(id=asset_id)
            asset.assigned_to_id = user_id
            asset.save()
        return Response({'message': f'Assigned {len(asset_ids)} assets'}, status=status.HTTP_201_CREATED)

class AssignmentDeleteView(APIView):
    permission_classes = [IsAdminUser]

    def delete(self, request, assignment_id):
        try:
            assignment = AssetHistory.objects.get(id=assignment_id)
            assignment.unassigned_date = timezone.now()
            assignment.asset.assigned_to = None
            assignment.asset.save()
            assignment.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except AssetHistory.DoesNotExist:
            return Response({'error': 'Assignment not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def employees_with_assets(request):
    users = CustomUser.objects.filter(assigned_assets__isnull=False).distinct()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def assignment_agreement(request, assignment_id):
    assignment = get_object_or_404(AssetHistory, id=assignment_id)
    buffer = BytesIO()
    pdf = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=30)
    elements = []
    stylesheet = getSampleStyleSheet()
    title_style = stylesheet['Title']
    body_style = stylesheet['BodyText']

    elements.append(Paragraph("Asset Assignment Agreement", title_style))
    elements.append(Spacer(1, 20))
    data = [
        [Paragraph(f"<b>User:</b> {assignment.user.username}", body_style)],
        [Paragraph(f"<b>Asset:</b> {assignment.asset.asset_serial_number}", body_style)],
        [Paragraph(f"<b>Assigned Date:</b> {assignment.assigned_date.strftime('%Y-%m-%d %H:%M:%S')}", body_style)],
        [Paragraph(f"<b>Branch:</b> {assignment.asset.branch.name if assignment.asset.branch else 'N/A'}", body_style)],
        [Paragraph(f"<b>Category:</b> {assignment.asset.category.name if assignment.asset.category else 'N/A'}", body_style)],
    ]
    table = Table(data, colWidths=[letter[0] - 60])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#cce5ff')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.blue),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.blue),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(table)

    def add_page_number(canvas, doc):
        canvas.setFont("Helvetica", 9)
        canvas.drawRightString(letter[0] - 30, 15, f"Page {canvas.getPageNumber()}")

    pdf.build(elements, onFirstPage=add_page_number, onLaterPages=add_page_number)
    buffer.seek(0)
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="assignment_agreement_{assignment.id}.pdf"'
    response.write(buffer.getvalue())
    buffer.close()
    return response

# Attachment Views
class AttachmentCreateView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        serializer = AttachmentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AttachmentListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, assignment_id):
        assignment = get_object_or_404(AssetHistory, id=assignment_id)
        attachments = assignment.attachments.all()
        serializer = AttachmentSerializer(attachments, many=True)
        return Response(serializer.data)

class AttachmentDeleteView(APIView):
    permission_classes = [IsAdminUser]

    def delete(self, request, attachment_id):
        attachment = get_object_or_404(Attachment, id=attachment_id)
        attachment.file.delete()
        attachment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# Analytics Views
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def analytics_lifecycle(request):
    category = request.query_params.get('category', 'all')
    assets = Asset.objects.all()
    if is_branch_user(request.user) and request.user.branch:
        assets = assets.filter(branch=request.user.branch)
    if category != 'all':
        assets = assets.filter(category__name=category)

    total = assets.count()
    in_use = assets.filter(status='Active').count() / total * 100 if total else 0
    under_maintenance = assets.filter(status='Under Maintenance').count() / total * 100 if total else 0
    retired = assets.filter(status='Retired').count() / total * 100 if total else 0
    avg_lifespan = assets.filter(status='Retired').aggregate(avg=Avg('purchase_date'))['avg']
    avg_lifespan_years = (timezone.now().date() - avg_lifespan).days / 365 if avg_lifespan else 0

    return Response({
        'inUse': round(in_use, 1),
        'underMaintenance': round(under_maintenance, 1),
        'retired': round(retired, 1),
        'avgLifespanYears': round(avg_lifespan_years, 1) if avg_lifespan_years else 0
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def analytics_asset_status(request):
    category = request.query_params.get('category', 'all')
    assets = Asset.objects.all()
    if is_branch_user(request.user) and request.user.branch:
        assets = assets.filter(branch=request.user.branch)
    if category != 'all':
        assets = assets.filter(category__name=category)

    status_counts = assets.values('status').annotate(count=Count('id'))
    return Response([{'status': item['status'], 'count': item['count']} for item in status_counts])

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def analytics_ownership_changes(request):
    category = request.query_params.get('category', 'all')
    assets = Asset.objects.all()
    if is_branch_user(request.user) and request.user.branch:
        assets = assets.filter(branch=request.user.branch)
    if category != 'all':
        assets = assets.filter(category__name=category)

    changes = AssetHistory.objects.filter(asset__in=assets).values('asset__branch__name').annotate(count=Count('id'))
    return Response([{'branch': item['asset__branch__name'], 'count': item['count']} for item in changes])

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def analytics_ownership_period(request):
    category = request.query_params.get('category', 'all')
    assets = Asset.objects.all()
    if is_branch_user(request.user) and request.user.branch:
        assets = assets.filter(branch=request.user.branch)
    if category != 'all':
        assets = assets.filter(category__name=category)

    periods = AssetHistory.objects.filter(asset__in=assets, unassigned_date__isnull=False).values('asset__branch__name').annotate(
        avg_period=Avg('unassigned_date' - 'assigned_date')
    )
    return Response([
        {'branch': item['asset__branch__name'], 'avgPeriod': item['avg_period'].days / 365}
        for item in periods
    ])

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def analytics_asset_value_trend(request):
    assets = Asset.objects.all()
    if is_branch_user(request.user) and request.user.branch:
        assets = assets.filter(branch=request.user.branch)

    data = assets.values('purchase_date').annotate(total_value=Sum('current_value')).order_by('purchase_date')
    return Response({
        'labels': [item['purchase_date'].strftime('%Y-%m') for item in data],
        'datasets': [{'label': 'Asset Value', 'data': [item['total_value'] for item in data]}]
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def analytics_category_distribution(request):
    assets = Asset.objects.all()
    if is_branch_user(request.user) and request.user.branch:
        assets = assets.filter(branch=request.user.branch)

    data = assets.values('category__name').annotate(count=Count('id'))
    return Response({
        'labels': [item['category__name'] for item in data],
        'datasets': [{'label': 'Category Distribution', 'data': [item['count'] for item in data]}]
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def analytics_utilization_rate(request):
    assets = Asset.objects.all()
    if is_branch_user(request.user) and request.user.branch:
        assets = assets.filter(branch=request.user.branch)

    data = assets.filter(status='Active').values('branch__name').annotate(count=Count('id'))
    return Response({
        'labels': [item['branch__name'] for item in data],
        'datasets': [{'label': 'Utilization Rate', 'data': [item['count'] for item in data]}]
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def analytics_depreciation(request):
    assets = Asset.objects.all()
    if is_branch_user(request.user) and request.user.branch:
        assets = assets.filter(branch=request.user.branch)

    data = assets.values('category__name').annotate(
        total_purchase=Sum('purchase_price'),
        total_current=Sum('current_value')
    )
    return Response({
        'labels': [item['category__name'] for item in data],
        'datasets': [
            {'label': 'Purchase Value', 'data': [item['total_purchase'] for item in data]},
            {'label': 'Current Value', 'data': [item['total_current'] for item in data]}
        ]
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def analytics_metrics(request):
    assets = Asset.objects.all()
    if is_branch_user(request.user) and request.user.branch:
        assets = assets.filter(branch=request.user.branch)

    total_value = assets.aggregate(total=Sum('current_value'))['total'] or 0
    monthly_depreciation = assets.aggregate(
        total=Sum('purchase_price') - Sum('current_value')
    )['total'] or 0
    return Response({
        'total_asset_value': total_value,
        'monthly_depreciation': monthly_depreciation / 12 if monthly_depreciation else 0,
        'roi': 0,  # Placeholder: requires business logic
        'cost_savings': 0,  # Placeholder
        'asset_lifespan': 0,  # Placeholder
        'efficiency_score': 0,  # Placeholder
        'maintenance_costs': 0  # Placeholder
    })

# User Profile/Settings Views
@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    if request.method == 'GET':
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    else:
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def settings_view(request):
    return Response({
        'user_type': request.user.user_type,
        'branch': BranchSerializer(request.user.branch).data if request.user.branch else None
    })

# Audit Tasks View
@api_view(['GET'])
@permission_classes([SuperuserOrAuditorPermission])
def audit_tasks_view(request):
    assets = Asset.objects.filter(
        next_audit_date__lte=timezone.now().date() + timezone.timedelta(days=30)
    )
    if is_auditor(request.user) and request.user.branch:
        assets = assets.filter(branch=request.user.branch)
    serializer = AssetSerializer(assets, many=True)
    return Response(serializer.data)