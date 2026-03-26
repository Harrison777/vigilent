/**
 * historical.js — Comprehensive Historical Event Database for VIGILENT Agent
 * Military history from ancient civilizations through modern conflicts
 * Inspired by military history channels and documentaries
 */

// ═══════════════════════════════════════════════════════════════
// ANCIENT EGYPT (3100–30 BC)
// ═══════════════════════════════════════════════════════════════
const ANCIENT_EGYPT = [
  { id: 'eg-01', title: 'Unification of Upper & Lower Egypt', year: '3100 BC', type: 'conquest', lat: 25.70, lon: 32.65, description: 'King Narmer unites Upper and Lower Egypt, founding the First Dynasty', parties: ['Egypt'], region: 'Egypt', era: 'Ancient Egypt' },
  { id: 'eg-02', title: 'Construction of the Great Pyramid', year: '2560 BC', type: 'achievement', lat: 29.979, lon: 31.134, description: 'The Great Pyramid of Giza completed for Pharaoh Khufu — tallest structure for 3,800 years', parties: ['Egypt'], region: 'Egypt', era: 'Ancient Egypt' },
  { id: 'eg-03', title: 'Battle of Kadesh', year: '1274 BC', type: 'battle', lat: 34.557, lon: 36.510, description: 'Ramesses II vs Hittites — largest chariot battle in history, ending in treaty', parties: ['Egypt', 'Hittite Empire'], region: 'Levant', era: 'Ancient Egypt' },
  { id: 'eg-04', title: 'Battle of the Delta', year: '1175 BC', type: 'battle', lat: 31.41, lon: 30.75, description: 'Ramesses III defeats the Sea Peoples in the Nile Delta, saving Egypt', parties: ['Egypt', 'Sea Peoples'], region: 'Egypt', era: 'Ancient Egypt' },
  { id: 'eg-05', title: 'Cleopatra\'s death — End of Ptolemaic Egypt', year: '30 BC', type: 'death', lat: 31.200, lon: 29.919, description: 'Cleopatra VII dies in Alexandria, Egypt becomes a Roman province', parties: ['Egypt', 'Rome'], region: 'Egypt', era: 'Ancient Egypt' },
];

// ═══════════════════════════════════════════════════════════════
// ANCIENT GREECE & PERSIA (500–323 BC)
// ═══════════════════════════════════════════════════════════════
const ANCIENT_GREECE = [
  { id: 'gr-01', title: 'Battle of Marathon', year: '490 BC', type: 'battle', lat: 38.118, lon: 23.972, description: 'Athenian hoplites defeat Persian invasion force — runner legend born', parties: ['Athens', 'Persia'], region: 'Greece', era: 'Ancient Greece' },
  { id: 'gr-02', title: 'Battle of Thermopylae', year: '480 BC', type: 'battle', lat: 38.796, lon: 22.536, description: 'King Leonidas and 300 Spartans hold the pass against Xerxes\' massive army', parties: ['Sparta', 'Persia'], region: 'Greece', era: 'Ancient Greece' },
  { id: 'gr-03', title: 'Battle of Salamis', year: '480 BC', type: 'battle', lat: 37.947, lon: 23.568, description: 'Greek naval victory in the strait of Salamis — Persian fleet destroyed', parties: ['Greek Alliance', 'Persia'], region: 'Greece', era: 'Ancient Greece' },
  { id: 'gr-04', title: 'Battle of Plataea', year: '479 BC', type: 'battle', lat: 38.22, lon: 23.27, description: 'Decisive Greek victory ending the second Persian invasion of Greece', parties: ['Greek Alliance', 'Persia'], region: 'Greece', era: 'Ancient Greece' },
  { id: 'gr-05', title: 'Peloponnesian War begins', year: '431 BC', type: 'war', lat: 37.971, lon: 23.727, description: 'Athens vs Sparta — decades-long civil war that reshaped Greece', parties: ['Athens', 'Sparta'], region: 'Greece', era: 'Ancient Greece' },
  { id: 'gr-06', title: 'Fall of Athens', year: '404 BC', type: 'siege', lat: 37.971, lon: 23.727, description: 'Sparta besieges Athens, ending the Peloponnesian War — Long Walls torn down', parties: ['Sparta', 'Athens'], region: 'Greece', era: 'Ancient Greece' },
  { id: 'gr-07', title: 'Battle of Leuctra', year: '371 BC', type: 'battle', lat: 38.31, lon: 23.05, description: 'Theban general Epaminondas shatters Spartan invincibility with oblique order', parties: ['Thebes', 'Sparta'], region: 'Greece', era: 'Ancient Greece' },
];

// ═══════════════════════════════════════════════════════════════
// ALEXANDER THE GREAT (336–323 BC)
// ═══════════════════════════════════════════════════════════════
const ALEXANDER = [
  { id: 'alex-01', title: 'Coronation of Alexander III', year: '336 BC', type: 'political', lat: 40.519, lon: 22.348, description: 'Alexander becomes King of Macedon after assassination of Philip II', parties: ['Macedon'], region: 'Greece', era: 'Alexander the Great' },
  { id: 'alex-02', title: 'Battle of Granicus', year: '334 BC', type: 'battle', lat: 40.33, lon: 27.55, description: 'First major victory against Persian forces at the Granicus River', parties: ['Macedon', 'Persia'], region: 'Asia Minor', era: 'Alexander the Great' },
  { id: 'alex-03', title: 'Siege of Halicarnassus', year: '334 BC', type: 'siege', lat: 37.037, lon: 27.424, description: 'Siege and capture of the Persian stronghold at modern-day Bodrum', parties: ['Macedon', 'Persia'], region: 'Asia Minor', era: 'Alexander the Great' },
  { id: 'alex-04', title: 'Battle of Issus', year: '333 BC', type: 'battle', lat: 36.83, lon: 36.18, description: 'Decisive defeat of Darius III\'s larger army in southern Turkey', parties: ['Macedon', 'Persia'], region: 'Near East', era: 'Alexander the Great' },
  { id: 'alex-05', title: 'Siege of Tyre', year: '332 BC', type: 'siege', lat: 33.27, lon: 35.20, description: 'Seven-month siege of the island fortress, Alexander builds a causeway', parties: ['Macedon', 'Tyre'], region: 'Levant', era: 'Alexander the Great' },
  { id: 'alex-06', title: 'Conquest of Egypt & founding of Alexandria', year: '331 BC', type: 'conquest', lat: 31.200, lon: 29.919, description: 'Alexander conquers Egypt, founds the city of Alexandria', parties: ['Macedon', 'Egypt'], region: 'Egypt', era: 'Alexander the Great' },
  { id: 'alex-07', title: 'Battle of Gaugamela', year: '331 BC', type: 'battle', lat: 36.36, lon: 43.45, description: 'Decisive battle destroying the Persian Empire — Darius III routed', parties: ['Macedon', 'Persia'], region: 'Mesopotamia', era: 'Alexander the Great' },
  { id: 'alex-08', title: 'Capture of Babylon', year: '331 BC', type: 'conquest', lat: 32.542, lon: 44.421, description: 'Alexander enters Babylon in triumph, the city surrenders peacefully', parties: ['Macedon', 'Babylon'], region: 'Mesopotamia', era: 'Alexander the Great' },
  { id: 'alex-09', title: 'Burning of Persepolis', year: '330 BC', type: 'conquest', lat: 29.935, lon: 52.891, description: 'Alexander captures and burns the Achaemenid ceremonial capital', parties: ['Macedon', 'Persia'], region: 'Persia', era: 'Alexander the Great' },
  { id: 'alex-10', title: 'Campaign in Bactria & Sogdiana', year: '329 BC', type: 'campaign', lat: 39.65, lon: 66.96, description: 'Alexander campaigns through Central Asia (modern Uzbekistan)', parties: ['Macedon', 'Bactria'], region: 'Central Asia', era: 'Alexander the Great' },
  { id: 'alex-11', title: 'Battle of the Hydaspes', year: '326 BC', type: 'battle', lat: 32.49, lon: 73.63, description: 'Final major battle against King Porus on the Jhelum River in India', parties: ['Macedon', 'India'], region: 'India', era: 'Alexander the Great' },
  { id: 'alex-12', title: 'Army mutiny at the Hyphasis', year: '326 BC', type: 'political', lat: 31.52, lon: 75.34, description: 'Troops refuse to march further east, forcing Alexander to turn back', parties: ['Macedon'], region: 'India', era: 'Alexander the Great' },
  { id: 'alex-13', title: 'Death of Alexander in Babylon', year: '323 BC', type: 'death', lat: 32.542, lon: 44.421, description: 'Alexander dies of fever at age 32 in Nebuchadnezzar\'s palace', parties: ['Macedon'], region: 'Mesopotamia', era: 'Alexander the Great' },
];

// ═══════════════════════════════════════════════════════════════
// ROMAN EMPIRE (753 BC – 476 AD)
// ═══════════════════════════════════════════════════════════════
const ROME = [
  { id: 'rome-01', title: 'Founding of Rome', year: '753 BC', type: 'founding', lat: 41.891, lon: 12.486, description: 'Legendary founding of Rome on the Palatine Hill by Romulus', parties: ['Rome'], region: 'Italy', era: 'Roman Empire' },
  { id: 'rome-02', title: 'Battle of Cannae', year: '216 BC', type: 'battle', lat: 41.305, lon: 16.134, description: 'Hannibal\'s greatest victory — double-envelopment destroys 70,000 Romans', parties: ['Carthage', 'Rome'], region: 'Italy', era: 'Roman Empire' },
  { id: 'rome-03', title: 'Battle of Zama', year: '202 BC', type: 'battle', lat: 36.19, lon: 8.20, description: 'Scipio Africanus defeats Hannibal in Africa — ending Second Punic War', parties: ['Rome', 'Carthage'], region: 'North Africa', era: 'Roman Empire' },
  { id: 'rome-04', title: 'Destruction of Carthage', year: '146 BC', type: 'siege', lat: 36.854, lon: 10.323, description: 'Rome destroys Carthage completely, salts the earth', parties: ['Rome', 'Carthage'], region: 'North Africa', era: 'Roman Empire' },
  { id: 'rome-05', title: 'Crossing of the Rubicon', year: '49 BC', type: 'political', lat: 44.12, lon: 12.41, description: 'Julius Caesar crosses the Rubicon — "the die is cast" — civil war begins', parties: ['Caesar', 'Senate'], region: 'Italy', era: 'Roman Empire' },
  { id: 'rome-06', title: 'Assassination of Julius Caesar', year: '44 BC', type: 'death', lat: 41.895, lon: 12.477, description: 'Caesar stabbed 23 times on the Ides of March in the Senate', parties: ['Caesar', 'Brutus', 'Cassius'], region: 'Italy', era: 'Roman Empire' },
  { id: 'rome-07', title: 'Battle of Actium', year: '31 BC', type: 'battle', lat: 38.951, lon: 20.718, description: 'Octavian defeats Antony and Cleopatra, becomes sole ruler of Rome', parties: ['Octavian', 'Antony', 'Cleopatra'], region: 'Greece', era: 'Roman Empire' },
  { id: 'rome-08', title: 'Battle of Teutoburg Forest', year: '9 AD', type: 'battle', lat: 52.41, lon: 8.13, description: 'Germanic tribes annihilate 3 Roman legions — Rome\'s greatest defeat', parties: ['Germanic Tribes', 'Rome'], region: 'Germany', era: 'Roman Empire' },
  { id: 'rome-09', title: 'Eruption of Vesuvius — Pompeii', year: '79 AD', type: 'disaster', lat: 40.751, lon: 14.487, description: 'Vesuvius erupts, burying Pompeii and Herculaneum under ash', parties: ['Rome'], region: 'Italy', era: 'Roman Empire' },
  { id: 'rome-10', title: 'Sack of Rome by Visigoths', year: '410 AD', type: 'siege', lat: 41.891, lon: 12.486, description: 'Alaric I leads the Visigoths to sack Rome — first time in 800 years', parties: ['Visigoths', 'Rome'], region: 'Italy', era: 'Roman Empire' },
  { id: 'rome-11', title: 'Fall of the Western Roman Empire', year: '476 AD', type: 'fall', lat: 41.891, lon: 12.486, description: 'Odoacer deposes Romulus Augustulus — end of the Western Roman Empire', parties: ['Rome', 'Germanic Tribes'], region: 'Italy', era: 'Roman Empire' },
];

