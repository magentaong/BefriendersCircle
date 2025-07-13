import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const HomeSafetyScene: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Guard Clause: ensure this executes only in a valid client-side environment / when DOM element is available
        if (typeof window === 'undefined' || !containerRef.current) {
            return;
        }

        // Guard Clause: Check if a canvas element already exists in the container
        if (containerRef.current.querySelector('canvas')) {
            console.log("Canvas already exists, skipping initialization in StrictMode.");
            return;
        }

        // Setup main components of the scene
        // width / height allows the scene to follow its parent container's sizing
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });

        renderer.setSize(width, height);
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        renderer.domElement.style.display = 'block';
        renderer.domElement.style.borderRadius = '0.75rem';

        containerRef.current.appendChild(renderer.domElement);

        // TODO: Setupcamera so you can look around (limited), and can change its camera track
        camera.position.z = 5;

        // Spawn a cube in the scene
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        // Animate cube to spin
        const animate = () => {
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        };
        animate();

        // window resizing -- specifically to handle website tbh
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
