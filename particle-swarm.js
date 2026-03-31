/**
 * First Runner - 3D Particle Swarm (Neural Operator Core)
 * Built with Three.js
 */

document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("swarm-canvas");
    if (!canvas || typeof THREE === "undefined") {
        console.warn("Three.js not loaded or swarm canvas not found.");
        return;
    }

    // 1. SCENE SETUP
    const scene = new THREE.Scene();
    // Add some fog for depth
    scene.fog = new THREE.FogExp2(0x010206, 0.002);

    const container = canvas.parentElement;

    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 1, 1000);
    camera.position.z = 150;

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance"
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 2. PARTICLES SETUP
    const count = 20000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    // Initial random spread (will be overwritten on first frame)
    for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 200;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 200;

        colors[i * 3] = 0.0;
        colors[i * 3 + 1] = 0.95; // Cyan base
        colors[i * 3 + 2] = 1.0;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Using a simple circular texture for particles (generated via canvas)
    const circleTexture = createCircleTexture();

    const material = new THREE.PointsMaterial({
        size: 1.2,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        map: circleTexture
    });

    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);

    // 3. MOUSE INTERACTION
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX) * 0.1;
        mouseY = (event.clientY - windowHalfY) * 0.1;
    });

    // 4. RESIZE HANDLER
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });

    // Handle container-specific resizes as well
    const resizeObserver = new ResizeObserver(() => {
        if (container.clientWidth > 0 && container.clientHeight > 0) {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        }
    });
    resizeObserver.observe(container);

    // 5. ANIMATION & MATH LOGIC
    // Reusable objects for zero GC (Garbage Collection) inside the loop
    const dummyTarget = new THREE.Vector3();
    const dummyColor = new THREE.Color();
    const clock = new THREE.Clock();

    // The core math from the reference prompt (Spherical Fibonacci Swarm)
    const golden = 2.399963229728653; // Golden angle in radians
    
    // Config values
    const freq = 4.0;
    const amp = 30.0;
    const twist = 2.0;
    const flowSpeed = 0.5;
    const scale = 50.0;

    function animate() {
        requestAnimationFrame(animate);

        const time = clock.getElapsedTime();
        const posAttr = particleSystem.geometry.attributes.position;
        const colAttr = particleSystem.geometry.attributes.color;

        const positions = posAttr.array;
        const colorsArr = colAttr.array;

        // Perform the calculation for all 20000 particles
        for (let i = 0; i < count; i++) {
            const t = i / count;
            const fi = i * golden + (time * 0.1); // Add slow rotation over time to the spiral
            const th = Math.acos(1.0 - 2.0 * t);

            // Base spherical mapping
            let x = Math.sin(th) * Math.cos(fi);
            let y = Math.sin(th) * Math.sin(fi);
            let z = Math.cos(th);

            // "Breathing" and Flowing Math logic
            // Add waves based on the twist and frequency
            const rOffset = Math.sin(fi * freq + time * flowSpeed) * amp;
            const radius = scale + rOffset + Math.sin(t * Math.PI * twist) * 10.0;

            dummyTarget.set(
                x * radius,
                y * radius,
                z * radius
            );

            // Assign Position
            positions[i * 3] = dummyTarget.x;
            positions[i * 3 + 1] = dummyTarget.y;
            positions[i * 3 + 2] = dummyTarget.z;

            // Color Logic (Mapping index to a cyberpunk gradient: Cyan -> Purple/Blue)
            // Cyan: HSL(0.5, 1.0, 0.5) | Purple: HSL(0.75, 1.0, 0.5)
            const hueOffset = Math.sin(time * 0.2 + t * Math.PI) * 0.1;
            const hue = 0.53 + (t * 0.2) + hueOffset; // Range ~ 0.5 to 0.75

            // Highlight specific waves in the pattern
            const lightness = 0.4 + (Math.sin(fi * freq + time * flowSpeed) * 0.3);

            dummyColor.setHSL(hue % 1.0, 1.0, Math.max(0.1, Math.min(lightness, 1.0)));

            // Assign Color
            colorsArr[i * 3] = dummyColor.r;
            colorsArr[i * 3 + 1] = dummyColor.g;
            colorsArr[i * 3 + 2] = dummyColor.b;
        }

        posAttr.needsUpdate = true;
        colAttr.needsUpdate = true;

        // Gentle overall rotation and mouse follow
        targetX = mouseX;
        targetY = mouseY;

        // Add a base idle rotation
        particleSystem.rotation.y += 0.001;
        particleSystem.rotation.z += 0.0005;

        // Camera smoothly follows mouse input to view the swarm from different angles
        camera.position.x += (targetX - camera.position.x) * 0.02;
        camera.position.y += (-targetY - camera.position.y) * 0.02;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    }

    // Helper to generate a soft circular particle texture dynamically
    function createCircleTexture() {
        const size = 64;
        const tCanvas = document.createElement('canvas');
        tCanvas.width = size;
        tCanvas.height = size;
        const context = tCanvas.getContext('2d');
        
        const gradient = context.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(0.2, 'rgba(255,255,255,0.8)');
        gradient.addColorStop(0.5, 'rgba(255,255,255,0.2)');
        gradient.addColorStop(1, 'rgba(0,0,0,0)');

        context.fillStyle = gradient;
        context.fillRect(0, 0, size, size);

        const tex = new THREE.CanvasTexture(tCanvas);
        return tex;
    }

    // Start Simulation
    animate();
});
