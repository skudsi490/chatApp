import { useRef, useMemo } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

import EarthDayMap from '../../assets/textures/8k_earth_daymap.jpg';
import EarthNormalMap from '../../assets/textures/8k_earth_normal_map.jpg';
import EarthSpecularMap from '../../assets/textures/8k_earth_specular_map.jpg';
import EarthCloudsMap from '../../assets/textures/8k_earth_clouds.jpg';

const CameraController = () => {
  const { camera, gl } = useThree();
  camera.position.set(0, 0, 1.7); // Adjust camera closer to the globe
  return <OrbitControls args={[camera, gl.domElement]} />;
};

const Earth = () => {
  const textureLoader = new THREE.TextureLoader();
  const maps = useMemo(() => ({
    colorMap: textureLoader.load(EarthDayMap),
    normalMap: textureLoader.load(EarthNormalMap),
    specularMap: textureLoader.load(EarthSpecularMap),
    cloudsMap: textureLoader.load(EarthCloudsMap),
  }), []);

  const earthRef = useRef();
  const cloudsRef = useRef();

  useFrame(() => {
    if (earthRef.current) earthRef.current.rotation.y += 0.001;
    if (cloudsRef.current) cloudsRef.current.rotation.y += 0.001;
  });

  return (
    <>
      {/* eslint-disable-next-line react/no-unknown-property */}
      <ambientLight intensity={1} />
      {/* eslint-disable-next-line react/no-unknown-property */}
      <pointLight position={[5, 5, 5]} />
      {/* eslint-disable-next-line react/no-unknown-property */}
      <Stars radius={300} depth={60} count={20000} factor={7} saturation={0} fade />
      <mesh ref={cloudsRef}>
        {/* eslint-disable-next-line react/no-unknown-property */}
        <sphereGeometry args={[1.015, 32, 32]} /> {/* Slightly increase the size of clouds */}
        {/* eslint-disable-next-line react/no-unknown-property */}
        <meshPhongMaterial map={maps.cloudsMap} opacity={0.4} transparent side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={earthRef}>
        {/* eslint-disable-next-line react/no-unknown-property */}
        <sphereGeometry args={[1.01, 32, 32]} /> {/* Slightly increase the size of the earth */}
        {/* eslint-disable-next-line react/no-unknown-property */}
        <meshPhongMaterial map={maps.colorMap} normalMap={maps.normalMap} specularMap={maps.specularMap} />
      </mesh>
    </>
  );
};

const GlobeVisualization = () => (
  <Canvas>
    <Earth />
    <CameraController />
  </Canvas>
);

export default GlobeVisualization;
