import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

function main() {
  const canvas = document.querySelector('#threejs');
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

  const near = 0.1;
  const far = 100;
  const size = 10;
  const camera = new THREE.OrthographicCamera(-size, size, size, -size, near, far);
  camera.position.set(0, 10, 20);

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 5, 0);
  controls.update();

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('black');

  const geom = new THREE.CylinderGeometry(1, 1, 3, 16);
  const base = new THREE.Object3D();

  scene.add(base);
  const grid_base = new THREE.GridHelper(30, 30);
  grid_base.renderOrder = 0;
  scene.add(grid_base);

  const mat_base = new THREE.MeshPhongMaterial({ color: '#888' });
  const mesh_base = new THREE.Mesh(geom, mat_base);
  mesh_base.scale.set(1.2, 0.4, 1);
  base.add(mesh_base);

  const matPalm = new THREE.MeshPhongMaterial({ color: '#888' });
  const palm = new THREE.Mesh(geom, matPalm);
  palm.scale.set(2.6, 1.6, 1.8);
  palm.position.y = 3;
  base.add(palm);
  palm.renderOrder = 1;

  const fingerMaterial = new THREE.MeshPhongMaterial({ color: '#888' });

  function createFinger(positionX, positionY, positionZ, jointHeight, jointRadius, isThumb) {
    const fingerGroup = new THREE.Group();

    const joint1 = new THREE.Mesh(geom, fingerMaterial);
    joint1.position.set(positionX, positionY, positionZ);
    joint1.scale.set(jointRadius / 1.7, jointHeight * 1, jointRadius * 1.1);
    fingerGroup.add(joint1);

    const joint2 = new THREE.Mesh(geom, fingerMaterial);
    joint2.position.set(0, 2.5, 0);
    joint2.scale.set(1, 0.8, 1);
    joint1.add(joint2);

    const joint3 = new THREE.Mesh(geom, fingerMaterial);
    joint3.position.set(0, 3, 0);
    joint3.scale.set(1, 1, 1);
    joint2.add(joint3);

    if (isThumb) {
      return { fingerGroup, joint1, joint2 };
    }
    return { fingerGroup, joint1, joint2, joint3 };
  }

  const fingerPositions = [
    {
      x: -1.2,
      y: 0.4,
      z: 0,
      jointHeight: 0.22,
      jointRadius: 0.38,
      isThumb: true,
      rotation: { x: 0, y: 0, z: Math.PI / 12 },
    }, // 엄지 (비스듬하게)
    { x: -0.75, y: 2.1, z: 0, jointHeight: 0.4, jointRadius: 0.33 }, // 검지
    { x: -0.25, y: 2.1, z: 0, jointHeight: 0.5, jointRadius: 0.33 }, // 중지
    { x: 0.25, y: 1.95, z: 0, jointHeight: 0.4, jointRadius: 0.33 }, // 약지
    { x: 0.75, y: 1.95, z: 0, jointHeight: 0.3, jointRadius: 0.33 }, // 새끼
  ];

  const fingers = fingerPositions.map((pos) => {
    const finger = createFinger(pos.x, pos.y, pos.z, pos.jointHeight, pos.jointRadius, pos.isThumb);
    if (pos.rotation) {
      finger.fingerGroup.rotation.set(pos.rotation.x, pos.rotation.y, pos.rotation.z);
    }
    return finger;
  });

  console.log(fingers);
  fingers.forEach((finger) => palm.add(finger.fingerGroup));

  base.position.y = mesh_base.scale.y;

  {
    const color = 0xffffff;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(0, 10, 0);
    light.target.position.set(-5, 0, 0);
    scene.add(light);
    scene.add(light.target);
  }
  {
    const color = 0xffffff;
    const intensity = 0.1;
    const light = new THREE.AmbientLight(color, intensity);
    scene.add(light);
  }

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }

    return needResize;
  }

  function render() {
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

  let sliders = [
    { id: 'slider-thumb-joint1', joint: fingers[0].joint2, orientation: 'vertical', min: 0, max: 45, value: 0 },
    { id: 'slider-thumb-joint2', joint: fingers[0].joint1, orientation: 'vertical', min: 0, max: 45, value: 0 },
    { id: 'slider-index-joint1', joint: fingers[1].joint3, orientation: 'vertical', min: 0, max: 45, value: 0 },
    { id: 'slider-index-joint2', joint: fingers[1].joint2, orientation: 'vertical', min: 0, max: 45, value: 0 },
    { id: 'slider-index-joint3', joint: fingers[1].joint1, orientation: 'vertical', min: 0, max: 45, value: 0 },
    { id: 'slider-middle-joint1', joint: fingers[2].joint3, orientation: 'vertical', min: 0, max: 45, value: 0 },
    { id: 'slider-middle-joint2', joint: fingers[2].joint2, orientation: 'vertical', min: 0, max: 45, value: 0 },
    { id: 'slider-middle-joint3', joint: fingers[2].joint1, orientation: 'vertical', min: 0, max: 45, value: 0 },
    { id: 'slider-ring-joint1', joint: fingers[3].joint3, orientation: 'vertical', min: 0, max: 45, value: 0 },
    { id: 'slider-ring-joint2', joint: fingers[3].joint2, orientation: 'vertical', min: 0, max: 45, value: 0 },
    { id: 'slider-ring-joint3', joint: fingers[3].joint1, orientation: 'vertical', min: 0, max: 45, value: 0 },
    { id: 'slider-small-joint1', joint: fingers[4].joint3, orientation: 'vertical', min: 0, max: 45, value: 0 },
    { id: 'slider-small-joint2', joint: fingers[4].joint2, orientation: 'vertical', min: 0, max: 45, value: 0 },
    { id: 'slider-small-joint3', joint: fingers[4].joint1, orientation: 'vertical', min: 0, max: 45, value: 0 },
    { id: 'slider-wrist-bend', joint: palm, orientation: 'vertical', min: -45, max: 45, value: 0 },
    { id: 'slider-fingers', joint: palm, orientation: 'horizontal', min: 0, max: 10, value: 0 },
    { id: 'slider-wrist-twist', joint: palm, orientation: 'horizontal', min: 0, max: 360, value: 0 },
  ];

  function onChange(event) {
    let id = event.target.id;
    let sliderValue = $('#' + id).slider('value');
    let sliderObject = sliders.find((slider) => slider.id === id);

    if (id == 'slider-wrist-twist') {
      base.rotation.y = THREE.MathUtils.degToRad(sliderValue);
    }
    if (id === 'slider-fingers') {
      const baseOffset = THREE.MathUtils.degToRad(sliderValue);
      const fingerOffsets = [baseOffset * 1, baseOffset * 0.6, baseOffset * 0.2, baseOffset * -0.6, baseOffset * -0.9];

      fingers.forEach((finger, index) => {
        if (index === 0) {
          finger.fingerGroup.rotation.z = fingerOffsets[index] * 0.6;
          finger.fingerGroup.position.x = fingerOffsets[index] * 0.8;
          finger.fingerGroup.position.y = -Math.abs(fingerOffsets[index]) * 0.5;
        } else {
          finger.fingerGroup.rotation.z = fingerOffsets[index];
          finger.fingerGroup.position.x = fingerOffsets[index];
        }
      });
    }
    if (id === 'slider-wrist-bend') {
      sliderObject.joint.rotation.x = -THREE.MathUtils.degToRad(sliderValue) / 1.2;
      sliderObject.joint.position.z = -THREE.MathUtils.degToRad(sliderValue) / 1.2;
    }
    if (id.includes('joint1')) {
      sliderObject.joint.rotation.x = THREE.MathUtils.degToRad(sliderValue * 0.7);
      sliderObject.joint.position.z = THREE.MathUtils.degToRad(sliderValue * 0.7);
    }
    if (id.includes('joint2')) {
      sliderObject.joint.rotation.x = THREE.MathUtils.degToRad(sliderValue * 0.65);
      sliderObject.joint.position.z = THREE.MathUtils.degToRad(sliderValue * 0.65);
    }
    if (id.includes('joint3')) {
      sliderObject.joint.rotation.x = THREE.MathUtils.degToRad(sliderValue) / 1.3;
      sliderObject.joint.position.z = THREE.MathUtils.degToRad(sliderValue) / 1.3;
    }

    document.querySelector('#log').innerHTML = '' + id + ': ' + $('#' + id).slider('value');
  }

  for (let slider of sliders) {
    $('#' + slider.id).slider({
      orientation: slider.orientation,
      range: 'min',
      min: slider.min,
      max: slider.max,
      value: slider.value,
      slide: onChange,
    });
  }
}

main();
