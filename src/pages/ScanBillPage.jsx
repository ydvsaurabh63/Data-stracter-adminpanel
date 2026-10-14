import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  RefreshCw,
  Upload,
  Sparkles,
  CheckCircle,
  AlertCircle,
  FileText,
  Zap,
  Users,
  ShieldCheck,
  Receipt,
  ScanLine,
  Lock
} from 'lucide-react';
import { api } from '../services/api';
import { BillReviewModal } from '../components/BillReviewModal';

export const ScanBillPage = ({ onBillSaved }) => {
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);

  const [activeMode, setActiveMode] = useState('camera'); // 'camera' | 'upload'
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // back camera preferred for receipts
  const [capturedImage, setCapturedImage] = useState(null);
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [extractionStep, setExtractionStep] = useState(0);
  const [extractedData, setExtractedData] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const [savedSuccessMsg, setSavedSuccessMsg] = useState('');

  // Start Camera Stream with Fallback & Diagnostic Handling
  const startCamera = async (mode = facingMode) => {
    stopCamera();
    setCameraError('');

    if (!navigator?.mediaDevices?.getUserMedia) {
      setCameraError('CAMERA_UNAVAILABLE');
      setCameraActive(false);
      return;
    }

    try {
      let stream;
      try {
        // Try with ideal facing mode and resolution
        stream = await navigator.mediaDevices.getUserMedia({
          video: mode ? { facingMode: { ideal: mode } } : true,
        });
      } catch (modeErr) {
        console.warn('Strict constraints failed, falling back to basic webcam request:', modeErr);
        // Fallback for laptops/monitors where back camera does not exist
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      streamRef.current = stream;
      setCameraActive(true);
      setCameraError('');

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch((err) => console.warn('Video play error:', err));
        };
        videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      console.error('Camera access issue:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Browser popup me "Allow" karein.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('Device par camera nahi mila.');
      } else {
        setCameraError('Camera open nahi ho paya. Refresh karke try karein.');
      }
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Ensure stream stays bound to video ref whenever cameraActive updates
  useEffect(() => {
    if (videoRef.current && streamRef.current && cameraActive) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch((err) => console.warn('Video play error:', err));
    }
  }, [cameraActive, capturedImage]);

  useEffect(() => {
    // Only stop camera when navigating away or switching to upload mode
    if (activeMode !== 'camera' || capturedImage) {
      stopCamera();
    }
    return () => stopCamera();
  }, [activeMode, capturedImage]);

  // Flip Camera between back and front
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Capture Snapshot from Video Frame
  const takeSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          setCapturedBlob(blob);
          setCapturedImage(URL.createObjectURL(blob));
          stopCamera();
        }
      },
      'image/jpeg',
      0.92
    );
  };

  // Handle File Input Upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCapturedBlob(file);
      setCapturedImage(URL.createObjectURL(file));
      stopCamera();
    }
  };

  // Generate Sample Demo Receipt On-the-Fly (For Instant Testing)
  const handleLoadSampleBill = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');

    // Background paper
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 600, 800);

    // Header
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GRAND SPICE BISTRO', 300, 60);

    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Tax Invoice • Table #04 • Dine-In', 300, 90);
    ctx.fillText('Guest: Rahul Sharma | 📞 9876543210', 300, 115);

    // Divider
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(40, 140);
    ctx.lineTo(560, 140);
    ctx.stroke();

    // Table Header
    ctx.setLineDash([]);
    ctx.textAlign = 'left';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.fillText('ITEM', 50, 170);
    ctx.fillText('QTY', 330, 170);
    ctx.textAlign = 'right';
    ctx.fillText('PRICE (₹)', 550, 170);

    // Items
    ctx.font = '15px sans-serif';
    ctx.fillStyle = '#334155';
    const sampleItems = [
      { name: 'Paneer Butter Masala', qty: 2, price: 560 },
      { name: 'Garlic Naan Butter', qty: 4, price: 240 },
      { name: 'Dal Makhani Special', qty: 1, price: 280 },
      { name: 'Jeera Rice Bowl', qty: 2, price: 220 },
      { name: 'Fresh Mint Lime Soda', qty: 3, price: 180 },
    ];

    let y = 205;
    sampleItems.forEach((item) => {
      ctx.textAlign = 'left';
      ctx.fillText(item.name, 50, y);
      ctx.fillText(`x${item.qty}`, 335, y);
      ctx.textAlign = 'right';
      ctx.fillText(`₹${item.price}`, 550, y);
      y += 32;
    });

    // Divider
    ctx.strokeStyle = '#cbd5e1';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(40, y + 10);
    ctx.lineTo(560, y + 10);
    ctx.stroke();

    // Totals
    ctx.setLineDash([]);
    ctx.font = '15px sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText('Subtotal:', 400, y + 40);
    ctx.fillText('₹1,480', 550, y + 40);

    ctx.fillText('GST & Taxes (5%):', 400, y + 70);
    ctx.fillText('₹74', 550, y + 70);

    ctx.font = 'bold 20px sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('GRAND TOTAL:', 400, y + 110);
    ctx.fillText('₹1,554', 550, y + 110);

    // Footer
    ctx.font = 'italic 14px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'center';
    ctx.fillText('Thank you for dining with us! Visit again.', 300, 720);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          setCapturedBlob(blob);
          setCapturedImage(URL.createObjectURL(blob));
          stopCamera();
        }
      },
      'image/jpeg',
      0.95
    );
  };

  // Retake / Reset
  const handleRetake = () => {
    setCapturedImage(null);
    setCapturedBlob(null);
    setExtractedData(null);
    setSavedSuccessMsg('');
    if (activeMode === 'camera') {
      startCamera();
    }
  };

  // Extract with LandingAI (Simulated stepper for smooth feedback)
  const handleExtractWithLandingAI = async () => {
    if (!capturedBlob) return;
    setExtracting(true);
    setExtractionStep(1);
    setSavedSuccessMsg('');

    const timer1 = setTimeout(() => setExtractionStep(2), 700);
    const timer2 = setTimeout(() => setExtractionStep(3), 1400);

    try {
      const formData = new FormData();
      formData.append('billImage', capturedBlob, 'receipt.jpg');

      const res = await api.extractBill(formData);
      if (res.success) {
        setExtractedData(res.data);
      } else {
        alert(res.message || 'Failed to extract bill data');
      }
    } catch (err) {
      alert('Extraction failed: ' + err.message);
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setExtracting(false);
      setExtractionStep(0);
    }
  };

  const handleSavedSuccess = (result) => {
    setExtractedData(null);
    setCapturedImage(null);
    setCapturedBlob(null);
    const msg = `Recorded bill of ₹${result.bill.totalAmount.toLocaleString('en-IN')} for ${result.customer.name}! (${result.customer.isNew ? '✨ 1st Visit' : `⭐️ Visit #${result.customer.visitsCount}`})`;
    setSavedSuccessMsg(msg);
    if (onBillSaved) onBillSaved(result);
    if (activeMode === 'camera') {
      startCamera();
    }
  };

  return (
    <div className="scanner-container">
      {/* Top Header Row with Title & Segmented Mode Switcher */}
      <div className="scanner-header-row">
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>Scan Bill</span>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '3px 9px',
              borderRadius: '9999px',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <span className="camera-hud-dot" style={{ width: '6px', height: '6px' }}></span>
              Gemini Vision AI
            </span>
          </h1>
        </div>
      </div>

      {/* Success Notification */}
      {savedSuccessMsg && (
        <div style={{
          padding: '12px 18px',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: '12px',
          color: '#6ee7b7',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.92rem',
          fontWeight: 600,
          boxShadow: '0 4px 16px rgba(16, 185, 129, 0.15)'
        }}>
          <CheckCircle size={20} color="#10b981" />
          <span>{savedSuccessMsg}</span>
        </div>
      )}


      {/* Main Glassmorphic Scanner Card */}
      <div className="scanner-card">
        {/* VIEWPORT AREA */}
        {activeMode === 'camera' ? (
          <div className="camera-viewport">
            {/* Top HUD Bar */}
            <div className="camera-hud-top">
              <div className="camera-hud-badge">
                <span className="camera-hud-dot"></span>
                <span>{cameraActive ? '1080P • LIVE' : 'OFFLINE'}</span>
              </div>

              {cameraActive && (
                <button
                  type="button"
                  className="camera-hud-btn"
                  onClick={toggleFacingMode}
                  title="Switch Front/Back Camera"
                >
                  <RefreshCw size={13} />
                  <span>Flip</span>
                </button>
              )}
            </div>

            {/* Persistent Video Element to avoid null ref race conditions */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="camera-video"
              style={{ display: cameraActive && !capturedImage ? 'block' : 'none' }}
            />

            {/* Live Reticle HUD Overlay */}
            {!capturedImage && cameraActive && (
              <div className="reticle-box">
                <div className="receipt-frame-guide">
                  <span className="receipt-guide-text">Align Bill Here</span>
                </div>
                <div className="reticle-corner reticle-top-left"></div>
                <div className="reticle-corner reticle-top-right"></div>
                <div className="reticle-corner reticle-bottom-left"></div>
                <div className="reticle-corner reticle-bottom-right"></div>
              </div>
            )}

            {/* Captured Still Preview */}
            {capturedImage && (
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <img
                  src={capturedImage}
                  alt="Captured Receipt"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />

                {/* Laser Bar Animation during Extraction */}
                {extracting && <div className="scanner-laser"></div>}
              </div>
            )}

            {/* Extraction Stepped Processing Overlay */}
            {extracting && (
              <div className="scanner-extracting-overlay">
                <div className="scanner-spinner"></div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#f8fafc', marginBottom: '4px' }}>
                    Extracting Bill Details
                  </div>
                  <div style={{ fontSize: '0.84rem', color: '#f59e0b', fontWeight: 600 }}>
                    {extractionStep === 1 && 'Scanning physical receipt layout...'}
                    {extractionStep === 2 && 'Detecting dishes, quantities & GST...'}
                    {extractionStep >= 3 && 'Matching customer loyalty & visits...'}
                  </div>
                </div>
              </div>
            )}

            {/* Offline / Standby State */}
            {!cameraActive && !capturedImage && (
              <div style={{ textAlign: 'center', padding: '30px 20px', color: '#94a3b8', width: '100%', maxWidth: '380px' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '18px',
                  background: 'rgba(245, 158, 11, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  color: '#f59e0b',
                  boxShadow: '0 0 24px rgba(245, 158, 11, 0.2)'
                }}>
                  <Camera size={32} />
                </div>

                <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#f8fafc', marginBottom: '6px' }}>
                  Live Camera Scanner
                </div>

                <p style={{ fontSize: '0.86rem', color: '#94a3b8', marginBottom: '20px' }}>
                  Bill scan karne ke liye niche button dabayein:
                </p>

                {cameraError && (
                  <div style={{
                    padding: '9px 14px',
                    borderRadius: '8px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#fca5a5',
                    fontSize: '0.84rem',
                    marginBottom: '16px',
                    lineHeight: 1.4
                  }}>
                    {cameraError}
                  </div>
                )}

                {/* THE MAIN START CAMERA BUTTON */}
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => startCamera()}
                  style={{
                    fontSize: '1.02rem',
                    fontWeight: 700,
                    padding: '14px 24px',
                    width: '100%',
                    justifyContent: 'center',
                    gap: '10px',
                    boxShadow: '0 4px 20px rgba(245, 158, 11, 0.35)',
                    marginBottom: '12px'
                  }}
                >
                  <Camera size={22} />
                  <span>Start Camera</span>
                </button>

                <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleLoadSampleBill}
                    style={{ flex: 1, fontSize: '0.82rem', padding: '9px 6px', justifyContent: 'center' }}
                    title="Generate instant demo receipt"
                  >
                    <FileText size={14} color="#f59e0b" />
                    <span>1-Click Sample</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => fileInputRef.current?.click()}
                    style={{ flex: 1, fontSize: '0.82rem', padding: '9px 6px', justifyContent: 'center' }}
                    title="Upload receipt image from device"
                  >
                    <Upload size={14} />
                    <span>Upload File</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* UPLOAD MODE DROPZONE */
          <div>
            {!capturedImage ? (
              <div
                className="scanner-dropzone"
                onClick={() => fileInputRef.current?.click()}
              >
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '16px',
                  background: 'rgba(245, 158, 11, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '14px',
                  color: '#f59e0b',
                }}>
                  <Upload size={28} />
                </div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#f8fafc' }}>
                  Upload Receipt Image
                </div>
                <div style={{ fontSize: '0.84rem', color: '#94a3b8', marginTop: '6px' }}>
                  Tap to browse file or drag photo of receipt here (JPEG, PNG)
                </div>

                <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ fontSize: '0.82rem', padding: '6px 14px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLoadSampleBill();
                    }}
                  >
                    <FileText size={14} color="#f59e0b" /> 1-Click Sample Bill
                  </button>
                </div>
              </div>
            ) : (
              /* Upload Preview Area */
              <div className="camera-viewport">
                <img
                  src={capturedImage}
                  alt="Selected Receipt"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
                {extracting && <div className="scanner-laser"></div>}
                {extracting && (
                  <div className="scanner-extracting-overlay">
                    <div className="scanner-spinner"></div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#f8fafc' }}>
                      Extracting Bill with LandingAI...
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Hidden File Input for Device Files */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />


        {/* ACTION CONTROLS BAR: Render only when camera stream is actively live or when image is captured */}
        {(capturedImage || (activeMode === 'camera' && cameraActive)) && (
          <div className="scanner-controls-row">
            {!capturedImage ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ borderRadius: '9999px', padding: '10px 18px', fontSize: '0.86rem' }}
                  title="Upload from Device"
                >
                  <Upload size={16} />
                  <span>Upload</span>
                </button>

                {/* Tactile Live Shutter Button */}
                <button
                  type="button"
                  className="shutter-ring-btn"
                  onClick={takeSnapshot}
                  aria-label="Capture Receipt Photo"
                  title="Capture Receipt Photo"
                >
                  <div className="shutter-inner-btn">
                    <Camera size={22} />
                  </div>
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleLoadSampleBill}
                  style={{ borderRadius: '9999px', padding: '10px 18px', fontSize: '0.86rem' }}
                  title="Test with Sample Bill"
                >
                  <FileText size={16} color="#f59e0b" />
                  <span>Sample</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '440px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleRetake}
                  disabled={extracting}
                  style={{ flex: 1, padding: '12px' }}
                >
                  <RefreshCw size={16} /> Retake
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleExtractWithLandingAI}
                  disabled={extracting}
                  style={{ flex: 2, padding: '12px', fontSize: '0.98rem' }}
                >
                  <Sparkles size={18} />
                  <span>{extracting ? 'Extracting with Gemini...' : 'Extract with Gemini AI'}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3 Core Benefit Highlights Below Scanner */}
      <div className="scanner-features-grid">
        <div className="scanner-feature-card">
          <div className="scanner-feature-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <ScanLine size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f8fafc' }}>Automatic OCR</div>
            <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '2px', lineHeight: 1.4 }}>
              Extracts items, taxes & grand total with LandingAI
            </div>
          </div>
        </div>

        <div className="scanner-feature-card">
          <div className="scanner-feature-icon" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
            <Users size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f8fafc' }}>Visit Tracking</div>
            <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '2px', lineHeight: 1.4 }}>
              Auto-counts guest visits (1st, 2nd, 5+ VIP) via phone #
            </div>
          </div>
        </div>

        <div className="scanner-feature-card">
          <div className="scanner-feature-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <Zap size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f8fafc' }}>Instant Retention</div>
            <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '2px', lineHeight: 1.4 }}>
              Re-engage inactive guests with targeted WhatsApp promos
            </div>
          </div>
        </div>
      </div>

      {/* Bill Review & Confirmation Modal */}
      {extractedData && (
        <BillReviewModal
          extractedData={extractedData}
          onClose={() => setExtractedData(null)}
          onSaved={handleSavedSuccess}
        />
      )}
    </div>
  );
};
