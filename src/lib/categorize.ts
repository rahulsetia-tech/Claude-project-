interface CategoryRule {
  patterns: string[];
  category: string;
}

const RULES: CategoryRule[] = [
  {
    patterns: [
      "swiggy",
      "zomato",
      "ubereats",
      "eatfit",
      "eatsure",
      "domino",
      "pizza",
      "biryani",
      "cafe",
      "starbucks",
      "ccd",
      "kfc",
      "mcdonald",
      "burger",
    ],
    category: "Eating Out",
  },
  {
    patterns: ["uber", "ola", "rapido", "yulu", "metro", "auto", "blusmart", "namma yatri"],
    category: "Ride-share",
  },
  {
    patterns: ["kindle", "book", "crossword", "blossom", "stationery"],
    category: "Books",
  },
  {
    patterns: [
      "netflix",
      "spotify",
      "prime video",
      "hotstar",
      "youtube premium",
      "apple music",
      "saavn",
      "gaana",
      "disney",
      "subscription",
    ],
    category: "Subscriptions",
  },
  {
    patterns: ["mess", "canteen", "tiffin", "dabba"],
    category: "Mess",
  },
  {
    patterns: ["hostel", "rent", " pg ", "landlord", "warden"],
    category: "Hostel",
  },
  {
    patterns: ["jio", "airtel", "vodafone", "vi recharge", "recharge", "broadband", "wifi"],
    category: "Phone/Internet",
  },
  {
    patterns: ["electricity", "bescom", "tneb", "kseb", "tata power", "water bill", "gas bill"],
    category: "Bills",
  },
  {
    patterns: ["flipkart", "amazon", "myntra", "ajio", "nykaa", "meesho", "shoppers stop"],
    category: "Shopping",
  },
  {
    patterns: ["atm", "cash withdrawal"],
    category: "Cash",
  },
];

export function categorize(description: string): string {
  const d = ` ${description.toLowerCase()} `;
  for (const rule of RULES) {
    for (const p of rule.patterns) {
      if (d.includes(p)) return rule.category;
    }
  }
  return "Other";
}

export function listCategories(): string[] {
  return [...RULES.map((r) => r.category), "Other"];
}

const CATEGORY_ICONS: Record<string, string> = {
  "Eating Out": "🍽",
  "Ride-share": "🚖",
  Books: "📚",
  Subscriptions: "🎬",
  Mess: "🍱",
  Hostel: "🏠",
  "Phone/Internet": "📱",
  Bills: "🧾",
  Shopping: "🛍",
  Cash: "💵",
  Other: "✨",
};

export function iconFor(category: string): string {
  return CATEGORY_ICONS[category] ?? CATEGORY_ICONS.Other;
}
