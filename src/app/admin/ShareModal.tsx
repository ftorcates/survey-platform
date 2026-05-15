"use client"

import { useState, useEffect } from "react"
import { Share2, Copy, Check, Download, X } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"

export default function ShareModal({ surveyId }: { surveyId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    // Generate absolute URL dynamically based on where the app is hosted
    setUrl(`${window.location.origin}/survey/${surveyId}`);
  }, [surveyId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const handleDownload = () => {
    const svg = document.getElementById(`qr-${surveyId}`);
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    // Convert SVG to data URL
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const urlBlob = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        const pngUrl = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = pngUrl;
        a.download = `codigo-qr-encuesta.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      URL.revokeObjectURL(urlBlob);
    };
    img.src = urlBlob;
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="btn-secondary" 
        style={{ flex: '1 1 100%', padding: '0.5rem', fontSize: '0.875rem', display: 'flex', justifyContent: 'center', borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
      >
        <Share2 size={16} style={{ marginRight: '0.5rem' }} /> Compartir Encuesta
      </button>

      {isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
          <div className="glass-panel" style={{ width: '90%', maxWidth: '400px', padding: '2rem', position: 'relative', border: '1px solid var(--color-border)' }}>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
            >
              <X size={24} />
            </button>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', textAlign: 'center', color: 'var(--color-primary)' }}>Compartir Encuesta</h3>

            {/* Enlace Directo */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--color-text-main)' }}>Enlace Directo</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  readOnly 
                  value={url} 
                  className="input-base" 
                  style={{ flex: 1, fontSize: '0.875rem', padding: '0.5rem', outline: 'none' }} 
                />
                <button 
                  onClick={handleCopy}
                  className="btn-primary" 
                  style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Copiar Enlace"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
            </div>

            {/* Código QR */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-main)' }}>Código QR (Escaneable)</label>
              <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
                <QRCodeSVG id={`qr-${surveyId}`} value={url} size={200} level="H" includeMargin={true} />
              </div>
              <button 
                onClick={handleDownload}
                className="btn-secondary" 
                style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
              >
                <Download size={16} /> Descargar QR (PNG)
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  )
}
