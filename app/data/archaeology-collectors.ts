export type ArchaeologyCollector = { name:string; location:string; collections:string[]; seasonal?:boolean };

export const archaeologyCollectors: ArchaeologyCollector[] = [
  { name:'Art Critic Jacques', location:'Top floor of Varrock Museum', collections:['Anarchic Abstraction','Radiant Renaissance','Imperial Impressionism'] },
  { name:'Artiefax', location:'Taverley', collections:['Guthixian I','Guthixian II'] },
  { name:'Chief Tess', location:"Oo'glog", collections:['Blingy Fings','Smoky Fings','Hitty Fings','Showy Fings'] },
  { name:'Eblis', location:'Bandit Camp, Kharidian Desert', collections:['Finery of the Inquisition','Religious Iconography','Urns of the Empire','Entertaining the Masses','Imperial Sorcery'] },
  { name:'General Bentnoze', location:'Goblin Village', collections:['Red Rum Relics I','Red Rum Relics II','Red Rum Relics III'] },
  { name:'General Wartface', location:'Goblin Village', collections:['Green Gobbo Goodies I','Green Gobbo Goodies II','Green Gobbo Goodies III'] },
  { name:'Giles', location:'Anachronia Base Camp', collections:['Desperate for Artefacts'] },
  { name:'Isaura', location:'Black Knights’ Base, Taverley Dungeon', collections:['Zamorakian I','Zamorakian II','Zamorakian III','Zamorakian IV'] },
  { name:'Lowse', location:"Armadyl's Tower, south of Falador", collections:['Armadylean I','Armadylean II','Armadylean III'] },
  { name:'Sharrigan', location:'Anachronia Base Camp, north-west of Mr. Mordaut', collections:['Dragonkin I','Dragonkin II','Dragonkin III','Dragonkin IV','Dragonkin V','Dragonkin VI','Dragonkin VII'] },
  { name:'Sir Atcha', location:"White Knights' Castle, Falador", collections:['Saradominist I','Saradominist II','Saradominist III','Saradominist IV'] },
  { name:'Soran', location:'Varrock, south of the west bank', collections:['Zarosian I','Zarosian II','Zarosian III','Zarosian IV'] },
  { name:'Velucia', location:'Varrock Dig Site / Archaeology Guild', collections:['Museum - Training Weapons','Museum - Armadylean I','Museum - Armadylean II','Museum - Armadylean III','Museum - Bandosian I','Museum - Bandosian II','Museum - Bandosian III','Museum - Dragonkin I','Museum - Dragonkin II','Museum - Dragonkin III','Museum - Dragonkin IV','Museum - Dragonkin V','Museum - Dragonkin VI','Museum - Dragonkin VII','Museum - Guthixian I','Museum - Guthixian II','Museum - Saradominist I','Museum - Saradominist II','Museum - Saradominist III','Museum - Saradominist IV','Museum - Zamorakian I','Museum - Zamorakian II','Museum - Zamorakian III','Museum - Zamorakian IV','Museum - Zarosian I','Museum - Zarosian II','Museum - Zarosian III','Museum - Zarosian IV','Museum - Zarosian V','Museum - Zarosian VI','Museum - Zarosian VII'] },
  { name:'Wise Old Man', location:'Draynor Village', collections:['Wise Am the Music Man','Hat Problem','Hat Hoarder','Magic Man','Knowledge is Power'] },
  { name:'Eep', location:'Harvest Hollow', collections:['Horrible Hollow Histories','Bounty of Bones'], seasonal:true },
];
