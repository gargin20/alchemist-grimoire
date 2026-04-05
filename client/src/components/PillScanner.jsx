import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';

const PillScanner = ({ onScanComplete, onClose }) => {
    const webcamRef = useRef(null);
    const [isScanning, setIsScanning] = useState(false);

    // Capture the photo from the webcam
    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        processImage(imageSrc);
    }, [webcamRef]);

    // Send the base64 image to our backend
    const processImage = async (base64Image) => {
        setIsScanning(true);
        try {
            // We haven't built this backend route yet, but we will next!
            const response = await fetch('http://localhost:5000/api/ai/scan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Assuming you store your user token in localStorage
                    'Authorization': `Bearer ${localStorage.getItem('token')}` 
                },
                body: JSON.stringify({ image: base64Image })
            });

            const data = await response.json();
            onScanComplete(data); // Send the extracted data back to the Dashboard
        } catch (error) {
            console.error("Scanning failed", error);
            alert("Failed to read the label. Please try again.");
        } finally {
            setIsScanning(false);
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '500px', textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#1a73e8' }}>👁️ The Oracle's Eye</h3>
                <p style={{ color: '#5f6368', marginBottom: '20px' }}>Hold your pill bottle label clearly up to the camera.</p>
                
                <div style={{ borderRadius: '8px', overflow: 'hidden', marginBottom: '20px', border: '2px solid #e2e8f0' }}>
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{ facingMode: "environment" }}
                        style={{ width: '100%' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button 
                        onClick={capture} 
                        disabled={isScanning}
                        style={{ padding: '12px 24px', background: '#34a853', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: isScanning ? 'not-allowed' : 'pointer' }}
                    >
                        {isScanning ? '🔮 Analyzing...' : '📸 Snap & Analyze'}
                    </button>
                    <button 
                        onClick={onClose} 
                        style={{ padding: '12px 24px', background: '#f1f3f4', color: '#5f6368', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PillScanner;