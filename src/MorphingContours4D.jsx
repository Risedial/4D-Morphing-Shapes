import React, { useRef, useEffect, useState } from "react";
import { ChevronDown, ChevronUp, RotateCcw, Shuffle, Settings, Palette, Zap, Target, Video } from "lucide-react";

const MorphingContours4D = () => {
  const canvasRef = useRef(null);
  const animationIdRef = useRef(null);
  const timeRef = useRef(0);

  const [params, setParams] = useState({
    visualTheme: "Ocean Currents",
    animationSpeed: 1.0,
    shapeCount: 3,
    detailLevel: 0.6,
    size: 1.5,
    spread: 1.0,
    backgroundColor: "#F0EEE6",
    lineColor: "#282828",
    lineTransparency: 0.6,
    lineThickness: 1.0,
    flowType: "Smooth Waves",
    direction: 0.5,
    rhythm: 0.5,
    fourDInfluence: 1.0,
    morphingIntensity: 1.0,
    timeWarp: 0.5,
    numShapes: 3,
    contoursPerShape: 25,
    points: 100,
    scaleFactor: 1.5,
    timeIncrement: 0.003
  });

  const [expandedSections, setExpandedSections] = useState({
    colors: false,
    motion: false,
    advanced: false,
    expert: false
  });

  const [showExpertMode, setShowExpertMode] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState("");

  const themes = {
    "Gentle Waves": {
      animationSpeed: 0.5,
      fourDInfluence: 0.7,
      morphingIntensity: 0.6,
      backgroundColor: "#F5F3F0",
      lineColor: "#4A5568",
      lineTransparency: 0.4
    },
    "Ocean Currents": {
      animationSpeed: 1.0,
      fourDInfluence: 1.0,
      morphingIntensity: 1.0,
      backgroundColor: "#F0EEE6",
      lineColor: "#2D3748",
      lineTransparency: 0.6
    },
    "Storm Energy": {
      animationSpeed: 2.0,
      fourDInfluence: 1.5,
      morphingIntensity: 1.4,
      backgroundColor: "#E2E8F0",
      lineColor: "#1A202C",
      lineTransparency: 0.8
    },
    "Minimal Zen": {
      animationSpeed: 0.3,
      fourDInfluence: 0.5,
      morphingIntensity: 0.4,
      backgroundColor: "#FFFEF7",
      lineColor: "#718096",
      lineTransparency: 0.3
    },
    "Cosmic Dance": {
      animationSpeed: 1.5,
      fourDInfluence: 1.8,
      morphingIntensity: 1.6,
      backgroundColor: "#FAF5FF",
      lineColor: "#553C9A",
      lineTransparency: 0.7
    }
  };

  const applyTheme = (themeName) => {
    const theme = themes[themeName];
    if (theme) {
      setParams(prev => ({
        ...prev,
        visualTheme: themeName,
        ...theme
      }));
    }
  };

  const get4DInfluence = (angle, time, shapeIndex, contour) => {
    const wPhase = time * 0.06 * params.fourDInfluence + shapeIndex * 0.7 + contour * 0.05;
    const wInfluence = Math.sin(angle * 2 + wPhase) * 0.15 * params.fourDInfluence;
    const xwRotation = time * 0.04 * params.fourDInfluence;
    const xwInfluence = Math.cos(angle + xwRotation) * Math.sin(wPhase) * 0.2 * params.fourDInfluence;
    const ywRotation = time * 0.03 * params.fourDInfluence;
    const ywInfluence = Math.sin(angle * 1.5 + ywRotation) * Math.cos(wPhase * 0.7) * 0.18 * params.fourDInfluence;

    return {
      radiusModulation: (wInfluence + xwInfluence * 0.5) * params.morphingIntensity,
      positionShift: { 
        x: xwInfluence * 5.8 * params.size, 
        y: ywInfluence * 5.8 * params.size 
      },
      opacityShift: Math.abs(wInfluence) * 0.3 * params.fourDInfluence
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    canvas.width = 400 * dpr;
    canvas.height = 400 * dpr;
    canvas.style.width = "400px";
    canvas.style.height = "400px";
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const animate = () => {
      ctx.fillStyle = params.backgroundColor;
      ctx.fillRect(0, 0, 400, 400);
      
      timeRef.current += params.timeIncrement * params.animationSpeed;
      const time = timeRef.current;
      
      const centerX = 170;
      const centerY = 200;
      
      for (let shapeIndex = 0; shapeIndex < params.shapeCount; shapeIndex++) {
        const shapePhase = time + shapeIndex * Math.PI * 2 / params.shapeCount;
        
        let offsetX = Math.sin(shapePhase * 0.2) * 29 * params.size * params.spread;
        let offsetY = Math.cos(shapePhase * 0.3) * 29 * params.size * params.spread;
        
        const shape4D = get4DInfluence(0, time, shapeIndex, 0);
        const finalOffsetX = offsetX + shape4D.positionShift.x;
        const finalOffsetY = offsetY + shape4D.positionShift.y;
        
        const contoursPerShape = Math.floor(10 + params.detailLevel * 30);
        for (let contour = 0; contour < contoursPerShape; contour++) {
          const scale = (22 + contour * 2.2) * params.size;
          
          const contourOffsetX = Math.sin(contour * 0.2 + shapePhase) * 7.3 * params.size;
          const contourOffsetY = Math.cos(contour * 0.2 + shapePhase) * 7.3 * params.size;
          
          const contour4D = get4DInfluence(contour, time, shapeIndex, contour);
          
          const baseOpacity = params.lineTransparency;
          const finalOpacity = Math.max(0.1, Math.min(0.9, baseOpacity + contour4D.opacityShift));
          
          const r = parseInt(params.lineColor.slice(1, 3), 16);
          const g = parseInt(params.lineColor.slice(3, 5), 16);
          const b = parseInt(params.lineColor.slice(5, 7), 16);
          ctx.strokeStyle = "rgba(" + r + ", " + g + ", " + b + ", " + finalOpacity + ")";
          ctx.lineWidth = params.lineThickness;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          
          ctx.beginPath();
          
          const pointsPerContour = Math.floor(50 + params.detailLevel * 100);
          for (let i = 0; i <= pointsPerContour; i++) {
            const angle = (i / pointsPerContour) * Math.PI * 2;
            let radius = scale;
            
            radius += 11 * Math.sin(angle * 3 + shapePhase * 2) * params.size;
            radius += 7.3 * Math.cos(angle * 5 - shapePhase) * params.size;
            radius += 3.7 * Math.sin(angle * 8 + contour * 0.1) * params.size;
            
            const point4D = get4DInfluence(angle, time, shapeIndex, contour);
            
            radius *= (1 + point4D.radiusModulation);
            
            const x = centerX + finalOffsetX + contourOffsetX + Math.cos(angle) * radius;
            const y = centerY + finalOffsetY + contourOffsetY + Math.sin(angle) * radius;
            
            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          
          ctx.closePath();
          ctx.stroke();
        }
      }
      
      animationIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [params]);

  const updateParam = (key, value) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const calculatePercentage = (value, min, max) => {
    return Math.round(((value - min) / (max - min)) * 100);
  };

  const percentageToValue = (percentage, min, max) => {
    return min + (percentage / 100) * (max - min);
  };

  const valueToPercentage = (value, min, max) => {
    return Math.round(((value - min) / (max - min)) * 100);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getLoopDuration = () => {
    const baseTimeForLoop = (Math.PI * 2) / (params.timeIncrement * params.animationSpeed);
    const totalFrames = Math.ceil(baseTimeForLoop);
    const durationSeconds = totalFrames / 60;
    return { totalFrames, durationSeconds };
  };

  const exportVideo = async () => {
    setIsExporting(true);
    setExportStatus("Preparing video export...");
    setExportProgress(0);

    try {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const resolution = isMobile ? 1080 : 1440;
      
      const exportCanvas = document.createElement("canvas");
      const exportCtx = exportCanvas.getContext("2d");
      exportCanvas.width = resolution;
      exportCanvas.height = resolution;
      exportCtx.imageSmoothingEnabled = true;
      exportCtx.imageSmoothingQuality = "high";
      
      const scaleFactor = resolution / 400;
      
      setExportStatus("Starting video recording...");
      setExportProgress(5);

      const stream = exportCanvas.captureStream(60);
      
      let mimeType;
      let fileExtension;
      
      if (MediaRecorder.isTypeSupported("video/webm; codecs=vp9")) {
        mimeType = "video/webm; codecs=vp9";
        fileExtension = "webm";
      } else if (MediaRecorder.isTypeSupported("video/webm; codecs=vp8")) {
        mimeType = "video/webm; codecs=vp8";
        fileExtension = "webm";
      } else if (MediaRecorder.isTypeSupported("video/webm")) {
        mimeType = "video/webm";
        fileExtension = "webm";
      } else if (MediaRecorder.isTypeSupported("video/mp4")) {
        mimeType = "video/mp4";
        fileExtension = "mp4";
      } else {
        throw new Error("No supported video format found in this browser");
      }
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType,
        videoBitsPerSecond: isMobile ? 8000000 : 15000000
      });

      const chunks = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.start(100);
      setExportStatus("Recording animation loop...");
      setExportProgress(10);

      const { totalFrames } = getLoopDuration();
      const maxFrames = Math.min(totalFrames, 1800);
      
      let captureTime = 0;
      let frame = 0;

      const renderFrame = () => {
        return new Promise((resolve) => {
          exportCtx.fillStyle = params.backgroundColor;
          exportCtx.fillRect(0, 0, resolution, resolution);
          
          const centerX = 170 * scaleFactor;
          const centerY = resolution / 2;
          
          for (let shapeIndex = 0; shapeIndex < params.shapeCount; shapeIndex++) {
            const shapePhase = captureTime + shapeIndex * Math.PI * 2 / params.shapeCount;
            
            let offsetX = Math.sin(shapePhase * 0.2) * 29 * params.size * params.spread * scaleFactor;
            let offsetY = Math.cos(shapePhase * 0.3) * 29 * params.size * params.spread * scaleFactor;
            
            const shape4D = get4DInfluence(0, captureTime, shapeIndex, 0);
            const finalOffsetX = offsetX + shape4D.positionShift.x * scaleFactor;
            const finalOffsetY = offsetY + shape4D.positionShift.y * scaleFactor;
            
            const contoursPerShape = Math.floor(10 + params.detailLevel * 30);
            for (let contour = 0; contour < contoursPerShape; contour++) {
              const scale = (22 + contour * 2.2) * params.size * scaleFactor;
              
              const contourOffsetX = Math.sin(contour * 0.2 + shapePhase) * 7.3 * params.size * scaleFactor;
              const contourOffsetY = Math.cos(contour * 0.2 + shapePhase) * 7.3 * params.size * scaleFactor;
              
              const contour4D = get4DInfluence(contour, captureTime, shapeIndex, contour);
              const baseOpacity = params.lineTransparency;
              const finalOpacity = Math.max(0.1, Math.min(0.9, baseOpacity + contour4D.opacityShift));
              
              const r = parseInt(params.lineColor.slice(1, 3), 16);
              const g = parseInt(params.lineColor.slice(3, 5), 16);
              const b = parseInt(params.lineColor.slice(5, 7), 16);
              exportCtx.strokeStyle = "rgba(" + r + ", " + g + ", " + b + ", " + finalOpacity + ")";
              exportCtx.lineWidth = params.lineThickness * scaleFactor;
              exportCtx.lineCap = "round";
              exportCtx.lineJoin = "round";
              
              exportCtx.beginPath();
              
              const pointsPerContour = Math.floor(50 + params.detailLevel * 100);
              for (let i = 0; i <= pointsPerContour; i++) {
                const angle = (i / pointsPerContour) * Math.PI * 2;
                let radius = scale;
                
                radius += 11 * Math.sin(angle * 3 + shapePhase * 2) * params.size * scaleFactor;
                radius += 7.3 * Math.cos(angle * 5 - shapePhase) * params.size * scaleFactor;
                radius += 3.7 * Math.sin(angle * 8 + contour * 0.1) * params.size * scaleFactor;
                
                const point4D = get4DInfluence(angle, captureTime, shapeIndex, contour);
                radius *= (1 + point4D.radiusModulation);
                
                const x = centerX + finalOffsetX + contourOffsetX + Math.cos(angle) * radius;
                const y = centerY + finalOffsetY + contourOffsetY + Math.sin(angle) * radius;
                
                if (i === 0) {
                  exportCtx.moveTo(x, y);
                } else {
                  exportCtx.lineTo(x, y);
                }
              }
              
              exportCtx.closePath();
              exportCtx.stroke();
            }
          }

          setTimeout(resolve, 16);
        });
      };

      const renderLoop = async () => {
        while (frame < maxFrames) {
          await renderFrame();
          
          const progress = 10 + Math.round((frame / maxFrames) * 70);
          setExportProgress(progress);

          captureTime += (params.timeIncrement * params.animationSpeed) * (totalFrames / maxFrames);
          frame++;
        }
        
        mediaRecorder.stop();
        setExportStatus("Processing video...");
        setExportProgress(80);
      };

      mediaRecorder.onstop = () => {
        setExportProgress(90);
        setExportStatus("Finalizing video...");
        
        const videoBlob = new Blob(chunks, { type: mimeType });
        
        const url = URL.createObjectURL(videoBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "morphing-contours-" + resolution + "p-" + Date.now() + "." + fileExtension;
        a.style.display = "none";
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        
        setExportProgress(100);
        setExportStatus(resolution + "p " + fileExtension.toUpperCase() + " video exported! (" + Math.round((maxFrames / 60)) + "s)");
        
        setTimeout(() => {
          setIsExporting(false);
          setExportProgress(0);
          setExportStatus("");
        }, 3000);
      };

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event.error);
        setExportStatus("Recording failed. Please try again.");
        setTimeout(() => {
          setIsExporting(false);
          setExportProgress(0);
          setExportStatus("");
        }, 3000);
      };

      renderLoop();

    } catch (error) {
      console.error("Video export failed:", error);
      setExportStatus("Video export failed: " + error.message);
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
        setExportStatus("");
      }, 5000);
    }
  };

  const randomizeSettings = () => {
    const randomInRange = (min, max) => Math.random() * (max - min) + min;
    const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    const randomBackgroundColor = () => {
      const backgrounds = [
        "#F0EEE6", "#F5F3F0", "#E2E8F0", "#FFFEF7", "#FAF5FF", 
        "#FEF7F0", "#F0FDF4", "#FFFBEB", "#F3F4F6", "#FDF2F8",
        "#ECFDF5", "#FEF3C7", "#DBEAFE", "#E0E7FF", "#FCE7F3"
      ];
      return backgrounds[randomInt(0, backgrounds.length - 1)];
    };

    const randomLineColor = () => {
      const lineColors = [
        "#282828", "#4A5568", "#2D3748", "#1A202C", "#553C9A",
        "#B91C1C", "#059669", "#D97706", "#7C3AED", "#DC2626",
        "#0369A1", "#7C2D12", "#166534", "#92400E", "#5B21B6"
      ];
      return lineColors[randomInt(0, lineColors.length - 1)];
    };

    const flowTypes = ["Smooth Waves", "Rippling Pulses", "Organic Breathing", "Chaotic Dance"];
    const randomFlowType = flowTypes[randomInt(0, flowTypes.length - 1)];

    const themeNames = Object.keys(themes);
    const randomTheme = themeNames[Math.floor(Math.random() * themeNames.length)];
    applyTheme(randomTheme);

    setParams(prev => ({
      ...prev,
      shapeCount: randomInt(1, 5),
      detailLevel: randomInRange(0.1, 1.0),
      size: randomInRange(0.5, 2.5),
      spread: randomInRange(0.3, 1.8),
      animationSpeed: randomInRange(0.1, 3.0),
      backgroundColor: randomBackgroundColor(),
      lineColor: randomLineColor(),
      lineTransparency: randomInRange(0.2, 0.9),
      lineThickness: randomInRange(0.5, 3.0),
      flowType: randomFlowType,
      direction: randomInRange(0, 1),
      rhythm: randomInRange(0, 1),
      fourDInfluence: randomInRange(0, 2.0),
      morphingIntensity: randomInRange(0.1, 2.0),
      timeWarp: randomInRange(0, 1)
    }));
  };

  const resetToDefaults = () => {
    applyTheme("Ocean Currents");
    setParams(prev => ({
      ...prev,
      shapeCount: 3,
      detailLevel: 0.6,
      size: 1.5,
      spread: 1.0
    }));
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 p-4 gap-4">
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">4D Morphing Contours</h1>
          <p className="text-sm text-gray-600 max-w-md">
            Organic forms with subtle hyperdimensional influence - the 4th dimension gently modulates
            the emptying and return cycles through invisible mathematical currents.
          </p>
        </div>

        <canvas
          ref={canvasRef}
          className="shadow-2xl rounded-lg border border-gray-200"
          style={{ backgroundColor: params.backgroundColor }}
        />
        
        <div className="mt-4 text-xs text-gray-500 text-center max-w-md">
          <p>Technical: W-dimension influence preserved through hyperdimensional parameter modulation</p>
        </div>
      </div>

      <div className="controls-container w-full lg:w-80 xl:w-96 bg-white rounded-lg shadow-lg p-6 lg:overflow-y-auto lg:max-h-screen">
        <div className="flex items-center gap-2 mb-6">
          <Settings size={20} className="text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">Controls</h2>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={randomizeSettings}
            disabled={isExporting}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Shuffle size={16} />
            <span className="text-sm">Surprise Me</span>
          </button>
          <button
            onClick={resetToDefaults}
            disabled={isExporting}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw size={16} />
            <span className="text-sm">Reset</span>
          </button>
        </div>

        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Video size={16} className="text-blue-600" />
            Export Video
          </h3>
          
          <div className="space-y-3">
            <button
              onClick={exportVideo}
              disabled={isExporting}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <Video size={18} />
              <span>Export High-Quality Video</span>
            </button>
            
            {isExporting && (
              <div className="space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: exportProgress + "%" }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 text-center">{exportStatus}</p>
              </div>
            )}
            
            <div className="text-xs text-gray-500 space-y-1">
              <p>* 1440p WebM video (1080p on mobile)</p>
              <p>* 60fps, high bitrate</p>
              <p>* Duration: ~{Math.round(getLoopDuration().durationSeconds)}s seamless loop</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Palette size={16} />
              Visual Theme
            </label>
            <select
              value={params.visualTheme}
              onChange={(e) => applyTheme(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.keys(themes).map(theme => (
                <option key={theme} value={theme}>{theme}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Zap size={16} />
              Energy Level
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={valueToPercentage(params.animationSpeed, 0.1, 3)}
              onChange={(e) => updateParam("animationSpeed", percentageToValue(parseInt(e.target.value), 0.1, 3))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="relative flex justify-between text-xs text-gray-500 mt-1">
              <span>Meditative</span>
              <span className="absolute left-1/2 transform -translate-x-1/2 font-bold">{valueToPercentage(params.animationSpeed, 0.1, 3)}%</span>
              <span>Energetic</span>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Target size={16} />
              Shape Count: {params.shapeCount}
            </label>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={params.shapeCount}
              onChange={(e) => updateParam("shapeCount", parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="relative flex justify-between text-xs text-gray-500 mt-1">
              <span>1</span>
              <span className="absolute left-1/2 transform -translate-x-1/2 font-bold">{calculatePercentage(params.shapeCount, 1, 5)}%</span>
              <span>5</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Detail Level
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={valueToPercentage(params.detailLevel, 0.1, 1)}
              onChange={(e) => updateParam("detailLevel", percentageToValue(parseInt(e.target.value), 0.1, 1))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="relative flex justify-between text-xs text-gray-500 mt-1">
              <span>Simple</span>
              <span className="absolute left-1/2 transform -translate-x-1/2 font-bold">{valueToPercentage(params.detailLevel, 0.1, 1)}%</span>
              <span>Intricate</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Size
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={valueToPercentage(params.size, 0.5, 2.5)}
              onChange={(e) => updateParam("size", percentageToValue(parseInt(e.target.value), 0.5, 2.5))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="relative flex justify-between text-xs text-gray-500 mt-1">
              <span>Small</span>
              <span className="absolute left-1/2 transform -translate-x-1/2 font-bold">{valueToPercentage(params.size, 0.5, 2.5)}%</span>
              <span>Large</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Spread
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={valueToPercentage(params.spread, 0.3, 1.8)}
              onChange={(e) => updateParam("spread", percentageToValue(parseInt(e.target.value), 0.3, 1.8))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="relative flex justify-between text-xs text-gray-500 mt-1">
              <span>Tight</span>
              <span className="absolute left-1/2 transform -translate-x-1/2 font-bold">{valueToPercentage(params.spread, 0.3, 1.8)}%</span>
              <span>Wide</span>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection("colors")}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium text-gray-700">Colors and Appearance</span>
              {expandedSections.colors ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            
            {expandedSections.colors && (
              <div className="p-4 border-t border-gray-200 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Background Color</label>
                  <input
                    type="color"
                    value={params.backgroundColor}
                    onChange={(e) => updateParam("backgroundColor", e.target.value)}
                    className="w-full h-10 rounded-lg border border-gray-300 cursor-pointer"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Line Color</label>
                  <input
                    type="color"
                    value={params.lineColor}
                    onChange={(e) => updateParam("lineColor", e.target.value)}
                    className="w-full h-10 rounded-lg border border-gray-300 cursor-pointer"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Line Transparency</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={valueToPercentage(params.lineTransparency, 0.1, 1)}
                    onChange={(e) => updateParam("lineTransparency", percentageToValue(parseInt(e.target.value), 0.1, 1))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="relative flex justify-between text-xs text-gray-500 mt-1">
                    <span>Ghostly</span>
                    <span className="absolute left-1/2 transform -translate-x-1/2 font-bold">{valueToPercentage(params.lineTransparency, 0.1, 1)}%</span>
                    <span>Solid</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Line Thickness</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={valueToPercentage(params.lineThickness, 0.5, 3)}
                    onChange={(e) => updateParam("lineThickness", percentageToValue(parseInt(e.target.value), 0.5, 3))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="relative flex justify-between text-xs text-gray-500 mt-1">
                    <span>Hair thin</span>
                    <span className="absolute left-1/2 transform -translate-x-1/2 font-bold">{valueToPercentage(params.lineThickness, 0.5, 3)}%</span>
                    <span>Bold</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection("advanced")}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium text-gray-700">Advanced Energy</span>
              {expandedSections.advanced ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            
            {expandedSections.advanced && (
              <div className="p-4 border-t border-gray-200 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">4D Influence</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={valueToPercentage(params.fourDInfluence, 0, 2)}
                    onChange={(e) => updateParam("fourDInfluence", percentageToValue(parseInt(e.target.value), 0, 2))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="relative flex justify-between text-xs text-gray-500 mt-1">
                    <span>Off</span>
                    <span className="absolute left-1/2 transform -translate-x-1/2 font-bold">{valueToPercentage(params.fourDInfluence, 0, 2)}%</span>
                    <span>Maximum</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Morphing Intensity</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={valueToPercentage(params.morphingIntensity, 0.1, 2)}
                    onChange={(e) => updateParam("morphingIntensity", percentageToValue(parseInt(e.target.value), 0.1, 2))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="relative flex justify-between text-xs text-gray-500 mt-1">
                    <span>Gentle</span>
                    <span className="absolute left-1/2 transform -translate-x-1/2 font-bold">{valueToPercentage(params.morphingIntensity, 0.1, 2)}%</span>
                    <span>Extreme</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2 text-xs text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Performance: Optimal</span>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3B82F6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3B82F6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .slider {
          touch-action: pan-x;
        }
        @media (max-width: 1023px) {
          .controls-container {
            -webkit-overflow-scrolling: touch;
            overflow-y: visible;
          }
        }
      `}</style>
    </div>
  );
};

export default MorphingContours4D;
