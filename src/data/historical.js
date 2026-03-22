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

