'use client'
import { useEffect, useRef, useState } from "react";
import Tesseract from "tesseract.js";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isPhotoCaptured, setIsPhotoCaptured] = useState(false);
  const [recognizedText, setRecognizedText] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);

  // Solicita permisos de la cámara y configura la primera cámara disponible
  useEffect(() => {
    askForCameraPermission();
  }, []);

  // Obtiene las cámaras disponibles una vez que se tienen permisos
  useEffect(() => {
    if (hasPermission) {
      getAvailableCameras();
    }
  }, [hasPermission]);

  // Reinicia la cámara cuando cambia la cámara seleccionada
  useEffect(() => {
    if (selectedCameraId) {
      startCamera();
    }
  }, [selectedCameraId]);

  const askForCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasPermission(true);
      stopCamera();
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (error) {
      console.error("Camera permission denied:", error);
      setHasPermission(false);
      alert(
        "Parece que no has otorgado permisos para acceder a tu cámara. Por favor, verifica los permisos en la configuración del navegador y vuelve a intentarlo."
      );
    }
  };

  const getAvailableCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((device) => device.kind === "videoinput");
      setAvailableCameras(videoDevices);
      if (videoDevices.length > 0) {
        setSelectedCameraId(videoDevices[0].deviceId); // Selecciona la primera cámara por defecto
      }
    } catch (error) {
      console.error("Error getting available cameras:", error);
    }
  };

  const startCamera = async () => {
    if (!selectedCameraId) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: selectedCameraId } },
      });
      stopCamera();
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (error) {
      console.error("Error starting selected camera:", error);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => {
        track.stop();
      });
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = async () => {
    if (!hasPermission) {
      await askForCameraPermission();
      return;
    }

    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL("image/png");
        setCapturedImage(imageDataUrl);
        setIsPhotoCaptured(true);
        stopCamera();
      }
    }
  };

  const retakePhoto = async () => {
    setCapturedImage(null);
    setIsPhotoCaptured(false);
    setRecognizedText(null);
    await askForCameraPermission();
  };

  const recognizeText = async () => {
    if (!capturedImage) return;

    setIsProcessing(true);
    setRecognizedText(null);

    try {
      const { data } = await Tesseract.recognize(capturedImage, "spa", {
        logger: (info) => console.log(info),
      });
      setRecognizedText(data.text);
    } catch (error) {
      console.error("Error recognizing text:", error);
      setRecognizedText("No se pudo reconocer texto en la imagen.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        {availableCameras.length > 0 && (
          <select
            value={selectedCameraId || ""}
            onChange={(e) => setSelectedCameraId(e.target.value)}
            className="rounded-md border p-2"
          >
            {availableCameras.map((camera) => (
              <option key={camera.deviceId} value={camera.deviceId}>
                {camera.label || `Cámara ${camera.deviceId}`}
              </option>
            ))}
          </select>
        )}

        {isPhotoCaptured ? (
          <img
            src={capturedImage!}
            alt="Foto capturada"
            className="rounded-lg border border-gray-400 w-full h-auto"
          />
        ) : (
          <video
            ref={videoRef}
            className="aspect-video rounded-md w-full object-cover"
            autoPlay
            playsInline
          />
        )}

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          {isPhotoCaptured ? (
            <>
              <button
                onClick={retakePhoto}
                className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-[#e2e8f0] text-black gap-2 hover:bg-[#cbd5e1] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
              >
                Tomar otra foto
              </button>
              <button
                onClick={recognizeText}
                className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-[#e2e8f0] text-black gap-2 hover:bg-[#cbd5e1] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
                disabled={isProcessing}
              >
                {isProcessing ? "Procesando..." : "Leer ID"}
              </button>
            </>
          ) : (
            <button
              onClick={capturePhoto}
              className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-[#e2e8f0] text-black gap-2 hover:bg-[#cbd5e1] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            >
              Capturar Foto
            </button>
          )}
        </div>

        {recognizedText && (
          <>
            <h3 className="text-lg font-bold mb-2">Texto Reconocido:</h3>
            <div className="mt-4 p-4 bg-gray-100 rounded-lg shadow-md w-full max-w-xl">
              <p className="text-sm text-gray-800">{recognizedText}</p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
