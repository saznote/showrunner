import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { VRM, VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { AvatarEmotion } from '../types';
import { Upload, RotateCcw, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';

interface VrmAvatarViewerProps {
  vrmFile: File | null;
  isSpeaking: boolean;
  emotion: AvatarEmotion;
  onVrmLoaded?: (vrmData: { title?: string; author?: string; version?: string }) => void;
  onOpenUploadModal?: () => void;
}

export const VrmAvatarViewer: React.FC<VrmAvatarViewerProps> = ({
  vrmFile,
  isSpeaking,
  emotion,
  onVrmLoaded,
  onOpenUploadModal,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const vrmRef = useRef<VRM | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());
  const animFrameIdRef = useRef<number | null>(null);
  const proceduralHeadRef = useRef<THREE.Group | null>(null);
  const proceduralJawRef = useRef<THREE.Mesh | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hasVrm, setHasVrm] = useState(false);

  // Initialize Three.js Scene, Camera, Lighting & RoomEnvironment
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 300;
    const height = container.clientHeight || 533;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0a0f1d);

    // 2. Camera: Framed portrait for Shorts (chest to head)
    const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 20);
    camera.position.set(0, 1.35, 1.15); // Eye/chest level framing
    camera.lookAt(0, 1.32, 0);
    cameraRef.current = camera;

    // 3. Renderer with PBR color pipeline & Soft Shadows
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Studio Environment Reflection (RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. Studio 3-Point Lighting Rig
    // Warm Key Light
    const keyLight = new THREE.DirectionalLight(0xfff1e6, 2.2);
    keyLight.position.set(0.8, 2.2, 1.2);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    // Cool Fill Light
    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.0);
    fillLight.position.set(-1.0, 1.4, 0.8);
    scene.add(fillLight);

    // Purple Rim Backlight (Neon aesthetic for YouTube Shorts)
    const rimLight = new THREE.DirectionalLight(0xc084fc, 2.0);
    rimLight.position.set(0, 1.8, -1.2);
    scene.add(rimLight);

    // Hemisphere light for ground bounce
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x1e293b, 0.6);
    scene.add(hemiLight);

    // Contact shadow plane
    const shadowGeo = new THREE.PlaneGeometry(1.5, 1.5);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.01;
    scene.add(shadowMesh);

    // 6. Build High-Fidelity Procedural 3D Cyber Avatar (displayed while no .vrm is loaded)
    const procAvatar = buildProceduralCyberAvatar();
    scene.add(procAvatar.group);
    proceduralHeadRef.current = procAvatar.group;
    proceduralJawRef.current = procAvatar.jaw;

    // 7. Render Loop with smooth damping & lipsync
    let blinkTimer = 0;
    let nextBlinkInterval = 3.0;

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const delta = clockRef.current.getDelta();
      const elapsed = clockRef.current.getElapsedTime();

      // Update VRM Avatar if present
      if (vrmRef.current) {
        const vrm = vrmRef.current;
        vrm.update(delta);

        // Breathing idle movement on chest / spine
        const chest = vrm.humanoid?.getNormalizedBoneNode('chest') || vrm.humanoid?.getNormalizedBoneNode('spine');
        if (chest) {
          chest.rotation.x = Math.sin(elapsed * 1.5) * 0.02;
        }
        const head = vrm.humanoid?.getNormalizedBoneNode('head');
        if (head) {
          head.rotation.y = Math.sin(elapsed * 0.7) * 0.04;
          head.rotation.z = Math.cos(elapsed * 0.9) * 0.02;
        }

        // Automatic Eye Blink
        blinkTimer += delta;
        if (blinkTimer > nextBlinkInterval) {
          const blinkProgress = (blinkTimer - nextBlinkInterval) / 0.15;
          if (blinkProgress <= 1.0) {
            const blinkVal = Math.sin(blinkProgress * Math.PI);
            vrm.expressionManager?.setValue('blink', blinkVal);
          } else {
            vrm.expressionManager?.setValue('blink', 0);
            blinkTimer = 0;
            nextBlinkInterval = 2.5 + Math.random() * 2.5;
          }
        }

        // Real-Time Lipsync animation when speaking
        if (isSpeaking) {
          const mouthOpen = Math.abs(Math.sin(elapsed * 14)) * 0.85 + Math.abs(Math.sin(elapsed * 22)) * 0.15;
          const mouthForm = Math.sin(elapsed * 8);

          // Blend phonemes
          if (mouthForm > 0.2) {
            vrm.expressionManager?.setValue('aa', mouthOpen);
            vrm.expressionManager?.setValue('oh', 0);
            vrm.expressionManager?.setValue('ee', mouthOpen * 0.3);
          } else if (mouthForm < -0.2) {
            vrm.expressionManager?.setValue('oh', mouthOpen * 0.9);
            vrm.expressionManager?.setValue('aa', mouthOpen * 0.2);
            vrm.expressionManager?.setValue('ee', 0);
          } else {
            vrm.expressionManager?.setValue('ee', mouthOpen * 0.8);
            vrm.expressionManager?.setValue('aa', 0);
            vrm.expressionManager?.setValue('oh', 0);
          }
        } else {
          vrm.expressionManager?.setValue('aa', 0);
          vrm.expressionManager?.setValue('oh', 0);
          vrm.expressionManager?.setValue('ee', 0);
        }

        // Emotion blendshapes
        if (emotion === 'shocked') {
          vrm.expressionManager?.setValue('surprised', 0.9);
          vrm.expressionManager?.setValue('happy', 0);
          vrm.expressionManager?.setValue('relaxed', 0);
        } else if (emotion === 'money_eyes' || emotion === 'smirk') {
          vrm.expressionManager?.setValue('happy', 0.75);
          vrm.expressionManager?.setValue('surprised', 0);
          vrm.expressionManager?.setValue('relaxed', 0.5);
        } else {
          vrm.expressionManager?.setValue('surprised', 0);
          vrm.expressionManager?.setValue('happy', 0);
          vrm.expressionManager?.setValue('relaxed', 0.2);
        }

        vrm.expressionManager?.update();
      }

      // Procedural fallback avatar lipsync & breathing
      if (proceduralHeadRef.current && (!vrmRef.current || !hasVrm)) {
        proceduralHeadRef.current.position.y = 1.0 + Math.sin(elapsed * 1.8) * 0.015;
        proceduralHeadRef.current.rotation.y = Math.sin(elapsed * 0.8) * 0.05;

        if (proceduralJawRef.current) {
          if (isSpeaking) {
            const jawDrop = Math.abs(Math.sin(elapsed * 15)) * 0.045;
            proceduralJawRef.current.position.y = -0.06 - jawDrop;
          } else {
            proceduralJawRef.current.position.y = -0.06;
          }
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.dispose();
      }
      if (vrmRef.current) {
        VRMUtils.deepDispose(vrmRef.current.scene);
      }
    };
  }, []);

  // Load .vrm file when provided
  useEffect(() => {
    if (!vrmFile || !sceneRef.current) return;

    setIsLoading(true);
    setLoadError(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        if (!arrayBuffer) throw new Error('Impossible de lire le fichier .vrm');

        const loader = new GLTFLoader();
        loader.register((parser) => new VRMLoaderPlugin(parser));

        loader.parse(
          arrayBuffer,
          '',
          (gltf) => {
            const vrm: VRM = gltf.userData.vrm;
            if (!vrm) {
              throw new Error('Format VRM non reconnu dans ce fichier');
            }

            // Remove previous VRM model if exists
            if (vrmRef.current) {
              sceneRef.current?.remove(vrmRef.current.scene);
              VRMUtils.deepDispose(vrmRef.current.scene);
              vrmRef.current = null;
            }

            // Hide procedural avatar
            if (proceduralHeadRef.current) {
              proceduralHeadRef.current.visible = false;
            }

            // Configure VRM orientation & position
            VRMUtils.removeUnnecessaryVertices(gltf.scene);
            VRMUtils.removeUnnecessaryJoints(gltf.scene);
            vrm.scene.rotation.y = Math.PI; // Face camera
            vrm.scene.position.set(0, 0, 0);

            // Enable shadows on VRM meshes
            vrm.scene.traverse((obj) => {
              if ((obj as THREE.Mesh).isMesh) {
                obj.castShadow = true;
                obj.receiveShadow = true;
              }
            });

            sceneRef.current?.add(vrm.scene);
            vrmRef.current = vrm;
            setHasVrm(true);
            setIsLoading(false);

            // Auto-focus camera on head / chest based on humanoid head bone
            const headBone = vrm.humanoid?.getNormalizedBoneNode('head');
            if (headBone && cameraRef.current) {
              const headPos = new THREE.Vector3();
              headBone.getWorldPosition(headPos);
              cameraRef.current.position.set(0, headPos.y + 0.05, headPos.z + 0.95);
              cameraRef.current.lookAt(0, headPos.y, headPos.z);
            }

            // Extract metadata if available
            const meta = vrm.meta;
            if (onVrmLoaded && meta) {
              onVrmLoaded({
                title: (meta as any).name || (meta as any).title || vrmFile.name,
                author: (meta as any).authors?.[0] || (meta as any).author || 'Inconnu',
                version: (meta as any).vrmVersion || (meta as any).version || 'VRM 1.0',
              });
            }
          },
          (err) => {
            setIsLoading(false);
            setLoadError('Erreur de décodage VRM : ' + err.message);
          }
        );
      } catch (err: any) {
        setIsLoading(false);
        setLoadError(err.message || 'Erreur lors du chargement du fichier .vrm');
      }
    };

    reader.onerror = () => {
      setIsLoading(false);
      setLoadError('Erreur de lecture du fichier depuis votre PC.');
    };

    reader.readAsArrayBuffer(vrmFile);
  }, [vrmFile]);

  // Procedural Studio Cyber Avatar Generator (3-part PBR articulated model)
  function buildProceduralCyberAvatar() {
    const group = new THREE.Group();
    group.position.set(0, 1.0, 0);

    // Torso / Jacket
    const torsoGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.55, 16);
    const torsoMat = new THREE.MeshPhysicalMaterial({
      color: 0x111827,
      roughness: 0.35,
      metalness: 0.85,
      clearcoat: 0.4,
    });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = -0.15;
    torso.castShadow = true;
    group.add(torso);

    // Head Base
    const headGeo = new THREE.SphereGeometry(0.18, 32, 24);
    const headMat = new THREE.MeshPhysicalMaterial({
      color: 0x312e81,
      roughness: 0.25,
      metalness: 0.9,
      clearcoat: 0.8,
    });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 0.32;
    head.castShadow = true;
    group.add(head);

    // Neon Visor
    const visorGeo = new THREE.BoxGeometry(0.24, 0.07, 0.16);
    const visorMat = new THREE.MeshPhysicalMaterial({
      color: 0x06b6d4,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.6,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.8,
      thickness: 0.5,
    });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 0.33, 0.12);
    group.add(visor);

    // Articulated Jaw for Lipsync
    const jawGeo = new THREE.BoxGeometry(0.12, 0.04, 0.14);
    const jawMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.4,
      metalness: 0.7,
    });
    const jaw = new THREE.Mesh(jawGeo, jawMat);
    jaw.position.set(0, 0.22, 0.08);
    group.add(jaw);

    // Headset Earcups
    const earcupGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.05, 16);
    const earcupMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.9, roughness: 0.2 });

    const leftEarcup = new THREE.Mesh(earcupGeo, earcupMat);
    leftEarcup.rotation.z = Math.PI / 2;
    leftEarcup.position.set(-0.2, 0.32, 0);
    group.add(leftEarcup);

    const rightEarcup = leftEarcup.clone();
    rightEarcup.position.x = 0.2;
    group.add(rightEarcup);

    // Boom Mic
    const micArmGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.16);
    const micArm = new THREE.Mesh(micArmGeo, earcupMat);
    micArm.rotation.z = Math.PI / 3;
    micArm.position.set(-0.16, 0.24, 0.08);
    group.add(micArm);

    return { group, jaw };
  }

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-slate-950 flex flex-col items-center justify-center">
      {/* Three.js WebGL Mount Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center z-30">
          <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="font-heading font-bold text-sm text-white">Chargement de votre Avatar .VRM...</p>
          <p className="text-xs text-slate-400 mt-1">Extraction des blendshapes de lipsync et squelette humanoïde</p>
        </div>
      )}

      {/* Error Overlay */}
      {loadError && (
        <div className="absolute inset-0 bg-red-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30 space-y-3">
          <AlertCircle className="w-10 h-10 text-red-400" />
          <p className="font-bold text-sm text-white">Impossible de charger le modèle VRM</p>
          <p className="text-xs text-red-200">{loadError}</p>
          <button
            onClick={onOpenUploadModal}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
          >
            Choisir un autre fichier .vrm
          </button>
        </div>
      )}

      {/* Quick VRM Upload / Badge trigger */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
        <button
          onClick={onOpenUploadModal}
          className="px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 backdrop-blur-md text-[11px] font-semibold flex items-center gap-1.5 transition-all shadow-lg cursor-pointer"
          title="Charger un avatar .VRM depuis votre PC"
        >
          <Upload className="w-3.5 h-3.5 text-amber-400" />
          <span>{hasVrm ? 'Changer VRM (.vrm)' : 'Charger VRM 3D'}</span>
        </button>

        {hasVrm && (
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Lipsync Prêt
          </span>
        )}
      </div>

      {/* Reset Camera button */}
      <button
        onClick={() => {
          if (cameraRef.current) {
            cameraRef.current.position.set(0, 1.35, 1.15);
            cameraRef.current.lookAt(0, 1.32, 0);
          }
        }}
        className="absolute top-3 right-3 z-20 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/80 backdrop-blur-md text-xs cursor-pointer"
        title="Recentrer la caméra"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
