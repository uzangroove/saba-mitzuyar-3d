import assert from 'node:assert/strict';
import * as THREE from 'three';
import RAPIER from '../dist/vendor/rapier.js';
import {buildSpace,RELAYS,EXIT,canActivate} from '../dist/space-level.js';
import {Companion} from '../dist/companion.js';
import {firstPersonMotion,headingMotion} from '../dist/facing.js';
await RAPIER.init();
const world=new RAPIER.World({x:0,y:0,z:0});world.timestep=1/60;
const win={hidden:true};globalThis.document={querySelector:s=>{assert.equal(s,'#win');return win}};
const scene=new THREE.Scene(),barriers=[],objective={},score={};let messages=[];
const space=buildSpace({scene,world,RAPIER,barriers,message:s=>messages.push(s),objective,score});
assert.match(score.textContent,/אנרגיה 0\/3/);assert.equal(space.asteroids.length,58);assert.equal(space.saucers.length,3);assert.equal(space.monsters.length,3);assert.equal(scene.children.some(o=>o.geometry?.type==='PlaneGeometry'),false,'space contains no ground plane');
space.step(new THREE.Vector3(...EXIT));assert.equal(win.hidden,true,'gate must stay locked');
assert.equal(canActivate(new THREE.Vector3(0,5,8),new THREE.Vector3(0,0,-1),RELAYS[0]),true);
assert.equal(canActivate(new THREE.Vector3(0,5,8),new THREE.Vector3(1,0,0),RELAYS[0]),false);
assert.equal(canActivate(new THREE.Vector3(0,5,30),new THREE.Vector3(0,0,-1),RELAYS[0]),false);
assert.equal(canActivate(new THREE.Vector3(0,5,8),new THREE.Vector3(0,0,-1),RELAYS[0],true),false);
const guardian=space.monsters[0];for(let i=0;i<2;i++){space.fire(guardian.g.position.clone().add(new THREE.Vector3(0,0,4)),new THREE.Vector3(0,0,-1));space.animate(.5,i)}assert.equal(guardian.friendly,true,'two paint hits turn a space monster friendly');assert.match(score.textContent,/חברים 1\/3/);
for(const p of RELAYS){space.fire(new THREE.Vector3(p[0],p[1],p[2]+4),new THREE.Vector3(0,0,-1));space.animate(.5,1)}
assert.match(score.textContent,/אנרגיה 3\/3/);
space.step(new THREE.Vector3(...EXIT));assert.equal(win.hidden,false);
space.reset();assert.equal(win.hidden,true);assert.match(score.textContent,/אנרגיה 0\/3/);assert.equal(space.asteroids.length,58);assert.equal(space.saucers.length,3);assert.equal(space.monsters.length,3);assert.equal(scene.children.some(o=>o.geometry?.type==='PlaneGeometry'),false,'space contains no ground plane');
const companion=new Companion(world,new THREE.Group());world.step();
for(let i=0;i<600;i++){companion.step({x:0,y:3,z:12-Math.min(i,360)/30},1/60);world.step()}
assert.ok(companion.body.translation().z<3,'Shalev follows the traveled route');
companion.reset();assert.equal(companion.body.translation().z,13);
const testWorld=new RAPIER.World({x:0,y:0,z:0});testWorld.timestep=1/60;
testWorld.createCollider(RAPIER.ColliderDesc.cuboid(5,5,.2).setTranslation(0,3,0));
const actor=testWorld.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(0,3,3));
const capsule=testWorld.createCollider(RAPIER.ColliderDesc.capsule(.55,.35),actor);const ctrl=testWorld.createCharacterController(.035);testWorld.step();
for(let i=0;i<180;i++){ctrl.computeColliderMovement(capsule,{x:0,y:0,z:-.1},RAPIER.QueryFilterFlags.EXCLUDE_KINEMATIC);const p=actor.translation(),d=ctrl.computedMovement();actor.setNextKinematicTranslation({x:p.x+d.x,y:p.y+d.y,z:p.z+d.z});testWorld.step()}
assert.ok(actor.translation().z>.54,'kinematic filter still collides with fixed walls');
const input={yaw:0,facing:0,fpBasis:null};let a=firstPersonMotion(input,1,0,3);for(let i=0;i<90;i++)assert.deepEqual(firstPersonMotion(input,1,0,3),a);firstPersonMotion(input,0,0,3);let b=firstPersonMotion(input,0,1,3);assert.ok(b.x>2.99,'FP forward follows the new heading');
assert.ok(headingMotion(Math.PI/2,0,1,3).x< -2.99);
console.log('PASS: zero-ground space volume, 58 asteroids, alien vehicles/monsters, aim/range/occlusion, relays, gate, companion, collisions and FP stability.');
world.free();testWorld.free();
