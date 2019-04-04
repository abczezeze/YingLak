Physijs.scripts.worker = "./js/physijs_worker.js";
Physijs.scripts.ammo = "ammo.js";
var camera, scene, dlight, renderer, effcutout

var clock = new THREE.Clock()
var goalkeeperModel, goalkeeperContainer, goalkeeperMixer, goalkeeperAction, goalkeeperConMixer
//raycast
var mouseCoords = new THREE.Vector2()
var raycaster = new THREE.Raycaster()
//ball
var ballMaterial = new THREE.MeshPhongMaterial( { color: 0x202020 } );
var pos = new THREE.Vector3();
var quat = new THREE.Quaternion();

//loadingScreen
var loadingScreen = {
	scene: new THREE.Scene(),
	camera: new THREE.PerspectiveCamera(90, window.innerWidth/window.innerHeight, 0.1, 100),
  box: new THREE.Mesh( new THREE.BoxGeometry( 1,1,1 ), new THREE.MeshPhongMaterial({ color:0x0000dd })),
  directionalLight: new THREE.DirectionalLight( 0xffffff, 0.5 )
};
var loadingManager = null;
var RESOURCES_LOADED = false;
var itemload, itemtotal;
var loadpage=0;

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

    loadingScreen// Set up the loading screen's scene.
    loadingScreen.box.position.set(0,0,5);
    loadingScreen.camera.lookAt(loadingScreen.box.position);
    loadingScreen.scene.add(loadingScreen.box);
    loadingScreen.scene.add(loadingScreen.directionalLight);
    loadingScreen.scene.background = new THREE.Color(0x050555);

    // Create a loading manager to set RESOURCES_LOADED when appropriate.
    // Pass loadingManager to all resource loaders.
    loadingManager = new THREE.LoadingManager();
    loadingManager.onProgress = function(item, loaded, total){
      //console.log(item, loaded, total);
      perload = loaded/total*100
      foo = document.getElementById('foo');
      foo.style.position = 'absolute';
      foo.style.top = '100px';
      foo.style.textAlign = 'center';
      foo.style.width = '100%'
      foo.style.color = '#0099ff';
      foo.style.fontSize = '20px';
      // foo.innerHTML = "Loading: "+perload.toFixed(2)+"%<br>Item: "+item+"<br>Total: "+total;
      foo.innerHTML = "Loading: "+perload.toFixed(2)+"%<br>Total: "+total;
      if(loaded == total) foo.remove();
      // console.log('Loading file: '+item+'.\nLoaded: '+loaded+' of ' +total+' files.');
    };

    loadingManager.onLoad = function(){
      // console.log("loaded all resources");
      RESOURCES_LOADED = true;
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
  loaderModel.load( './Models/goalkeeper_gltf/scene.gltf', (object) => {
    var animations = object.animations;
    goalkeeperModel = object.scene
    // console.log(goalkeeperModel);
    goalkeeperModel.scale.set(5,5,5)
    goalkeeperModel.position.y = -4
    goalkeeperModel.traverse((node) => {
      if(node instanceof THREE.Mesh){
        node.castShadow = true
        node.resiveShadow = true
        console.log(node);        
        }
      })
      goalkeeperMixer = new THREE.AnimationMixer( goalkeeperModel );
      goalkeeperAction = goalkeeperMixer.clipAction(animations[2])/*.setDuration(10);*/
      goalkeeperAction.play();
      scene.add( goalkeeperModel );
      //goalkeeperContainer
      goalkeeperContainer = new Physijs.BoxMesh(
        new THREE.CubeGeometry( 5, 8, 1 ),
        // new THREE.MeshPhongMaterial({ transparent: true, opacity: 0.0 })
        // Uncomment the next line to see the wireframe of the container shape
        new THREE.MeshBasicMaterial({ wireframe: true }) 
      );
      goalkeeperContainer.position.y = 10;

      var positionKF = new THREE.VectorKeyframeTrack( '.position', [ 0, 1, 2 ], [ 0, 0, 0, 30, 0, 0, 0, 0, 0 ] );
      var xAxis = new THREE.Vector3( 0, 0, 0 );
			var qInitial = new THREE.Quaternion().setFromAxisAngle( xAxis, 0 );
			var qFinal = new THREE.Quaternion().setFromAxisAngle( xAxis, Math.PI );
  		var quaternionKF = new THREE.QuaternionKeyframeTrack( '.quaternion', [ 0, 1, 2 ], [ qInitial.x, qInitial.y, qInitial.z, qInitial.w, qFinal.x, qFinal.y, qFinal.z, qFinal.w, qInitial.x, qInitial.y, qInitial.z, qInitial.w ] );
      var goalkeeperclip = new THREE.AnimationClip( 'Action', 3, [ quaternionKF, positionKF] );
      goalkeeperConMixer = new THREE.AnimationMixer( goalkeeperContainer );
      var goalkeeperConAction = goalkeeperConMixer.clipAction( goalkeeperclip );
			goalkeeperConAction.play();

      goalkeeperContainer.add(goalkeeperModel)
      scene.add( goalkeeperContainer ); 	
    });
    //groundphysic
    // var loaderTexture = new THREE.ImageLoader( loadingManager );
    var grassTexture = new THREE.TextureLoader(loadingManager).load('Textures/GrassGreenTexture_brusheezy.jpg')
    var grassTexture_nm = new THREE.TextureLoader(loadingManager).load('Textures/GrassGreenTexture_brusheezy_normal.jpg')
      
    var friction = 1; // high friction
    var restitution = 0.3; // low restitution

    var floorMaterial = Physijs.createMaterial(
      new THREE.MeshPhongMaterial({ color:0xffffff, map:grassTexture, normalMap:grassTexture_nm}), 
        friction,
        restitution
      );
    floor = new Physijs.BoxMesh(
      new THREE.BoxGeometry( 100, 0.1, 100 ),
      floorMaterial,
      0 //mass
    );
    floor.receiveShadow = true;
    floor.position.set(0,0,0);
    scene.add( floor ); 
    

  renderer = new THREE.WebGLRenderer({antialias:true})
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth,window.innerHeight)
  renderer.gammaOutput = true
  renderer.shadowMap.enabled = true
  renderer.shadowMap.speng = THREE.PCFShadowMap
  container.appendChild(renderer.domElement)
  controls = new THREE.OrbitControls(camera)
  effcutout = new THREE.OutlineEffect(renderer)
  
  document.addEventListener('mousedown',onDocumentMouseDown,false)
  document.addEventListener('touchstart',onDocumentTouchStart,false)
      
  window.addEventListener('resize',onWindowResize,false)
}



