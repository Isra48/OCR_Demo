'use client'
import { useEffect, useRef, useState } from "react";
import Tesseract from "tesseract.js";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);

  useEffect(() => {
    getCameras();
  }, []);

  const getCameras = async () => {
    try {
      // Pedir permisos para acceder a las cámaras
      await navigator.mediaDevices.getUserMedia({ video: true });
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((device) => device.kind === "videoinput");
      setCameras(videoDevices);
      if (videoDevices.length > 0) {
        setSelectedCamera(videoDevices[0].deviceId); // Selecciona la primera cámara por defecto
      }
    } catch (error) {
      console.error("Error getting cameras:", error);
      alert("No se pudieron obtener las cámaras. Verifica los permisos del navegador.");
    }
  };

  const startCamera = async (deviceId?: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: deviceId ? { deviceId: { exact: deviceId } } : true,
      });
      setHasPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (error) {
      console.error("Error starting camera:", error);
      alert("No se pudo iniciar la cámara. Verifica los permisos del navegador.");
    }
  };

  const handleCameraChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const deviceId = event.target.value;
    setSelectedCamera(deviceId);
    startCamera(deviceId); // Reinicia la cámara con el nuevo dispositivo seleccionado
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="flex flex-col gap-4">
          <label htmlFor="camera-select" className="text-sm font-medium">
            Selecciona una cámara:
          </label>
          <select
            id="camera-select"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm"
            value={selectedCamera || ""}
            onChange={handleCameraChange}
          >
            {cameras.map((camera) => (
              <option key={camera.deviceId} value={camera.deviceId}>
                {camera.label || `Cámara ${camera.deviceId}`}
              </option>
            ))}
          </select>
        </div>

        <video
          ref={videoRef}
          className="aspect-video rounded-md w-full border"
          autoPlay
          playsInline
        />

        <button
          onClick={() => startCamera(selectedCamera!)}
          className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-[#e2e8f0] text-black gap-2 hover:bg-[#cbd5e1] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
        >
          Iniciar cámara
        </button>
      </main>
    </div>
  );
}
