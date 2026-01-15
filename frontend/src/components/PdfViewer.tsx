import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '@/services/api';
import { useToast } from '@/hooks/useToast';

type PdfType = 'procedure' | 'data-treatment' | 'image-rights';

interface PdfViewerProps {
  consentId: string;
  clientId: string;
  pdfType: PdfType;
  onClose: () => void;
}

const PDF_TITLES = {
  procedure: 'Consentimientos Informados Completos',
  'data-treatment': 'Consentimientos Informados Completos',
  'image-rights': 'Consentimientos Informados Completos',
};

const PDF_ENDPOINTS = {
  procedure: '/consents',
  'data-treatment': '/consents',
  'image-rights': '/consents',
};

export default function PdfViewer({ consentId, clientId, pdfType, onClose }: PdfViewerProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');

  const loadPdf = async () => {
    try {
      setLoading(true);
      let endpoint = `${PDF_ENDPOINTS[pdfType]}/${consentId}/pdf`;
      
      if (pdfType === 'data-treatment') {
        endpoint = `/consents/${consentId}/pdf-data-treatment`;
      } else if (pdfType === 'image-rights') {
        endpoint = `/consents/${consentId}/pdf-image-rights`;
      }

      const response = await api.get(endpoint, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setLoading(false);
    } catch (err: any) {
      console.error('Error al cargar PDF:', err);
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
  }, [consentId, pdfType]);

  const handleDownload = async () => {
    try {
      let endpoint = `/consents/${consentId}/pdf`;
      
      if (pdfType === 'data-treatment') {
        endpoint = `/consents/${consentId}/pdf-data-treatment`;
      } else if (pdfType === 'image-rights') {
        endpoint = `/consents/${consentId}/pdf-image-rights`;
      }

      const response = await api.get(endpoint, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `consentimientos-${clientId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('PDF descargado', 'El PDF fue descargado correctamente');
    } catch (err: any) {
      toast.error('Error al descargar PDF', err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full h-full max-w-6xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">{PDF_TITLES[pdfType]} - {clientId}</h2>
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className="btn btn-primary"
              disabled={loading || !!error}
            >
              Descargar PDF
            </button>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando PDF...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-red-600">
                <p>{error}</p>
                <button onClick={loadPdf} className="mt-4 btn btn-primary">
                  Reintentar
                </button>
              </div>
            </div>
          )}

          {!loading && !error && pdfUrl && (
            <iframe
              src={pdfUrl}
              className="w-full h-full"
              title="PDF Viewer"
            />
          )}
        </div>
      </div>
    </div>
  );
}