// ═══════════════════════════════════════════════════════════════
// VIKING AGE (793–1066 AD)
// ═══════════════════════════════════════════════════════════════
const VIKINGS = [
  { id: 'vik-01', title: 'Raid on Lindisfarne', year: '793', type: 'attack', lat: 55.669, lon: -1.800, description: 'Viking raid on Lindisfarne monastery — beginning of the Viking Age', parties: ['Vikings', 'Northumbria'], region: 'England', era: 'Viking Age' },
  { id: 'vik-02', title: 'Siege of Paris', year: '845', type: 'siege', lat: 48.856, lon: 2.352, description: 'Viking fleet of 120 ships sails up the Seine and sacks Paris', parties: ['Vikings', 'Francia'], region: 'France', era: 'Viking Age' },
  { id: 'vik-03', title: 'Great Heathen Army invades England', year: '865', type: 'invasion', lat: 53.958, lon: -1.082, description: 'Massive Viking army lands in East Anglia, conquers much of England', parties: ['Vikings', 'Anglo-Saxons'], region: 'England', era: 'Viking Age' },
  { id: 'vik-04', title: 'Alfred the Great defeats Vikings at Edington', year: '878', type: 'battle', lat: 51.26, lon: -2.11, description: 'King Alfred defeats Guthrum\'s army, establishing the Danelaw boundary', parties: ['Wessex', 'Vikings'], region: 'England', era: 'Viking Age' },
  { id: 'vik-05', title: 'Discovery of Vinland (North America)', year: '1000', type: 'achievement', lat: 51.59, lon: -55.53, description: 'Leif Erikson reaches North America, 500 years before Columbus', parties: ['Vikings'], region: 'North America', era: 'Viking Age' },
  { id: 'vik-06', title: 'Battle of Stamford Bridge', year: '1066', type: 'battle', lat: 53.989, lon: -0.912, description: 'Harold Godwinson defeats Harald Hardrada — end of the Viking Age', parties: ['England', 'Norway'], region: 'England', era: 'Viking Age' },
  { id: 'vik-07', title: 'Battle of Hastings', year: '1066', type: 'battle', lat: 50.914, lon: 0.488, description: 'William the Conqueror defeats Harold — Norman conquest of England', parties: ['Normandy', 'England'], region: 'England', era: 'Viking Age' },
];

// ═══════════════════════════════════════════════════════════════
// CRUSADES (1095–1291)
// ═══════════════════════════════════════════════════════════════
const CRUSADES = [
  { id: 'cru-01', title: 'Council of Clermont — First Crusade called', year: '1095', type: 'political', lat: 45.780, lon: 3.087, description: 'Pope Urban II calls for crusade to recapture the Holy Land — "Deus Vult!"', parties: ['Papacy', 'Europe'], region: 'France', era: 'Crusades' },
  { id: 'cru-02', title: 'Siege of Antioch', year: '1098', type: 'siege', lat: 36.20, lon: 36.16, description: 'Crusaders capture Antioch after 8-month siege, then defend against relief army', parties: ['Crusaders', 'Seljuk Turks'], region: 'Near East', era: 'Crusades' },
  { id: 'cru-03', title: 'Siege of Jerusalem', year: '1099', type: 'siege', lat: 31.778, lon: 35.236, description: 'Crusaders capture Jerusalem after a 5-week siege — Kingdom of Jerusalem founded', parties: ['Crusaders', 'Fatimid Caliphate'], region: 'Holy Land', era: 'Crusades' },
  { id: 'cru-04', title: 'Battle of Hattin', year: '1187', type: 'battle', lat: 32.81, lon: 35.49, description: 'Saladin destroys Crusader army at Hattin — open road to Jerusalem', parties: ['Ayyubids', 'Crusaders'], region: 'Holy Land', era: 'Crusades' },
  { id: 'cru-05', title: 'Saladin recaptures Jerusalem', year: '1187', type: 'conquest', lat: 31.778, lon: 35.236, description: 'Saladin retakes Jerusalem after 88 years of Crusader rule', parties: ['Ayyubids', 'Crusaders'], region: 'Holy Land', era: 'Crusades' },
  { id: 'cru-06', title: 'Third Crusade — Richard vs Saladin', year: '1191', type: 'campaign', lat: 32.92, lon: 35.08, description: 'Richard the Lionheart battles Saladin at Arsuf — truce reached', parties: ['England', 'Ayyubids'], region: 'Holy Land', era: 'Crusades' },
  { id: 'cru-07', title: 'Sack of Constantinople (4th Crusade)', year: '1204', type: 'siege', lat: 41.009, lon: 28.980, description: 'Crusaders divert and sack Constantinople — greatest betrayal in Christendom', parties: ['Crusaders', 'Byzantine Empire'], region: 'Byzantine Empire', era: 'Crusades' },
  { id: 'cru-08', title: 'Fall of Acre — End of the Crusades', year: '1291', type: 'siege', lat: 32.926, lon: 35.071, description: 'Mamluks capture the last Crusader stronghold — end of the Crusader states', parties: ['Mamluks', 'Crusaders'], region: 'Holy Land', era: 'Crusades' },
];

// ═══════════════════════════════════════════════════════════════
// MONGOL EMPIRE (1206–1368)
// ═══════════════════════════════════════════════════════════════
const MONGOLS = [
  { id: 'mon-01', title: 'Rise of Genghis Khan', year: '1206', type: 'political', lat: 47.92, lon: 106.92, description: 'Temüjin unites the Mongol tribes and is proclaimed Genghis Khan', parties: ['Mongols'], region: 'Mongolia', era: 'Mongol Empire' },
  { id: 'mon-02', title: 'Siege of Beijing (Zhongdu)', year: '1215', type: 'siege', lat: 39.904, lon: 116.407, description: 'Mongols capture the Jin Dynasty capital after prolonged siege', parties: ['Mongols', 'Jin Dynasty'], region: 'China', era: 'Mongol Empire' },
  { id: 'mon-03', title: 'Destruction of Samarkand', year: '1220', type: 'conquest', lat: 39.65, lon: 66.96, description: 'Mongols sack Samarkand, jewel of the Khwarezmian Empire', parties: ['Mongols', 'Khwarezmia'], region: 'Central Asia', era: 'Mongol Empire' },
  { id: 'mon-04', title: 'Death of Genghis Khan', year: '1227', type: 'death', lat: 42.00, lon: 107.00, description: 'Genghis Khan dies during campaign against Western Xia', parties: ['Mongols'], region: 'Mongolia', era: 'Mongol Empire' },
  { id: 'mon-05', title: 'Battle of Mohi (Hungary)', year: '1241', type: 'battle', lat: 47.90, lon: 20.80, description: 'Mongol invasion of Hungary — devastating victory at the Sajó River', parties: ['Mongols', 'Hungary'], region: 'Eastern Europe', era: 'Mongol Empire' },
  { id: 'mon-06', title: 'Battle of Legnica (Poland)', year: '1241', type: 'battle', lat: 51.21, lon: 16.16, description: 'Mongols defeat combined European knight army in Silesia', parties: ['Mongols', 'Poland', 'Teutonic Knights'], region: 'Eastern Europe', era: 'Mongol Empire' },
  { id: 'mon-07', title: 'Siege of Baghdad — Fall of the Caliphate', year: '1258', type: 'siege', lat: 33.312, lon: 44.366, description: 'Hulagu Khan destroys Baghdad, ending the Abbasid Caliphate', parties: ['Mongols', 'Abbasid Caliphate'], region: 'Middle East', era: 'Mongol Empire' },
  { id: 'mon-08', title: 'Battle of Ain Jalut', year: '1260', type: 'battle', lat: 32.55, lon: 35.38, description: 'Mamluks defeat Mongols in Palestine — first major Mongol defeat', parties: ['Mamluks', 'Mongols'], region: 'Middle East', era: 'Mongol Empire' },
];

// ═══════════════════════════════════════════════════════════════
// OTTOMAN EMPIRE (1299–1922)
// ═══════════════════════════════════════════════════════════════
const OTTOMAN = [
  { id: 'ott-01', title: 'Battle of Kosovo', year: '1389', type: 'battle', lat: 42.64, lon: 21.09, description: 'Ottoman victory over Serbian-led coalition — Ottoman dominance in Balkans begins', parties: ['Ottoman Empire', 'Serbia'], region: 'Balkans', era: 'Ottoman Empire' },
  { id: 'ott-02', title: 'Fall of Constantinople', year: '1453', type: 'siege', lat: 41.009, lon: 28.980, description: 'Sultan Mehmed II captures Constantinople — end of the Byzantine Empire', parties: ['Ottoman Empire', 'Byzantine Empire'], region: 'Byzantine Empire', era: 'Ottoman Empire' },
  { id: 'ott-03', title: 'Conquest of Egypt', year: '1517', type: 'conquest', lat: 30.044, lon: 31.236, description: 'Selim I conquers the Mamluk Sultanate — Ottoman Empire becomes Caliphate', parties: ['Ottoman Empire', 'Mamluks'], region: 'Egypt', era: 'Ottoman Empire' },
  { id: 'ott-04', title: 'Siege of Vienna', year: '1529', type: 'siege', lat: 48.209, lon: 16.372, description: 'Suleiman the Magnificent besieges Vienna — high water mark of Ottoman expansion', parties: ['Ottoman Empire', 'Habsburg Empire'], region: 'Central Europe', era: 'Ottoman Empire' },
  { id: 'ott-05', title: 'Battle of Lepanto', year: '1571', type: 'battle', lat: 38.36, lon: 20.72, description: 'Holy League fleet destroys Ottoman navy — largest naval battle since antiquity', parties: ['Holy League', 'Ottoman Empire'], region: 'Mediterranean', era: 'Ottoman Empire' },
  { id: 'ott-06', title: 'Battle of Gallipoli', year: '1915', type: 'battle', lat: 40.236, lon: 26.269, description: 'Ottoman forces under Mustafa Kemal repel Allied invasion at Gallipoli', parties: ['Ottoman Empire', 'Allies'], region: 'Turkey', era: 'Ottoman Empire' },
];

