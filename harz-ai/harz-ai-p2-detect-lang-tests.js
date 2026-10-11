const d = require('./detect-lang.js');
const cases = [
  // [input, expected, label]
  ["Why do we see lightning before we hear thunder?", "en", "E1 English question"],
  ["What is the capital of Kano state?", "en", "E2 English question"],
  ["Me ya sa muke jin yunwa?", "ha", "H1 Hausa question"],
  ["Yadda ake dafa wake da shinkafa?", "ha", "H2 Hausa question"],
  ["Sannu da zuwa, kana lafiya?", "ha", "H3 Hausa greeting"],
  ["What is the capital of Nigeria? Answer in Hausa.", "ha", "O1 explicit Hausa override"],
  ["Me ya sa muke jin yunwa? Answer in English.", "en", "O2 explicit English override"],
  ["Amsa da Hausa: what is HARZ AI?", "ha", "O3 Hausa override phrase"],
  ["Kana lafiya? I want to know what HARZ AI can do.", "en", "M1 mixed, dominant English"],
  ["Please amsa min da harshen Hausa game da GDEG?", "ha", "M2 mixed, dominant Hausa"],
  ["What is the UBA account number used for HARZ Pay bank transfers?", "en", "EV evidence question"],
  ["Build me a clock and a calculator.", "en", "MT build (never reaches chatAI)"],
  ["Hello, how are you?", "en", "G1 English greeting"],
];
let pass = 0, fail = 0;
for (const [inp, exp, label] of cases) {
  const got = d(inp);
  const ok = got === exp;
  ok ? pass++ : fail++;
  console.log((ok ? "PASS" : "FAIL") + " " + label + " -> " + got + (ok ? "" : " (expected " + exp + ")"));
}
console.log(pass + "/" + cases.length + " passed, " + fail + " failed");
