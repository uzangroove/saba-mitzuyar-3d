import * as THREE from 'three';
export const RELAYS=[[0,3,4],[-5,6,-5],[5,8,-15]];
export const EXIT=[0,3,-25];
export function canActivate(origin,direction,target,blocked=false){const d=new THREE.Vector3(...target).sub(origin);return !blocked&&d.length()<15&&d.length()>.1&&d.normalize().dot(direction)>.975}
export function buildSpace({scene,world,RAPIER,barriers,message,objective,score}){
 scene.background=new THREE.Color(0x080d26);scene.fog=new THREE.FogExp2(0x11152e,.009);
 const mat=(color,emissive=0)=>new THREE.MeshStandardMaterial({color,roughness:.8,emissive,emissiveIntensity:.5});
 const pink=mat(0xdb8f94),purple=mat(0x8c79bc),pale=mat(0xc9b8d6),cyan=mat(0x83fff0,0x2da7ba);
 function mesh(geometry,material,x,y,z){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);scene.add(m);return m}
 function box(x,y,z,w,h,d,color){const m=mesh(new THREE.BoxGeometry(w,h,d),mat(color),x,y,z);barriers.push(m);world.createCollider(RAPIER.ColliderDesc.cuboid(w/2,h/2,d/2).setTranslation(x,y,z));return m}
 box(0,-.7,-4,36,1,54,0xdba0a1);
 // Invisible flight perimeter; distant scenery sits beyond it.
 for(const [x,y,z,w,h,d] of [[-18,7,-4,1,16,54],[18,7,-4,1,16,54],[0,7,-31,36,16,1],[0,7,23,36,16,1],[0,14,-4,36,1,54]])world.createCollider(RAPIER.ColliderDesc.cuboid(w/2,h/2,d/2).setTranslation(x,y,z));
 for(let i=0;i<36;i++){const side=i%2?1:-1,x=side*(10+(i%4)*2.1),z=19-Math.floor(i/2)*3,h=1+(i%5)*.7;const rock=mesh(new THREE.DodecahedronGeometry(h,1),i%3?purple:pink,x,h*.5,z);rock.scale.set(1,.8,1.2);barriers.push(rock);world.createCollider(RAPIER.ColliderDesc.ball(h*.75).setTranslation(x,h*.5,z));
  if(i%2===0){const stem=mesh(new THREE.CapsuleGeometry(.4,2+i%4,4,8),pale,x-1.1,2+i%3,z);barriers.push(stem);world.createCollider(RAPIER.ColliderDesc.capsule((2+i%4)/2,.4).setTranslation(stem.position.x,stem.position.y,stem.position.z));for(let j=0;j<2;j++){const arm=mesh(new THREE.CapsuleGeometry(.27,.9,4,8),purple,x-1.1+(j?1:-1)*.55,2.4+j*.5,z);arm.rotation.z=(j?1:-1)*.7}}
 }
 // Planets, rings and bubble-like nebula clouds are geometry in the 3D scene.
 const planet=mesh(new THREE.SphereGeometry(8,28,18),mat(0xb9a6da),23,29,-52);planet.rotation.z=.3;
 const orbit=mesh(new THREE.TorusGeometry(12,.35,8,80),mat(0xffb099,0x7b333f),23,29,-52);orbit.rotation.x=1.1;orbit.rotation.y=.3;
 mesh(new THREE.SphereGeometry(4,20,14),mat(0x7ebac9),-31,24,-42);
 for(let i=0;i<26;i++){const puff=mesh(new THREE.SphereGeometry(2.5+i%4,8,6),i%3?pink:pale,-27+Math.sin(i*2.1)*7,3+i*.7,-30+Math.cos(i)*5);puff.material=puff.material.clone();puff.material.emissive.setHex(i<8?0x8c3635:0x20172e)}
 const stars=new Float32Array(900*3);let seed=7;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};for(let i=0;i<stars.length;i+=3){stars[i]=(random()-.5)*160;stars[i+1]=16+random()*64;stars[i+2]=(random()-.7)*140}scene.add(new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(stars,3)),new THREE.PointsMaterial({size:.13,color:0xdcefff})));
 // Starting pad and a friendly toy-like landing craft.
 box(0,0,12,7,.35,6,0x7b789f);const craft=new THREE.Group();const hull=new THREE.Mesh(new THREE.SphereGeometry(1.6,20,12),mat(0xf5e9df));hull.scale.set(1,.65,1.4);craft.add(hull);const glass=new THREE.Mesh(new THREE.SphereGeometry(1,16,12),mat(0x253c65));glass.position.y=.5;glass.scale.set(1,.7,1);craft.add(glass);for(const x of [-1.3,1.3]){const pod=new THREE.Mesh(new THREE.SphereGeometry(.6,12,8),pink);pod.position.set(x,-.4,.4);pod.scale.z=1.6;craft.add(pod)}craft.position.set(-5,1.6,15);scene.add(craft);world.createCollider(RAPIER.ColliderDesc.ball(1.8).setTranslation(-5,1.6,15));barriers.push(hull); // recursive world matrix is updated by rendering
 const relays=RELAYS.map((p,i)=>{box(p[0],.25,p[2],3,.7,3,0x766a99);const core=mesh(new THREE.OctahedronGeometry(.7),mat(0xffce8c,0xcf7139),...p);const ring=mesh(new THREE.TorusGeometry(1.2,.08,8,36),cyan.clone(),...p);const beam=mesh(new THREE.CylinderGeometry(.07,.18,p[1]-.7,8),cyan,p[0],(p[1]+.7)/2,p[2]);return {core,ring,beam,active:false}});
 const gate=mesh(new THREE.TorusGeometry(2,.24,10,40),mat(0x615479),...EXIT);box(0,.05,-25,6,.4,5,0x85729c);
 let completed=false,checkpoint=new THREE.Vector3(0,3,12),cooldown=0;const shots=[];
 function updateGoal(){const n=relays.filter(r=>r.active).length;score.textContent=`אנרגיה ${n}/3`;objective.textContent=completed?'השלב הושלם! שער החלל הופעל':n===3?'השער פתוח · הגיעו לשער הסגול בקצה העמק':'הפעילו 3 גבישי אנרגיה · כוונו את הכוונת וירו צבע';gate.material.color.setHex(n===3?0xb798ff:0x615479);gate.material.emissive.setHex(n===3?0x6038c0:0)}
 function fire(origin,direction){if(cooldown>0||completed)return;cooldown=.3;const bolt=mesh(new THREE.SphereGeometry(.12,8,6),cyan.clone(),origin.x,origin.y,origin.z);shots.push({mesh:bolt,direction:direction.clone(),life:.55});scene.updateMatrixWorld(true);
 const candidates=relays.filter(r=>!r.active).map(r=>({r,d:r.core.position.distanceTo(origin)})).sort((a,b)=>a.d-b.d);
 for(const {r,d} of candidates){const ray=new THREE.Raycaster(origin,r.core.position.clone().sub(origin).normalize(),0,d-.7);const blocked=ray.intersectObjects(barriers,false).length>0;if(canActivate(origin,direction,r.core.position.toArray(),blocked)){r.active=true;r.core.material.color.setHex(0x75ffe2);r.core.material.emissive.setHex(0x238b75);checkpoint.copy(r.core.position).add(new THREE.Vector3(0,0,2));updateGoal();message(relays.every(r=>r.active)?'שליו: השער נפתח! בוא נמשיך לחפש את סבתא.':'שליו: הצבע החזיר את האנרגיה! חפש עוד גביש זהוב.');return}}
 message('כוון את סימן ＋ אל גביש זהוב והתקרב אליו.');
 }
 function step(p){if(!completed&&relays.every(r=>r.active)&&new THREE.Vector3(p.x,p.y,p.z).distanceTo(gate.position)<1.6){completed=true;updateGoal();message('שליו: עשינו זאת יחד! השלמנו את שלב החלל הראשון.');document.querySelector('#win').hidden=false}}
 function animate(dt,time){cooldown=Math.max(0,cooldown-dt);relays.forEach((r,i)=>{r.core.rotation.y=time*.7;r.ring.rotation.z=time*.2+i;r.ring.material.emissiveIntensity=r.active?.1:.8+Math.sin(time*2+i)*.3});orbit.rotation.z=time*.025;for(let i=shots.length-1;i>=0;i--){const s=shots[i];s.mesh.position.addScaledVector(s.direction,24*dt);s.life-=dt;if(s.life<=0){scene.remove(s.mesh);s.mesh.geometry.dispose();s.mesh.material.dispose();shots.splice(i,1)}}}
 function reset(){relays.forEach(r=>{r.active=false;r.core.material.color.setHex(0xffce8c);r.core.material.emissive.setHex(0xcf7139)});completed=false;checkpoint.set(0,3,12);document.querySelector('#win').hidden=true;updateGoal()}
 function help(p){const next=relays.find(r=>!r.active);message(next?`שליו: חפש גביש זהוב ${next.core.position.y>p.y+.8?'מעליך — החזק ↑ כדי לעלות':'בהמשך העמק'}. כוון אליו במרכז המסך ולחץ על כדור הצבע.`:'שליו: כל הגבישים דולקים! השער הסגול מחכה בקצה העמק.');}
 updateGoal();return {fire,step,animate,reset,help,checkpoint};
}
