import React, { useRef, useEffect } from 'react'
import * as THREE from 'three'
import styles from './Body.module.css'

const Controller3D: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null)
    const sceneRef = useRef<THREE.Scene | null>(null)
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
    const controllerRef = useRef<THREE.Group | null>(null)
    const animationIdRef = useRef<number | null>(null)

    useEffect(() => {
        if (!containerRef.current) return

        // Get container dimensions
        const width = containerRef.current.clientWidth
        const height = containerRef.current.clientHeight

        // Scene setup
        const scene = new THREE.Scene()
        scene.background = null
        sceneRef.current = scene

        // Camera setup
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
        camera.position.z = 3
        cameraRef.current = camera

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        renderer.setSize(width, height)
        renderer.setPixelRatio(window.devicePixelRatio)
        renderer.shadowMap.enabled = true
        rendererRef.current = renderer
        containerRef.current.appendChild(renderer.domElement)

        // Create controller geometry (simplified shape)
        const controllerGroup = new THREE.Group()
        controllerRef.current = controllerGroup

        // Main body - Rounded capsule shape instead of box
        const bodyGeometry = new THREE.CapsuleGeometry(0.5, 1.8, 8, 16)
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: 0x2a2a2a,
            shininess: 50,
            flatShading: false,
            emissive: 0x0a0a0a
        })
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
        body.rotation.z = Math.PI / 2
        body.scale.set(1, 0.95, 1)
        body.castShadow = true
        body.receiveShadow = true
        body.userData.origColor = 0x2a2a2a
        controllerGroup.add(body)

        // Top body cap with rounded edges - Enhanced gloss finish
        const capGeometry = new THREE.CapsuleGeometry(0.95, 1.5, 8, 16)
        const capMaterial = new THREE.MeshPhongMaterial({
            color: 0x1a1a1a,
            shininess: 60,
            emissive: 0x050505
        })
        const cap = new THREE.Mesh(capGeometry, capMaterial)
        cap.rotation.z = Math.PI / 2
        cap.scale.set(0.5, 1, 0.9)
        cap.position.z = 0.15
        cap.castShadow = true
        cap.receiveShadow = true
        controllerGroup.add(cap)

        // Left grip - Spherical extension from left side
        const leftGripGeometry = new THREE.SphereGeometry(0.35, 32, 32)
        const gripMaterial = new THREE.MeshPhongMaterial({
            color: 0x1f1f1f,
            shininess: 15,
            emissive: 0x050505
        })
        const leftGrip = new THREE.Mesh(leftGripGeometry, gripMaterial)
        leftGrip.position.set(-1.5, 0, 0.35)
        leftGrip.scale.set(0.8, 1.2, 1)
        leftGrip.castShadow = true
        leftGrip.receiveShadow = true
        controllerGroup.add(leftGrip)

        // Left grip hold indentations - Cylindrical grooves for grip
        const leftGripIndentGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.8, 32)
        const gripIndentMaterial = new THREE.MeshPhongMaterial({
            color: 0x141414,
            shininess: 10,
            emissive: 0x000000
        })

        // Upper left indent
        const leftGripIndentTop = new THREE.Mesh(leftGripIndentGeometry, gripIndentMaterial)
        leftGripIndentTop.position.set(-1.5, 0.3, 0.35)
        leftGripIndentTop.rotation.z = Math.PI / 2
        leftGripIndentTop.castShadow = true
        leftGripIndentTop.receiveShadow = true
        controllerGroup.add(leftGripIndentTop)

        // Lower left indent
        const leftGripIndentBottom = new THREE.Mesh(leftGripIndentGeometry, gripIndentMaterial)
        leftGripIndentBottom.position.set(-1.5, -0.3, 0.35)
        leftGripIndentBottom.rotation.z = Math.PI / 2
        leftGripIndentBottom.castShadow = true
        leftGripIndentBottom.receiveShadow = true
        controllerGroup.add(leftGripIndentBottom)

        // Right grip - Spherical extension from right side
        const rightGrip = new THREE.Mesh(leftGripGeometry, gripMaterial)
        rightGrip.position.set(1.5, 0, 0.35)
        rightGrip.scale.set(0.8, 1.2, 1)
        rightGrip.castShadow = true
        rightGrip.receiveShadow = true
        controllerGroup.add(rightGrip)

        // Right grip hold indentations - Cylindrical grooves for grip
        // Upper right indent
        const rightGripIndentTop = new THREE.Mesh(leftGripIndentGeometry, gripIndentMaterial)
        rightGripIndentTop.position.set(1.5, 0.3, 0.35)
        rightGripIndentTop.rotation.z = Math.PI / 2
        rightGripIndentTop.castShadow = true
        rightGripIndentTop.receiveShadow = true
        controllerGroup.add(rightGripIndentTop)

        // Lower right indent
        const rightGripIndentBottom = new THREE.Mesh(leftGripIndentGeometry, gripIndentMaterial)
        rightGripIndentBottom.position.set(1.5, -0.3, 0.35)
        rightGripIndentBottom.rotation.z = Math.PI / 2
        rightGripIndentBottom.castShadow = true
        rightGripIndentBottom.receiveShadow = true
        controllerGroup.add(rightGripIndentBottom)

        // Left bumper - Spherical shape
        const bumperGeometry = new THREE.SphereGeometry(0.12, 32, 32)
        const bumperMaterial = new THREE.MeshPhongMaterial({
            color: 0x556680,
            shininess: 50,
            emissive: 0x222233
        })
        const leftBumper = new THREE.Mesh(bumperGeometry, bumperMaterial)
        leftBumper.position.set(-0.5, 0.55, 0)
        leftBumper.scale.set(1, 0.6, 1.5)
        leftBumper.castShadow = true
        leftBumper.receiveShadow = true
        controllerGroup.add(leftBumper)

        // Right bumper - Spherical shape
        const rightBumper = new THREE.Mesh(bumperGeometry, bumperMaterial)
        rightBumper.position.set(0.5, 0.55, 0)
        rightBumper.scale.set(1, 0.6, 1.5)
        rightBumper.castShadow = true
        rightBumper.receiveShadow = true
        controllerGroup.add(rightBumper)

        // D-pad (left side buttons) - White spherical buttons for visibility
        const buttonGeometry = new THREE.SphereGeometry(0.14, 32, 32)
        const buttonMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            shininess: 80,
            emissive: 0xeeeeee
        })

        const dPadPositions = [
            [-0.42, 0.3, 0.28],
            [-0.62, 0.1, 0.28],
            [-0.42, -0.1, 0.28],
            [-0.22, 0.1, 0.28],
        ]

        dPadPositions.forEach(pos => {
            const button = new THREE.Mesh(buttonGeometry, buttonMaterial)
            button.position.set(pos[0], pos[1], pos[2])
            button.castShadow = true
            button.receiveShadow = true
            controllerGroup.add(button)
        })

        // Action buttons (right side) - Vibrant and glossy
        const actionButtonGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.07, 32)
        const actionButtonMaterial = new THREE.MeshPhongMaterial({
            color: 0x4a90e2,
            shininess: 70,
            emissive: 0x1a50c2
        })

        const actionButtonPositions = [
            [0.42, 0.3, 0.28],
            [0.22, 0.1, 0.28],
            [0.42, -0.1, 0.28],
            [0.62, 0.1, 0.28],
        ]

        actionButtonPositions.forEach(pos => {
            const button = new THREE.Mesh(actionButtonGeometry, actionButtonMaterial)
            button.position.set(pos[0], pos[1], pos[2])
            button.castShadow = true
            button.receiveShadow = true
            controllerGroup.add(button)
        })

        // Center analog sticks - White spherical joysticks with enhanced grip
        const stickBaseGeometry = new THREE.SphereGeometry(0.18, 32, 32)
        const stickBaseMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            shininess: 80,
            emissive: 0xeeeeee
        })

        const leftStickBase = new THREE.Mesh(stickBaseGeometry, stickBaseMaterial)
        leftStickBase.position.set(-0.42, -0.3, 0.28)
        leftStickBase.castShadow = true
        leftStickBase.receiveShadow = true
        controllerGroup.add(leftStickBase)

        const rightStickBase = new THREE.Mesh(stickBaseGeometry, stickBaseMaterial)
        rightStickBase.position.set(0.42, -0.3, 0.28)
        rightStickBase.castShadow = true
        rightStickBase.receiveShadow = true
        controllerGroup.add(rightStickBase)

        scene.add(controllerGroup)

        // Enhanced Lighting for realistic 3D effect
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
        scene.add(ambientLight)

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2)
        directionalLight.position.set(8, 8, 8)
        directionalLight.castShadow = true
        directionalLight.shadow.mapSize.width = 2048
        directionalLight.shadow.mapSize.height = 2048
        directionalLight.shadow.camera.left = -8
        directionalLight.shadow.camera.right = 8
        directionalLight.shadow.camera.top = 8
        directionalLight.shadow.camera.bottom = -8
        scene.add(directionalLight)

        // Cool blue accent light
        const pointLight1 = new THREE.PointLight(0x4a90e2, 1.0)
        pointLight1.position.set(-5, 3, 5)
        scene.add(pointLight1)

        // Warm green accent light
        const pointLight2 = new THREE.PointLight(0x90e24a, 0.8)
        pointLight2.position.set(5, 3, 5)
        scene.add(pointLight2)

        // Mouse tracking for rotation
        let mouseX = 0
        let mouseY = 0
        let targetRotationX = 0
        let targetRotationY = 0

        const onMouseMove = (event: MouseEvent) => {
            if (!containerRef.current) return
            const rect = containerRef.current.getBoundingClientRect()
            mouseX = (event.clientX - rect.left) / rect.width - 0.5
            mouseY = (event.clientY - rect.top) / rect.height - 0.5

            targetRotationY = mouseX * Math.PI * 0.5
            targetRotationX = mouseY * Math.PI * 0.3
        }

        window.addEventListener('mousemove', onMouseMove)

        // Handle window resize
        const handleResize = () => {
            if (!containerRef.current) return
            const newWidth = containerRef.current.clientWidth
            const newHeight = containerRef.current.clientHeight
            camera.aspect = newWidth / newHeight
            camera.updateProjectionMatrix()
            renderer.setSize(newWidth, newHeight)
        }

        window.addEventListener('resize', handleResize)

        // Animation loop
        const animate = () => {
            animationIdRef.current = requestAnimationFrame(animate)

            if (controllerRef.current) {
                controllerRef.current.rotation.x += (targetRotationX - controllerRef.current.rotation.x) * 0.05
                controllerRef.current.rotation.y += (targetRotationY - controllerRef.current.rotation.y) * 0.05
                controllerRef.current.rotation.z += 0.002
            }

            renderer.render(scene, camera)
        }

        animate()

        // Cleanup
        return () => {
            window.removeEventListener('mousemove', onMouseMove)
            window.removeEventListener('resize', handleResize)
            if (animationIdRef.current) {
                cancelAnimationFrame(animationIdRef.current)
            }
            if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
                containerRef.current.removeChild(renderer.domElement)
            }
            bodyGeometry.dispose()
            bodyMaterial.dispose()
            gripMaterial.dispose()
            bumperMaterial.dispose()
            buttonMaterial.dispose()
            actionButtonMaterial.dispose()
            stickBaseMaterial.dispose()
            renderer.dispose()
        }
    }, [])

    return <div id={styles['canvas-container']} ref={containerRef} />
}

export default Controller3D