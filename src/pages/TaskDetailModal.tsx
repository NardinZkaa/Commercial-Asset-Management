import { useState, useEffect } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Calendar,
  User,
  ClipboardCheck,
  Package,
  MapPin,
  Clock,
  TrendingUp,
  Camera,
  QrCode
} from 'lucide-react';
import { AuditTask, ScanResult, MissingAsset, ScannedAsset } from '../types';
import QRScanner from './QRscanner';

interface TaskDetailModalProps {
  task: AuditTask | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (task: AuditTask) => void;
}

export default function TaskDetailModal({ task, isOpen, onClose, onUpdate }: TaskDetailModalProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'checklist' | 'scan' | 'missing' | 'scanned'>('overview');
  const [showQRScanner, setShowQRScanner] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setActiveTab('overview');
      setIsScanning(false);
      setScanProgress(0);
      setShowQRScanner(false);
    }
  }, [isOpen]);

  const handleStartScan = async () => {
    if (!task) return;

    setIsScanning(true);
    setScanProgress(0);

    // Simulate scanning process
    const scanInterval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(scanInterval);
          setIsScanning(false);
          
          // Generate scan results and missing assets
          const newMissingAssets: MissingAsset[] = [
            {
              id: `missing-${Date.now()}-1`,
              name: 'Network Switch - HP ProCurve 2920',
              type: 'Network Equipment',
              expectedLocation: 'Server Room B - Rack 3',
              lastSeen: '2024-01-20',
              criticality: 'High'
            },
            {
              id: `missing-${Date.now()}-2`,
              name: 'Microsoft Office License - Volume',
              type: 'Software License',
              expectedLocation: 'IT Department License Pool',
              criticality: 'Medium'
            },
            {
              id: `missing-${Date.now()}-3`,
              name: 'Security Camera - Axis P3225-LV',
              type: 'Security Equipment',
              expectedLocation: 'Building Entry - North Wing',
              lastSeen: '2024-01-18',
              criticality: 'Critical'
            }
          ];

          const newScanResult: ScanResult = {
            id: `scan-${Date.now()}`,
            timestamp: new Date().toISOString(),
            totalAssets: 185,
            scannedAssets: 182,
            missingCount: newMissingAssets.length,
            status: 'completed',
            duration: 1800
          };

          const updatedTask: AuditTask = {
            ...task,
            scanResults: newScanResult,
            missingAssets: [...task.missingAssets, ...newMissingAssets],
            status: task.status === 'Pending' ? 'In Progress' : task.status
          };

          onUpdate(updatedTask);
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  const handleStartQRScanner = () => {
    setShowQRScanner(true);
  };

  const handleAssetScanned = (scannedAsset: ScannedAsset) => {
    if (!task) return;

    const updatedTask: AuditTask = {
      ...task,
      scannedAssets: [scannedAsset, ...task.scannedAssets],
      status: task.status === 'Pending' ? 'In Progress' : task.status
    };

    onUpdate(updatedTask);
  };

  const handleChecklistToggle = (itemId: string) => {
    if (!task) return;

    const updatedChecklist = task.checklist.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );

    const updatedTask: AuditTask = {
      ...task,
      checklist: updatedChecklist
    };

    onUpdate(updatedTask);
  };

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case 'Critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'High': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'Medium': return 'text-amber-600 bg-amber-100 border-amber-200';
      case 'Low': return 'text-emerald-600 bg-emerald-100 border-emerald-200';
      default: return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  const getScannedStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-emerald-600 bg-emerald-100 border-emerald-200';
      case 'unexpected': return 'text-amber-600 bg-amber-100 border-amber-200';
      case 'damaged': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  if (!isOpen || !task) return null;

  const completedItems = task.checklist.filter(item => item.completed).length;
  const completionPercentage = task.checklist.length > 0 ? (completedItems / task.checklist.length) * 100 : 0;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <ClipboardCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{task.assetName}</h2>
                  <p className="text-slate-300">{task.type} Audit</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 mt-6">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'checklist', label: 'Checklist' },
                { id: 'scan', label: 'Asset Scan' },
                { id: 'scanned', label: `Scanned (${task.scannedAssets.length})` },
                { id: 'missing', label: `Missing Assets (${task.missingAssets.length})` }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-white text-slate-900'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Task Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="w-4 h-4 text-slate-500" />
                      <span className="text-sm font-medium text-slate-600">Assigned To</span>
                    </div>
                    <p className="font-semibold text-slate-900">{task.assignedTo}</p>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <span className="text-sm font-medium text-slate-600">Due Date</span>
                    </div>
                    <p className="font-semibold text-slate-900">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-slate-500" />
                      <span className="text-sm font-medium text-slate-600">Priority</span>
                    </div>
                    <p className="font-semibold text-slate-900">{task.priority}</p>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-slate-500" />
                      <span className="text-sm font-medium text-slate-600">Progress</span>
                    </div>
                    <p className="font-semibold text-slate-900">{Math.round(completionPercentage)}%</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                  <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleStartQRScanner}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center space-x-2 shadow-lg"
                    >
                      <QrCode className="w-5 h-5" />
                      <span>Start QR Scanner</span>
                    </button>
                    
                    <button
                      onClick={handleStartScan}
                      disabled={isScanning}
                      className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center space-x-2 shadow-lg"
                    >
                      {isScanning ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          <span>Scanning...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5" />
                          <span>Auto Scan</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="bg-slate-50 rounded-xl p-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-slate-900">Task Progress</h3>
                    <span className="text-sm text-slate-600">
                      {completedItems} of {task.checklist.length} items completed
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Notes */}
                {task.notes && (
                  <div className="bg-slate-50 rounded-xl p-6">
                    <h3 className="font-semibold text-slate-900 mb-3">Notes</h3>
                    <p className="text-slate-700">{task.notes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Checklist Tab */}
            {activeTab === 'checklist' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-slate-900">Audit Checklist</h3>
                  <span className="text-sm text-slate-600">
                    {completedItems} of {task.checklist.length} completed
                  </span>
                </div>

                {task.checklist.map((item) => (
                  <div
                    key={item.id}
                    className={`border-2 rounded-xl p-4 transition-all duration-200 ${
                      item.completed
                        ? 'border-emerald-200 bg-emerald-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <button
                        onClick={() => handleChecklistToggle(item.id)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                          item.completed
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'border-slate-300 hover:border-slate-400'
                        }`}
                      >
                        {item.completed && <CheckCircle className="w-3 h-3 text-white" />}
                      </button>
                      <div className="flex-1">
                        <p className={`font-medium ${
                          item.completed ? 'text-emerald-800' : 'text-slate-900'
                        }`}>
                          {item.description}
                        </p>
                        {item.required && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200 mt-2">
                            Required
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Scan Tab */}
            {activeTab === 'scan' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-slate-900">Asset Scanning</h3>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleStartQRScanner}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center space-x-2"
                    >
                      <Camera className="w-5 h-5" />
                      <span>QR Scanner</span>
                    </button>
                    <button
                      onClick={handleStartScan}
                      disabled={isScanning}
                      className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center space-x-2"
                    >
                      {isScanning ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          <span>Scanning...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5" />
                          <span>Auto Scan</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Scanning Progress */}
                {isScanning && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                      <h4 className="font-semibold text-blue-900">Scanning Assets...</h4>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-3 mb-2">
                      <div
                        className="bg-blue-600 h-3 rounded-full transition-all duration-200"
                        style={{ width: `${scanProgress}%` }}
                      />
                    </div>
                    <p className="text-sm text-blue-700">{scanProgress}% complete</p>
                  </div>
                )}

                {/* Last Scan Results */}
                {task.scanResults && (
                  <div className="bg-slate-50 rounded-xl p-6">
                    <h4 className="font-semibold text-slate-900 mb-4">Latest Scan Results</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-white rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Package className="w-4 h-4 text-slate-500" />
                          <span className="text-sm font-medium text-slate-600">Total Assets</span>
                        </div>
                        <p className="text-2xl font-bold text-slate-900">{task.scanResults.totalAssets}</p>
                      </div>

                      <div className="bg-white rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                          <span className="text-sm font-medium text-slate-600">Scanned</span>
                        </div>
                        <p className="text-2xl font-bold text-emerald-600">{task.scanResults.scannedAssets}</p>
                      </div>

                      <div className="bg-white rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          <span className="text-sm font-medium text-slate-600">Missing</span>
                        </div>
                        <p className="text-2xl font-bold text-red-600">{task.scanResults.missingCount}</p>
                      </div>

                      <div className="bg-white rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Clock className="w-4 h-4 text-slate-500" />
                          <span className="text-sm font-medium text-slate-600">Duration</span>
                        </div>
                        <p className="text-2xl font-bold text-slate-900">
                          {Math.round(task.scanResults.duration / 60)}m
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center space-x-2 text-sm text-slate-600">
                      <Clock className="w-4 h-4" />
                      <span>Last scan: {new Date(task.scanResults.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Scanned Assets Tab */}
            {activeTab === 'scanned' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-slate-900">Scanned Assets</h3>
                  <span className="text-sm text-slate-600">
                    {task.scannedAssets.length} assets scanned
                  </span>
                </div>

                {task.scannedAssets.length === 0 ? (
                  <div className="text-center py-12">
                    <QrCode className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-slate-900 mb-2">No Assets Scanned Yet</h4>
                    <p className="text-slate-600 mb-4">Use the QR scanner to start scanning asset codes.</p>
                    <button
                      onClick={handleStartQRScanner}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center space-x-2 mx-auto"
                    >
                      <Camera className="w-5 h-5" />
                      <span>Start QR Scanner</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {task.scannedAssets.map((asset) => (
                      <div
                        key={asset.id}
                        className="border border-slate-200 bg-white rounded-xl p-6"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-slate-900 mb-1">{asset.name}</h4>
                            <p className="text-sm text-slate-600">{asset.type}</p>
                          </div>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getScannedStatusColor(asset.status)}`}>
                            {asset.status === 'verified' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {asset.status === 'unexpected' && <AlertTriangle className="w-3 h-3 mr-1" />}
                            <span className="capitalize">{asset.status}</span>
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <QrCode className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-600">QR: {asset.qrCode}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-600">{asset.location}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-600">
                              {new Date(asset.scannedAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Missing Assets Tab */}
            {activeTab === 'missing' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-slate-900">Missing Assets</h3>
                  <span className="text-sm text-slate-600">
                    {task.missingAssets.length} assets unaccounted for
                  </span>
                </div>

                {task.missingAssets.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-slate-900 mb-2">All Assets Accounted For</h4>
                    <p className="text-slate-600">No missing assets detected in this audit.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {task.missingAssets.map((asset) => (
                      <div
                        key={asset.id}
                        className="border border-red-200 bg-red-50 rounded-xl p-6"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-slate-900 mb-1">{asset.name}</h4>
                            <p className="text-sm text-slate-600">{asset.type}</p>
                          </div>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getCriticalityColor(asset.criticality)}`}>
                            {asset.criticality}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2 text-sm">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-600">Expected: {asset.expectedLocation}</span>
                          </div>
                          {asset.lastSeen && (
                            <div className="flex items-center space-x-2 text-sm">
                              <Clock className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-600">
                                Last seen: {new Date(asset.lastSeen).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onAssetScanned={handleAssetScanned}
        taskId={task?.id || ''}
      />
    </>
  );
}