import { useState } from "react";

const F = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@200;300;400;500&display=swap');`;

const IMG = {
  hero:     "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80",
  cosmos:   "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80",
  ibiza:    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80",
  journal:  "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=900&q=80",
  couple:   "https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=900&q=80",
  child:    "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=900&q=80",
  career:   "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=900&q=80",
  calendar: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=80",
  med:      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=900&q=80",
  stars:    "https://images.unsplash.com/photo-1464802686167-b939a6910659?w=1200&q=80",
};

// ─── Reports ──────────────────────────────────────────────────────────────────
const REPORTS = [
  {
    id:"volledig", icon:"✦", color:"#2C3E50", tag:"Meest gekozen",
    title:"Volledig Human Design Rapport",
    price:"€75", sub:"Eenmalig · Direct als PDF",
    tagline:"Jouw complete persoonlijke blauwdruk",
    intro:"Het meest uitgebreide rapport dat wij aanbieden. Een volledige analyse van jouw Human Design chart — van Type en Autoriteit tot Inkarnatie-Kruis en praktische levensguidance.",
    includes:[
      "Type, Strategie & Signature",
      "Autoriteit — hoe jij beslissingen neemt",
      "Profiel — het verhaal van jouw leven",
      "Alle 9 centra geanalyseerd",
      "Actieve kanalen & krachten",
      "Poorten — jouw natuurlijke kwaliteiten",
      "Inkarnatie-Kruis — jouw levensdoel",
      "Relaties & werk vanuit jouw design",
      "Praktische guidance 2025–2027",
    ],
    for:"Voor iedereen die een diepgaand en volledig inzicht wil in hun Human Design.",
    sections:12, pages:"30+",
    img: null,
    prompt_extra:"Schrijf een volledig Human Design rapport.\n### 1. Jouw Energetische Blauwdruk\n### 2. Type & Levensstrategie\n### 3. Autoriteit\n### 4. Profiel\n### 5. Gedefinieerde Centra\n### 6. Open Centra & Conditionering\n### 7. Actieve Kanalen\n### 8. Jouw Poorten\n### 9. Inkarnatie-Kruis\n### 10. Relaties & Verbinding\n### 11. Praktische Guidance 2025–2027\n### 12. Slotanalyse",
  },
  {
    id:"relatie", icon:"◎", color:"#6B4F7A", tag:"",
    title:"Relatierapport",
    price:"€95", sub:"Eenmalig · Direct als PDF",
    tagline:"Twee designs naast elkaar geanalyseerd",
    intro:"Een analyse van twee volledige Human Design charts. Hoe opereren jullie energetisch samen — waar vullen jullie elkaar aan en waar ontstaat wrijving?",
    includes:[
      "Beide charts volledig geanalyseerd",
      "Elektromagnetische verbindingen",
      "Compatibiliteit van Types & Strategieën",
      "Communicatiepatronen per persoon",
      "Conflictpatronen & hoe ze te doorbreken",
      "Gezamenlijk levensdoel",
      "Praktisch advies voor meer harmonie",
    ],
    for:"Voor koppels of zakenpartners die hun samenwerking beter willen begrijpen.",
    sections:9, pages:"25+",
    img: null,
    needsPartner: true,
    prompt_extra:"Schrijf een Human Design Relatierapport.\n### 1. De Energie van Jullie Verbinding\n### 2. Chart Analyse — Persoon 1\n### 3. Chart Analyse — Persoon 2\n### 4. Elektromagnetische Verbindingen\n### 5. Compatibiliteit\n### 6. Communicatie & Conflictpatronen\n### 7. Groeigebieden\n### 8. Gezamenlijk Levensdoel\n### 9. Praktisch Advies",
  },
  {
    id:"jaar", icon:"◈", color:"#B5813A", tag:"",
    title:"Jaarrapport 2025",
    price:"€55", sub:"Eenmalig · Direct als PDF",
    tagline:"De energetische thema's van jouw jaar",
    intro:"Gebaseerd op jouw Solar Return — de terugkeer van de zon naar haar exacte positie op jouw geboortedag. Wat zijn de dominante thema's en kansen van jouw nieuwe levensjaar?",
    includes:[
      "Solar Return analyse",
      "Dominante thema's voor 2025",
      "Kwartaal-voor-kwartaal overzicht",
      "Planetaire invloeden op jouw chart",
      "Kansen en aandachtspunten",
      "Intentie & focus voor het jaar",
    ],
    for:"Voor wie het jaar bewust en gericht wil ingaan.",
    sections:9, pages:"20+",
    img: null,
    prompt_extra:"Schrijf een Human Design Jaarrapport 2025.\n### 1. Energie van Jouw Nieuw Levensjaar\n### 2. Solar Return Analyse\n### 3. Dominante Thema's\n### 4. Kwartaal 1\n### 5. Kwartaal 2\n### 6. Kwartaal 3\n### 7. Kwartaal 4\n### 8. Kansen & Uitdagingen\n### 9. Intentie voor het Jaar",
  },
  {
    id:"kind", icon:"◇", color:"#4A7A5A", tag:"",
    title:"Kinderrapport",
    price:"€45", sub:"Eenmalig · Direct als PDF",
    tagline:"Jouw kind begrijpen vanuit zijn of haar design",
    intro:"Een rapport voor ouders. Hoe gebruikt jouw kind energie, hoe neemt het beslissingen en hoe leert het het beste? Geen projecties — wie is jouw kind werkelijk?",
    includes:[
      "Type & energiegebruik van jouw kind",
      "Hoe jouw kind beslissingen neemt",
      "Leerstijl & communicatie",
      "Behoeften & grenzen",
      "Opvoedtips op maat",
      "Gaven & talenten",
    ],
    for:"Voor ouders die hun kind willen begeleiden op basis van wie het werkelijk is.",
    sections:10, pages:"22+",
    img: null,
    needsChild: true,
    prompt_extra:"Schrijf een Human Design Kinderrapport.\n### 1. Het Unieke Design van Jouw Kind\n### 2. Type & Energie\n### 3. Beslissingen Nemen\n### 4. Hoe Jouw Kind Leert\n### 5. Behoeften & Grenzen\n### 6. Centra Analyse\n### 7. Opvoedtips Op Maat\n### 8. Gaven & Talenten\n### 9. Relatie Ouder-Kind\n### 10. Slotanalyse",
  },
  {
    id:"loopbaan", icon:"◆", color:"#2A5F7A", tag:"",
    title:"Loopbaan & Geld Rapport",
    price:"€65", sub:"Eenmalig · Direct als PDF",
    tagline:"Werk en financiën vanuit jouw design",
    intro:"Hoe maak jij geld op een manier die bij jou past? Welke werkomgeving geeft jou energie? Dit rapport richt zich volledig op werk, business en financiën.",
    includes:[
      "Jouw ideale werkomgeving",
      "Hoe jij geld aantrekt",
      "Jouw professionele kracht",
      "Samenwerking & leiderschap",
      "Valkuilen op de werkvloer",
      "Ondernemen vs. loondienst",
      "Financiële strategie op maat",
    ],
    for:"Voor iedereen die wil werken en verdienen in lijn met wie zij zijn.",
    sections:9, pages:"22+",
    img: null,
    prompt_extra:"Schrijf een Human Design Loopbaan & Geld Rapport.\n### 1. Professionele Blauwdruk\n### 2. Ideale Werkomgeving\n### 3. Hoe Jij Geld Aantrekt\n### 4. Jouw Professionele Kracht\n### 5. Samenwerking & Leiderschap\n### 6. Valkuilen\n### 7. Ondernemen vs. Loondienst\n### 8. Financiële Strategie\n### 9. Volgende Stap",
  },
  {
    id:"numerologie", icon:"∞", color:"#5A3E6B", tag:"",
    title:"Numerologie Rapport",
    price:"€65", sub:"Eenmalig · Direct als PDF",
    tagline:"De getallen achter jouw naam en geboortedag",
    intro:"Op basis van jouw volledige naam en geboortedatum berekenen wij 8 kerngetallen die samen een diepgaand beeld geven van jouw aard, gaven en levensdoel.",
    includes:[
      "Levenspadgetal — jouw hoofdthema",
      "Uitdrukkingsgetal — jouw gaven",
      "Zielsgetal — wat jij verlangt",
      "Persoonlijkheidsgetal — hoe anderen jou zien",
      "Verjaardagsgetal — jouw bijzondere gave",
      "Persoonlijk jaar 2025",
      "Rijpingsgetal — wie jij wordt",
      "Mastergetallen indien aanwezig",
    ],
    for:"Voor iedereen die de diepere betekenis van naam en geboortedag wil begrijpen.",
    sections:12, pages:"28+",
    img: null,
    prompt_extra:"Schrijf een volledig Numerologie Rapport.\n### 1. Jouw Numerologische Blauwdruk\n### 2. Levenspadgetal\n### 3. Uitdrukkingsgetal\n### 4. Zielsgetal\n### 5. Persoonlijkheidsgetal\n### 6. Verjaardagsgetal\n### 7. Persoonlijk Jaar 2025\n### 8. Rijpingsgetal\n### 9. Mastergetallen & Bijzondere Patronen\n### 10. Hoe Jouw Getallen Samenwerken\n### 11. Praktische Guidance 2025–2027\n### 12. Slotanalyse",
  },
  {
    id:"horoscoop", icon:"☽", color:"#2C4A6B", tag:"",
    title:"Geboortehoroscoop",
    price:"€75", sub:"Eenmalig · Direct als PDF",
    tagline:"Jouw complete astrologische chart",
    intro:"Een volledige geboortehoroscoop op basis van de exacte posities van alle planeten op het moment van jouw geboorte. Ascendant, huizen, planeetstanden en aspecten.",
    includes:[
      "Zonneteken — jouw kern",
      "Ascendant — hoe jij overkomt",
      "Maan — jouw emotionele wereld",
      "Alle 10 planeten in teken & huis",
      "12 huizen geanalyseerd",
      "Belangrijkste aspecten",
      "Midhemel — jouw roeping",
      "Dominant element & modaliteit",
    ],
    for:"Voor wie wil begrijpen hoe de sterren stonden op hun geboortemoment.",
    sections:12, pages:"30+",
    img: null,
    prompt_extra:"Schrijf een volledig geboortehoroscoop rapport.\n### 1. Jouw Astrologische Blauwdruk\n### 2. Zonneteken\n### 3. Ascendant\n### 4. De Maan\n### 5. Mercurius, Venus & Mars\n### 6. Jupiter & Saturnus\n### 7. De Buitenste Planeten\n### 8. De Huizen\n### 9. Belangrijkste Aspecten\n### 10. Midhemel & Roeping\n### 11. Guidance 2025–2027\n### 12. Slotanalyse",
  },
  {
    id:"maandelijks", icon:"◯", color:"#2C3E50", tag:"Abonnement",
    title:"Maandelijkse Guidance",
    price:"€19/mnd", sub:"Maandelijks opzegbaar",
    tagline:"Elke maand jouw persoonlijke energiegids",
    intro:"Elke maand een persoonlijk rapport over de energetische thema's van die maand, specifiek afgestemd op jouw Human Design chart.",
    includes:[
      "Energie & thema's van de maand",
      "Planetaire invloeden op jouw chart",
      "Kansen & aandachtspunten",
      "Praktisch advies",
      "Intentie voor de maand",
    ],
    for:"Voor wie maandelijks bewust wil leven in lijn met hun design.",
    sections:6, pages:"10+",
    img: null,
    prompt_extra:"Schrijf een Human Design Maandrapport.\n### 1. Energie van Deze Maand\n### 2. Planetaire Invloeden\n### 3. Wat Er van Jou Gevraagd Wordt\n### 4. Kansen\n### 5. Aandachtspunten\n### 6. Intentie voor de Maand",
  },
];

// ─── Ephemeris ────────────────────────────────────────────────────────────────
function jday(y,m,d,h){if(m<=2){y--;m+=12;}const A=Math.floor(y/100),B=2-A+Math.floor(A/4);return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+h/24+B-1524.5;}
function sunLon(jd){const T=(jd-2451545)/36525,L=280.46646+36000.76983*T,M=357.52911+35999.05029*T,Mr=M*Math.PI/180,C=(1.914602-0.004817*T)*Math.sin(Mr)+(0.019993-0.000101*T)*Math.sin(2*Mr)+0.000289*Math.sin(3*Mr);return((L+C)%360+360)%360;}
function moonLon(jd){const T=(jd-2451545)/36525,L=218.3165+481267.8813*T,Mp=134.9634+477198.8676*T,D=297.8502+445267.1115*T,F=93.2721+483202.0175*T,Mpr=Mp*Math.PI/180,Dr=D*Math.PI/180,Fr=F*Math.PI/180;return((L+6.2888*Math.sin(Mpr)+1.274*Math.sin(2*Dr-Mpr)+0.6583*Math.sin(2*Dr)+0.2136*Math.sin(2*Mpr)-0.1143*Math.sin(2*Fr))%360+360)%360;}
function plon(jd,p){const T=(jd-2451545)/36525,m={Mercury:[252.2509,149472.6674],Venus:[181.9798,58517.8156],Mars:[355.433,19140.2993],Jupiter:[34.3515,3034.9057],Saturn:[50.0774,1222.1138],Uranus:[314.055,428.4048],Neptune:[304.348,218.4862],Pluto:[238.929,145.2001]};const[a,b]=m[p]||[0,0];return((a+b*T)%360+360)%360;}
function getPL(jd,p){if(p==="Sun")return sunLon(jd);if(p==="Moon")return moonLon(jd);return plon(jd,p);}

