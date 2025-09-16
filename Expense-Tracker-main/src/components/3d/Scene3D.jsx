import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Environment, Float } from '@react-three/drei';
import { FloatingCard } from './FloatingCard';
import { Suspense } from 'react';

function Scene3DContent() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <spotLight position={[-10, -10, -10]} angle={0.15} penumbra={1} intensity={0.5} />
      
      <Stars 
        radius={100} 
        depth={50} 
        count={5000} 
        factor={4} 
        saturation={0} 
        fade={true}
        speed={1}
      />
      
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
        <FloatingCard position={[-3, 2, 0]} color="#5D3FD3" speed={0.8}>
          Track Expenses
        </FloatingCard>
      </Float>
      
      <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.7}>
        <FloatingCard position={[3, -1, -1]} color="#FF4D8A" speed={1.2}>
          Budget Goals
        </FloatingCard>
      </Float>
      
      <Float speed={1.8} rotationIntensity={0.4} floatIntensity={0.6}>
        <FloatingCard position={[0, 1, -2]} color="#00C2A8" speed={0.6}>
          Analytics
        </FloatingCard>
      </Float>
      
      <Float speed={1.4} rotationIntensity={0.6} floatIntensity={0.4}>
        <FloatingCard position={[-2, -2, 1]} color="#FFB800" speed={1.4}>
          Categories
        </FloatingCard>
      </Float>
      
      <Environment preset="night" />
      <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2} />
    </>
  );
}

export function Scene3D() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <Scene3DContent />
        </Suspense>
      </Canvas>
    </div>
  );
}