import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { 
  FaPhone, 
  FaPhoneSlash, 
  FaUsers, 
  FaMicrophone, 
  FaMicrophoneSlash,
  FaVideo, 
  FaVideoSlash,
  FaArrowLeft, 
  FaExclamationTriangle,
  FaSync,
  FaCheckCircle,
  FaCog,
  FaExpand,
  FaCompress,
  FaWifi,
  FaSignal,
  FaDesktop,
  FaVolumeUp
} from 'react-icons/fa';
import './VideoCallPage.css';

const VideoCallPage = () => {
  const navigate = useNavigate();
  const { teamId } = useParams();
  
  // App ID configuration
  const AGORA_CONFIGS = [
    {
      appId: '50e028a1a8224f78ab8d78beb6041a8b',
      name: 'Primary',
      region: 'global',
      requiresToken: true
    },
    {
      appId: process.env.REACT_APP_AGORA_BACKUP_ID || '50e028a1a8224f78ab8d78beb6041a8b',
      name: 'Backup',
      region: 'us',
      requiresToken: true
    },
    {
      appId: 'e7f6e9aeecf14b2ba10e3f40be9f56e7',
      name: 'Legacy',
      region: 'global',
      requiresToken: false
    }
  ];
  
  // State management
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [callError, setCallError] = useState(null);
  const [teamInfo, setTeamInfo] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [connectionState, setConnectionState] = useState('DISCONNECTED');
  const [networkQuality, setNetworkQuality] = useState({ uplinkNetworkQuality: 0, downlinkNetworkQuality: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentConfigIndex, setCurrentConfigIndex] = useState(0);
  const [troubleshootingSteps, setTroubleshootingSteps] = useState([]);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Initializing...');
  const [agoraToken, setAgoraToken] = useState(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [localVolume, setLocalVolume] = useState(50);
  const [isConnectionVerified, setIsConnectionVerified] = useState(false);
  const [sameConfigRetryCount, setSameConfigRetryCount] = useState(0);
  const [networkWarning, setNetworkWarning] = useState(null);
  
  // Refs
  const agoraEngineRef = useRef(null);
  const localVideoRef = useRef(null);
  const localAudioTrackRef = useRef(null);
  const localVideoTrackRef = useRef(null);
  const screenTrackRef = useRef(null);
  const channelRef = useRef(null);
  const retryTimeoutRef = useRef(null);
  const cleanupInProgressRef = useRef(false);
  const connectionStateRef = useRef('DISCONNECTED');
  const uidRef = useRef(null);
  const publishedTracksRef = useRef({ video: false, audio: false });
  const trackPublicationLock = useRef(false);

  // Get current configuration
  const getCurrentConfig = () => AGORA_CONFIGS[currentConfigIndex];

  // Generate secure channel name
  const generateChannelName = () => {
    if (!teamInfo) return 'default-channel';
    const sanitizedName = teamInfo.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const timestamp = Math.floor(Date.now() / 1000);
    return `team-${sanitizedName}-${teamId}-${timestamp}`.substring(0, 64);
  };

  // Generate unique user ID
  const generateUserId = () => {
    if (uidRef.current) return uidRef.current;
    
    const currentStudent = JSON.parse(localStorage.getItem('currentStudent') || '{}');
    const studentId = currentStudent.studentId || '';
    const numericId = studentId.replace(/\D/g, '');
    const sessionId = Math.floor(Math.random() * 10000);
    const uid = numericId ? `${numericId}-${sessionId}` : `${Math.floor(Math.random() * 1000000)}-${sessionId}`;
    
    uidRef.current = uid;
    return uid;
  };

  // Token fetching
  const fetchAgoraToken = async (channelName, uid, config) => {
    try {
      setLoadingMessage('Authenticating with server...');
      
      if (!config.requiresToken) {
        console.log('Using App ID without token');
        return null;
      }
      
      const token = localStorage.getItem('studentToken') || localStorage.getItem('token');
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/agora/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          channelName,
          uid: uid.toString(),
          appId: config.appId
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setAgoraToken(data.token);
        return data.token;
      } else {
        console.warn('Token fetch failed, trying without token');
        return null;
      }
    } catch (error) {
      console.error('Token fetch error:', error);
      return null;
    }
  };

  // Load team information
  useEffect(() => {
    const fetchTeamInfo = async () => {
      try {
        setLoadingMessage('Loading team information...');
        const token = localStorage.getItem('studentToken') || localStorage.getItem('token');
        
        if (!token) {
          setCallError('Authentication required. Please log in again.');
          return;
        }

        const response = await fetch(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/teams/${teamId}`, 
          {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.ok) {
          const team = await response.json();
          setTeamInfo(team);
        } else {
          setCallError('Failed to load team information');
        }
      } catch (error) {
        console.error('Error fetching team info:', error);
        setCallError('Network error: Failed to load team information');
      }
    };

    if (teamId) {
      fetchTeamInfo();
    }
  }, [teamId]);

  // Track cleanup
  const cleanupAllTracks = async () => {
    if (cleanupInProgressRef.current) return;
    
    cleanupInProgressRef.current = true;
    
    try {
      // Unpublish all tracks
      if (agoraEngineRef.current && isJoined) {
        try {
          await agoraEngineRef.current.unpublish();
        } catch (error) {
          console.error('Error unpublishing tracks:', error);
        }
      }
      
      // Close individual tracks
      [screenTrackRef, localVideoTrackRef, localAudioTrackRef].forEach((trackRef) => {
        if (trackRef.current) {
          try {
            trackRef.current.stop();
            trackRef.current.close();
          } catch (error) {
            console.error('Error cleaning track:', error);
          } finally {
            trackRef.current = null;
          }
        }
      });
      
      // Clear video display
      if (localVideoRef.current) {
        localVideoRef.current.innerHTML = '';
      }
      
    } catch (error) {
      console.error('Error during cleanup:', error);
    } finally {
      cleanupInProgressRef.current = false;
      publishedTracksRef.current = { video: false, audio: false };
    }
  };

  // Connection stability check
  const checkConnectionStability = async (agoraEngine) => {
    return new Promise((resolve) => {
      let stableCount = 0;
      const maxStableCount = 3;
      const interval = 500;
      
      const check = () => {
        if (agoraEngine.connectionState === 'CONNECTED') {
          stableCount++;
          if (stableCount >= maxStableCount) {
            resolve(true);
          } else {
            setTimeout(check, interval);
          }
        } else {
          resolve(false);
        }
      };
      
      check();
    });
  };

  // Create and publish tracks
  const createAndPublishTracks = async () => {
    if (trackPublicationLock.current) {
      console.warn('Track publication already in progress, skipping');
      return;
    }
    
    trackPublicationLock.current = true;
    
    try {
      // Clean up existing tracks
      await cleanupAllTracks();
      
      // Create audio track
      const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack({
        encoderConfig: {
          sampleRate: 48000,
          stereo: true,
          bitrate: 256,
        },
        AEC: true,
        AGC: true,
        ANS: true,
      });
      
      // Enhanced video configuration with adaptive bitrate
      const localVideoTrack = await AgoraRTC.createCameraVideoTrack({
        encoderConfig: {
          width: { ideal: 1280, max: 1280, min: 640 },
          height: { ideal: 720, max: 720, min: 480 },
          frameRate: { ideal: 24, max: 30, min: 15 },
          bitrateMin: 600,
          bitrateMax: 2000,
          degradationPreference: 'maintain-quality',
        },
        facingMode: 'user',
        optimizationMode: 'motion',
      });

      localAudioTrackRef.current = localAudioTrack;
      localVideoTrackRef.current = localVideoTrack;

      // Play local video
      if (localVideoRef.current) {
        localVideoTrack.play(localVideoRef.current);
      }

      // Verify connection
      if (!agoraEngineRef.current || agoraEngineRef.current.connectionState !== 'CONNECTED') {
        throw new Error('Connection lost before publishing');
      }

      if (publishedTracksRef.current.video) {
        console.warn('Video track already published, skipping publication');
        return;
      }

      // Publish tracks
      await agoraEngineRef.current.publish([localAudioTrack, localVideoTrack]);
      publishedTracksRef.current = { video: true, audio: true };
      
      setLoadingMessage('Connected successfully!');
      setIsConnectionVerified(true);
      
    } catch (error) {
      console.error('Track creation failed:', error);
      throw error;
    } finally {
      trackPublicationLock.current = false;
    }
  };

  // Agora event listeners
  const setupAgoraEventListeners = (agoraEngine) => {
    agoraEngine.on('connection-state-change', (curState, revState, reason) => {
      console.log(`Connection state: ${curState}, reason: ${reason}`);
      setConnectionState(curState);
      connectionStateRef.current = curState;
      
      if (curState === 'CONNECTED' && revState === 'CONNECTING') {
        setIsJoined(true);
      } else if (curState === 'DISCONNECTED' || curState === 'FAILED') {
        setIsJoined(false);
        if (reason === 'SERVER_ERROR' || reason === 'JOIN_FAILED') {
          handleConnectionFailure();
        }
      }
    });

    agoraEngine.on('user-joined', async (user) => {
      setParticipants(prev => {
        const exists = prev.find(p => p.uid === user.uid);
        return exists ? prev : [...prev, user];
      });
    });

    agoraEngine.on('user-left', (user) => {
      setParticipants(prev => prev.filter(p => p.uid !== user.uid));
      const remoteContainer = document.getElementById(`remote-${user.uid}`);
      if (remoteContainer) {
        remoteContainer.innerHTML = '';
      }
    });

    agoraEngine.on('user-published', async (user, mediaType) => {
      try {
        await agoraEngine.subscribe(user, mediaType);
        
        if (mediaType === 'video') {
          const remoteContainer = document.getElementById(`remote-${user.uid}`) || 
                                 createRemoteVideoContainer(user.uid);
          if (user.videoTrack && remoteContainer) {
            user.videoTrack.play(remoteContainer);
          }
        }
        
        if (mediaType === 'audio' && user.audioTrack) {
          user.audioTrack.play();
          user.audioTrack.setVolume(localVolume);
        }
      } catch (error) {
        console.error('Failed to subscribe:', error);
      }
    });

    agoraEngine.on('user-unpublished', (user, mediaType) => {
      if (mediaType === 'video') {
        const remoteContainer = document.getElementById(`remote-${user.uid}`);
        if (remoteContainer) {
          remoteContainer.innerHTML = '';
        }
      }
    });

    agoraEngine.on('network-quality', (stats) => {
      setNetworkQuality(stats);
      handleNetworkQualityChange(stats);
    });

    // Handle video bitrate warnings without failing call
    agoraEngine.on('exception', async (event) => {
      // 1003 = SEND_VIDEO_BITRATE_TOO_LOW
      // 1004 = SEND_VIDEO_BITRATE_TOO_HIGH
      // 3003 = SEND_VIDEO_BITRATE_TOO_LOW_RECOVER
      if ([1003, 1004, 2003, 3003].includes(event.code)) { 
        console.warn(`Agora network warning (${event.code}):`, event.msg);
        
        let friendlyMessage = event.msg;
        if (event.code === 1003) {
          friendlyMessage = "Your video bitrate is too low. Reducing quality to improve stability.";
        } else if (event.code === 3003) {
          friendlyMessage = "Video quality has recovered after a network issue.";
        }
        
        setNetworkWarning({
          code: event.code,
          message: friendlyMessage,
          isCritical: false
        });
        
        // Automatically adjust quality for 1003 warning
        if (event.code === 1003 && localVideoTrackRef.current) {
          try {
            // Temporarily reduce video quality to improve stability
            await localVideoTrackRef.current.setEncoderConfiguration({
              width: 640,
              height: 480,
              frameRate: 15,
              bitrateMin: 300,
              bitrateMax: 800,
            });
            console.log('Reduced video quality due to bitrate warning');
          } catch (adjustError) {
            console.error('Failed to adjust video quality:', adjustError);
          }
        }
        // Automatically restore quality for 3003 warning
        else if (event.code === 3003 && localVideoTrackRef.current && !isScreenSharing) {
          try {
            // Restore original video quality
            await localVideoTrackRef.current.setEncoderConfiguration({
              width: { ideal: 1280 },
              height: { ideal: 720 },
              frameRate: 24,
              bitrateMin: 600,
              bitrateMax: 2000,
            });
            console.log('Restored video quality after recovery');
          } catch (adjustError) {
            console.error('Failed to restore video quality:', adjustError);
          }
        }
      } else {
        handleAgoraError(new Error(`${event.code}: ${event.msg}`));
      }
    });
  };

  // Network quality monitoring
  const handleNetworkQualityChange = (stats) => {
    const uplink = stats.uplinkNetworkQuality;
    const downlink = stats.downlinkNetworkQuality;
    
    if (uplink >= 4 || downlink >= 4) {
      setNetworkWarning({
        code: 'NETWORK_POOR',
        message: 'Poor network connection detected',
        isCritical: false
      });
    } else if (uplink <= 2 && downlink <= 2 && networkWarning?.code === 'NETWORK_POOR') {
      setNetworkWarning(null);
    }
  };

  // Handle connection failures
  const handleConnectionFailure = () => {
    if (connectionAttempts < AGORA_CONFIGS.length - 1) {
      setConnectionAttempts(prev => prev + 1);
      setCurrentConfigIndex(prev => prev + 1);
      
      retryTimeoutRef.current = setTimeout(() => {
        setCallError(null);
        setLoadingMessage('Trying alternative configuration...');
        initializeAgora();
      }, 3000);
    } else {
      setCallError('Unable to establish connection with any server configuration.');
    }
  };

  // Handle UID conflicts
  const handleUidConflict = async (agoraEngine, config, channel, token) => {
    const newUid = generateUserId();
    try {
      await agoraEngine.leave();
      await agoraEngine.join(config.appId, channel, token, newUid);
      return true;
    } catch (rejoinError) {
      return false;
    }
  };

  // Initialize Agora
  const initializeAgora = async () => {
    try {
      setIsLoading(true);
      setCallError(null);
      setNetworkWarning(null);
      setIsConnectionVerified(false);
      publishedTracksRef.current = { video: false, audio: false };
      
      // Create Agora engine
      setLoadingMessage('Initializing video engine...');
      const agoraEngine = AgoraRTC.createClient({ 
        mode: 'rtc', 
        codec: 'vp8'
      });
      
      agoraEngineRef.current = agoraEngine;
      setupAgoraEventListeners(agoraEngine);
      
      // Generate channel and user info
      const channel = generateChannelName();
      const userId = generateUserId();
      channelRef.current = channel;
      
      const config = getCurrentConfig();
      
      // Get authentication token
      const token = await fetchAgoraToken(channel, userId, config);
      
      setLoadingMessage('Connecting to video conference...');
      
      // Join channel
      try {
        await agoraEngine.join(config.appId, channel, token, userId);
      } catch (joinError) {
        if (joinError.code === 'UID_CONFLICT') {
          const success = await handleUidConflict(agoraEngine, config, channel, token);
          if (!success) throw new Error('Failed to resolve UID conflict');
        } else if (joinError.code === 'CAN_NOT_GET_GATEWAY_SERVER' || 
                   joinError.code === 'INVALID_VENDOR_KEY') {
          if (connectionAttempts < AGORA_CONFIGS.length - 1) {
            handleConnectionFailure();
            return;
          }
        }
        throw joinError;
      }
      
      // Verify connection
      if (agoraEngine.connectionState !== 'CONNECTED') {
        throw new Error(`Join incomplete. State: ${agoraEngine.connectionState}`);
      }
      
      // Connection stability check
      setLoadingMessage('Verifying connection stability...');
      const isStable = await checkConnectionStability(agoraEngine);
      
      if (!isStable || agoraEngine.connectionState !== 'CONNECTED') {
        throw new Error(`Connection unstable. State: ${agoraEngine.connectionState}`);
      }
      
      setConnectionState('CONNECTED');
      setIsJoined(true);
      
      // Create and publish tracks
      setLoadingMessage('Setting up camera and microphone...');
      await createAndPublishTracks();
      
      setConnectionAttempts(0);
      setSameConfigRetryCount(0);
      
    } catch (error) {
      console.error('Agora initialization failed:', error);
      
      // Same config retry logic
      if (sameConfigRetryCount < 2 && error.message.includes('Connection lost')) {
        console.warn(`Retrying same config (${sameConfigRetryCount + 1}/2)`);
        setSameConfigRetryCount(prev => prev + 1);
        setLoadingMessage('Reconnecting to the same server...');
        setTimeout(() => initializeAgora(), 2000);
      } else {
        handleAgoraError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize when team info loads
  useEffect(() => {
    if (!teamInfo) return;

    initializeAgora();

    return () => {
      leaveCall();
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [teamInfo]);

  // Error handling
  const handleAgoraError = (error) => {
    let errorMessage = 'An error occurred with the video call.';
    let steps = [];
    
    const errorCode = error.code || error.message || '';
    
    switch (true) {
      case errorCode.includes('1003'): // SEND_VIDEO_BITRATE_TOO_LOW
        errorMessage = 'Video quality issue detected.';
        steps = [
          'Your video bitrate is too low for the server',
          'Reducing video quality to improve stability',
          'Ensure you have a stable internet connection',
          'Turning off other bandwidth-intensive applications'
        ];
        handleRetryWithDelay(1500);
        break;
        
      case errorCode.includes('CAN_NOT_PUBLISH_MULTIPLE_VIDEO_TRACKS'):
        errorMessage = 'Video track conflict detected.';
        steps = [
          'The system detected multiple video tracks',
          'Restarting media devices',
          'Trying to reconnect automatically',
          'If issue persists, try refreshing the page'
        ];
        handleRetryWithDelay(1500);
        break;
        
      case errorCode.includes('Connection lost'):
        errorMessage = 'Connection lost during setup.';
        steps = [
          'Network instability detected during connection',
          'Trying alternative configuration',
          'Ensure you have a stable internet connection'
        ];
        handleConnectionFailure();
        break;
        
      case errorCode.includes('2003'): // SEND_AUDIO_BITRATE_TOO_LOW
        errorMessage = 'Audio quality issue detected.';
        steps = [
          'Your audio bitrate is too low for the server',
          'Switching to higher quality audio settings',
          'Trying to reconnect automatically'
        ];
        handleRetryWithDelay(1500);
        break;
        
      case errorCode.includes('3003'): // SEND_VIDEO_BITRATE_TOO_LOW_RECOVER
        errorMessage = 'Network recovering after video quality issue.';
        steps = [
          'Your video quality was temporarily reduced',
          'Connection is now recovering',
          'Video quality will return to normal shortly'
        ];
        setNetworkWarning({
          code: 3003,
          message: 'Video quality is recovering after network issue',
          isCritical: false
        });
        return; // Don't show error page for this recoverable state
        
      case errorCode.includes('CAN_NOT_GET_GATEWAY_SERVER'):
        errorMessage = 'Cannot connect to video servers.';
        steps = [
          'Check your internet connection',
          'Try refreshing the page',
          'Contact support if issue persists'
        ];
        break;
        
      case errorCode.includes('INVALID_OPERATION'):
        errorMessage = 'Connection timing issue detected. Retrying...';
        steps = [
          'This is usually a temporary timing issue',
          'The system will automatically retry',
          'Please wait a moment'
        ];
        setTimeout(() => handleRetry(), 3000);
        break;
        
      case errorCode.includes('PERMISSION_DENIED'):
        errorMessage = 'Camera and microphone access denied.';
        steps = [
          'Click "Allow" when prompted for permissions',
          'Check browser settings for media access',
          'Refresh the page and try again'
        ];
        break;
      
      case errorCode.includes('UID_CONFLICT'):
        errorMessage = 'User ID conflict detected.';
        steps = [
          'Another user with the same ID is already in the call',
          'The system has generated a new ID for you',
          'Trying to reconnect automatically'
        ];
        handleRetryWithDelay(1500);
        break;
        
      default:
        errorMessage = `Call failed: ${error.message || 'Unknown error'}`;
        steps = [
          'Check your internet connection',
          'Try refreshing the page',
          'Ensure camera/microphone permissions are granted'
        ];
    }
    
    setCallError(errorMessage);
    setTroubleshootingSteps(steps);
  };

  // Delayed retry function
  const handleRetryWithDelay = (delay) => {
    setLoadingMessage('Preparing to reconnect...');
    setTimeout(() => {
      handleRetry();
    }, delay);
  };

  // Media controls
  const toggleAudio = async () => {
    if (!localAudioTrackRef.current) return;
    
    try {
      if (isAudioMuted) {
        await localAudioTrackRef.current.setMuted(false);
        setIsAudioMuted(false);
      } else {
        await localAudioTrackRef.current.setMuted(true);
        setIsAudioMuted(true);
      }
      
      // Video quality adjustment when audio is off
      if (localVideoTrackRef.current && !isAudioMuted) {
        // When turning audio back on, restore video quality
        await localVideoTrackRef.current.setEncoderConfiguration({
          width: { ideal: 1280, max: 1280, min: 640 },
          height: { ideal: 720, max: 720, min: 480 },
          frameRate: { ideal: 24, max: 30, min: 15 },
          bitrateMin: 600,
          bitrateMax: 2000,
        });
      } else if (localVideoTrackRef.current && isAudioMuted) {
        // When muting audio, reduce video quality to free up bandwidth
        await localVideoTrackRef.current.setEncoderConfiguration({
          width: 640,
          height: 480,
          frameRate: 15,
          bitrateMin: 300,
          bitrateMax: 800,
        });
      }
    } catch (error) {
      console.error('Failed to toggle audio:', error);
    }
  };

  const toggleVideo = async () => {
    if (!localVideoTrackRef.current) return;
    
    try {
      if (isVideoMuted) {
        await localVideoTrackRef.current.setEnabled(true);
        setIsVideoMuted(false);
      } else {
        await localVideoTrackRef.current.setEnabled(false);
        setIsVideoMuted(true);
      }
    } catch (error) {
      console.error('Failed to toggle video:', error);
    }
  };

  // Screen sharing
  const toggleScreenShare = async () => {
    if (trackPublicationLock.current) {
      console.warn('Track operation already in progress, skipping screen share toggle');
      return;
    }
    
    trackPublicationLock.current = true;
    
    try {
      if (!isScreenSharing) {
        console.log('Starting screen share...');
        
        const screenTrack = await AgoraRTC.createScreenVideoTrack({
          encoderConfig: "720p_1",
          optimizationMode: "detail"
        });
        
        // Unpublish camera before publishing screen
        if (localVideoTrackRef.current && agoraEngineRef.current) {
          await agoraEngineRef.current.unpublish([localVideoTrackRef.current]);
          publishedTracksRef.current.video = false;
          
          // Close camera track
          localVideoTrackRef.current.stop();
          localVideoTrackRef.current.close();
          localVideoTrackRef.current = null;
        }
        
        screenTrackRef.current = screenTrack;
        await agoraEngineRef.current.publish([screenTrack]);
        publishedTracksRef.current.video = true;
        
        if (localVideoRef.current) {
          screenTrack.play(localVideoRef.current);
        }
        
        setIsScreenSharing(true);
        
        screenTrack.on("track-ended", () => {
          console.log('Screen share ended by user');
          stopScreenShare();
        });
        
      } else {
        await stopScreenShare();
      }
    } catch (error) {
      console.error('Screen sharing error:', error);
      setCallError(`Screen sharing failed: ${error.message}`);
    } finally {
      trackPublicationLock.current = false;
    }
  };

  const stopScreenShare = async () => {
    try {
      if (screenTrackRef.current && agoraEngineRef.current) {
        await agoraEngineRef.current.unpublish([screenTrackRef.current]);
        publishedTracksRef.current.video = false;
        screenTrackRef.current.stop();
        screenTrackRef.current.close();
        screenTrackRef.current = null;
      }
      
      // Recreate camera track
      try {
        const newVideoTrack = await AgoraRTC.createCameraVideoTrack({
          encoderConfig: {
            width: { ideal: 1280 }, 
            height: { ideal: 720 }, 
            frameRate: 24,
            bitrateMin: 600,
            bitrateMax: 2000,
          },
          facingMode: 'user',
        });
        
        localVideoTrackRef.current = newVideoTrack;
        await agoraEngineRef.current.publish([newVideoTrack]);
        publishedTracksRef.current.video = true;
        
        if (localVideoRef.current) {
          newVideoTrack.play(localVideoRef.current);
        }
      } catch (cameraError) {
        console.error('Failed to resume camera:', cameraError);
      }
      
      setIsScreenSharing(false);
    } catch (error) {
      console.error('Error stopping screen share:', error);
      setIsScreenSharing(false);
    }
  };

  // Create remote video container
  const createRemoteVideoContainer = (uid) => {
    const existingContainer = document.getElementById(`remote-${uid}`);
    if (existingContainer) return existingContainer;
    
    const remoteContainer = document.createElement('div');
    remoteContainer.id = `remote-${uid}`;
    remoteContainer.className = 'remote-video-player';
    
    const videoGrid = document.querySelector('.video-grid');
    if (videoGrid) {
      const videoItem = document.createElement('div');
      videoItem.className = 'video-item remote-video';
      videoItem.innerHTML = `<div class="video-label"><span>Participant ${uid}</span></div>`;
      videoItem.insertBefore(remoteContainer, videoItem.firstChild);
      videoGrid.appendChild(videoItem);
    }
    
    return remoteContainer;
  };

  // Volume control
  const handleVolumeChange = (volume) => {
    setLocalVolume(volume);
    participants.forEach(participant => {
      if (participant.audioTrack) {
        participant.audioTrack.setVolume(volume);
      }
    });
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Leave call
  const leaveCall = async () => {
    try {
      await cleanupAllTracks();
      
      if (agoraEngineRef.current && isJoined) {
        await agoraEngineRef.current.leave();
      }
      
      const videoGrid = document.querySelector('.video-grid');
      if (videoGrid) {
        videoGrid.querySelectorAll('.remote-video').forEach(video => video.remove());
      }
      
      setIsJoined(false);
      setParticipants([]);
      setConnectionState('DISCONNECTED');
      connectionStateRef.current = 'DISCONNECTED';
      setIsAudioMuted(false);
      setIsVideoMuted(false);
      setIsScreenSharing(false);
      setIsConnectionVerified(false);
      uidRef.current = null;
      setSameConfigRetryCount(0);
      setNetworkWarning(null);
      
    } catch (error) {
      console.error('Error leaving call:', error);
    }
  };

  const handleBackToChat = async () => {
    await leaveCall();
    navigate('/student-dashboard?tab=chat', { replace: true });
  };

  const handleRetry = () => {
    setCallError(null);
    setNetworkWarning(null);
    setTroubleshootingSteps([]);
    setIsLoading(true);
    setConnectionAttempts(0);
    setCurrentConfigIndex(0);
    setSameConfigRetryCount(0);
    initializeAgora();
  };

  // Get connection quality
  const getConnectionQuality = () => {
    const quality = Math.min(networkQuality.uplinkNetworkQuality, networkQuality.downlinkNetworkQuality);
    switch (quality) {
      case 1: return { color: '#10b981', text: 'Excellent', icon: FaSignal };
      case 2: return { color: '#10b981', text: 'Good', icon: FaSignal };
      case 3: return { color: '#f59e0b', text: 'Fair', icon: FaWifi };
      case 4: return { color: '#ef4444', text: 'Poor', icon: FaWifi };
      case 5: return { color: '#ef4444', text: 'Very Poor', icon: FaWifi };
      default: return { color: '#6b7280', text: 'Unknown', icon: FaWifi };
    }
  };

  // Error page render
  if (callError) {
    return (
      <div className="call-error-page">
        <div className="error-content">
          <div className="error-icon">
            <FaExclamationTriangle />
          </div>
          <h2>Video Call Failed</h2>
          <p className="error-message">{callError}</p>
          
          <div className="error-details">
            <div className="detail-item">
              <strong>App ID:</strong> {getCurrentConfig().appId}
            </div>
            <div className="detail-item">
              <strong>Channel:</strong> {channelRef.current || 'Not created'}
            </div>
            <div className="detail-item">
              <strong>Team:</strong> {teamInfo?.name || 'Loading...'}
            </div>
            <div className="detail-item">
              <strong>Status:</strong> {connectionState}
            </div>
            <div className="detail-item">
              <strong>Attempts:</strong> {connectionAttempts + 1}/{AGORA_CONFIGS.length}
            </div>
            <div className="detail-item">
              <strong>Retries:</strong> {sameConfigRetryCount}
            </div>
          </div>
          
          {troubleshootingSteps.length > 0 && (
            <div className="troubleshooting">
              <h4>Troubleshooting Steps:</h4>
              <ul>
                {troubleshootingSteps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="error-actions">
            <button className="retry-btn" onClick={handleRetry}>
              <FaSync />
              Try Again
            </button>
            <button className="back-btn" onClick={() => navigate('/student-dashboard?tab=chat')}>
              <FaArrowLeft />
              Back to Chat
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="video-call-page">
      {/* Network warning banner */}
      {networkWarning && (
        <div className={`network-warning ${networkWarning.code === 3003 ? 'recovering' : ''}`}>
          <FaExclamationTriangle />
          <span>
            {networkWarning.code === 3003 
              ? 'Network recovering: Video quality temporarily reduced' 
              : networkWarning.message}
          </span>
          {networkWarning.code === 3003 && (
            <div className="recovery-progress"></div>
          )}
          <button onClick={() => setNetworkWarning(null)}>Dismiss</button>
        </div>
      )}
      
      {/* Call Header */}
      <div className="call-header">
        <div className="call-info">
          <h2>{teamInfo?.name || 'Team Video Call'}</h2>
          <div className="call-status">
            {isJoined ? (
              <>
                <div className="status-indicator active">
                  <FaCheckCircle />
                  <span>Connected</span>
                </div>
                <div className="participants-count">
                  <FaUsers />
                  <span>{participants.length + 1} participant{participants.length === 0 ? '' : 's'}</span>
                </div>
                <div className="connection-quality">
                  {(() => {
                    const quality = getConnectionQuality();
                    return (
                      <>
                        <quality.icon style={{ color: quality.color }} />
                        <span>{quality.text}</span>
                      </>
                    );
                  })()}
                </div>
                <div className="config-info">
                  <FaCog />
                  <span>{getCurrentConfig().name}</span>
                </div>
              </>
            ) : (
              <div className="status-indicator connecting">
                <div className="loading-dots"></div>
                <span>{loadingMessage}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="call-actions">
          {isJoined && (
            <>
              <button 
                className={`control-btn ${isAudioMuted ? 'muted' : ''}`}
                onClick={toggleAudio}
                title={isAudioMuted ? 'Unmute microphone' : 'Mute microphone'}
              >
                {isAudioMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
              </button>
              
              <button 
                className={`control-btn ${isVideoMuted ? 'muted' : ''}`}
                onClick={toggleVideo}
                title={isVideoMuted ? 'Turn on camera' : 'Turn off camera'}
              >
                {isVideoMuted ? <FaVideoSlash /> : <FaVideo />}
              </button>
              
              <button 
                className={`control-btn ${isScreenSharing ? 'active' : ''}`}
                onClick={toggleScreenShare}
                title={isScreenSharing ? 'Stop screen sharing' : 'Share screen'}
              >
                <FaDesktop />
              </button>
              
              <div className="volume-control">
                <FaVolumeUp />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={localVolume}
                  onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                  title="Adjust volume"
                />
              </div>
              
              <button 
                className="control-btn"
                onClick={toggleFullscreen}
                title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {isFullscreen ? <FaCompress /> : <FaExpand />}
              </button>
            </>
          )}
          
          <button 
            className="end-call-btn"
            onClick={handleBackToChat}
            title="End call and return to chat"
          >
            <FaPhoneSlash />
            End Call
          </button>
        </div>
      </div>

      {/* Video Container */}
      <div className="video-container">
        {isLoading ? (
          <div className="loading-overlay">
            <div className="loading-content">
              <div className="loading-spinner"></div>
              <h3>{loadingMessage}</h3>
              <div className="loading-details">
                <p><strong>Configuration:</strong> {getCurrentConfig().name}</p>
                <p><strong>App ID:</strong> {getCurrentConfig().appId}</p>
                <p><strong>Team:</strong> {teamInfo?.name || 'Loading...'}</p>
                {connectionAttempts > 0 && (
                  <p><strong>Attempt:</strong> {connectionAttempts + 1}/{AGORA_CONFIGS.length}</p>
                )}
                {sameConfigRetryCount > 0 && (
                  <p><strong>Retries:</strong> {sameConfigRetryCount}</p>
                )}
              </div>
              <p className="loading-tip">
                Setting up your video conference... This may take a moment.
              </p>
            </div>
          </div>
        ) : (
          <div className="video-grid">
            {/* Local Video */}
            <div className="video-item local-video">
              <div ref={localVideoRef} className="video-player"></div>
              <div className="video-label">
                <span>You {isScreenSharing ? '(Screen)' : ''}</span>
                <div className="video-controls">
                  {isAudioMuted && <FaMicrophoneSlash className="mute-indicator" />}
                  {isVideoMuted && <FaVideoSlash className="mute-indicator" />}
                </div>
              </div>
            </div>
            
            {participants.length === 0 && (
              <div className="video-item empty-slot">
                <div className="empty-content">
                  <FaUsers />
                  <span>Waiting for others to join...</span>
                  <p>Share the team name with your teammates</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCallPage;