import * as THREE from 'three';

export const UNDERWATER_START=[0,4,32];
export const UNDERWATER_LOCATIONS=[
 [0,3.2,20],[-12,7,-2],[14,4.5,-29],[-10,8,-57],[13,5.5,-84],[0,10,-108]
];
export const UNDERWATER_ZONES=['שער האלמוגים','קניון המדוזות','יער האצות','העיר השקועה','לגונת הצבים','תהום הקשת'];

const palette=[0xff6fae,0xffa552,0xffdf62,0x6ce0c1,0x64c8f0,0x9d82ef,0xf58a7c];
const std=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.78,...extra});

export function buildUnderwaterWorld({scene,world,RAPIER,barriers}){
 let seed=714205;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 const rings=[],schools=[],jellies=[],kelp=[],creatures=[],caustics=[];
 const mesh=(geometry,material,x=0,y=0,z=0)=>{const item=new THREE.Mesh(geometry,material);item.position.set(x,y,z);scene.add(item);return item};
 const box=(x,y,z,w,h,d,color,solid=true)=>{const item=mesh(new THREE.BoxGeometry(w,h,d),std(color),x,y,z);if(solid){world.createCollider(RAPIER.ColliderDesc.cuboid(w/2,h/2,d/2).setTranslation(x,y,z));barriers.push(item)}return item};
 const rock=(x,y,z,r,color=0x527b78,sx=1,sy=1,sz=1)=>{const item=mesh(new THREE.DodecahedronGeometry(r,1),std(color),x,y,z);item.scale.set(sx,sy,sz);world.createCollider(RAPIER.ColliderDesc.ball(r*Math.max(sx,sy,sz)*.78).setTranslation(x,y,z));barriers.push(item);return item};

 scene.background=new THREE.Color(0x075d77);scene.fog=new THREE.FogExp2(0x075d77,.017);
 // Large sealed swimming volume. All boundary bodies are solid.
 box(0,-.8,-40,86,1.2,160,0xcbb98a);box(-43.5,8,-40,1,18,160,0x1c6070);box(43.5,8,-40,1,18,160,0x1c6070);box(0,8,40,86,18,1,0x1c6070);box(0,8,-120,86,18,1,0x1c6070);
 world.createCollider(RAPIER.ColliderDesc.cuboid(43,.45,80).setTranslation(0,17,-40));

 const surface=new THREE.Mesh(new THREE.PlaneGeometry(86,160,20,28),new THREE.MeshPhysicalMaterial({color:0x8df5ee,transparent:true,opacity:.2,roughness:.12,metalness:.05,side:THREE.DoubleSide,depthWrite:false}));
 surface.rotation.x=-Math.PI/2;surface.position.set(0,16.55,-40);scene.add(surface);

 // Sand dunes make the sea floor read as a landscape rather than a flat box.
 for(let i=0;i<34;i++){
  const x=(random()-.5)*70,z=32-random()*146,r=1.2+random()*3.4;
  const dune=mesh(new THREE.SphereGeometry(r,12,7,0,Math.PI*2,0,Math.PI/2),std(i%3===0?0xd8c891:0xc7b681),x,-.2,z);
  dune.scale.set(1.8+random(),.28+random()*.22,1+random());
 }

 function coral(x,z,scale,index){
  const group=new THREE.Group(),color=palette[index%palette.length],mat=std(color,{emissive:color,emissiveIntensity:.08});
  const kind=index%4;
  if(kind===0){
   for(let j=0;j<6;j++){const h=(1.2+j*.18)*scale,twig=new THREE.Mesh(new THREE.CylinderGeometry(.09*scale,.19*scale,h,7),mat);twig.position.set((j-2.5)*.22*scale,h*.48,(j%2-.5)*.2);twig.rotation.z=(j-2.5)*.12;group.add(twig)}
  }else if(kind===1){
   const base=new THREE.Mesh(new THREE.SphereGeometry(.75*scale,12,8),mat);base.scale.y=.55;group.add(base);
   for(let j=0;j<10;j++){const tip=new THREE.Mesh(new THREE.SphereGeometry(.17*scale,8,6),std(palette[(index+j+1)%palette.length],{emissive:color,emissiveIntensity:.12}));const a=j/10*Math.PI*2;tip.position.set(Math.cos(a)*.7*scale,.45*scale,Math.sin(a)*.7*scale);group.add(tip)}
  }else if(kind===2){
   const fan=new THREE.Mesh(new THREE.CircleGeometry(1.25*scale,18),new THREE.MeshStandardMaterial({color,roughness:.7,side:THREE.DoubleSide,transparent:true,opacity:.82}));fan.position.y=1.05*scale;fan.rotation.y=(index%3)*.45;group.add(fan);for(let j=0;j<5;j++){const rib=new THREE.Mesh(new THREE.CylinderGeometry(.025,.04,2.1*scale,5),std(0xf7d0b5));rib.position.y=1.05*scale;rib.rotation.z=(j-2)*.22;group.add(rib)}
  }else{
   for(let j=0;j<8;j++){const a=j/8*Math.PI*2,stem=new THREE.Mesh(new THREE.CylinderGeometry(.07*scale,.12*scale,(1.1+random())*scale,6),mat);stem.position.set(Math.cos(a)*.45*scale,.65*scale,Math.sin(a)*.45*scale);stem.rotation.z=Math.cos(a)*.25;group.add(stem)}
  }
  group.position.set(x,.05,z);scene.add(group);barriers.push(group);world.createCollider(RAPIER.ColliderDesc.ball(.8*scale).setTranslation(x,.8*scale,z));return group;
 }

 // Dense, colorful reefs frame a wide, navigable central route.
 for(let i=0;i<52;i++){
  const side=i%2?-1:1,z=34-Math.floor(i/2)*5.7-random()*2,x=side*(17+random()*21),scale=.75+random()*1.25;
  rock(x,.35*scale,z,scale*.9,[0x3c7779,0x416d7a,0x586c79][i%3],1.2,.7,1);
  coral(x-side*(1.2+random()*2),z+random()*2-1,scale,i);
 }

 // Kelp is an explicit non-solid environmental effect so dense vegetation cannot trap the player.
 const dummy=new THREE.Object3D(),kelpCount=86,kelpMesh=new THREE.InstancedMesh(new THREE.CylinderGeometry(.08,.16,1,7),std(0x3f9b72,{transparent:true,opacity:.88}),kelpCount);
 for(let i=0;i<kelpCount;i++){const z=-16-random()*50,x=(random()<.5?-1:1)*(9+random()*29),h=2+random()*4;dummy.position.set(x,h*.5,z);dummy.scale.set(1,h,1);dummy.rotation.z=(random()-.5)*.16;dummy.updateMatrix();kelpMesh.setMatrixAt(i,dummy.matrix);kelp.push({i,x,z,h,phase:random()*6.28})}scene.add(kelpMesh);

 // Sunken city: columns, arches and colored crystals are physical landmarks.
 for(let i=0;i<9;i++){const x=(i%3-1)*8-10,z=-50-Math.floor(i/3)*8,h=3.5+(i%2)*1.4;box(x,h/2,z,1.2,h,1.2,0x78938d);const cap=box(x,h+.2,z,2,.45,2,0x9faf9d);cap.rotation.y=i*.3}
 for(const [x,z] of [[-18,-45],[-2,-61],[18,-54]]){const arch=new THREE.Group(),mat=std(0x8e9f91);for(const dx of [-2.6,2.6]){const p=new THREE.Mesh(new THREE.BoxGeometry(1.1,4.8,1.4),mat);p.position.set(dx,2.4,0);arch.add(p)}const top=new THREE.Mesh(new THREE.BoxGeometry(6.3,1.1,1.4),mat);top.position.y=5;arch.add(top);arch.position.set(x,0,z);scene.add(arch);barriers.push(arch);world.createCollider(RAPIER.ColliderDesc.cuboid(.55,2.4,.7).setTranslation(x-2.6,2.4,z));world.createCollider(RAPIER.ColliderDesc.cuboid(.55,2.4,.7).setTranslation(x+2.6,2.4,z));world.createCollider(RAPIER.ColliderDesc.cuboid(3.15,.55,.7).setTranslation(x,5,z))}
 for(let i=0;i<18;i++){const x=(random()-.5)*66,z=-42-random()*61,r=.35+random()*.65,c=palette[(i+3)%palette.length],crystal=mesh(new THREE.OctahedronGeometry(r),std(c,{emissive:c,emissiveIntensity:.55}),x,r,z);crystal.scale.y=1.8;world.createCollider(RAPIER.ColliderDesc.ball(r*.72).setTranslation(x,r,z));barriers.push(crystal);caustics.push(crystal)}

 // Schools of small fish are visual non-solid fauna; six groups keep draw calls low.
 for(let s=0;s<6;s++){
  const count=9+s%3,group=new THREE.Group(),bodyGeo=new THREE.SphereGeometry(.32,8,5),tailGeo=new THREE.ConeGeometry(.2,.45,3),bodyMat=std(palette[(s+4)%palette.length],{metalness:.05}),tailMat=std(palette[(s+5)%palette.length]);
  const bodies=new THREE.InstancedMesh(bodyGeo,bodyMat,count),tails=new THREE.InstancedMesh(tailGeo,tailMat,count);
  for(let i=0;i<count;i++){const x=(i%3)*.85+(random()-.5)*.25,y=(Math.floor(i/3)-1)*.55+(random()-.5)*.2,z=(random()-.5)*1.8;dummy.position.set(x,y,z);dummy.scale.set(1.4,.65,.7);dummy.updateMatrix();bodies.setMatrixAt(i,dummy.matrix);dummy.position.z=z+.55;dummy.rotation.x=Math.PI/2;dummy.scale.set(1,1,1);dummy.updateMatrix();tails.setMatrixAt(i,dummy.matrix);dummy.rotation.set(0,0,0)}group.add(bodies,tails);group.position.set((s%2?-1:1)*(9+s*3),4+s%3*2,22-s*24);scene.add(group);schools.push({group,base:group.position.clone(),phase:s*1.17,speed:.22+s*.035})
 }

 // Jellyfish are non-solid luminous guides in the open water column.
 for(let i=0;i<10;i++){const group=new THREE.Group(),c=palette[(i+1)%palette.length],bell=new THREE.Mesh(new THREE.SphereGeometry(.6,12,8,0,Math.PI*2,0,Math.PI/2),new THREE.MeshPhysicalMaterial({color:c,emissive:c,emissiveIntensity:.45,transparent:true,opacity:.58,roughness:.18}));bell.scale.y=.65;group.add(bell);for(let t=0;t<4;t++){const tentacle=new THREE.Mesh(new THREE.CylinderGeometry(.025,.04,1.5,5),std(c,{emissive:c,emissiveIntensity:.3,transparent:true,opacity:.65}));tentacle.position.set((t-1.5)*.2,-.8,0);group.add(tentacle)}group.position.set((random()-.5)*52,5+random()*8,5-random()*96);scene.add(group);jellies.push({group,baseY:group.position.y,phase:random()*6.28})}

 function turtle(x,y,z,scale,phase){const group=new THREE.Group(),shell=new THREE.Mesh(new THREE.SphereGeometry(1,14,9),std(0x4b806d)),belly=new THREE.Mesh(new THREE.SphereGeometry(.82,12,8),std(0x9dc18b));shell.scale.set(1.25,.42,1.55);belly.scale.set(1.05,.28,1.3);belly.position.y=-.18;group.add(shell,belly);const head=new THREE.Mesh(new THREE.SphereGeometry(.38,10,7),std(0x72aa78));head.position.z=-1.5;group.add(head);for(const side of [-1,1])for(const front of [-.55,.7]){const fin=new THREE.Mesh(new THREE.SphereGeometry(.38,9,6),std(0x6ca275));fin.scale.set(1.25,.15,.7);fin.position.set(side*1.08,-.05,front);group.add(fin)}group.scale.setScalar(scale);group.position.set(x,y,z);scene.add(group);barriers.push(group);const body=world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(x,y,z));world.createCollider(RAPIER.ColliderDesc.ball(1.35*scale),body);creatures.push({kind:'turtle',group,body,base:new THREE.Vector3(x,y,z),phase,range:6+scale*2});}
 function ray(x,y,z,scale,phase){const group=new THREE.Group(),mat=std(0x835fa8,{emissive:0x34235d,emissiveIntensity:.2}),bodyMesh=new THREE.Mesh(new THREE.SphereGeometry(1,14,7),mat);bodyMesh.scale.set(2.1,.22,1.2);group.add(bodyMesh);for(const side of [-1,1]){const wing=new THREE.Mesh(new THREE.ConeGeometry(1.15,2.5,3),mat);wing.rotation.z=side*Math.PI/2;wing.position.x=side*1.45;group.add(wing)}const tail=new THREE.Mesh(new THREE.CylinderGeometry(.035,.08,3,6),mat);tail.rotation.x=Math.PI/2;tail.position.z=2;group.add(tail);group.scale.setScalar(scale);group.position.set(x,y,z);scene.add(group);barriers.push(group);const body=world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(x,y,z));world.createCollider(RAPIER.ColliderDesc.ball(1.5*scale),body);creatures.push({kind:'ray',group,body,base:new THREE.Vector3(x,y,z),phase,range:7+scale*2});}
 turtle(15,5.5,-78,1.25,.4);turtle(-18,7,-91,.95,2.2);ray(-13,9,-18,1.1,1.4);ray(18,6,-39,.9,3.1);

 // Soft projected caustic rings reinforce the underwater reading without post-processing.
 const causticMat=new THREE.MeshBasicMaterial({color:0xa7fff2,transparent:true,opacity:.12,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending});
 for(let i=0;i<18;i++){const c=mesh(new THREE.RingGeometry(.7+random(),1.05+random()*1.4,20),causticMat.clone(),(random()-.5)*72,-.16,32-random()*145);c.rotation.x=-Math.PI/2;c.userData.phase=random()*6.28;caustics.push(c)}

 for(const [i,p] of UNDERWATER_LOCATIONS.entries()){const color=palette[(i+2)%palette.length],ring=new THREE.Mesh(new THREE.TorusGeometry(1.75,.16,10,42),new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.72,roughness:.25}));ring.position.set(...p);ring.rotation.z=i%2?.18:-.12;scene.add(ring);rings.push(ring)}

 return {rings,locations:UNDERWATER_LOCATIONS,zones:UNDERWATER_ZONES,surface,schools,jellies,creatures,kelpMesh,
  reset(){rings.forEach((ring,i)=>{const color=palette[(i+2)%palette.length];ring.material.color.setHex(color);ring.material.emissive.setHex(color)})},
  animate(dt,time){
   surface.position.y=16.55+Math.sin(time*.45)*.08;surface.material.opacity=.18+Math.sin(time*.7)*.035;
   schools.forEach((s,i)=>{s.group.position.x=s.base.x+Math.sin(time*s.speed+s.phase)*8;s.group.position.z=s.base.z+Math.cos(time*s.speed*.7+s.phase)*5;s.group.position.y=s.base.y+Math.sin(time*.8+s.phase)*.7;s.group.rotation.y=Math.atan2(Math.cos(time*s.speed+s.phase),-Math.sin(time*s.speed*.7+s.phase))});
   jellies.forEach((j,i)=>{j.group.position.y=j.baseY+Math.sin(time*.7+j.phase)*1.1;j.group.scale.y=.92+Math.sin(time*1.5+j.phase)*.09;j.group.rotation.y+=dt*.12});
   creatures.forEach((c,i)=>{const a=time*.16+c.phase,x=c.base.x+Math.sin(a)*c.range,z=c.base.z+Math.cos(a)*c.range*.65,y=c.base.y+Math.sin(time*.45+c.phase)*.8;c.group.position.set(x,y,z);c.group.rotation.y=a+Math.PI/2;if(c.kind==='ray')c.group.rotation.z=Math.sin(time*1.2+c.phase)*.08;else c.group.children.slice(3).forEach((f,k)=>f.rotation.z=Math.sin(time*2+c.phase+k)*.22);c.body.setNextKinematicTranslation({x,y,z})});
   caustics.forEach((c,i)=>{const pulse=1+Math.sin(time*.75+c.userData.phase)*.18;c.scale.setScalar(pulse);c.rotation.z=time*.07+c.userData.phase;c.material.opacity=.07+Math.sin(time*.6+c.userData.phase)*.035});
   rings.forEach((r,i)=>{r.rotation.y=time*.22+i*.4;r.position.y=UNDERWATER_LOCATIONS[i][1]+Math.sin(time*1.25+i)*.18});
   for(const item of kelp){dummy.position.set(item.x,item.h*.5,item.z);dummy.scale.set(1,item.h,1);dummy.rotation.z=Math.sin(time*.65+item.phase)*.09;dummy.updateMatrix();kelpMesh.setMatrixAt(item.i,dummy.matrix)}kelpMesh.instanceMatrix.needsUpdate=true;
  }
 };
}
