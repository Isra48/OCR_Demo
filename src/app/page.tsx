'use client'
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isPhotoCaptured, setIsPhotoCaptured] = useState(false);

  useEffect(() => {
    askForCameraPermission();
  }, []);

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
      alert(
        "Parece que no has otorgado permisos para acceder a tu cámara. Por favor, verifica los permisos en la configuración del navegador y vuelve a intentarlo."
      );
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => {
        track.stop(); // Detiene cada track (video y audio) del stream
      });
      videoRef.current.srcObject = null; // Limpia la referencia al stream
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
        stopCamera(); // Detiene la cámara después de capturar la foto
      }
    }
  };

  const retakePhoto = async () => {
    setCapturedImage(null);
    setIsPhotoCaptured(false);
    await askForCameraPermission();
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        {isPhotoCaptured ? (
          <img
            src={capturedImage!}
            alt="Foto capturada"
            className="rounded-lg border border-gray-400 w-full h-auto"
          />
        ) : (
          <video
            ref={videoRef}
            className="rounded-md border w-full"
            autoPlay
            playsInline
          />
        )}

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          {isPhotoCaptured ? (
            <>
            <button
              onClick={retakePhoto}
              className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-[#e2e8f0]  text-black gap-2 hover:bg-[#cbd5e1] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            >
              Tomar otra foto
            </button>
            <button
              onClick={retakePhoto}
              className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-[#e2e8f0]  text-black gap-2 hover:bg-[#cbd5e1] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            >
              leer Id
            </button>            
            </>
            
          ) : (
            <button
              onClick={capturePhoto}
              className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-[#e2e8f0]  text-black gap-2 hover:bg-[#cbd5e1] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            >
              Capturar Foto
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