// ═══════════════════════════════════════════════════════════════
// NAPOLEONIC WARS (1803–1815)
// ═══════════════════════════════════════════════════════════════
const NAPOLEON = [
  { id: 'nap-01', title: 'Coronation of Napoleon', year: '1804', type: 'political', lat: 48.853, lon: 2.349, description: 'Napoleon crowns himself Emperor at Notre-Dame Cathedral', parties: ['France'], region: 'France', era: 'Napoleonic Wars' },
  { id: 'nap-02', title: 'Battle of Trafalgar', year: '1805', type: 'battle', lat: 36.181, lon: -6.035, description: 'Nelson destroys Franco-Spanish fleet — Britannia rules the waves', parties: ['Britain', 'France', 'Spain'], region: 'Atlantic', era: 'Napoleonic Wars' },
  { id: 'nap-03', title: 'Battle of Austerlitz', year: '1805', type: 'battle', lat: 49.130, lon: 16.762, description: '"Battle of Three Emperors" — Napoleon\'s masterpiece of military strategy', parties: ['France', 'Austria', 'Russia'], region: 'Central Europe', era: 'Napoleonic Wars' },
  { id: 'nap-04', title: 'Battle of Jena–Auerstedt', year: '1806', type: 'battle', lat: 50.93, lon: 11.59, description: 'Napoleon shatters Prussian army in twin battles — Prussia collapses', parties: ['France', 'Prussia'], region: 'Germany', era: 'Napoleonic Wars' },
  { id: 'nap-05', title: 'Battle of Wagram', year: '1809', type: 'battle', lat: 48.30, lon: 16.56, description: 'Napoleon defeats Austria in massive two-day battle north of Vienna', parties: ['France', 'Austria'], region: 'Central Europe', era: 'Napoleonic Wars' },
  { id: 'nap-06', title: 'Invasion of Russia — Battle of Borodino', year: '1812', type: 'battle', lat: 55.52, lon: 35.82, description: 'Bloodiest day of the Napoleonic Wars — 70,000 casualties at Borodino', parties: ['France', 'Russia'], region: 'Russia', era: 'Napoleonic Wars' },
  { id: 'nap-07', title: 'Retreat from Moscow', year: '1812', type: 'campaign', lat: 55.751, lon: 37.618, description: 'Grande Armée of 600,000 reduced to 27,000 in catastrophic winter retreat', parties: ['France', 'Russia'], region: 'Russia', era: 'Napoleonic Wars' },
  { id: 'nap-08', title: 'Battle of Leipzig', year: '1813', type: 'battle', lat: 51.34, lon: 12.37, description: '"Battle of Nations" — largest battle before WWI, Napoleon decisively defeated', parties: ['France', 'Coalition'], region: 'Germany', era: 'Napoleonic Wars' },
  { id: 'nap-09', title: 'Battle of Waterloo', year: '1815', type: 'battle', lat: 50.680, lon: 4.412, description: 'Napoleon\'s final defeat by Wellington and Blücher — end of an era', parties: ['France', 'Britain', 'Prussia'], region: 'Belgium', era: 'Napoleonic Wars' },
  { id: 'nap-10', title: 'Exile to Saint Helena', year: '1815', type: 'exile', lat: -15.965, lon: -5.702, description: 'Napoleon exiled to remote South Atlantic island — dies there in 1821', parties: ['France', 'Britain'], region: 'South Atlantic', era: 'Napoleonic Wars' },
];

// ═══════════════════════════════════════════════════════════════
// AMERICAN CIVIL WAR (1861–1865) — "Gods and Generals" Era
// ═══════════════════════════════════════════════════════════════
const CIVIL_WAR = [
  { id: 'cw-01', title: 'Attack on Fort Sumter', year: '1861', type: 'attack', lat: 32.752, lon: -79.875, description: 'Confederate forces fire on Fort Sumter — American Civil War begins', parties: ['Confederate States', 'Union'], region: 'South Carolina', era: 'American Civil War' },
  { id: 'cw-02', title: 'First Battle of Bull Run (Manassas)', year: '1861', type: 'battle', lat: 38.813, lon: -77.521, description: 'First major battle — Stonewall Jackson earns his nickname holding the line', parties: ['Confederate States', 'Union'], region: 'Virginia', era: 'American Civil War' },
  { id: 'cw-03', title: 'Battle of Shiloh', year: '1862', type: 'battle', lat: 35.15, lon: -88.34, description: 'Bloody two-day battle in Tennessee — 23,000 casualties stun the nation', parties: ['Confederate States', 'Union'], region: 'Tennessee', era: 'American Civil War' },
  { id: 'cw-04', title: 'Battle of Antietam', year: '1862', type: 'battle', lat: 39.474, lon: -77.744, description: 'Bloodiest single day in American history — 23,000 casualties in one day', parties: ['Confederate States', 'Union'], region: 'Maryland', era: 'American Civil War' },
  { id: 'cw-05', title: 'Battle of Fredericksburg', year: '1862', type: 'battle', lat: 38.303, lon: -77.461, description: 'Robert E. Lee\'s defensive masterpiece — Union charges Marye\'s Heights', parties: ['Confederate States', 'Union'], region: 'Virginia', era: 'American Civil War' },
  { id: 'cw-06', title: 'Battle of Chancellorsville', year: '1863', type: 'battle', lat: 38.31, lon: -77.63, description: 'Lee\'s greatest victory — Jackson\'s flank march, but Jackson mortally wounded', parties: ['Confederate States', 'Union'], region: 'Virginia', era: 'American Civil War' },
  { id: 'cw-07', title: 'Death of Stonewall Jackson', year: '1863', type: 'death', lat: 38.20, lon: -79.07, description: 'Thomas "Stonewall" Jackson dies of friendly fire wounds at Guinea Station', parties: ['Confederate States'], region: 'Virginia', era: 'American Civil War' },
  { id: 'cw-08', title: 'Battle of Gettysburg', year: '1863', type: 'battle', lat: 39.811, lon: -77.225, description: 'Turning point of the war — Pickett\'s Charge repulsed, Lee retreats south', parties: ['Confederate States', 'Union'], region: 'Pennsylvania', era: 'American Civil War' },
  { id: 'cw-09', title: 'Siege of Vicksburg', year: '1863', type: 'siege', lat: 32.353, lon: -90.878, description: 'Grant captures Vicksburg — Union controls the Mississippi River', parties: ['Union', 'Confederate States'], region: 'Mississippi', era: 'American Civil War' },
  { id: 'cw-10', title: 'Battle of Chickamauga', year: '1863', type: 'battle', lat: 34.92, lon: -85.27, description: 'Last major Confederate victory — Union army trapped in Chattanooga', parties: ['Confederate States', 'Union'], region: 'Georgia', era: 'American Civil War' },
  { id: 'cw-11', title: 'Sherman\'s March to the Sea', year: '1864', type: 'campaign', lat: 33.749, lon: -84.388, description: 'Sherman\'s army marches from Atlanta to Savannah, destroying everything', parties: ['Union', 'Confederate States'], region: 'Georgia', era: 'American Civil War' },
  { id: 'cw-12', title: 'Battle of Cold Harbor', year: '1864', type: 'battle', lat: 37.59, lon: -77.27, description: 'Grant\'s costliest assault — 7,000 Union casualties in 20 minutes', parties: ['Union', 'Confederate States'], region: 'Virginia', era: 'American Civil War' },
  { id: 'cw-13', title: 'Siege of Petersburg', year: '1864–65', type: 'siege', lat: 37.228, lon: -77.402, description: '9-month siege of Petersburg — longest siege in American history', parties: ['Union', 'Confederate States'], region: 'Virginia', era: 'American Civil War' },
  { id: 'cw-14', title: 'Lee surrenders at Appomattox', year: '1865', type: 'political', lat: 37.380, lon: -78.796, description: 'Robert E. Lee surrenders to Ulysses S. Grant — Civil War ends', parties: ['Confederate States', 'Union'], region: 'Virginia', era: 'American Civil War' },
  { id: 'cw-15', title: 'Assassination of Abraham Lincoln', year: '1865', type: 'death', lat: 38.897, lon: -77.026, description: 'John Wilkes Booth assassinates Lincoln at Ford\'s Theatre', parties: ['Union'], region: 'Washington DC', era: 'American Civil War' },
];

// ═══════════════════════════════════════════════════════════════
// AMERICAN REVOLUTION (1775–1783)
// ═══════════════════════════════════════════════════════════════
const AMERICAN_REV = [
  { id: 'ar-01', title: 'Battles of Lexington and Concord', year: '1775', type: 'battle', lat: 42.449, lon: -71.229, description: '"Shot heard round the world" — first engagements of the Revolution', parties: ['Continental Army', 'Britain'], region: 'Massachusetts', era: 'American Revolution' },
  { id: 'ar-02', title: 'Battle of Bunker Hill', year: '1775', type: 'battle', lat: 42.376, lon: -71.061, description: '"Don\'t fire until you see the whites of their eyes" — costly British victory', parties: ['Continental Army', 'Britain'], region: 'Massachusetts', era: 'American Revolution' },
  { id: 'ar-03', title: 'Declaration of Independence', year: '1776', type: 'political', lat: 39.949, lon: -75.150, description: 'Continental Congress adopts the Declaration of Independence', parties: ['United States', 'Britain'], region: 'Pennsylvania', era: 'American Revolution' },
  { id: 'ar-04', title: 'Crossing of the Delaware', year: '1776', type: 'battle', lat: 40.297, lon: -74.873, description: 'Washington crosses icy Delaware River — surprise attack on Trenton', parties: ['Continental Army', 'Hessians'], region: 'New Jersey', era: 'American Revolution' },
  { id: 'ar-05', title: 'Battle of Saratoga', year: '1777', type: 'battle', lat: 43.00, lon: -73.65, description: 'Turning point — British surrender brings France into the war as ally', parties: ['Continental Army', 'Britain'], region: 'New York', era: 'American Revolution' },
  { id: 'ar-06', title: 'Winter at Valley Forge', year: '1777–78', type: 'campaign', lat: 40.102, lon: -75.444, description: 'Continental Army endures brutal winter — von Steuben drills the troops', parties: ['Continental Army'], region: 'Pennsylvania', era: 'American Revolution' },
  { id: 'ar-07', title: 'Battle of Yorktown', year: '1781', type: 'battle', lat: 37.239, lon: -76.510, description: 'Final major battle — Cornwallis surrenders, effectively ending the war', parties: ['Continental Army', 'France', 'Britain'], region: 'Virginia', era: 'American Revolution' },
];

// ═══════════════════════════════════════════════════════════════
// WORLD WAR I (1914–1918)
// ═══════════════════════════════════════════════════════════════
const WWI = [
  { id: 'ww1-01', title: 'Assassination of Archduke Franz Ferdinand', year: '1914', type: 'death', lat: 43.856, lon: 18.413, description: 'Archduke assassinated in Sarajevo by Gavrilo Princip — triggers WWI', parties: ['Austria-Hungary', 'Serbia'], region: 'Balkans', era: 'World War I' },
  { id: 'ww1-02', title: 'Battle of the Marne', year: '1914', type: 'battle', lat: 48.95, lon: 3.40, description: 'French and British halt German advance on Paris — trench warfare begins', parties: ['France', 'Britain', 'Germany'], region: 'Western Front', era: 'World War I' },
  { id: 'ww1-03', title: 'Battle of Tannenberg', year: '1914', type: 'battle', lat: 53.50, lon: 20.10, description: 'Germany annihilates Russian Second Army in East Prussia — 92,000 captured', parties: ['Germany', 'Russia'], region: 'Eastern Front', era: 'World War I' },
  { id: 'ww1-04', title: 'Battle of Gallipoli', year: '1915', type: 'battle', lat: 40.236, lon: 26.269, description: 'Allied amphibious invasion of Gallipoli peninsula repelled by Ottoman forces', parties: ['Allies', 'Ottoman Empire'], region: 'Turkey', era: 'World War I' },
  { id: 'ww1-05', title: 'Battle of Verdun', year: '1916', type: 'battle', lat: 49.16, lon: 5.39, description: '"They shall not pass" — 10-month German offensive, 700,000+ casualties combined', parties: ['France', 'Germany'], region: 'Western Front', era: 'World War I' },
  { id: 'ww1-06', title: 'Battle of the Somme', year: '1916', type: 'battle', lat: 50.01, lon: 2.69, description: 'British offensive — 57,000 British casualties on the first day alone', parties: ['Britain', 'France', 'Germany'], region: 'Western Front', era: 'World War I' },
  { id: 'ww1-07', title: 'Battle of Jutland', year: '1916', type: 'battle', lat: 57.00, lon: 6.00, description: 'Largest naval battle of WWI — British vs German High Seas Fleet', parties: ['Britain', 'Germany'], region: 'North Sea', era: 'World War I' },
  { id: 'ww1-08', title: 'Battle of Passchendaele', year: '1917', type: 'battle', lat: 50.89, lon: 3.00, description: 'British offensive in Flanders mud — 475,000 casualties for 5 miles gained', parties: ['Britain', 'Germany'], region: 'Western Front', era: 'World War I' },
  { id: 'ww1-09', title: 'US enters World War I', year: '1917', type: 'political', lat: 38.897, lon: -77.037, description: 'United States declares war on Germany after Zimmermann Telegram', parties: ['USA', 'Germany'], region: 'USA', era: 'World War I' },
  { id: 'ww1-10', title: 'Armistice — 11th hour, 11th day, 11th month', year: '1918', type: 'political', lat: 49.43, lon: 2.90, description: 'WWI ends in a railcar at Compiègne — 20 million dead', parties: ['Allies', 'Central Powers'], region: 'France', era: 'World War I' },
];

