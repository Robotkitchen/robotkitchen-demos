(function () {
  "use strict";

  /**
   * WEAN Glass — Robot Kitchen portfolio retail demo.
   * Boutique glassware for tobacco / legal use only. 21+ age gate.
   * Pattern: Night Coil checkout (POST /api/create-checkout-session, Stripe TEST).
   * Order numbers: WG-xxxxxx
   */
  const TAX_RATE = 0.06625; // NJ
  const SHIP_OPTIONS = [
    { id: "standard", label: "Standard (5–7 days)", price: 8 },
    { id: "express", label: "Express (2–3 days)", price: 18 },
    { id: "pickup", label: "In-store pickup", price: 0 }
  ];
  const CART_KEY = "wg_demo_cart_v1";
  const AGE_KEY = "wean_age_ok_v1";
  const RK_CARD_KEY = "rk_source_card_dismissed_wean";
  const CHECKOUT_API = "/api/create-checkout-session";

  const CATEGORIES = [
  "Water Pipes",
  "Hand Pipes",
  "Bubblers",
  "Rigs & Recyclers",
  "Bowls & Slides",
  "Downstems",
  "Ash Catchers",
  "Bangers & Nails",
  "Carb Caps & Tools",
  "Rolling",
  "Grinders",
  "Storage & Scales",
  "Lighters & Clean",
  "Silicone",
  "Vaporizers",
  "Lifestyle"
];

  const PRODUCTS = [
  {
    "id": "mint-tower",
    "category": "Water Pipes",
    "name": "Mint Tower Water Pipe",
    "blurb": "Tall percolator tower in soft mint glass with gold fleck accents. For tobacco / legal use only.",
    "price": 189,
    "img": "img/mint-tower.jpg",
    "options": {
      "size": {
        "label": "Joint size",
        "type": "radio",
        "required": true,
        "choices": [
          {
            "id": "14mm",
            "label": "14mm",
            "price": 0
          },
          {
            "id": "18mm",
            "label": "18mm",
            "price": 0
          }
        ]
      }
    }
  },
  {
    "id": "lavender-beaker",
    "category": "Water Pipes",
    "name": "Lavender Beaker",
    "blurb": "Classic beaker silhouette in translucent lavender with a gold mouthpiece ring. For tobacco / legal use only.",
    "price": 165,
    "img": "img/lavender-beaker.jpg",
    "options": {
      "size": {
        "label": "Joint size",
        "type": "radio",
        "required": true,
        "choices": [
          {
            "id": "14mm",
            "label": "14mm",
            "price": 0
          },
          {
            "id": "18mm",
            "label": "18mm",
            "price": 0
          }
        ]
      }
    }
  },
  {
    "id": "blush-curve",
    "category": "Water Pipes",
    "name": "Blush Curve",
    "blurb": "Petite curved water pipe in blush pink with mint swirls. For tobacco / legal use only.",
    "price": 148,
    "img": "img/blush-curve.jpg",
    "options": {}
  },
  {
    "id": "gold-mint-straight",
    "category": "Water Pipes",
    "name": "Gold-Mint Straight",
    "blurb": "Straight-tube form with mint and blush candy stripe and brushed-gold bands. For tobacco / legal use only.",
    "price": 198,
    "img": "img/gold-mint-straight.jpg",
    "options": {
      "size": {
        "label": "Joint size",
        "type": "radio",
        "required": true,
        "choices": [
          {
            "id": "14mm",
            "label": "14mm",
            "price": 0
          },
          {
            "id": "18mm",
            "label": "18mm",
            "price": 0
          }
        ]
      }
    }
  },
  {
    "id": "mint-spoon",
    "category": "Hand Pipes",
    "name": "Mint Spoon",
    "blurb": "Handblown spoon pipe in seafoam mint with a polished gold bowl rim. For tobacco / legal use only.",
    "price": 48,
    "img": "img/mint-spoon.jpg",
    "options": {}
  },
  {
    "id": "lilac-sherlock",
    "category": "Hand Pipes",
    "name": "Lilac Sherlock",
    "blurb": "Curved Sherlock-style hand pipe in soft lilac glass. For tobacco / legal use only.",
    "price": 62,
    "img": "img/lilac-sherlock.jpg",
    "options": {}
  },
  {
    "id": "pink-chillum",
    "category": "Hand Pipes",
    "name": "Blush Chillum",
    "blurb": "Slender one-hitter in blush pink with a gold tip ring. For tobacco / legal use only.",
    "price": 28,
    "img": "img/pink-chillum.jpg",
    "options": {
      "qtyPack": {
        "label": "Pack",
        "type": "radio",
        "required": true,
        "choices": [
          {
            "id": "single",
            "label": "Single",
            "price": 0
          },
          {
            "id": "pair",
            "label": "Pair (+$22)",
            "price": 22
          }
        ]
      }
    }
  },
  {
    "id": "lilac-gandalf",
    "category": "Hand Pipes",
    "name": "Lilac Long Curve",
    "blurb": "Long curved hand pipe in translucent lilac with gold rim accents. For tobacco / legal use only.",
    "price": 74,
    "img": "img/lilac-gandalf.jpg",
    "options": {}
  },
  {
    "id": "blush-spoon",
    "category": "Hand Pipes",
    "name": "Blush Spoon",
    "blurb": "Spoon pipe in mint-to-blush glass with gold bowl rim. For tobacco / legal use only.",
    "price": 52,
    "img": "img/blush-spoon.jpg",
    "options": {}
  },
  {
    "id": "dual-bubbler",
    "category": "Bubblers",
    "name": "Dual-Tone Bubbler",
    "blurb": "Compact bubbler in pink and mint with thin gold lines. For tobacco / legal use only.",
    "price": 98,
    "img": "img/dual-bubbler.jpg",
    "options": {}
  },
  {
    "id": "blush-hammer-bubbler",
    "category": "Bubblers",
    "name": "Blush Hammer Bubbler",
    "blurb": "Hammer-style bubbler in blush and mint with gold bands. For tobacco / legal use only.",
    "price": 112,
    "img": "img/blush-hammer-bubbler.jpg",
    "options": {}
  },
  {
    "id": "lilac-sherlock-bubbler",
    "category": "Bubblers",
    "name": "Lilac Sherlock Bubbler",
    "blurb": "Sherlock bubbler in soft lavender with mint chamber accents. For tobacco / legal use only.",
    "price": 118,
    "img": "img/lilac-sherlock-bubbler.jpg",
    "options": {}
  },
  {
    "id": "mint-rig",
    "category": "Rigs & Recyclers",
    "name": "Mint Recycler Rig",
    "blurb": "Compact recycler form in mint and clear glass with a gold joint accent. For tobacco / legal use only.",
    "price": 128,
    "img": "img/mint-rig.jpg",
    "options": {
      "joint": {
        "label": "Joint",
        "type": "radio",
        "required": true,
        "choices": [
          {
            "id": "14mm-f",
            "label": "14mm female",
            "price": 0
          },
          {
            "id": "10mm-f",
            "label": "10mm female",
            "price": 0
          }
        ]
      }
    }
  },
  {
    "id": "blush-recycler",
    "category": "Rigs & Recyclers",
    "name": "Blush Recycler",
    "blurb": "Multi-chamber recycler silhouette in mint with gold intake collar. For tobacco / legal use only.",
    "price": 156,
    "img": "img/blush-recycler.jpg",
    "options": {
      "joint": {
        "label": "Joint",
        "type": "radio",
        "required": true,
        "choices": [
          {
            "id": "14mm-f",
            "label": "14mm female",
            "price": 0
          },
          {
            "id": "10mm-f",
            "label": "10mm female",
            "price": 0
          }
        ]
      }
    }
  },
  {
    "id": "gold-mini-rig",
    "category": "Rigs & Recyclers",
    "name": "Gold Mini Rig",
    "blurb": "Petite blush-pink rig with gold flecks and gold joint. For tobacco / legal use only.",
    "price": 142,
    "img": "img/gold-mini-rig.jpg",
    "options": {}
  },
  {
    "id": "nectar-collector",
    "category": "Rigs & Recyclers",
    "name": "Mint Nectar Collector",
    "blurb": "Portable nectar-collector style piece in mint and clear glass with gold tip. For tobacco / legal use only.",
    "price": 68,
    "img": "img/nectar-collector.jpg",
    "options": {}
  },
  {
    "id": "pastel-bowl-trio",
    "category": "Bowls & Slides",
    "name": "Pastel Bowl Trio",
    "blurb": "Set of three slides in mint, lilac, and blush with gold rims. For tobacco / legal use only.",
    "price": 54,
    "img": "img/pastel-bowl-trio.jpg",
    "options": {
      "size": {
        "label": "Joint size",
        "type": "radio",
        "required": true,
        "choices": [
          {
            "id": "14mm",
            "label": "14mm",
            "price": 0
          },
          {
            "id": "18mm",
            "label": "18mm (+$6)",
            "price": 6
          }
        ]
      }
    }
  },
  {
    "id": "gold-rim-bowl",
    "category": "Bowls & Slides",
    "name": "Gold-Rim Mint Bowl",
    "blurb": "Single mint bowl piece with thick brushed-gold rim and handle. For tobacco / legal use only.",
    "price": 32,
    "img": "img/gold-rim-bowl.jpg",
    "options": {
      "size": {
        "label": "Joint size",
        "type": "radio",
        "required": true,
        "choices": [
          {
            "id": "14mm",
            "label": "14mm",
            "price": 0
          },
          {
            "id": "18mm",
            "label": "18mm",
            "price": 0
          }
        ]
      }
    }
  },
  {
    "id": "bowl-downstem",
    "category": "Bowls & Slides",
    "name": "Mint Bowl + Downstem Set",
    "blurb": "Matching mint bowl with gold rim and clear downstem. For tobacco / legal use only.",
    "price": 36,
    "img": "img/bowl-downstem.jpg",
    "options": {
      "size": {
        "label": "Joint size",
        "type": "radio",
        "required": true,
        "choices": [
          {
            "id": "14mm",
            "label": "14mm",
            "price": 0
          },
          {
            "id": "18mm",
            "label": "18mm (+$4)",
            "price": 4
          }
        ]
      }
    }
  },
  {
    "id": "mint-downstem",
    "category": "Downstems",
    "name": "Mint Diffused Downstem",
    "blurb": "Clear and mint downstem with gold collar accents. For tobacco / legal use only.",
    "price": 24,
    "img": "img/mint-downstem.jpg",
    "options": {
      "size": {
        "label": "Joint size",
        "type": "radio",
        "required": true,
        "choices": [
          {
            "id": "14mm",
            "label": "14mm",
            "price": 0
          },
          {
            "id": "18mm",
            "label": "18mm (+$3)",
            "price": 3
          }
        ]
      }
    }
  },
  {
    "id": "lilac-slotted-stem",
    "category": "Downstems",
    "name": "Lilac Slotted Stem",
    "blurb": "Slotted downstem finished with a soft lilac band and gold ring. For tobacco / legal use only.",
    "price": 26,
    "img": "img/mint-downstem.jpg",
    "options": {
      "size": {
        "label": "Joint size",
        "type": "radio",
        "required": true,
        "choices": [
          {
            "id": "14mm",
            "label": "14mm",
            "price": 0
          },
          {
            "id": "18mm",
            "label": "18mm",
            "price": 0
          }
        ]
      }
    }
  },
  {
    "id": "clear-extended-stem",
    "category": "Downstems",
    "name": "Clear Extended Stem",
    "blurb": "Longer clear stem for taller water pipes; gold joint collar. For tobacco / legal use only.",
    "price": 28,
    "img": "img/bowl-downstem.jpg",
    "options": {
      "length": {
        "label": "Length",
        "type": "radio",
        "required": true,
        "choices": [
          {
            "id": "4in",
            "label": "4 in",
            "price": 0
          },
          {
            "id": "5in",
            "label": "5 in (+$4)",
            "price": 4
          },
          {
            "id": "6in",
            "label": "6 in (+$6)",
            "price": 6
          }
        ]
      }
    }
  },
  {
    "id": "lilac-ashcatcher",
    "category": "Ash Catchers",
    "name": "Lilac Ash Catcher",
    "blurb": "45\u00b0 ash catcher in translucent lilac with brushed-gold bands. For tobacco / legal use only.",
    "price": 54,
    "img": "img/lilac-ashcatcher.jpg",
    "options": {
      "angle": {
        "label": "Angle",
        "type": "radio",
        "required": true,
        "choices": [
          {
            "id": "45",
            "label": "45\u00b0",
            "price": 0
          },
          {
            "id": "90",
            "label": "90\u00b0",
            "price": 0
          }
        ]
      }
    }
  },
  {
    "id": "mint-ashcatcher",
    "category": "Ash Catchers",
    "name": "Mint Ash Catcher",
    "blurb": "Chambered ash catcher in lilac glass with gold rings. For tobacco / legal use only.",
    "price": 58,
    "img": "img/mint-ashcatcher.jpg",
    "options": {
      "angle": {
        "label": "Angle",
        "type": "radio",
        "required": true,
        "choices": [
          {
            "id": "45",
            "label": "45\u00b0",
            "price": 0
          },
          {
            "id": "90",
            "label": "90\u00b0",
            "price": 0
          }
        ]
      }
    }
  },
  {
    "id": "blush-ashcatcher",
    "category": "Ash Catchers",
    "name": "Blush Ash Catcher",
    "blurb": "Blush pink ash catcher with mint joint and gold accents. For tobacco / legal use only.",
    "price": 56,
    "img": "img/blush-ashcatcher.jpg",
    "options": {
      "angle": {
        "label": "Angle",
        "type": "radio",
        "required": true,
        "choices": [
          {
            "id": "45",
            "label": "45\u00b0",
            "price": 0
          },
          {
            "id": "90",
            "label": "90\u00b0",
            "price": 0
          }
        ]
      }
    }
  },
  {
    "id": "quartz-banger-gold",
    "category": "Bangers & Nails",
    "name": "Quartz Banger \u00b7 Gold Collar",
    "blurb": "Clear quartz banger with brushed-gold joint collar. For tobacco / legal use only.",
    "price": 38,
    "img": "img/quartz-banger-gold.jpg",
    "options": {
      "size": {
        "label": "Joint size",
        "type": "radio",
        "required": true,
        "choices": [
          {
            "id": "14mm",
            "label": "14mm",
            "price": 0
          },
          {
            "id": "10mm",
            "label": "10mm",
            "price": 0
          }
        ]
      }
    }
  },
  {
    "id": "thermal-banger",
    "category": "Bangers & Nails",
    "name": "Thermal Quartz Banger",
    "blurb": "Thermal-style quartz nail with gold accent collar. For tobacco / legal use only.",
    "price": 48,
    "img": "img/quartz-banger-gold.jpg",
    "options": {
      "size": {
        "label": "Joint size",
        "type": "radio",
        "required": true,
        "choices": [
          {
            "id": "14mm",
            "label": "14mm",
            "price": 0
          },
          {
            "id": "10mm",
            "label": "10mm",
            "price": 0
          }
        ]
      }
    }
  },
  {
    "id": "flat-top-nail",
    "category": "Bangers & Nails",
    "name": "Flat-Top Quartz Nail",
    "blurb": "Flat-top quartz nail for even heat \u2014 gold joint ring. For tobacco / legal use only.",
    "price": 42,
    "img": "img/quartz-banger-gold.jpg",
    "options": {}
  },
  {
    "id": "carb-set",
    "category": "Carb Caps & Tools",
    "name": "Pastel Carb Cap Set",
    "blurb": "Mint and lavender carb caps with gold-fleck pearls. For tobacco / legal use only.",
    "price": 42,
    "img": "img/carb-set.jpg",
    "options": {}
  },
  {
    "id": "directional-carb",
    "category": "Carb Caps & Tools",
    "name": "Directional Carb Duo",
    "blurb": "Mint and lilac directional caps with matching pearls. For tobacco / legal use only.",
    "price": 46,
    "img": "img/directional-carb.jpg",
    "options": {}
  },
  {
    "id": "gold-dab-tool",
    "category": "Carb Caps & Tools",
    "name": "Gold Dab Tool Pair",
    "blurb": "Elegant gold-stem dab tools with mint and lilac glass tips. For tobacco / legal use only.",
    "price": 36,
    "img": "img/gold-dab-tool.jpg",
    "options": {}
  },
  {
    "id": "rolling-papers-set",
    "category": "Rolling",
    "name": "Lilac Papers + Tips",
    "blurb": "Boutique rolling papers booklet with tips \u2014 tobacco / legal use. For tobacco / legal use only.",
    "price": 8,
    "img": "img/rolling-papers-set.jpg",
    "options": {
      "pack": {
        "label": "Pack",
        "type": "radio",
        "required": true,
        "choices": [
          {
            "id": "single",
            "label": "1 booklet",
            "price": 0
          },
          {
            "id": "trio",
            "label": "3-pack (+$14)",
            "price": 14
          }
        ]
      }
    }
  },
  {
    "id": "pastel-cones",
    "category": "Rolling",
    "name": "Pastel Pre-Roll Cones",
    "blurb": "Lilac pre-roll cones with gold fleck pattern \u2014 legal herbal use. For tobacco / legal use only.",
    "price": 12,
    "img": "img/rolling-papers-set.jpg",
    "options": {
      "count": {
        "label": "Count",
        "type": "radio",
        "required": true,
        "choices": [
          {
            "id": "6",
            "label": "6 cones",
            "price": 0
          },
          {
            "id": "12",
            "label": "12 cones (+$8)",
            "price": 8
          }
        ]
      }
    }
  },
  {
    "id": "pastel-rolling-tray",
    "category": "Rolling",
    "name": "Stained-Glass Rolling Tray",
    "blurb": "Matte black tray with mint and gold geometric inlay. For tobacco / legal use only.",
    "price": 28,
    "img": "img/pastel-rolling-tray.jpg",
    "options": {}
  },
  {
    "id": "wraps-tips-kit",
    "category": "Rolling",
    "name": "Wraps + Tips Kit",
    "blurb": "Hemp wraps with matching tips \u2014 tobacco / legal herbal use. For tobacco / legal use only.",
    "price": 14,
    "img": "img/rolling-papers-set.jpg",
    "options": {}
  },
  {
    "id": "gold-grinder",
    "category": "Grinders",
    "name": "Gold 4-Piece Grinder",
    "blurb": "Brushed-gold metal grinder with mint sealing rings. For tobacco / legal use only.",
    "price": 44,
    "img": "img/gold-grinder.jpg",
    "options": {}
  },
  {
    "id": "lilac-grinder",
    "category": "Grinders",
    "name": "Lilac Anodized Grinder",
    "blurb": "Lilac aluminum grinder with gold top plate. For tobacco / legal use only.",
    "price": 38,
    "img": "img/lilac-grinder.jpg",
    "options": {}
  },
  {
    "id": "mini-gold-grinder",
    "category": "Grinders",
    "name": "Mini Gold Grinder",
    "blurb": "Pocket 2-piece gold grinder with mint O-ring. For tobacco / legal use only.",
    "price": 22,
    "img": "img/gold-grinder.jpg",
    "options": {}
  },
  {
    "id": "glass-jars-set",
    "category": "Storage & Scales",
    "name": "Frosted Jar Trio",
    "blurb": "Frosted glass jars with mint and gold lids. For tobacco / legal use only.",
    "price": 34,
    "img": "img/glass-jars-set.jpg",
    "options": {}
  },
  {
    "id": "smellproof-pouch",
    "category": "Storage & Scales",
    "name": "Mint Trim Smell-Proof Pouch",
    "blurb": "Black smell-proof zipper pouch with mint and gold trim. For tobacco / legal use only.",
    "price": 26,
    "img": "img/smellproof-pouch.jpg",
    "options": {
      "size": {
        "label": "Size",
        "type": "radio",
        "required": true,
        "choices": [
          {
            "id": "sm",
            "label": "Small",
            "price": 0
          },
          {
            "id": "md",
            "label": "Medium (+$6)",
            "price": 6
          }
        ]
      }
    }
  },
  {
    "id": "stash-box-pastel",
    "category": "Storage & Scales",
    "name": "Pastel Stash Box",
    "blurb": "Compact stash box with frosted jar and tray insert. For tobacco / legal use only.",
    "price": 48,
    "img": "img/glass-jars-set.jpg",
    "options": {}
  },
  {
    "id": "pocket-scale",
    "category": "Storage & Scales",
    "name": "Gold-Button Pocket Scale",
    "blurb": "Matte black digital pocket scale with gold buttons and mint bezel. For tobacco / legal use only.",
    "price": 29,
    "img": "img/pocket-scale.jpg",
    "options": {}
  },
  {
    "id": "gold-torch-set",
    "category": "Lighters & Clean",
    "name": "Gold Torch + Soft Flame Set",
    "blurb": "Jet torch and soft-flame lighter in gold with mint leather accents. For tobacco / legal use only.",
    "price": 52,
    "img": "img/gold-torch-set.jpg",
    "options": {}
  },
  {
    "id": "soft-flame-gold",
    "category": "Lighters & Clean",
    "name": "Soft-Flame Gold Lighter",
    "blurb": "Soft-flame pocket lighter with mint leather inlay. For tobacco / legal use only.",
    "price": 24,
    "img": "img/gold-torch-set.jpg",
    "options": {}
  },
  {
    "id": "cleaning-kit",
    "category": "Lighters & Clean",
    "name": "Glass Cleaning Kit",
    "blurb": "Brush, cloth, and cleaner bottle for glassware care. For tobacco / legal use only.",
    "price": 18,
    "img": "img/cleaning-kit.jpg",
    "options": {}
  },
  {
    "id": "iso-cleaner-bottle",
    "category": "Lighters & Clean",
    "name": "Mint Cleaner Bottle",
    "blurb": "Glass-safe cleaner spray in mint bottle \u2014 demo packaging. For tobacco / legal use only.",
    "price": 12,
    "img": "img/cleaning-kit.jpg",
    "options": {}
  },
  {
    "id": "silicone-set",
    "category": "Silicone",
    "name": "Mint + Blush Silicone Duo",
    "blurb": "Travel silicone pipe and bubbler with gold band accents. For tobacco / legal use only.",
    "price": 46,
    "img": "img/silicone-set.jpg",
    "options": {}
  },
  {
    "id": "mint-silicone-pipe",
    "category": "Silicone",
    "name": "Mint Silicone Hand Piece",
    "blurb": "Matte mint silicone hand piece with gold carb ring. For tobacco / legal use only.",
    "price": 22,
    "img": "img/silicone-set.jpg",
    "options": {}
  },
  {
    "id": "blush-silicone-bubbler",
    "category": "Silicone",
    "name": "Blush Silicone Bubbler",
    "blurb": "Unbreakable blush silicone bubbler with gold connectors. For tobacco / legal use only.",
    "price": 36,
    "img": "img/silicone-set.jpg",
    "options": {}
  },
  {
    "id": "dry-herb-vape",
    "category": "Vaporizers",
    "name": "Mint-Trim Dry Herb Vape",
    "blurb": "Portable dry-herb vaporizer in matte black with mint and gold trim. For tobacco / legal use only.",
    "price": 129,
    "img": "img/dry-herb-vape.jpg",
    "options": {}
  },
  {
    "id": "erig-device",
    "category": "Vaporizers",
    "name": "Lilac E-Rig",
    "blurb": "Compact e-rig base in lilac with gold controls and glass top. For tobacco / legal use only.",
    "price": 189,
    "img": "img/erig-device.jpg",
    "options": {}
  },
  {
    "id": "battery-pen",
    "category": "Vaporizers",
    "name": "510 Battery Pen",
    "blurb": "Slim 510-thread battery in matte black with gold and mint rings. For tobacco / legal use only.",
    "price": 34,
    "img": "img/battery-pen.jpg",
    "options": {}
  },
  {
    "id": "concentrate-pen",
    "category": "Vaporizers",
    "name": "Concentrate Travel Pen",
    "blurb": "Compact concentrate pen with mint light strip \u2014 legal use. For tobacco / legal use only.",
    "price": 59,
    "img": "img/battery-pen.jpg",
    "options": {}
  },
  {
    "id": "glass-pendant",
    "category": "Lifestyle",
    "name": "Stained-Glass Orb Pendant",
    "blurb": "Handblown glass orb in mint, lilac, and pink facets with a gold bail.",
    "price": 72,
    "img": "img/glass-pendant.jpg",
    "options": {
      "chain": {
        "label": "Chain",
        "type": "radio",
        "required": true,
        "choices": [
          {
            "id": "gold",
            "label": "Gold-tone 18\"",
            "price": 0
          },
          {
            "id": "none",
            "label": "Pendant only (\u2212$8)",
            "price": -8
          }
        ]
      }
    }
  },
  {
    "id": "pastel-tapestry",
    "category": "Lifestyle",
    "name": "Pastel Stained-Glass Tapestry",
    "blurb": "Wall hanging with mint, lilac, blush, and gold geometric panes.",
    "price": 48,
    "img": "img/pastel-tapestry.jpg",
    "options": {
      "size": {
        "label": "Size",
        "type": "radio",
        "required": true,
        "choices": [
          {
            "id": "sm",
            "label": "Small",
            "price": 0
          },
          {
            "id": "lg",
            "label": "Large (+$22)",
            "price": 22
          }
        ]
      }
    }
  },
  {
    "id": "mini-lilac-pipe",
    "category": "Water Pipes",
    "name": "Mini Lilac Beaker",
    "blurb": "Compact beaker in blush-lilac with gold flecks and gold ring. For tobacco / legal use only.",
    "price": 96,
    "img": "img/mini-lilac-pipe.jpg",
    "options": {
      "size": {
        "label": "Joint size",
        "type": "radio",
        "required": true,
        "choices": [
          {
            "id": "14mm",
            "label": "14mm",
            "price": 0
          },
          {
            "id": "18mm",
            "label": "18mm",
            "price": 0
          }
        ]
      }
    }
  },
  {
    "id": "decor-ashtray",
    "category": "Lifestyle",
    "name": "Gold Rim Ashtray",
    "blurb": "Ceramic ashtray with mint glaze and brushed-gold rim. Lifestyle desk piece.",
    "price": 32,
    "img": "img/pastel-rolling-tray.jpg",
    "options": {}
  }
];

  const state = {
    category: "all",
    search: "",
    cart: loadCart(),
    shipId: "standard",
    fulfill: "ship",
    name: "",
    phone: "",
    email: "",
    note: "",
    modal: null,
    modalQty: 1,
    modalOpts: {},
    paying: false,
    payError: "",
    ageOk: false
  };

  function loadCart() {
    try {
      const raw = sessionStorage.getItem(CART_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveCart() {
    sessionStorage.setItem(CART_KEY, JSON.stringify(state.cart));
  }

  function money(n) {
    return "$" + (Math.round(n * 100) / 100).toFixed(2);
  }

  function productById(id) {
    return PRODUCTS.find((p) => p.id === id);
  }

  function lineUnitPrice(line) {
    const p = productById(line.id);
    if (!p) return 0;
    let total = p.price;
    Object.keys(line.opts || {}).forEach((key) => {
      const group = p.options && p.options[key];
      if (!group) return;
      const val = line.opts[key];
      if (group.type === "check" && Array.isArray(val)) {
        val.forEach((cid) => {
          const c = group.choices.find((x) => x.id === cid);
          if (c) total += c.price;
        });
      } else {
        const c = group.choices.find((x) => x.id === val);
        if (c) total += c.price;
      }
    });
    return total;
  }

  function cartCount() {
    return state.cart.reduce((n, l) => n + l.qty, 0);
  }

  function cartSubtotal() {
    return state.cart.reduce((n, l) => n + lineUnitPrice(l) * l.qty, 0);
  }

  function cartTax(sub) {
    return sub * TAX_RATE;
  }

  function shipPrice() {
    const opt = SHIP_OPTIONS.find((s) => s.id === state.shipId) || SHIP_OPTIONS[0];
    return opt.price;
  }

  function cartTotal() {
    const sub = cartSubtotal();
    return sub + cartTax(sub) + shipPrice();
  }

  function optsLabel(line) {
    const p = productById(line.id);
    if (!p) return "";
    const bits = [];
    Object.keys(line.opts || {}).forEach((key) => {
      const group = p.options && p.options[key];
      if (!group) return;
      const val = line.opts[key];
      if (group.type === "check" && Array.isArray(val) && val.length) {
        const labels = val
          .map((cid) => {
            const c = group.choices.find((x) => x.id === cid);
            return c ? c.label : cid;
          })
          .join(", ");
        bits.push(labels);
      } else if (val) {
        const c = group.choices.find((x) => x.id === val);
        bits.push(c ? c.label : String(val));
      }
    });
    return bits.join(" · ");
  }

  if (/[?&]seed=1(?:&|$)/.test(location.search) && !state.cart.length) {
    state.cart = [
      { id: "mint-tower", qty: 1, opts: { size: "14mm" } },
      { id: "mint-spoon", qty: 1, opts: {} },
      { id: "glass-pendant", qty: 1, opts: { chain: "gold" } }
    ];
    state.name = "Demo Guest";
    state.phone = "(732) 555-0142";
    state.email = "demo@robotkitchen.us";
    saveCart();
  }

  function route() {
    const hash = location.hash || "#/";
    if (hash.startsWith("#/checkout")) return "checkout";
    if (hash.startsWith("#/success")) return "success";
    if (hash.startsWith("#/cancel")) return "cancel";
    if (hash.startsWith("#/product/")) return "product";
    return "menu";
  }

  function productRouteId() {
    const hash = location.hash || "";
    const m = hash.match(/^#\/product\/([a-z0-9-]+)/i);
    return m ? m[1] : null;
  }

  function setCartOpen(open) {
    const drawer = document.getElementById("cart-drawer");
    const scrim = document.getElementById("cart-scrim");
    const btn = document.getElementById("cart-toggle");
    if (!drawer || !btn) return;
    drawer.classList.toggle("open", open);
    drawer.setAttribute("aria-hidden", open ? "false" : "true");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    if (scrim) scrim.hidden = !open;
  }

  function updateCartBadge() {
    const el = document.getElementById("cart-count");
    if (el) el.textContent = String(cartCount());
  }

  function renderCart() {
    const body = document.getElementById("cart-body");
    const foot = document.getElementById("cart-foot");
    if (!body || !foot) return;
    updateCartBadge();
    if (!state.cart.length) {
      body.innerHTML = '<div class="cart-empty">Your cart is empty.<br/>Browse the collection to add glassware.</div>';
      foot.innerHTML = "";
      return;
    }
    body.innerHTML = state.cart
      .map((line, idx) => {
        const p = productById(line.id);
        const meta = optsLabel(line);
        return (
          '<div class="cart-line" data-idx="' +
          idx +
          '">' +
          '<div><div class="cart-line-name">' +
          escapeHtml(p ? p.name : line.id) +
          "</div>" +
          (meta ? '<div class="cart-line-meta">' + escapeHtml(meta) + "</div>" : "") +
          '<div class="qty-ctrl">' +
          '<button type="button" data-act="dec" aria-label="Decrease">−</button>' +
          "<span>" +
          line.qty +
          "</span>" +
          '<button type="button" data-act="inc" aria-label="Increase">+</button>' +
          '<button type="button" data-act="rm" aria-label="Remove" style="margin-left:0.35rem;width:auto;padding:0 0.45rem;font-size:0.75rem">Remove</button>' +
          "</div></div>" +
          '<div class="price">' +
          money(lineUnitPrice(line) * line.qty) +
          "</div></div>"
        );
      })
      .join("");

    const sub = cartSubtotal();
    foot.innerHTML =
      '<div class="line-row"><span class="muted">Subtotal</span><span>' +
      money(sub) +
      "</span></div>" +
      '<div class="line-row"><span class="muted">Tax (est.)</span><span>' +
      money(cartTax(sub)) +
      "</span></div>" +
      '<div class="line-row total"><span>Total</span><span>' +
      money(sub + cartTax(sub)) +
      "</span></div>" +
      '<div class="btn-row"><a class="primary-btn" href="#/checkout" id="go-checkout">Checkout</a></div>';

    body.querySelectorAll(".cart-line").forEach((el) => {
      const idx = Number(el.getAttribute("data-idx"));
      el.querySelectorAll("button").forEach((btn) => {
        btn.addEventListener("click", () => {
          const act = btn.getAttribute("data-act");
          if (act === "inc") state.cart[idx].qty += 1;
          if (act === "dec") state.cart[idx].qty = Math.max(1, state.cart[idx].qty - 1);
          if (act === "rm") state.cart.splice(idx, 1);
          saveCart();
          renderCart();
          if (route() === "checkout") render();
        });
      });
    });

    const go = document.getElementById("go-checkout");
    if (go) go.addEventListener("click", () => setCartOpen(false));
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function matchesSearch(p, q) {
    if (!q) return true;
    const hay = (p.name + " " + p.blurb + " " + p.category).toLowerCase();
    return q.split(/\s+/).filter(Boolean).every((tok) => hay.indexOf(tok) >= 0);
  }

  function renderMenu() {
    const app = document.getElementById("app");
    const q = (state.search || "").trim().toLowerCase();
    const cats =
      '<div class="cat-bar">' +
      '<div class="search-wrap"><input class="search-input" id="shop-search" type="search" placeholder="Search glass, trays, grinders…" value="' +
      escapeHtml(state.search || "") +
      '" aria-label="Search products" /></div>' +
      '<div class="cat-scroll" role="toolbar" aria-label="Shop categories">' +
      '<button type="button" class="cat-chip" data-cat="all" aria-pressed="' +
      (state.category === "all") +
      '">All</button>' +
      CATEGORIES.map(
        (c) =>
          '<button type="button" class="cat-chip" data-cat="' +
          escapeHtml(c) +
          '" aria-pressed="' +
          (state.category === c) +
          '">' +
          escapeHtml(c) +
          "</button>"
      ).join("") +
      "</div></div>";

    const catList = state.category === "all" ? CATEGORIES : [state.category];
    const sections = catList
      .map((cat) => {
        const items = PRODUCTS.filter((p) => p.category === cat && matchesSearch(p, q));
        if (!items.length) return "";
        return (
          '<section class="menu-section" id="cat-' +
          escapeHtml(cat.toLowerCase().replace(/[^a-z0-9]+/g, "-")) +
          '"><h2>' +
          escapeHtml(cat) +
          ' <span class="muted" style="font-size:0.85rem;font-family:var(--font)">(' +
          items.length +
          ')</span></h2><div class="product-grid">' +
          items
            .map(
              (p) =>
                '<article class="product-card">' +
                '<a class="product-card-link" href="#/product/' +
                escapeHtml(p.id) +
                '">' +
                '<img class="product-card-img" src="' +
                escapeHtml(p.img) +
                '" alt="' +
                escapeHtml(p.name) +
                '" loading="lazy" />' +
                '<div class="product-card-body"><h3>' +
                escapeHtml(p.name) +
                "</h3><p>" +
                escapeHtml(p.blurb) +
                '</p><div class="price">' +
                money(p.price) +
                "</div></div></a>" +
                '<button type="button" class="ghost-btn add-quick" data-id="' +
                escapeHtml(p.id) +
                '">Add</button></article>'
            )
            .join("") +
          "</div></section>"
        );
      })
      .join("");

    const empty =
      sections.trim()
        ? ""
        : '<p class="empty-cat">No pieces match that search. Try another word or clear the filter.</p>';

    app.innerHTML =
      '<section class="hero">' +
      '<img class="hero-photo" src="img/hero-storefront-v4.jpg" alt="WEAN Glass boutique storefront with stained-glass doors" />' +
      '<div class="hero-copy">' +
      '<h1 class="brand-lockup">WEAN Glass</h1>' +
      "<p>Boutique glassware in mint, lilac, and blush — crafted for tobacco and other legal use.</p>" +
      '<div class="hero-badges"><span class="badge">21+</span></div>' +
      "</div></section>" +
      '<p class="legal-banner">Must be 21+. Products intended for tobacco / legal herbal use only. No health claims.</p>' +
      cats +
      (sections || empty);

    const searchEl = document.getElementById("shop-search");
    if (searchEl) {
      searchEl.addEventListener("input", () => {
        state.search = searchEl.value;
        renderMenu();
        const again = document.getElementById("shop-search");
        if (again) {
          again.focus();
          const len = again.value.length;
          try { again.setSelectionRange(len, len); } catch (_) {}
        }
      });
    }
    app.querySelectorAll(".cat-chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.category = btn.getAttribute("data-cat");
        renderMenu();
      });
    });
    app.querySelectorAll(".add-quick").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        openModal(btn.getAttribute("data-id"));
      });
    });
  }

  function renderProduct() {
    const app = document.getElementById("app");
    const id = productRouteId();
    const p = productById(id);
    if (!p) {
      app.innerHTML =
        '<div class="checkout-view"><h1>Not found</h1><p class="checkout-sub">That piece is not in this demo collection.</p><a class="primary-btn" href="#/">Back to shop</a></div>';
      return;
    }
    app.innerHTML =
      '<div class="product-view">' +
      '<a class="back-link" href="#/">← Collection</a>' +
      '<img class="product-hero" src="' +
      escapeHtml(p.img) +
      '" alt="' +
      escapeHtml(p.name) +
      '" />' +
      '<div class="product-pad">' +
      '<p class="muted" style="margin:0 0 0.35rem;font-size:0.8rem;letter-spacing:0.06em;text-transform:uppercase">' +
      escapeHtml(p.category) +
      "</p>" +
      "<h1>" +
      escapeHtml(p.name) +
      "</h1>" +
      '<p class="price" style="font-size:1.35rem;margin:0.35rem 0 0.75rem">' +
      money(p.price) +
      "</p>" +
      "<p>" +
      escapeHtml(p.blurb) +
      "</p>" +
      '<p class="legal-note">For tobacco and other legal use only. 21+.</p>' +
      '<button type="button" class="primary-btn" id="pd-add">Add to cart</button>' +
      "</div></div>";
    document.getElementById("pd-add").onclick = () => openModal(p.id);
  }

  function defaultOpts(product) {
    const opts = {};
    Object.keys(product.options || {}).forEach((key) => {
      const g = product.options[key];
      if (g.type === "check") opts[key] = [];
      else if (g.choices && g.choices.length) opts[key] = g.choices[0].id;
    });
    return opts;
  }

  function openModal(id) {
    const p = productById(id);
    if (!p) return;
    state.modal = p;
    state.modalQty = 1;
    state.modalOpts = defaultOpts(p);
    drawModal();
  }

  function drawModal() {
    const p = state.modal;
    const modal = document.getElementById("item-modal");
    const scrim = document.getElementById("modal-scrim");
    if (!p) {
      modal.hidden = true;
      scrim.hidden = true;
      return;
    }
    const unit = (function () {
      let t = p.price;
      Object.keys(state.modalOpts).forEach((key) => {
        const g = p.options[key];
        if (!g) return;
        const val = state.modalOpts[key];
        if (g.type === "check" && Array.isArray(val)) {
          val.forEach((cid) => {
            const c = g.choices.find((x) => x.id === cid);
            if (c) t += c.price;
          });
        } else {
          const c = g.choices.find((x) => x.id === val);
          if (c) t += c.price;
        }
      });
      return t;
    })();

    let optsHtml = "";
    Object.keys(p.options || {}).forEach((key) => {
      const g = p.options[key];
      optsHtml += '<fieldset class="opt-group"><legend>' + escapeHtml(g.label) + "</legend>";
      g.choices.forEach((c) => {
        const checked =
          g.type === "check"
            ? (state.modalOpts[key] || []).indexOf(c.id) >= 0
            : state.modalOpts[key] === c.id;
        optsHtml +=
          '<label class="opt-choice"><input type="' +
          (g.type === "check" ? "checkbox" : "radio") +
          '" name="' +
          escapeHtml(key) +
          '" value="' +
          escapeHtml(c.id) +
          '"' +
          (checked ? " checked" : "") +
          " /> " +
          escapeHtml(c.label) +
          "<span>" +
          (c.price ? (c.price > 0 ? "+" : "") + money(c.price) : "") +
          "</span></label>";
      });
      optsHtml += "</fieldset>";
    });

    modal.innerHTML =
      '<img class="modal-hero" src="' +
      escapeHtml(p.img) +
      '" alt="" />' +
      '<div class="modal-pad">' +
      '<button type="button" class="icon-btn" id="modal-x" aria-label="Close" style="position:absolute;top:0.5rem;right:0.5rem;background:rgba(0,0,0,0.45);border-radius:999px;color:#fff">×</button>' +
      '<h2 id="modal-title">' +
      escapeHtml(p.name) +
      "</h2>" +
      '<p class="muted">' +
      escapeHtml(p.blurb) +
      "</p>" +
      optsHtml +
      '<div class="modal-actions">' +
      '<div class="qty-ctrl">' +
      '<button type="button" id="mq-dec" aria-label="Decrease">−</button>' +
      '<span id="mq">' +
      state.modalQty +
      "</span>" +
      '<button type="button" id="mq-inc" aria-label="Increase">+</button>' +
      "</div>" +
      '<button type="button" class="primary-btn" id="add-cart">Add · ' +
      money(unit * state.modalQty) +
      "</button></div></div>";

    modal.hidden = false;
    scrim.hidden = false;
    modal.style.position = "fixed";

    document.getElementById("modal-x").onclick = closeModal;
    document.getElementById("mq-dec").onclick = () => {
      state.modalQty = Math.max(1, state.modalQty - 1);
      drawModal();
    };
    document.getElementById("mq-inc").onclick = () => {
      state.modalQty += 1;
      drawModal();
    };
    modal.querySelectorAll("input").forEach((input) => {
      input.addEventListener("change", () => {
        const name = input.name;
        const g = p.options[name];
        if (g.type === "check") {
          const set = new Set(state.modalOpts[name] || []);
          if (input.checked) set.add(input.value);
          else set.delete(input.value);
          state.modalOpts[name] = Array.from(set);
        } else {
          state.modalOpts[name] = input.value;
        }
        drawModal();
      });
    });
    document.getElementById("add-cart").onclick = () => {
      state.cart.push({
        id: p.id,
        qty: state.modalQty,
        opts: JSON.parse(JSON.stringify(state.modalOpts))
      });
      saveCart();
      closeModal();
      renderCart();
      setCartOpen(true);
    };
  }

  function closeModal() {
    state.modal = null;
    document.getElementById("item-modal").hidden = true;
    document.getElementById("modal-scrim").hidden = true;
  }

  function renderCheckout() {
    const app = document.getElementById("app");
    if (!state.cart.length) {
      app.innerHTML =
        '<div class="checkout-view"><h1>Checkout</h1><p class="checkout-sub">Your cart is empty.</p>' +
        '<a class="primary-btn" href="#/">Back to shop</a></div>';
      return;
    }
    const sub = cartSubtotal();
    const tax = cartTax(sub);
    const ship = shipPrice();
    const total = sub + tax + ship;

    app.innerHTML =
      '<div class="checkout-view">' +
      "<h1>Checkout</h1>" +
      '<p class="checkout-sub">Ship or pick up · WEAN Glass demo</p>' +
      '<div class="panel"><h2>Delivery</h2>' +
      '<div class="ship-list" id="ships">' +
      SHIP_OPTIONS.map(
        (s) =>
          '<button type="button" class="ship-opt" data-ship="' +
          escapeHtml(s.id) +
          '" aria-pressed="' +
          (state.shipId === s.id) +
          '"><span>' +
          escapeHtml(s.label) +
          "</span><span>" +
          (s.price ? money(s.price) : "Free") +
          "</span></button>"
      ).join("") +
      "</div></div>" +
      '<div class="panel"><h2>Contact</h2>' +
      '<div class="field"><label for="c-name">Name</label><input id="c-name" autocomplete="name" value="' +
      escapeHtml(state.name) +
      '" placeholder="Your name" /></div>' +
      '<div class="field"><label for="c-phone">Phone</label><input id="c-phone" inputmode="tel" autocomplete="tel" value="' +
      escapeHtml(state.phone) +
      '" placeholder="(555) 555-0100" /></div>' +
      '<div class="field"><label for="c-email">Email (receipt)</label><input id="c-email" type="email" autocomplete="email" value="' +
      escapeHtml(state.email) +
      '" placeholder="you@email.com" /></div>' +
      '<div class="field"><label for="c-note">Order note</label><input id="c-note" value="' +
      escapeHtml(state.note) +
      '" placeholder="Gift wrap, leave at door…" /></div></div>' +
      '<div class="panel"><h2>Order summary</h2>' +
      state.cart
        .map((line) => {
          const p = productById(line.id);
          return (
            '<div class="line-row"><span>' +
            escapeHtml(p ? p.name : line.id) +
            " ×" +
            line.qty +
            "</span><span>" +
            money(lineUnitPrice(line) * line.qty) +
            "</span></div>"
          );
        })
        .join("") +
      '<div class="line-row"><span class="muted">Subtotal</span><span>' +
      money(sub) +
      "</span></div>" +
      '<div class="line-row"><span class="muted">Tax</span><span>' +
      money(tax) +
      "</span></div>" +
      '<div class="line-row"><span class="muted">Shipping</span><span>' +
      money(ship) +
      "</span></div>" +
      '<div class="line-row total"><span>Total</span><span>' +
      money(total) +
      "</span></div></div>" +
      (state.payError
        ? '<div class="mock-banner" role="alert">' + escapeHtml(state.payError) + "</div>"
        : "") +
      '<button type="button" class="primary-btn" id="pay-btn"' +
      (state.paying ? " disabled" : "") +
      ">" +
      (state.paying ? "Starting Stripe…" : "Pay with Stripe (TEST)") +
      "</button>" +
      '<a class="ghost-btn" href="#/">Back to shop</a>' +
      '<p class="muted" style="margin-top:0.85rem;font-size:0.8rem;text-align:center">Secure checkout · demo only — no real charges.<br/>21+ · Tobacco / legal use only.</p>' +
      "</div>";

    document.querySelectorAll("#ships .ship-opt").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.shipId = btn.getAttribute("data-ship");
        state.fulfill = state.shipId === "pickup" ? "pickup" : "ship";
        renderCheckout();
      });
    });
    ["c-name", "c-phone", "c-email", "c-note"].forEach((id) => {
      const el = document.getElementById(id);
      el.addEventListener("input", () => {
        if (id === "c-name") state.name = el.value;
        if (id === "c-phone") state.phone = el.value;
        if (id === "c-email") state.email = el.value;
        if (id === "c-note") state.note = el.value;
      });
    });
    document.getElementById("pay-btn").onclick = startPay;
  }

  async function startPay() {
    if (state.paying) return;
    if (!state.name.trim() || !state.phone.trim()) {
      state.payError = "Add a name and phone for order updates (demo).";
      renderCheckout();
      return;
    }
    state.paying = true;
    state.payError = "";
    renderCheckout();

    const origin = location.origin;
    const items = state.cart.map((line) => {
      const p = productById(line.id);
      return {
        id: line.id,
        name: p ? p.name : line.id,
        unit_amount: Math.round(lineUnitPrice(line) * 100),
        quantity: line.qty,
        description: optsLabel(line) || undefined
      };
    });
    const sub = cartSubtotal();
    const taxCents = Math.round(cartTax(sub) * 100);
    const shipCents = Math.round(shipPrice() * 100);
    if (taxCents > 0) {
      items.push({ id: "tax", name: "Sales tax (est.)", unit_amount: taxCents, quantity: 1 });
    }
    if (shipCents > 0) {
      const shipLabel = (SHIP_OPTIONS.find((s) => s.id === state.shipId) || {}).label || "Shipping";
      items.push({ id: "ship", name: "Shipping — " + shipLabel, unit_amount: shipCents, quantity: 1 });
    }

    const payload = {
      demo: "wean",
      customer: {
        name: state.name.trim(),
        phone: state.phone.trim(),
        email: state.email.trim() || undefined
      },
      note: state.note.trim() || undefined,
      fulfill: state.fulfill,
      items,
      success_url: origin + "/demo/web/wean/#/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: origin + "/demo/web/wean/#/cancel"
    };

    try {
      const res = await fetch(CHECKOUT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      if (data && data.url) {
        location.href = data.url;
        return;
      }
      if (data && (data.fallback || data.mock || res.status === 503 || !res.ok)) {
        sessionStorage.setItem(
          "wg_demo_checkout_payload",
          JSON.stringify({
            ...payload,
            total: cartTotal(),
            reason: data.error || "no_stripe_key"
          })
        );
        location.href = "mock-checkout.html";
        return;
      }
      state.payError = (data && data.error) || "Could not start Stripe Checkout.";
    } catch (err) {
      sessionStorage.setItem(
        "wg_demo_checkout_payload",
        JSON.stringify({
          ...payload,
          total: cartTotal(),
          reason: "api_unreachable"
        })
      );
      location.href = "mock-checkout.html";
      return;
    } finally {
      state.paying = false;
    }
    renderCheckout();
  }

  function renderSuccess() {
    const app = document.getElementById("app");
    const params = new URLSearchParams(location.hash.split("?")[1] || "");
    const sid = params.get("session_id") || "mock";
    const alnum = String(sid).replace(/[^a-zA-Z0-9]/g, "");
    const orderNum = "WG-" + (alnum.slice(-6) || "DEMO00").toUpperCase();
    state.cart = [];
    saveCart();
    renderCart();
    app.innerHTML =
      '<div class="success-view">' +
      '<div class="success-icon">✓</div>' +
      "<h1>Order placed (demo)</h1>" +
      '<p class="checkout-sub">Thanks' +
      (state.name ? ", " + escapeHtml(state.name) : "") +
      ". This was a test payment — no real charge.</p>" +
      '<div class="panel"><div class="line-row"><span class="muted">Order #</span><span>' +
      escapeHtml(orderNum) +
      "</span></div></div>" +
      '<a class="primary-btn" href="#/">Back to shop</a></div>';
  }

  function renderCancel() {
    const app = document.getElementById("app");
    app.innerHTML =
      '<div class="checkout-view"><h1>Checkout canceled</h1>' +
      '<p class="checkout-sub">No charge was made. Your cart is still here.</p>' +
      '<a class="primary-btn" href="#/checkout">Return to checkout</a>' +
      '<a class="ghost-btn" href="#/">Back to shop</a></div>';
  }

  function render() {
    if (!state.ageOk) return;
    const r = route();
    if (r === "checkout") renderCheckout();
    else if (r === "success") renderSuccess();
    else if (r === "cancel") renderCancel();
    else if (r === "product") renderProduct();
    else renderMenu();
    renderCart();
  }

  function initRkCard() {
    const card = document.getElementById("rk-source-card");
    const close = document.getElementById("rk-source-close");
    if (!card) return;
    try {
      if (sessionStorage.getItem(RK_CARD_KEY) === "1") return;
    } catch (_) {}
    card.hidden = false;
    setTimeout(() => card.classList.add("show"), 1000);
    close.addEventListener("click", () => {
      card.classList.remove("show");
      try {
        sessionStorage.setItem(RK_CARD_KEY, "1");
      } catch (_) {}
      setTimeout(() => {
        card.hidden = true;
      }, 400);
    });
  }

  function enterStore() {
    state.ageOk = true;
    document.body.classList.remove("age-locked");
    document.getElementById("age-gate").hidden = true;
    document.getElementById("age-exit").hidden = true;
    document.getElementById("store-shell").hidden = false;
    document.getElementById("cart-toggle").addEventListener("click", () => {
      const open = !document.getElementById("cart-drawer").classList.contains("open");
      setCartOpen(open);
    });
    document.getElementById("cart-close").addEventListener("click", () => setCartOpen(false));
    document.getElementById("cart-scrim").addEventListener("click", () => setCartOpen(false));
    document.getElementById("modal-scrim").addEventListener("click", closeModal);
    window.addEventListener("hashchange", render);
    render();
    initRkCard();
  }

  function initAgeGate() {
    // Always show 21+ gate on every entry/page load — never remember the answer.
    try { localStorage.removeItem(AGE_KEY); } catch (_) {}
    try { sessionStorage.removeItem(AGE_KEY); } catch (_) {}
    document.getElementById("age-yes").addEventListener("click", () => {
      enterStore();
    });
    document.getElementById("age-no").addEventListener("click", () => {
      document.getElementById("age-gate").hidden = true;
      document.getElementById("age-exit").hidden = false;
    });
  }

  initAgeGate();
})();
