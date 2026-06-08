import React, { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
// Import GLTFLoader instead of OBJ/MTL
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
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
        camera.position.z = 12

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

        // --- GLTF Loader ---
        const gltfLoader = new GLTFLoader()

        // Ensure 'controller.glb' is in your /public folder
        gltfLoader.load(
            '/controller.glb',
            (gltf) => {
                const model = gltf.scene

                // 1. Calculate Bounding Box
                const box = new THREE.Box3().setFromObject(model)
                const size = box.getSize(new THREE.Vector3())
                const center = box.getCenter(new THREE.Vector3())

                // 2. Center the model
                model.position.sub(center)

                // 3. Scale to fit
                const maxDimension = Math.max(size.x, size.y, size.z)
                const scaleFactor = 4.5 / maxDimension
                model.scale.set(scaleFactor, scaleFactor, scaleFactor)

                controllerGroupRef.current.add(model)
            },
            undefined, // Progress callback
            (err) => {
                console.error(err)
                setError("Failed to load GLB model. Check if it exists in the public folder.")
            }
        )

        // --- Interaction State ---
        let isDragging = false
        let previousMouseX = 0
        let previousMouseY = 0

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

        const onWheel = (e: WheelEvent) => {
            e.preventDefault()
            const zoomSpeed = 0.005
            camera.position.z = THREE.MathUtils.clamp(
                camera.position.z + e.deltaY * zoomSpeed,
                5,
                20
            )
        }

        const container = containerRef.current
        container.addEventListener('wheel', onWheel, { passive: false })
        window.addEventListener('mousedown', onMouseDown)
        window.addEventListener('mousemove', onMouseMove)
        window.addEventListener('mouseup', onMouseUp)

        const animate = () => {
            const animationId = requestAnimationFrame(animate)
            if (!isDragging) {
                controllerGroupRef.current.rotation.y += 0.003
            }
            renderer.render(scene, camera)
        }
        animate()

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