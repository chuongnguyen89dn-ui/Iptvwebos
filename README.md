# IPTV webOS

IPTV player for LG webOS TV 4.x+.

## Product direction
- Remote-first IPTV experience inspired by the interaction model of leading TV IPTV players.
- Live TV visual system and three-pane browser adapted from the MIT-licensed Ultra TV project: categories → channels → live preview / now-next.
- Multiple M3U/M3U8 sources, merged channels, favorites and search.
- Multi-engine playback designed to cover HLS, dynamic IPTV URLs and MPEG-TS today, with DASH/MP4/codec-aware routing next.
- webOS-native/direct playback when appropriate; resolver/remux/transcode fallback for difficult streams.

## Current milestone — 0.2.0
- AMOLED TV UI with red accent and 1920×1080 layout.
- Category pane, numbered channel rows, logos, focus preview, live badge and now/next area.
- Remote/D-pad focus navigation retained.
- HLS through HLS.js/MSE.
- Dynamic URLs probed by the backend.
- MPEG-TS can be remuxed by FFmpeg to HLS, then automatically transcoded to H.264/AAC if remux fails.
- Debug playback telemetry remains available through the backend but is no longer the visual focus of the Live TV screen.

## Playback policy
PROBE → DIRECT/MSE when compatible → REMUX → TRANSCODE → NATIVE fallback.

The goal is broad format coverage similar in behavior to mature IPTV clients, implemented with webOS-compatible engines. TiviMate is a product/behavior reference only; no proprietary TiviMate source code is included.

## UI attribution
Ultra TV is MIT licensed. See `THIRD_PARTY_NOTICES.md` for attribution and license text.

## Development
Open `index.html` in a browser for UI development. The packaged TV app uses ES5-compatible JavaScript for the webOS 4.x baseline.

## Validation
Every push runs JavaScript syntax checks and an M3U parser smoke test in GitHub Actions.
