import * as THREE from "three";

import * as CANNON from "cannon-es";

import React, { useState , useEffect, useRef} from 'react'
import Result from "./Result";
let stack = [];
let camera, scene, renderer;
const originalBoxSize = 3;
let overhangs = [];
let world;
const boxHeight = 1;


const Scripts = () => {
const [score, setScore] = useState(1);
// const gameEnded = useRef(false);
const [gameEnded, setGameEnded] = useState(false);
// let gameEnded;
// const score = useRef(2);


const init = () =>{
  console.log("INIT");
  // ---------------WORLD-------------------
  world = new CANNON.World();
  world.gravity.set(0,-10,0);
  world.broadphase = new CANNON.NaiveBroadphase();
  world.solver.iterations = 40;
  
  
  
  
  // ---------------SCENE-------------------
  scene = new THREE.Scene();
  
  
  //FOUNDATION
  addLayer(0,0,originalBoxSize,originalBoxSize);
  
  //FIRST LAYER  
  addLayer(-10,0,originalBoxSize,originalBoxSize,"x");
  
  // ---------------BOX-------------------
  // const boxGeometry = new THREE.BoxGeometry(3, 1, 3);
  // const boxMaterial = new THREE.MeshLambertMaterial({ color: 0xfb8e00 });
  // const box = new THREE.Mesh(boxGeometry, boxMaterial);
  // scene.add(box);
  // box.position.set(0, 0, 0);
  
  
  // ---------------LIGHT-------------------
  const ambientLight = new THREE.AmbientLight(0xffffff,0.6);
  scene.add(ambientLight);
  
  const directionLight = new THREE.DirectionalLight(0xffffff, 0.6);
  scene.add(directionLight);
  directionLight.position.set(10, 20, 0);
  
  // ---------------CAMERA-------------------
  
  // camera = new THREE.PerspectiveCamera(
  //   45, // field of view
  //   aspect, // aspect ratio
  //   1, // near plane
  //   100 // far plane
  // );
  
  
  
  const width = 10;
  const height = width + (window.innerHeight / window.innerWidth)
  camera = new THREE.OrthographicCamera(
    width / -2,
    width / 2,
    height / 2,
    height / -2,
    1,
    100
  );
  // const orbit = new OrbitControls(camera,renderer.domElement);
  camera.position.set(4, 4, 4);
  camera.lookAt(0,0,0);
  // orbit.update();
  
  
  // ---------------RENDER-------------------
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.shadowMap.enabled = true;
  renderer.setSize(window.innerWidth, window.innerHeight);
  // renderer.setClearColor(0xF2F1FF, 1);
  
  renderer.render(scene, camera);
  document.body.appendChild(renderer.domElement);
  
  // startGame();
  }
 
  useEffect(() => {
    
    init();
  
window.addEventListener("click", game);
 
  window.addEventListener("touchstart", game);
  
  console.log(world);
  }, [])
  


const addLayer = (x, z, width,depth, direction ) => {
  
  // console.log("ADD");
  const y = boxHeight + stack.length;

  const layer = generateBox(x,y,z, width, depth, false);
  layer.direction = direction;

  stack.push(layer);
}


const addOverhang = (x,z, width, depth) => {
  // console.log("Overhang");
  const y = boxHeight + (stack.length -1);
  const overhang = generateBox(x,y,z, width, depth, true);
  overhangs.push(overhang);
}

const generateBox = (x,y,z,width, depth, falls) =>{
  // console.log("generateBox");
  const geometry = new THREE.BoxGeometry(width, boxHeight, depth);
  const color = new THREE.Color(`hsl(${30 + stack.length * 4}, 100%, 50%)`);
  const material = new THREE.MeshLambertMaterial({ color });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  scene.add(mesh);

  const shape = new CANNON.Box(
    new CANNON.Vec3(width / 2, boxHeight / 2, depth / 2)
  );
  let mass = falls ? 5 : 0; // If it shouldn't fall then setting the mass to zero will keep it stationary
  mass *= width / originalBoxSize; // Reduce mass proportionately by size
  mass *= depth / originalBoxSize; // Reduce mass proportionately by size
  const body = new CANNON.Body({ mass, shape });
  body.position.set(x, y, z);
  world.addBody(body);

  return {
    threejs: mesh,
    cannonjs : body,
    width,
    depth
  };
}

const cutBox = (topLayer, overLap, size, delta) => {
  // console.log("cutBox");
  const direction = topLayer.direction;
  const newWidth = direction === "x" ? overLap : topLayer.width;
  const newDepth = direction === "z" ? overLap : topLayer.depth;

  // Update metadata
  topLayer.width = newWidth;
  topLayer.depth = newDepth;

  // Update ThreeJS model
  topLayer.threejs.scale[direction] = overLap / size;
  topLayer.threejs.position[direction] -= delta / 2;

  // Update CannonJS model
  topLayer.cannonjs.position[direction] -= delta / 2;

  // Replace shape to a smaller one (in CannonJS you can't simply just scale a shape)
  const shape = new CANNON.Box(
    new CANNON.Vec3(newWidth / 2, boxHeight / 2, newDepth / 2)
  );
  topLayer.cannonjs.shapes = [];
  topLayer.cannonjs.addShape(shape);
}



const missedTheSpot = () =>{
  // console.log("missedTheSpot");
  const topLayer = stack[stack.length - 1];

    
  // Turn to top layer into an overhang and let it fall down
  addOverhang(
    topLayer.threejs.position.x,
    topLayer.threejs.position.z,
    topLayer.width,
    topLayer.depth
  );
  world.removeBody(topLayer.cannonjs);
  scene.remove(topLayer.threejs);
    // console.log(world);
    gameStart = false;
    renderer.setAnimationLoop(null);
    
  setGameEnded(true);
  renderer.setAnimationLoop(animation);
    // gameEnded = true;
    // gameEnded.current = true;
}


const startGame = () => {
  
  stack = [];
  overhangs = [];

  if (world) {
    // Remove every object from world
    while (world.bodies.length > 0) {
      world.removeBody(world.bodies[0]);
    }
  }

  if (scene) {
    // Remove every Mesh from the scene
    while (scene.children.find((c) => c.type == "Mesh")) {
      const mesh = scene.children.find((c) => c.type == "Mesh");
      scene.remove(mesh);
    }

    // Foundation
    addLayer(0, 0, originalBoxSize, originalBoxSize);

    // First layer
    addLayer(-10, 0, originalBoxSize, originalBoxSize, "x");
  }

  if (camera) {
    // Reset camera positions
    camera.position.set(4, 4, 4);
    camera.lookAt(0, 0, 0);
  }
}

let gameStart = false;



const game = () =>{
  // console.log("GAME");
  // console.log(`world: ${world.bodies.length}`);

  
  // console.log(scene);
  // console.log(`scene: ${scene.children.length}`);
  if(!gameStart){
    renderer.setAnimationLoop(animation);
    gameStart = true;
    
  console.log(world);
  }
  else{
    console.log(world);
    // score.current++;
    const topLayer = stack[stack.length - 1];
    const previousLayer = stack[stack.length - 2];
    const direction = topLayer.direction;
  
    const size = direction === "x" ? topLayer.width : topLayer.depth;

    
    const delta =
      topLayer.threejs.position[direction] -
      previousLayer.threejs.position[direction];

    const overhangSize = Math.abs(delta);
    const overlap = size - overhangSize;
    console.log( overlap);
     if (overlap > 0) {
      setScore(prev => prev + 1);
      console.log("FFFFFFFFFFFFFFf")
    cutBox(topLayer, overlap, size, delta);

    // Overhang
        const overhangShift = (overlap / 2 + overhangSize / 2) * Math.sign(delta);
        const overhangX =
          direction === "x"
            ? topLayer.threejs.position.x + overhangShift
            : topLayer.threejs.position.x;
        const overhangZ =
          direction === "z"
            ? topLayer.threejs.position.z + overhangShift
            : topLayer.threejs.position.z;
        const overhangWidth = direction === "x" ? overhangSize : topLayer.width;
        const overhangDepth = direction === "z" ? overhangSize : topLayer.depth;

        addOverhang(overhangX, overhangZ, overhangWidth, overhangDepth);

        // Next layer
        const nextX = direction === "x" ? topLayer.threejs.position.x : -10;
        const nextZ = direction === "z" ? topLayer.threejs.position.z : -10;
        const newWidth = topLayer.width; // New layer has the same size as the cut top layer
        const newDepth = topLayer.depth; // New layer has the same size as the cut top layer
        const nextDirection = direction === "x" ? "z" : "x";

        addLayer(nextX, nextZ, newWidth, newDepth,nextDirection);
    }
    else{
      missedTheSpot();
    }
  }
}


function animation(time) {
  let speed = 0.10;

  
  //  console.log(world);
  //  console.log(gameEnded);
  
  // console.log(speed)
  // console.log(world);
  if(!gameEnded){
    // console.log(world);
    const topLayer = stack[stack.length -1];
    topLayer.threejs.position[topLayer.direction] += speed;
    topLayer.cannonjs.position[topLayer.direction] += speed;
  
   if(camera.position.y < boxHeight + (stack.length -2) + 4){
     camera.position.y += speed;
  }

  if (topLayer.threejs.position[topLayer.direction] > 10) {
    missedTheSpot();
  }
}

  updatePhysic();
  world.step(1/ 60);
  renderer.render(scene, camera);
}



window.addEventListener("touchmove", function (e) {
});

window.addEventListener("touchend", function (e) {
});









const updatePhysic = () => {
  // console.log(world)
  

  overhangs.forEach((element) => {
    element.threejs.position.copy(element.cannonjs.position);
    element.threejs.quaternion.copy(element.cannonjs.quaternion);
  })
}


window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

  return (
    <>
    <div className="score">{score}</div>
    {gameEnded && <Result score={score} setScore={setScore} startGame={startGame} gameEnded={gameEnded} setGameEnded={setGameEnded}/>}
    </>
  )
}
export default Scripts