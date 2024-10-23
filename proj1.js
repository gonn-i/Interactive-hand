import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

// Three.js 라이브러리와 필요한 컨트롤, GUI 모듈을 가져옴
// Three.js는 웹에서 3D 그래픽을 생성하기 위한 라이브러리
// OrbitControls는 카메라를 마우스 드래그로 회전시키는 기능을 제공, GUI는 UI를 통해 설정을 조정할 수 있는 툴

function main() {
  const canvas = document.querySelector('#threejs');
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

  // WebGLRenderer를 초기화 (캔버스에 3D 씬을 그림 + 안티앨리어싱을 활성화하여 모서리가 부드럽게 렌더링)
  // OrthographicCamera는 원근감 없이 장면을 렌더링하는 카메라
  //  고정된 크기의 3D 오브젝트들을 정확하게 보여줄 줌, 카메라의 위치를 (0, 10, 20)으로 설정합니다.
  const near = 0.1;
  const far = 100;
  const size = 10;
  const camera = new THREE.OrthographicCamera(-size, size, size, -size, near, far);
  camera.position.set(0, 10, 20);

  // OrbitControls를 사용해 카메라가 회전할 수 있도록 설정
  // 타겟을 (0, 5, 0)으로 설정하여 카메라가 항상 해당 지점을 바라보도록 함

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 5, 0);
  controls.update();

  // Three.js 씬(Scene)을 생성하고 배경색을 검은색으로 설정합니다.
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('black');

  // 기본 실린더 생성
  const geom = new THREE.CylinderGeometry(1, 1, 2, 16); // 위 반지름, 아래 반지름, 높이, 세그먼트

  const base = new THREE.Object3D();
  scene.add(base);
  const grid_base = new THREE.GridHelper(30, 30);
  grid_base.renderOrder = 0;
  scene.add(grid_base);

  // 손바닥을 위한 큰 원통 생성
  const geomPalm = new THREE.CylinderGeometry(2, 2, 4.5, 16); // 손목 부분 실린더

  // Object3D 객체를 생성하여 씬에 추가
  // 30x30 그리드 헬퍼(=GridHelper)를 추가하여 기준선을 제공

  const mat_base = new THREE.MeshPhongMaterial({ color: '#888' });
  const mesh_base = new THREE.Mesh(geom, mat_base);
  mesh_base.scale.set(1, 0.5, 1);
  base.add(mesh_base);

  const matPalm = new THREE.MeshPhongMaterial({ color: '#888' });
  const palm = new THREE.Mesh(geomPalm, matPalm);
  palm.scale.set(1.5, 1, 0.8);
  palm.position.y = 2.5;
  base.add(palm);

  // 손가락 생성
  const fingerMaterial = new THREE.MeshPhongMaterial({ color: '#888' });

  function createFinger(positionX, positionY, positionZ, jointHeight, jointRadius, isThumb) {
    const fingerGroup = new THREE.Group();

    // 첫 번째 관절 (가장 아래 부분)
    const geomJoint1 = new THREE.CylinderGeometry(jointRadius, jointRadius, jointHeight, 16);
    const joint1 = new THREE.Mesh(geomJoint1, fingerMaterial);
    joint1.position.set(positionX, positionY, positionZ); // 손바닥 위에 위치
    joint1.scale.set(1, 1, 2);
    fingerGroup.add(joint1);

    // 두 번째 관절
    const geomJoint2 = new THREE.CylinderGeometry(jointRadius, jointRadius, jointHeight, 16);
    const joint2 = new THREE.Mesh(geomJoint2, fingerMaterial);
    joint2.position.set(0, jointHeight, 0); // 첫 번째 관절의 위에 위치
    joint2.scale.set(1, 1, 1);
    joint1.add(joint2);

    // 세 번째 관절 (가장 위 부분)
    const geomJoint3 = new THREE.CylinderGeometry(jointRadius, jointRadius, jointHeight, 16);
    const joint3 = new THREE.Mesh(geomJoint3, fingerMaterial);
    joint3.position.set(0, jointHeight, 0); // 두 번째 관절의 위에 위치
    joint3.scale.set(1, 1, 1);
    joint2.add(joint3);

    if (isThumb) {
      return { fingerGroup, joint1, joint2 };
    }
    return { fingerGroup, joint1, joint2, joint3 };
  }

  // 손가락 5개 생성
  const fingerPositions = [
    {
      x: -2.2,
      y: 0.3,
      z: 0,
      jointHeight: 1,
      jointRadius: 0.4,
      isThumb: true,
      rotation: { x: 0, y: 0, z: Math.PI / 8 },
    }, // 엄지 (비스듬하게)
    { x: -1.5, y: 3, z: 0, jointHeight: 2.1, jointRadius: 0.4 }, // 검지
    { x: -0.5, y: 3, z: 0, jointHeight: 2.3, jointRadius: 0.4 }, // 중지
    { x: 0.5, y: 3, z: 0, jointHeight: 2, jointRadius: 0.4 }, // 약지
    { x: 1.5, y: 3, z: 0, jointHeight: 1.6, jointRadius: 0.4 }, // 새끼
  ];

  const fingers = fingerPositions.map((pos) => {
    const finger = createFinger(pos.x, pos.y, pos.z, pos.jointHeight, pos.jointRadius, pos.isThumb);
    if (pos.rotation) {
      finger.fingerGroup.rotation.set(pos.rotation.x, pos.rotation.y, pos.rotation.z);
    }
    return finger;
  });

  fingers.forEach((finger) => palm.add(finger.fingerGroup));

  // 베이스의 위치 Y축의 위치를 실린더 높이로 설정
  base.position.y = mesh_base.scale.y;

  // 슬라이더 이벤트 핸들러
  // 슬라이더의 값이 변경될 때 해당 값 로그
  function onChange(event, ui) {
    let id = event.target.id;

    document.querySelector('#log').innerHTML = '' + id + ': ' + $('#' + id).slider('value');
  }

  // DirectionalLight와 AmbientLight를 생성
  // DirectionalLight는 특정 방향으로 강하게 비추는 빛 & AmbientLight는 장면 전체를 부드럽게 비추는 빛
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

  // 캔버스의 크기변경시, 렌더러의 크기를 동적 조정

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

  // 매 프레임마다 씬을 렌더링 함수, 화면 크기가 변경시 카메라 비율도 업데이트,`requestAnimationFrame`을 사용해 부드러운 애니메이션

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

  // 슬라이더를 정의:  각 슬라이더는 손의 관절 또는 손목의 움직임을 제어
  // 각 슬라이더는 min/max 을 할당 + 슬라이더를 조작할 때마다 이벤트가 발생하여 슬라이더 값을 기록
  let sliders = [
    { id: 'slider-thumb-joint1', orientation: 'vertical', min: 0, max: 45, value: 0 },
    { id: 'slider-thumb-joint2', orientation: 'vertical', min: 0, max: 45, value: 0 },
    { id: 'slider-index-joint1', orientation: 'vertical', min: 0, max: 45, value: 0 },
    { id: 'slider-index-joint2', orientation: 'vertical', min: 0, max: 45, value: 0 },
    { id: 'slider-index-joint3', orientation: 'vertical', min: 0, max: 45, value: 0 },
    { id: 'slider-middle-joint1', orientation: 'vertical', min: 0, max: 45, value: 0 },
    { id: 'slider-middle-joint2', orientation: 'vertical', min: 0, max: 45, value: 0 },
    { id: 'slider-middle-joint3', orientation: 'vertical', min: 0, max: 45, value: 0 },
    { id: 'slider-ring-joint1', orientation: 'vertical', min: 0, max: 45, value: 0 },
    { id: 'slider-ring-joint2', orientation: 'vertical', min: 0, max: 45, value: 0 },
    { id: 'slider-ring-joint3', orientation: 'vertical', min: 0, max: 45, value: 0 },
    { id: 'slider-small-joint1', orientation: 'vertical', min: 0, max: 45, value: 0 },
    { id: 'slider-small-joint2', orientation: 'vertical', min: 0, max: 45, value: 0 },
    { id: 'slider-small-joint3', orientation: 'vertical', min: 0, max: 45, value: 0 },
    { id: 'slider-wrist-bend', orientation: 'vertical', min: -45, max: 45, value: 0 },
    { id: 'slider-fingers', orientation: 'horizontal', min: 0, max: 10, value: 0 },
    { id: 'slider-wrist-twist', orientation: 'horizontal', min: 0, max: 360, value: 0 },
  ];

  //슬라이더의 방향, 범위, 초기 값 설정하고, 슬라이더가 조작시 onChange 함수가 호출되어 값이 업데이트
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
