    // Videoconferencia.jsx
    import React, { useEffect, useRef } from 'react';

    const Videoconferencia = ({ roomName, displayName }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        const domain = 'meet.jit.si';
        const options = {
        roomName: roomName,
        parentNode: containerRef.current,
        width: '100%',
        height: 600,
        userInfo: {
            displayName: displayName,
        },
        configOverwrite: {
            startWithAudioMuted: true,
            startWithVideoMuted: true,
        },
        interfaceConfigOverwrite: {
            filmStripOnly: false,
            SHOW_JITSI_WATERMARK: false,
        },
        };
        const api = new window.JitsiMeetExternalAPI(domain, options);

        return () => api.dispose();
    }, [roomName, displayName]);

    return <div ref={containerRef} style={{ width: '100%', height: '600px' }} />;
    };

    export default Videoconferencia;
