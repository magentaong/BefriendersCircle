import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface HomeSafetySceneProps {
    activeAnimation: string[] | null;
    cameraAnimation: string | null;
    onAnimationFinished?: () => void;
    leaveRef?: React.RefObject<() => Promise<void>>;
}

const LOOPING_ANIMATIONS = ['LivingRoomFan', 'BedroomFan'];

const HomeSafetyScene: React.FC<HomeSafetySceneProps> = ({ activeAnimation, cameraAnimation, onAnimationFinished }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.Camera | null>(null);
    const gltfRef = useRef<THREE.Group | null>(null);

    const objectMixerRef = useRef<THREE.AnimationMixer | null>(null);
    const cameraMixerRef = useRef<THREE.AnimationMixer | null>(null);

    const objectActionsRef = useRef<Record<string, THREE.AnimationAction>>({});
    const cameraActionsRef = useRef<Record<string, THREE.AnimationAction>>({});


    const setupModel = (model: THREE.Group, animations: THREE.AnimationClip[]) => {
        const scene = sceneRef.current;
        if (!scene) return;

        scene.add(model);

        // Set up mixers
        const objectMixer = new THREE.AnimationMixer(model);
        objectMixerRef.current = objectMixer;

        const cameraObject = model.getObjectByName('Camera');
        let cameraMixer: THREE.AnimationMixer | null = null;

        if (cameraObject && (cameraObject as THREE.Camera).isCamera) {
            cameraRef.current = cameraObject as THREE.Camera;
            cameraMixer = new THREE.AnimationMixer(cameraObject);
        } else {
            const fallbackCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
            fallbackCamera.position.set(0, 2, 5);
            cameraRef.current = fallbackCamera;
            cameraMixer = new THREE.AnimationMixer(fallbackCamera);
        }

        cameraMixerRef.current = cameraMixer;

        // Separate animations
        animations.forEach((clip) => {
            if (clip.name.startsWith('Camera')) {
                const action = cameraMixer.clipAction(clip);
                action.setLoop(THREE.LoopOnce, 1);
                action.clampWhenFinished = true;
                cameraActionsRef.current[clip.name] = action;
            } else {
                const action = objectMixer.clipAction(clip);
                if (LOOPING_ANIMATIONS.includes(clip.name)) {
                    action.setLoop(THREE.LoopRepeat, Infinity);
                    action.play();
                } else {
                    action.setLoop(THREE.LoopOnce, 1);
                    action.clampWhenFinished = true;
                    action.loop = THREE.LoopOnce;
                }
                objectActionsRef.current[clip.name] = action;
            }
        });
    };

    useEffect(() => {
        if (typeof window === 'undefined' || !containerRef.current) return;
        if (containerRef.current.querySelector('canvas')) return;

        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xffffff);
        sceneRef.current = scene;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        renderer.domElement.style.display = 'block';
        renderer.domElement.style.borderRadius = '0.75rem';
        containerRef.current.appendChild(renderer.domElement);

        // Lights
        scene.add(new THREE.AmbientLight(0xffffff, 1));

        // Load model
        new GLTFLoader().load(
            '/models/HSScene.glb',
            (gltf) => {
                gltfRef.current = gltf.scene;
                setupModel(gltf.scene, gltf.animations);
            },
            (xhr) => {
                console.log(`Model ${Math.round((xhr.loaded / xhr.total) * 100)}% loaded`);
            },
            (err) => {
                console.error('Failed to load model:', err);
            }
        );

        const clock = new THREE.Clock();
        const animate = () => {
            requestAnimationFrame(animate);
            const delta = clock.getDelta();
            objectMixerRef.current?.update(delta);
            cameraMixerRef.current?.update(delta);

            if (cameraRef.current) renderer.render(scene, cameraRef.current);
        };
        animate();

        // Responsive resizing
        const onResize = () => {
            if (!containerRef.current || !cameraRef.current) return;
            const width = containerRef.current.clientWidth;
            const height = containerRef.current.clientHeight;
            if ((cameraRef.current as THREE.PerspectiveCamera).isPerspectiveCamera) {
                const cam = cameraRef.current as THREE.PerspectiveCamera;
                cam.aspect = width / height;
                cam.updateProjectionMatrix();
            }
            renderer.setSize(width, height);
        };

        window.addEventListener('resize', onResize);

        return () => {
            window.removeEventListener('resize', onResize);
            renderer.dispose();
            containerRef.current?.removeChild(renderer.domElement);
        };
    }, []);

    const currentCameraActionRef = useRef<THREE.AnimationAction | null>(null);
    const currentObjectActionRef = useRef<THREE.AnimationAction | null>(null);

    const playAction = (actionName: string | null, isCamera = false) => {
        if (!actionName) return;

        const mixer = isCamera ? cameraMixerRef.current : objectMixerRef.current;
        const actions = isCamera ? cameraActionsRef.current : objectActionsRef.current;

        if (!actions[actionName] || !mixer) return;

        const action = actions[actionName];

        // Prevent replaying same camera action
        if (isCamera && currentCameraActionRef.current === action) return;

        // Stop other non-looping actions
        Object.entries(actions).forEach(([name, a]) => {
            if (name !== actionName && a.loop === THREE.LoopOnce) {
                a.stop();
            }
        });

        action.reset();
        action.play();

        if (isCamera) currentCameraActionRef.current = action;
        else currentObjectActionRef.current = action;

        const onFinished = () => {
            mixer.removeEventListener('finished', onFinished);
            if (!isCamera) action.stop(); // Keep camera pose at end
            onAnimationFinished?.();
        };
        mixer.addEventListener('finished', onFinished);
    };

    const playObjectAnimations = (animationNames: string[]) => {
        const mixer = objectMixerRef.current;
        if (!mixer) return;

        let completedCount = 0;
        const total = animationNames.length;

        animationNames.forEach((name) => {
            const action = objectActionsRef.current[name];
            if (!action) {
                console.warn(`Missing object animation: ${name}`);
                completedCount++;
                if (completedCount === total) onAnimationFinished?.();
                return;
            }

            // Stop if it's a previously playing non-looping action
            if (action.loop === THREE.LoopOnce) {
                action.stop();
            }

            action.reset();
            action.setLoop(THREE.LoopOnce, 1);
            action.clampWhenFinished = true;
            action.play();

            const onFinished = () => {
                mixer.removeEventListener('finished', onFinished);
                completedCount++;
                if (completedCount === total) {
                    onAnimationFinished?.();
                }
            };

            mixer.addEventListener('finished', onFinished);
        });
    };

    useEffect(() => {
        if (!activeAnimation) {
            return;
        }

        const animationList = Array.isArray(activeAnimation) ? activeAnimation : [activeAnimation];

        playObjectAnimations(animationList);
    }, [activeAnimation]);

    useEffect(() => {
        playAction(cameraAnimation, true);
    }, [cameraAnimation]);

    return <div ref={containerRef} className="w-full h-full" />;
};

export default HomeSafetyScene;