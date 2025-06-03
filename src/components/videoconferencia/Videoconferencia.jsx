import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './Videoconferencia.css';

const Videoconferencia = () => {
  const { t } = useTranslation();
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  useEffect(() => {
    const initializeMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: isAudioEnabled,
          video: isVideoEnabled
        });
        setLocalStream(stream);
      } catch (error) {
        console.error('Error accessing media devices:', error);
      }
    };

    initializeMedia();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isAudioEnabled, isVideoEnabled]);

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  return (
    <div className="videoconferencia-container">
      <h1>{t('videoconferencia.titulo')}</h1>
      
      <div className="video-grid">
        <div className="video-container local">
          {localStream && (
            <video
              autoPlay
              muted
              playsInline
              ref={video => {
                if (video) video.srcObject = localStream;
              }}
            />
          )}
          <div className="video-label">{t('videoconferencia.tuCamara')}</div>
        </div>

        <div className="video-container remote">
          {remoteStream && (
            <video
              autoPlay
              playsInline
              ref={video => {
                if (video) video.srcObject = remoteStream;
              }}
            />
          )}
          <div className="video-label">{t('videoconferencia.participante')}</div>
        </div>
      </div>

      <div className="controls">
        <button
          className={`control-btn ${isAudioEnabled ? 'active' : ''}`}
          onClick={toggleAudio}
          title={isAudioEnabled ? t('videoconferencia.desactivarAudio') : t('videoconferencia.activarAudio')}
        >
          {isAudioEnabled ? '🎤' : '🔇'}
        </button>
        <button
          className={`control-btn ${isVideoEnabled ? 'active' : ''}`}
          onClick={toggleVideo}
          title={isVideoEnabled ? t('videoconferencia.desactivarVideo') : t('videoconferencia.activarVideo')}
        >
          {isVideoEnabled ? '📹' : '🚫'}
        </button>
        <button
          className="control-btn end-call"
          onClick={() => window.location.href = '/'}
          title={t('videoconferencia.terminarLlamada')}
        >
          📞
        </button>
      </div>
    </div>
  );
};

export default Videoconferencia; 