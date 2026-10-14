# CORRECTION + RETRACTION — health-v2 font census (this seat, Oct 14 ~08:4x WAT)
This seat RETRACTS its own fa8e618 measurement ("rendering-path external
fonts = 0 in health; embedded data-fonts = 3") and CORRECTS the record.

## What was wrong
Both my fa8e618 scan AND the aeab53e settlement ("0, confirmed from two
seats; all 37 @font-face blocks carry data URIs") used quote-RESTRICTED
patterns — url("...") double-quoted only. health-v2's CSS uses UNQUOTED
url(https://...) forms. Two seats agreed because the two scanners shared
the SAME blind spot: correlated errors, not independent confirmation.
"Confirmed from two seats" is only valid when the implementations differ
on the assumption being tested.

## Correct measurement (quote-agnostic url() matcher, committed blob 63750cdf)
health-v2: 105 @font-face blocks in embedded styles:
- 51 with embedded data: URIs (the sibling's 37 and my 3 were both
  undercounts of THIS object; 51 is the block count)
- 54 with EXTERNAL src urls — ALL to moh.dotmac.ng
  (wp-content/uploads/elementor/google-fonts/fonts/...), i.e. live
  rendering-path external font dependencies. OFFLINE these fail → font
  variants fall back → measurable visual degradation risk.
=> THE ORIGINAL e929b8c CENSUS CLAIM ("health 54 rendering-path external
fonts") WAS CORRECT and must NOT be reclassified as documentation-based
counting. The ledger entry should read: health-v2 external CSS class
(60/61 links) AND rendering-path external fonts 54 (moh.dotmac.ng
@font-face srcs) — both dependency classes present.
Cross-pack (same quote-agnostic scan): immigration-v3 8 blocks all data
(0 external) ✓ | nimc-v3 4 blocks all data ✓ | cac-v2 0 ✓. Only health
carries the external-font class.

## Object vocabulary (per the enforced discipline)
- "@font-face blocks": 105 (health)
- "blocks with data: src": 51 (health)
- "blocks with external http src": 54 (health) — the defect object
- The three font counts 3 / 37 / 55 recorded earlier were artifacts of
  quote-restricted or window-limited patterns; 51 / 54 / 105 are the
  quote-agnostic numbers with objects named.

## Scanner law going forward (third blind spot of this audit: href, then
comment-window, now quote-form)
The Wave-1 scanner revision must enumerate url( and src=/href= in ALL
quote forms (double, single, unquoted) and must treat agreement between
two scanners as independent ONLY if their tokenization assumptions
differ. A shared assumption is a shared blind spot.

No repairs, nothing merged, packs untouched. This correction is filed
BEFORE the consolidated Wave-1 ledger assembles, so the wrong "0
confirmed from two seats" entry does not harden into fact.
