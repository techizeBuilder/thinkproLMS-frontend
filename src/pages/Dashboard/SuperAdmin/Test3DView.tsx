import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Pause, ChevronLeft, ChevronRight } from "lucide-react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default function SuperAdminTest3DView() {
  const navigate = useNavigate();
  const mountRef = useRef<HTMLDivElement | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const animationsRef = useRef<THREE.AnimationClip[]>([]);
  const actionsRef = useRef<THREE.AnimationAction[]>([]);
  const isPlayingRef = useRef(false);
  const isScrubbingRef = useRef(false);
  const durationRef = useRef(0);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || container.offsetWidth * (9 / 16);

    const scene = new THREE.Scene();
    
    // Create gradient background
    const gradientTexture = new THREE.CanvasTexture(
      (() => {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const context = canvas.getContext('2d')!;
        const gradient = context.createLinearGradient(0, 0, 0, 256);
        // Bright white/light at top, fading to darker at bottom
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.3, '#e8e8e8');
        gradient.addColorStop(0.6, '#d0d0d0');
        gradient.addColorStop(1, '#a0a0a0');
        context.fillStyle = gradient;
        context.fillRect(0, 0, 256, 256);
        return canvas;
      })()
    );
    scene.background = gradientTexture;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(2, 2, 4);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    container.appendChild(renderer.domElement);

    // Interactive orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0, 0);
    controls.update();

    // Hemisphere light - provides sky (top) and ground (bottom) colors
    // Bright white/light blue from top, darker from bottom
    const hemisphereLight = new THREE.HemisphereLight(
      0xffffff, // Sky color (top) - bright white
      0x444444, // Ground color (bottom) - darker gray
      0.8 // Intensity
    );
    scene.add(hemisphereLight);

    // Bright main directional light from top
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(0, 10, 0); // Directly above
    mainLight.castShadow = false;
    scene.add(mainLight);

    // Colored lights from different angles for depth and color variation
    // Warm light from front-right
    const warmLight = new THREE.DirectionalLight(0xffaa66, 0.4);
    warmLight.position.set(5, 8, 5);
    scene.add(warmLight);

    // Cool light from front-left
    const coolLight = new THREE.DirectionalLight(0x6699ff, 0.3);
    coolLight.position.set(-5, 8, 5);
    scene.add(coolLight);

    // Subtle back light for rim lighting
    const backLight = new THREE.DirectionalLight(0xffffff, 0.2);
    backLight.position.set(0, 5, -10);
    scene.add(backLight);

    // TEMP: hardcode local backend URL for testing the GLB
    const modelUrl = "http://localhost:8000/models/lego_assembly.glb";

    // Add a visible cube so we at least see something while the model loads
    const cubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const cubeMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ff88,
      emissive: 0x003322,
    });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(0, 0, 0);
    scene.add(cube);

    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf) => {
        console.log("GLB loaded successfully:", gltf);
        const model = gltf.scene as THREE.Object3D;

        // Remove placeholder cube once model is ready
        scene.remove(cube);

        // Put model at origin and give it a reasonable scale
        model.position.set(0, 0, 0);
        model.scale.setScalar(0.02); // tweak if too big/small

        scene.add(model);

        // Setup animation mixer if animations exist
        if (gltf.animations && gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(model);
          mixerRef.current = mixer;
          animationsRef.current = gltf.animations;

          // Play all animations and store actions
          const actions: THREE.AnimationAction[] = [];
          gltf.animations.forEach((clip) => {
            const action = mixer.clipAction(clip);
            action.play();
            actions.push(action);
          });
          actionsRef.current = actions;

          // Find the maximum duration of all animations
          const maxDuration = Math.max(
            ...gltf.animations.map((clip) => clip.duration)
          );
          durationRef.current = maxDuration;
          isPlayingRef.current = true;
          setDuration(maxDuration);
          setIsPlaying(true);
        }

        setModelLoaded(true);
      },
      undefined,
      (error: unknown) => {
        console.error("Error loading GLB model:", error);
      }
    );

    let animationFrameId: number;
    let lastTime = performance.now() / 1000;

    const animate = (currentTimeInSeconds: number) => {
      animationFrameId = requestAnimationFrame(() => animate(performance.now() / 1000));

      const delta = currentTimeInSeconds - lastTime;
      lastTime = currentTimeInSeconds;

      // Rotate cube so we can clearly see rendering while GLB is loading / if it fails
      if (!modelLoaded) {
        cube.rotation.y += 0.01;
      }

      // Update animation mixer
      if (mixerRef.current) {
        if (isPlayingRef.current && !isScrubbingRef.current) {
          mixerRef.current.update(delta);
          // Get the current time from the first action (or mixer)
          const currentMixerTime = actionsRef.current.length > 0 
            ? actionsRef.current[0].time 
            : mixerRef.current.time;
          if (currentMixerTime > durationRef.current) {
            // Reset all actions to 0
            actionsRef.current.forEach((action) => {
              action.time = 0;
            });
            setCurrentTime(0);
          } else {
            setCurrentTime(currentMixerTime);
          }
        } else if (isScrubbingRef.current) {
          // When scrubbing, update mixer with 0 delta to show current frame
          // This ensures the scene renders at the scrubbed time
          mixerRef.current.update(0);
        } else {
          // When paused, still update to show current frame
          mixerRef.current.update(0);
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate(performance.now() / 1000);

    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight || container.offsetWidth * (9 / 16);
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
      }
      controls.dispose();
      cubeGeometry.dispose();
      cubeMaterial.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  // Handle play/pause toggle
  const togglePlayPause = () => {
    if (mixerRef.current) {
      isPlayingRef.current = !isPlayingRef.current;
      if (isPlayingRef.current) {
        mixerRef.current.timeScale = 1;
      } else {
        mixerRef.current.timeScale = 0;
      }
      setIsPlaying(isPlayingRef.current);
    }
  };

  // Handle timeline scrubbing
  const handleTimelineChange = (value: number) => {
    if (!mixerRef.current || durationRef.current <= 0 || actionsRef.current.length === 0) {
      return;
    }

    isScrubbingRef.current = true;
    const newTime = Math.max(0, Math.min((value / 100) * durationRef.current, durationRef.current));
    
    // Update each action's time to scrub the animation
    actionsRef.current.forEach((action) => {
      if (action && action.getClip()) {
        const clipDuration = action.getClip().duration;
        // Set time directly, ensuring it's within the clip's duration
        // If animations have different durations, scale proportionally
        if (Math.abs(clipDuration - durationRef.current) < 0.001) {
          // Same duration (within floating point tolerance) - set directly
          action.time = newTime;
        } else {
          // Different duration - scale proportionally
          action.time = (newTime / durationRef.current) * clipDuration;
        }
        // Ensure time is within valid range
        action.time = Math.max(0, Math.min(action.time, clipDuration));
      }
    });
    
    // Force mixer update to apply the time changes immediately
    // This is crucial - without this, the visual won't update
    mixerRef.current.update(0);
    
    setCurrentTime(newTime);
  };

  const handleTimelineMouseUp = () => {
    isScrubbingRef.current = false;
  };

  // Format time for display
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Frame duration (assuming 30fps, which is standard)
  const FRAME_DURATION = 1 / 30;

  // Step one frame backward
  const stepFrameBackward = () => {
    if (!mixerRef.current || durationRef.current <= 0 || actionsRef.current.length === 0) {
      return;
    }

    // Pause if playing
    if (isPlayingRef.current) {
      mixerRef.current.timeScale = 0;
      isPlayingRef.current = false;
      setIsPlaying(false);
    }

    const newTime = Math.max(0, currentTime - FRAME_DURATION);
    
    // Update each action's time
    actionsRef.current.forEach((action) => {
      if (action && action.getClip()) {
        const clipDuration = action.getClip().duration;
        if (Math.abs(clipDuration - durationRef.current) < 0.001) {
          action.time = newTime;
        } else {
          action.time = (newTime / durationRef.current) * clipDuration;
        }
        action.time = Math.max(0, Math.min(action.time, clipDuration));
      }
    });

    mixerRef.current.update(0);
    setCurrentTime(newTime);
  };

  // Step one frame forward
  const stepFrameForward = () => {
    if (!mixerRef.current || durationRef.current <= 0 || actionsRef.current.length === 0) {
      return;
    }

    // Pause if playing
    if (isPlayingRef.current) {
      mixerRef.current.timeScale = 0;
      isPlayingRef.current = false;
      setIsPlaying(false);
    }

    const newTime = Math.min(durationRef.current, currentTime + FRAME_DURATION);
    
    // Update each action's time
    actionsRef.current.forEach((action) => {
      if (action && action.getClip()) {
        const clipDuration = action.getClip().duration;
        if (Math.abs(clipDuration - durationRef.current) < 0.001) {
          action.time = newTime;
        } else {
          action.time = (newTime / durationRef.current) * clipDuration;
        }
        action.time = Math.max(0, Math.min(action.time, clipDuration));
      }
    });

    mixerRef.current.update(0);
    setCurrentTime(newTime);
  };

  return (
    <>
      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--accent);
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--accent);
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        .slider:focus {
          outline: none;
        }
        .slider:focus::-webkit-slider-thumb {
          box-shadow: 0 0 0 3px rgba(255, 148, 78, 0.3);
        }
      `}</style>
      <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/superadmin/resources")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">3D Model Test</h1>
          <p className="text-muted-foreground">
            Superadmin test page rendering <code>lego_assembly.glb</code> with Three.js.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0 relative">
              <div
                ref={mountRef}
                className="aspect-video bg-black rounded-t-lg overflow-hidden"
              />
              {modelLoaded && duration > 0 && (
                <div className="bg-gray-900 text-white p-4 rounded-b-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={stepFrameBackward}
                        disabled={currentTime <= 0}
                        className="text-white hover:bg-accent/20 hover:text-accent h-8 w-8 p-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 active:scale-90 active:bg-accent/30"
                        title="Previous frame"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={togglePlayPause}
                        className="text-white hover:bg-accent/20 hover:text-accent h-8 w-8 p-0 transition-all duration-150 active:scale-90 active:bg-accent/30"
                      >
                        {isPlaying ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={stepFrameForward}
                        disabled={currentTime >= duration}
                        className="text-white hover:bg-accent/20 hover:text-accent h-8 w-8 p-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 active:scale-90 active:bg-accent/30"
                        title="Next frame"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="0.1"
                        value={duration > 0 ? (currentTime / duration) * 100 : 0}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          handleTimelineChange(val);
                        }}
                        onMouseDown={() => {
                          isScrubbingRef.current = true;
                        }}
                        onMouseUp={handleTimelineMouseUp}
                        onTouchStart={() => {
                          isScrubbingRef.current = true;
                        }}
                        onTouchEnd={handleTimelineMouseUp}
                        className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                        style={{
                          background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${
                            duration > 0 ? (currentTime / duration) * 100 : 0
                          }%, #374151 ${
                            duration > 0 ? (currentTime / duration) * 100 : 0
                          }%, #374151 100%)`,
                        }}
                      />
                    </div>
                    <div className="text-sm font-mono min-w-[80px] text-right">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-400 flex items-center gap-2">
                    <span>Animation</span>
                    {animationsRef.current.length > 0 && (
                      <span className="text-gray-500">
                        ({animationsRef.current.length} animation
                        {animationsRef.current.length !== 1 ? "s" : ""})
                      </span>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                This page mimics the SuperAdmin resource view layout but replaces the
                video/document area with a 3D viewer powered by <code>three.js</code>.
              </p>
              <p>
                The model is loaded from <code>/models/lego_assembly.glb</code> in the
                backend public folder, served via the same origin.
              </p>
              <p>
                Use this route only for experimentation:{" "}
                <code>/superadmin/test</code>.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </>
  );
}


