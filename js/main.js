Physijs.scripts.worker = "./js/lib/physijs_worker.js";
Physijs.scripts.ammo = "ammo.js";
var camera, scene, dlight, renderer, effcutout
var numPower = 180, powerBarNum = 100
var clock = new THREE.Clock()
var goalkeeperModel, goalkeeperContainer, goalkeeperMixer, goalkeeperAction, goalkeeperActionHaha, goalkeeperActionSad, goalkeeperActionBuzz
//raycast
var mouseCoords = new THREE.Vector2()
var raycaster = new THREE.Raycaster()
//arrowHelper
var arrowHelper
//ball
var ballz, ballzMaterial, ballzTexture, ballzTexture_nm
var ballzNum = 1, ballzStart = true
var pos = new THREE.Vector3();
var quat = new THREE.Quaternion();
//sound
var loaderYinglak, soundYinglak, listenerYinglak = new THREE.AudioListener()
var loaderKickball, soundKickball, listenerKickball = new THREE.AudioListener()
var loaderGoalkeeper, soundGoalkeeper, listenerGoalkeeper = new THREE.AudioListener()
var loaderYeee, soundGoalYeee, listenerYeee = new THREE.AudioListener()
var loaderOhno, soundOhno, listenerOhno = new THREE.AudioListener()
//wall
var wallBack, wallSpace, wallSpaceBT
//html
var how2
//goal door class
var GoalDoor = new GoalDoor();
//loadingScreen
var loadingScreen = {
	scene: new THREE.Scene(),
	camera: new THREE.PerspectiveCamera(90, window.innerWidth/window.innerHeight, 0.1, 100),
  box: new THREE.Mesh( new THREE.TorusGeometry( 1.8,.2,16,32 ), new THREE.MeshPhongMaterial({ color:0x0000dd })),
  box2: new THREE.Mesh( new THREE.CircleGeometry( 1.7,32 ), new THREE.MeshPhongMaterial({ color:0x000044, wireframe:true })),
  directionalLight: new THREE.DirectionalLight( 0xffffff, 0.5 )
};
var loadingManager = null;
var RESOURCES_LOADED = false;
var itemload, itemtotal;
var loadpage=0;
var goalkeeperContainerCount = 0, doorContianerCount = 0
// - Main code -
init()
animate()
// - Functions -
function init() {
  container = document.createElement('div')
  document.body.appendChild(container)
  scene = new Physijs.Scene;
  scene.setGravity(new THREE.Vector3( 0, -10, 0 ));
  // scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0099ff)
  // scene.add(new THREE.AmbientLight(0x505050))
  camera = new THREE.PerspectiveCamera(70,window.innerWidth/window.innerHeight,1,1000)
  camera.position.set(0,10,50)

    // loadingScreen Set up the loading screen's scene.
    loadingScreen.box.position.set(0,0,5);
    loadingScreen.box2.position.set(0,0,5);
    loadingScreen.camera.lookAt(loadingScreen.box.position);
    loadingScreen.scene.add(loadingScreen.box);
    loadingScreen.scene.add(loadingScreen.box2);
    loadingScreen.scene.add(loadingScreen.directionalLight);
    loadingScreen.scene.background = new THREE.Color(0x050555);

    // Create a loading manager to set RESOURCES_LOADED when appropriate.
    // Pass loadingManager to all resource loaders.
    loadingManager = new THREE.LoadingManager();
    loadingManager.onProgress = function(item, loaded, total){
      //console.log(item, loaded, total);
      perload = loaded/total*100
      foo = document.getElementById('foo');
      foo.innerHTML = "Loading: "+perload.toFixed(2)+"%<br>Total: "+total+"<br>By...ABC3Dz";
      if(loaded == total) foo.remove();
      // console.log('Loading file: '+item+'.\nLoaded: '+loaded+' of ' +total+' files.');
    };



  dlight = new THREE.DirectionalLight( 0xffffff, 1 )
  dlight.position.set( -10, 10, 15 )
  dlight.castShadow = true
  let dl = 300
  dlight.shadow.camera.left = -dl
  dlight.shadow.camera.right = dl
  dlight.shadow.camera.top = dl
  dlight.shadow.camera.bottom = -dl
  dlight.shadow.camera.near = 2
  dlight.shadow.camera.far = 1000
  dlight.shadow.mapSize.x = 1024
  dlight.shadow.mapSize.y = 1024
  scene.add(dlight)
  // model
  var loaderModel = new THREE.GLTFLoader(loadingManager)
  loaderModel.load( './Models/goalkeeper/scene.gltf', (object) => {
    var animations = object.animations;
    goalkeeperModel = object.scene
    // console.log(goalkeeperModel);
    goalkeeperModel.scale.set(6,6,6)
    goalkeeperModel.position.y = -4

    goalkeeperModel.traverse((node) => {
      if(node instanceof THREE.Mesh){
        node.castShadow = true
        node.resiveShadow = true
        // console.log(node);
        }
      })
      goalkeeperMixer = new THREE.AnimationMixer( goalkeeperModel );
      goalkeeperAction = goalkeeperMixer.clipAction(animations[0])/*.setDuration(10);*/
      goalkeeperActionHaha = goalkeeperMixer.clipAction(animations[1])/*.setDuration(10);*/
      goalkeeperActionSad = goalkeeperMixer.clipAction(animations[2])/*.setDuration(10);*/
      goalkeeperActionBuzz = goalkeeperMixer.clipAction(animations[3])/*.setDuration(10);*/
      // action.setLoop( THREE.LoopOnce );
      goalkeeperAction.play();
      scene.add( goalkeeperModel );
      //goalkeeperContainer
      goalkeeperContainer = new Physijs.BoxMesh(
        new THREE.CubeGeometry( 5, 8, 1 ),
        new THREE.MeshBasicMaterial({visible: false, wireframe: true}),
        500
      );
      goalkeeperContainer.position.y = 3;
      goalkeeperContainer.position.z = 3;
      goalkeeperContainer.name = 'goalkeeperContainer'
      goalkeeperContainer.add(goalkeeperModel)

      goalkeeperContainer.add(listenerGoalkeeper)
      loaderGoalkeeper = new THREE.AudioLoader(loadingManager);
      soundGoalkeeper = new THREE.Audio( listenerGoalkeeper );
      loaderGoalkeeper.load( 'Sound/buzz.ogg', function( buffer ) {
        soundGoalkeeper.setBuffer( buffer );
        soundGoalkeeper.setLoop( false );
        soundGoalkeeper.setVolume( 1 );
      });

      scene.add( goalkeeperContainer )
    });
    //ballz
    ballzTexture = new THREE.TextureLoader(loadingManager).load('Textures/ballTexture.png')
    ballzTexture_nm = new THREE.TextureLoader(loadingManager).load('Textures/ballTexture_normal.png')
    ballzMaterial = Physijs.createMaterial(new THREE.MeshPhongMaterial({ color:0xffffff, map:ballzTexture, normalMap:ballzTexture_nm}))
    ballz = new Physijs.SphereMesh(new THREE.SphereGeometry(1,32,32), ballzMaterial, 200 )
    ballz.name = ballzNum
    ballz.receiveShadow = true
    ballz.castShadow = true
    ballz.position.set(0,2,31)

    ballz.add(listenerKickball)
    loaderKickball = new THREE.AudioLoader(loadingManager);
    soundKickball = new THREE.Audio( listenerKickball );
    loaderKickball.load( 'Sound/kickball.ogg', function( buffer ) {
      soundKickball.setBuffer( buffer );
      soundKickball.setLoop( false );
      soundKickball.setVolume( 1 );
    });
    ballz.add(listenerYeee)
    loaderYeee = new THREE.AudioLoader(loadingManager);
    soundGoalYeee = new THREE.Audio( listenerYeee );
    loaderYeee.load( 'Sound/Yeee.ogg', function( buffer ) {
      soundGoalYeee.setBuffer( buffer );
      soundGoalYeee.setLoop( false );
      soundGoalYeee.setVolume( 1 );
    });
    ballz.add(listenerOhno)
    loaderOhno = new THREE.AudioLoader(loadingManager);
    soundOhno = new THREE.Audio( listenerOhno );
    loaderOhno.load( 'Sound/ohno.ogg', function( buffer ) {
      soundOhno.setBuffer( buffer );
      soundOhno.setLoop( false );
      soundOhno.setVolume( 1 );
    });

    scene.add( ballz )
    //Arrow
    var dir = new THREE.Vector3( 0,1,-5 );
    //normalize the direction vector (convert to vector of length 1)
    dir.normalize();
    var origin = new THREE.Vector3(0,ballz.position.y-1,ballz.position.z);
    var length = 5;
    var hex = 0x550000;
    arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex );
    scene.add( arrowHelper );
    
    //doorContianer
    GoalDoor.mesh.position.z = 6
    doorContianer = new Physijs.BoxMesh(
      new THREE.CubeGeometry( 29, 29, 5 ),
      new THREE.MeshBasicMaterial({color:0xff0000, visible:false, transparent:true, opacity:.5}),
      0
    );
    doorContianer.position.z = -7;
    doorContianer.name = 'doorContianer'
    doorContianer.add(GoalDoor.mesh)

    doorContianerTop = new Physijs.BoxMesh(
      new THREE.CubeGeometry( 30, 1, 10 ),
      new THREE.MeshBasicMaterial({color:0xff0000, visible:false, transparent:true, opacity:.5}),
      0
    );
    doorContianerTop.position.set(0,13,0)
    doorContianer.add(doorContianerTop)

    doorContianerRingt = new Physijs.BoxMesh(
      new THREE.CubeGeometry( 2, 14, 10 ),
      new THREE.MeshBasicMaterial({color:0xff0000, visible:false, transparent:true, opacity:.5}),
      0
    );
    doorContianerRingt.position.set(14,5,0)
    doorContianer.add(doorContianerRingt)

    doorContianerLeft = new Physijs.BoxMesh(
      new THREE.CubeGeometry( 2, 14, 10 ),
      new THREE.MeshBasicMaterial({color:0xff0000, visible:false, transparent:true, opacity:.5}),
      0
    );
    doorContianerLeft.position.set(-14,5,0)
    doorContianer.add(doorContianerLeft)

    scene.add(doorContianer)

    //edge door
    doorCompoundTop = new Physijs.BoxMesh(
      new THREE.CubeGeometry( 30, 1, 12 ),
      new THREE.MeshBasicMaterial({visible:false, wireframe:true}),
      0
    );
    doorCompoundTop.position.set(0,14.5,-5.5)

    doorCompoundRingt = new Physijs.BoxMesh(
      new THREE.CubeGeometry( 2, 14, 12 ),
      new THREE.MeshBasicMaterial({visible:false, wireframe:true}),
      0
    );
    doorCompoundRingt.position.set(15.5,-7,-1)
    doorCompoundTop.add(doorCompoundRingt)

    doorCompoundLeft = new Physijs.BoxMesh(
      new THREE.CubeGeometry( 2, 14, 12 ),
      new THREE.MeshBasicMaterial({visible:false, wireframe:true}),
      0
    );
    doorCompoundLeft.position.set(-15.5,-7,-1)
    doorCompoundTop.add(doorCompoundLeft)
    doorCompoundTop.name = 'EdgeDoor'
    scene.add(doorCompoundTop)

    //wall
    var wallTexture = new THREE.TextureLoader(loadingManager).load('Textures/Yinglak_bg.png')
    // wallTexture.wrapS = THREE.RepeatWrapping;
    // wallTexture.wrapT = THREE.RepeatWrapping;
    // wallTexture.repeat.set( 100, 40 );
    // var walTexture_nm = new THREE.TextureLoader(loadingManager).load('Textures/Yinglak_bg_normal.png')
    // wallBack = new THREE.Mesh(new THREE.CubeGeometry( 350, 80, 2 ),
    for(let i=1;i<=10;i++){
      wallBack = new Physijs.BoxMesh(new THREE.CubeGeometry( 400, 20*i, 15 ),
            // new THREE.MeshBasicMaterial({ color:0xb8265a, opacity:0.7, map:wallTexture, normalMap:walTexture_nm}))
            new THREE.MeshPhysicalMaterial({ color:0x440000, map:wallTexture}),0)
            // new THREE.MeshBasicMaterial({ color:0x055334, transparent:true, opacity:0.4})
      // console.log(wallBack.material);
      wallBack.position.z = -42 - i*15
      wallBack.position.y = 5
      wallBack.receiveShadow = true
      wallBack.castShadow = true
      wallBack.name = 'wallBack'
      scene.add(wallBack)
    }
      //audienc
      // for(let i=1;i<=15;i++){
      //   audiencCylinderYL1 = new Physijs.CylinderMesh(
      //     new THREE.CylinderGeometry( 3, 5, 16, 16 ),
      //     new THREE.MeshStandardMaterial({ color:Math.random()*0xffffff}),
      //     1000
      //   );
      //   audiencCylinderYL1.position.set(i*15-120,33 ,-71 )
      //   audiencCylinderYL1.receiveShadow = true
      //   audiencCylinderYL1.castShadow = true
      //   scene.add(audiencCylinderYL1)

      //   audiencCylinderYL2 = new Physijs.CylinderMesh(
      //     new THREE.CylinderGeometry( 5, 3, 16, 16 ),
      //     new THREE.MeshStandardMaterial({ color:Math.random()*0xffffff}),
      //     1000
      //   );
      //   audiencCylinderYL2.position.set(i*15-110,45 ,-83 )
      //   audiencCylinderYL2.receiveShadow = true
      //   audiencCylinderYL2.castShadow = true
      //   scene.add(audiencCylinderYL2)

      //   audiencCylinderYL3 = new Physijs.CylinderMesh(
      //     new THREE.CylinderGeometry( 3, 5, 16, 16 ),
      //     new THREE.MeshStandardMaterial({ color:Math.random()*0xffffff}),
      //     1000
      //   );
      //   audiencCylinderYL3.position.set(i*15-120,56 ,-100 )
      //   audiencCylinderYL3.receiveShadow = true
      //   audiencCylinderYL3.castShadow = true
      //   scene.add(audiencCylinderYL3)

      //   audiencCylinderYL4 = new Physijs.CylinderMesh(
      //     new THREE.CylinderGeometry( 5, 3, 16, 16 ),
      //     new THREE.MeshStandardMaterial({ color:Math.random()*0xffffff}),
      //     1000
      //   );
      //   audiencCylinderYL4.position.set(i*15-110,67 ,-112 )
      //   audiencCylinderYL4.receiveShadow = true
      //   audiencCylinderYL4.castShadow = true
      //   scene.add(audiencCylinderYL4)
      // }

    //wall space
    wallSpace = new Physijs.BoxMesh(new THREE.CubeGeometry( 100, 80, 2 ),
                new THREE.MeshBasicMaterial({ color:0x00ffff, wireframe:true, visible:false}),0)
    wallSpace.position.set(0,10,45)
    wallSpaceL = new Physijs.BoxMesh(new THREE.CubeGeometry( 2, 80, 100 ),
                new THREE.MeshBasicMaterial({ color:0x00ffff, wireframe:true, visible:false}),0)
    wallSpaceL.position.set(42,0,-35)
    wallSpace.add(wallSpaceL)
    wallSpaceR = new Physijs.BoxMesh(new THREE.CubeGeometry( 2, 80, 100 ),
                new THREE.MeshBasicMaterial({ color:0x00ffff, wireframe:true, visible:false}),0)
    wallSpaceR.position.set(-42,0,-35)
    wallSpace.add(wallSpaceR)
    wallSpaceT = new Physijs.BoxMesh(new THREE.CubeGeometry( 100, 2, 100 ),
                new THREE.MeshBasicMaterial({ color:0x00ffff, wireframe:true, visible:false}),0)
    wallSpaceT.position.set(0,40,-35)
    wallSpace.add(wallSpaceT)
    wallSpace.name = 'wallSpace'
    scene.add(wallSpace)

    //wallSpaceBT
    wallSpaceBT = new Physijs.BoxMesh(new THREE.CubeGeometry( 400, 2, 170 ),
                new THREE.MeshBasicMaterial({ color:0x00ffff, wireframe:true, visible:false}),0)
    wallSpaceBT.position.set(0,80,-100)
    wallSpaceBTL = new Physijs.BoxMesh(new THREE.CubeGeometry( 4, 172, 170 ),
                new THREE.MeshBasicMaterial({ color:0x00ffff, wireframe:true, visible:false}),0)
    wallSpaceBTL.position.set(120,0,20)
    wallSpaceBT.add(wallSpaceBTL)
    wallSpaceBTR = new Physijs.BoxMesh(new THREE.CubeGeometry( 4, 172, 170 ),
                new THREE.MeshBasicMaterial({ color:0x00ffff, wireframe:true, visible:false}),0)
    wallSpaceBTR.position.set(-120,0,20)
    wallSpaceBT.add(wallSpaceBTR)
    wallSpaceBT.name = 'wallSpace'
    scene.add(wallSpaceBT)

    //groundphysic
    var grassTexture = new THREE.TextureLoader(loadingManager).load('Textures/GrassGreenTexture_brusheezy.jpg')
    // var grassTexture_nm = new THREE.TextureLoader(loadingManager).load('Textures/GrassGreenTexture_brusheezy_normal.jpg')
    var friction = 1; // high friction
    var restitution = 0.3; // low restitution
    var floorMaterial = Physijs.createMaterial(
      // new THREE.MeshPhongMaterial({ color:0xffffff, map:grassTexture, normalMap:grassTexture_nm}),
      new THREE.MeshPhongMaterial({ color:0xffffff, map:grassTexture}),
        friction,
        restitution
      );
      floorMaterial.map.wrapS = floorMaterial.map.wrapT = floorMaterial.RepeatWrapping;
      floorMaterial.map.repeat.set( 30,30 );
    floor = new Physijs.BoxMesh(
      new THREE.BoxGeometry( 500, 80, 500 ),
      floorMaterial,
      0 //mass
    );
    floor.receiveShadow = true;
    floor.position.set(0,-41,0);
    floor.name = 'floor'
    floor.add( listenerYinglak );
    soundYinglak = new THREE.Audio( listenerYinglak );
    loaderYinglak = new THREE.AudioLoader(loadingManager);
    loaderYinglak.load( 'Sound/Yinglak.mp3', function( buffer ) {
      soundYinglak.setBuffer( buffer );
      soundYinglak.setLoop( true );
      soundYinglak.setVolume( 0.3 );
      // soundYinglak.play();
    });
    // console.log(soundYinglak);

    var soundsub = new THREE.Audio( listenerYinglak );
    loaderYinglak.load( 'Sound/YingLakSub.ogg', function( buffer ) {
      soundsub.setBuffer( buffer );
      soundsub.setLoop( true );
      soundsub.setVolume( 0.5 );
      // soundsub.play();
    });
    scene.add( floor );

  renderer = new THREE.WebGLRenderer({antialias:true})
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth,window.innerHeight)
  renderer.gammaOutput = true
  renderer.shadowMap.enabled = true
  renderer.shadowMap.speng = THREE.PCFShadowMap
  container.appendChild(renderer.domElement)
  controls = new THREE.OrbitControls(camera)
  controls.enabled = false
  // effcutout = new THREE.OutlineEffect(renderer)

  document.addEventListener( 'mousedown', onMouseDown, false );
  document.addEventListener( 'mouseup', onMouseUp, false);
  document.addEventListener( 'mousemove', onMouseMove, false);

  document.addEventListener('touchstart',onTouchStart,false)
  document.addEventListener('touchend',onMouseUp,false)
  document.addEventListener('touchmove',onTouchMove,false)

  window.addEventListener('resize',onWindowResize,false)
  window.addEventListener( 'keydown', ( event ) => {
    switch ( event.keyCode ) {
      case 90: //Z
        goalkeeperContainer.material.visible = !goalkeeperContainer.material.visible
        doorContianer.material.visible = !doorContianer.material.visible
        doorContianerTop.material.visible = !doorContianerTop.material.visible
        doorContianerRingt.material.visible = !doorContianerRingt.material.visible
        doorContianerLeft.material.visible = !doorContianerLeft.material.visible
        doorCompoundTop.material.visible = !doorCompoundTop.material.visible
        doorCompoundLeft.material.visible = !doorCompoundLeft.material.visible
        doorCompoundRingt.material.visible = !doorCompoundRingt.material.visible
        wallSpace.material.visible = !wallSpace.material.visible
        wallSpaceL.material.visible = !wallSpaceL.material.visible
        wallSpaceR.material.visible = !wallSpaceR.material.visible
        wallSpaceT.material.visible = !wallSpaceT.material.visible
        wallSpaceBT.material.visible = !wallSpaceBT.material.visible
        wallSpaceBTL.material.visible = !wallSpaceBTL.material.visible
        wallSpaceBTR.material.visible = !wallSpaceBTR.material.visible
      break;
      case 88://X
        controls.enabled = !controls.enabled
      break
      case 82://R
        ballzStart = true
        scene.remove(ballz)
        ballz = new Physijs.SphereMesh(new THREE.SphereGeometry(1,32,32), ballzMaterial, 20 )
        ballz.receiveShadow = true;
        ballz.castShadow = true
        ballz.name = ballzNum++
        ballz.position.set(THREE.Math.randFloat(-10,10),2,THREE.Math.randFloat(30,35));
        scene.add(ballz)
      break
    }
  });
  console.log("Press Z: Visible collision box");
  console.log("Press X: Control camera");
  console.log("Press R: Reset ballz");

  loadingManager.onLoad = function(){
    // console.log("loaded all resources");
    RESOURCES_LOADED = true;
    // foo.remove();
    goalkeeperHtml = document.createElement("div")
    goalkeeperHtml.style.position = 'absolute'
    goalkeeperHtml.style.bottom = '60px'
    goalkeeperHtml.style.textAlign = 'left'
    goalkeeperHtml.style.color = '#1aff3c'
    goalkeeperHtml.style.fontSize = '30px'
    goalkeeperHtml.innerHTML = 'Goalkeeper: 0'
    goalkeeperHtml.style.textShadow = '0 0 2px #fff'
    document.body.appendChild(goalkeeperHtml);
    goalDoorHtml = document.createElement("div")
    goalDoorHtml.style.position = 'absolute'
    goalDoorHtml.style.bottom = '100px'
    goalDoorHtml.style.fontSize = '30px'
    goalDoorHtml.style.textAlign = 'left'
    goalDoorHtml.style.color = '#eaf02a'
    goalDoorHtml.innerHTML = 'GoalDoor: 0'
    goalDoorHtml.style.textShadow = '0 0 2px #fff'
    document.body.appendChild(goalDoorHtml);
    //power bar
    let grad1 = document.createElement("div");
    grad1.style.position = 'absolute'
    grad1.style.bottom = '200px'
    grad1.style.width = '20px'
    grad1.style.height = '200px'
    grad1.style.border = '4px solid gray'
    grad1.style.transform = 'rotate(180deg)'
    powerBar = document.createElement("div");
    powerBar.style.width = "20px";
    powerBar.style.background = "#101010";
    powerBar.style.height = powerBarNum+"px";
    grad1.appendChild(powerBar);
    document.body.appendChild(grad1)
    powerText = document.createElement("div");
    powerText.style.position = 'absolute'
    powerText.style.bottom = '180px'
    powerText.style.color = '#101010'
    powerText.innerHTML = 'Power'
    powerText.style.textShadow = '0 0 2px #222222'
    document.body.appendChild(powerText);
    //how2
    how2 = document.createElement("div")
    how2.style.position = 'absolute'
    how2.style.bottom = '150px'
    how2.style.width = '100%'
    how2.style.fontSize = '30px'
    how2.style.textAlign = 'center'
    how2.style.color = '#5566af'
    how2.innerHTML = 'Click or Touch<br>eveywhere for shooting'
    how2.style.textShadow = '0 0 2px #fff'
    document.body.appendChild(how2);
    

    // gui var
    var params = {
      power: 180,
      enabled: false,
      wireframe: false,
      visible: false,
      transparent: false,
      sound: false,
      reset: ()=>{
        ballzStart = true
        scene.remove(ballz)
        ballz = new Physijs.SphereMesh(new THREE.SphereGeometry(1,32,32), ballzMaterial, 20 )
        ballz.receiveShadow = true;
        ballz.castShadow = true
        ballz.name = ballzNum++
        ballz.position.set(THREE.Math.randFloat(-10,10),2,THREE.Math.randFloat(30,35));
        scene.add(ballz)
      }
   };

  //GUI
    var gui = new dat.GUI();
    var g;
    // console.log(gui);
    // g = gui.addFolder('shoot power');
    //   g.add(params,'power',10,200).step(0.01).onChange(function(value){
    //     numPower = value
    //   });
    g = gui.addFolder('Controls');
      g.add(params,'enabled').onChange(function(value){
        controls.enabled = value;
      });
    g = gui.addFolder('Container');
      g.add(params,'visible').onChange(function(value){
        goalkeeperContainer.material.visible = value;
        doorContianer.material.visible = value;
        doorContianerTop.material.visible = value;
        doorContianerRingt.material.visible = value;
        doorContianerLeft.material.visible = value;
        doorCompoundTop.material.visible = value;
        doorCompoundLeft.material.visible = value;
        doorCompoundRingt.material.visible = value;
        wallSpace.material.visible = value;
        wallSpaceL.material.visible = value;
        wallSpaceR.material.visible = value;
        wallSpaceT.material.visible = value;
        wallSpaceBT.material.visible = value;
        wallSpaceBTL.material.visible = value;
        wallSpaceBTR.material.visible = value;
      });
      g = gui.addFolder('Sound');
      g.add(params,'sound').onChange(function(value){
        if (value){
          soundYinglak.play()
          soundsub.play();
        }
        else {
          soundYinglak.pause()
          soundsub.play();
        }
      });
      g = gui.addFolder('Wall');
      g.add(params,'transparent').onChange(function(value){
        wallBack.material.transparent = value;
      });
      g = gui.addFolder('Reset ballz');
      g.add(params,'reset')
    gui.close()
    gui.width = 200
  };
  setTimeout(()=>{
    how2.remove()
  },4000)
}


