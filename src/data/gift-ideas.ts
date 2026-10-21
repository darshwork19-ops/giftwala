/**
 * GIFT IDEAS — concepts, not listings.
 *
 * These cover interests the GIFTWALA demo catalogue doesn't stock (sport,
 * travel, cars, tech and so on). They have no price, seller, stock or link
 * because none of that is verified: the UI labels them "Gift idea" and tells
 * the shopper what to check where they buy. `triggers` are the words in a
 * brief that make an idea relevant (matched after plural-stemming).
 */
export interface GiftIdea {
  id: string;
  title: string;
  summary: string;
  category: string;
  triggers: string[];
  /** What to check or ask before buying. */
  lookFor: string[];
  /** Where this kind of gift is usually bought, in general terms. */
  whereToFind: string;
}

export const giftIdeas: GiftIdea[] = [
  {
    id: "cricket-bat",
    title: "A cricket bat matched to how they play",
    summary: "A bat chosen for their level and style is a gift they'll use every match.",
    category: "Sports gear",
    triggers: ["cricket", "bat", "batting", "batsman", "batter", "cricketer"],
    lookFor: ["Their level: practice, club or tournament", "English or Kashmir willow", "Bat size and weight they prefer"],
    whereToFind: "Sports shops or a brand's official store",
  },
  {
    id: "team-jersey",
    title: "An official jersey of the team they support",
    summary: "Wearing their team's colours on match day never gets old.",
    category: "Sports merchandise",
    triggers: ["cricket", "football", "ipl", "jersey", "supporter", "fc", "basketball", "kabaddi"],
    lookFor: ["Which team and player they follow", "Their size", "Official merchandise, not a copy"],
    whereToFind: "The team's or league's official merchandise store",
  },
  {
    id: "match-ticket",
    title: "Tickets to a match they'd love to see",
    summary: "An experience with you, if a fixture fits the date and a city you can reach.",
    category: "Experience",
    triggers: ["cricket", "football", "ipl", "stadium", "tournament", "badminton", "kabaddi", "f1"],
    lookFor: ["A fixture near your date and city", "Official ticketing only", "Seats and travel for two"],
    whereToFind: "The event's official ticketing partner",
  },
  {
    id: "badminton-racket",
    title: "A badminton racket suited to their game",
    summary: "The right weight and balance makes a real difference to how they play.",
    category: "Sports gear",
    triggers: ["badminton", "racket", "racquet", "shuttle", "shuttlecock", "smash"],
    lookFor: ["Attacking or all-round play", "Racket weight (U grade) and balance", "Strung or unstrung"],
    whereToFind: "Sports shops or the brand's official store",
  },
  {
    id: "trekking-backpack",
    title: "A trekking backpack for their next trail",
    summary: "A well-fitted pack makes long hikes and mountain trips far more comfortable.",
    category: "Outdoor gear",
    triggers: ["trek", "trekking", "hike", "hiking", "hiker", "mountain", "mountaineering", "climbing", "camping", "outdoor", "outdoors", "adventure", "adventurous"],
    lookFor: ["Day pack or multi-day (litres)", "Fit for their back length", "Rain cover and hip belt"],
    whereToFind: "Outdoor gear shops",
  },
  {
    id: "travel-organisers",
    title: "Travel gear that makes trips easier",
    summary: "Packing cubes, a sturdy daypack or a universal adapter for someone always on the move.",
    category: "Travel gear",
    triggers: ["travel", "travelling", "traveling", "traveller", "traveler", "trip", "backpacking", "wanderlust", "explore", "exploring"],
    lookFor: ["How they travel: backpack or suitcase", "Where they go next", "Things they already own"],
    whereToFind: "Travel and luggage shops",
  },
  {
    id: "adventure-experience",
    title: "An adventure experience",
    summary: "Paragliding, rafting, scuba or a guided trek: a memory rather than a thing.",
    category: "Experience",
    triggers: ["adventure", "adventurous", "adrenaline", "paragliding", "rafting", "scuba", "diving", "skydiving", "bungee", "thrill"],
    lookFor: ["A licensed, reviewed operator", "Safety and fitness requirements", "Dates and weather"],
    whereToFind: "Licensed adventure operators",
  },
  {
    id: "car-model",
    title: "A scale model of a car they love",
    summary: "A detailed die-cast model of their favourite make or model for the desk or shelf.",
    category: "Collectible",
    triggers: ["car", "automobile", "automotive", "supercar", "f1", "formula", "racing", "motorsport", "porsche", "ferrari", "bmw", "mercedes", "lamborghini"],
    lookFor: ["Which car or team they love", "Scale (1:18, 1:24, 1:43)", "Licensed models"],
    whereToFind: "Hobby and collectibles shops",
  },
  {
    id: "driving-experience",
    title: "A track day or karting session",
    summary: "Time behind the wheel at a proper track, for someone who lives for cars.",
    category: "Experience",
    triggers: ["car", "racing", "f1", "formula", "motorsport", "karting", "driving"],
    lookFor: ["A licensed track near them", "Age and licence requirements", "Booking dates"],
    whereToFind: "Karting tracks and motorsport venues",
  },
  {
    id: "study-setup",
    title: "A calmer study setup",
    summary: "A good desk lamp, a planner or noise-cancelling earbuds, if they'd welcome help with exam prep.",
    category: "Study accessories",
    triggers: ["exam", "exams", "studying", "study", "student", "ca", "upsc", "neet", "jee", "finals", "college"],
    lookFor: ["Whether they'd like a study gift right now", "What their desk already has", "Quiet, practical picks"],
    whereToFind: "Stationery and electronics shops",
  },
  {
    id: "book-they-want",
    title: "A book by an author or on a subject they love",
    summary: "The next book in a series they follow, or a beautiful edition of a favourite.",
    category: "Books",
    triggers: ["book", "reading", "reader", "novel", "author", "fiction", "poetry", "manga", "comics", "bookworm"],
    lookFor: ["Authors and genres they love", "Books they already own", "A special or signed edition"],
    whereToFind: "Bookshops",
  },
  {
    id: "tech-accessory",
    title: "A tech accessory they'll use daily",
    summary: "A mechanical keyboard, a power bank or a good laptop stand for someone who loves gadgets.",
    category: "Technology",
    triggers: ["tech", "gadget", "coding", "coder", "programmer", "developer", "laptop", "computer", "keyboard", "techie", "engineer"],
    lookFor: ["Their devices and ports", "What they use most", "Warranty from the seller"],
    whereToFind: "Electronics shops or brand stores",
  },
  {
    id: "gaming-gift",
    title: "Something for their gaming setup",
    summary: "A controller, headset or game for the platform they actually play on.",
    category: "Gaming",
    triggers: ["gaming", "gamer", "game", "playstation", "ps5", "xbox", "nintendo", "console", "esports", "valorant", "bgmi"],
    lookFor: ["Which platform they use", "Games they already own", "Region compatibility"],
    whereToFind: "Gaming and electronics shops",
  },
  {
    id: "music-gift",
    title: "Music they love, live or at home",
    summary: "Concert tickets for an artist they follow, or gear for the instrument they play.",
    category: "Music",
    triggers: ["music", "concert", "gig", "guitar", "piano", "drums", "singer", "singing", "vinyl", "band", "musician", "ukulele"],
    lookFor: ["Artists or instrument", "Official ticketing for concerts", "Their skill level for gear"],
    whereToFind: "Music shops or official ticketing",
  },
  {
    id: "photography-gift",
    title: "A photography accessory or photo walk",
    summary: "A comfortable camera strap, a cleaning kit, or a guided photo walk in their city.",
    category: "Photography",
    triggers: ["photography", "photographer", "camera", "dslr", "lens", "filmmaking"],
    lookFor: ["Their camera model", "What kit they already have", "Local photo-walk organisers"],
    whereToFind: "Camera shops or local photo-walk groups",
  },
  {
    id: "fitness-gear",
    title: "Gear for how they keep fit",
    summary: "Running accessories, a good yoga mat or gym gear that fits their routine.",
    category: "Fitness",
    triggers: ["running", "runner", "marathon", "gym", "fitness", "workout", "yoga", "cycling", "cyclist", "swimming"],
    lookFor: ["Their sport and routine", "Sizes", "Brands they already trust"],
    whereToFind: "Sports and fitness shops",
  },
  {
    id: "cooking-class",
    title: "A cooking or baking class",
    summary: "A hands-on class in a cuisine they're curious about.",
    category: "Experience",
    triggers: ["cooking", "cook", "baking", "baker", "chef", "cuisine", "recipes", "kitchen"],
    lookFor: ["Cuisine they'd enjoy", "Class dates and location", "Dietary needs"],
    whereToFind: "Cooking studios and culinary schools",
  },
  {
    id: "art-supplies",
    title: "Quality supplies for the art they make",
    summary: "Better paints, brushes or a sketchbook for the medium they already use.",
    category: "Art supplies",
    triggers: ["drawing", "sketching", "sketch", "painting", "painter", "artist", "watercolour", "watercolor", "calligraphy"],
    lookFor: ["Their medium", "Paper or canvas they prefer", "Student or artist grade"],
    whereToFind: "Art supply shops",
  },
];