// ═══════════════════════════════════════════════════════════════
// WORLD WAR II (1939–1945)
// ═══════════════════════════════════════════════════════════════
const WWII = [
  { id: 'ww2-01', title: 'Invasion of Poland', year: '1939', type: 'invasion', lat: 52.230, lon: 21.012, description: 'Germany invades Poland — World War II begins', parties: ['Germany', 'Poland'], region: 'Eastern Europe', era: 'World War II' },
  { id: 'ww2-02', title: 'Dunkirk Evacuation', year: '1940', type: 'evacuation', lat: 51.035, lon: 2.377, description: '338,000 Allied troops evacuated from Dunkirk beaches', parties: ['Britain', 'France', 'Germany'], region: 'Western Europe', era: 'World War II' },
  { id: 'ww2-03', title: 'Battle of Britain', year: '1940', type: 'battle', lat: 51.507, lon: -0.128, description: 'RAF defeats Luftwaffe in air — "Never was so much owed by so many to so few"', parties: ['Britain', 'Germany'], region: 'Western Europe', era: 'World War II' },
  { id: 'ww2-04', title: 'Attack on Pearl Harbor', year: '1941', type: 'attack', lat: 21.365, lon: -157.976, description: 'Japanese surprise attack on US Pacific Fleet — "a date which will live in infamy"', parties: ['Japan', 'USA'], region: 'Pacific', era: 'World War II' },
  { id: 'ww2-05', title: 'Battle of El Alamein', year: '1942', type: 'battle', lat: 30.83, lon: 28.96, description: 'Montgomery defeats Rommel in North Africa — "end of the beginning"', parties: ['Britain', 'Germany'], region: 'North Africa', era: 'World War II' },
  { id: 'ww2-06', title: 'Siege of Stalingrad', year: '1942–43', type: 'battle', lat: 48.708, lon: 44.514, description: 'Bloodiest battle in history — Soviet forces encircle German 6th Army', parties: ['Soviet Union', 'Germany'], region: 'Eastern Europe', era: 'World War II' },
  { id: 'ww2-07', title: 'Battle of Midway', year: '1942', type: 'battle', lat: 28.207, lon: -177.376, description: 'Decisive US naval victory — 4 Japanese carriers sunk', parties: ['USA', 'Japan'], region: 'Pacific', era: 'World War II' },
  { id: 'ww2-08', title: 'Allied invasion of Sicily', year: '1943', type: 'invasion', lat: 37.50, lon: 14.00, description: 'Operation Husky — Allied landing on Sicily, gateway to Italy', parties: ['Allies', 'Germany', 'Italy'], region: 'Mediterranean', era: 'World War II' },
  { id: 'ww2-09', title: 'Battle of Kursk', year: '1943', type: 'battle', lat: 51.73, lon: 36.19, description: 'Largest tank battle in history — 6,000+ tanks engage, Soviet victory', parties: ['Soviet Union', 'Germany'], region: 'Eastern Europe', era: 'World War II' },
  { id: 'ww2-10', title: 'D-Day — Normandy Landings', year: '1944', type: 'invasion', lat: 49.370, lon: -0.876, description: 'Largest seaborne invasion in history — "The Great Crusade"', parties: ['Allies', 'Germany'], region: 'Western Europe', era: 'World War II' },
  { id: 'ww2-11', title: 'Battle of the Bulge', year: '1944–45', type: 'battle', lat: 50.18, lon: 5.97, description: 'Last major German offensive in the Ardennes — "NUTS!" reply at Bastogne', parties: ['Allies', 'Germany'], region: 'Western Europe', era: 'World War II' },
  { id: 'ww2-12', title: 'Battle of Iwo Jima', year: '1945', type: 'battle', lat: 24.784, lon: 141.322, description: 'Marines raise the flag on Mount Suribachi — iconic image of WWII', parties: ['USA', 'Japan'], region: 'Pacific', era: 'World War II' },
  { id: 'ww2-13', title: 'Battle of Berlin', year: '1945', type: 'battle', lat: 52.520, lon: 13.405, description: 'Soviet forces storm Berlin — Hitler dies, Germany surrenders', parties: ['Soviet Union', 'Germany'], region: 'Central Europe', era: 'World War II' },
  { id: 'ww2-14', title: 'Atomic bombing of Hiroshima', year: '1945', type: 'attack', lat: 34.394, lon: 132.455, description: '"Little Boy" dropped on Hiroshima — first nuclear weapon used in war', parties: ['USA', 'Japan'], region: 'Japan', era: 'World War II' },
  { id: 'ww2-15', title: 'Atomic bombing of Nagasaki', year: '1945', type: 'attack', lat: 32.774, lon: 129.868, description: '"Fat Man" dropped — Japan surrenders 6 days later', parties: ['USA', 'Japan'], region: 'Japan', era: 'World War II' },
];

// ═══════════════════════════════════════════════════════════════
// COLD WAR (1947–1991)
// ═══════════════════════════════════════════════════════════════
const COLD_WAR = [
  { id: 'cold-01', title: 'Berlin Blockade & Airlift', year: '1948–49', type: 'crisis', lat: 52.520, lon: 13.405, description: 'Soviet blockade of West Berlin — Allies supply by air for 11 months', parties: ['USA', 'Soviet Union'], region: 'Germany', era: 'Cold War' },
  { id: 'cold-02', title: 'Korean War — Inchon Landing', year: '1950', type: 'invasion', lat: 37.45, lon: 126.70, description: 'MacArthur\'s daring amphibious landing at Inchon turns the tide', parties: ['USA', 'North Korea'], region: 'Korean Peninsula', era: 'Cold War' },
  { id: 'cold-03', title: 'Korean War — Battle of Chosin Reservoir', year: '1950', type: 'battle', lat: 40.38, lon: 127.25, description: 'US Marines fight out of Chinese encirclement in brutal cold — "frozen Chosin"', parties: ['USA', 'China'], region: 'Korean Peninsula', era: 'Cold War' },
  { id: 'cold-04', title: 'Cuban Missile Crisis', year: '1962', type: 'crisis', lat: 23.114, lon: -82.367, description: '13-day nuclear standoff — closest the world came to nuclear war', parties: ['USA', 'Soviet Union', 'Cuba'], region: 'Caribbean', era: 'Cold War' },
  { id: 'cold-05', title: 'Gulf of Tonkin Incident', year: '1964', type: 'attack', lat: 19.80, lon: 106.80, description: 'USS Maddox incident in Gulf of Tonkin — leads to US escalation in Vietnam', parties: ['USA', 'North Vietnam'], region: 'Southeast Asia', era: 'Cold War' },
  { id: 'cold-06', title: 'Tet Offensive', year: '1968', type: 'battle', lat: 10.762, lon: 106.660, description: 'North Vietnam surprise offensive during Lunar New Year — public opinion turns', parties: ['USA', 'North Vietnam', 'South Vietnam'], region: 'Southeast Asia', era: 'Cold War' },
  { id: 'cold-07', title: 'Apollo 11 — Moon Landing', year: '1969', type: 'achievement', lat: 28.573, lon: -80.649, description: 'Armstrong and Aldrin walk on the Moon — "One small step for man"', parties: ['USA'], region: 'USA', era: 'Cold War' },
  { id: 'cold-08', title: 'Fall of Saigon', year: '1975', type: 'fall', lat: 10.762, lon: 106.660, description: 'North Vietnamese tanks roll into Saigon — Vietnam War ends', parties: ['North Vietnam', 'South Vietnam'], region: 'Southeast Asia', era: 'Cold War' },
  { id: 'cold-09', title: 'Soviet invasion of Afghanistan', year: '1979', type: 'invasion', lat: 34.526, lon: 69.172, description: 'Soviet Union invades Afghanistan — begins 10-year guerrilla war', parties: ['Soviet Union', 'Mujahideen'], region: 'Central Asia', era: 'Cold War' },
  { id: 'cold-10', title: 'Fall of the Berlin Wall', year: '1989', type: 'political', lat: 52.535, lon: 13.390, description: 'Berlin Wall falls — beginning of the end of the Cold War', parties: ['East Germany', 'West Germany'], region: 'Germany', era: 'Cold War' },
  { id: 'cold-11', title: 'Dissolution of the Soviet Union', year: '1991', type: 'political', lat: 55.751, lon: 37.618, description: 'Soviet Union dissolves — 15 republics become independent nations', parties: ['Soviet Union', 'Russia'], region: 'Russia', era: 'Cold War' },
];