function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize( window.innerWidth, window.innerHeight )
}

function onDocumentTouchStart( event ) {
  event.preventDefault()
  event.clientX = event.touches[0].clientX
  event.clientY = event.touches[0].clientY
  onDocumentMouseDown( event )
}
function onDocumentMouseDown(event){
  event.preventDefault()
  mouseCoords.x = (event.clientX/window.innerWidth)*2-1
  mouseCoords.y = -(event.clientY/window.innerHeight)*2+1
  raycaster.setFromCamera(mouseCoords,camera)
  // var intersects = raycaster.intersectObjects(scene.children)
  // Intersects = raycaster.intersectObjects(networkObject)
  // Creates a ball and throws it
  var ballMass = 135;
  var ballRadius = 0.8; 
  var ball = new Physijs.SphereMesh( 
    new THREE.SphereGeometry( ballRadius, 10, 10 ), 
    ballMaterial,
    ballMass
  );
  
  ball.castShadow = true;
  ball.receiveShadow = true;
  
  ball.position.copy(raycaster.ray.direction);
  ball.position.add(raycaster.ray.origin); 
          
  scene.add(ball);
  
  pos.copy( raycaster.ray.direction );
  pos.multiplyScalar( 80 );
  ball.setLinearVelocity( new THREE.Vector3( pos.x, pos.y, pos.z ) ); 
}
function animate(){
    // This block runs while resources are loading.
  if( RESOURCES_LOADED == false ){
    requestAnimationFrame(animate);
    // loadingScreen.box.position.x -= 0.05;
    loadingScreen.box.rotation.x -= 0.1;
    loadingScreen.box.rotation.y -= 0.1;
    loadingScreen.box.rotation.z -= 0.1;
    effcutout.render(loadingScreen.scene, loadingScreen.camera);
    return; // Stop the function here.
  }
  requestAnimationFrame(animate)

  render()
}

function render(){
  var delta = clock.getDelta();
  if ( goalkeeperMixer !== undefined ) {
    goalkeeperMixer.update(delta);
    goalkeeperConMixer.update(delta);
  }
  scene.simulate(); // run physics
  effcutout.render(scene, camera)
  
}