function handleCollision( collided_with ) {
  console.log(collided_with.name);

  if(collided_with.name === 'goalkeeperContainer'){
    console.log("goalkeeperContainer",goalkeeperContainerCount++);
    soundGoalkeeper.play()
    goalkeeperAction.stop()
    goalkeeperActionHaha.stop()
    goalkeeperActionSad.stop()
    goalkeeperActionBuzz.play()

  }
  if(collided_with.name === 'wallBack' || collided_with.name === 'EdgeDoor'){
    soundOhno.play()
    goalkeeperAction.stop()
    goalkeeperActionHaha.play()
    goalkeeperActionSad.stop()
    goalkeeperActionBuzz.stop()

  }

    if(collided_with.name === 'floor' || collided_with.name === 'wallBack' || collided_with.name === 'wallSpace'){
    ballzStart = true
    scene.remove(ballz)

    ballz = new Physijs.SphereMesh(new THREE.SphereGeometry(1,32,32), ballzMaterial, 20 )
    ballz.receiveShadow = true;
    ballz.castShadow = true
    ballz.name = ballzNum++
    ballz.position.set(THREE.Math.randFloat(-10,10),2,THREE.Math.randFloat(30,35));
    scene.add(ballz)
    arrowHelper.position.set(ballz.position.x,0,ballz.position.z-1 )
    }

  if(collided_with.name === 'doorContianer'){
    console.log('doorContianer',doorContianerCount++);
    soundGoalYeee.play()
    goalkeeperActionSad.play()
    goalkeeperAction.stop()
    goalkeeperActionHaha.stop()
    goalkeeperActionBuzz.stop()

    }
  }