// ═══════════════════════════════════════════════════════════════
// GULF WARS & WAR ON TERROR (1990–Present)
// ═══════════════════════════════════════════════════════════════
const MODERN_WARS = [
  { id: 'gw-01', title: 'Iraqi invasion of Kuwait', year: '1990', type: 'invasion', lat: 29.376, lon: 47.977, description: 'Saddam Hussein invades Kuwait — triggers international coalition response', parties: ['Iraq', 'Kuwait'], region: 'Middle East', era: 'Gulf Wars' },
  { id: 'gw-02', title: 'Operation Desert Storm', year: '1991', type: 'campaign', lat: 29.31, lon: 47.48, description: 'Coalition air campaign and 100-hour ground war liberates Kuwait', parties: ['Coalition', 'Iraq'], region: 'Middle East', era: 'Gulf Wars' },
  { id: 'gw-03', title: 'Highway of Death', year: '1991', type: 'attack', lat: 29.69, lon: 47.31, description: 'Coalition forces destroy retreating Iraqi convoy on Highway 80', parties: ['Coalition', 'Iraq'], region: 'Kuwait', era: 'Gulf Wars' },
  { id: 'gw-04', title: 'September 11 attacks', year: '2001', type: 'attack', lat: 40.711, lon: -74.013, description: 'Al-Qaeda attacks on World Trade Center and Pentagon — 2,977 killed', parties: ['Al-Qaeda', 'USA'], region: 'USA', era: 'War on Terror' },
  { id: 'gw-05', title: 'Invasion of Afghanistan', year: '2001', type: 'invasion', lat: 34.526, lon: 69.172, description: 'US-led invasion topples Taliban regime — Operation Enduring Freedom', parties: ['USA', 'Taliban'], region: 'Central Asia', era: 'War on Terror' },
  { id: 'gw-06', title: 'Battle of Tora Bora', year: '2001', type: 'battle', lat: 34.10, lon: 70.56, description: 'US forces assault cave complex hunting Bin Laden — he escapes to Pakistan', parties: ['USA', 'Al-Qaeda'], region: 'Afghanistan', era: 'War on Terror' },
  { id: 'gw-07', title: 'Shock and Awe — Invasion of Iraq', year: '2003', type: 'invasion', lat: 33.312, lon: 44.366, description: 'US-led coalition invades Iraq — Baghdad falls in 21 days', parties: ['Coalition', 'Iraq'], region: 'Middle East', era: 'War on Terror' },
  { id: 'gw-08', title: 'First Battle of Fallujah', year: '2004', type: 'battle', lat: 33.35, lon: 43.78, description: 'US Marines assault Fallujah — intense urban combat, withdrawn after backlash', parties: ['USA', 'Insurgents'], region: 'Iraq', era: 'War on Terror' },
  { id: 'gw-09', title: 'Second Battle of Fallujah', year: '2004', type: 'battle', lat: 33.35, lon: 43.78, description: 'Heaviest US urban combat since Hue — city recaptured from insurgents', parties: ['USA', 'Insurgents'], region: 'Iraq', era: 'War on Terror' },
  { id: 'gw-10', title: 'Killing of Osama bin Laden', year: '2011', type: 'attack', lat: 34.169, lon: 73.242, description: 'Navy SEALs raid Abbottabad compound — Operation Neptune Spear', parties: ['USA', 'Al-Qaeda'], region: 'Pakistan', era: 'War on Terror' },
  { id: 'gw-11', title: 'Fall of Mosul to ISIS', year: '2014', type: 'conquest', lat: 36.340, lon: 43.130, description: 'ISIS captures Iraq\'s second-largest city — declares "Caliphate"', parties: ['ISIS', 'Iraq'], region: 'Iraq', era: 'War on Terror' },
  { id: 'gw-12', title: 'Battle of Mosul (Liberation)', year: '2016–17', type: 'battle', lat: 36.340, lon: 43.130, description: '9-month battle to recapture Mosul from ISIS — massive urban warfare', parties: ['Iraq', 'Coalition', 'ISIS'], region: 'Iraq', era: 'War on Terror' },
];

// ═══════════════════════════════════════════════════════════════
// MINISTRY OF JESUS CHRIST (~5 BC – 30 AD)
// Chronological order following the Gospel harmonization
// ═══════════════════════════════════════════════════════════════
const JESUS_MINISTRY = [
  { id: 'jc-01', title: 'The Birth of Jesus in Bethlehem', year: '~5 BC', type: 'prophecy', lat: 31.7054, lon: 35.2024, description: '"And she brought forth her firstborn son, and wrapped him in swaddling clothes, and laid him in a manger; because there was no room for them in the inn." — Luke 2:7. Fulfilling the prophecy of Micah 5:2, the Messiah is born in the city of David. Shepherds receive the angelic announcement (Luke 2:8-14). Wise men follow a star from the East to worship Him (Matthew 2:1-12).', parties: ['Jesus', 'Mary', 'Joseph'], region: 'Judea', era: 'Ministry of Jesus', scripture: 'Luke 2:1-20; Matthew 2:1-12; Micah 5:2' },
  { id: 'jc-02', title: 'Presentation at the Temple', year: '~4 BC', type: 'prophecy', lat: 31.7781, lon: 35.2354, description: '"Lord, now lettest thou thy servant depart in peace... for mine eyes have seen thy salvation." — Luke 2:29-30. Forty days after His birth, Jesus is presented at the Temple in Jerusalem. The aged prophet Simeon and the prophetess Anna recognize the infant as the promised Messiah (Luke 2:25-38).', parties: ['Jesus', 'Simeon', 'Anna'], region: 'Jerusalem', era: 'Ministry of Jesus', scripture: 'Luke 2:22-38' },
  { id: 'jc-03', title: 'The Flight to Egypt', year: '~4 BC', type: 'campaign', lat: 30.0444, lon: 31.2357, description: '"Arise, and take the young child and his mother, and flee into Egypt, and be thou there until I bring thee word: for Herod will seek the young child to destroy him." — Matthew 2:13. An angel warns Joseph in a dream. The holy family flees to Egypt, fulfilling Hosea 11:1: "Out of Egypt have I called my son." Herod orders the massacre of innocents in Bethlehem (Matthew 2:16-18).', parties: ['Jesus', 'Joseph', 'Herod'], region: 'Egypt', era: 'Ministry of Jesus', scripture: 'Matthew 2:13-23; Hosea 11:1' },
  { id: 'jc-04', title: 'Boyhood in Nazareth', year: '~4 BC–26 AD', type: 'ministry', lat: 32.6996, lon: 35.3035, description: '"And the child grew, and waxed strong in spirit, filled with wisdom: and the grace of God was upon him." — Luke 2:40. After Herod\'s death, the family returns from Egypt and settles in Nazareth of Galilee. At age twelve, Jesus astonishes the teachers in the Temple: "Wist ye not that I must be about my Father\'s business?" (Luke 2:49).', parties: ['Jesus'], region: 'Galilee', era: 'Ministry of Jesus', scripture: 'Luke 2:39-52; Matthew 2:19-23' },
  { id: 'jc-05', title: 'Baptism in the Jordan River', year: '~26 AD', type: 'revelation', lat: 31.8396, lon: 35.5506, description: '"And lo a voice from heaven, saying, This is my beloved Son, in whom I am well pleased." — Matthew 3:17. John the Baptist baptizes Jesus in the Jordan River near Bethabara. The heavens open, the Spirit of God descends like a dove, and the Father speaks from heaven — the Trinity revealed in a single moment (Mark 1:9-11; John 1:29-34).', parties: ['Jesus', 'John the Baptist'], region: 'Jordan Valley', era: 'Ministry of Jesus', scripture: 'Matthew 3:13-17; Mark 1:9-11; John 1:29-34' },
  { id: 'jc-06', title: 'Temptation in the Judean Wilderness', year: '~26 AD', type: 'trial', lat: 31.85, lon: 35.41, description: '"Man shall not live by bread alone, but by every word that proceedeth out of the mouth of God." — Matthew 4:4. For forty days and nights Jesus fasts in the desolate wilderness. Satan tempts Him three times — with bread, with spectacle, and with worldly power. Each time, Jesus answers with Scripture (Matthew 4:1-11). Where Adam fell, the Second Adam stands.', parties: ['Jesus', 'Satan'], region: 'Judean Desert', era: 'Ministry of Jesus', scripture: 'Matthew 4:1-11; Luke 4:1-13; Mark 1:12-13' },
  { id: 'jc-07', title: 'First Miracle — Water to Wine at Cana', year: '~27 AD', type: 'miracle', lat: 32.7451, lon: 35.3396, description: '"This beginning of miracles did Jesus in Cana of Galilee, and manifested forth his glory; and his disciples believed on him." — John 2:11. At a wedding feast, when the wine runs out, Mary tells Jesus. He commands servants to fill six stone waterpots. The water becomes the finest wine — His first public sign, revealing His divine glory.', parties: ['Jesus', 'Mary', 'Disciples'], region: 'Galilee', era: 'Ministry of Jesus', scripture: 'John 2:1-11' },
  { id: 'jc-08', title: 'Cleansing the Temple in Jerusalem', year: '~27 AD', type: 'teaching', lat: 31.7781, lon: 35.2354, description: '"Take these things hence; make not my Father\'s house an house of merchandise." — John 2:16. In righteous fury, Jesus overturns the tables of the moneychangers and drives out the merchants with a whip of cords. When the Pharisees demand a sign, He says: "Destroy this temple, and in three days I will raise it up" — speaking of His own body (John 2:19-21).', parties: ['Jesus', 'Pharisees'], region: 'Jerusalem', era: 'Ministry of Jesus', scripture: 'John 2:13-22' },
  { id: 'jc-09', title: 'Nicodemus — Born Again', year: '~27 AD', type: 'teaching', lat: 31.7781, lon: 35.2354, description: '"For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life." — John 3:16. Under cover of night, the Pharisee Nicodemus seeks out Jesus. Christ reveals the mystery of spiritual rebirth: "Ye must be born again" (John 3:7). This private conversation contains the most famous verse in all of Scripture.', parties: ['Jesus', 'Nicodemus'], region: 'Jerusalem', era: 'Ministry of Jesus', scripture: 'John 3:1-21' },
  { id: 'jc-10', title: 'The Woman at the Well in Sychar', year: '~27 AD', type: 'teaching', lat: 32.2132, lon: 35.2848, description: '"Whosoever drinketh of the water that I shall give him shall never thirst; but the water that I shall give him shall be in him a well of water springing up into everlasting life." — John 4:14. At Jacob\'s well in Samaria, Jesus breaks cultural barriers by speaking with a Samaritan woman. He reveals that He is the Messiah: "I that speak unto thee am he" (John 4:26). Many Samaritans believe.', parties: ['Jesus', 'Samaritan Woman'], region: 'Samaria', era: 'Ministry of Jesus', scripture: 'John 4:1-42' },
  { id: 'jc-11', title: 'Rejection at Nazareth', year: '~27 AD', type: 'trial', lat: 32.6996, lon: 35.3035, description: '"No prophet is accepted in his own country." — Luke 4:24. Jesus returns to His hometown synagogue in Nazareth and reads from the scroll of Isaiah: "The Spirit of the Lord is upon me." He declares: "This day is this scripture fulfilled in your ears" (Luke 4:21). Enraged, the townspeople attempt to throw Him off a cliff, but He passes through their midst.', parties: ['Jesus', 'Nazareth'], region: 'Galilee', era: 'Ministry of Jesus', scripture: 'Luke 4:16-30; Isaiah 61:1-2' },
  { id: 'jc-12', title: 'Calling the Disciples at Capernaum', year: '~27 AD', type: 'ministry', lat: 32.8810, lon: 35.5751, description: '"Follow me, and I will make you fishers of men." — Matthew 4:19. On the shores of the Sea of Galilee near Capernaum, Jesus calls Simon Peter and Andrew, then James and John, from their fishing nets. "And they straightway left their nets, and followed him" (Matthew 4:20). Capernaum becomes His ministry headquarters — "His own city" (Matthew 9:1).', parties: ['Jesus', 'Peter', 'Andrew', 'James', 'John'], region: 'Galilee', era: 'Ministry of Jesus', scripture: 'Matthew 4:18-22; Luke 5:1-11; Mark 1:16-20' },
  { id: 'jc-13', title: 'The Sermon on the Mount', year: '~28 AD', type: 'teaching', lat: 32.8806, lon: 35.5563, description: '"Blessed are the poor in spirit: for theirs is the kingdom of heaven." — Matthew 5:3. On a hillside near Capernaum, Jesus delivers the greatest sermon ever preached. The Beatitudes, the Lord\'s Prayer, "Ye are the salt of the earth," "Love your enemies," "Judge not, that ye be not judged." Three chapters of Matthew (5-7) record this revolutionary moral teaching that redefined righteousness.', parties: ['Jesus', 'Disciples', 'Multitudes'], region: 'Galilee', era: 'Ministry of Jesus', scripture: 'Matthew 5-7; Luke 6:20-49' },
  { id: 'jc-14', title: 'Calming the Storm on the Sea of Galilee', year: '~28 AD', type: 'miracle', lat: 32.8300, lon: 35.5800, description: '"Peace, be still. And the wind ceased, and there was a great calm." — Mark 4:39. A violent storm batters the disciples\' boat while Jesus sleeps on a cushion. Terrified, they wake Him: "Master, carest thou not that we perish?" With three words, He silences the tempest. "What manner of man is this, that even the wind and the sea obey him?" (Mark 4:41).', parties: ['Jesus', 'Disciples'], region: 'Sea of Galilee', era: 'Ministry of Jesus', scripture: 'Mark 4:35-41; Matthew 8:23-27; Luke 8:22-25' },
  { id: 'jc-15', title: 'Feeding the Five Thousand near Bethsaida', year: '~29 AD', type: 'miracle', lat: 32.9080, lon: 35.6310, description: '"They need not depart; give ye them to eat." — Matthew 14:16. On the shores northeast of Galilee, a vast crowd has followed Jesus. With only five loaves and two fish — a boy\'s lunch — Jesus gives thanks, breaks the bread, and feeds five thousand men, plus women and children. Twelve baskets of fragments remain. The only miracle recorded in all four Gospels (John 6:1-14).', parties: ['Jesus', 'Disciples', 'Multitude'], region: 'Galilee', era: 'Ministry of Jesus', scripture: 'John 6:1-14; Matthew 14:13-21; Mark 6:30-44; Luke 9:10-17' },
  { id: 'jc-16', title: 'Walking on Water', year: '~29 AD', type: 'miracle', lat: 32.8300, lon: 35.5800, description: '"Be of good cheer; it is I; be not afraid." — Matthew 14:27. In the fourth watch of the night, the disciples strain at rowing against a headwind. They see Jesus walking toward them on the water. Peter cries: "Lord, if it be thou, bid me come unto thee on the water." He walks — then doubts, and sinks. "O thou of little faith, wherefore didst thou doubt?" (Matthew 14:31).', parties: ['Jesus', 'Peter', 'Disciples'], region: 'Sea of Galilee', era: 'Ministry of Jesus', scripture: 'Matthew 14:22-33; Mark 6:45-52; John 6:15-21' },
  { id: 'jc-17', title: 'The Transfiguration on Mount Hermon', year: '~29 AD', type: 'revelation', lat: 33.4167, lon: 35.8570, description: '"This is my beloved Son, in whom I am well pleased; hear ye him." — Matthew 17:5. Jesus takes Peter, James, and John to a high mountain. His face shines like the sun, His garments become white as light. Moses and Elijah appear beside Him. A bright cloud overshadows them, and the voice of God the Father thunders from heaven. The Law and the Prophets bear witness to Christ.', parties: ['Jesus', 'Peter', 'James', 'John', 'Moses', 'Elijah'], region: 'Mount Hermon', era: 'Ministry of Jesus', scripture: 'Matthew 17:1-9; Mark 9:2-8; Luke 9:28-36; 2 Peter 1:16-18' },
  { id: 'jc-18', title: 'Raising Lazarus at Bethany', year: '~30 AD', type: 'miracle', lat: 31.7733, lon: 35.2610, description: '"Jesus said unto her, I am the resurrection, and the life: he that believeth in me, though he were dead, yet shall he live." — John 11:25. Lazarus has been dead four days when Jesus arrives. Martha says: "Lord, by this time he stinketh." "Jesus wept" — the shortest verse in the Bible (John 11:35). Then He commands: "Lazarus, come forth!" The dead man walks out, still wrapped in grave clothes. This miracle seals the Sanhedrin\'s resolve to kill Jesus.', parties: ['Jesus', 'Lazarus', 'Martha', 'Mary'], region: 'Judea', era: 'Ministry of Jesus', scripture: 'John 11:1-44' },
  { id: 'jc-19', title: 'Triumphal Entry into Jerusalem — Palm Sunday', year: '~30 AD', type: 'prophecy', lat: 31.7781, lon: 35.2354, description: '"Hosanna to the Son of David: Blessed is he that cometh in the name of the Lord." — Matthew 21:9. Riding on a donkey\'s colt, fulfilling Zechariah 9:9, Jesus enters Jerusalem through cheering crowds who spread palm branches and cloaks before Him. The whole city is stirred: "Who is this?" Yet Jesus weeps over Jerusalem, foreseeing its destruction (Luke 19:41-44).', parties: ['Jesus', 'Disciples', 'Jerusalem'], region: 'Jerusalem', era: 'Ministry of Jesus', scripture: 'Matthew 21:1-11; Mark 11:1-11; Luke 19:28-44; John 12:12-19; Zechariah 9:9' },
  { id: 'jc-20', title: 'The Last Supper — Upper Room', year: '~30 AD', type: 'teaching', lat: 31.7716, lon: 35.2292, description: '"This is my body which is given for you: this do in remembrance of me... This cup is the new testament in my blood, which is shed for you." — Luke 22:19-20. In an upper room in Jerusalem, Jesus shares the Passover meal with His twelve apostles. He washes their feet (John 13:1-17), institutes the Lord\'s Supper, predicts His betrayal by Judas, and gives the great commandment: "Love one another, as I have loved you" (John 13:34).', parties: ['Jesus', 'Twelve Apostles', 'Judas'], region: 'Jerusalem', era: 'Ministry of Jesus', scripture: 'Matthew 26:17-30; Mark 14:12-26; Luke 22:7-23; John 13-17' },
  { id: 'jc-21', title: 'Agony in the Garden of Gethsemane', year: '~30 AD', type: 'trial', lat: 31.7794, lon: 35.2403, description: '"O my Father, if it be possible, let this cup pass from me: nevertheless not as I will, but as thou wilt." — Matthew 26:39. In the olive garden at the foot of the Mount of Olives, Jesus prays in agony. "His sweat was as it were great drops of blood falling down to the ground" (Luke 22:44). He is arrested after Judas\' betrayal kiss. Peter strikes with a sword; Jesus heals the wounded ear and surrenders willingly.', parties: ['Jesus', 'Peter', 'Judas', 'Temple Guard'], region: 'Jerusalem', era: 'Ministry of Jesus', scripture: 'Matthew 26:36-56; Mark 14:32-50; Luke 22:39-53; John 18:1-12' },
  { id: 'jc-22', title: 'The Crucifixion at Golgotha', year: '~30 AD', type: 'martyrdom', lat: 31.7785, lon: 35.2296, description: '"Father, forgive them; for they know not what they do." — Luke 23:34. "It is finished." — John 19:30. After trial before the Sanhedrin, Pilate, and Herod, Jesus is scourged and led to Golgotha — "the place of the skull." Nailed to a Roman cross between two thieves, He utters seven final statements. Darkness covers the land from the sixth to ninth hour. The Temple veil tears from top to bottom. "Truly this was the Son of God" (Matthew 27:54).', parties: ['Jesus', 'Rome', 'Sanhedrin'], region: 'Jerusalem', era: 'Ministry of Jesus', scripture: 'Matthew 27:33-56; Mark 15:22-41; Luke 23:33-49; John 19:17-37; Isaiah 53' },
  { id: 'jc-23', title: 'The Resurrection — The Empty Tomb', year: '~30 AD', type: 'revelation', lat: 31.7785, lon: 35.2296, description: '"He is not here: for he is risen, as he said." — Matthew 28:6. On the third day, at dawn, Mary Magdalene and the other women find the stone rolled away and the tomb empty. Angels declare the resurrection. Jesus appears first to Mary: "Touch me not; for I am not yet ascended to my Father" (John 20:17). Over forty days He appears to the disciples, to five hundred at once (1 Corinthians 15:6), and eats with them, proving His bodily resurrection.', parties: ['Jesus', 'Mary Magdalene', 'Disciples', 'Angels'], region: 'Jerusalem', era: 'Ministry of Jesus', scripture: 'Matthew 28:1-20; Mark 16:1-8; Luke 24:1-49; John 20:1-29; 1 Corinthians 15:3-8' },
  { id: 'jc-24', title: 'The Ascension from the Mount of Olives', year: '~30 AD', type: 'revelation', lat: 31.7782, lon: 35.2450, description: '"Ye shall receive power, after that the Holy Ghost is come upon you: and ye shall be witnesses unto me... unto the uttermost part of the earth." — Acts 1:8. Forty days after the resurrection, on the Mount of Olives, Jesus gives the Great Commission: "Go ye therefore, and teach all nations" (Matthew 28:19). Then He is taken up, and a cloud receives Him out of their sight. Two angels declare: "This same Jesus... shall so come in like manner as ye have seen him go" (Acts 1:11).', parties: ['Jesus', 'Disciples', 'Angels'], region: 'Jerusalem', era: 'Ministry of Jesus', scripture: 'Acts 1:1-12; Luke 24:50-53; Mark 16:19-20; Matthew 28:16-20' },
];

