import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default function SuperAdminTest3DView() {
  const navigate = useNavigate();
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelError, setModelError] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || container.offsetWidth * (9 / 16);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

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

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

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
        setModelLoaded(true);
      },
      undefined,
      (error: unknown) => {
        console.error("Error loading GLB model:", error);
        setModelError(true);
      }
    );

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Rotate cube so we can clearly see rendering while GLB is loading / if it fails
      if (!modelLoaded) {
        cube.rotation.y += 0.01;
      }
      controls.update();

      renderer.render(scene, camera);
    };

    animate();

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
      controls.dispose();
      cubeGeometry.dispose();
      cubeMaterial.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return (
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
            <CardContent className="p-0">
              <div
                ref={mountRef}
                className="aspect-video bg-black rounded-lg overflow-hidden"
              />
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
  );
}


