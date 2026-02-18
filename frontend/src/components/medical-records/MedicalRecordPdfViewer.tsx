import { useState, useEffect } from 'react';
import { X, Download, Loader2 } from 'lucide-react';
import api from '@/services/api';
import { useToast } from '@/hooks/useToast';

interface MedicalRecordPdfViewerProps {
  medicalRecordId: string;
  recordNumber: string;
  clientName: string;
  onClose: () => void;
}

export default function MedicalRecordPdfViewer({ 
  medicalRecordId, 
  recordNumber,
  clientName,
  onClose 
}: MedicalRecordPdfViewerProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');

  const loadPdf = async () => {
    try {
      setLoading(true);
      setError('');
      const endpoint = `/medical-records/${medicalRecordId}/pdf`;

      const response = await api.get(endpoint, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setLoading(false);
    } catch (err: any) {
      console.error('Error al cargar PDF de HC:', err);
      setError('Error al cargar el PDF: ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPdf();
    
    // Cleanup: revoke object URL when component unmounts
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [medicalRecordId]);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const endpoint = `/medical-records/${medicalRecordId}/pdf`;

      const response = await api.get(endpoint, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `historia-clinica-${recordNumber}-${clientName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('PDF descargado', 'La historia clínica fue descargada correctamente');
    } catch (err: any) {
      toast.error('Error al descargar PDF', err.response?.data?.message || err.message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full h-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Historia Clínica - {recordNumber}</h2>
            <p className="text-sm text-gray-600 mt-1">Paciente: {clientName}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              disabled={loading || !!error || downloading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Descargando...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Descargar PDF
                </>
              )}
            </button>
            <button 
              onClick={onClose} 
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              title="Cerrar"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden bg-gray-100">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Generando PDF de la historia clínica...</p>
                <p className="text-gray-500 text-sm mt-2">Esto puede tomar unos segundos</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="text-red-600 mb-4">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-red-900 mb-2">Error al cargar el PDF</h3>
                  <p className="text-red-700 mb-4">{error}</p>
                  <button 
                    onClick={loadPdf} 
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && pdfUrl && (
            <iframe
              src={pdfUrl}
              className="w-full h-full border-0"
              title="Vista Previa de Historia Clínica"
            />
          )}
        </div>
      </div>
    </div>
  );
}
