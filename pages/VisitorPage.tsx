import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Exhibit, AudioTrack } from '../types';
import { useExhibits } from '../context/ExhibitContext';
import { useLanguage } from '../context/LanguageContext';
import { QrCodeIcon, PlayIcon, PauseIcon, CameraIcon, CloseIcon } from '../components/icons';
import jsQR from 'jsqr';

const VisitorPage: React.FC = () => {
  const [exhibitId, setExhibitId] = useState('');
  const [currentExhibit, setCurrentExhibit] = useState<Exhibit | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<AudioTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // FIX: Initialize useRef with null to prevent "Expected 1 arguments, but got 0" error.
  const scannerAnimationRef = useRef<number | null>(null);

  const navigate = useNavigate();
  const { getExhibitById } = useExhibits();
  const { selectedLanguage } = useLanguage();

  useEffect(() => {
    if (!selectedLanguage) {
      navigate('/');
    }
  }, [selectedLanguage, navigate]);

  const handleSearch = useCallback(() => {
    setError('');
    setCurrentExhibit(null);
    setSelectedTrack(null);
    setIsPlaying(false);
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
    }

    if (!exhibitId) {
      setError('Please enter an exhibit ID.');
      return;
    }

    const foundExhibit = getExhibitById(exhibitId.trim().toUpperCase());
    if (foundExhibit) {
      setCurrentExhibit(foundExhibit);
      if (foundExhibit.audioTracks.length > 0) {
        const preferredTrack = foundExhibit.audioTracks.find(t => t.lang === selectedLanguage?.code);
        setSelectedTrack(preferredTrack || foundExhibit.audioTracks[0]);
      }
    } else {
      setError('Exhibit not found. Please check the ID and try again.');
    }
  }, [exhibitId, getExhibitById, selectedLanguage]);

  // QR Code Scanner Logic
  const tick = useCallback(() => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && canvasRef.current) {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            canvas.height = video.videoHeight;
            canvas.width = video.videoWidth;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: 'dontInvert',
            });
            if (code) {
                setExhibitId(code.data);
                setIsScannerOpen(false); // Close scanner on successful scan
                // FIX: Stop the animation loop after a successful scan.
                return;
            }
        }
    }
    scannerAnimationRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (isScannerOpen) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
            .then(stream => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.setAttribute("playsinline", "true"); // Required for iOS
                    videoRef.current.play();
                    scannerAnimationRef.current = requestAnimationFrame(tick);
                }
            })
            .catch(err => {
                console.error("Camera access error:", err);
                setError("Camera access is required for QR scanning.");
                setIsScannerOpen(false);
            });
    } else {
        if (scannerAnimationRef.current) {
            cancelAnimationFrame(scannerAnimationRef.current);
        }
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    }
    return () => {
        if (scannerAnimationRef.current) cancelAnimationFrame(scannerAnimationRef.current);
    }
  }, [isScannerOpen, tick]);

  // Auto-search after a QR code is scanned and sets the exhibitId
  useEffect(() => {
    if(currentExhibit === null && exhibitId !== '') {
        handleSearch();
    }
  }, [exhibitId, currentExhibit, handleSearch]);

  const handleLanguageSelect = (track: AudioTrack) => {
    setSelectedTrack(track);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error("Audio play failed:", e));
    }
  };
  
  useEffect(() => {
      const audio = audioRef.current;
      if (!audio) return;
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      const handleEnded = () => setIsPlaying(false);
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('ended', handleEnded);
      return () => {
          audio.removeEventListener('play', handlePlay);
          audio.removeEventListener('pause', handlePause);
          audio.removeEventListener('ended', handleEnded);
      };
  }, []);

  if (!selectedLanguage) return null;

  return (
    <>
      {isScannerOpen && (
          <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
              <video ref={videoRef} className="absolute top-0 left-0 w-full h-full object-cover" />
              <canvas ref={canvasRef} className="hidden" />
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center z-10 pointer-events-none">
                  <div className="w-64 h-64 border-4 border-white border-dashed rounded-lg" />
              </div>
              <p className="z-10 text-white text-lg mt-72 bg-black bg-opacity-50 p-2 rounded">Align QR code within the frame</p>
              <button onClick={() => setIsScannerOpen(false)} className="absolute top-4 right-4 z-20 p-2 bg-white rounded-full">
                  <CloseIcon className="h-6 w-6 text-black"/>
              </button>
          </div>
      )}
      <div className="container mx-auto max-w-3xl">
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg">
          <div className="flex justify-between items-start">
              <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                  Find Exhibit Audio Guide
                  </h2>
                  <p className="text-gray-600 mb-6">Selected Language: <span className="font-semibold">{selectedLanguage.name}</span></p>
              </div>
              <Link to="/" className="text-sm text-blue-600 hover:underline whitespace-nowrap">Change Language</Link>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mb-6">
            <div className="relative flex-grow">
              <QrCodeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={exhibitId}
                onChange={(e) => setExhibitId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter Exhibit ID"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button onClick={() => setIsScannerOpen(true)} className="flex items-center justify-center gap-2 w-full sm:w-auto bg-gray-600 text-white font-semibold px-4 py-3 rounded-md hover:bg-gray-700 transition duration-200">
                <CameraIcon className="h-5 w-5"/>
                Scan QR Code
            </button>
            <button
              onClick={handleSearch}
              className="w-full sm:w-auto bg-blue-600 text-white font-semibold px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
            >
              Search
            </button>
          </div>

          {error && <p className="text-red-500 text-center">{error}</p>}
        </div>

        {currentExhibit && (
          <div className="mt-8 bg-white rounded-lg shadow-lg overflow-hidden">
            <img
              src={currentExhibit.imageUrl}
              alt={currentExhibit.name}
              className="w-full h-64 object-contain bg-gray-100"
            />
            <div className="p-6 sm:p-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{currentExhibit.name}</h3>
              <p className="text-gray-600 leading-relaxed">{currentExhibit.description}</p>
              
              {selectedTrack && (
                <div className="mt-8">
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold text-gray-700 mb-2">Select Language</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentExhibit.audioTracks.map((track) => (
                        <button
                          key={track.id}
                          onClick={() => handleLanguageSelect(track)}
                          className={`px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${
                            selectedTrack.id === track.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {track.langName}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-100 rounded-lg p-4 flex items-center gap-4">
                    <button onClick={togglePlayPause} className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      {isPlaying ? <PauseIcon className="h-6 w-6" /> : <PlayIcon className="h-6 w-6" />}
                    </button>
                    <div>
                      <p className="font-semibold text-gray-800">Now Playing</p>
                      <p className="text-sm text-gray-600">{selectedTrack.langName} Narration</p>
                    </div>
                    <audio ref={audioRef} src={selectedTrack.url} className="hidden" onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onEnded={() => setIsPlaying(false)} />
                  </div>
                </div>
              )}

              {currentExhibit.audioTracks.length === 0 && (
                  <p className="mt-6 text-center text-gray-500">No audio guides available for this exhibit.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default VisitorPage;
