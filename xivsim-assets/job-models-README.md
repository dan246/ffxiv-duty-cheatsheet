# 白髮男性拉拉肥・改製賢者模型 / Remodelled Sage avatar

`models/characters/players/sge_training.glb` combines the detailed, textured XIVSim White Mage character base with newly constructed Sage-inspired equipment. It replaces the earlier block-shaped procedural prototype.

The detailed character face, clothing geometry, embedded textures, skin weights, and rig come from `https://cdn.xivsim.com/models/characters/players/whm_noanim.glb`. Those source assets retain their original ownership and usage terms; this package does not claim ownership or grant a new license to them. It is a derivative training model, not an official or exact Final Fantasy XIV Sage model, and not a wholly original character.

Original additions are four floating instruments with curved porcelain armor plates, six luminous channels, gold engraving and collars, faceted crystal tips, and paired aether rings. Cloth materials receive a cool ivory/teal tint while preserving texture detail. Facial textures remain unchanged. The inherited c1201 face is remodelled toward a masculine Lalafell appearance with a broader jaw/chin, a more defined brow ridge, and reduced lash-card prominence. This is a custom appearance conversion, not an original c1101 male head asset. The White Mage hood and hair bow are removed; the existing hair geometry is cropped short and its material changed to white while preserving surface detail. The hood-hidden crown is restored from the matching full hairstyle in `https://cdn.xivsim.com/models/characters/players/pld_noanim.glb`; its joint order is verified identical before attaching it to the retained skin.

- Self-contained GLB 2.0; all 19 WHM source images remain embedded, plus the matching PLD crown normal map, with no external resource dependencies.
- Preserves source texture resources and the original skin; the hood is excluded from the scene and the hair accessory is excluded from the hair mesh. Adds 28 unique equipment meshes instanced four times.
- +Y up, −Z forward, feet grounded at Y=0; detailed character height 1.4 units.
- Integrate at scale 1, not the scale 2 used for the unmodified XIVSim models.
- No locomotion clips are included; original character skin/rig is retained. The simulator can position and pose the model as a whole.
- Source URL and SHA-256 are recorded in the GLB metadata.
- Regenerate with `python3 work/uwu-job-models/build-training-models.py`; source is `work/uwu-job-models/whm_noanim.glb`.
- `preview.html` renders the actual embedded textures using the project's Three.js r128 files when served from the workspace root.
