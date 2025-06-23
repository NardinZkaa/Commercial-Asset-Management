import { useEffect, useRef, useState } from 'react';
import { X, Camera, CheckCircle, AlertTriangle, Package } from 'lucide-react';
import QrScanner from 'qr-scanner';
import { ScannedAsset } from '../types';

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onAssetScanned: (asset: ScannedAsset) => void;
  taskId: string;
}

// Mock asset database for demonstration
const mockAssetDatabase: Record<string, { name: string; type: string; location: string }> = {
  'ASSET-001': { name: 'Dell Laptop XPS 13', type: 'Hardware', location: 'IT Department - Room 205' },
  'ASSET-002': { name: 'HP Printer LaserJet Pro', type: 'Hardware', location: 'Office Floor 2' },
  'ASSET-003': { name: 'Cisco Router ISR4331', type: 'Network Equipment', location: 'Server Room A' },
  'ASSET-004': { name: 'Microsoft Office License', type: 'Software', location: 'License Pool' },
  'ASSET-005': { name: 'Security Camera Axis P3225', type: 'Security Equipment', location: 'Building Entry' },
  'ASSET-006': { name: 'Network Switch HP ProCurve', type: 'Network Equipment', location: 'Server Room B' },
  'ASSET-007': { name: 'iPad Pro 12.9"', type: 'Mobile Device', location: 'Marketing Department' },
  'ASSET-008': { name: 'Projector Epson PowerLite', type: 'Presentation Equipment', location: 'Conference Room A' },
};

export default function QRScanner({ isOpen, onClose, onAssetScanned, taskId }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState<string>('');
  const [scanHistory, setScanHistory] = useState<ScannedAsset[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen && videoRef.current) {
      startScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isOpen]);

  const startScanner = async () => {
    if (!videoRef.current) return;

    try {
      setError('');
      setIsScanning(true);

      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => handleScanResult(result.data),
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment',
        }
      );

      await qrScannerRef.current.start();
    } catch (err) {
      setError('Failed to start camera. Please ensure camera permissions are granted.');
      setIsScanning(false);
    }
  };

  const stopScanner = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleScanResult = (qrCode: string) => {
    if (qrCode === lastScannedCode) return; // Prevent duplicate scans

    setLastScannedCode(qrCode);

    // Look up asset in mock database
    const assetInfo = mockAssetDatabase[qrCode];
    
    const scannedAsset: ScannedAsset = {
      id: `scanned-${Date.now()}`,
      qrCode,
      name: assetInfo?.name || `Unknown Asset (${qrCode})`,
      type: assetInfo?.type || 'Unknown',
      location: assetInfo?.location || 'Unknown Location',
      scannedAt: new Date().toISOString(),
      status: assetInfo ? 'verified' : 'unexpected'
    };

    setScanHistory(prev => [scannedAsset, ...prev]);
    onAssetScanned(scannedAsset);

    // Clear the last scanned code after a delay to allow re-scanning
    setTimeout(() => setLastScannedCode(''), 2000);
  };

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-emerald-600 bg-emerald-100 border-emerald-200';
      case 'unexpected': return 'text-amber-600 bg-amber-100 border-amber-200';
      case 'damaged': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="w-4 h-4" />;
      case 'unexpected': return <AlertTriangle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">QR Code Scanner</h2>
                <p className="text-blue-100">Scan asset QR codes to verify inventory</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white transition-colors duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Scanner Section */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 bg-black relative">
              {error ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-400" />
                    <p className="text-lg font-medium mb-2">Camera Error</p>
                    <p className="text-sm text-gray-300">{error}</p>
                    <button
                      onClick={startScanner}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                  />
                  
                  {/* Scanning Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-64 border-4 border-white/50 rounded-2xl relative">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-400 rounded-tl-2xl"></div>
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-400 rounded-tr-2xl"></div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-400 rounded-bl-2xl"></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-400 rounded-br-2xl"></div>
                      
                      {/* Scanning line animation */}
                      <div className="absolute inset-0 overflow-hidden rounded-2xl">
                        <div className="w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse"></div>
                      </div>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="absolute top-4 left-4 right-4">
                    <div className="bg-black/50 backdrop-blur-sm rounded-xl p-4 text-white">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${isScanning ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                        <span className="font-medium">
                          {isScanning ? 'Scanner Active - Point camera at QR code' : 'Scanner Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Controls */}
            <div className="p-4 bg-slate-50 border-t">
              <div className="flex justify-center space-x-4">
                <button
                  onClick={isScanning ? stopScanner : startScanner}
                  className={`px-6 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center space-x-2 ${
                    isScanning
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <Camera className="w-5 h-5" />
                  <span>{isScanning ? 'Stop Scanner' : 'Start Scanner'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Scan History */}
          <div className="w-80 bg-slate-50 border-l overflow-y-auto">
            <div className="p-4 border-b bg-white">
              <h3 className="font-semibold text-slate-900">Scanned Assets</h3>
              <p className="text-sm text-slate-600">{scanHistory.length} items scanned</p>
            </div>

            <div className="p-4 space-y-3">
              {scanHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-sm text-slate-600">No assets scanned yet</p>
                  <p className="text-xs text-slate-500 mt-1">Start scanning QR codes to see results here</p>
                </div>
              ) : (
                scanHistory.map((asset) => (
                  <div
                    key={asset.id}
                    className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-slate-900 text-sm">{asset.name}</h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(asset.status)}`}>
                        {getStatusIcon(asset.status)}
                        <span className="ml-1 capitalize">{asset.status}</span>
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-xs text-slate-600">
                      <p><span className="font-medium">QR:</span> {asset.qrCode}</p>
                      <p><span className="font-medium">Type:</span> {asset.type}</p>
                      <p><span className="font-medium">Location:</span> {asset.location}</p>
                      <p><span className="font-medium">Scanned:</span> {new Date(asset.scannedAt).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}