// ─── HD Engine ────────────────────────────────────────────────────────────────
const GS=[41,19,13,49,30,55,37,63,22,36,25,17,21,51,42,3,27,24,2,23,8,20,16,35,45,12,15,52,39,53,62,56,31,33,7,4,29,59,40,64,47,6,46,18,48,57,32,50,28,44,1,43,14,34,9,5,26,11,10,58,38,54,61,60];
const PLANETS_HD=["Sun","Moon","Mercury","Venus","Mars","Jupiter","Saturn","Uranus","Neptune","Pluto"];
const ALL_C=["Head","Ajna","Throat","G/Self","Heart/Ego","Sacral","Solar Plexus","Spleen","Root"];
const CH={"64-47":["Head","Ajna"],"61-24":["Head","Ajna"],"63-4":["Head","Ajna"],"17-62":["Ajna","Throat"],"43-23":["Ajna","Throat"],"11-56":["Ajna","Throat"],"35-36":["Throat","Solar Plexus"],"12-22":["Throat","Solar Plexus"],"45-21":["Throat","Heart/Ego"],"33-13":["Throat","G/Self"],"8-1":["Throat","G/Self"],"31-7":["Throat","G/Self"],"20-10":["Throat","G/Self"],"20-34":["Throat","Sacral"],"16-48":["Throat","Spleen"],"25-51":["G/Self","Heart/Ego"],"46-29":["G/Self","Sacral"],"2-14":["G/Self","Sacral"],"15-5":["G/Self","Sacral"],"10-34":["G/Self","Sacral"],"10-57":["G/Self","Spleen"],"26-44":["Heart/Ego","Spleen"],"40-37":["Heart/Ego","Solar Plexus"],"51-25":["Heart/Ego","G/Self"],"21-45":["Heart/Ego","Throat"],"5-15":["Sacral","G/Self"],"14-2":["Sacral","G/Self"],"29-46":["Sacral","G/Self"],"34-10":["Sacral","G/Self"],"34-20":["Sacral","Throat"],"34-57":["Sacral","Spleen"],"59-6":["Sacral","Solar Plexus"],"9-52":["Sacral","Root"],"3-60":["Sacral","Root"],"42-53":["Sacral","Root"],"27-50":["Sacral","Spleen"],"36-35":["Solar Plexus","Throat"],"22-12":["Solar Plexus","Throat"],"37-40":["Solar Plexus","Heart/Ego"],"6-59":["Solar Plexus","Sacral"],"49-19":["Solar Plexus","Root"],"55-39":["Solar Plexus","Root"],"30-41":["Solar Plexus","Root"],"48-16":["Spleen","Throat"],"57-34":["Spleen","Sacral"],"57-10":["Spleen","G/Self"],"44-26":["Spleen","Heart/Ego"],"50-27":["Spleen","Sacral"],"32-54":["Spleen","Root"],"28-38":["Spleen","Root"],"18-58":["Spleen","Root"],"53-42":["Root","Sacral"],"60-3":["Root","Sacral"],"52-9":["Root","Sacral"],"19-49":["Root","Solar Plexus"],"39-55":["Root","Solar Plexus"],"41-30":["Root","Solar Plexus"],"38-28":["Root","Spleen"],"54-32":["Root","Spleen"],"58-18":["Root","Spleen"]};
const PROFS={"1-2":"1/2 Onderzoeker/Kluizenaar","1-3":"1/3 Onderzoeker/Martelaar","2-4":"2/4 Kluizenaar/Opportunist","2-5":"2/5 Kluizenaar/Ketter","3-5":"3/5 Martelaar/Ketter","3-6":"3/6 Martelaar/Rolmodel","4-6":"4/6 Opportunist/Rolmodel","4-1":"4/1 Opportunist/Onderzoeker","5-1":"5/1 Ketter/Onderzoeker","5-2":"5/2 Ketter/Kluizenaar","6-2":"6/2 Rolmodel/Kluizenaar","6-3":"6/3 Rolmodel/Martelaar"};

function lonToGL(lon){lon=((lon%360)+360)%360;const gs=360/64,idx=Math.floor(lon/gs),gate=GS[idx%64],line=Math.min(Math.floor(((lon%gs)/gs)*6)+1,6);return[gate,line];}

function calcHD(y,m,d,h,min){
  const jdP=jday(y,m,d,h+min/60),jdD=jdP-(88/360)*365.25;
  const pers={},des={};
  for(const p of PLANETS_HD){const[gp,lp]=lonToGL(getPL(jdP,p));pers[p]={gate:gp,line:lp};const[gd,ld]=lonToGL(getPL(jdD,p));des[p]={gate:gd,line:ld};}
  const allG=new Set([...Object.values(pers).map(x=>x.gate),...Object.values(des).map(x=>x.gate)]);
  const defC=new Set();const channels=[];
  for(const[k,[c1,c2]]of Object.entries(CH)){const[g1,g2]=k.split("-").map(Number);if(allG.has(g1)&&allG.has(g2)){defC.add(c1);defC.add(c2);channels.push({g1,g2,c1,c2});}}
  const openC=ALL_C.filter(c=>!defC.has(c));
  const hasSac=defC.has("Sacral"),hasThr=defC.has("Throat"),hasMotor=["Heart/Ego","Solar Plexus","Root"].some(x=>defC.has(x));
  let type,strat,sig,notSelf;
  if(hasSac&&hasThr){type="Manifesting Generator";strat="Informeer, reageer dan vanuit het sacraal";sig="Bevrediging & Vrede";notSelf="Frustratie & Woede";}
  else if(hasSac){type="Generator";strat="Wacht om te reageren";sig="Bevrediging";notSelf="Frustratie";}
  else if(hasThr&&hasMotor){type="Manifestor";strat="Informeer voor je handelt";sig="Vrede";notSelf="Woede";}
  else if(defC.size===0){type="Reflector";strat="Wacht een maancyclus";sig="Verrassing";notSelf="Teleurstelling";}
  else{type="Projector";strat="Wacht op de uitnodiging";sig="Succes";notSelf="Bitterheid";}
  let auth="Mentaal";
  if(defC.has("Solar Plexus"))auth="Emotioneel";else if(defC.has("Sacral"))auth="Sacraal";else if(defC.has("Spleen"))auth="Splenisch";else if(defC.has("Heart/Ego"))auth="Ego";else if(defC.has("G/Self"))auth="G/Self";else if(defC.size===0)auth="Maancyclus";
  const profKey=pers.Sun.line+"-"+des.Sun.line,profile=PROFS[profKey]||profKey;
  const pEl=(getPL(jdP,"Sun")+180)%360,dEl=(getPL(jdD,"Sun")+180)%360;
  const cross=pers.Sun.gate+" / "+lonToGL(pEl)[0]+" / "+des.Sun.gate+" / "+lonToGL(dEl)[0];
  return{type,strat,sig,notSelf,auth,profile,cross,definedCenters:[...defC],openCenters:openC,allGates:[...allG].sort((a,b)=>a-b),channels,pers,des};
}

// ─── Numerology Engine ────────────────────────────────────────────────────────
const PYTH={A:1,B:2,C:3,D:4,E:5,F:6,G:7,H:8,I:9,J:1,K:2,L:3,M:4,N:5,O:6,P:7,Q:8,R:9,S:1,T:2,U:3,V:4,W:5,X:6,Y:7,Z:8};
const VOWELS_SET=new Set(["A","E","I","O","U"]);
const NUM_NAMES={1:"De Leider",2:"De Diplomaat",3:"De Creatieveling",4:"De Bouwer",5:"De Avonturier",6:"De Verzorger",7:"De Zoeker",8:"De Zakenman",9:"De Mensheid",11:"De Meester Intuïtief",22:"De Meester Bouwer",33:"De Meester Leraar"};
const NUM_KW={1:"Leiderschap, onafhankelijkheid",2:"Diplomatie, samenwerking",3:"Creativiteit, expressie",4:"Discipline, structuur",5:"Vrijheid, avontuur",6:"Zorg, verantwoordelijkheid",7:"Spiritualiteit, analyse",8:"Succes, materialisme",9:"Humanitarisme, afsluiting",11:"Intuïtie, inspiratie",22:"Manifestatie, bouwen",33:"Liefde, healing"};
function numReduce(n){while(n>9){if(n===11||n===22||n===33)break;n=[...String(n)].reduce((a,d)=>a+parseInt(d),0);}return n;}
function nameSum(str){return[...str.toUpperCase()].reduce((a,c)=>a+(PYTH[c]||0),0);}
function calcNumerology(fullName,day,month,year){
  const lp=numReduce(numReduce(day)+numReduce(month)+numReduce(year));
  const exp=numReduce(nameSum(fullName));
  const vowels=[...fullName.toUpperCase()].filter(c=>VOWELS_SET.has(c)).join("");
  const cons=[...fullName.toUpperCase()].filter(c=>c>="A"&&c<="Z"&&!VOWELS_SET.has(c)).join("");
  const soul=numReduce(nameSum(vowels));
  const pers=numReduce(nameSum(cons));
  const bday=numReduce(day);
  const py=numReduce(numReduce(day)+numReduce(month)+numReduce(2025));
  const mat=numReduce(lp+exp);
  const initials=fullName.split(" ").filter(Boolean).map(w=>w[0]||"").join("");
  const bal=numReduce(nameSum(initials));
  const masters=[lp,exp,soul,pers,mat].filter(n=>n===11||n===22||n===33);
  return{lp,exp,soul,pers,bday,py,mat,bal,masters,lpName:NUM_NAMES[lp]||"",expName:NUM_NAMES[exp]||"",soulName:NUM_NAMES[soul]||"",lpKw:NUM_KW[lp]||"",expKw:NUM_KW[exp]||"",soulKw:NUM_KW[soul]||""};
}

// ─── Astrology Engine ─────────────────────────────────────────────────────────
const SIGNS_NL=["Ram","Stier","Tweelingen","Kreeft","Leeuw","Maagd","Weegschaal","Schorpioen","Boogschutter","Steenbok","Waterman","Vissen"];
const SIGN_KW_A={"Ram":"initiatief, moed","Stier":"standvastigheid, genot","Tweelingen":"communicatie, nieuwsgierigheid","Kreeft":"gevoel, intuïtie","Leeuw":"drama, leiderschap","Maagd":"analyse, perfectie","Weegschaal":"harmonie, schoonheid","Schorpioen":"intensiteit, diepgang","Boogschutter":"vrijheid, avontuur","Steenbok":"discipline, ambitie","Waterman":"originaliteit, idealisme","Vissen":"intuïtie, mededogen"};
const EL_MAP_A={"Ram":"Vuur","Stier":"Aarde","Tweelingen":"Lucht","Kreeft":"Water","Leeuw":"Vuur","Maagd":"Aarde","Weegschaal":"Lucht","Schorpioen":"Water","Boogschutter":"Vuur","Steenbok":"Aarde","Waterman":"Lucht","Vissen":"Water"};
function lonToSign_A(lon){lon=((lon%360)+360)%360;const idx=Math.floor(lon/30)%12;return{sign:SIGNS_NL[idx],degree:Math.round((lon%30)*10)/10,keywords:SIGN_KW_A[SIGNS_NL[idx]]||""};}
function calcHoroscoop(y,m,d,h,min){
  const jdP=jday(y,m,d,h+min/60);
  const pDefs={Zon:"Sun",Maan:"Moon",Mercurius:"Mercury",Venus:"Venus",Mars:"Mars",Jupiter:"Jupiter",Saturnus:"Saturn",Uranus:"Uranus",Neptunus:"Neptune",Pluto:"Pluto"};
  const planets={};
  for(const[nl,en]of Object.entries(pDefs)){const lon=getPL(jdP,en);const pos=lonToSign_A(lon);planets[nl]={...pos,house:Math.floor((lon%360)/30)%12+1,longitude:Math.round(lon*100)/100};}
  const T=(jdP-2451545)/36525;
  const lst=((280.46061837+360.98564736629*(jdP-2451545))%360+360)%360;
  const asc=lonToSign_A((lst+90)%360);
  const mc=lonToSign_A(lst%360);
  const elements={},modalities={};
  const modMap={Ram:"Cardinaal",Stier:"Vast",Tweelingen:"Mutable",Kreeft:"Cardinaal",Leeuw:"Vast",Maagd:"Mutable",Weegschaal:"Cardinaal",Schorpioen:"Vast",Boogschutter:"Mutable",Steenbok:"Cardinaal",Waterman:"Vast",Vissen:"Mutable"};
  for(const[p,d]of Object.entries(planets)){const el=EL_MAP_A[d.sign]||"";const mo=modMap[d.sign]||"";elements[el]=(elements[el]||0)+1;modalities[mo]=(modalities[mo]||0)+1;}
  const domEl=Object.entries(elements).sort((a,b)=>b[1]-a[1])[0]?.[0]||"";
  const aspects=[];
  const pList=Object.entries(planets);
  const ASPECTS_DEF={0:["Conjunctie",8],60:["Sextiel",6],90:["Vierkant",7],120:["Driehoek",8],180:["Oppositie",8]};
  for(let i=0;i<pList.length;i++)for(let j=i+1;j<pList.length;j++){const[p1,d1]=pList[i],[p2,d2]=pList[j];let diff=Math.abs(d1.longitude-d2.longitude);if(diff>180)diff=360-diff;for(const[angle,[name,orb]]of Object.entries(ASPECTS_DEF))if(Math.abs(diff-parseInt(angle))<=orb)aspects.push({p1,p2,aspect:name,orb:Math.round(Math.abs(diff-parseInt(angle))*10)/10});}
  return{ascendant:asc,mc,sun_sign:planets["Zon"]?.sign||"",planets,aspects:aspects.sort((a,b)=>a.orb-b.orb).slice(0,12),elements,modalities,dom_element:domEl,isHoroscoop:true};
}

