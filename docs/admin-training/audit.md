# What was checked for this recording

**2026-11-19 • source `6206696` • local development instance, isolated JSON store, no SMTP, synthetic owner/editor and learner.** Scope: operator training, not a penetration test, production delivery test or performance benchmark. No runtime dependencies or app behaviour were changed for the video.

- Compared the owner sidebar in `admin-shell.tsx` with `src/app/admin/(panel)` and visited all 15 destinations after normal password + OTP sign-in. Also opened the mobile menu, the new-course form, all seven existing-course tabs, all 20 Page sections tabs and the 19 collection add dialogs. Captured labels/hints from rendered forms for the [lookup](fields.md).
- Created a test FAQ through the UI and observed the saved row. Sent a synthetic contact payload to the local contact endpoint, opened its enquiry in the UI, saved an internal note, changed status to contacted, then revisited and checked both persisted. Uploaded a bundled brand image and verified its media card offered Copy URL. Created a disposable editor and opened the password-reset form **without** resetting a password.
- Entered a malformed Analytics ID; Save showed “Check the highlighted fields”. Signed out and confirmed that revisiting Settings redirected to `/admin/login`. Role guidance and destructive-action descriptions were checked against the source. No content reset, production email, deletion, or real account management was performed.
- All UI pictures are Chromium captures of this checkout, not generated mock-ups. The edit combines readable holds on the actual controls with a moving FAQ entry/save sequence. Highlights and Roman-Hinglish action cues are editorial overlays; not part of the product. Login is cut around credential entry. No session state, verification code, real student/contact record, raw screen dump or voice stem is included.
- Checked a contact sheet of the captured screens, corrected the new-course frame after waiting for its heading, verified stream metadata and decoded the full final MP4 with FFmpeg. Output: H.264 + mono AAC, 1344×840, 9:45, 10 embedded chapters. Raw intermediate captures and models are intentionally not in Git.

## Production tools and boundaries

| Upstream (revision used) | Role in this edit |
|---|---|
| [brag](https://github.com/latent-spaces/brag/tree/06379432a9243c951dfcc051153be18d2d261044) | Used the inspect → real UI → action → result planning method. No launch pitch, soundtrack or synthetic product UI. |
| [OmniVoice](https://github.com/k2-fsa/OmniVoice/tree/08be0b4ccbac3e13e374e86fbfead4b4cac343e2) | Checked its Hindi language mapping and female voice-design vocabulary. Model weights were not run: this session's feminine Hindi speech renderer generated the ten Hinglish takes with one voice, not a voice clone. |
| [VoiceStudio](https://github.com/debpalash/VoiceStudio/tree/8f6c113433faa1c39d0584534d7d20f469a2a419) | Used `services.longform_render.build_loudnorm_filter('podcast')` to level the joined narration for playback. No VoiceStudio server or cloud service required to watch. |
| [FreeVideo](https://github.com/FlashML-org/FreeVideo/tree/cbc8d2188e6fc09fd08ccc1f4d52947b1d3715e6) | Used the standalone `editor_export_options.validate` helper's high-quality MP4 encoder settings. No video diffusion or generated screens. |
| [cinematic-skill](https://github.com/Moh4696/cinematic-skill/tree/bf435561c6203f90f971300efe952b68b5ec3417) | Used `make_beats.py` against the measured chapter audio/cue timing. Screen holds follow the voice, rather than speeding up the lesson to a marketing length. |

The finished MP4 is the distribution artifact. Viewers do not need to install these tools, run a model, or connect a service.
