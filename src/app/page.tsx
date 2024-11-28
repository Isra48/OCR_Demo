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

  useEffect(() => {
    checkCameraPermission();
  }, []);

  useEffect(() => {
    if (hasPermission) {
      getAvailableCameras();
    }
  }, [hasPermission]);

  useEffect(() => {
    if (selectedCameraId) {
      startCamera();
    }
  }, [selectedCameraId]);

  const checkCameraPermission = async () => {
    try {
      const permissionStatus = await navigator.permissions.query({ name: "camera" as PermissionName });
      if (permissionStatus.state === "granted") {
        setHasPermission(true);
        startCamera();
      } else if (permissionStatus.state === "prompt") {
        askForCameraPermission();
      } else {
        alert("Permiso para usar la cámara denegado. Por favor, actívalo en la configuración.");
      }
    } catch (error) {
      console.error("Error al verificar permisos:", error);
      askForCameraPermission();
    }
  };

  const askForCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (error) {
      console.error("Camera permission denied:", error);
      setHasPermission(false);
      alert("Parece que no has otorgado permisos para acceder a tu cámara. Por favor, verifica los permisos en la configuración del navegador y vuelve a intentarlo.");
    }
  };

  const getAvailableCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((device) => device.kind === "videoinput");
      setAvailableCameras(videoDevices);
      if (videoDevices.length > 0) {
        setSelectedCameraId(videoDevices[0].deviceId);
      }
    } catch (error) {
      console.error("Error al obtener cámaras:", error);
    }
  };

  const startCamera = async () => {
    if (!selectedCameraId) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: selectedCameraId } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (error) {
      console.error("Error al iniciar la cámara seleccionada:", error);
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
            className="rounded-md border p-2 bg-gray-800 text-white"
          >
            {availableCameras.map((camera) => (
              <option key={camera.deviceId} value={camera.deviceId}>
                {camera.label || `Cámara ${camera.deviceId}`}
              </option>
            ))}
          </select>
        )}

        <div className="w-full aspect-video sm:aspect-[21/9] rounded-lg border border-gray-400 overflow-hidden">
          {isPhotoCaptured ? (
            <img
              src={capturedImage!}
              alt="Foto capturada"
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <video
              ref={videoRef}
              className="w-full h-full object-cover object-center"
              autoPlay
              playsInline
            />
          )}
        </div>

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
