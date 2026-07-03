'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize the scanner
    const scanner = new Html5QrcodeScanner(
      'reader',
      { 
        fps: 10, 
        qrbox: { width: 250, height: 150 },
        aspectRatio: 1.0,
      },
      false
    );

    const onScanSuccess = (decodedText: string) => {
      // Stop scanning and trigger the callback
      scanner.clear().catch(console.error);
      onScan(decodedText);
    };

    const onScanFailure = (err: any) => {
      // Ignored: html5-qrcode triggers this constantly while seeking a code
    };

    scanner.render(onScanSuccess, onScanFailure);

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 bg-gray-950/95 backdrop-blur-2xl z-[60] flex flex-col p-6 animate-in zoom-in-95 duration-300">
      <header className="flex justify-end mb-12 mt-4 relative z-10">
        <button onClick={onClose} className="p-2 text-gray-400 hover:text-white bg-gray-900 rounded-full transition-colors border border-gray-800">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center -mt-20">
        <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.2)] bg-gray-900 border-2 border-emerald-500/50">
          {/* Container for html5-qrcode */}
          <div id="reader" className="w-full" style={{ minHeight: '300px' }}></div>
        </div>
        <p className="mt-8 text-center text-gray-400 font-medium">Position the barcode inside the frame</p>
      </div>

      <style jsx global>{`
        /* Overriding html5-qrcode default ugly styles */
        #reader { border: none !important; }
        #reader__dashboard_section_csr span { color: white !important; }
        #reader__dashboard_section_swaplink { color: #34d399 !important; text-decoration: none !important; margin-top: 10px; display: inline-block; }
        #reader button {
          background-color: #064e3b !important;
          color: #34d399 !important;
          border: 1px solid #065f46 !important;
          padding: 8px 16px !important;
          border-radius: 8px !important;
          cursor: pointer !important;
          font-weight: 500 !important;
          margin-top: 10px !important;
        }
      `}</style>
    </div>
  );
}
