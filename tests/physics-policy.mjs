import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
for(const file of ['../dist/swim.js','../dist/companion.js']){const source=await readFile(new URL(file,import.meta.url),'utf8');assert.equal(source.includes('EXCLUDE_KINEMATIC'),false,`${file} must collide with moving bodies`)}
const rules=await readFile(new URL('../GAME_PHYSICS_RULES.md',import.meta.url),'utf8');assert.match(rules,/solid by default/);assert.match(rules,/explicit non-solid exception/);console.log('PASS: solid-by-default policy is documented and runtime controllers include kinematic bodies.');
