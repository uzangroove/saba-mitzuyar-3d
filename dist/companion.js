import * as THREE from 'three';
import RAPIER from './vendor/rapier.js';
import {movementFacing} from './facing.js';
// Follow the player's recorded route so corners do not become a straight-line shortcut.
export class Companion {
 constructor(world,model,start={x:1.8,y:3,z:13}){this.world=world;this.model=model;this.start={...start};this.body=world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(start.x,start.y,start.z));this.collider=world.createCollider(RAPIER.ColliderDesc.capsule(.3,.25),this.body);this.controller=world.createCharacterController(.035);this.trail=[];this.last=new THREE.Vector3(start.x-1.8,start.y,start.z-1);this.reset()}
 reset(){const s=this.start;this.body.setTranslation(s,true);this.body.setNextKinematicTranslation(s);this.trail=[];this.last.set(s.x-1.8,s.y,s.z-1);this.model.rotation.set(0,0,0)}
 step(player,dt){const goal=new THREE.Vector3(player.x,player.y,player.z);if(goal.distanceTo(this.last)>.65){this.trail.push(goal.clone());this.last.copy(goal);if(this.trail.length>180)this.trail.shift()}
 const p=this.body.translation();let target=this.trail[0];if(!target)return;
 if(Math.hypot(p.x-target.x,p.y-target.y,p.z-target.z)<.5){this.trail.shift();target=this.trail[0];if(!target)return}
 if(this.trail.length<3&&Math.hypot(p.x-player.x,p.y-player.y,p.z-player.z)<2.1)return;
 const delta=target.clone().sub(new THREE.Vector3(p.x,p.y,p.z));delta.clampLength(0,(this.trail.length>8?6:4.3)*dt);
 this.controller.computeColliderMovement(this.collider,delta);const d=this.controller.computedMovement();this.body.setNextKinematicTranslation({x:p.x+d.x,y:p.y+d.y,z:p.z+d.z});if(Math.hypot(d.x,d.z)>.001)this.model.rotation.y=movementFacing(d.x,d.z)
 }
 render(){const p=this.body.translation();this.model.position.set(p.x,p.y-.55,p.z)}
}
