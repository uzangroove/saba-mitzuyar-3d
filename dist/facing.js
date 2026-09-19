export function movementFacing(vx,vz){return Math.atan2(-vx,-vz)}
export function turnToward(current,target,step){const delta=Math.atan2(Math.sin(target-current),Math.cos(target-current));return current+Math.max(-step,Math.min(step,delta))}
export function headingMotion(yaw,right,forward,speed){return {x:(Math.cos(yaw)*right-Math.sin(yaw)*forward)*speed,z:(-Math.sin(yaw)*right-Math.cos(yaw)*forward)*speed}}
export function rotateCharacter(state,delta){state.facing+=delta;if(state.fp)state.yaw=state.facing}
export function firstPersonMotion(state,right,forward,speed){
 if(Math.hypot(right,forward)<.01){state.fpBasis=null;return {x:0,z:0}}
 if(state.fpBasis==null)state.fpBasis=state.yaw;
 const motion=headingMotion(state.fpBasis,right,forward,speed);
 state.facing=movementFacing(motion.x,motion.z);state.yaw=state.facing;
 return motion;
}
