import * as THREE from 'three';

export const IMAGINATION_START={x:0,y:1.1,z:42};
export const IDEA_SPARKS=[[-13,1.6,31],[14,2.1,18],[0,1.8,3]];
export const IMAGINATION_EXIT=[0,1,-62];

const colors=[0xff6d9d,0xffa149,0xffdb55,0x66dfa9,0x5fc9f4,0x9f7aeb];
const std=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.72,...extra});

export function buildImaginationWorld({scene,world,RAPIER,barriers}){
 let seed=99271;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 const floats=[],sparks=[],paintDrops=[],solidCount={value:0};
 const mesh=(geo,mat,x=0,y=0,z=0)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);scene.add(m);return m};
 const box=(x,y,z,w,h,d,color,solid=true)=>{const m=mesh(new THREE.BoxGeometry(w,h,d),std(color),x,y,z);if(solid){world.createCollider(RAPIER.ColliderDesc.cuboid(w/2,h/2,d/2).setTranslation(x,y,z));barriers.push(m);solidCount.value++}return m};

 scene.background=new THREE.Color(0xb8a5ea);scene.fog=new THREE.Fog(0xd7b4e9,70,185);
 // Two giant sketchbook pages separated by a living river of paint.
 box(0,-.55,23,72,1,50,0xfff1cf);box(0,-.55,-43,72,1,52,0xd9efff);
 const paperLines=new THREE.MeshBasicMaterial({color:0x77afd2,transparent:true,opacity:.22});
 for(let z=45;z>-68;z-=4.4){if(z<-2&&z>-17)continue;const line=mesh(new THREE.PlaneGeometry(66,.055),paperLines,0,.01,z);line.rotation.x=-Math.PI/2}
 const margin=mesh(new THREE.PlaneGeometry(.09,111),new THREE.MeshBasicMaterial({color:0xef7291,transparent:true,opacity:.5}),-27,.015,-10);margin.rotation.x=-Math.PI/2;
 // Solid outer toy-block boundary.
 for(let i=0;i<30;i++){const z=45-i*3.8;for(const side of [-1,1]){const h=1.4+(i%4)*.45,w=2.2+(i%3)*.45,block=box(side*(34+((i%2)*.4)),h/2,z,w,h,3,colors[i%colors.length]);block.rotation.y=(i%3-1)*.12}}
 box(0,5,49,72,10,1,0x795ba6);box(0,5,-70,72,10,1,0x795ba6);

 // The paint river is an explicit non-solid visual below the gap; falling still resets the player.
 const river=mesh(new THREE.PlaneGeometry(72,15,20,4),new THREE.MeshStandardMaterial({color:0xf054a5,emissive:0x572067,emissiveIntensity:.35,roughness:.18,metalness:.12,side:THREE.DoubleSide}),0,-2.7,-9.5);river.rotation.x=-Math.PI/2;
 for(let i=0;i<45;i++){const drop=mesh(new THREE.SphereGeometry(.18+random()*.32,7,5),std(colors[i%colors.length],{emissive:colors[i%colors.length],emissiveIntensity:.35,transparent:true,opacity:.82}),(random()-.5)*65,-2+random()*2,-16+random()*13);paintDrops.push({mesh:drop,baseY:drop.position.y,phase:random()*6.28,speed:.6+random()})}

 // Bridge exists visually only after the player paints it; collider is created once.
 const bridge=new THREE.Group(),bridgeMat=std(0xffd86a,{emissive:0x9d4f16,emissiveIntensity:.18});
 for(let i=0;i<9;i++){const plank=new THREE.Mesh(new THREE.BoxGeometry(5.4,.32,1.5),bridgeMat.clone());plank.material.color.offsetHSL(i*.025,0,0);plank.position.z=(i-4)*1.55;bridge.add(plank)}bridge.position.set(0,.12,-9.5);bridge.visible=false;bridge.scale.z=.01;scene.add(bridge);let bridgeCollider=null,bridgeProgress=0;

 // Giant pencils, crayons and building blocks give the world a handmade scale.
 function pencil(x,z,color,tilt=0){const group=new THREE.Group(),shaft=new THREE.Mesh(new THREE.CylinderGeometry(.35,.35,5.8,10),std(color)),tip=new THREE.Mesh(new THREE.ConeGeometry(.36,1.2,10),std(0xe9c995)),lead=new THREE.Mesh(new THREE.ConeGeometry(.13,.42,8),std(0x313144));shaft.position.y=3;tip.position.y=6.45;lead.position.y=7.25;group.add(shaft,tip,lead);group.position.set(x,0,z);group.rotation.z=tilt;scene.add(group);barriers.push(group);world.createCollider(RAPIER.ColliderDesc.capsule(2.8,.42).setTranslation(x,3,z));solidCount.value++;return group}
 for(let i=0;i<10;i++)pencil((i%2?-1:1)*(20+random()*10),40-i*10,colors[i%colors.length],(i%2?-1:1)*(.08+random()*.12));
 for(let i=0;i<28;i++){const side=i%2?-1:1,x=side*(10+random()*20),z=43-random()*104;if(z<-3&&z>-18)continue;const s=.7+random()*1.5,b=box(x,s/2,z,s*(1+random()),s,s*(1+random()),colors[(i+2)%colors.length]);b.rotation.y=random()*.7}

 // Floating pages and clouds are decorative non-solid objects.
 for(let i=0;i<14;i++){const page=new THREE.Mesh(new THREE.PlaneGeometry(2.5+random()*2,1.8+random()),new THREE.MeshStandardMaterial({color:i%2?0xfff7df:0xdff5ff,roughness:.85,side:THREE.DoubleSide}));page.position.set((random()-.5)*58,5+random()*10,43-random()*103);page.rotation.set(random()*.5,random()*6.28,random()*.45);scene.add(page);floats.push({mesh:page,baseY:page.position.y,phase:random()*6.28,speed:.25+random()*.35})}
 for(let i=0;i<10;i++){const cloud=new THREE.Group();for(let j=0;j<4;j++){const puff=new THREE.Mesh(new THREE.SphereGeometry(.8+random()*.6,10,7),new THREE.MeshStandardMaterial({color:0xffe9f8,transparent:true,opacity:.72,roughness:1}));puff.position.set((j-1.5)*.85,random()*.45,random()*.4);cloud.add(puff)}cloud.position.set((random()-.5)*62,8+random()*8,40-random()*108);scene.add(cloud);floats.push({mesh:cloud,baseY:cloud.position.y,phase:random()*6.28,speed:.12+random()*.18})}

 // Friendly invented creatures made from spheres and blocks; bodies are solid landmarks.
 for(let i=0;i<7;i++){const group=new THREE.Group(),c=colors[(i+1)%colors.length],bodyMesh=new THREE.Mesh(new THREE.SphereGeometry(1.05,12,8),std(c)),eyeMat=std(0x222342);bodyMesh.scale.set(1,1.15,.8);group.add(bodyMesh);for(const side of [-1,1]){const eye=new THREE.Mesh(new THREE.SphereGeometry(.18,8,6),eyeMat);eye.position.set(side*.35,.25,-.8);group.add(eye);const ear=new THREE.Mesh(new THREE.ConeGeometry(.33,.9,7),std(colors[(i+3)%colors.length]));ear.position.set(side*.75,.8,0);ear.rotation.z=-side*.35;group.add(ear)}for(const side of [-1,1]){const foot=new THREE.Mesh(new THREE.SphereGeometry(.35,8,6),std(colors[(i+4)%colors.length]));foot.scale.set(1.4,.5,1);foot.position.set(side*.48,-1,.1);group.add(foot)}const x=(i%2?-1:1)*(11+i*2.6),z=35-i*14;if(z<-3&&z>-18)continue;group.position.set(x,1.15,z);scene.add(group);barriers.push(group);world.createCollider(RAPIER.ColliderDesc.ball(1.15).setTranslation(x,1.15,z));solidCount.value++;floats.push({mesh:group,baseY:1.15,phase:i*.9,speed:.55})}

 // Three collectible idea sparks before the missing bridge.
 for(const [i,p] of IDEA_SPARKS.entries()){const group=new THREE.Group(),c=colors[(i*2+1)%colors.length],core=new THREE.Mesh(new THREE.OctahedronGeometry(.55),std(c,{emissive:c,emissiveIntensity:1.2})),halo=new THREE.Mesh(new THREE.TorusGeometry(.9,.06,8,24),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.75}));group.add(core,halo);group.position.set(...p);scene.add(group);sparks.push(group)}

 // Rainbow gate at the end of the first imagination stage.
 const gate=new THREE.Group();for(let i=0;i<6;i++){const arc=new THREE.Mesh(new THREE.TorusGeometry(4.7-i*.5,.22,8,36,Math.PI),std(colors[i],{emissive:colors[i],emissiveIntensity:.36}));arc.position.y=.2;gate.add(arc)}gate.position.set(0,.05,-62);scene.add(gate);for(const x of [-5.2,5.2])box(x,2.5,-62,1.1,5,1.5,0x7c5aa8);
 const portal=new THREE.Mesh(new THREE.PlaneGeometry(8.7,6.3),new THREE.MeshBasicMaterial({color:0xc97cff,transparent:true,opacity:.18,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending}));portal.position.set(0,3.1,-62.15);scene.add(portal);

 return {sparks,bridge,gate,portal,river,solidCount,
  createBridge(){if(bridgeCollider)return false;bridge.visible=true;bridgeProgress=.01;bridgeCollider=world.createCollider(RAPIER.ColliderDesc.cuboid(2.7,.18,7).setTranslation(0,.12,-9.5));barriers.push(bridge);solidCount.value++;return true},
  reset(){sparks.forEach(s=>s.visible=true);if(bridgeCollider){world.removeCollider(bridgeCollider,true);bridgeCollider=null}bridge.visible=false;bridge.scale.z=.01;bridgeProgress=0},
  animate(dt,time){
   river.material.emissiveIntensity=.28+Math.sin(time*1.2)*.12;river.position.y=-2.7+Math.sin(time*.65)*.12;
   paintDrops.forEach((d,i)=>{d.mesh.position.y=d.baseY+Math.sin(time*d.speed+d.phase)*.55;d.mesh.rotation.y+=dt*(.4+i%3*.1)});
   floats.forEach((f,i)=>{f.mesh.position.y=f.baseY+Math.sin(time*f.speed+f.phase)*.55;f.mesh.rotation.y+=dt*.08});
   sparks.forEach((s,i)=>{if(!s.visible)return;s.rotation.y=time*(.7+i*.12);s.children[1].rotation.x=time*.9+i;s.scale.setScalar(1+Math.sin(time*2+i)*.08)});
   if(bridgeProgress>0&&bridgeProgress<1){bridgeProgress=Math.min(1,bridgeProgress+dt*1.6);bridge.scale.z=THREE.MathUtils.smoothstep(bridgeProgress,0,1)}
   gate.children.forEach((a,i)=>{a.material.emissiveIntensity=.28+Math.sin(time*1.8+i)*.16});portal.material.opacity=.14+Math.sin(time*1.6)*.08;
  }
 };
}