// ═══════════════════════════════════════════════════════════════
// PAUL'S MISSIONARY JOURNEYS (~45–62 AD)
// Chronological: 1st Journey → 2nd Journey → 3rd Journey → Rome
// ═══════════════════════════════════════════════════════════════
const PAUL_MISSIONS = [
  // ── Conversion & Preparation ──
  { id: 'paul-01', title: 'Conversion on the Road to Damascus', year: '~34 AD', type: 'revelation', lat: 33.5138, lon: 36.2765, description: '"Saul, Saul, why persecutest thou me?" — Acts 9:4. A brilliant light from heaven strikes down Saul of Tarsus as he travels to Damascus to arrest Christians. Blinded for three days, he is led into the city. The Lord sends Ananias to restore his sight: "He is a chosen vessel unto me, to bear my name before the Gentiles, and kings, and the children of Israel" (Acts 9:15). The great persecutor becomes the great apostle.', parties: ['Paul (Saul)', 'Ananias', 'Jesus'], region: 'Syria', era: "Paul's Missions", scripture: 'Acts 9:1-19; Acts 22:6-16; Acts 26:12-18' },
  { id: 'paul-02', title: 'Paul in Arabia & Return to Damascus', year: '~34-37 AD', type: 'ministry', lat: 30.3285, lon: 35.4444, description: '"I went into Arabia, and returned again unto Damascus." — Galatians 1:17. After his conversion, Paul withdraws to Arabia (likely the Nabataean kingdom) for a period of solitary preparation and divine revelation, then returns to Damascus where he preaches Christ in the synagogues: "He is the Son of God" (Acts 9:20). The Jews conspire to kill him; he escapes by being lowered over the city wall in a basket (Acts 9:23-25).', parties: ['Paul'], region: 'Arabia', era: "Paul's Missions", scripture: 'Galatians 1:15-18; Acts 9:19-25; 2 Corinthians 11:32-33' },
  { id: 'paul-03', title: 'Barnabas & Paul Commissioned at Antioch', year: '~46 AD', type: 'ministry', lat: 36.2021, lon: 36.1606, description: '"The Holy Ghost said, Separate me Barnabas and Saul for the work whereunto I have called them." — Acts 13:2. The church at Antioch — where believers are first called "Christians" (Acts 11:26) — becomes the launching pad for world missions. After fasting and prayer, the congregation lays hands on Barnabas and Paul and sends them out. The first missionary journey begins.', parties: ['Paul', 'Barnabas', 'Antioch Church'], region: 'Syria', era: "Paul's Missions", scripture: 'Acts 13:1-3; Acts 11:25-26' },
  // ── First Missionary Journey (~47-49 AD) ──
  { id: 'paul-04', title: 'Cyprus — Paphos: Blinding of Bar-Jesus', year: '~47 AD', type: 'miracle', lat: 34.7557, lon: 32.4075, description: '"O full of all subtilty and all mischief, thou child of the devil... the hand of the Lord is upon thee, and thou shalt be blind." — Acts 13:10-11. Paul and Barnabas sail to Cyprus, preaching across the island. At Paphos, the Roman proconsul Sergius Paulus summons them, but the sorcerer Bar-Jesus opposes them. Paul, filled with the Holy Spirit, strikes him blind. The proconsul believes, "being astonished at the doctrine of the Lord" (Acts 13:12).', parties: ['Paul', 'Barnabas', 'Sergius Paulus', 'Bar-Jesus'], region: 'Cyprus', era: "Paul's Missions", scripture: 'Acts 13:4-12' },
  { id: 'paul-05', title: 'Pisidian Antioch — Sermon in the Synagogue', year: '~47 AD', type: 'teaching', lat: 38.3019, lon: 31.1783, description: '"Be it known unto you therefore, men and brethren, that through this man is preached unto you the forgiveness of sins: and by him all that believe are justified from all things." — Acts 13:38-39. In the synagogue of Antioch in Pisidia, Paul delivers a sweeping sermon tracing God\'s salvation history from Abraham through David to Christ. The Gentiles beg to hear more; the next Sabbath "almost the whole city" gathers. Jealous Jewish leaders expel them (Acts 13:50).', parties: ['Paul', 'Barnabas', 'Jews', 'Gentiles'], region: 'Asia Minor', era: "Paul's Missions", scripture: 'Acts 13:14-52' },
  { id: 'paul-06', title: 'Iconium — Persecution & Signs', year: '~48 AD', type: 'ministry', lat: 37.8714, lon: 32.4846, description: '"Long time therefore abode they speaking boldly in the Lord, which gave testimony unto the word of his grace, and granted signs and wonders to be done by their hands." — Acts 14:3. At Iconium, Paul and Barnabas preach for an extended period. The city divides — some side with the apostles, others with the hostile Jewish leaders. When a plot to stone them is discovered, they flee to the Lycaonian cities (Acts 14:5-6).', parties: ['Paul', 'Barnabas'], region: 'Asia Minor', era: "Paul's Missions", scripture: 'Acts 14:1-7' },
  { id: 'paul-07', title: 'Lystra — Paul Stoned & Left for Dead', year: '~48 AD', type: 'martyrdom', lat: 37.5597, lon: 32.3481, description: '"There came thither certain Jews from Antioch and Iconium, who persuaded the people, and having stoned Paul, drew him out of the city, supposing he had been dead." — Acts 14:19. At Lystra, Paul heals a crippled man, and the crowd hails them as gods — Zeus and Hermes. But agitators arrive from Iconium. The same crowd that worshipped them now stones Paul and drags his body outside the city. Yet "as the disciples stood round about him, he rose up" (Acts 14:20) and the next day departs for Derbe.', parties: ['Paul', 'Barnabas', 'Timothy'], region: 'Asia Minor', era: "Paul's Missions", scripture: 'Acts 14:8-20; 2 Timothy 3:11' },
  { id: 'paul-08', title: 'Derbe & Return through Galatia', year: '~48 AD', type: 'ministry', lat: 37.3564, lon: 33.4661, description: '"Confirming the souls of the disciples, and exhorting them to continue in the faith, and that we must through much tribulation enter into the kingdom of God." — Acts 14:22. At Derbe, they preach the gospel and make many disciples. Then, remarkably, they retrace their steps back through the very cities that persecuted them — Lystra, Iconium, Pisidian Antioch — appointing elders in every church (Acts 14:23).', parties: ['Paul', 'Barnabas'], region: 'Asia Minor', era: "Paul's Missions", scripture: 'Acts 14:20-28' },
  { id: 'paul-09', title: 'Council of Jerusalem', year: '~49 AD', type: 'teaching', lat: 31.7781, lon: 35.2354, description: '"We believe that through the grace of the Lord Jesus Christ we shall be saved, even as they." — Acts 15:11. The pivotal question: must Gentile believers be circumcised? Paul and Barnabas travel to Jerusalem. Peter testifies of Cornelius. James cites the prophets. The council decides: Gentiles need not keep the Mosaic Law to be saved — a watershed moment that opens the gospel to all nations (Acts 15:19-21).', parties: ['Paul', 'Barnabas', 'Peter', 'James'], region: 'Jerusalem', era: "Paul's Missions", scripture: 'Acts 15:1-35; Galatians 2:1-10' },
  // ── Second Missionary Journey (~49-52 AD) ──
  { id: 'paul-10', title: 'The Macedonian Call at Troas', year: '~49 AD', type: 'revelation', lat: 39.7600, lon: 26.1600, description: '"Come over into Macedonia, and help us." — Acts 16:9. After the Spirit prevents Paul from entering Asia and Bithynia, he receives a night vision at Troas: a man of Macedonia begs for help. "Immediately we endeavoured to get into Macedonia, assuredly gathering that the Lord had called us" (Acts 16:10). This is the moment the gospel first crosses from Asia into Europe.', parties: ['Paul', 'Silas', 'Timothy', 'Luke'], region: 'Asia Minor', era: "Paul's Missions", scripture: 'Acts 16:6-10' },
  { id: 'paul-11', title: 'Philippi — Lydia, Prison & the Earthquake', year: '~49 AD', type: 'miracle', lat: 41.0114, lon: 24.2869, description: '"Believe on the Lord Jesus Christ, and thou shalt be saved, and thy house." — Acts 16:31. In Philippi, Lydia the purple merchant becomes the first European convert (Acts 16:14-15). Paul casts a demon from a slave girl, enraging her owners. He and Silas are beaten and imprisoned. At midnight, they sing hymns. An earthquake shatters the prison. The terrified jailer asks: "What must I do to be saved?" — and his entire household is baptized that night.', parties: ['Paul', 'Silas', 'Lydia', 'Philippian Jailer'], region: 'Macedonia', era: "Paul's Missions", scripture: 'Acts 16:11-40' },
  { id: 'paul-12', title: 'Thessalonica — Turning the World Upside Down', year: '~50 AD', type: 'teaching', lat: 40.6401, lon: 22.9444, description: '"These that have turned the world upside down are come hither also." — Acts 17:6. Paul reasons in the synagogue for three Sabbaths, proving from Scripture that Christ had to suffer and rise from the dead. "Some of them believed" — including "of the devout Greeks a great multitude, and of the chief women not a few" (Acts 17:4). A mob forms; Jason hosts the apostles and is dragged before the city rulers.', parties: ['Paul', 'Silas', 'Jason'], region: 'Macedonia', era: "Paul's Missions", scripture: 'Acts 17:1-9; 1 Thessalonians 2:1-12' },
  { id: 'paul-13', title: 'Berea — The Noble Bereans', year: '~50 AD', type: 'teaching', lat: 40.5232, lon: 22.2040, description: '"These were more noble than those in Thessalonica, in that they received the word with all readiness of mind, and searched the scriptures daily, whether those things were so." — Acts 17:11. The Berean Jews become a model of spiritual diligence, verifying Paul\'s teaching against the Old Testament Scriptures. Many believe — until agitators arrive from Thessalonica and stir up the crowds again (Acts 17:13).', parties: ['Paul', 'Silas', 'Timothy'], region: 'Macedonia', era: "Paul's Missions", scripture: 'Acts 17:10-15' },
  { id: 'paul-14', title: 'Athens — The Unknown God at the Areopagus', year: '~50 AD', type: 'teaching', lat: 37.9722, lon: 23.7236, description: '"For in him we live, and move, and have our being... God now commandeth all men every where to repent." — Acts 17:28, 30. Paul\'s spirit is provoked seeing Athens full of idols. At Mars Hill (the Areopagus), he delivers one of the greatest apologetic speeches in history, addressing Greek philosophers. He points to their altar "TO THE UNKNOWN GOD" and declares: "Whom therefore ye ignorantly worship, him declare I unto you" (Acts 17:23). Some mock; others believe, including Dionysius the Areopagite.', parties: ['Paul', 'Epicurean Philosophers', 'Stoic Philosophers', 'Dionysius'], region: 'Greece', era: "Paul's Missions", scripture: 'Acts 17:16-34' },
  { id: 'paul-15', title: 'Corinth — 18 Months of Church Planting', year: '~50-52 AD', type: 'ministry', lat: 37.9057, lon: 22.8796, description: '"Be not afraid, but speak, and hold not thy peace: for I am with thee, and no man shall set on thee to hurt thee: for I have much people in this city." — Acts 18:9-10. In this notoriously immoral city, Paul stays 18 months, living and tentmaking with Aquila and Priscilla. He writes 1 & 2 Thessalonians from here. The Lord speaks to him in a vision, and a great church is established. Before Gallio the proconsul, the charges against Paul are dismissed (Acts 18:12-17).', parties: ['Paul', 'Aquila', 'Priscilla', 'Gallio'], region: 'Greece', era: "Paul's Missions", scripture: 'Acts 18:1-18; 1 Corinthians 2:1-5' },
  // ── Third Missionary Journey (~53-57 AD) ──
  { id: 'paul-16', title: 'Ephesus — Two Years & the Riot of Demetrius', year: '~53-55 AD', type: 'ministry', lat: 37.9394, lon: 27.3420, description: '"So mightily grew the word of God and prevailed." — Acts 19:20. Paul spends over two years in Ephesus — the longest single-city ministry of his career. He teaches daily in the Hall of Tyrannus, and "all they which dwelt in Asia heard the word" (Acts 19:10). Extraordinary miracles occur. Occult practitioners burn their scrolls publicly (worth 50,000 pieces of silver). The silversmith Demetrius incites a city-wide riot, chanting "Great is Diana of the Ephesians!" for two hours (Acts 19:34). Paul writes 1 Corinthians from here.', parties: ['Paul', 'Demetrius', 'Ephesian Church'], region: 'Asia Minor', era: "Paul's Missions", scripture: 'Acts 19:1-41; 1 Corinthians 16:8-9; Ephesians 1-6' },
  { id: 'paul-17', title: 'Macedonia & Greece — Collecting for Jerusalem', year: '~56 AD', type: 'ministry', lat: 40.6401, lon: 22.9444, description: '"For ye know the grace of our Lord Jesus Christ, that, though he was rich, yet for your sakes he became poor, that ye through his poverty might be rich." — 2 Corinthians 8:9. Paul revisits the churches of Macedonia and Greece, organizing a collection for the impoverished saints in Jerusalem. During three months in Corinth, he writes the Epistle to the Romans — the most systematic theological treatise in Scripture.', parties: ['Paul', 'Macedonian Churches'], region: 'Macedonia/Greece', era: "Paul's Missions", scripture: 'Acts 20:1-6; Romans 15:25-28; 2 Corinthians 8-9' },
  { id: 'paul-18', title: 'Troas — Eutychus Raised from the Dead', year: '~57 AD', type: 'miracle', lat: 39.7600, lon: 26.1600, description: '"And there sat in a window a certain young man named Eutychus, being fallen into a deep sleep: and as Paul was long preaching, he sunk down with sleep, and fell down from the third loft, and was taken up dead." — Acts 20:9. Paul preaches until midnight. The young man Eutychus falls from the third story window and dies. Paul embraces him: "Trouble not yourselves; for his life is in him" (Acts 20:10). He is raised, and Paul continues preaching until dawn.', parties: ['Paul', 'Eutychus'], region: 'Asia Minor', era: "Paul's Missions", scripture: 'Acts 20:7-12' },
  { id: 'paul-19', title: 'Miletus — Farewell to the Ephesian Elders', year: '~57 AD', type: 'teaching', lat: 37.5310, lon: 27.2789, description: '"Take heed therefore unto yourselves, and to all the flock, over the which the Holy Ghost hath made you overseers, to feed the church of God, which he hath purchased with his own blood." — Acts 20:28. At the port of Miletus, Paul summons the Ephesian elders for a final, tear-filled farewell. He warns of savage wolves entering the flock. "They all wept sore, and fell on Paul\'s neck, and kissed him, sorrowing most of all for the words which he spake, that they should see his face no more" (Acts 20:37-38).', parties: ['Paul', 'Ephesian Elders'], region: 'Asia Minor', era: "Paul's Missions", scripture: 'Acts 20:17-38' },
  { id: 'paul-20', title: 'Tyre & Caesarea — Agabus\' Warning', year: '~57 AD', type: 'prophecy', lat: 32.5015, lon: 34.8903, description: '"What mean ye to weep and to break mine heart? for I am ready not to be bound only, but also to die at Jerusalem for the name of the Lord Jesus." — Acts 21:13. At Tyre, disciples urge Paul through the Spirit not to go to Jerusalem. At Caesarea, the prophet Agabus binds his own hands and feet with Paul\'s belt, prophesying Paul\'s arrest (Acts 21:10-11). Friends plead with him to stay. Paul refuses — he is resolved to suffer for Christ.', parties: ['Paul', 'Agabus', 'Philip the Evangelist'], region: 'Judea', era: "Paul's Missions", scripture: 'Acts 21:1-16' },
  { id: 'paul-21', title: 'Arrest in the Temple at Jerusalem', year: '~57 AD', type: 'trial', lat: 31.7781, lon: 35.2354, description: '"Men of Israel, help: This is the man, that teacheth all men every where against the people, and the law, and this place." — Acts 21:28. Asian Jews spot Paul in the Temple and incite a mob. They drag him out and try to kill him. Roman soldiers intervene, binding Paul in chains. Standing on the barracks stairs, Paul addresses the crowd in Hebrew, recounting his conversion. When he mentions his mission to the Gentiles, they cry: "Away with such a fellow from the earth!" (Acts 22:22).', parties: ['Paul', 'Roman Tribune', 'Jewish Mob'], region: 'Jerusalem', era: "Paul's Missions", scripture: 'Acts 21:27-22:29' },
  { id: 'paul-22', title: 'Defense Before Felix & Festus at Caesarea', year: '~57-59 AD', type: 'trial', lat: 32.5015, lon: 34.8903, description: '"As he reasoned of righteousness, temperance, and judgment to come, Felix trembled, and answered, Go thy way for this time; when I have a convenient season, I will call for thee." — Acts 24:25. Paul is transferred to Caesarea under armed guard. For two years he is imprisoned, defending himself before Governor Felix and then Festus. When Festus proposes a trial in Jerusalem, Paul invokes his right as a Roman citizen: "I appeal unto Caesar!" (Acts 25:11).', parties: ['Paul', 'Felix', 'Festus'], region: 'Judea', era: "Paul's Missions", scripture: 'Acts 23:23-25:12' },
  { id: 'paul-23', title: 'Defense Before King Agrippa', year: '~59 AD', type: 'teaching', lat: 32.5015, lon: 34.8903, description: '"King Agrippa, believest thou the prophets? I know that thou believest. Then Agrippa said unto Paul, Almost thou persuadest me to be a Christian." — Acts 26:27-28. In one of the most dramatic courtroom scenes in Scripture, Paul recounts his entire journey — from zealous Pharisee to apostle of Christ — before King Agrippa II, Queen Bernice, and Governor Festus. Agrippa admits he is "almost persuaded." Festus declares Paul innocent, "This man might have been set at liberty, if he had not appealed unto Caesar" (Acts 26:32).', parties: ['Paul', 'Agrippa', 'Bernice', 'Festus'], region: 'Judea', era: "Paul's Missions", scripture: 'Acts 25:13-26:32' },
  // ── Voyage to Rome (~59-60 AD) ──
  { id: 'paul-24', title: 'Shipwreck on Malta', year: '~60 AD', type: 'voyage', lat: 35.9042, lon: 14.5189, description: '"Wherefore, sirs, be of good cheer: for I believe God, that it shall be even as it was told me." — Acts 27:25. On the voyage to Rome, a devastating northeaster called Euraquilo batters the ship for fourteen days. All 276 souls aboard lose hope. But Paul, having received an angelic visitation, declares: "There shall be no loss of any man\'s life among you." The ship runs aground on Malta and breaks apart, but everyone reaches shore safely (Acts 27:44). On Malta, Paul is bitten by a viper but suffers no harm (Acts 28:3-6) and heals the father of Publius (Acts 28:8).', parties: ['Paul', 'Luke', 'Julius the Centurion'], region: 'Malta', era: "Paul's Missions", scripture: 'Acts 27:1-28:10' },
  { id: 'paul-25', title: 'Paul Arrives in Rome — Preaching in Chains', year: '~60-62 AD', type: 'ministry', lat: 41.8902, lon: 12.4922, description: '"And Paul dwelt two whole years in his own hired house, and received all that came in unto him, preaching the kingdom of God, and teaching those things which concern the Lord Jesus Christ, with all confidence, no man forbidding him." — Acts 28:30-31. Under house arrest in Rome, chained to a Roman soldier, Paul continues his unstoppable ministry. He writes the "Prison Epistles" — Ephesians, Philippians, Colossians, and Philemon — some of the most profound theology in the New Testament. The gospel reaches the heart of the empire: "My bonds in Christ are manifest in all the palace" (Philippians 1:13).', parties: ['Paul', 'Roman Guard', 'Roman Church'], region: 'Italy', era: "Paul's Missions", scripture: 'Acts 28:11-31; Ephesians 1:1; Philippians 1:12-14; Colossians 4:3; Philemon 1:1' },
];

