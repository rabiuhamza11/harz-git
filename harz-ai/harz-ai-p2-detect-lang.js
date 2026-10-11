function detectReplyLanguage(msg) {
  var m = (msg || "").toLowerCase();
  if (m.match(/\b(?:answer|reply|respond|write|talk|speak)\s+(?:da\s+|in\s+|with\s+)?hausa\b/) || m.match(/\bamsa\s+da\s+hausa\b/)) return "ha";
  if (m.match(/\b(?:answer|reply|respond|write|talk|speak)\s+(?:in\s+|with\s+|using\s+)?english\b/) || m.match(/\bamsa\s+da\s+turanci\b/) || m.match(/\bin\s+english\b/)) return "en";
  var words = m.replace(/[^a-z\s']/g, " ").split(/\s+/).filter(Boolean);
  var HA = {"sannu":1,"zuwa":1,"lafiya":1,"gode":1,"madalla":1,"yaya":1,"meyaya":1,"domin":1,"idan":1,"sai":1,"kuma":1,"yadda":1,"wanda":1,"wanene":1,"gare":1,"gida":1,"rana":1,"dare":1,"kudi":1,"aiki":1,"gona":1,"kana":1,"kake":1,"kuke":1,"kuna":1,"take":1,"tana":1,"suna":1,"zan":1,"zai":1,"za":1,"haka":1,"toh":1,"walahi":1,"wannan":1,"wancan":1,"duka":1,"komai":1,"amsa":1,"tambaya":1,"harshe":1,"turanci":1,"hausa":1,"kasa":1,"jihar":1,"dafa":1,"wake":1,"shinkafa":1,"gyada":1,"cikin":1,"daga":1,"wajen":1,"lokaci":1,"yau":1,"gobe":1,"jiya":1,"kaza":1,"shanu":1,"akuya":1,"kifi":1,"ruwa":1,"wuta":1,"iska":1,"da":1,"ne":1,"ka":1,"ki":1,"na":1,"ba":1,"ga":1,"ke":1,"ya":1,"ta":1,"mun":1,"sun":1,"ko":1,"muke":1,"muka":1,"ake":1,"ji":1,"jin":1,"yunwa":1,"dake":1,"maganar":1,"magana":1};
  var EN = {"the":1,"is":1,"are":1,"was":1,"were":1,"what":1,"when":1,"where":1,"why":1,"how":1,"who":1,"whom":1,"which":1,"you":1,"your":1,"my":1,"we":1,"they":1,"this":1,"that":1,"these":1,"those":1,"of":1,"to":1,"for":1,"and":1,"or":1,"but":1,"do":1,"does":1,"did":1,"can":1,"could":1,"will":1,"would":1,"please":1,"tell":1,"about":1,"want":1,"know":1,"need":1,"get":1,"have":1,"has":1,"it":1,"he":1,"she":1,"there":1,"here":1,"best":1,"good":1,"time":1,"account":1,"number":1,"bank":1,"transfer":1,"wallet":1,"price":1,"phone":1,"school":1,"farm":1,"money":1,"president":1,"capital":1,"lightning":1,"thunder":1,"hear":1,"see":1,"before":1,"after":1,"build":1,"make":1,"create":1,"i":1};
  var ha = 0, en = 0, i;
  for (i = 0; i < words.length; i++) {
    var w = words[i];
    if (HA[w]) ha++; else if (EN[w]) en++;
  }
  if (m.match(/\bme\s+(ya|ake|ke|yake)\b/)) ha += 3;
  return ha > en ? "ha" : "en";
}
module.exports = detectReplyLanguage;
