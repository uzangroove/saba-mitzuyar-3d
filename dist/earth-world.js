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
 box(0,-.55,29,70,1,52,0x8ebf63);box(0,-.55,-29,70,1,42,0x355f58);box(0,-.55,-86,70,1,66,0xb27550);
 const water=mesh(new THREE.PlaneGeometry(70,11),new THREE.MeshStandardMaterial({color:0x4ca8bd,roughness:.22,metalness:.1,transparent:true,opacity:.82}),0,-.03,-1.5);water.rotation.x=-Math.PI/2;
 const pathMat=material(0xd2b180);for(const [x,z,w,d,r] of [[0,39,5,28,0],[0,14,5,16,0],[0,-18,5,20,.03],[1,-39,5,20,-.04],[0,-70,5,27,.02],[0,-99,5,25,0]]){const p=mesh(new THREE.BoxGeometry(w,.06,d),pathMat,x,.01,z);p.rotation.y=r}
 const bridge=box(0,.02,-1.5,5,.38,11,0xc99560,false);bridge.visible=false;
 // Low rails appear with the painted bridge and help read its edges.
 const rails=[box(-2.25,.48,-1.5,.16,.8,11,0x795538,false),box(2.25,.48,-1.5,.16,.8,11,0x795538,false)];rails.forEach(r=>r.visible=false);
 // Outer cliffs keep the large world readable while leaving a broad playable field.
 for(let i=0;i<38;i++){const z=52-i*4.4;for(const side of [-1,1]){const x=side*(31+random()*3),r=1.8+random()*2;const rock=mesh(new THREE.DodecahedronGeometry(r,0),material(i<13?0x738760:i<25?0x526f59:0x8b7c62),x,r*.35,z);rock.scale.set(1.4,.85,1);world.createCollider(RAPIER.ColliderDesc.ball(r*1.4).setTranslation(x,r*.35,z))}}
 // Each stage uses a separate silhouette and color language, while instancing keeps it tablet-friendly.
 const dummy=new THREE.Object3D();
 function grove({count,zMin,zMax,trunk,crown,tall=1,shape='round'}){const trunks=new THREE.InstancedMesh(new THREE.CylinderGeometry(.18,.3,2.5,6),material(trunk),count),geo=shape==='pine'?new THREE.ConeGeometry(1.4,3.8,7):new THREE.IcosahedronGeometry(1.45,1),crowns=new THREE.InstancedMesh(geo,material(crown),count);for(let i=0;i<count;i++){const z=zMin+random()*(zMax-zMin),x=(random()<.5?-1:1)*(8+random()*20),h=(.75+random()*.75)*tall;dummy.position.set(x,1.25*h,z);dummy.scale.set(h,h,h);dummy.rotation.y=random()*6.28;dummy.updateMatrix();trunks.setMatrixAt(i,dummy.matrix);world.createCollider(RAPIER.ColliderDesc.capsule(h*.95,h*.28).setTranslation(x,1.25*h,z));dummy.position.y=(shape==='pine'?3.6:3)*h;dummy.scale.set(h*(.8+random()*.45),h,h*(.8+random()*.45));dummy.updateMatrix();crowns.setMatrixAt(i,dummy.matrix)}crowns.castShadow=true;scene.add(trunks,crowns)}
 // Stage 1: open sunny meadow, rounded trees and a dense carpet of flowers.
 grove({count:32,zMin:7,zMax:51,trunk:0x84583e,crown:0x67a954});
 for(const color of [0xffd55f,0xf48ba7,0xf7f1ff,0x78c9e8]){const flowers=new THREE.InstancedMesh(new THREE.SphereGeometry(.105,6,4),new THREE.MeshBasicMaterial({color}),42);for(let i=0;i<42;i++){dummy.position.set((random()-.5)*56,.15,7+random()*43);dummy.scale.setScalar(.8+random()*1.1);dummy.updateMatrix();flowers.setMatrixAt(i,dummy.matrix)}scene.add(flowers)}
 // Stage 2: tall blue-green enchanted forest, glowing mushrooms and crystal clusters.
 grove({count:52,zMin:-50,zMax:-9,trunk:0x314b49,crown:0x194f4c,tall:1.35});
 const glowMats=[new THREE.MeshStandardMaterial({color:0xa875d1,emissive:0x512675,emissiveIntensity:.8}),new THREE.MeshStandardMaterial({color:0x62d6c5,emissive:0x1f746b,emissiveIntensity:.75})];
 const forestGlows=[];for(let i=0;i<24;i++){const side=i%2?-1:1,x=side*(7+random()*19),z=-11-random()*38;const stemH=.8+random()*.8,capR=.48+random()*.35,stem=mesh(new THREE.CylinderGeometry(.12,.22,stemH,7),material(0xdac9c7),x,.5,z),cap=mesh(new THREE.SphereGeometry(capR,9,6,0,Math.PI*2,0,Math.PI/2),glowMats[i%2],x,1.05,z);world.createCollider(RAPIER.ColliderDesc.ball(capR*.85).setTranslation(x,1.05,z));cap.scale.y=.55;forestGlows.push(cap);if(i%3===0){const cr=.55+random()*.55,cx=x+side*1.2,cz=z+.8,crystal=mesh(new THREE.OctahedronGeometry(cr),glowMats[(i+1)%2],cx,.65,cz);crystal.scale.y=1.8;world.createCollider(RAPIER.ColliderDesc.ball(cr*.8).setTranslation(cx,.65,cz));forestGlows.push(crystal)}}
 // Stage 3: dry orange highlands, sparse dark pines and large stone spires.
 grove({count:22,zMin:-116,zMax:-59,trunk:0x5c4033,crown:0x344d43,tall:1.05,shape:'pine'});
 const highlandRocks=[];for(let i=0;i<30;i++){const side=i%2?-1:1,x=side*(8+random()*21),z=-59-random()*55,r=1+random()*2.3;const rock=mesh(new THREE.DodecahedronGeometry(r,0),material(i%2?0xa66048:0x72586d),x,r*.3,z),sx=.8+random()*.7,sy=1.1+random()*1.5,sz=.75+random()*.7;rock.scale.set(sx,sy,sz);highlandRocks.push(rock);world.createCollider(RAPIER.ColliderDesc.ball(r*Math.max(sx,sy,sz)).setTranslation(x,r*.3,z))}
 // Cottages and a colorful windmill establish scale in the meadow.
 function cottage(x,z,color){box(x,1.35,z,5,2.7,4,color);const roof=mesh(new THREE.ConeGeometry(4,2.4,4),material(0x9c5749),x,3.5,z);roof.rotation.y=Math.PI/4;box(x,1,z-2.03,1.1,2,.12,0x553c2e,false);for(const dx of [-1.35,1.35])box(x+dx,1.55,z-2.08,.8,.8,.1,0xaee5e4,false)}cottage(-16,33,0xe4c783);cottage(16,25,0xd99c79);
 const mill=box(19,3,43,3,6,3,0xd8c194);const blades=new THREE.Group();for(let i=0;i<4;i++){const b=new THREE.Mesh(new THREE.BoxGeometry(.35,5,.15),material(0xe6d9b8));b.position.y=2.25;b.rotation.z=i*Math.PI/2;blades.add(b)}blades.position.set(19,4.2,41.42);scene.add(blades);
 // Ancient forest landmark, stone gate, and highland lantern trail.
 for(const [x,z] of [[-13,-18],[13,-31],[-15,-44]]){const stone=mesh(new THREE.TorusGeometry(2.4,.5,7,12,Math.PI),material(0x898d7c),x,2.1,z);stone.rotation.z=Math.PI;stone.rotation.y=Math.PI/2;world.createCollider(RAPIER.ColliderDesc.ball(2.15).setTranslation(x,2.1,z))}
 box(-23,1,-54,30,2,3,0x5b7350);box(23,1,-54,30,2,3,0x5b7350);
 const gate=box(0,2.5,-54,14,5,1.1,0x706c68,false),gateBody=world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(0,2.5,-54));world.createCollider(RAPIER.ColliderDesc.cuboid(7,2.5,.55),gateBody);for(const x of [-8,8])box(x,3,-54,2.5,6,3,0x77746d);
 const lanterns=[];for(let i=0;i<8;i++){const side=i%2?-1:1,x=side*(3.5+(i%3)*.7),z=-62-i*6;box(x,.55,z,.35,1.1,.35,0x654936,false);const light=mesh(new THREE.OctahedronGeometry(.35),new THREE.MeshStandardMaterial({color:0xffd482,emissive:0xff8a35,emissiveIntensity:1.3}),x,1.35,z);lanterns.push(light)}
 // Terraced approach makes the third stage visually distinct.
 for(let i=0;i<5;i++)box(0,.08+i*.14,-77-i*6,18-i*2,.16+i*.04,5.5,[0xa5a170,0x999567][i%2]);
 const looks=[
  {background:0xadd9d3,fog:0xadd9d3,near:65,far:205},
  {background:0x315b62,fog:0x263f48,near:26,far:105},
  {background:0xd49a79,fog:0xc08068,near:48,far:165}
 ];
 return {bridge,rails,gate,gateBody,lanterns,mill,bridgeCollider:null,gateOpen:false,
  setStage(stage){const look=looks[stage-1];if(scene.background?.isColor)scene.background.setHex(look.background);else scene.background=new THREE.Color(look.background);if(scene.fog){scene.fog.color.setHex(look.fog);scene.fog.near=look.near;scene.fog.far=look.far}},
  paintBridge(){if(this.bridgeCollider)return;bridge.visible=true;rails.forEach(r=>r.visible=true);this.bridgeCollider=world.createCollider(RAPIER.ColliderDesc.cuboid(2.5,.19,5.5).setTranslation(0,.02,-1.5))},
  openGate(){if(this.gateOpen)return;this.gateOpen=true;world.removeRigidBody(gateBody)},
  animate(time,dt){blades.rotation.z=time*.45;forestGlows.forEach((g,i)=>{g.material.emissiveIntensity=.65+Math.sin(time*2+i)*.25;g.rotation.y=time*.2+i});if(this.gateOpen)gate.position.y=Math.min(8,gate.position.y+dt*2.8);lanterns.forEach((l,i)=>{l.material.emissiveIntensity=1.05+Math.sin(time*2+i)*.35;l.rotation.y=time+i})}
 };
}
