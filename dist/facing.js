export function movementFacing(vx,vz){return Math.atan2(-vx,-vz)}
export function turnToward(current,target,step){const delta=Math.atan2(Math.sin(target-current),Math.cos(target-current));return current+Math.max(-step,Math.min(step,delta))}
