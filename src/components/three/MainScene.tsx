"use client"

import { useRef, useState, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Environment, OrbitControls, Float, Sphere, MeshDistortMaterial } from "@react-three/drei"
import type { Group } from "three"

export function MainScene() {
  return (
    <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
      <color attach="background" args={["#1a1a1d"]} />
      <fog attach="fog" args={["#1a1a1d", 10, 40]} />
      <ambientLight intensity={0.2} />
      <Environment preset="city" />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        rotateSpeed={0.4}
        autoRotate
        autoRotateSpeed={0.5}
        minPolarAngle={Math.PI / 2.5}
        maxPolarAngle={Math.PI / 1.5}
      />

      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <Logo position={[0, 1, 0]} />
      </Float>

      <GridPoints />
      <FloatingParticles />
      <DataFlowLines />
    </Canvas>
  )
}

function Logo({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<Group>(null)

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.2
    }
  })

  return (
    <group ref={groupRef} position={position}>
      {/* Abstract logo representation with geometric shapes */}
      <mesh position={[-2, 0, 0]}>
        <boxGeometry args={[2, 0.8, 0.2]} />
        <meshStandardMaterial color="#0066ff" metalness={0.8} roughness={0.2} />
      </mesh>
      
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2]} />
        <meshStandardMaterial color="#00d9ff" metalness={0.8} roughness={0.2} />
      </mesh>
      
      <mesh position={[2, 0, 0]}>
        <sphereGeometry args={[0.4]} />
        <meshStandardMaterial color="#e8e8eb" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  )
}

function GridPoints() {
  const pointsRef = useRef<Group>(null)
  const [points, setPoints] = useState<Array<[number, number, number]>>([])

  useEffect(() => {
    const gridSize = 10
    const spacing = 2
    const newPoints: Array<[number, number, number]> = []

    for (let x = -gridSize; x <= gridSize; x += spacing) {
      for (let z = -gridSize; z <= gridSize; z += spacing) {
        // Create a grid but exclude points near the center
        const distance = Math.sqrt(x * x + z * z)
        if (distance > 5) {
          newPoints.push([x, -3, z])
        }
      }
    }

    setPoints(newPoints)
  }, [])

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.getElapsedTime() * 0.05
    }
  })

  return (
    <group ref={pointsRef}>
      {points.map((position, i) => (
        <mesh key={i} position={position}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color="#0066ff" emissive="#0066ff" emissiveIntensity={0.5} />
        </mesh>
      ))}
    </group>
  )
}

function FloatingParticles() {
  const particlesRef = useRef<Group>(null)
  const [particles, setParticles] = useState<
    Array<{
      position: [number, number, number]
      speed: number
      size: number
      color: string
    }>
  >([])

  useEffect(() => {
    const count = 50
    const newParticles = []

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = 5 + Math.random() * 10
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      const y = (Math.random() - 0.5) * 10

      newParticles.push({
        position: [x, y, z] as [number, number, number],
        speed: 0.2 + Math.random() * 0.3,
        size: 0.05 + Math.random() * 0.1,
        color: Math.random() > 0.7 ? "#0066ff" : "#00d9ff",
      })
    }

    setParticles(newParticles)
  }, [])

  useFrame(() => {
    if (particlesRef.current) {
      particlesRef.current.children.forEach((particle, i) => {
        const data = particles[i]
        if (data) {
          // Move particles up and reset when they reach the top
          particle.position.y += data.speed * 0.02
          if (particle.position.y > 5) {
            particle.position.y = -5
          }
        }
      })
    }
  })

  return (
    <group ref={particlesRef}>
      {particles.map((particle, i) => (
        <mesh key={i} position={particle.position}>
          <sphereGeometry args={[particle.size, 16, 16]} />
          <meshStandardMaterial
            color={particle.color}
            emissive={particle.color}
            emissiveIntensity={0.5}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}
    </group>
  )
}

function DataFlowLines() {
  const linesRef = useRef<Group>(null)

  useFrame(({ clock }) => {
    if (linesRef.current) {
      linesRef.current.rotation.y = clock.getElapsedTime() * 0.1
    }
  })

  return (
    <group ref={linesRef} position={[0, 0, 0]}>
      <Sphere args={[8, 32, 32]} position={[0, 0, 0]}>
        <MeshDistortMaterial
          color="#0066ff"
          attach="material"
          distort={0.3}
          speed={2}
          wireframe
          transparent
          opacity={0.2}
        />
      </Sphere>
      
      <Sphere args={[6, 32, 32]} position={[0, 0, 0]}>
        <MeshDistortMaterial
          color="#00d9ff"
          attach="material"
          distort={0.4}
          speed={1.5}
          wireframe
          transparent
          opacity={0.15}
        />
      </Sphere>
    </group>
  )
}