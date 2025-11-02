import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import type { GLTF } from 'three/addons/loaders/GLTFLoader.js'

const Controller3D: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!mountRef.current) return

        const container = mountRef.current
        const width = container.clientWidth
        const height = container.clientHeight

        // Create scene
        const scene = new THREE.Scene()

        // Create camera
        const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000)
        camera.position.set(0, 0, 5)

        // Create renderer
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        })
        renderer.setSize(width, height)
        renderer.setPixelRatio(window.devicePixelRatio)
        container.appendChild(renderer.domElement)

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
        scene.add(ambientLight)

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
        directionalLight.position.set(5, 5, 5)
        scene.add(directionalLight)

        const pointLight = new THREE.PointLight(0x6496ff, 0.5)
        pointLight.position.set(-5, 2, 5)
        scene.add(pointLight)

        // Add orbit controls
        const controls = new OrbitControls(camera, renderer.domElement)
        controls.enableZoom = true
        controls.enablePan = false
        controls.minDistance = 3
        controls.maxDistance = 10

        // Load GLB model
        const loader = new GLTFLoader()
        loader.load(
            './controller.glb',
            (gltf: GLTF) => {
                const model = gltf.scene
                model.scale.set(1.5, 1.5, 1.5)
                scene.add(model)
            },
            undefined,
            (error: unknown) => {
                console.error('Error loading GLB model:', error)
            }
        )

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate)
            controls.update()
            renderer.render(scene, camera)
        }
        animate()

        // Handle window resize
        const handleResize = () => {
            const newWidth = container.clientWidth
            const newHeight = container.clientHeight
            camera.aspect = newWidth / newHeight
            camera.updateProjectionMatrix()
            renderer.setSize(newWidth, newHeight)
        }
        window.addEventListener('resize', handleResize)

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize)
            container.removeChild(renderer.domElement)
            renderer.dispose()
        }
    }, [])

    return (
        <div
            ref={mountRef}
            style={{
                position: 'absolute',
                width: '75%',
                height: '100%',
                zIndex: 1
            }}
        />
    )
}

export default Controller3D