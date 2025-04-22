import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

export default function WorkoutTimer() {
  const [seconds, setSeconds] = useState(60); // Default to 60 seconds
  const [isRunning, setIsRunning] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState("60");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clean up timer on component unmount
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      timerRef.current = setInterval(() => {
        setSeconds(prevSeconds => {
          if (prevSeconds <= 1) {
            // Timer finished
            clearInterval(timerRef.current!);
            setIsRunning(false);
            
            // Play a sound or show an alert when timer completes
            try {
              // Create a beep sound
              const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
              const oscillator = audioContext.createOscillator();
              oscillator.type = 'sine';
              oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
              
              const gainNode = audioContext.createGain();
              gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
              
              oscillator.connect(gainNode);
              gainNode.connect(audioContext.destination);
              
              oscillator.start();
              oscillator.stop(audioContext.currentTime + 0.5);
            } catch (e) {
              // Fallback if Web Audio API is not available
              console.log("Timer completed!");
            }
            
            return 0;
          }
          return prevSeconds - 1;
        });
      }, 1000);
    }
  };

  const pauseTimer = () => {
    if (isRunning && timerRef.current) {
      clearInterval(timerRef.current);
      setIsRunning(false);
    }
  };

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(false);
    setSeconds(parseInt(selectedPreset));
  };

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    setSelectedPreset(newValue);
    setSeconds(parseInt(newValue));
    
    // Reset timer if it's running
    if (isRunning && timerRef.current) {
      clearInterval(timerRef.current);
      setIsRunning(false);
    }
  };

  // Generate tick marks for the timer face
  const renderTickMarks = () => {
    const ticks = [];
    for (let i = 0; i < 12; i++) {
      const rotation = i * 30;
      const isLarge = i % 3 === 0;
      ticks.push(
        <div 
          key={i} 
          className={`absolute ${isLarge ? 'h-[15px] w-[3px]' : 'h-[10px] w-[2px]'}`}
          style={{
            background: "#6A9C89",
            transformOrigin: "center 95px",
            transform: `rotate(${rotation}deg)`,
            left: "calc(50% - 1px)",
            top: "0"
          }}
        ></div>
      );
    }
    return ticks;
  };

  return (
    <div 
      className="p-5 text-center"
      style={{
        backgroundColor: "#FFF8DC",
        border: "2px solid #6A9C89",
        boxShadow: "3px 3px 0 #FFA725",
        position: "relative"
      }}
    >
      <h2 className="text-2xl font-['Bebas_Neue'] text-[#6A9C89] mb-4 tracking-wider">WORKOUT TIMER</h2>
      
      <div className="mb-6">
        <div 
          className="relative w-48 h-48 rounded-full mx-auto flex items-center justify-center"
          style={{
            border: "8px solid #6A9C89",
            background: "#FFF8DC",
            boxShadow: "inset 0 0 10px rgba(0,0,0,0.2), 0 0 0 4px #FFA725"
          }}
        >
          {renderTickMarks()}
          <div className="font-['Bebas_Neue'] text-4xl text-[#FFA725]">
            {formatTime(seconds)}
          </div>
        </div>
      </div>
      
      <div className="flex justify-center space-x-4">
        <button 
          onClick={startTimer}
          disabled={isRunning || seconds === 0}
          className="bg-[#6A9C89] text-[#FFF8DC] font-['Bebas_Neue'] px-6 py-2 rounded shadow-md hover:bg-opacity-90 transition-all duration-100 ease-in-out disabled:opacity-50"
          style={{
            transition: "all 0.1s ease-in-out"
          }}
        >
          <Play className="inline w-4 h-4 mr-2" /> START
        </button>
        
        <button 
          onClick={pauseTimer}
          disabled={!isRunning}
          className="bg-[#FFA725] text-[#FFF8DC] font-['Bebas_Neue'] px-6 py-2 rounded shadow-md hover:bg-opacity-90 transition-all duration-100 ease-in-out disabled:opacity-50"
          style={{
            transition: "all 0.1s ease-in-out"
          }}
        >
          <Pause className="inline w-4 h-4 mr-2" /> PAUSE
        </button>
        
        <button 
          onClick={resetTimer}
          disabled={seconds === parseInt(selectedPreset) && !isRunning}
          className="bg-[#C1D8C3] text-[#FFF8DC] font-['Bebas_Neue'] px-6 py-2 rounded shadow-md hover:bg-opacity-90 transition-all duration-100 ease-in-out disabled:opacity-50"
          style={{
            transition: "all 0.1s ease-in-out"
          }}
        >
          <RotateCcw className="inline w-4 h-4 mr-2" /> RESET
        </button>
      </div>
      
      <div className="mt-4">
        <select 
          value={selectedPreset}
          onChange={handlePresetChange}
          className="bg-[#FFF8DC] border-2 border-[#6A9C89] font-['Courier_Prime'] p-2 rounded"
        >
          <option value="60">Rest - 1 minute</option>
          <option value="90">Rest - 1.5 minutes</option>
          <option value="120">Rest - 2 minutes</option>
          <option value="300">Quick workout - 5 minutes</option>
          <option value="600">Medium workout - 10 minutes</option>
          <option value="1200">Full workout - 20 minutes</option>
        </select>
      </div>
    </div>
  );
}