// ─── Bodygraph ────────────────────────────────────────────────────────────────
const CP={"Head":{cx:320,cy:58,sh:"td",lb:"HEAD"},"Ajna":{cx:320,cy:148,sh:"td",lb:"AJNA"},"Throat":{cx:320,cy:242,sh:"rc",lb:"THROAT"},"G/Self":{cx:320,cy:348,sh:"di",lb:"G"},"Heart/Ego":{cx:212,cy:302,sh:"tr",lb:"HART"},"Sacral":{cx:320,cy:450,sh:"rc",lb:"SACRAAL"},"Solar Plexus":{cx:455,cy:372,sh:"tl",lb:"SP"},"Spleen":{cx:178,cy:398,sh:"tr",lb:"MILT"},"Root":{cx:320,cy:540,sh:"rc",lb:"ROOT"}};
const CPATHS={"Head-Ajna":"M320,84 L320,122","Ajna-Throat":"M320,178 L320,220","Throat-G/Self":"M320,268 L320,314","Throat-Sacral":"M320,268 L320,424","Throat-Solar Plexus":"M352,248 Q455,248 455,342","Throat-Spleen":"M288,248 Q178,248 178,368","Throat-Heart/Ego":"M288,248 Q212,248 212,274","G/Self-Sacral":"M320,386 L320,424","G/Self-Heart/Ego":"M284,348 L246,316","G/Self-Spleen":"M280,364 Q178,364 178,368","Heart/Ego-Spleen":"M186,312 Q178,370 178,368","Heart/Ego-Solar Plexus":"M238,308 Q348,308 432,358","Sacral-Root":"M320,476 L320,514","Sacral-Solar Plexus":"M352,450 Q455,450 455,400","Sacral-Spleen":"M288,450 Q178,450 178,428","Solar Plexus-Root":"M440,402 Q440,540 352,540","Spleen-Root":"M196,426 Q196,540 288,540"};
function cpth(pos){const{cx:x,cy:y,sh}=pos;if(sh==="rc")return"M"+(x-44)+","+(y-22)+" h88 v44 h-88 Z";if(sh==="di")return"M"+x+","+(y-46)+" L"+(x+46)+","+y+" L"+x+","+(y+46)+" L"+(x-46)+","+y+" Z";if(sh==="td")return"M"+(x-46)+","+(y-26)+" L"+(x+46)+","+(y-26)+" L"+x+","+(y+26)+" Z";if(sh==="tr")return"M"+(x-26)+","+(y-36)+" L"+(x+26)+","+y+" L"+(x-26)+","+(y+36)+" Z";if(sh==="tl")return"M"+(x+26)+","+(y-36)+" L"+(x-26)+","+y+" L"+(x+26)+","+(y+36)+" Z";return"M"+(x-44)+","+(y-22)+" h88 v44 h-88 Z";}
function Bodygraph({chart,name}){
  const def=new Set(chart?chart.definedCenters:[]);
  const ap=new Set();if(chart)for(const c of chart.channels){ap.add(c.c1+"-"+c.c2);ap.add(c.c2+"-"+c.c1);}
  const COL="#1a2a3a";
  return(
    <svg viewBox="0 0 640 608" style={{width:"100%",maxWidth:420,display:"block",margin:"0 auto"}}>
      <rect width="640" height="608" fill="#F8F8F6" rx="2"/>
      {name&&<text x="320" y="598" textAnchor="middle" fontFamily="Cormorant Garamond,serif" fontSize="13" fill="#9a9a8a" fontStyle="italic">{name}</text>}
      {Object.entries(CPATHS).map(([key,path])=>{const active=ap.has(key)||ap.has(key.split("-").reverse().join("-"));return<path key={key} d={path} fill="none" stroke={active?COL:"#ddd"} strokeWidth={active?2:1.5} strokeLinecap="round"/>;  })}
      {Object.entries(CP).map(([cn,pos])=>{const isDef=def.has(cn);return(<g key={cn}><path d={cpth(pos)} fill={isDef?COL:"none"} stroke={isDef?COL:"#ccc"} strokeWidth={1.5}/><text x={pos.cx} y={pos.cy} textAnchor="middle" dominantBaseline="middle" fontFamily="Jost,sans-serif" fontSize="8" letterSpacing="0.8" fill={isDef?"#fff":"#ccc"}>{pos.lb}</text></g>);})}
    </svg>
  );
}

// ─── Prompt builders ──────────────────────────────────────────────────────────
const MONTHS=["Januari","Februari","Maart","April","Mei","Juni","Juli","Augustus","September","Oktober","November","December"];
const LSTEPS=["Geboortedata verwerken","Berekeningen uitvoeren","Chart analyseren","Patronen identificeren","Rapport structureren","Tekst genereren","Kwaliteitscontrole","Rapport voltooien"];

