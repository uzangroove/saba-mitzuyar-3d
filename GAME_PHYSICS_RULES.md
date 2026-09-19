# Saba Mitzuyar — collision rule

1. Every visible object with physical volume is solid by default.
2. Static scenery receives a fixed Rapier collider that covers the full visible body. A collider must not be materially smaller than its mesh.
3. Moving scenery and creatures use kinematic rigid bodies, and their colliders are synchronized with the rendered position every frame.
4. The player and Shalev collide with static and kinematic bodies. Character-controller queries must not exclude all kinematic bodies.
5. Deliberately non-solid objects must be visual effects or gameplay passages: fog, nebulae, stars, bubbles, flowers, mission rings, the open center of a portal, small fish schools, jellyfish, kelp, floating paper/cloud effects, and paint particles. A bottomless paint river is also non-solid because falling into it intentionally resets the player.
6. A new visible gameplay object is incomplete until its collider or explicit non-solid exception is added and tested.