// ═══════════════════════════════════════════════════════════════
// EXPORT ALL HISTORICAL DATA
// ═══════════════════════════════════════════════════════════════
export const HISTORICAL_EVENTS = [
  ...ANCIENT_EGYPT,
  ...ANCIENT_GREECE,
  ...ALEXANDER,
  ...ROME,
  ...VIKINGS,
  ...CRUSADES,
  ...MONGOLS,
  ...OTTOMAN,
  ...NAPOLEON,
  ...CIVIL_WAR,
  ...AMERICAN_REV,
  ...WWI,
  ...WWII,
  ...COLD_WAR,
  ...MODERN_WARS,
  ...JESUS_MINISTRY,
  ...PAUL_MISSIONS,
];

// Event type → visual config for historical markers
// Base styles by event type
export const HISTORICAL_STYLES = {
  battle:       { color: '#ff6d00', icon: '⚔️' },
  siege:        { color: '#ff3d00', icon: '🏰' },
  conquest:     { color: '#ff1744', icon: '🗡️' },
  campaign:     { color: '#ff9100', icon: '🏹' },
  invasion:     { color: '#d50000', icon: '⚔️' },
  political:    { color: '#ffab00', icon: '👑' },
  death:        { color: '#9e9e9e', icon: '💀' },
  founding:     { color: '#00e676', icon: '🏛️' },
  fall:         { color: '#b71c1c', icon: '💀' },
  crisis:       { color: '#ff1744', icon: '⚠️' },
  war:          { color: '#d32f2f', icon: '⚔️' },
  attack:       { color: '#ff1744', icon: '💥' },
  evacuation:   { color: '#2979ff', icon: '🚢' },
  achievement:  { color: '#00e676', icon: '🚀' },
  exile:        { color: '#9e9e9e', icon: '⛓️' },
  disaster:     { color: '#ff6d00', icon: '🌋' },
  navy_battle:  { color: '#1565c0', icon: '⚓' },
};

