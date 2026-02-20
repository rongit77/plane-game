# Game sounds

Add `.mp3` files here (keep each under ~100KB for fast loading). The game will play them by name.

**Suggested filenames (see `game/sounds.ts` for full list):**

- **Player:** `shoot_basic.mp3`, `shoot_double.mp3`, `shoot_triple.mp3`, `bomb_explode.mp3`, `plane_hit.mp3`, `plane_death.mp3`
- **Pickups:** `coin_collect.mp3`, `powerup_collect.mp3`, `heart_collect.mp3`, `shield_pickup.mp3`
- **Enemies:** `enemy_hit.mp3`, `enemy_destroy.mp3`, `enemy_shoot.mp3`
- **Boss:** `boss_intro.mp3`, `boss_hit.mp3`, `boss_shoot.mp3`, `boss_destroy.mp3`
- **UI:** `menu_click.mp3`, `level_start.mp3`, `level_complete.mp3`, `game_over.mp3`, `victory_final.mp3`
- **Music (loop):** `music_menu.mp3`, `music_gameplay.mp3`, `music_boss.mp3`, `music_victory.mp3`

If a file is missing, the game still runs; that sound is simply skipped.

Generate short effects with [sfxr](https://sfxr.me/) or use royalty-free sources (e.g. freesound.org).
