import React, { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js'
import styles from './Body.module.css'

const Controller3D: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null)
    const controllerGroupRef = useRef<THREE.Group>(new THREE.Group())
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!containerRef.current) return

        const width = containerRef.current.clientWidth
        const height = containerRef.current.clientHeight

        // --- Scene & Camera ---
        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
        camera.position.z = 12 // Initial distance

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        renderer.setSize(width, height)
        renderer.setPixelRatio(window.devicePixelRatio)
        renderer.outputColorSpace = THREE.SRGBColorSpace
        containerRef.current.appendChild(renderer.domElement)

        scene.add(controllerGroupRef.current)

        // --- Lighting ---
        scene.add(new THREE.AmbientLight(0xffffff, 0.8))
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.5)
        dirLight.position.set(5, 10, 7)
        scene.add(dirLight)

        // --- Loaders ---
        const mtlLoader = new MTLLoader()
        mtlLoader.load('/controller.mtl', (materials) => {
            materials.preload()

            const objLoader = new OBJLoader()
            objLoader.setMaterials(materials)
            objLoader.load('/controller.obj', (object) => {

                // 1. Calculate Bounding Box for Perfect Scaling
                const box = new THREE.Box3().setFromObject(object)
                const size = box.getSize(new THREE.Vector3())
                const center = box.getCenter(new THREE.Vector3())

                // 2. Center the model geometry
                object.position.sub(center)

                // 3. Prevent Overflow: Scale the model to fit a fixed "safe" size
                const maxDimension = Math.max(size.x, size.y, size.z)
                const scaleFactor = 4.5 / maxDimension // Fits within a 4.5 unit radius
                object.scale.set(scaleFactor, scaleFactor, scaleFactor)

                controllerGroupRef.current.add(object)
            }, undefined, () => setError("OBJ file missing in public folder"))
        }, undefined, () => setError("MTL file missing in public folder"))

        // --- Interaction State ---
        let isDragging = false
        let previousMouseX = 0
        let previousMouseY = 0

        // --- Handlers ---
        const onMouseDown = (e: MouseEvent) => {
            isDragging = true
            previousMouseX = e.clientX
            previousMouseY = e.clientY
        }

        const onMouseMove = (e: MouseEvent) => {
            if (!isDragging) return
            const deltaX = e.clientX - previousMouseX
            const deltaY = e.clientY - previousMouseY
            controllerGroupRef.current.rotation.y += deltaX * 0.007
            controllerGroupRef.current.rotation.x += deltaY * 0.007
            previousMouseX = e.clientX
            previousMouseY = e.clientY
        }

        const onMouseUp = () => { isDragging = false }

        // --- Zoom Logic ---
        const onWheel = (e: WheelEvent) => {
            e.preventDefault()
            const zoomSpeed = 0.005
            // Min distance 5, Max distance 20 to prevent overflow/disappearing
            camera.position.z = THREE.MathUtils.clamp(
                camera.position.z + e.deltaY * zoomSpeed,
                5,
                20
            )
        }

        // --- Event Listeners ---
        const container = containerRef.current
        container.addEventListener('wheel', onWheel, { passive: false })
        window.addEventListener('mousedown', onMouseDown)
        window.addEventListener('mousemove', onMouseMove)
        window.addEventListener('mouseup', onMouseUp)

        // --- Animation Loop ---
        const animate = () => {
            requestAnimationFrame(animate)
            if (!isDragging) {
                controllerGroupRef.current.rotation.y += 0.003 // Subtle idle spin
            }
            renderer.render(scene, camera)
        }
        animate()

        // --- Cleanup ---
        return () => {
            container.removeEventListener('wheel', onWheel)
            window.removeEventListener('mousedown', onMouseDown)
            window.removeEventListener('mousemove', onMouseMove)
            window.removeEventListener('mouseup', onMouseUp)
            renderer.dispose()
        }
    }, [])

    return (
        <div
            ref={containerRef}
            className={styles['canvas-container']}
            style={{
                width: '100%',
                height: '100vh',
                cursor: 'grab',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            {error && <div style={{ color: '#ff4444', fontWeight: 'bold' }}>{error}</div>}
        </div>
    )
}

export default Controller3D