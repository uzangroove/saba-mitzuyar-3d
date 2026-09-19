import * as THREE from 'three';
const material=(color,roughness=.9)=>new THREE.MeshStandardMaterial({color,roughness});
export const MONSTER_SPAWNS=[
 {x:-5,z:24,type:0,stage:1,scale:1}, {x:6,z:12,type:1,stage:1,scale:1},
 {x:-7,z:-24,type:1,stage:2,scale:1.12}, {x:8,z:-42,type:0,stage:2,scale:1.18}
];
export const CHECKPOINTS=[{x:0,y:1.1,z:44},{x:0,y:1.1,z:-11},{x:0,y:1.1,z:-62}];
export function buildEarthWorld({scene,world,RAPIER}){
 const solids=[];let seed=91827;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 function mesh(geo,mat,x,y,z){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.receiveShadow=true;scene.add(m);return m}
 function box(x,y,z,w,h,d,color,solid=true){const m=mesh(new THREE.BoxGeometry(w,h,d),material(color),x,y,z);if(solid){const c=world.createCollider(RAPIER.ColliderDesc.cuboid(w/2,h/2,d/2).setTranslation(x,y,z));solids.push(c)}return m}
 // Three broad districts with a river between the first two.
 box(0,-.55,29,70,1,52,0x83a85f);box(0,-.55,-29,70,1,42,0x668957);box(0,-.55,-86,70,1,66,0x8d9960);
 const water=mesh(new THREE.PlaneGeometry(70,11),new THREE.MeshStandardMaterial({color:0x4ca8bd,roughness:.22,metalness:.1,transparent:true,opacity:.82}),0,-.03,-1.5);water.rotation.x=-Math.PI/2;
 const pathMat=material(0xd2b180);for(const [x,z,w,d,r] of [[0,39,5,28,0],[0,14,5,16,0],[0,-18,5,20,.03],[1,-39,5,20,-.04],[0,-70,5,27,.02],[0,-99,5,25,0]]){const p=mesh(new THREE.BoxGeometry(w,.06,d),pathMat,x,.01,z);p.rotation.y=r}
 const bridge=box(0,.02,-1.5,5,.38,11,0xc99560,false);bridge.visible=false;
 // Low rails appear with the painted bridge and help read its edges.
 const rails=[box(-2.25,.48,-1.5,.16,.8,11,0x795538,false),box(2.25,.48,-1.5,.16,.8,11,0x795538,false)];rails.forEach(r=>r.visible=false);
 // Outer cliffs keep the large world readable while leaving a broad playable field.
 for(let i=0;i<38;i++){const z=52-i*4.4;for(const side of [-1,1]){const x=side*(31+random()*3),r=1.8+random()*2;const rock=mesh(new THREE.DodecahedronGeometry(r,0),material(i<13?0x738760:i<25?0x526f59:0x8b7c62),x,r*.35,z);rock.scale.set(1.4,.85,1);if(i%3===0)world.createCollider(RAPIER.ColliderDesc.ball(r*.8).setTranslation(x,r*.35,z))}}
 // Mobile-friendly instanced vegetation: many details, few draw calls.
 const trunkGeo=new THREE.CylinderGeometry(.17,.26,2.3,6),crownGeo=new THREE.IcosahedronGeometry(1.45,1),trunks=new THREE.InstancedMesh(trunkGeo,material(0x765237),92),crowns=new THREE.InstancedMesh(crownGeo,material(0x3f7750),92),dummy=new THREE.Object3D();
 for(let i=0;i<92;i++){let z=49-random()*154,x=(random()<.5?-1:1)*(8+random()*20);if(z<-54)x=(random()<.5?-1:1)*(9+random()*19);const h=.8+random()*.75;dummy.position.set(x,1.15*h,z);dummy.scale.set(h,h,h);dummy.rotation.y=random()*6.28;dummy.updateMatrix();trunks.setMatrixAt(i,dummy.matrix);dummy.position.y=2.8*h;dummy.scale.set(h*(.8+random()*.5),h,h*(.8+random()*.5));dummy.updateMatrix();crowns.setMatrixAt(i,dummy.matrix)}trunks.receiveShadow=true;crowns.castShadow=true;crowns.receiveShadow=true;scene.add(trunks,crowns);
 const bushes=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(.65,0),material(0x6e9859),75);for(let i=0;i<75;i++){const z=51-random()*158,x=(random()<.5?-1:1)*(5+random()*25);dummy.position.set(x,.35,z);const s=.6+random()*1.2;dummy.scale.set(s,.65*s,s);dummy.rotation.y=random()*6.28;dummy.updateMatrix();bushes.setMatrixAt(i,dummy.matrix)}scene.add(bushes);
 const flowerColors=[0xffd55f,0xe98aa5,0xddd5ff];for(let c=0;c<3;c++){const flowers=new THREE.InstancedMesh(new THREE.SphereGeometry(.09,6,4),new THREE.MeshBasicMaterial({color:flowerColors[c]}),60);for(let i=0;i<60;i++){dummy.position.set((random()-.5)*56,.15,48-random()*98);dummy.scale.setScalar(.8+random()*.8);dummy.updateMatrix();flowers.setMatrixAt(i,dummy.matrix)}scene.add(flowers)}
 // Cottages and a colorful windmill establish scale in the meadow.
 function cottage(x,z,color){box(x,1.35,z,5,2.7,4,color);const roof=mesh(new THREE.ConeGeometry(4,2.4,4),material(0x9c5749),x,3.5,z);roof.rotation.y=Math.PI/4;box(x,1,z-2.03,1.1,2,.12,0x553c2e,false);for(const dx of [-1.35,1.35])box(x+dx,1.55,z-2.08,.8,.8,.1,0xaee5e4,false)}cottage(-16,33,0xe4c783);cottage(16,25,0xd99c79);
 const mill=box(19,3,43,3,6,3,0xd8c194);const blades=new THREE.Group();for(let i=0;i<4;i++){const b=new THREE.Mesh(new THREE.BoxGeometry(.35,5,.15),material(0xe6d9b8));b.position.y=2.25;b.rotation.z=i*Math.PI/2;blades.add(b)}blades.position.set(19,4.2,41.42);scene.add(blades);
 // Ancient forest landmark, stone gate, and highland lantern trail.
 for(const [x,z] of [[-13,-18],[13,-31],[-15,-44]]){const stone=mesh(new THREE.TorusGeometry(2.4,.5,7,12,Math.PI),material(0x898d7c),x,2.1,z);stone.rotation.z=Math.PI;stone.rotation.y=Math.PI/2}
 box(-23,1,-54,30,2,3,0x5b7350);box(23,1,-54,30,2,3,0x5b7350);
 const gate=box(0,2.5,-54,14,5,1.1,0x706c68,false),gateBody=world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(0,2.5,-54));world.createCollider(RAPIER.ColliderDesc.cuboid(7,2.5,.55),gateBody);for(const x of [-8,8])box(x,3,-54,2.5,6,3,0x77746d);
 const lanterns=[];for(let i=0;i<8;i++){const side=i%2?-1:1,x=side*(3.5+(i%3)*.7),z=-62-i*6;box(x,.55,z,.35,1.1,.35,0x654936,false);const light=mesh(new THREE.OctahedronGeometry(.35),new THREE.MeshStandardMaterial({color:0xffd482,emissive:0xff8a35,emissiveIntensity:1.3}),x,1.35,z);lanterns.push(light)}
 // Terraced approach makes the third stage visually distinct.
 for(let i=0;i<5;i++)box(0,.08+i*.14,-77-i*6,18-i*2,.16+i*.04,5.5,[0xa5a170,0x999567][i%2]);
 return {bridge,rails,gate,gateBody,lanterns,mill,bridgeCollider:null,gateOpen:false,
  paintBridge(){if(this.bridgeCollider)return;bridge.visible=true;rails.forEach(r=>r.visible=true);this.bridgeCollider=world.createCollider(RAPIER.ColliderDesc.cuboid(2.5,.19,5.5).setTranslation(0,.02,-1.5))},
  openGate(){if(this.gateOpen)return;this.gateOpen=true;world.removeRigidBody(gateBody)},
  animate(time,dt){blades.rotation.z=time*.45;if(this.gateOpen)gate.position.y=Math.min(8,gate.position.y+dt*2.8);lanterns.forEach((l,i)=>{l.material.emissiveIntensity=1.05+Math.sin(time*2+i)*.35;l.rotation.y=time+i})}
 };
}
