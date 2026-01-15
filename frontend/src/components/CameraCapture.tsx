import { useRef, useState, useEffect } from 'react';
import { Camera, RotateCcw, Check, X } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (photoData: string) => void;
  onCancel?: () => void;
}

export default function CameraCapture({ onCapture, onCancel }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const initCamera = async () => {
      if (mounted) {
        await startCamera();
      }
    };
    
    initCamera();
    
    return () => {
      mounted = false;
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Verificar si el navegador soporta getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('getUserMedia no está disponible');
        setError('Tu navegador no soporta acceso a la cámara');
        setIsLoading(false);
        return;
      }

      console.log('Solicitando acceso a la cámara...');
      console.log('Navigator:', {
        userAgent: navigator.userAgent,
        mediaDevices: !!navigator.mediaDevices,
        getUserMedia: !!navigator.mediaDevices?.getUserMedia
      });
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
      });

      console.log('Acceso a cámara concedido');
      console.log('Stream tracks:', mediaStream.getTracks().map(t => ({
        kind: t.kind,
        label: t.label,
        enabled: t.enabled,
        readyState: t.readyState
      })));

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        
        // Esperar a que el video esté listo
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata cargado:', {
            videoWidth: videoRef.current?.videoWidth,
            videoHeight: videoRef.current?.videoHeight,
            readyState: videoRef.current?.readyState
          });
          
          videoRef.current?.play()
            .then(() => {
              console.log('Video reproduciendo correctamente');
              setIsLoading(false);
            })
            .catch((err) => {
              console.error('Error al reproducir video:', err);
              setIsLoading(false);
            });
        };
      } else {
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error('Error accessing camera:', err);
      console.error('Error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack
      });
      
      let errorMessage = 'No se pudo acceder a la cámara.';
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = 'Permiso denegado. Por favor, permite el acceso a la cámara en tu navegador.';
        console.log('Ayuda: Verifica los permisos de cámara en la configuración del navegador');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage = 'No se encontró ninguna cámara en tu dispositivo.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage = 'La cámara está siendo usada por otra aplicación.';
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    console.log('=== CAPTURANDO FOTO ===');
    console.log('videoRef.current:', !!videoRef.current);
    console.log('canvasRef.current:', !!canvasRef.current);
    
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      console.log('Video dimensions:', {
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight
      });

      if (context) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        console.log('Canvas dimensions:', {
          width: canvas.width,
          height: canvas.height
        });

        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to base64
        const photoData = canvas.toDataURL('image/jpeg', 0.8);
        console.log('Foto convertida a base64, tamaño:', photoData.length, 'caracteres');
        
        setCapturedPhoto(photoData);
        console.log('Estado capturedPhoto actualizado');
        
        stopCamera();
        console.log('Cámara detenida');
      } else {
        console.error('No se pudo obtener contexto 2D del canvas');
      }
    } else {
      console.error('videoRef o canvasRef no están disponibles');
    }
    console.log('======================');
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    startCamera();
  };

  const confirmPhoto = () => {
    console.log('=== CONFIRMANDO FOTO ===');
    console.log('capturedPhoto existe:', !!capturedPhoto);
    if (capturedPhoto) {
      console.log('Tamaño de foto:', capturedPhoto.length, 'caracteres');
      console.log('Llamando a onCapture...');
      onCapture(capturedPhoto);
      console.log('onCapture llamado exitosamente');
    } else {
      console.error('No hay foto capturada para confirmar');
    }
    console.log('=======================');
  };

  const handleCancel = () => {
    stopCamera();
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="text-white text-center">
              <Camera className="w-12 h-12 mx-auto mb-2 animate-pulse" />
              <p>Iniciando cámara...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-900 bg-opacity-90">
            <div className="text-white text-center p-4">
              <X className="w-12 h-12 mx-auto mb-2" />
              <p>{error}</p>
              <button
                type="button"
                onClick={startCamera}
                className="mt-4 px-4 py-2 bg-white text-red-900 rounded-lg hover:bg-gray-100"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {!capturedPhoto ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 border-4 border-white border-opacity-30 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-64 border-2 border-white border-dashed rounded-lg"></div>
            </div>
          </>
        ) : (
          <img
            src={capturedPhoto}
            alt="Foto capturada"
            className="w-full h-full object-cover"
          />
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex gap-3">
        {!capturedPhoto ? (
          <>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 btn btn-secondary flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              Cancelar
            </button>
            <button
              type="button"
              onClick={capturePhoto}
              disabled={isLoading || !!error}
              className="flex-1 btn btn-primary flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5" />
              Capturar Foto
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={retakePhoto}
              className="flex-1 btn btn-secondary flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Tomar Otra
            </button>
            <button
              type="button"
              onClick={confirmPhoto}
              className="flex-1 btn btn-primary flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              Confirmar
            </button>
          </>
        )}
      </div>

      <div className="text-sm text-gray-600 text-center">
        <p>Por favor, asegúrese de que el rostro del cliente esté bien iluminado y centrado</p>
      </div>
    </div>
  );
}