function onWindowResize() {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function onTouchStart( event ) {
  event.preventDefault();
  event.clientX = event.touches[0].clientX;
	event.clientY = event.touches[0].clientY;
  if(event.touches) {
    // playerX = e.touches[0].pageX - canvas.offsetLeft - playerWidth / 2;
    // playerY = e.touches[0].pageY - canvas.offsetTop - playerHeight / 2;
    // output.innerHTML = "Touch: "+ " x: " + playerX + ", y: " + playerY;
    console.log('Touch',event.touches[0].pageX,event.touches[0].pageY);
  }
  onMouseDown( event )
}
function onTouchEnd( event ) {

}
function onMouseDown(event){
  // console.log("mouse down");
  if(ballzStart){
    event.preventDefault()
    mouseCoords.x = (event.clientX/window.innerWidth)*2-1
    mouseCoords.y = -(event.clientY/window.innerHeight)*2+1

    raycaster.setFromCamera(mouseCoords,camera)
    // var intersects = raycaster.intersectObjects(scene.children)
    // Intersects = raycaster.intersectObjects(networkObject)
    //bug PowerBarNum=0
    if(powerBarNum===0){
      numPower = powerBarNum+1
    }else{
      numPower = powerBarNum
    }
    console.log('power',powerBarNum);

    ballz.position.copy(raycaster.ray.direction);
    ballz.position.add(raycaster.ray.origin);
    pos.copy( raycaster.ray.direction );
    pos.multiplyScalar( numPower );
    ballz.setLinearVelocity( new THREE.Vector3( pos.x, pos.y, pos.z ) );
    soundKickball.play()
    ballz.addEventListener( 'collision', handleCollision );

    
    // goalkeeperContainer.addEventListener( 'ready', spawnBox );

    goalkeeperContainer.position.set(THREE.Math.randInt(-10,10),THREE.Math.randFloat(2,9),2)
    // goalkeeperContainer.setCcdMotionThreshold(.3)
    goalkeeperContainer.__dirtyPosition = true
    goalkeeperContainer.rotation.set(Math.PI*2, 0, 0)
    goalkeeperContainer.__dirtyRotation = true
    // goalkeeperContainer.setLinearVelocity(new THREE.Vector3(0, 0, 0));
    // goalkeeperContainer.setAngularVelocity(new THREE.Vector3(0, 0, 0));
    ballzStart = false
  }
}
function onMouseUp( event ) {
  
}
function onMouseMove( event ) {
  event.preventDefault();
	mouseCoords.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouseCoords.y = - (event.clientY / window.innerHeight) * 2 + 1;
  
  var vector = new THREE.Vector3(mouseCoords.x, mouseCoords.y/2, -mouseCoords.y);
  arrowHelper.setDirection(vector)
 
  console.log(arrowHelper);
  
}
function onTouchMove( event ) {
  event.preventDefault();
  event.clientX = event.touches[0].clientX;
  event.clientY = event.touches[0].clientY;
  onDocumentMouseMove( event );
}


function animate(){
    // This block runs while resources are loading.
  if( RESOURCES_LOADED == false ){
  // if( RESOURCES_LOADED == true ){
    requestAnimationFrame(animate);
    // loadingScreen.box.position.x -= 0.05;
    loadingScreen.box.rotation.z -= 0.01;
    // loadingScreen.box.rotation.y -= 0.01;
    loadingScreen.box2.rotation.z += 0.01;
    // loadingScreen.box2.rotation.y += 0.01;
    // effcutout.render(loadingScreen.scene, loadingScreen.camera);
    renderer.render(loadingScreen.scene, loadingScreen.camera);
    return; // Stop the function here.
  }
  requestAnimationFrame(animate)

  render()
}

function render(){
  var delta = clock.getDelta();
  goalkeeperMixer.update(delta);

  // goalkeeperContainer.position.x = 10;
  // goalkeeperContainer.__dirtyPosition = true;
  goalkeeperContainer.setLinearVelocity(new THREE.Vector3(0, -5, 0));
  // goalkeeperContainer.setAngularVelocity(new THREE.Vector3(2, 3, 5));

  scene.simulate(); // run physics

  // effcutout.render(scene, camera)
  renderer.render(scene, camera)
  goalkeeperHtml.innerHTML = 'Goalkeeper: '+goalkeeperContainerCount
  goalDoorHtml.innerHTML = 'GoalDoor: '+doorContianerCount
  powerBarNum+=Math.random()*7
  if(powerBarNum>=200){
    powerBarNum = 0
    powerBar.style.height = powerBarNum+"px";
  }else{
    powerBar.style.height = powerBarNum+"px";
  }

}
