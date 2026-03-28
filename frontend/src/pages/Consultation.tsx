import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, MicOff, Camera, CameraOff, PhoneOff, MessageSquareText,
  Hand, Brain, Timer, Globe,
  Subtitles, Sparkles, Activity, Send, User, ChevronRight, ChevronLeft
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { useConsultationStore } from '../store/consultationStore';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export const Consultation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const {
    isMicOn, isCameraOn, isCaptionsOn, isSignDetectionOn,
    toggleMic, toggleCamera, toggleCaptions, toggleSignDetection,
    elapsedTime, setElapsedTime, startConsultation, endConsultation,
  } = useConsultationStore();

  const [showSidePanel, setShowSidePanel] = useState(true);
  const [activeTab, setActiveTab] = useState<'transcript' | 'ai' | 'chat'>('transcript');
  const [sessionIdentity, setSessionIdentity] = useState<{ role: 'doctor' | 'patient'; name: string } | null>(null);
  const [transcript, setTranscript] = useState<{ id: string, speaker: string, text: string, timestamp: string, source: string }[]>([]);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<{ text: string; sender: string; time: string }[]>([]);
  const [isPeerConnected, setIsPeerConnected] = useState(false);
  const [peerName, setPeerName] = useState<string>('');
  const [remoteIsMicOn, setRemoteIsMicOn] = useState(true);
  const [remoteIsCameraOn, setRemoteIsCameraOn] = useState(true);
  const [asrStatus, setAsrStatus] = useState<'idle' | 'listening' | 'error'>('idle');
  const [processedIds] = useState(new Set<string>()); // For de-duplication
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [remoteInterimTranscript, setRemoteInterimTranscript] = useState<string>('');
  const [asrLang, setAsrLang] = useState('en-US');
  const [slrSentence, setSlrSentence] = useState<string>('');
  const slrAccumulatorRef = useRef<string>("");
  const slrTimerRef = useRef<any>(null);
  const lastSignRef = useRef<string | null>(null);
  const lastSignTimeRef = useRef<number>(0);
  const holisticRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const isLeavingRef = useRef(false);
  const hasRemoteJoinedRef = useRef(false);
  const offerInProgressRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const recognitionRef = useRef<any>(null);
  const isRecognitionRunningRef = useRef(false);

  useEffect(() => {
    if (!sessionIdentity && user?.role) {
      setSessionIdentity({
        role: user.role === 'doctor' ? 'doctor' : 'patient',
        name: user.name || (user.role === 'doctor' ? 'Doctor' : 'Patient')
      });
    }
  }, [sessionIdentity, user]);

  const localRole: 'doctor' | 'patient' = sessionIdentity?.role || (user?.role === 'doctor' ? 'doctor' : 'patient');
  const localName = sessionIdentity?.name || user?.name || 'You';
  const isDoctor = localRole === 'doctor';
  const isPatient = localRole === 'patient';

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const createAndSendOffer = async () => {
    if (!isDoctor || !pcRef.current || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    if (!hasRemoteJoinedRef.current) return;
    if (offerInProgressRef.current) return;

    const pc = pcRef.current;

    if (pc.signalingState === 'have-local-offer' || pc.signalingState === 'have-remote-offer') {
      return;
    }

    offerInProgressRef.current = true;
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      wsRef.current.send(JSON.stringify({ type: 'offer', offer }));
    } catch (err) {
      console.error('Offer creation error', err);
    } finally {
      offerInProgressRef.current = false;
    }
  };

  useEffect(() => {
    if (!id || !sessionIdentity) return;
    startConsultation(id);

    timerRef.current = window.setInterval(() => {
      setElapsedTime(useConsultationStore.getState().elapsedTime + 1);
    }, 1000);

    const ws = new WebSocket(`ws://localhost:8000/api/signaling/${id}`);
    wsRef.current = ws;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
    pcRef.current = pc;

    pc.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setIsPeerConnected(true);
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'candidate', candidate: event.candidate }));
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        setIsPeerConnected(true);
      } else if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'closed') {
        setIsPeerConnected(false);
      } else if (pc.iceConnectionState === 'disconnected') {
        const hasRemoteStream = !!((remoteVideoRef.current?.srcObject as MediaStream | null)?.getTracks()?.length);
        if (!hasRemoteStream) setIsPeerConnected(false);
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        setIsPeerConnected(true);
      } else if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        setIsPeerConnected(false);
      }
    };

    pc.onnegotiationneeded = async () => {
      await createAndSendOffer();
    };

    ws.onmessage = async (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(message.offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          ws.send(JSON.stringify({ type: 'answer', answer }));
        } else if (message.type === 'answer') {
          await pc.setRemoteDescription(new RTCSessionDescription(message.answer));
        } else if (message.type === 'candidate' && message.candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(message.candidate));
        } else if (message.type === 'transcript') {
          const entry = message.data;
          const contentHash = `${entry.speaker}-${entry.text}-${entry.timestamp}`;
          if (!processedIds.has(entry.id) && !processedIds.has(contentHash)) {
            processedIds.add(entry.id);
            processedIds.add(contentHash);
            setTranscript(prev => [...prev, entry]);
          }
          setRemoteInterimTranscript(''); // Clear interim when final arrives
        } else if (message.type === 'transcript-interim') {
          setRemoteInterimTranscript(message.data.text);
        } else if (message.type === 'chat') {
          setChatMessages(prev => [...prev, message.data]);
        } else if (message.type === 'track-state') {
          if (message.dataType === 'mic') setRemoteIsMicOn(message.value);
          if (message.dataType === 'camera') setRemoteIsCameraOn(message.value);
        } else if (message.type === 'user-joined') {
          setPeerName(message.name || (message.role === 'doctor' ? 'Doctor' : 'Patient'));
          hasRemoteJoinedRef.current = true;
          setIsPeerConnected(true);
          if (isDoctor) {
            await createAndSendOffer();
          }
        } else if (message.type === 'user-disconnected') {
          setPeerName('');
          hasRemoteJoinedRef.current = false;
          setIsPeerConnected(false);
          // If the patient leaves, the doctor should be notified or eventually prompted to end
          if (!isPatient) {
             addToast('info', 'Patient has left the consultation.');
          }
        }
      } catch (err) { }
    };

    ws.onopen = async () => {
      ws.send(JSON.stringify({ type: 'user-joined', role: localRole, name: localName }));
    };

    // Initialize Speech Recognition
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = asrLang;

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimText = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimText += event.results[i][0].transcript;
          }
        }

        if (interimText) {
          setInterimTranscript(interimText);
          // Send interim to peer so they see 'typing...' effect
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
              type: 'transcript-interim',
              data: { speaker: localRole, text: interimText }
            }));
          }
        }

        if (finalTranscript) {
          setInterimTranscript('');
          
          const processFinal = async () => {
             let textToBroadCast = finalTranscript;
             
             // AI Intelligence: If lang isn't English, translate it properly
             if (asrLang !== 'en-US') {
                try {
                   const res = await fetch(`http://localhost:8000/api/consultations/translate?q=${encodeURIComponent(finalTranscript)}&from=en-US&to=${asrLang}`, {
                      method: 'POST'
                   });
                   if (res.ok) {
                      const data = await res.json();
                      textToBroadCast = data.translated || finalTranscript;
                   }
                } catch(e) {}
             }

             const entry = {
                id: `asr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
               speaker: localRole,
                text: textToBroadCast,
                timestamp: formatTime(useConsultationStore.getState().elapsedTime),
                source: 'asr'
             };

             const contentHash = `asr-${entry.speaker}-${entry.text.toLowerCase().trim()}`;
             if (!processedIds.has(entry.id) && !processedIds.has(contentHash)) {
                processedIds.add(entry.id);
                processedIds.add(contentHash);
                
                // Keep hash for 5 seconds to prevent short-term doubling
                setTimeout(() => processedIds.delete(contentHash), 5000);

                if (wsRef.current?.readyState === WebSocket.OPEN) {
                  wsRef.current.send(JSON.stringify({ type: 'transcript', data: entry }));
                }
                
                setTranscript(prev => [...prev, entry]);
             }
          };
          
          processFinal();
        }
      };

      recognition.onstart = () => {
        isRecognitionRunningRef.current = true;
        setAsrStatus('listening');
      };
      recognition.onend = () => {
        isRecognitionRunningRef.current = false;
        setAsrStatus('idle');
        const state = useConsultationStore.getState();
        if (state.isMicOn && recognitionRef.current) {
          try {
            if (!isRecognitionRunningRef.current) recognitionRef.current.start();
          } catch (e) { }
        }
      };
      recognition.onerror = (e: any) => {
        console.error("Speech Recognition Error:", e);
        isRecognitionRunningRef.current = false;
        setAsrStatus('error');
      };
      recognitionRef.current = recognition;
      if (useConsultationStore.getState().isMicOn) {
        try {
          console.log("Starting ASR engine...");
          if (!isRecognitionRunningRef.current) recognition.start();
        } catch (e) { }
      }
    }

    // Media Streams Configuration
    const setupMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 }
          },
          audio: true
        });
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        stream.getTracks().forEach(track => {
          console.log("Adding track to PC:", track.kind);
          pc.addTrack(track, stream);
        });

        // After local tracks are ready, negotiate if remote is in room
        if (hasRemoteJoinedRef.current) {
          await createAndSendOffer();
        }
      } catch (err) {
        console.error("Media Error:", err);
      }
    };

    setupMedia();

    return () => {
      console.log("Cleaning up ASR and PeerConnection for lang change or unmount...");
      if (timerRef.current) clearInterval(timerRef.current);
      if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.close();
      if (pcRef.current) pcRef.current.close();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          track.stop();
          track.enabled = false;
        });
        localStreamRef.current = null;
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) { }
        recognitionRef.current = null;
      }
      isRecognitionRunningRef.current = false;
    };
  }, [asrLang, id, sessionIdentity]); // Re-init when language or stable identity changes

  const handleSignDetection = (text: string | null) => {
    if (!text) {
      setInterimTranscript('');
      lastSignRef.current = null;
      return;
    }
    const state = useConsultationStore.getState();
    if (!state.isSignDetectionOn) return;

    const now = Date.now();
    const currentSentence = slrAccumulatorRef.current;
    const words = currentSentence.trim().split(' ');
    const lastWord = words[words.length - 1];

    // Aggressive de-duplication: No same word within 1.5s OR if it matches the last added word
    if (text === lastWord && (now - lastSignTimeRef.current) < 1500) {
      return;
    }

    if (text === lastSignRef.current && (now - lastSignTimeRef.current) < 1000) {
      return;
    }

    lastSignRef.current = text;
    lastSignTimeRef.current = now;

    // 1. Accumulate into current sentence
    setSlrSentence(prev => {
      const prevSentence = prev.trim();
      const newSentence = prevSentence ? `${prevSentence} ${text}` : text;
      slrAccumulatorRef.current = newSentence;
      return newSentence;
    });

    // 2. Broadcast as interim for unified display
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'transcript-interim',
        data: { speaker: localRole, text: `(Sign) ${text}` }
      }));
    }

    // 3. Reset 3-second sentence timer
    if (slrTimerRef.current) clearTimeout(slrTimerRef.current);
    slrTimerRef.current = setTimeout(async () => {
      const rawSentence = slrAccumulatorRef.current;
      if (!rawSentence || rawSentence.trim().length === 0) return;

      setSlrSentence("");
      slrAccumulatorRef.current = "";

      let finalMsg = rawSentence;
      try {
        const res = await fetch('http://localhost:8000/api/consultations/slr-polish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: rawSentence })
        });
        if (res.ok) {
          const data = await res.json();
          finalMsg = data.polished || rawSentence;
        }
      } catch (err) {
        console.warn('AI Polish failed, using raw keywords');
      }

      const entry = {
        id: `slr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        speaker: localRole,
        text: finalMsg,
        timestamp: formatTime(useConsultationStore.getState().elapsedTime),
        source: 'slr'
      };

      // Robust content-based de-duplication check
      const contentHash = `slr-${entry.speaker}-${entry.text.toLowerCase().trim()}`;
      if (!processedIds.has(entry.id) && !processedIds.has(contentHash)) {
        processedIds.add(entry.id);
        processedIds.add(contentHash);
        
        // Remove hash after a cooldown
        setTimeout(() => processedIds.delete(contentHash), 5000);

        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'transcript', data: entry }));
        }
        setTranscript(prev => [...prev, entry]);
      }
      lastSignRef.current = null;
    }, 2500);
  };

  // Initialize Mediapipe
  useEffect(() => {
    let camera: any = null;
    if (isPatient && (window as any).Holistic) {
      if (holisticRef.current) return; // Prevent double init

      const holistic = new (window as any).Holistic({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`
      });

      holistic.setOptions({
        modelComplexity: 0, // 0 for faster processing, 1 for accuracy (0 is buttery smooth)
        smoothLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      holistic.onResults((results: any) => {
        if (!canvasRef.current || !localVideoRef.current) return;
        const canvasCtx = canvasRef.current.getContext('2d');
        if (!canvasCtx) return;

        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        const state = useConsultationStore.getState();
        if (state.isSignDetectionOn) {
          const drawUtils = (window as any);
          if (results.leftHandLandmarks) {
            drawUtils.drawConnectors(canvasCtx, results.leftHandLandmarks, drawUtils.HAND_CONNECTIONS, { color: '#EF4444', lineWidth: 3 });
            drawUtils.drawLandmarks(canvasCtx, results.leftHandLandmarks, { color: '#FFFFFF', radius: 2 });
          }
          if (results.rightHandLandmarks) {
            drawUtils.drawConnectors(canvasCtx, results.rightHandLandmarks, drawUtils.HAND_CONNECTIONS, { color: '#10B981', lineWidth: 3 });
            drawUtils.drawLandmarks(canvasCtx, results.rightHandLandmarks, { color: '#FFFFFF', radius: 2 });

            // Advanced Gesture Engine
            const lm = results.rightHandLandmarks;
            const thumbTip = lm[4], indexTip = lm[8], middleTip = lm[12], ringTip = lm[16], pinkyTip = lm[20], wrist = lm[0];

            // 1. Palms / Stop Sign
            const allExtended = [indexTip, middleTip, ringTip, pinkyTip].every(tip => tip.y < lm[tip === indexTip ? 6 : (tip === middleTip ? 10 : (tip === ringTip ? 14 : 18))].y);

            // 2. Thumbs Up
            const fingersCurled = [indexTip, middleTip, ringTip, pinkyTip].every(tip => tip.y > lm[tip === indexTip ? 6 : (tip === middleTip ? 10 : (tip === ringTip ? 14 : 18))].y);
            const thumbUp = thumbTip.y < lm[2].y && fingersCurled;

            // 3. Victory/Peace
            const isVictory = indexTip.y < lm[6].y && middleTip.y < lm[10].y && ringTip.y > lm[14].y && pinkyTip.y > lm[18].y;

            // 4. Pain Interaction
            let isPain = false;
            if (results.leftHandLandmarks) {
              const dist = Math.sqrt(Math.pow(indexTip.x - results.leftHandLandmarks[8].x, 2) + Math.pow(indexTip.y - results.leftHandLandmarks[8].y, 2));
              if (dist < 0.1) isPain = true;
            }

            // 5. Spatial Locations (relative to frame)
            const isHeadArea = wrist.y < 0.35;
            const isStomachArea = wrist.y > 0.65;

            // 6. Help / Medicine (Both hands used)
            let isMedicine = false;
            let isHelp = false;
            if (results.leftHandLandmarks) {
              const lWrist = results.leftHandLandmarks[0];
              const rWrist = results.rightHandLandmarks[0];
              const handDist = Math.sqrt(Math.pow(lWrist.x - rWrist.x, 2) + Math.pow(lWrist.y - rWrist.y, 2));
              if (handDist < 0.2) {
                if (allExtended) isMedicine = true;
                else isHelp = true;
              }
            }

            if (isHeadArea && thumbUp) handleSignDetection("Fever / Hot");
            else if (isHeadArea && fingersCurled) handleSignDetection("Headache");
            else if (isPain && isStomachArea) handleSignDetection("Stomach Pain");
            else if (isPain) handleSignDetection("Pain / Ache");
            else if (isMedicine) handleSignDetection("Taking Medicine");
            else if (isHelp) handleSignDetection("Need Help");
            else if (thumbUp) handleSignDetection("Yes / Good");
            else if (allExtended) handleSignDetection("Wait / Stop");
            else if (isVictory) handleSignDetection("Okay");
            else handleSignDetection(null);
          }
        }
        canvasCtx.restore();
      });

      holisticRef.current = holistic;

      const checkVideo = setInterval(() => {
        if (localVideoRef.current && localVideoRef.current.readyState >= 2) {
          if (cameraRef.current) {
            clearInterval(checkVideo);
            return;
          }
          cameraRef.current = new (window as any).Camera(localVideoRef.current, {
            onFrame: async () => {
              if (isLeavingRef.current) return;
              if (holisticRef.current && localVideoRef.current) {
                await holisticRef.current.send({ image: localVideoRef.current });
              }
            },
            width: 640,
            height: 480
          });
          cameraRef.current.start();
          clearInterval(checkVideo);
        }
      }, 1000);

      return () => {
        clearInterval(checkVideo);
        if (cameraRef.current) cameraRef.current.stop();
        if (holisticRef.current) holisticRef.current.close();
        holisticRef.current = null;
        cameraRef.current = null;
      };

      return () => {
        clearInterval(checkVideo);
        if (camera) camera.stop();
        if (holisticRef.current) holisticRef.current.close();
      }
    }
  }, [isPatient]);

  // Media Controls Update
  useEffect(() => {
    const s = localVideoRef.current?.srcObject as MediaStream;
    if (s) {
      s.getVideoTracks().forEach(track => track.enabled = isCameraOn);
      s.getAudioTracks().forEach(track => track.enabled = isMicOn);
    }
    if (recognitionRef.current) {
      try {
        if (isMicOn) {
          if (!isRecognitionRunningRef.current) recognitionRef.current.start();
        } else {
          recognitionRef.current.stop();
        }
      } catch (e) { }
    }
    // Broadcast status
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'track-state', dataType: 'mic', value: isMicOn }));
      wsRef.current.send(JSON.stringify({ type: 'track-state', dataType: 'camera', value: isCameraOn }));
    }
  }, [isCameraOn, isMicOn]);

  const handleLeave = () => {
    if (isLeavingRef.current) return;
    isLeavingRef.current = true;

    // Explicit Track Killing
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
      localStreamRef.current = null;
    }

    if (cameraRef.current) {
      try { cameraRef.current.stop(); } catch (e) { }
    }

    if (holisticRef.current) {
      try { holisticRef.current.close(); } catch (e) { }
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'user-disconnected' }));
      wsRef.current.close();
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) { }
      recognitionRef.current = null;
    }

    const video = localVideoRef.current;
    if (video) video.srcObject = null;

    endConsultation();
    
    if (isDoctor) {
      navigate(`/consultation/${id}/follow-up`);
    } else {
      navigate('/dashboard');
    }
  };

  const handleSendChat = () => {
    if (!chatMessage.trim()) return;
    const msg = {
      text: chatMessage,
      sender: user?.name || 'You',
      time: formatTime(elapsedTime),
    };
    setChatMessages(prev => [...prev, msg]);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'chat', data: msg }));
    }
    setChatMessage('');
  };

  const aiSummary = {
    symptoms: ['Recurring headaches (1 week)', 'Worsens in evening', 'Poor sleep quality', 'Workplace stress'],
    provisional: 'Tension-type headache related to stress and poor sleep hygiene',
    recommendations: ['Sleep hygiene improvement', 'Stress management techniques', 'Over-the-counter analgesics as needed'],
  };

  const lastEntry = transcript[transcript.length - 1];
  const remoteLabel = peerName || (isDoctor ? 'Patient' : 'Doctor');
  const captionSpeaker = (interimTranscript || slrSentence)
    ? localName
    : (remoteInterimTranscript
      ? remoteLabel
      : (lastEntry?.speaker === localRole ? localName : remoteLabel));
  const captionText = interimTranscript || remoteInterimTranscript || slrSentence || lastEntry?.text;

  return (
    <div className="fixed inset-0 bg-[#020617] flex flex-col z-50 overflow-hidden">
      {/* Premium Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-900/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-900/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="h-16 bg-slate-950/40 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-8 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Hand size={16} className="text-white" />
          </div>
          <span className="text-white/90 font-semibold font-display text-sm">SignBridge</span>
          <span className="text-white/20 mx-2">|</span>
          <Badge variant="live">Live Session</Badge>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <Timer size={16} />
            <span className="font-mono">{formatTime(elapsedTime)}</span>
          </div>
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <Activity size={14} className="text-emerald-400" />
            <span>Connected</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col p-4">
          <div className="flex-1 grid grid-cols-2 gap-6">
            {/* Left box: Remote participant */}
            <div className="relative rounded-[2.5rem] overflow-hidden bg-slate-900 shadow-2xl border-2 border-white/5 group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-violet-500/5 pointer-events-none" />
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                muted={false}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-lg px-3 py-1.5">
                  <span className={`w-2 h-2 rounded-full ${isPeerConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  <span className="text-white/80 text-xs font-medium">{remoteLabel}</span>
                  {isPeerConnected && (
                    <div className="flex items-center gap-2 ml-2 border-l border-white/10 pl-2">
                      {!remoteIsMicOn && <MicOff size={14} className="text-red-400" />}
                      {!remoteIsCameraOn && <CameraOff size={14} className="text-red-400" />}
                    </div>
                  )}
                </div>
              </div>

              {!isPeerConnected && (
                <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center text-center p-6">
                  <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 border border-white/10">
                    <User size={24} className="text-white/40" />
                  </div>
                  <p className="text-white/80 font-medium text-sm">{isDoctor ? 'Waiting for Patient...' : 'Waiting for Doctor...'}</p>
                  <p className="text-white/40 text-xs mt-1">{isDoctor ? "Patient hasn't joined yet" : "Doctor hasn't joined yet"}</p>
                </div>
              )}
            </div>

            {/* Right box: Local participant */}
            <div className="relative rounded-[2.5rem] overflow-hidden bg-slate-900 shadow-2xl border-2 border-white/5 group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-violet-500/5 pointer-events-none" />
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
              {isPatient && (
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1] pointer-events-none"
                  width={640}
                  height={480}
                />
              )}
              <div className="absolute top-4 left-4">
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-lg px-3 py-1.5">
                  <span className={`w-2 h-2 rounded-full ${isPeerConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  <span className="text-white/80 text-xs font-medium">You</span>
                  {isMicOn && (
                    <div className="flex items-center gap-1.5 ml-2 border-l border-white/10 pl-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${asrStatus === 'listening' ? 'bg-cyan-400 animate-pulse' : 'bg-white/20'}`} />
                      <span className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Local</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-3">
            <div className="flex items-center gap-4 bg-[#0f172a]/80 backdrop-blur-2xl rounded-[2.5rem] p-3 px-8 border border-white/10 shadow-2xl neon-glow">
              <button onClick={toggleMic} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isMicOn ? 'bg-slate-800/50 hover:bg-slate-700 text-white border border-white/5' : 'bg-red-500/20 text-red-500 border border-red-500/50'}`}>
                {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
              </button>
              <button onClick={toggleCamera} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isCameraOn ? 'bg-slate-800/50 hover:bg-slate-700 text-white border border-white/5' : 'bg-red-500/20 text-red-500 border border-red-500/50'}`}>
                {isCameraOn ? <Camera size={24} /> : <CameraOff size={24} />}
              </button>

              <div className="w-px h-10 bg-white/10 mx-2" />

              <button onClick={toggleCaptions} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isCaptionsOn ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'bg-slate-800/50 hover:bg-slate-700 text-white/40'}`}>
                <Subtitles size={24} />
              </button>
              <button onClick={toggleSignDetection} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isSignDetectionOn ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/20' : 'bg-slate-800/50 hover:bg-slate-700 text-white/40'}`}>
                <Hand size={24} />
              </button>

              <div className="flex items-center gap-1 bg-slate-800/50 rounded-xl p-1 px-2 border border-white/5">
                <Globe size={14} className="text-white/40" />
                <select
                  value={asrLang}
                  onChange={(e) => setAsrLang(e.target.value)}
                  className="bg-transparent text-[10px] font-bold text-white/80 outline-none cursor-pointer uppercase tracking-wider"
                >
                  <option value="en-US" className="bg-slate-900">English</option>
                  <option value="hi-IN" className="bg-slate-900">Hindi</option>
                </select>
              </div>

              <button onClick={handleLeave} className="w-14 h-14 rounded-2xl bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-red-500/30">
                <PhoneOff size={24} />
              </button>
            </div>
          </div>

          {/* Sidebar Toggle (Only when closed) */}
          {!showSidePanel && (
            <button 
              onClick={() => setShowSidePanel(true)}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-12 bg-slate-900/50 backdrop-blur-xl border-l border-y border-white/10 rounded-l-lg flex items-center justify-center text-white/40 hover:text-white transition-all z-20 group"
            >
              <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            </button>
          )}

          {/* Unified Caption Bar */}
          <AnimatePresence>
            {isCaptionsOn && !!captionText && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mt-12 w-full max-w-3xl mx-auto z-20 px-8"
              >
                <div className="glass-dark border border-white/10 rounded-[2rem] p-8 shadow-2xl neon-glow text-center relative overflow-hidden backdrop-blur-3xl">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-40" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400 mb-4 opacity-100 flex items-center justify-center gap-2">
                    <Sparkles size={12} />
                    {captionSpeaker}
                  </p>
                  <p className="text-2xl text-white font-semibold leading-[1.4] tracking-tight">
                    {captionText}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {showSidePanel && (
            <motion.div 
              initial={{ width: 0, opacity: 0 }} 
              animate={{ width: 400, opacity: 1 }} 
              exit={{ width: 0, opacity: 0 }} 
              className="glass-dark border-l border-white/5 flex flex-col overflow-hidden relative"
            >
              {/* Sidebar Toggle Arrow */}
              <button 
                onClick={() => setShowSidePanel(false)}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-8 h-12 bg-slate-900 border border-white/10 rounded-l-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-slate-800 transition-all z-20"
              >
                <ChevronRight size={18} />
              </button>

              <div className="flex border-b border-white/5 bg-slate-950/20">
                {[
                  { id: 'transcript' as const, label: 'Transcript', icon: MessageSquareText },
                  { id: 'ai' as const, label: 'AI Assistant', icon: Brain },
                  { id: 'chat' as const, label: 'Chat', icon: Send },
                ].map((tab) => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest relative flex items-center justify-center gap-2 ${activeTab === tab.id ? 'text-white' : 'text-white/40 hover:text-white/60'}`}>
                    <tab.icon size={14} /> {tab.label}
                    {activeTab === tab.id && <motion.div layoutId="active-tab" className="absolute bottom-0 left-0 right-0 h-1 bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" />}
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {activeTab === 'transcript' && (
                  <div className="space-y-3">
                    {transcript.map((entry) => (
                      <motion.div key={entry.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`flex flex-col ${entry.speaker === localRole ? 'items-end' : 'items-start'} space-y-1`}>
                        <div className="flex items-center gap-2 px-1">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${entry.speaker === 'doctor' ? 'text-cyan-400' : 'text-violet-400'}`}>
                            {entry.speaker === 'doctor' ? 'Doctor' : 'Patient'}
                          </span>
                          <span className="text-white/20 text-[10px] font-mono">{entry.timestamp}</span>
                          <Badge variant={entry.source === 'asr' ? 'info' : 'confirmed'} className="scale-75 origin-left">{entry.source === 'asr' ? 'Voice' : 'Sign'}</Badge>
                        </div>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-lg ${entry.speaker === localRole ? 'bg-primary-600/20 text-white rounded-tr-none border border-primary-500/20' : 'glass-dark text-white/90 rounded-tl-none border border-white/5'}`}>
                          {entry.text}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
                {activeTab === 'ai' && (
                  <div className="space-y-5 text-white/70 text-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles size={16} className="text-amber-400" />
                      <h4 className="text-white/90 font-semibold text-sm">AI Summary</h4>
                    </div>
                    <div className="bg-slate-800/80 rounded-xl p-4 border border-white/5 space-y-2">
                      <p className="text-xs font-semibold text-cyan-400 uppercase">Symptoms</p>
                      <p>{aiSummary.symptoms.join(', ')}</p>
                    </div>
                  </div>
                )}
                {activeTab === 'chat' && (
                  <div className="space-y-3">
                    {chatMessages.map((msg, i) => (
                      <div key={i} className="bg-slate-800/80 rounded-xl px-4 py-3 border border-white/5">
                        <p className="text-white/60 text-[10px] font-bold uppercase mb-1">{msg.sender} • {msg.time}</p>
                        <p className="text-white/80 text-sm">{msg.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