function buildPrompt(chart,form,rpt){
  if(rpt.id==="numerologie"){
    const num=calcNumerology(form.name,parseInt(form.day),parseInt(form.month),parseInt(form.year));
    const masterStr=num.masters.length>0?"Mastergetallen aanwezig: "+num.masters.join(", ")+" — bijzonder zeldzaam.":"Geen mastergetallen.";
    return["NUMEROLOGIE BEREKENING voor "+form.name,"Naam: "+form.name,"Geboortedatum: "+form.day+"-"+form.month+"-"+form.year,"","Levenspadgetal: "+num.lp+" — "+num.lpName+" ("+num.lpKw+")","Uitdrukkingsgetal: "+num.exp+" — "+num.expName+" ("+num.expKw+")","Zielsgetal: "+num.soul+" — "+num.soulName+" ("+num.soulKw+")","Persoonlijkheidsgetal: "+num.pers,"Verjaardagsgetal: "+num.bday,"Persoonlijk Jaar 2025: "+num.py,"Rijpingsgetal: "+num.mat,"Balansgetal: "+num.bal,masterStr,"",rpt.prompt_extra].join("\n");
  }
  if(rpt.id==="horoscoop"){
    const h=calcHoroscoop(parseInt(form.year),parseInt(form.month),parseInt(form.day),parseInt(form.hour),parseInt(form.minute||"0"));
    const pStr=Object.entries(h.planets).map(([p,d])=>p+": "+d.degree+"° "+d.sign+" Huis "+d.house).join(", ");
    const aspStr=h.aspects.slice(0,8).map(a=>a.p1+" "+a.aspect+" "+a.p2+" (orb "+a.orb+"°)").join(", ");
    return["HOROSCOOP BEREKENING voor "+form.name,"Geboortedatum: "+form.day+"-"+form.month+"-"+form.year+" om "+form.hour+":"+String(form.minute||0).padStart(2,"0"),"Geboorteplaats: "+form.place,"","Ascendant: "+h.ascendant.degree+"° "+h.ascendant.sign,"Midhemel: "+h.mc.degree+"° "+h.mc.sign,"Zonneteken: "+h.sun_sign,"Dominant element: "+h.dom_element,"Planeten: "+pStr,"Aspecten: "+aspStr,"",rpt.prompt_extra].join("\n");
  }
  const pStr=Object.entries(chart.pers).map(e=>e[0]+": Poort "+e[1].gate+"."+e[1].line).join(", ");
  const dStr=Object.entries(chart.des).map(e=>e[0]+": Poort "+e[1].gate+"."+e[1].line).join(", ");
  return["HUMAN DESIGN CHART voor "+form.name,"Geboortedatum: "+form.day+"-"+form.month+"-"+form.year+(form.hour?" om "+form.hour+":"+String(form.minute||0).padStart(2,"0"):""),"Geboorteplaats: "+form.place,"","Type: "+chart.type,"Strategie: "+chart.strat,"Autoriteit: "+chart.auth,"Signature: "+chart.sig,"Not-Self: "+chart.notSelf,"Profiel: "+chart.profile,"Inkarnatie-Kruis: Poort "+chart.cross,"Gedefinieerde centra: "+(chart.definedCenters.join(", ")||"geen"),"Open centra: "+chart.openCenters.join(", "),"Kanalen: "+(chart.channels.map(c=>c.g1+"-"+c.g2).join(", ")||"geen"),"Poorten: "+chart.allGates.join(", "),"Bewust: "+pStr,"Onbewust: "+dStr,"",rpt.prompt_extra].join("\n");
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const S=`
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#F7F6F2;--d:#1A1A16;--acc:#2C3E50;--gold:#9A8050;--line:#E0DDD6;--w:#fff;--txt:#4A4A40}
body{font-family:'Jost',sans-serif;background:var(--bg);color:var(--d);overflow-x:hidden}
img{display:block;max-width:100%}

/* NAV */
.nav{position:fixed;top:0;left:0;right:0;z-index:200;background:rgba(247,246,242,.97);backdrop-filter:blur(16px);border-bottom:1px solid var(--line);display:flex;justify-content:space-between;align-items:center;padding:0 52px;height:64px}
.logo{display:flex;flex-direction:column;cursor:pointer}
.logo-main{font-family:'Cormorant Garamond',serif;font-size:1.1rem;font-weight:400;color:var(--d);letter-spacing:2px;text-transform:uppercase}
.logo-sub{font-size:.48rem;letter-spacing:5px;color:#9a9a8a;text-transform:uppercase;margin-top:1px}
.nav-links{display:flex;align-items:center;gap:2px}
.nl{font-size:.58rem;letter-spacing:1.5px;color:#7a7a6a;text-transform:uppercase;cursor:pointer;padding:8px 14px;transition:color .2s;white-space:nowrap}
.nl:hover,.nl.act{color:var(--d)}
.nav-cta{padding:9px 22px;background:var(--d);color:#fff;border:none;font-family:'Jost',sans-serif;font-size:.56rem;letter-spacing:3px;text-transform:uppercase;cursor:pointer;transition:opacity .3s;margin-left:8px}
.nav-cta:hover{opacity:.8}

/* HERO */
.hero{min-height:100vh;position:relative;display:flex;align-items:flex-end;padding-bottom:80px;overflow:hidden}
.hero-bg{position:absolute;inset:0;background-size:cover;background-position:center 40%;filter:brightness(.32)}
.hero-ov{position:absolute;inset:0;background:linear-gradient(180deg,rgba(26,26,22,0) 30%,rgba(26,26,22,.85) 100%)}
.hero-cnt{position:relative;z-index:2;max-width:1100px;margin:0 auto;padding:0 52px;width:100%}
.hero-label{font-size:.52rem;letter-spacing:6px;color:rgba(154,128,80,.8);text-transform:uppercase;margin-bottom:20px}
.hero-title{font-family:'Cormorant Garamond',serif;font-size:clamp(3rem,7vw,5.5rem);font-weight:300;color:#fff;line-height:1.05;margin-bottom:20px;max-width:800px}
.hero-title em{font-style:italic;color:rgba(255,255,255,.65)}
.hero-sub{font-size:.9rem;font-weight:300;color:rgba(255,255,255,.55);max-width:520px;line-height:1.8;margin-bottom:36px}
.hero-btns{display:flex;gap:12px;flex-wrap:wrap}
.btn-light{padding:13px 36px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.25);color:#fff;font-family:'Jost',sans-serif;font-size:.6rem;letter-spacing:3px;text-transform:uppercase;cursor:pointer;transition:all .3s;backdrop-filter:blur(4px)}
.btn-light:hover{background:rgba(255,255,255,.18)}
.btn-solid{padding:13px 36px;background:#fff;border:none;color:var(--d);font-family:'Jost',sans-serif;font-size:.6rem;letter-spacing:3px;text-transform:uppercase;cursor:pointer;transition:opacity .3s}
.btn-solid:hover{opacity:.88}
.hero-scroll{position:absolute;bottom:32px;right:52px;z-index:2;display:flex;flex-direction:column;align-items:center;gap:8px}
.scroll-line{width:1px;height:40px;background:rgba(255,255,255,.2);animation:scrl 2s ease-in-out infinite}
@keyframes scrl{0%,100%{transform:scaleY(1);opacity:.3}50%{transform:scaleY(1.4);opacity:.7}}

/* LAYOUT */
.pg{padding-top:64px;min-height:100vh}
.sec{padding:80px 52px}
.sec.wh{background:#fff}
.sec.bg{background:var(--bg)}
.sec.dk{background:var(--d)}
.sec.img{position:relative;overflow:hidden}
.sec-bg-img{position:absolute;inset:0;background-size:cover;background-position:center;filter:brightness(.28)}
.sec-ov{position:absolute;inset:0;background:rgba(26,26,22,.55)}
.sec-rel{position:relative;z-index:1}
.cont{max-width:1100px;margin:0 auto}
.cont.nw{max-width:760px;margin:0 auto}
.cont.ctr{text-align:center}
.divider{width:40px;height:1px;background:var(--gold);margin:0 auto 40px}
.divider.left{margin:0 0 32px}

/* TYPE */
.label{font-size:.48rem;letter-spacing:6px;text-transform:uppercase;color:var(--gold);margin-bottom:14px}
.label.lgt{color:rgba(154,128,80,.7)}
.h1{font-family:'Cormorant Garamond',serif;font-size:clamp(2rem,4.5vw,3.2rem);font-weight:300;color:var(--d);line-height:1.18;margin-bottom:18px}
.h1 em{font-style:italic}
.h1.lgt{color:#fff}
.h2{font-family:'Cormorant Garamond',serif;font-size:clamp(1.5rem,3vw,2.2rem);font-weight:300;color:var(--d);line-height:1.2;margin-bottom:14px}
.h2 em{font-style:italic}
.h2.lgt{color:#fff}
.p{font-size:.86rem;font-weight:300;line-height:1.95;color:var(--txt);margin-bottom:14px}
.p.lgt{color:rgba(255,255,255,.6)}
.p.sm{font-size:.78rem;color:#9a9a8a}
.sig{font-family:'Cormorant Garamond',serif;font-size:1.3rem;font-style:italic;color:var(--gold);margin-top:14px}

/* BUTTONS */
.btn{display:inline-block;padding:12px 36px;background:var(--d);color:#fff;border:none;font-family:'Jost',sans-serif;font-size:.58rem;letter-spacing:3px;text-transform:uppercase;cursor:pointer;transition:opacity .3s}
.btn:hover{opacity:.8}
.btn.out{background:transparent;border:1px solid var(--d);color:var(--d)}
.btn.out:hover{background:var(--d);color:#fff}
.btn.out.lgt{border-color:rgba(255,255,255,.4);color:#fff}
.btn.out.lgt:hover{background:rgba(255,255,255,.1)}
.btn.gold{background:var(--gold)}

/* GRID */
.g2{display:grid;grid-template-columns:1fr 1fr;gap:40px}
.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
.g-align-center{align-items:center}

/* CARDS */
.card{background:#fff;padding:32px 28px;border:1px solid var(--line)}
.card.nb{border:none;background:var(--bg);padding:28px}
.rcard{background:#fff;border:1px solid var(--line);overflow:hidden;cursor:pointer;transition:border-color .25s,box-shadow .25s;display:flex;flex-direction:column}
.rcard:hover{border-color:var(--acc);box-shadow:0 8px 32px rgba(0,0,0,.08)}
.rcard-top{padding:28px 26px 0}
.rcard-icon{font-size:1.1rem;margin-bottom:10px;color:var(--acc)}
.rcard-tag{display:inline-block;font-size:.46rem;letter-spacing:3px;text-transform:uppercase;padding:3px 8px;background:var(--d);color:#fff;margin-bottom:10px}
.rcard-title{font-family:'Cormorant Garamond',serif;font-size:1.15rem;font-weight:400;color:var(--d);margin-bottom:6px;line-height:1.3}
.rcard-tagline{font-size:.76rem;font-weight:300;color:#7a7a6a;line-height:1.6;margin-bottom:18px}
.rcard-div{height:1px;background:var(--line);margin:0 26px}
.rcard-bot{padding:16px 26px 22px;display:flex;justify-content:space-between;align-items:center;margin-top:auto}
.rcard-price{font-family:'Cormorant Garamond',serif;font-size:1.4rem;font-weight:300;color:var(--d)}
.rcard-link{font-size:.54rem;letter-spacing:2px;text-transform:uppercase;color:var(--gold);border-bottom:1px solid rgba(154,128,80,.3)}

/* REPORT DETAIL HERO */
.rdh{background:var(--d);padding:72px 52px;border-bottom:1px solid rgba(255,255,255,.06)}
.rdh-inner{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 300px;gap:60px;align-items:start}
.rdh-lbl{font-size:.46rem;letter-spacing:6px;text-transform:uppercase;color:rgba(154,128,80,.6);margin-bottom:14px}
.rdh-title{font-family:'Cormorant Garamond',serif;font-size:clamp(2rem,4vw,3rem);font-weight:300;color:#fff;margin-bottom:10px;line-height:1.1}
.rdh-tagline{font-size:.9rem;font-weight:300;color:rgba(255,255,255,.5);margin-bottom:24px;line-height:1.7}
.rdh-meta{display:flex;gap:20px;flex-wrap:wrap}
.rdh-m{font-size:.54rem;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,.3)}
.rdh-box{border:1px solid rgba(255,255,255,.1);padding:28px}
.rdh-price{font-family:'Cormorant Garamond',serif;font-size:2.8rem;font-weight:300;color:#fff}
.rdh-sub{font-size:.52rem;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,.3);margin-top:4px;margin-bottom:20px}
.rdh-btn{width:100%;padding:13px;background:#fff;color:var(--d);border:none;font-family:'Jost',sans-serif;font-size:.58rem;letter-spacing:3px;text-transform:uppercase;cursor:pointer;transition:opacity .3s}
.rdh-btn:hover{opacity:.88}

/* INCLUDES */
.inc-list{list-style:none;display:flex;flex-direction:column;gap:10px}
.inc-item{display:flex;gap:12px;align-items:flex-start;font-size:.83rem;font-weight:300;color:var(--txt);line-height:1.65}
.inc-dot{width:4px;height:4px;border-radius:50%;background:var(--gold);flex-shrink:0;margin-top:8px}
.for-box{border-left:2px solid var(--gold);padding:16px 20px;margin-top:20px;background:rgba(154,128,80,.04)}
.for-lbl{font-size:.46rem;letter-spacing:4px;text-transform:uppercase;color:var(--gold);margin-bottom:6px}
.for-txt{font-size:.82rem;font-weight:300;color:var(--txt);line-height:1.7}

/* FORM */
.form-wrap{background:#fff;border:1px solid var(--line);padding:40px}
.form-title{font-family:'Cormorant Garamond',serif;font-size:1.4rem;font-weight:300;color:var(--d);margin-bottom:4px}
.form-sub{font-size:.76rem;font-weight:300;color:#9a9a8a;margin-bottom:24px;line-height:1.65}
.fgrid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.fg{display:flex;flex-direction:column;gap:5px}
.fg.full{grid-column:1/-1}
.flbl{font-size:.46rem;letter-spacing:4px;text-transform:uppercase;color:var(--gold)}
.finp{border:1px solid var(--line);background:var(--bg);padding:10px 12px;font-family:'Jost',sans-serif;font-size:.84rem;font-weight:300;color:var(--d);outline:none;transition:border-color .25s;border-radius:0;width:100%}
.finp:focus{border-color:var(--d)}
.fsel{border:1px solid var(--line);background:var(--bg);padding:10px 12px;font-family:'Jost',sans-serif;font-size:.84rem;font-weight:300;color:var(--d);outline:none;border-radius:0;width:100%;cursor:pointer}
.fsel:focus{border-color:var(--d)}
.f2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.fbtn{width:100%;padding:13px;background:var(--d);color:#fff;border:none;font-family:'Jost',sans-serif;font-size:.6rem;letter-spacing:3px;text-transform:uppercase;cursor:pointer;margin-top:18px;transition:opacity .3s}
.fbtn:hover:not(:disabled){opacity:.82}
.fbtn:disabled{opacity:.3;cursor:not-allowed}
.fnote{font-size:.64rem;color:#9a9a8a;margin-top:8px;text-align:center;line-height:1.6}
.sec-divider{height:1px;background:var(--line);margin:0 52px}

/* CHART RESULT */
.chart-wrap{background:#fff;border:1px solid var(--line);padding:32px}
.chart-label{font-size:.46rem;letter-spacing:5px;text-transform:uppercase;color:var(--gold);margin-bottom:4px}
.chart-name{font-family:'Cormorant Garamond',serif;font-size:1.3rem;font-weight:300;color:var(--d);margin-bottom:20px}
.ctbl{width:100%;border-collapse:collapse}
.ctbl tr{border-bottom:1px solid var(--line)}
.ctbl td{padding:8px 0;font-size:.8rem;vertical-align:top}
.ctbl td:first-child{font-size:.62rem;letter-spacing:1px;text-transform:uppercase;color:#9a9a8a;width:130px;padding-right:12px}
.ctbl td:last-child{font-weight:300;color:var(--d)}
.tags{display:flex;flex-wrap:wrap;gap:3px;margin-top:2px}
.tag-def{font-size:.6rem;padding:2px 7px;background:var(--d);color:#fff}
.tag-open{font-size:.6rem;padding:2px 7px;border:1px solid var(--line);color:#9a9a8a}
.tag-gate{font-size:.6rem;padding:2px 6px;background:rgba(42,58,70,.06);color:var(--acc)}
.order-bar{background:var(--d);padding:24px 28px;margin-top:0;border-top:1px solid rgba(255,255,255,.06)}
.ob-title{font-family:'Cormorant Garamond',serif;font-size:1.1rem;font-weight:300;color:#fff;margin-bottom:5px}
.ob-sub{font-size:.74rem;font-weight:300;color:rgba(255,255,255,.45);margin-bottom:16px;line-height:1.6}
.ob-btn{width:100%;padding:12px;background:#fff;color:var(--d);border:none;font-family:'Jost',sans-serif;font-size:.58rem;letter-spacing:3px;text-transform:uppercase;cursor:pointer;transition:opacity .3s}
.ob-btn:hover{opacity:.88}

/* LOADING */
.lo{position:fixed;inset:0;background:rgba(26,26,22,.97);z-index:300;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px}
.lo-icon{font-family:'Cormorant Garamond',serif;font-size:3rem;font-weight:300;color:rgba(154,128,80,.5);margin-bottom:28px;animation:pulse 3s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:.4}50%{opacity:.9}}
.lo-title{font-family:'Cormorant Garamond',serif;font-size:1.5rem;font-weight:300;color:#fff;margin-bottom:8px}
.lo-step{font-size:.54rem;letter-spacing:3px;color:rgba(154,128,80,.7);text-transform:uppercase;min-height:18px}
.lo-bar{width:180px;height:1px;background:rgba(154,128,80,.15);margin:14px auto 0;overflow:hidden}
.lo-fill{height:100%;background:var(--gold);transition:width .5s}

/* REPORT OUTPUT */
.report-pg{background:var(--bg);min-height:100vh;padding:52px}
.report-hd{max-width:760px;margin:0 auto 28px}
.report-inst{font-size:.46rem;letter-spacing:5px;text-transform:uppercase;color:var(--gold);margin-bottom:6px}
.report-name{font-family:'Cormorant Garamond',serif;font-size:1.9rem;font-weight:300;color:var(--d);margin-bottom:3px}
.report-meta{font-size:.72rem;font-weight:300;color:#9a9a8a;margin-bottom:18px}
.dl-btn{display:inline-block;padding:10px 32px;background:var(--d);color:#fff;font-family:'Jost',sans-serif;font-size:.58rem;letter-spacing:3px;text-transform:uppercase;cursor:pointer;border:none}
.report-bar{max-width:760px;margin:0 auto 20px;background:#fff;border:1px solid var(--line);padding:20px 24px}
.rbg{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.rbl{font-size:.44rem;letter-spacing:3px;text-transform:uppercase;color:#9a9a8a;margin-bottom:3px}
.rbv{font-size:.8rem;font-weight:300;color:var(--d);line-height:1.4}
.report-body{max-width:760px;margin:0 auto;background:#fff;border:1px solid var(--line);padding:44px 48px}
.rpt-hd{font-family:'Cormorant Garamond',serif;font-size:1.15rem;font-weight:400;color:var(--d);margin:28px 0 8px;padding-bottom:7px;border-bottom:1px solid var(--line)}
.rpt-body{font-size:.83rem;font-weight:300;line-height:1.95;color:#3a3a32;white-space:pre-wrap;margin-bottom:10px}

/* STATS */
.stats-row{display:flex;gap:40px;flex-wrap:wrap;margin-top:28px}
.stat-n{font-family:'Cormorant Garamond',serif;font-size:2.2rem;font-weight:300;color:var(--d)}
.stat-l{font-size:.5rem;letter-spacing:3px;text-transform:uppercase;color:#9a9a8a}

/* SPLIT */
.split{display:grid;grid-template-columns:1fr 1fr}
.simg{background-size:cover;background-position:center;min-height:420px}
.stxt{padding:64px 52px;display:flex;flex-direction:column;justify-content:center}
.stxt.wh{background:#fff}
.stxt.bg{background:var(--bg)}
.stxt.dk{background:var(--d)}

/* STRIP */
.strip{display:grid;grid-template-columns:repeat(3,1fr);height:260px}
.stripph{background-size:cover;background-position:center;position:relative;overflow:hidden}
.stripph::after{content:'';position:absolute;inset:0;background:rgba(26,26,22,.45)}
.striplb{position:absolute;bottom:16px;left:0;right:0;text-align:center;font-size:.46rem;letter-spacing:5px;color:rgba(255,255,255,.6);text-transform:uppercase;z-index:1}

/* TESTIMONIALS */
.tcard{border-top:1px solid var(--line);padding:28px 0}
.tq{font-family:'Cormorant Garamond',serif;font-size:1rem;font-style:italic;color:var(--d);line-height:1.7;margin-bottom:10px}
.tn{font-size:.52rem;letter-spacing:3px;text-transform:uppercase;color:#9a9a8a}
.tr2{font-size:.48rem;letter-spacing:2px;color:rgba(154,128,80,.7);text-transform:uppercase;margin-top:2px}

/* FAQ */
.faq-item{border-bottom:1px solid var(--line);padding:16px 0}
.faq-q{font-family:'Cormorant Garamond',serif;font-size:1rem;font-weight:400;color:var(--d);cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:12px;line-height:1.4}
.faq-q:hover{color:var(--gold)}
.faq-a{font-size:.82rem;font-weight:300;line-height:1.9;color:var(--txt);margin-top:12px;max-width:640px}

/* BLOG */
.blog-card{border-top:1px solid var(--line);padding:28px 0;cursor:pointer;transition:border-color .2s}
.blog-card:hover{border-color:var(--d)}
.blog-tag{font-size:.46rem;letter-spacing:4px;text-transform:uppercase;color:var(--gold);margin-bottom:8px}
.blog-title{font-family:'Cormorant Garamond',serif;font-size:1.15rem;font-weight:400;color:var(--d);margin-bottom:6px;line-height:1.3}
.blog-exc{font-size:.8rem;font-weight:300;color:var(--txt);line-height:1.75}

/* CONTACT */
.contact-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:start}
.ci{margin-bottom:24px}
.ci-lbl{font-size:.46rem;letter-spacing:4px;text-transform:uppercase;color:var(--gold);margin-bottom:5px}
.ci-val{font-size:.84rem;font-weight:300;color:var(--txt);line-height:1.65}
.cf-area{border:1px solid var(--line);background:var(--bg);padding:10px 12px;font-family:'Jost',sans-serif;font-size:.84rem;font-weight:300;color:var(--d);outline:none;border-radius:0;width:100%;resize:vertical;min-height:110px;transition:border-color .25s}
.cf-area:focus{border-color:var(--d)}

/* FOOTER */
.foot{background:var(--d);padding:52px;display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:end}
.foot-logo-main{font-family:'Cormorant Garamond',serif;font-size:1.15rem;font-weight:400;color:#fff;letter-spacing:2px;text-transform:uppercase}
.foot-logo-sub{font-size:.46rem;letter-spacing:5px;color:rgba(255,255,255,.3);text-transform:uppercase;margin-top:2px}
.foot-copy{font-size:.5rem;letter-spacing:2px;color:rgba(255,255,255,.2);margin-top:8px}
.foot-links{display:flex;flex-direction:column;gap:10px;align-items:flex-end}
.foot-lnk{font-size:.54rem;letter-spacing:2px;color:rgba(255,255,255,.3);text-transform:uppercase;cursor:pointer;transition:color .2s}
.foot-lnk:hover{color:rgba(255,255,255,.7)}

@media(max-width:900px){
  .nav{padding:0 20px}.nav-links{display:none}
  .hero-cnt{padding:0 24px}.hero-scroll{display:none}
  .sec{padding:56px 24px}.sec-divider{margin:0 24px}
  .split{grid-template-columns:1fr}.simg{min-height:220px}.stxt{padding:40px 24px}
  .g2{grid-template-columns:1fr}.g3{grid-template-columns:1fr}.g4{grid-template-columns:1fr 1fr}
  .rdh{padding:52px 24px}.rdh-inner{grid-template-columns:1fr}
  .fgrid{grid-template-columns:1fr}.form-wrap{padding:28px 20px}
  .chart-wrap{padding:22px 16px}.report-body{padding:28px 18px}.report-pg{padding:36px 20px}
  .strip{grid-template-columns:1fr;height:auto}.stripph{height:160px}
  .stats-row{gap:24px}
  .contact-grid{grid-template-columns:1fr}
  .foot{grid-template-columns:1fr;padding:36px 24px}.foot-links{align-items:flex-start}
  .rbg{grid-template-columns:1fr 1fr}
}
`;

// ─── Components ───────────────────────────────────────────────────────────────
function Nav({page,go}){
  const links=[["home","Home"],["wat","Wat is Human Design"],["rapporten","Rapporten"],["blog","Inzichten"],["over","Over ons"],["contact","Contact"]];
  return(
    <nav className="nav">
      <div className="logo" onClick={()=>go("home")}>
        <div className="logo-main">Faculty of Human Design</div>
        <div className="logo-sub">Ibiza — Est. 2014</div>
      </div>
      <div className="nav-links">
        {links.map(([id,label])=><span key={id} className={"nl"+(page===id||page.startsWith("rapport-")&&id==="rapporten"?" act":"")} onClick={()=>go(id)}>{label}</span>)}
      </div>
      <button className="nav-cta" onClick={()=>go("rapporten")}>Rapporten</button>
    </nav>
  );
}

function Footer({go}){
  return(
    <footer className="foot">
      <div>
        <div className="foot-logo-main">Faculty of Human Design</div>
        <div className="foot-logo-sub">Ibiza, Spanje — Est. 2014</div>
        <div className="foot-copy">© 2025 Faculty of Human Design. Alle rechten voorbehouden.<br/>Alle rapporten zijn strikt persoonlijk en vertrouwelijk.</div>
      </div>
      <div className="foot-links">
        {[["home","Home"],["wat","Wat is Human Design"],["rapporten","Rapporten"],["blog","Inzichten"],["over","Over ons"],["contact","Contact"]].map(([id,l])=><span key={id} className="foot-lnk" onClick={()=>go(id)}>{l}</span>)}
      </div>
    </footer>
  );
}

// ─── Form component ───────────────────────────────────────────────────────────
function ReportForm({rpt,onDone}){
  const[form,setForm]=useState({name:"",day:"",month:"",year:"",hour:"",minute:"",place:"",pname:"",pday:"",pmonth:"",pyear:"",phour:"",pminute:"",cname:"",cday:"",cmonth:"",cyear:"",chour:"",cminute:""});
  const[chart,setChart]=useState(null);
  const[ls,setLs]=useState(0);
  const[pr,setPr]=useState(0);
  const[loading,setLoading]=useState(false);
  const ch=e=>setForm(f=>({...f,[e.target.name]:e.target.value}));
  const isNum=rpt.id==="numerologie";
  const isHoro=rpt.id==="horoscoop";
  const needsTime=!isNum;
  const ok=form.name&&form.day&&form.month&&form.year&&form.place&&(!needsTime||form.hour);

  const doChart=()=>{
    const y=parseInt(form.year),m=parseInt(form.month),d=parseInt(form.day);
    if(!form.name||!d||!m||!y){alert("Vul alle verplichte velden in.");return;}
    if(isNum){
      const num=calcNumerology(form.name,d,m,y);
      setChart({...num,isNumerology:true});
    } else {
      const h=parseInt(form.hour||"12"),min=parseInt(form.minute||"0");
      const c=calcHD(y,m,d,h,min);
      setChart(isHoro?{...calcHoroscoop(y,m,d,h,min),isHoroscoop:true}:c);
    }
    setTimeout(()=>document.getElementById("chart-res")?.scrollIntoView({behavior:"smooth"}),80);
  };

  const doReport=async()=>{
    setLoading(true);setPr(0);setLs(0);
    let s=0;
    const iv=setInterval(()=>{s++;setLs(x=>Math.min(x+1,LSTEPS.length-1));setPr(Math.min(s/LSTEPS.length*90,90));},2200);
    try{
      const hdChart=(!isNum&&!isHoro)?chart:null;
      const prompt=buildPrompt(hdChart,form,rpt);
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:4000,
          system:"Je bent een senior analist van de Faculty of Human Design, gevestigd op Ibiza. Je schrijft nauwkeurige, diepgaande en professionele rapporten in het Nederlands op basis van exacte berekende data. Schrijf in de derde persoon vanuit het instituut, niet als individuele persoon. Minimaal 2500 woorden. Gebruik ### voor sectietitels.",
          messages:[{role:"user",content:prompt}]})});
      const data=await res.json();
      clearInterval(iv);setPr(100);
      const txt=data.content?.find(b=>b.type==="text")?.text||"Rapport kon niet worden gegenereerd.";
      setTimeout(()=>{setLoading(false);onDone(chart,form,txt,rpt);},500);
    }catch{clearInterval(iv);setLoading(false);onDone(chart,form,"Er is iets misgegaan.",rpt);}
  };

  if(loading)return(
    <div className="lo">
      <div className="lo-icon">✦</div>
      <div className="lo-title">Rapport wordt opgemaakt</div>
      <div className="lo-step">{LSTEPS[ls]}</div>
      <div className="lo-bar"><div className="lo-fill" style={{width:pr+"%"}}/></div>
      <p style={{marginTop:18,fontSize:".52rem",color:"rgba(255,255,255,.15)",letterSpacing:"2px"}}>Dit duurt 1–2 minuten</p>
    </div>
  );

  return(
    <div>
      <div className="sec bg" id="bestel">
        <div className="cont nw">
          <div className="label">Stap 1 — Gegevens invoeren</div>
          <div className="h2">Vul de geboortegegevens in</div>
          <p className="p" style={{marginBottom:28}}>Jouw chart wordt direct gratis berekend en getoond. Pas daarna genereer je het volledige rapport.</p>
          <div className="form-wrap">
            <div className="form-title">{rpt.title}</div>
            <div className="form-sub">{isNum?"Geen geboortetijd nodig — alleen naam en geboortedatum.":"Vul alle velden zo nauwkeurig mogelijk in voor de beste berekening."}</div>
            <div className="fgrid">
              <div className="fg full"><label className="flbl">Volledige naam</label><input className="finp" name="name" value={form.name} onChange={ch} placeholder="Voor- en achternaam"/></div>
              <div className="fg"><label className="flbl">Dag</label><input className="finp" type="number" name="day" min="1" max="31" value={form.day} onChange={ch} placeholder="bijv. 15"/></div>
              <div className="fg"><label className="flbl">Maand</label><select className="fsel" name="month" value={form.month} onChange={ch}><option value="">— maand —</option>{MONTHS.map((m,i)=><option key={i} value={i+1}>{m}</option>)}</select></div>
              <div className="fg"><label className="flbl">Jaar</label><input className="finp" type="number" name="year" value={form.year} onChange={ch} placeholder="bijv. 1990"/></div>
              {needsTime&&<div className="fg"><label className="flbl">Geboortetijd</label><div className="f2"><input className="finp" type="number" name="hour" min="0" max="23" value={form.hour} onChange={ch} placeholder="uur"/><input className="finp" type="number" name="minute" min="0" max="59" value={form.minute} onChange={ch} placeholder="min"/></div></div>}
              <div className="fg full"><label className="flbl">Geboorteplaats</label><input className="finp" name="place" value={form.place} onChange={ch} placeholder="bijv. Amsterdam, Nederland"/></div>
            </div>
            {rpt.needsPartner&&<>
              <div style={{height:1,background:"var(--line)",margin:"20px 0"}}/>
              <div className="form-sub" style={{marginBottom:14}}>Gegevens tweede persoon</div>
              <div className="fgrid">
                <div className="fg full"><label className="flbl">Naam partner</label><input className="finp" name="pname" value={form.pname} onChange={ch} placeholder="Naam"/></div>
                <div className="fg"><label className="flbl">Dag</label><input className="finp" type="number" name="pday" min="1" max="31" value={form.pday} onChange={ch}/></div>
                <div className="fg"><label className="flbl">Maand</label><select className="fsel" name="pmonth" value={form.pmonth} onChange={ch}><option value="">— maand —</option>{MONTHS.map((m,i)=><option key={i} value={i+1}>{m}</option>)}</select></div>
                <div className="fg"><label className="flbl">Jaar</label><input className="finp" type="number" name="pyear" value={form.pyear} onChange={ch}/></div>
                <div className="fg"><label className="flbl">Tijd</label><div className="f2"><input className="finp" type="number" name="phour" min="0" max="23" value={form.phour} onChange={ch} placeholder="uur"/><input className="finp" type="number" name="pminute" min="0" max="59" value={form.pminute} onChange={ch} placeholder="min"/></div></div>
                <div className="fg full"><label className="flbl">Geboorteplaats</label><input className="finp" name="pplace" value={form.pplace||""} onChange={ch} placeholder="Stad, land"/></div>
              </div>
            </>}
            {rpt.needsChild&&<>
              <div style={{height:1,background:"var(--line)",margin:"20px 0"}}/>
              <div className="form-sub" style={{marginBottom:14}}>Gegevens kind</div>
              <div className="fgrid">
                <div className="fg full"><label className="flbl">Naam kind</label><input className="finp" name="cname" value={form.cname} onChange={ch} placeholder="Naam kind"/></div>
                <div className="fg"><label className="flbl">Dag</label><input className="finp" type="number" name="cday" min="1" max="31" value={form.cday} onChange={ch}/></div>
                <div className="fg"><label className="flbl">Maand</label><select className="fsel" name="cmonth" value={form.cmonth} onChange={ch}><option value="">— maand —</option>{MONTHS.map((m,i)=><option key={i} value={i+1}>{m}</option>)}</select></div>
                <div className="fg"><label className="flbl">Jaar</label><input className="finp" type="number" name="cyear" value={form.cyear} onChange={ch}/></div>
                <div className="fg"><label className="flbl">Tijd</label><div className="f2"><input className="finp" type="number" name="chour" min="0" max="23" value={form.chour} onChange={ch} placeholder="uur"/><input className="finp" type="number" name="cminute" min="0" max="59" value={form.cminute} onChange={ch} placeholder="min"/></div></div>
                <div className="fg full"><label className="flbl">Geboorteplaats</label><input className="finp" name="cplace" value={form.cplace||""} onChange={ch} placeholder="Stad, land"/></div>
              </div>
            </>}
            <button className="fbtn" onClick={doChart} disabled={!ok}>Bereken chart</button>
            <p className="fnote">Gratis berekening — geen betaling nodig om de chart te zien.</p>
          </div>
        </div>
      </div>

      {chart&&(
        <div className="sec wh" id="chart-res">
          <div className="cont nw">
            <div className="label">Stap 2 — Jouw chart</div>
            <div className="h2" style={{marginBottom:24}}>{chart.isNumerology?"Kerngetallen":chart.isHoroscoop?"Planeetstanden":"Human Design Chart"}</div>
            <div className="g2" style={{gap:24}}>
              <div>
                {chart.isNumerology?(
                  <div className="chart-wrap">
                    <div className="chart-label">Numerologie</div>
                    <div className="chart-name">{form.name}</div>
                    {[["Levenspadgetal",chart.lp+" — "+chart.lpName],["Uitdrukkingsgetal",chart.exp+" — "+chart.expName],["Zielsgetal",chart.soul+" — "+chart.soulName],["Persoonlijkheidsgetal",chart.pers],["Verjaardagsgetal",chart.bday],["Persoonlijk Jaar 2025",chart.py],["Rijpingsgetal",chart.mat],["Balansgetal",chart.bal]].map(([l,v])=>(
                      <div key={l} style={{borderBottom:"1px solid var(--line)",padding:"8px 0"}}>
                        <div style={{fontSize:".6rem",letterSpacing:"2px",textTransform:"uppercase",color:"#9a9a8a",marginBottom:2}}>{l}</div>
                        <div style={{fontSize:".88rem",fontWeight:300,color:"var(--d)"}}>{v}{(parseInt(v)===11||parseInt(v)===22||parseInt(v)===33)&&<span style={{fontSize:".46rem",letterSpacing:"3px",color:"var(--gold)",marginLeft:8,textTransform:"uppercase"}}>Master</span>}</div>
                      </div>
                    ))}
                    {chart.masters&&chart.masters.length>0&&<div style={{background:"rgba(154,128,80,.06)",border:"1px solid rgba(154,128,80,.2)",padding:"12px 16px",marginTop:16}}><div style={{fontSize:".46rem",letterSpacing:"4px",textTransform:"uppercase",color:"var(--gold)",marginBottom:4}}>Mastergetal aanwezig</div><div style={{fontSize:".8rem",fontWeight:300,color:"var(--d)"}}>Mastergetal {chart.masters.join(" & ")} — zeldzame energetische configuratie.</div></div>}
                  </div>
                ):chart.isHoroscoop?(
                  <div className="chart-wrap">
                    <div className="chart-label">Horoscoop</div>
                    <div className="chart-name">{form.name}</div>
                    <table className="ctbl"><tbody>
                      <tr><td>Zonneteken</td><td>{chart.sun_sign}</td></tr>
                      <tr><td>Ascendant</td><td>{chart.ascendant?.degree}° {chart.ascendant?.sign}</td></tr>
                      <tr><td>Midhemel</td><td>{chart.mc?.degree}° {chart.mc?.sign}</td></tr>
                      <tr><td>Dom. element</td><td>{chart.dom_element}</td></tr>
                      <tr><td>Planeten</td><td><div className="tags">{Object.entries(chart.planets||{}).map(([p,d])=><span key={p} className="tag-gate">{p}: {d.sign}</span>)}</div></td></tr>
                    </tbody></table>
                  </div>
                ):(
                  <div className="chart-wrap">
                    <div className="chart-label">Human Design</div>
                    <div className="chart-name">{form.name}</div>
                    <table className="ctbl"><tbody>
                      <tr><td>Type</td><td><strong>{chart.type}</strong></td></tr>
                      <tr><td>Strategie</td><td>{chart.strat}</td></tr>
                      <tr><td>Autoriteit</td><td>{chart.auth}</td></tr>
                      <tr><td>Profiel</td><td>{chart.profile}</td></tr>
                      <tr><td>Inkarnatie-Kruis</td><td>Poort {chart.cross}</td></tr>
                      <tr><td>Gedefinieerd</td><td><div className="tags">{chart.definedCenters?.length>0?chart.definedCenters.map(c=><span key={c} className="tag-def">{c}</span>):<span style={{fontSize:".76rem",color:"#9a9a8a"}}>geen</span>}</div></td></tr>
                      <tr><td>Open</td><td><div className="tags">{chart.openCenters?.map(c=><span key={c} className="tag-open">{c}</span>)}</div></td></tr>
                      <tr><td>Poorten</td><td><div className="tags">{chart.allGates?.map(g=><span key={g} className="tag-gate">{g}</span>)}</div></td></tr>
                    </tbody></table>
                  </div>
                )}
              </div>
              <div>
                {!chart.isNumerology&&!chart.isHoroscoop&&<Bodygraph chart={chart} name={form.name}/>}
                {chart.isNumerology&&<div style={{background:"var(--bg)",border:"1px solid var(--line)",padding:"28px",textAlign:"center"}}><div style={{fontFamily:"Cormorant Garamond,serif",fontSize:"4rem",fontWeight:300,color:"rgba(154,128,80,.15)",lineHeight:1}}>∞</div><div className="label" style={{marginTop:16}}>Numerologie</div><p className="p sm" style={{marginTop:8}}>Jouw kerngetallen zijn berekend op basis van de Pythagorische methode.</p></div>}
                {chart.isHoroscoop&&<div style={{background:"var(--bg)",border:"1px solid var(--line)",padding:"28px",textAlign:"center"}}><div style={{fontFamily:"Cormorant Garamond,serif",fontSize:"4rem",fontWeight:300,color:"rgba(154,128,80,.15)",lineHeight:1}}>☽</div><div className="label" style={{marginTop:16}}>Geboortehoroscoop</div><p className="p sm" style={{marginTop:8}}>Planetaire posities berekend op basis van Meeus ephemeris.</p></div>}
              </div>
            </div>
            <div className="order-bar" style={{marginTop:24}}>
              <div className="ob-title">Stap 3 — Rapport genereren</div>
              <div className="ob-sub">Chart berekend. Het volledige rapport bevat een uitgebreide analyse van {rpt.pages} pagina's, direct als PDF beschikbaar.</div>
              <button className="ob-btn" onClick={doReport}>Genereer volledig rapport — {rpt.price}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Pages ────────────────────────────────────────────────────────────────────
function HomePage({go}){
  return(
    <div className="pg">
      <section className="hero">
        <div className="hero-bg" style={{backgroundImage:"url("+IMG.hero+")"}}/>
        <div className="hero-ov"/>
        <div className="hero-cnt">
          <div className="hero-label">Faculty of Human Design — Ibiza, Spanje</div>
          <h1 className="hero-title">Persoonlijke rapporten<br/>gebaseerd op <em>exacte<br/>astronomische berekeningen</em></h1>
          <p className="hero-sub">Human Design, Numerologie en Astrologie. Geen generieke uitleg — uw persoonlijke blauwdruk, berekend op basis van uw exacte geboortedata.</p>
          <div className="hero-btns">
            <button className="btn-solid" onClick={()=>go("rapporten")}>Bekijk alle rapporten</button>
            <button className="btn-light" onClick={()=>go("wat")}>Wat is Human Design?</button>
          </div>
        </div>
        <div className="hero-scroll"><div className="scroll-line"/></div>
      </section>

      <div className="sec-divider"/>

      <section className="sec bg">
        <div className="cont">
          <div className="g4" style={{marginBottom:48}}>
            {[["8","Verschillende rapporten"],["2.400+","Analyses uitgevoerd"],["4.9","Gemiddelde beoordeling"],["2014","Opgericht op Ibiza"]].map(([n,l])=>(
              <div key={l}><div className="stat-n">{n}</div><div className="stat-l">{l}</div></div>
            ))}
          </div>
          <div className="divider left"/>
          <div className="g2" style={{alignItems:"start",gap:60}}>
            <div>
              <div className="label">Onze rapporten</div>
              <h2 className="h1">Drie disciplines,<br/><em>één methodologie</em></h2>
              <p className="p">De Faculty of Human Design biedt rapporten op basis van Human Design, Numerologie en Geboorteastrologie. Elk rapport wordt gegenereerd op basis van echte astronomische berekeningen — niet op basis van generieke profielen.</p>
              <p className="p">U vult uw geboortegegevens in. Uw chart wordt direct berekend. Het rapport volgt als persoonlijke PDF.</p>
              <div style={{marginTop:24}}><button className="btn" onClick={()=>go("rapporten")}>Alle rapporten bekijken</button></div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:1,background:"var(--line)"}}>
              {REPORTS.slice(0,4).map(r=>(
                <div key={r.id} style={{background:"#fff",padding:"20px 24px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}} onClick={()=>go("rapport-"+r.id)}>
                  <div>
                    <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:"1rem",fontWeight:400,color:"var(--d)",marginBottom:2}}>{r.title}</div>
                    <div style={{fontSize:".68rem",fontWeight:300,color:"#9a9a8a"}}>{r.tagline}</div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:16,flexShrink:0}}>
                    <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:"1.1rem",color:"var(--d)"}}>{r.price}</div>
                    <div style={{fontSize:".52rem",letterSpacing:"2px",color:"var(--gold)",textTransform:"uppercase"}}>→</div>
                  </div>
                </div>
              ))}
              <div style={{background:"var(--bg)",padding:"14px 24px",textAlign:"center",cursor:"pointer"}} onClick={()=>go("rapporten")}>
                <div style={{fontSize:".52rem",letterSpacing:"3px",textTransform:"uppercase",color:"var(--gold)"}}>Alle 8 rapporten bekijken</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="strip">
        {[[IMG.cosmos,"Astronomische berekeningen"],[IMG.ibiza,"Ibiza, Spanje"],[IMG.journal,"Persoonlijke analyse"]].map(([u,l])=>(
          <div key={l} className="stripph" style={{backgroundImage:"url("+u+")"}}><div className="striplb">{l}</div></div>
        ))}
      </div>

      <section className="sec wh">
        <div className="cont nw">
          <div className="divider"/>
          <div className="label" style={{textAlign:"center"}}>Ervaringen</div>
          <h2 className="h1" style={{textAlign:"center",marginBottom:40}}>Wat onze klanten<br/><em>zeggen</em></h2>
          {[["Het rapport heeft mij meer inzicht gegeven dan jaren van zelfonderzoek. De precisie van de analyse is indrukwekkend.","M. van den Berg — Amsterdam","Volledig Human Design Rapport"],["Als koppel hebben wij veel baat gehad bij het relatierapport. Eindelijk begrijpen wij de dynamieken tussen ons.","T. & E. Dubois — Antwerpen","Relatierapport"],["De combinatie van Human Design en Numerologie gaf een compleet beeld. Ik heb beide rapporten besteld en was diep geraakt door de overeenkomsten.","S. Müller — Utrecht","Volledig Rapport & Numerologie"]].map(([q,n,r])=>(
            <div className="tcard" key={n}>
              <p className="tq">{q}</p>
              <div className="tn">{n}</div>
              <div className="tr2">{r}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="sec img">
        <div className="sec-bg-img" style={{backgroundImage:"url("+IMG.cosmos+")"}}/>
        <div className="sec-ov"/>
        <div className="sec-rel cont ctr">
          <div className="label lgt">Het systeem</div>
          <h2 className="h1 lgt" style={{marginBottom:16}}>Human Design werd ontvangen<br/>op het eiland Ibiza</h2>
          <p className="p lgt" style={{maxWidth:540,margin:"0 auto 28px"}}>In januari 1987 ontving Ra Uru Hu het Human Design systeem op Ibiza. De Faculty of Human Design is opgericht op ditzelfde eiland, vanuit respect voor de oorsprong van het systeem.</p>
          <button className="btn out lgt" onClick={()=>go("wat")}>Meer over het systeem</button>
        </div>
      </section>
    </div>
  );
}

function WatPage({go}){
  const[faq,setFaq]=useState(null);
  const faqs=[["Op basis waarvan wordt de chart berekend?","Alle charts worden berekend met behulp van de Meeus ephemeris — dezelfde astronomische algoritmen die ten grondslag liggen aan professionele astrologische en Human Design software. De berekening gebruikt uw exacte geboortedatum, -tijd en -plaats."],["Is dit hetzelfde als een horoscoop?","Nee. Een horoscoop werkt met uw zonneteken (1 van 12 mogelijkheden). Human Design combineert astronomische data met de I Ching (64 hexagrammen), Kabbalistische centra en kwantummechanische principes tot een individuele blauwdruk."],["Wat als ik mijn geboortetijd niet weet?","De geboortetijd is relevant voor de berekening van enkele centra en de ascendant. Als u de tijd niet weet, kunt u dit controleren via uw geboorteakte. Neem contact met ons op voor een alternatieve aanpak."],["Hoe lang duurt het om een rapport te ontvangen?","Na het invoeren van uw gegevens wordt de chart direct berekend. Het rapport wordt vervolgens gegenereerd en is binnen 1 tot 2 minuten beschikbaar als PDF."],["Kan ik een rapport als cadeau geven?","Ja. Vul bij de bestelling de gegevens in van de ontvanger. Het rapport wordt opgesteld op naam van de ontvanger."]];
  return(
    <div className="pg">
      <section className="hero" style={{minHeight:"50vh",paddingBottom:60}}>
        <div className="hero-bg" style={{backgroundImage:"url("+IMG.cosmos+")"}}/>
        <div className="hero-ov"/>
        <div className="hero-cnt">
          <div className="hero-label">Faculty of Human Design</div>
          <h1 className="hero-title" style={{fontSize:"clamp(2.5rem,6vw,4.5rem)"}}>Wat is<br/><em>Human Design?</em></h1>
        </div>
      </section>
      <section className="sec bg">
        <div className="cont nw">
          <div className="label">Het systeem</div>
          <h2 className="h1">Een synthese van vier<br/><em>kennissystemen</em></h2>
          <p className="p">Human Design werd in januari 1987 ontvangen door Ra Uru Hu op het eiland Ibiza. Het systeem combineert vier kennistradities tot één coherent model dat op het moment van uw geboorte een unieke persoonlijke blauwdruk berekent.</p>
          <p className="p">Het resultaat is een nauwkeurige beschrijving van hoe uw energie werkt, hoe u het beste beslissingen neemt en wat uw diepere levensdoel is.</p>
        </div>
      </section>
      <div className="sec-divider"/>
      <section className="sec wh">
        <div className="cont">
          <div className="label">De vier pijlers</div>
          <div className="g2" style={{marginTop:32,gap:2,background:"var(--line)"}}>
            {[["I Ching","De 64 hexagrammen vormen de 64 poorten van de chart. Elk beschrijft een archetyp of kwaliteit die u van nature draagt."],["Kabbalah","De Boom des Levens ligt ten grondslag aan de 9 centra — de energiecentra in uw chart die gedefinieerd of open zijn."],["Astrologie","De planetaire posities op het moment van uw geboorte én 88 dagen daarvoor bepalen welke poorten actief zijn."],["Kwantumfysica","De 9 centra corresponderen met hormoonklieren. Uw design is verankerd in uw fysiologie."]].map(([t,d])=>(
              <div key={t} style={{background:"#fff",padding:"32px 28px"}}>
                <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:"1.2rem",fontWeight:400,color:"var(--d)",marginBottom:10}}>{t}</div>
                <p className="p" style={{marginBottom:0}}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <div className="sec-divider"/>
      <section className="sec bg">
        <div className="cont nw">
          <div className="label">De vijf types</div>
          <h2 className="h1" style={{marginBottom:32}}>Hoe uw type<br/><em>wordt bepaald</em></h2>
          {[["Generator","37% van de bevolking","Wacht om te reageren","De primaire energiebron. Opereert optimaal wanneer het reageert op externe impulsen."],["Manifesting Generator","33% van de bevolking","Informeer, reageer dan","Combinatie van generatieve energie en initiatief. Snel, veelzijdig en multidimensionaal."],["Projector","20% van de bevolking","Wacht op de uitnodiging","Gebaat bij begeleiding en erkenning. Heeft een natuurlijk vermogen om systemen en mensen te zien."],["Manifestor","9% van de bevolking","Informeer voor u handelt","Het enige type dat direct initiatief kan nemen. Invloed is hun primaire kracht."],["Reflector","1% van de bevolking","Wacht een maancyclus","Geen vaste centra. Spiegelt de energie van de omgeving en heeft tijd nodig voor beslissingen."]].map(([t,pct,s,d])=>(
              <div key={t} style={{borderBottom:"1px solid var(--line)",padding:"20px 0",display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
                <div><div style={{fontFamily:"Cormorant Garamond,serif",fontSize:"1.05rem",color:"var(--d)",marginBottom:3}}>{t}</div><div style={{fontSize:".54rem",letterSpacing:"2px",color:"var(--gold)",textTransform:"uppercase"}}>{pct} · {s}</div></div>
                <p className="p sm" style={{marginBottom:0,alignSelf:"center"}}>{d}</p>
              </div>
            ))}
          <div style={{marginTop:32}}><button className="btn" onClick={()=>go("rapporten")}>Ontdek uw type</button></div>
        </div>
      </section>
      <div className="sec-divider"/>
      <section className="sec wh">
        <div className="cont nw">
          <div className="label">Veelgestelde vragen</div>
          <h2 className="h1" style={{marginBottom:32}}>Vragen over<br/><em>het systeem</em></h2>
          {faqs.map(([q,a],i)=>(
            <div className="faq-item" key={i}>
              <div className="faq-q" onClick={()=>setFaq(faq===i?null:i)}>{q}<span style={{fontSize:".7rem",color:"var(--gold)",transition:"transform .3s",transform:faq===i?"rotate(45deg)":"rotate(0deg)",display:"inline-block"}}>+</span></div>
              {faq===i&&<div className="faq-a">{a}</div>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function RapportenPage({go}){
  const hd=REPORTS.filter(r=>!["numerologie","horoscoop"].includes(r.id));
  const other=REPORTS.filter(r=>["numerologie","horoscoop"].includes(r.id));
  return(
    <div className="pg">
      <section className="sec dk" style={{paddingTop:100}}>
        <div className="cont">
          <div className="label lgt">Onze diensten</div>
          <h1 className="h1 lgt" style={{maxWidth:600}}>Alle rapporten van de<br/><em>Faculty of Human Design</em></h1>
          <p className="p lgt" style={{maxWidth:520,marginTop:8}}>Elk rapport is gebaseerd op exacte astronomische berekeningen van uw geboortedata. Geen generieke profielen — uitsluitend persoonlijke analyse.</p>
        </div>
      </section>
      <section className="sec bg">
        <div className="cont">
          <div className="label">Human Design</div>
          <h2 className="h2" style={{marginBottom:32}}>Human Design rapporten</h2>
          <div className="g3">
            {hd.map(r=>(
              <div className="rcard" key={r.id} onClick={()=>go("rapport-"+r.id)}>
                <div className="rcard-top">
                  {r.tag&&<div className="rcard-tag">{r.tag}</div>}
                  <div className="rcard-icon">{r.icon}</div>
                  <div className="rcard-title">{r.title}</div>
                  <div className="rcard-tagline">{r.tagline}</div>
                </div>
                <div className="rcard-div"/>
                <div className="rcard-bot"><div className="rcard-price">{r.price}</div><div className="rcard-link">Bekijken</div></div>
              </div>
            ))}
          </div>
          <div style={{height:1,background:"var(--line)",margin:"56px 0 48px"}}/>
          <div className="label">Overige disciplines</div>
          <h2 className="h2" style={{marginBottom:32}}>Numerologie & Astrologie</h2>
          <div className="g2" style={{maxWidth:760}}>
            {other.map(r=>(
              <div className="rcard" key={r.id} onClick={()=>go("rapport-"+r.id)}>
                <div className="rcard-top">
                  {r.tag&&<div className="rcard-tag">{r.tag}</div>}
                  <div className="rcard-icon">{r.icon}</div>
                  <div className="rcard-title">{r.title}</div>
                  <div className="rcard-tagline">{r.tagline}</div>
                </div>
                <div className="rcard-div"/>
                <div className="rcard-bot"><div className="rcard-price">{r.price}</div><div className="rcard-link">Bekijken</div></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function ReportDetailPage({rpt,go,onDone}){
  return(
    <div className="pg">
      <div className="rdh">
        <div className="rdh-inner">
          <div>
            <div className="rdh-lbl">Faculty of Human Design — {rpt.icon} Rapport</div>
            <h1 className="rdh-title">{rpt.title}</h1>
            <div className="rdh-tagline">{rpt.tagline}</div>
            <div className="rdh-meta">
              <span className="rdh-m">{rpt.pages} pagina's</span>
              <span className="rdh-m">{rpt.sections} secties</span>
              <span className="rdh-m">Direct als PDF</span>
              <span className="rdh-m">{rpt.sub}</span>
            </div>
          </div>
          <div className="rdh-box">
            <div className="rdh-price">{rpt.price}</div>
            <div className="rdh-sub">{rpt.sub}</div>
            <button className="rdh-btn" onClick={()=>document.getElementById("bestel")?.scrollIntoView({behavior:"smooth"})}>Rapport bestellen</button>
          </div>
        </div>
      </div>
      <section className="sec bg">
        <div className="cont">
          <div className="g2" style={{gap:60,alignItems:"start"}}>
            <div>
              <div className="label">Over dit rapport</div>
              <h2 className="h2">{rpt.title}</h2>
              <p className="p" style={{fontSize:".9rem",lineHeight:2}}>{rpt.intro}</p>
              <div className="for-box">
                <div className="for-lbl">Voor wie</div>
                <div className="for-txt">{rpt.for}</div>
              </div>
            </div>
            <div>
              <div className="label">Inhoud van het rapport</div>
              <h2 className="h2" style={{marginBottom:20}}>Dit staat erin</h2>
              <ul className="inc-list">
                {rpt.includes.map((item,i)=>(
                  <li className="inc-item" key={i}><div className="inc-dot"/>{item}</li>
                ))}
              </ul>
              <div style={{marginTop:24,padding:"16px 20px",background:"#fff",border:"1px solid var(--line)"}}>
                <div style={{fontSize:".46rem",letterSpacing:"4px",textTransform:"uppercase",color:"var(--gold)",marginBottom:6}}>Levertijd</div>
                <div style={{fontSize:".82rem",fontWeight:300,color:"var(--txt)"}}>Chart direct berekend · Rapport binnen 1–2 minuten beschikbaar als PDF</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="sec-divider"/>
      <ReportForm rpt={rpt} onDone={onDone}/>
    </div>
  );
}

function BlogPage(){
  const posts=[{tag:"Human Design",title:"Het verschil tussen Type en Strategie",exc:"Type en Strategie worden vaak als synoniem gebruikt, maar zijn fundamenteel verschillend. Type beschrijft uw energetische aard; Strategie beschrijft hoe u het beste opereert.",date:"12 april 2025"},{tag:"Autoriteit",title:"Innerlijke autoriteit: hoe u uw beste beslissingen neemt",exc:"Uw autoriteit in Human Design is het meest consequente instrument voor besluitvorming dat u bezit. Maar wat houdt elk type autoriteit precies in?",date:"28 maart 2025"},{tag:"Centra",title:"Open centra: conditionering versus wijsheid",exc:"Open centra absorberen de energie van de omgeving. Dit is tegelijkertijd uw grootste bron van conditionering én uw diepste bron van wijsheid.",date:"15 maart 2025"},{tag:"Numerologie",title:"De relatie tussen Human Design en Numerologie",exc:"Beide systemen gebruiken uw geboortedata als uitgangspunt. Maar wat zeggen de getallen die de numerologie berekent over uw Human Design chart?",date:"1 maart 2025"},{tag:"Geschiedenis",title:"De oorsprong van Human Design op Ibiza",exc:"In januari 1987 ontving Ra Uru Hu het Human Design systeem gedurende acht dagen op het eiland Ibiza. Wat is er precies overgeleverd, en hoe is het systeem sindsdien ontwikkeld?",date:"14 februari 2025"},{tag:"Astrologie",title:"Ascendant en Human Design: twee lenzen op hetzelfde moment",exc:"Zowel uw ascendant als uw Human Design chart worden berekend op het moment van uw geboorte. Wat zien deze twee systemen elk op hun eigen manier?",date:"2 februari 2025"}];
  return(
    <div className="pg">
      <section className="sec dk" style={{paddingTop:100}}>
        <div className="cont"><div className="label lgt">Kennis</div><h1 className="h1 lgt">Inzichten &<br/><em>Achtergronden</em></h1></div>
      </section>
      <section className="sec bg">
        <div className="cont nw">
          {posts.map((p,i)=>(
            <div className="blog-card" key={i}>
              <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:24,alignItems:"start"}}>
                <div>
                  <div className="blog-tag">{p.tag}</div>
                  <div className="blog-title">{p.title}</div>
                  <div className="blog-exc">{p.exc}</div>
                </div>
                <div style={{fontSize:".5rem",letterSpacing:"2px",color:"#9a9a8a",textTransform:"uppercase",whiteSpace:"nowrap",marginTop:4}}>{p.date}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function OverPage({go}){
  return(
    <div className="pg">
      <section className="sec dk" style={{paddingTop:100}}>
        <div className="cont"><div className="label lgt">Over ons</div><h1 className="h1 lgt">Faculty of<br/><em>Human Design</em></h1></div>
      </section>
      <section className="sec bg">
        <div className="cont">
          <div className="g2" style={{gap:60,alignItems:"start"}}>
            <div>
              <div className="label">Het instituut</div>
              <h2 className="h2">Opgericht op het eiland<br/><em>waar het begon</em></h2>
              <p className="p">De Faculty of Human Design is in 2014 opgericht op het eiland Ibiza — hetzelfde eiland waar Ra Uru Hu in 1987 het Human Design systeem ontving. Dat is geen toeval.</p>
              <p className="p">Wij zijn gespecialiseerd in de productie van persoonlijke rapporten op basis van Human Design, Numerologie en Geboorteastrologie. Alle rapporten worden gegenereerd op basis van exacte astronomische berekeningen van uw geboortedata.</p>
              <p className="p">Onze focus is smal en bewust: wij bieden geen cursussen, coachingstrajecten of live readings. Uitsluitend diepgaande, nauwkeurige geschreven analyse.</p>
              <div className="stats-row">
                {[["2014","Opgericht"],["2.400+","Rapporten"],["8","Rapport soorten"],["4.9","Beoordeling"]].map(([n,l])=>(
                  <div key={l}><div className="stat-n">{n}</div><div className="stat-l">{l}</div></div>
                ))}
              </div>
            </div>
            <div>
              <div style={{background:"#fff",border:"1px solid var(--line)",padding:"32px"}}>
                <div className="label" style={{marginBottom:12}}>Onze aanpak</div>
                {[["Exacte berekeningen","Alle charts worden berekend op basis van de Meeus ephemeris — dezelfde algoritmen als professionele astronomische software."],["Persoonlijke analyse","Geen templates of generieke teksten. Elk rapport is gegenereerd op basis van uw specifieke chart."],["Drie disciplines","Human Design, Numerologie en Astrologie — elk vanuit hun eigen methodologie toegepast."],["Directe levering","Rapport beschikbaar als PDF binnen 1–2 minuten na invoer van uw gegevens."]].map(([t,d])=>(
                  <div key={t} style={{borderBottom:"1px solid var(--line)",padding:"14px 0"}}>
                    <div style={{fontSize:".78rem",fontWeight:400,color:"var(--d)",marginBottom:4}}>{t}</div>
                    <div style={{fontSize:".76rem",fontWeight:300,color:"var(--txt)",lineHeight:1.65}}>{d}</div>
                  </div>
                ))}
              </div>
              <div style={{marginTop:20}}><button className="btn" style={{width:"100%"}} onClick={()=>go("rapporten")}>Bekijk alle rapporten</button></div>
            </div>
          </div>
        </div>
      </section>
      <section className="sec img">
        <div className="sec-bg-img" style={{backgroundImage:"url("+IMG.ibiza+")"}}/>
        <div className="sec-ov"/>
        <div className="sec-rel cont">
          <div className="label lgt">Ibiza, Spanje</div>
          <h2 className="h1 lgt" style={{maxWidth:500}}>Het eiland waar<br/><em>het systeem werd ontvangen</em></h2>
          <p className="p lgt" style={{maxWidth:440}}>In januari 1987 ontving Ra Uru Hu het Human Design systeem gedurende acht dagen op Ibiza. Wij zijn gevestigd op ditzelfde eiland, vanuit respect voor de oorsprong.</p>
        </div>
      </section>
    </div>
  );
}

function ContactPage(){
  const[form,setForm]=useState({name:"",email:"",subject:"",msg:""});
  const ch=e=>setForm(f=>({...f,[e.target.name]:e.target.value}));
  return(
    <div className="pg">
      <section className="sec dk" style={{paddingTop:100}}>
        <div className="cont"><div className="label lgt">Contact</div><h1 className="h1 lgt">Neem<br/><em>contact op</em></h1></div>
      </section>
      <section className="sec bg">
        <div className="cont nw">
          <div className="contact-grid">
            <div>
              <div className="label">Contactgegevens</div>
              <h2 className="h2" style={{marginBottom:28}}>Faculty of<br/><em>Human Design</em></h2>
              {[["Locatie","Ibiza, Spanje"],["E-mail","info@facultyofhumandesign.com"],["Reactietijd","Binnen 1 werkdag"],["Rapporten","Direct beschikbaar na bestelling"]].map(([l,v])=>(
                <div className="ci" key={l}><div className="ci-lbl">{l}</div><div className="ci-val">{v}</div></div>
              ))}
              <div style={{borderTop:"1px solid var(--line)",paddingTop:20,marginTop:4}}>
                <div className="label" style={{marginBottom:8}}>Veelgestelde vragen</div>
                <p className="p sm">Voor vragen over geboortegegevens, levertijden of inhoud van rapporten verwijzen wij u graag naar de <span style={{color:"var(--gold)",cursor:"pointer"}}>FAQ op de pagina Wat is Human Design</span>.</p>
              </div>
            </div>
            <div>
              <div className="form-wrap">
                <div className="form-title">Stuur een bericht</div>
                <div className="form-sub" style={{marginBottom:20}}>Voor vragen die niet in onze FAQ staan beantwoord.</div>
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  <div className="fg"><label className="flbl">Naam</label><input className="finp" name="name" value={form.name} onChange={ch} placeholder="Uw naam"/></div>
                  <div className="fg"><label className="flbl">E-mailadres</label><input className="finp" name="email" type="email" value={form.email} onChange={ch} placeholder="uw@email.nl"/></div>
                  <div className="fg"><label className="flbl">Onderwerp</label><input className="finp" name="subject" value={form.subject} onChange={ch} placeholder="Onderwerp van uw vraag"/></div>
                  <div className="fg"><label className="flbl">Bericht</label><textarea className="cf-area" name="msg" value={form.msg} onChange={ch} placeholder="Uw vraag of opmerking"/></div>
                  <button className="btn" onClick={()=>alert("Bedankt voor uw bericht. Wij reageren binnen 1 werkdag.")}>Verstuur bericht</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ReportResultPage({chart,form,report,rpt,go}){
  const secs=report.split(/###\s+/).filter(Boolean).map(s=>{const l=s.trim().split("\n");return{t:l[0],b:l.slice(1).join("\n").trim()};});
  const dlPDF=()=>{
    const btn=document.getElementById("dlb");
    if(btn){btn.textContent="PDF wordt voorbereid...";btn.disabled=true;}
    const win=window.open("","_blank");
    const bh=secs.map(s=>"<h2>"+s.t+"</h2>"+s.b.split("\n").map(x=>x?"<p>"+x+"</p>":"").join("")).join("");
    const meta=chart?Object.entries(chart.isNumerology?{Levenspad:chart.lp,Uitdrukking:chart.exp,Ziel:chart.soul,Persoonlijkheid:chart.pers,"Pers. Jaar":chart.py,Rijping:chart.mat}:chart.isHoroscoop?{Zonneteken:chart.sun_sign,Ascendant:chart.ascendant?.sign,Midhemel:chart.mc?.sign,"Dom. element":chart.dom_element}:{Type:chart.type,Strategie:chart.strat,Autoriteit:chart.auth,Profiel:chart.profile,"Inkarnatie-Kruis":"Poort "+chart.cross,Gedefinieerd:(chart.definedCenters||[]).join(", ")||"geen"}).map(([k,v])=>"<tr><td>"+k+"</td><td>"+v+"</td></tr>").join(""):"";
    win.document.write("<!DOCTYPE html><html><head><meta charset=UTF-8><title>"+rpt.title+" — "+form.name+"</title><link href='https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400&display=swap' rel=stylesheet><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Jost,sans-serif;font-weight:300;background:#fff;color:#1a1a16}.cover{min-height:100vh;background:#1a1a16;display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-end;padding:72px;page-break-after:always;position:relative}.cv-inst{font-size:9px;letter-spacing:5px;text-transform:uppercase;color:rgba(154,128,80,.6);margin-bottom:24px}.cv-title{font-family:Cormorant Garamond,serif;font-size:52px;font-weight:300;color:#fff;line-height:1.05;margin-bottom:12px}.cv-name{font-family:Cormorant Garamond,serif;font-size:28px;font-style:italic;color:rgba(255,255,255,.5);margin-bottom:32px}.cv-meta{font-size:10px;letter-spacing:3px;color:rgba(255,255,255,.25);text-transform:uppercase;line-height:2.2}.cv-foot{position:absolute;top:40px;right:52px;font-size:9px;letter-spacing:3px;color:rgba(255,255,255,.18);text-transform:uppercase}.content{max-width:720px;margin:0 auto;padding:56px 52px}.mbox{border-left:2px solid rgba(154,128,80,.4);padding:18px 22px;margin:0 0 40px;background:#fafaf8}table{width:100%;border-collapse:collapse}td{padding:6px 12px 6px 0;font-size:12px;color:#444;border-bottom:1px solid #f0ede8}td:first-child{font-weight:500;color:#9a8050;width:160px}h2{font-family:Cormorant Garamond,serif;font-size:21px;font-weight:400;color:#1a1a16;margin:44px 0 12px;padding-bottom:8px;border-bottom:1px solid #e8e5e0;page-break-after:avoid}p{font-size:13px;line-height:2;color:#3a3a32;margin-bottom:12px}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body><div class=cover><div class=cv-inst>Faculty of Human Design — Ibiza</div><div class=cv-title>"+rpt.title+"</div><div class=cv-name>"+form.name+"</div><div class=cv-meta>Geboren "+form.day+"-"+form.month+"-"+form.year+(form.place?" — "+form.place:"")+"<br><br>Opgesteld door Faculty of Human Design<br>Ibiza, Spanje</div><div class=cv-foot>Strikt persoonlijk & vertrouwelijk</div></div><div class=content><div class=mbox><table>"+meta+"</table></div>"+bh+"</div><script>window.onload=function(){window.print();}<\/script></body></html>");
    win.document.close();
    if(btn){btn.textContent="Download PDF";btn.disabled=false;}
  };

  const barData=chart?.isNumerology?[["Levenspad",chart.lp+" — "+chart.lpName],["Uitdrukking",chart.exp+" — "+chart.expName],["Ziel",chart.soul+" — "+chart.soulName],["Pers. Jaar",chart.py],["Rijping",chart.mat],["Masters",chart.masters?.length>0?chart.masters.join(", "):"geen"]]:chart?.isHoroscoop?[["Zonneteken",chart.sun_sign],["Ascendant",chart.ascendant?.degree+"° "+chart.ascendant?.sign],["Midhemel",chart.mc?.degree+"° "+chart.mc?.sign],["Dom. element",chart.dom_element],["Dom. modaliteit",chart.dom_modality||"—"],["Aspecten",(chart.aspects||[]).length+" gevonden"]]:[["Type",chart?.type],["Strategie",chart?.strat],["Autoriteit",chart?.auth],["Profiel",chart?.profile],["Inkarnatie-Kruis","Poort "+(chart?.cross||"")],["Gedefinieerd",(chart?.definedCenters||[]).join(", ")||"geen"]];

  return(
    <div className="report-pg">
      <div className="report-hd">
        <div className="report-inst">Faculty of Human Design — Ibiza</div>
        <div className="report-name">{rpt.title}</div>
        <div className="report-meta">{form.name} — {form.day}-{form.month}-{form.year}{form.place?" — "+form.place:""}</div>
        <button id="dlb" className="dl-btn" onClick={dlPDF}>Download PDF</button>
        <p style={{fontSize:".58rem",color:"#9a9a8a",marginTop:6}}>Opent printvenster — kies "Opslaan als PDF"</p>
      </div>
      {chart&&<div className="report-bar">
        <div className="rbg">{barData.map(([l,v])=><div key={l}><div className="rbl">{l}</div><div className="rbv">{v}</div></div>)}</div>
      </div>}
      <div className="report-body">
        {secs.map((s,i)=><div key={i}><div className="rpt-hd">{s.t}</div><div className="rpt-body">{s.b}</div></div>)}
      </div>
      <div style={{textAlign:"center",padding:"32px 0"}}>
        <button className="btn out" onClick={()=>go("rapporten")}>Nog een rapport bestellen</button>
      </div>
    </div>
  );
}

// ─── Router ───────────────────────────────────────────────────────────────────
export default function App(){
  const[page,setPage]=useState("home");
  const[result,setResult]=useState(null);
  const go=p=>{setPage(p);window.scrollTo(0,0);};
  const onDone=(chart,form,report,rpt)=>{setResult({chart,form,report,rpt});setPage("result");window.scrollTo(0,0);};
  const currentRpt=page.startsWith("rapport-")?REPORTS.find(r=>r.id===page.replace("rapport-","")):null;

  return(
    <div>
      <style>{F}{S}</style>
      {page!=="result"&&<Nav page={page} go={go}/>}
      {page==="home"&&<HomePage go={go}/>}
      {page==="wat"&&<WatPage go={go}/>}
      {page==="rapporten"&&<RapportenPage go={go}/>}
      {page.startsWith("rapport-")&&currentRpt&&<ReportDetailPage rpt={currentRpt} go={go} onDone={onDone}/>}
      {page==="blog"&&<BlogPage/>}
      {page==="over"&&<OverPage go={go}/>}
      {page==="contact"&&<ContactPage/>}
      {page==="result"&&result&&<ReportResultPage {...result} go={go}/>}
      {page!=="result"&&<Footer go={go}/>}
    </div>
  );
}