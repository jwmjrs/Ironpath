export const dungeonPotions = [
  ['Magic','Void dust','Sagewort · Wormwood leaf · Winter’s grip','Boosts Magic'], ['Ranged','Void dust','Valerian · Magebane · Lycopus','Boosts Ranged'], ['Melee','Misshapen claw','Valerian · Magebane · Lycopus','Boosts Attack and Strength'], ['Necromancy','Twisted root','Aloe · Featherfoil · Buckthorn','Boosts Necromancy'], ['Defence','Void dust','Aloe · Featherfoil · Buckthorn','Boosts Defence'], ['Stat restore','Red moss','Aloe · Featherfoil · Buckthorn','Restores skill levels'], ['Cure','Firebreath whiskey','Aloe · Featherfoil · Buckthorn','Cures poison; grants poison and dragonfire protection'], ['Rejuvenation','Misshapen claw','Aloe · Featherfoil · Buckthorn','Restores Prayer and Summoning points'], ['Weapon poison','Firebreath whiskey','Sagewort · Wormwood leaf · Winter’s grip','Poisons weapons'], ['Gatherer’s','Red moss','Sagewort · Wormwood leaf · Winter’s grip','Boosts Woodcutting, Mining, Fishing and Divination'], ['Artisan’s','Red moss','Valerian · Magebane · Lycopus','Boosts Smithing, Crafting, Fletching, Construction and Firemaking'], ['Naturalist’s','Misshapen claw','Sagewort · Wormwood leaf · Winter’s grip','Boosts Cooking, Farming, Herblore and Runecrafting'], ['Survivalist’s','Firebreath whiskey','Valerian · Magebane · Lycopus','Boosts Agility, Hunter, Thieving and Slayer'],
] as const;

export const dungeonBosses = {
  Frozen:['Gluttonous behemoth','Plane-freezer Lakhrahnaz',"To'Kash the Bloodchiller",'Astea Frostweb','Icy Bones','Luminescent icefiend'],
  Abandoned:['Bulwark beast','Shadow-forger Ihlakhizan',"Bal'lak the Pummeller",'Hobgoblin Geomancer','Skeletal Horde','Unholy cursebearer'],
  Occult:['Runebound behemoth','Flesh-spoiler Haasghenahk',"Yk'Lagor the Thunderous",'Necrolord','Skeletal trio','Gravecreeper'],
  Warped:['Hope devourer','World-gorger Shukarhazh',"Kal'Ger the Warmonger",'Blink','Warped Gulega','Dreadnaut'],
} as const;

export const dungeonPouchFamilies = [
  ['Bloodragers','Melee defence familiar','Ores'], ['Deathslingers','Ranged defence familiar','Branches'], ['Stormbringers','Magic defence familiar','Plants'], ['Hoardstalkers','Forages materials','Hides'], ['Worldbearers','Beast of burden','Leather'], ['Skinweavers','Healer familiar','Fabrics'],
] as const;
