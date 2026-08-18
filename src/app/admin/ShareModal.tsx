"use client"

import { useMemo, useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Share2, Copy, Check, Download, X } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"

export default function ShareModal({ surveyId }: { surveyId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const url = useMemo(
    () => (typeof window === "undefined" ? "" : `${window.location.origin}/survey/${surveyId}`),
    [surveyId]
  );

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

      {isOpen && mounted && createPortal(
        <div className="modal-backdrop" style={{ zIndex: 9999 }}>
          <div className="modal-panel" style={{ width: '100%', maxWidth: '440px', position: 'relative', padding: '1.75rem', boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.75)' }}>
            <button 
              onClick={() => setIsOpen(false)}
              className="btn-ghost"
              style={{ position: 'absolute', top: '1rem', right: '1rem', padding: "0.35rem" }}
            >
              <X size={20} />
            </button>

            <div className="eyebrow" style={{ marginBottom: "0.6rem" }}>Compartir encuesta</div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--color-text-main)' }}>Enlace y QR de acceso</h3>

            {/* Enlace Directo */}
            <div style={{ marginBottom: '1.75rem' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--color-text-main)' }}>Enlace Directo</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  readOnly 
                  value={url} 
                  className="input-base" 
                  style={{ flex: 1, fontSize: '0.875rem', padding: '0.65rem 0.85rem', outline: 'none', background: 'var(--color-bg)' }} 
                />
                <button 
                  onClick={handleCopy}
                  className="btn-primary" 
                  style={{ padding: '0.65rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}
                  title="Copiar Enlace"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
            </div>

            {/* Código QR */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-main)' }}>Código QR (Escaneable)</label>
              <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: "1px solid var(--color-border)" }}>
                <QRCodeSVG id={`qr-${surveyId}`} value={url} size={190} level="H" includeMargin={true} />
              </div>
              <button 
                onClick={handleDownload}
                className="btn-secondary" 
                style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem', fontWeight: 600 }}
              >
                <Download size={16} /> Descargar QR (PNG)
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}
    </>
  )
}