// Era-aware icon overrides for period-appropriate visuals
// Naval battles get era-specific ship icons
const ERA_ICON_OVERRIDES = {
  // Ancient world — triremes and biremes
  'Ancient Egypt':      { battle: '⚔️', navy_battle: '⛵', conquest: '🏺', achievement: '🏛️' },
  'Ancient Greece':     { battle: '⚔️', navy_battle: '⛵', siege: '🏛️' },
  'Alexander the Great':{ battle: '⚔️', conquest: '🗡️', siege: '🏰' },
  'Roman Empire':       { battle: '⚔️', navy_battle: '⛵', siege: '🏛️', founding: '🏛️' },
  
  // Medieval — longships and galleys
  'Viking Age':         { battle: '⚔️', attack: '🪓', navy_battle: '🛡️', invasion: '⚔️', achievement: '🧭' },
  'Crusades':           { battle: '⚔️', siege: '🏰', conquest: '✝️', campaign: '⚔️' },
  'Mongol Empire':      { battle: '⚔️', siege: '🏰', conquest: '🐎' },
  
  // Age of Sail — galleons and warships
  'Ottoman Empire':     { battle: '⚔️', siege: '🏰', navy_battle: '⚓', conquest: '☪️' },
  'Napoleonic Wars':    { battle: '⚔️', navy_battle: '⚓', campaign: '🏹', exile: '⛓️' },
  'American Revolution':{ battle: '⚔️', navy_battle: '⚓', political: '📜' },
  
  // Industrial / Modern — ironclads and battleships
  'American Civil War': { battle: '⚔️', siege: '🏰', campaign: '🔥', death: '💀', attack: '💣' },
  'World War I':        { battle: '⚔️', navy_battle: '🚢', attack: '💣', death: '💀' },
  'World War II':       { battle: '⚔️', navy_battle: '🚢', invasion: '⚔️', attack: '💣', evacuation: '🚢' },
  
  // Modern — carriers and destroyers
  'Cold War':           { battle: '⚔️', navy_battle: '🚢', crisis: '☢️', achievement: '🚀', invasion: '⚔️' },
  'Gulf Wars':          { battle: '⚔️', navy_battle: '🚢', attack: '💥', invasion: '⚔️' },
  'War on Terror':      { battle: '⚔️', attack: '💥', invasion: '⚔️', conquest: '🏴' },
  
  // Biblical eras
  'Ministry of Jesus':  { ministry: '✝️', teaching: '📖', miracle: '✨', prophecy: '🕊️', revelation: '🌟', trial: '⚖️', martyrdom: '✝️', campaign: '🐫' },
  "Paul's Missions":    { ministry: '⛪', teaching: '📜', miracle: '✨', prophecy: '🕊️', revelation: '🌟', trial: '⚖️', martyrdom: '💎', voyage: '⛵' },
};

/**
 * Get the icon and color for a historical event, accounting for era-specific overrides
 */
export function getHistoricalIcon(event) {
  const baseStyle = HISTORICAL_STYLES[event.type] || { color: '#ffab00', icon: '📍' };
  const eraOverrides = ERA_ICON_OVERRIDES[event.era];
  
  // Check for naval battles specifically (based on description/title keywords)
  const titleLower = (event.title + ' ' + event.description).toLowerCase();
  const isNaval = titleLower.includes('naval') || titleLower.includes('fleet') || 
                  titleLower.includes('ships') || titleLower.includes('navy') ||
                  titleLower.includes('sea battle') || titleLower.includes('strait') ||
                  event.region === 'North Sea' || event.region === 'Atlantic' ||
                  event.region === 'Mediterranean' || event.region === 'Pacific';
  
  // If it's a naval engagement, try navy_battle icon from era
  if (isNaval && event.type === 'battle') {
    const navalIcon = eraOverrides?.navy_battle;
    if (navalIcon) return { color: '#1565c0', icon: navalIcon };
  }
  
  // Try era-specific override for the event type
  if (eraOverrides && eraOverrides[event.type]) {
    return { ...baseStyle, icon: eraOverrides[event.type] };
  }
  
  return baseStyle;
}

