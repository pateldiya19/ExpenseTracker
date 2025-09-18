import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Text } from '@react-three/drei';

export function FloatingCard({ position, color, children, speed = 1 }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * speed) * 0.1;
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * speed * 0.7) * 0.1;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.2;
    }
  });

  return (
    <group
      ref={meshRef}
      position={position}
    >
      <RoundedBox args={[2, 1.2, 0.1]} radius={0.1} smoothness={4}>
        <meshPhysicalMaterial 
          color={color} 
          transparent 
          opacity={0.8}
          roughness={0.1}
          metalness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </RoundedBox>
      <Text
        position={[0, 0, 0.06]}
        fontSize={0.2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {children}
      </Text>
    </group>
  );
}