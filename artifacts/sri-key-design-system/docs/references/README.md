# Source references

The visual and product-language source is the public repository
[Lakmal2078/Unexpected-Keyboard](https://github.com/Lakmal2078/Unexpected-Keyboard),
read at commit `b2511831bcbb84cff1e15489be98e62d77c3911f` (2026-11-02).

| Source file | What was used |
| --- | --- |
| `res/values/themes.xml` — `SinhalaSand` | Light surfaces, key colors, label colors, and rounded-key proportions |
| `res/values/themes.xml` — `LankaMaroon` | Dark maroon surfaces, gold active keys, and border colors |
| `res/xml/settings.xml` and `srcs/java/juloo/keyboard2/Config.java` | The source's default theme and separate keyboard configuration choices |
| `docs/SINHALA_ARCHITECTURE.md` | The distinction between phonetic transliteration and the physical Sinhala layout |
| `CONTRIBUTING.md` and `doc/Custom-layouts.md` | Edge reachability and tap/swipe layout guidance |

The repository states that it is licensed under GNU GPL-3.0. This design system
records color values and summarizes documented guidance; it does not copy the
repository's application code. Its launcher icon was not adopted because it
identifies Unexpected Keyboard rather than Sri Key. No logo or UI font was
provided for the Sri Key identity.

The source does not specify a separate light/dark pair. Sinhala Sand and Lanka
Maroon are paired here as the corresponding light and dark palettes. Supporting
semantic colors and chart roles are derived for the DTCG token schema. Ordinary
source labels use Android system typefaces; the bundled font is for special key
glyphs only. The preview uses the open Inter and Noto Sinhala font families.
