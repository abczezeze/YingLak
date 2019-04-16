Physijs.scripts.worker = "./js/lib/physijs_worker.js";
Physijs.scripts.ammo = "ammo.js";
var camera, scene, dlight, renderer, effcutout
var NumberMulti = 180
var clock = new THREE.Clock()
var goalkeeperModel, goalkeeperContainer, goalkeeperMixer, goalkeeperAction, goalkeeperActionHaha, goalkeeperActionSad, goalkeeperActionBuzz
//raycast
var mouseCoords = new THREE.Vector2()
var raycaster = new THREE.Raycaster()
//ball
var ballz, ballzMaterial, ballzTexture, ballzTexture_nm
var ballzNum = 1
var pos = new THREE.Vector3();
var quat = new THREE.Quaternion();
//sound
var loaderYinglak, soundYinglak, listenerYinglak = new THREE.AudioListener()
var loaderKickball, soundKickball, listenerKickball = new THREE.AudioListener()
var loaderGoalkeeper, soundGoalkeeper, listenerGoalkeeper = new THREE.AudioListener()
var loaderYeee, soundGoalYeee, listenerYeee = new THREE.AudioListener()
var loaderOhno, soundOhno, listenerOhno = new THREE.AudioListener()
//wall
var wallBack
// gui var
var params = {
  multiplyScalar: 180,
  enabled: false,
  wireframe: false, 
  visible: false,
  transparent: false,
  sound: false
  };
