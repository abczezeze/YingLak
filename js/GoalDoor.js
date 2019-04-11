Physijs.scripts.worker = "./js/lib/physijs_worker.js";
Physijs.scripts.ammo = "ammo.js";

var GoalDoor = function(){
	this.mesh = new THREE.Object3D();
  this.mesh.name = "GoalDoor";

  // doorLeft
	let doorLeft = new Physijs.CylinderMesh(new THREE.CylinderGeometry(.5,.5,15,32),  new THREE.MeshPhongMaterial({ color:0x555555}),0)
  doorLeft.receiveShadow = true
  doorLeft.position.set(-15,6,0)
  // scene.add( doorLeft )
  this.mesh.add( doorLeft )

  //doorRight
  let doorRight = new Physijs.CylinderMesh(new THREE.CylinderGeometry(.5,.5,15,32),  new THREE.MeshPhongMaterial({ color:0x555555}),0)
  doorRight.receiveShadow = true
  doorRight.castShadow = true
  doorRight.position.set(15,6,0)  
  this.mesh.add( doorRight )
  //doorTop 
  let doorTop = new Physijs.CylinderMesh(new THREE.CylinderGeometry(.5,.5,31,32),  new THREE.MeshPhongMaterial({ color:0x555555}),0)
  doorTop.receiveShadow = true
  doorTop.castShadow = true
  doorTop.rotation.z=Math.PI/2
  doorTop.position.set(0,13.5,0)
  this.mesh.add( doorTop )
  //Vertical
  for(let i=0;i<20;i++){
    let doorBackV = new Physijs.CylinderMesh(new THREE.CylinderGeometry(.15,.15,15,32),  new THREE.MeshPhongMaterial({ color:0x555555}),0)
    doorBackV.receiveShadow = true
    doorBackV.castShadow = true
    doorBackV.position.set(-14+i*1.5,6,-10)
    this.mesh.add( doorBackV )
  }
  for(let i=0;i<6;i++){
    let doorSideLV = new Physijs.CylinderMesh(new THREE.CylinderGeometry(.15,.15,15,32),  new THREE.MeshPhongMaterial({ color:0x555555}),0)
    doorSideLV.receiveShadow = true
    doorSideLV.castShadow = true
    doorSideLV.position.set(-15,6,-8+i*1.5)
    this.mesh.add( doorSideLV )
  }
  for(let i=0;i<6;i++){
    let doorSideRV = new Physijs.CylinderMesh(new THREE.CylinderGeometry(.15,.15,15,32),  new THREE.MeshPhongMaterial({ color:0x555555}),0)
    doorSideRV.receiveShadow = true
    doorSideRV.castShadow = true
    doorSideRV.position.set(15,6,-8+i*1.5)
    this.mesh.add( doorSideRV )
  }
  for(let i=0;i<20;i++){
    let doorTTV = new Physijs.CylinderMesh(new THREE.CylinderGeometry(.15,.15,10,32),  new THREE.MeshPhongMaterial({ color:0x555555}),0)
    doorTTV.receiveShadow = true
    doorTTV.castShadow = true
    doorTTV.position.set(-14+i*1.5,13.5,-5.5)
    doorTTV.rotation.x = Math.PI/2
    this.mesh.add( doorTTV )
  }
  //Herizontal
  for(let i=0;i<8;i++){
    let doorBackH = new Physijs.CylinderMesh(new THREE.CylinderGeometry(.15,.15,30,32),  new THREE.MeshPhongMaterial({ color:0x555555}),0)
    doorBackH.receiveShadow = true
    doorBackH.castShadow = true
    doorBackH.position.set(0,2+i*1.5,-10)
    doorBackH.rotation.z = Math.PI/2
    this.mesh.add( doorBackH )
  }
  for(let i=0;i<8;i++){
    let doorSideLH = new Physijs.CylinderMesh(new THREE.CylinderGeometry(.15,.15,10,32),  new THREE.MeshPhongMaterial({ color:0x555555}),0)
    doorSideLH.receiveShadow = true
    doorSideLH.castShadow = true
    doorSideLH.position.set(-15,2+i*1.5,-5.5)
    doorSideLH.rotation.x = Math.PI/2
    this.mesh.add( doorSideLH )
  }
  for(let i=0;i<8;i++){
    let doorSideRH = new Physijs.CylinderMesh(new THREE.CylinderGeometry(.15,.15,10,32),  new THREE.MeshPhongMaterial({ color:0x555555}),0)
    doorSideRH.receiveShadow = true
    doorSideRH.castShadow = true
    doorSideRH.position.set(15,2+i*1.5,-5.5)
    doorSideRH.rotation.x = Math.PI/2
    this.mesh.add( doorSideRH )
  }
  for(let i=0;i<6;i++){
    let doorTTH = new Physijs.CylinderMesh(new THREE.CylinderGeometry(.15,.15,31,32),  new THREE.MeshPhongMaterial({ color:0x555555}),0)
    doorTTH.receiveShadow = true
    doorTTH.castShadow = true
    doorTTH.position.set(0,13.5,-10+i*1.5)
    doorTTH.rotation.z = Math.PI/2
    this.mesh.add( doorTTH )
  }
};


