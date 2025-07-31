import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface HomeSafetySceneProps {
  activeAnimation: string | null;
}

const HomeSafetyScene: React.FC<HomeSafetySceneProps> = ({ activeAnimation }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const mixerRef = useRef<THREE.AnimationMixer | null>(null);
    const actionsRef = useRef<Record<string, THREE.AnimationAction>>({});

    useEffect(() => {
        if (typeof window === 'undefined' || !containerRef.current) return;
        if (containerRef.current.querySelector('canvas')) return;

        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        // Scene Camera -- use later to move along track
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.set(1, 1.5, 6);
        camera.lookAt(1, 1, 0);

        // Container Sizing
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        renderer.domElement.style.display = 'block';
        renderer.domElement.style.borderRadius = '0.75rem';

        containerRef.current.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        scene.add(ambientLight);

        // Load model
        const loader = new GLTFLoader();
        loader.load(
            '/models/testScene.gltf',
            (gltf) => {
                const model = gltf.scene;
                model.position.set(0, 0, 0);
                model.scale.set(0.5, 0.5, 0.5);
                scene.add(model);

                const mixer = new THREE.AnimationMixer(model);
                mixerRef.current = mixer;

                // constant fan animation
                const LRclip = THREE.AnimationClip.findByName(gltf.animations, 'LivingRoomFan');
                if (LRclip) {
                    const LRAction = mixer.clipAction(LRclip);
                    LRAction.setLoop(THREE.LoopRepeat, Infinity);
                    LRAction.clampWhenFinished = false;
                    LRAction.enabled = true;
                    LRAction.play();
                } else {
                    console.warn('Animation "LivingRoomFan" not found!');
                }
                const BRclip = THREE.AnimationClip.findByName(gltf.animations, 'BedroomFan');
                if (BRclip) {
                    const BRAction = mixer.clipAction(BRclip);
                    BRAction.setLoop(THREE.LoopRepeat, Infinity);
                    BRAction.clampWhenFinished = false;
                    BRAction.enabled = true;
                    BRAction.play();
                } else {
                    console.warn('Animation "BedroomFan" not found!');
                }

                gltf.animations.forEach((clip) => {
                    const action = mixer.clipAction(clip);
                    actionsRef.current[clip.name] = action;
                });
            },
            (xhr) => {
                console.log(`Model ${Math.round((xhr.loaded / xhr.total) * 100)}% loaded`);
            },
            (error) => {
                console.error('An error happened while loading the GLTF model', error);
            }
        );

        // Animation render loop
        const clock = new THREE.Clock();
        const animate = () => {
            requestAnimationFrame(animate);

            const delta = clock.getDelta();
            if (mixerRef.current) {
                mixerRef.current.update(delta);
            }

            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            if (!containerRef.current) return;
            const width = containerRef.current.clientWidth;
            const height = containerRef.current.clientHeight;

            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (containerRef.current?.contains(renderer.domElement)) {
                containerRef.current.removeChild(renderer.domElement);
            }
        };
    }, []);

    return <div ref={containerRef} className="w-full h-full" />;
};

export default HomeSafetyScene;
