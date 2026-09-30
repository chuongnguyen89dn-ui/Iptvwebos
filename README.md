# IPTV webOS

IPTV player for LG webOS TV 4.x+.

## Goals
- TiviMate-inspired 10-foot UI, remote-first
- Multiple M3U/M3U8 sources (not limited to one playlist)
- Source enable/disable, merged channel view, favorites, search
- Direct-first playback with cached fallback decisions
- webOS 4.x (Chromium 53) baseline; progressive enhancement on newer TVs
- HLS native first; resolver/remux/transcode backend hooks for difficult streams

## Current milestone
MVP shell: multi-source manager, M3U parser, merged channel browser, remote navigation and direct HTML5 playback.

## Playback policy
DIRECT -> RESOLVE -> MSE/NATIVE -> REMUX -> TRANSCODE

The last two stages are backend hooks and are only used when direct playback cannot handle the source.

## Development
Open `index.html` in a browser for UI development. The packaged TV app uses only ES5-compatible JavaScript for the webOS 4.x baseline.
