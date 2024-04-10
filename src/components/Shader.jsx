import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import axios from "axios";

const Scene = ({ vertex, fragment }) => {
  const meshRef = useRef();

  // Load the noise texture and update the shader uniform
  const noiseTexture = useTexture("noise2.png");
  useFrame((state) => {
    let time = state.clock.getElapsedTime();

    // start from 20 to skip first 20 seconds ( optional )
    meshRef.current.material.uniforms.iTime.value = time + 20;
  });

  // Define the shader uniforms with memoization to optimize performance
  const uniforms = useMemo(
    () => ({
      iTime: {
        type: "f",
        value: 1.0,
      },
      iResolution: {
        type: "v2",
        value: new THREE.Vector2(4, 3),
      },
      iChannel0: {
        type: "t",
        value: noiseTexture,
      },
    }),
    []
  );

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[4, 3]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertex}
        fragmentShader={fragment}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

function Shader() {
  // State variables to store the vertex and fragment shaders as strings
  const [vertex, setVertex] = useState("");
  const [fragment, setFragment] = useState("");

  // Fetch the shaders once the component mounts
  useEffect(() => {
    // fetch the vertex and fragment shaders from public folder
    axios.get("/vertexShader.glsl").then((res) => setVertex(res.data));
    axios.get("/fragmentShader.glsl").then((res) => setFragment(res.data));
  }, []);

  // If the shaders are not loaded yet, return null (nothing will be rendered)
  if (vertex == "" || fragment == "") return null;
  return (
    <Canvas style={{ width: "100vw", height: "100vh" }}>
      <Scene vertex={vertex} fragment={fragment} />
    </Canvas>
  );
}

export default Shader;
