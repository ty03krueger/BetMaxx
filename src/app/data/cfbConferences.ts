// app/data/cfbConferences.ts
export type Conference =
  | "SEC"
  | "Big 12"
  | "Big Ten"
  | "ACC"
  | "Pac-12"
  | "AAC"
  | "MWC"
  | "Sun Belt"
  | "MAC"
  | "C-USA"
  | "Independents"
  | "FCS"
  | "Unknown";

export const CONFERENCES: Conference[] = [
  "SEC",
  "Big 12",
  "Big Ten",
  "ACC",
  "Pac-12",
  "AAC",
  "MWC",
  "Sun Belt",
  "MAC",
  "C-USA",
  "Independents",
];

export const POWER5 = new Set<Conference>([
  "SEC",
  "Big Ten",
  "ACC",
  "Big 12",
  "Pac-12",
]);

export const GROUP5 = new Set<Conference>([
  "AAC",
  "MWC",
  "Sun Belt",
  "MAC",
  "C-USA",
]);

// Minimal but useful starter map. You can expand this over time.
// Keys should match the provider's team strings (case-insensitive compare with normalize()).
const RAW: Record<string, Conference> = {
  // SEC
  "Alabama Crimson Tide": "SEC",
  "Georgia Bulldogs": "SEC",
  "LSU Tigers": "SEC",
  "Texas A&M Aggies": "SEC",
  "Tennessee Volunteers": "SEC",
  "Florida Gators": "SEC",
  "Auburn Tigers": "SEC",
  "Ole Miss Rebels": "SEC",
  "Mississippi State Bulldogs": "SEC",
  "Arkansas Razorbacks": "SEC",
  "Kentucky Wildcats": "SEC",
  "Missouri Tigers": "SEC",
  "Oklahoma Sooners": "SEC",
  "Texas Longhorns": "SEC",

  // Big Ten
  "Ohio State Buckeyes": "Big Ten",
  "Michigan Wolverines": "Big Ten",
  "Penn State Nittany Lions": "Big Ten",
  "Iowa Hawkeyes": "Big Ten",
  "Wisconsin Badgers": "Big Ten",
  "Nebraska Cornhuskers": "Big Ten",
  "Michigan State Spartans": "Big Ten",
  "Illinois Fighting Illini": "Big Ten",
  "Minnesota Golden Gophers": "Big Ten",
  "Purdue Boilermakers": "Big Ten",
  "Indiana Hoosiers": "Big Ten",
  "Northwestern Wildcats": "Big Ten",
  "USC Trojans": "Big Ten",
  "UCLA Bruins": "Big Ten",
  "Oregon Ducks": "Big Ten",
  "Washington Huskies": "Big Ten",

  // ACC
  "Clemson Tigers": "ACC",
  "Florida State Seminoles": "ACC",
  "Miami (FL) Hurricanes": "ACC",
  "North Carolina Tar Heels": "ACC",
  "NC State Wolfpack": "ACC",
  "Duke Blue Devils": "ACC",
  "Louisville Cardinals": "ACC",
  "Virginia Tech Hokies": "ACC",
  "Virginia Cavaliers": "ACC",
  "Pittsburgh Panthers": "ACC",
  "Syracuse Orange": "ACC",
  "Boston College Eagles": "ACC",

  // Big 12
  "Baylor Bears": "Big 12",
  "TCU Horned Frogs": "Big 12",
  "Texas Tech Red Raiders": "Big 12",
  "Oklahoma State Cowboys": "Big 12",
  "Kansas Jayhawks": "Big 12",
  "Kansas State Wildcats": "Big 12",
  "Iowa State Cyclones": "Big 12",
  "Cincinnati Bearcats": "Big 12",
  "UCF Knights": "Big 12",
  "BYU Cougars": "Big 12",
  "Arizona Wildcats": "Big 12",
  "Arizona State Sun Devils": "Big 12",
  "Colorado Buffaloes": "Big 12",
  "Utah Utes": "Big 12",
  "Houston Cougars": "Big 12",

  // Pac-12 (legacy; many moved — kept for compatibility)
  "Oregon State Beavers": "Pac-12",
  "Washington State Cougars": "Pac-12",
  "Stanford Cardinal": "ACC", // realignment noted

  // AAC
  "SMU Mustangs": "AAC",
  "Memphis Tigers": "AAC",
  "Tulane Green Wave": "AAC",
  "UTSA Roadrunners": "AAC",
  "Navy Midshipmen": "AAC",
  "Temple Owls": "AAC",
  "USF Bulls": "AAC",
  "North Texas Mean Green": "AAC",
  "Rice Owls": "AAC",
  "Tulsa Golden Hurricane": "AAC",
  "Charlotte 49ers": "AAC",
  "East Carolina Pirates": "AAC",
  "UAB Blazers": "AAC",

  // MWC
  "Boise State Broncos": "MWC",
  "Fresno State Bulldogs": "MWC",
  "San Diego State Aztecs": "MWC",
  "Air Force Falcons": "MWC",
  "Wyoming Cowboys": "MWC",
  "Colorado State Rams": "MWC",
  "UNLV Rebels": "MWC",
  "San Jose State Spartans": "MWC",
  "Nevada Wolf Pack": "MWC",
  "Hawai'i Rainbow Warriors": "MWC",
  "New Mexico Lobos": "MWC",
  "Utah State Aggies": "MWC",

  // Sun Belt
  "Appalachian State Mountaineers": "Sun Belt",
  "Coastal Carolina Chanticleers": "Sun Belt",
  "Georgia Southern Eagles": "Sun Belt",
  "Georgia State Panthers": "Sun Belt",
  "James Madison Dukes": "Sun Belt",
  "Louisiana Ragin' Cajuns": "Sun Belt",
  "South Alabama Jaguars": "Sun Belt",
  "Troy Trojans": "Sun Belt",
  "Marshall Thundering Herd": "Sun Belt",
  "Old Dominion Monarchs": "Sun Belt",
  "Texas State Bobcats": "Sun Belt",
  "ULM Warhawks": "Sun Belt",
  "Arkansas State Red Wolves": "Sun Belt",
  "Southern Miss Golden Eagles": "Sun Belt",

  // MAC
  "Toledo Rockets": "MAC",
  "Ohio Bobcats": "MAC",
  "Miami (OH) RedHawks": "MAC",
  "Northern Illinois Huskies": "MAC",
  "Western Michigan Broncos": "MAC",
  "Central Michigan Chippewas": "MAC",
  "Bowling Green Falcons": "MAC",
  "Akron Zips": "MAC",
  "Kent State Golden Flashes": "MAC",
  "Buffalo Bulls": "MAC",
  "Ball State Cardinals": "MAC",
  "Eastern Michigan Eagles": "MAC",

  // C-USA
  "Liberty Flames": "C-USA",
  "Western Kentucky Hilltoppers": "C-USA",
  "New Mexico State Aggies": "C-USA",
  "Jacksonville State Gamecocks": "C-USA",
  "Middle Tennessee Blue Raiders": "C-USA",
  "LA Tech Bulldogs": "C-USA",
  "UTEP Miners": "C-USA",
  "FIU Panthers": "C-USA",
  "Sam Houston Bearkats": "C-USA",

  // Independents
  "Notre Dame Fighting Irish": "Independents",
  "Army Black Knights": "Independents",
  "UMass Minutemen": "Independents",
  "UConn Huskies": "Independents",
};

const normalize = (s: string) =>
  s.toLowerCase().replace(/\s+/g, " ").replace(/[.’']/g, "'").trim();

const MAP: Map<string, Conference> = new Map(
  Object.entries(RAW).map(([k, v]) => [normalize(k), v])
);

export function getConferenceForTeam(teamName: string): Conference {
  const key = normalize(teamName);
  return MAP.get(key) ?? "Unknown";
}

export function isPower5(conf: Conference) {
  return POWER5.has(conf);
}
