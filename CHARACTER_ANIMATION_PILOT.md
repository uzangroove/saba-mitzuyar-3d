# Saba Mitzuyar — Character Animation Pilot

Date: 2026-09-19

## Approval boundary

This document is preparation only. Do not submit a Meshy Remesh, Rigging,
Text-to-Motion, or Animation task until Saba Shimon gives a new explicit approval
for the exact credit total.

## Verified source assets

| Character | Source | File size | Vertices | Triangles | Materials | Textures | Skins | Clips |
|---|---|---:|---:|---:|---:|---|---:|---:|
| Saba Shimon | `upload/SABA SHIMON ALONE.glb` | 17.66 MB | 198,687 | 366,906 | 1 | 3 × JPEG 2048² | 0 | 0 |
| Shalev | `upload/SHALEV ALONE.glb` | 21.35 MB | 259,983 | 481,222 | 1 | 3 × JPEG 2048² | 0 | 0 |

Both files are below Meshy CLI's 50 MiB local-upload limit, but both exceed the
300,000-face Meshy auto-rig limit. A controlled remesh is required before rigging.

## Runtime targets

| Character | Pilot triangle target | Later LOD target | Texture target | Runtime format |
|---|---:|---:|---|---|
| Saba Shimon | 50,000 | 18,000–25,000 | 2K | GLB 2.0 |
| Shalev | 35,000 | 10,000–15,000 | 2K | GLB 2.0 |

Required conventions:

- One skinned mesh and one stable armature per character.
- Neutral A/T-compatible pose with separated arms and clearly visible limbs.
- Character faces +Z before Meshy rigging.
- Origin at the feet; normalized scale; applied transforms.
- Stable bone and clip names.
- All gameplay locomotion clips are **in-place**. The game's controller moves the
  physics body; animation must not translate the character root.
- Space suit, helmet, backpack, underwater mask and fins are accessories attached
  to named bones/sockets, not duplicate character bodies.

## Recommended paid pilot — Saba only

The first paid pilot deliberately tests only one custom motion. Walk and run are
already included in Meshy auto-rigging.

| Stage | Purpose | Estimated credits |
|---|---|---:|
| Remesh | Reduce Saba to about 50,000 triangles | 5 |
| Auto-Rigging | Create armature and receive bundled walk/run | 5 |
| Text-to-Motion Swift | Generate one forward-swim test clip | 3 |
| Animation retarget | Apply the generated motion to Saba's rig | 3 |
| **Minimal pilot total** | | **16** |

Published-price estimate checked on 2026-09-19:
https://docs.meshy.ai/en/api/pricing

No task should be submitted before checking the available balance and receiving
explicit approval for these 16 credits.

## Optional expansion after the pilot passes

| Added clip | Motion generation | Retarget | Added credits |
|---|---:|---:|---:|
| Underwater idle / treading water (Swift) | 3 | 3 | 6 |
| Zero-gravity idle / float (Swift) | 3 | 3 | 6 |
| **Full three-motion Saba pilot** | | | **28 total including the minimal pilot** |

Using Prime instead of Swift for all three generated motions would make the full
pilot approximately 49 credits. Prime should only be considered after a Swift
clip proves that the rig deforms correctly.

## Prepared motion prompts

### Forward underwater swim — first paid test

> A stylized elderly man swimming forward underwater with smooth alternating arm strokes and gentle flutter kicks. Natural shoulder, elbow, hip and knee movement. Calm controlled motion, in place, no root translation, cyclic action suitable for a seamless game loop.

### Underwater idle — optional second test

> A stylized elderly man calmly treading water underwater, using small circular arm movements and alternating leg kicks. Gentle buoyant body motion, in place, no root translation, cyclic action suitable for a seamless game loop.

### Zero-gravity idle — optional third test

> A stylized elderly astronaut floating naturally in zero gravity, with slow relaxed arm and leg corrections and subtle torso drift. In place, no root translation, cyclic action suitable for a seamless game loop.

## Acceptance checks before integration

1. Face, glasses, hair and clothing remain recognizably Saba Shimon.
2. No shoulder collapse, elbow inversion, knee bending backward or texture tearing.
3. Hands and feet follow the expected bones.
4. Walk and run do not slide excessively.
5. Swim clip has visible arm and leg propulsion and no baked root travel.
6. The clip can cross-fade cleanly to idle in Three.js.
7. The GLB loads on the Galaxy Tab S6 without a visible frame-rate collapse.
8. Physics capsule and collision rules remain independent from the animated mesh.

If rigging or deformation fails, stop. Do not submit a second paid attempt without
showing the result and receiving a new approval. The fallback is pose cleanup and
weight correction in Blender, or a Mixamo/AccuRIG master skeleton followed by GLB
export.

## Planned output names

- `assets/characters/saba/saba_rigged_master.glb`
- `assets/characters/saba/saba_walk.glb`
- `assets/characters/saba/saba_run.glb`
- `assets/characters/saba/saba_swim_forward.glb`
- `assets/characters/shalev/shalev_rigged_master.glb` (later phase)

