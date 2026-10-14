# BATTERY-MISS INVESTIGATION (Team 3, Oct 14) - the 19/20 miss

## Finding: HONEST TIE, not a defect
- Frozen case: query "Monthly Reports", expected doc 34000 (title "Monthly Reports").
- Docs 33392, 33536, 33568 share the IDENTICAL title "Monthly Reports" and rank
  above doc 34000 under BM25 (title+snippet corpus). Same tie documented in the
  earlier E1 battery (4-way title tie, honest miss).
- Sandbox reproduction (Python sqlite 3.40.1, same 5,000 kb5k docs, same frozen
  20 cases, same MATCH + ORDER BY rank LIMIT 3): top1 19/20, top3 19/20 -
  EXACT match with the phone's numbers. Miss case identical.

## Conclusion
- Not a kit defect, not a phone anomaly, not a regression. The frozen case's
  expected doc is one of several identically-titled docs; keyword search cannot
  disambiguate identical titles without more query terms.
- Original phone receipt preserved untouched (on device; transcript in d28d63f).
- This sandbox rerun recorded separately per owner instruction. NO criteria
  change; frozen battery untouched.
- Future option (owner's call, battery version change only): disambiguate the
  case query or accept any-of-tie-set as expected answer.