//goal door class
var GoalDoor = new GoalDoor();
//loadingScreen
var loadingScreen = {
	scene: new THREE.Scene(),
	camera: new THREE.PerspectiveCamera(90, window.innerWidth/window.innerHeight, 0.1, 100),
  box: new THREE.Mesh( new THREE.TorusGeometry( 1.8,.2,16,32 ), new THREE.MeshPhongMaterial({ color:0x0000dd })),
  box2: new THREE.Mesh( new THREE.TorusGeometry( 1.2,.2,16,32 ), new THREE.MeshPhongMaterial({ color:0x000044 })),
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
      foo.innerHTML = "Loading: "+perload.toFixed(2)+"%<br>Total: "+total;
      if(loaded == total) foo.remove();
      // console.log('Loading file: '+item+'.\nLoaded: '+loaded+' of ' +total+' files.');
    };

    

  dlight = new THREE.DirectionalLight( 0xffffff, 1 )
  dlight.position.set( -10, 10, 15 )
  dlight.castShadow = true
  let dl = 100
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
    goalkeeperModel.scale.set(5,5,5)
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
    ballz = new Physijs.SphereMesh(new THREE.SphereGeometry(1,32,32), ballzMaterial, 20 )
    ballz.name = ballzNum
    ballz.receiveShadow = true
    ballz.castShadow = true
    ballz.position.set(THREE.Math.randFloat(-10,10),2,THREE.Math.randFloat(30,40))
 
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

    //doorContianer
    GoalDoor.mesh.position.z = 6
    doorContianer = new Physijs.BoxMesh(
      new THREE.CubeGeometry( 29, 25, 13 ),
      new THREE.MeshBasicMaterial({color:0xff0000, visible: false, wireframe: true}),
      0
    );
    doorContianer.position.z = -5;
    doorContianer.name = 'doorContianer'
    doorContianer.add(GoalDoor.mesh)
    scene.add(doorContianer)

    //edge door
    doorCompoundTop = new Physijs.BoxMesh(
      new THREE.CubeGeometry( 30, 1, 12 ),
      new THREE.MeshBasicMaterial({visible: false, wireframe: true}),
      0
    );
    doorCompoundTop.position.set(0,14,-5.5)

    doorCompoundRingt = new Physijs.BoxMesh(
      new THREE.CubeGeometry( 2, 14, 12 ),
      new THREE.MeshBasicMaterial({visible: false, wireframe: true}),
      0
    );
    doorCompoundRingt.position.set(15,-6,0)
    doorCompoundTop.add(doorCompoundRingt)
        
    doorCompoundLeft = new Physijs.BoxMesh(
      new THREE.CubeGeometry( 2, 14, 12 ),
      new THREE.MeshBasicMaterial({visible: false, wireframe: true}),
      0
    );
    doorCompoundLeft.position.set(-15,-6,0)
    doorCompoundTop.add(doorCompoundLeft)
    
    // doorCompoundBack = new Physijs.BoxMesh(
    //   new THREE.CubeGeometry( 31, 25, 2 ),
    //   new THREE.MeshBasicMaterial({visible: false, wireframe: true}),
    //   0
    // );
    // doorCompoundBack.position.y = -6
    // doorCompoundBack.position.z = -5
    // doorCompoundTop.add(doorCompoundBack)
    doorCompoundTop.name = 'EdgeDoor'
    scene.add(doorCompoundTop)

    

    //wall
    var wallTexture = new THREE.TextureLoader(loadingManager).load('Textures/Yinglak_bg.png')
    wallTexture.wrapS = THREE.RepeatWrapping;
    wallTexture.wrapT = THREE.RepeatWrapping;
    wallTexture.repeat.set( 100, 100 );
    // var walTexture_nm = new THREE.TextureLoader(loadingManager).load('Textures/Yinglak_bg_normal.png')
    // wallBack = new THREE.Mesh(new THREE.CubeGeometry( 350, 80, 2 ),
    wallBack = new Physijs.BoxMesh(new THREE.CubeGeometry( 350, 80, 2 ),
                                  // new THREE.MeshBasicMaterial({ color:0xb8265a, opacity:0.7, map:wallTexture, normalMap:walTexture_nm}))
                                  new THREE.MeshBasicMaterial({ color:Math.random()*0xffffff, opacity:0.7, map:wallTexture}),0)
                                  // new THREE.MeshBasicMaterial({ color:0x055334, transparent:true, opacity:0.4})
    // console.log(wallBack.material);
    wallBack.material.mapping = 100                                      
    wallBack.position.z = -42
    wallBack.position.y = 30
    wallBack.name = 'wallBack'
    // console.log(wallBack);
    
    scene.add(wallBack)

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
      new THREE.BoxGeometry( 500, 0.3, 500 ),
      floorMaterial,
      0 //mass
    );
    floor.receiveShadow = true;
    floor.position.set(0,0,0);
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

  window.addEventListener('resize',onWindowResize,false)

  loadingManager.onLoad = function(){
    // console.log("loaded all resources");
    RESOURCES_LOADED = true;
    // foo.remove();
    goalkeeperHtml = document.createElement("div")
    goalkeeperHtml.style.position = 'absolute'
    goalkeeperHtml.style.bottom = '60px'
    goalkeeperHtml.style.textAlign = 'left'
    goalkeeperHtml.style.color = '#1aff3c'
    goalkeeperHtml.innerHTML = 'Goalkeeper: 0'
    goalkeeperHtml.style.textShadow = '0 0 4px #000'
    document.body.appendChild(goalkeeperHtml);
    goalDoorHtml = document.createElement("div")
    goalDoorHtml.style.position = 'absolute'
    goalDoorHtml.style.bottom = '80px'
    goalDoorHtml.style.textAlign = 'left'
    goalDoorHtml.style.color = '#eaf02a'
    goalDoorHtml.innerHTML = 'GoalDoor: 0'
    goalDoorHtml.style.textShadow = '0 0 4px #000'
    document.body.appendChild(goalDoorHtml);
  
  //GUI
    var gui = new dat.GUI();
    //console.log(gui);
    var g;
    g = gui.addFolder('multiplyScalar');
      g.add(params,'multiplyScalar',10,200).step(0.01).onChange(function(value){
        NumberMulti = value
        pos.multiplyScalar( value );
      });
    g = gui.addFolder('Controls');
      g.add(params,'enabled').onChange(function(value){
        controls.enabled = value;
      });
    g = gui.addFolder('Container');
      g.add(params,'visible').onChange(function(value){
        goalkeeperContainer.material.visible = value;
        doorContianer.material.visible = value;
        doorCompoundTop.material.visible = value;
        doorCompoundLeft.material.visible = value;
        doorCompoundRingt.material.visible = value;
      });
      g = gui.addFolder('Soune');
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
    gui.close()
  };
}


function handleCollision( collided_with ) {
  if(collided_with.name === 'goalkeeperContainer'){
    console.log("goalkeeperContainer",goalkeeperContainerCount++);
    soundGoalkeeper.play()
    goalkeeperAction.stop()
    goalkeeperActionHaha.stop()
    goalkeeperActionSad.stop()
    goalkeeperActionBuzz.play()
      
    // scene.remove(ballz)
  
    // ballz = new Physijs.SphereMesh(new THREE.SphereGeometry(1,32,32), ballzMaterial, 20 )
    // ballz.receiveShadow = true;
    // ballz.castShadow = true
    // ballz.name = ballzNum++
    // ballz.position.set(THREE.Math.randFloat(-10,10),2,THREE.Math.randFloat(30,40));
    // scene.add(ballz)
  }
  if(collided_with.name === 'wallBack' || collided_with.name === 'EdgeDoor'){
    soundOhno.play()
    goalkeeperAction.stop()
    goalkeeperActionHaha.play()
    goalkeeperActionSad.stop()
    goalkeeperActionBuzz.stop()

    // scene.remove(ballz)
  
    // ballz = new Physijs.SphereMesh(new THREE.SphereGeometry(1,32,32), ballzMaterial, 20 )
    // ballz.receiveShadow = true;
    // ballz.castShadow = true
    // ballz.name = ballzNum++
    // ballz.position.set(THREE.Math.randFloat(-10,10),2,THREE.Math.randFloat(30,40));
    // scene.add(ballz)
  }
  
    if(collided_with.name === 'floor' || collided_with.name === 'wallBack'){
    //   goalkeeperAction.play()
    //   goalkeeperActionHaha.stop()
    //   goalkeeperActionSad.stop()
    //   goalkeeperActionBuzz.stop()

    scene.remove(ballz)
  
    ballz = new Physijs.SphereMesh(new THREE.SphereGeometry(1,32,32), ballzMaterial, 20 )
    ballz.receiveShadow = true;
    ballz.castShadow = true
    ballz.name = ballzNum++
    ballz.position.set(THREE.Math.randFloat(-10,10),2,THREE.Math.randFloat(30,40));
    scene.add(ballz)

    }
    
  if(collided_with.name === 'doorContianer'){
    console.log('doorContianer',doorContianerCount++);
    soundGoalYeee.play()
    goalkeeperActionSad.play()
    goalkeeperAction.stop()
    goalkeeperActionHaha.stop()
    goalkeeperActionBuzz.stop()

    // setTimeout(()=>{
      // scene.remove(ballz)
    //   ,3000
    // })
    
    // ballz = new Physijs.SphereMesh(new THREE.SphereGeometry(1,32,32), ballzMaterial, 20 )
    // ballz.receiveShadow = true;
    // ballz.castShadow = true
    // ballz.name = ballzNum++
    // ballz.position.set(THREE.Math.randFloat(-10,10),2,THREE.Math.randFloat(30,40));
    // scene.add(ballz)
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
  // event.preventDefault()
  // event.clientX = event.touches[0].clientX
  // event.clientY = event.touches[0].clientY
  // mouseCoords.x = +(event.targetTouches[0].pageX / window.innerWidth) * 2 +-1;
  // mouseCoords.y = -(event.targetTouches[0].pageY / window.innerHeight) * 2 + 1;
  if(event.touches) {
    // playerX = e.touches[0].pageX - canvas.offsetLeft - playerWidth / 2;
    // playerY = e.touches[0].pageY - canvas.offsetTop - playerHeight / 2;
    // output.innerHTML = "Touch: "+ " x: " + playerX + ", y: " + playerY;
    console.log('Touch',event.touches[0].pageX,event.touches[0].pageY);
    
    event.preventDefault();
  }
  onMouseDown( event )
}
function onTouchEnd( event ) {
  event.preventDefault()
  // mouseCoords.x = event.changedTouches[0].clientX
  // mouseCoords.y = event.changedTouches[0].clientY
  // event.clientX = +(event.touches[0].clientX/window.innerWidth)*2-1
  // event.clientY = -(event.touches[0].clientY/window.innerHeight)*2+1
  // mouseCoords.x = (event.touches[0].clientX/window.innerWidth)*2-1
  // mouseCoords.y = -(event.touches[0].clientY/window.innerHeight)*2+1
  // raycaster.setFromCamera(mouseCoords,camera)
  // onMouseDown( event )
}
function onMouseDown(event){
  event.preventDefault()
  mouseCoords.x = (event.clientX/window.innerWidth)*2-1
  mouseCoords.y = -(event.clientY/window.innerHeight)*2+1

  raycaster.setFromCamera(mouseCoords,camera)
  // var intersects = raycaster.intersectObjects(scene.children)
  // Intersects = raycaster.intersectObjects(networkObject)

  ballz.position.copy(raycaster.ray.direction);
  ballz.position.add(raycaster.ray.origin);
  pos.copy( raycaster.ray.direction );
  pos.multiplyScalar( NumberMulti );
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
}
function onMouseUp( event ) {
  
}
function onMouseMove( event ) {
  // console.log(event.clientX,event.clientY);
  
}


function animate(){
    // This block runs while resources are loading.
  if( RESOURCES_LOADED == false ){
  // if( RESOURCES_LOADED == true ){
    requestAnimationFrame(animate);
    // loadingScreen.box.position.x -= 0.05;
    loadingScreen.box.rotation.x -= 0.01;
    loadingScreen.box.rotation.y -= 0.01;
    loadingScreen.box2.rotation.x += 0.01;
    loadingScreen.box2.rotation.y += 0.01;
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

}
