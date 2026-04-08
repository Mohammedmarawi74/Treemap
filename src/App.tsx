/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import { LayoutDashboard, Info, Maximize2, Search, ChevronLeft, Activity, Globe, Zap, X, TrendingUp, BarChart3, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type RawNode = {
  [key: string]: any;
} & {
  $count?: number;
};

interface TreeNode {
  name: string;
  value?: number;
  children?: TreeNode[];
}

interface CompanyData {
  name: string;
  value: number;
  sector: string;
  group: string;
  industry: string;
  subIndustry: string;
}

type FilterType = 'all' | 'top10' | 'largest';

// Helper function to flatten all companies
function flattenCompanies(data: RawNode): CompanyData[] {
  const companies: CompanyData[] = [];
  
  function traverse(obj: any, path: string[] = []) {
    if (!obj || typeof obj !== 'object') return;
    
    const keys = Object.keys(obj).filter(k => k !== '$count');
    
    if (keys.length === 0 && obj.$count !== undefined) {
      companies.push({
        name: path[path.length - 1] || 'Unknown',
        value: obj.$count,
        sector: path[0] || '',
        group: path[1] || '',
        industry: path[2] || '',
        subIndustry: path[3] || ''
      });
    } else {
      keys.forEach(key => {
        traverse(obj[key], [...path, key]);
      });
    }
  }
  
  Object.keys(data).filter(k => k !== '$count').forEach(sector => {
    traverse(data[sector], [sector]);
  });
  
  return companies;
}

const MOCK_RAW_DATA: RawNode = {
  "1. قطاع الطاقة": {
    "مجموعة الطاقة": {
      "معدات وخدمات الطاقة": {
        "حفر النفط والغاز": {
          "Helmerich & Payne": { $count: 120 },
          "Nabors Industries": { $count: 110 },
          "Patterson-UTI": { $count: 105 }
        },
        "معدات وخدمات النفط والغاز": {
          "Schlumberger": { $count: 300 },
          "Halliburton": { $count: 280 },
          "Baker Hughes": { $count: 260 }
        }
      },
      "النفط والغاز والوقود الاستهلاكي": {
        "النفط والغاز المتكامل": {
          "ExxonMobil": { $count: 500 },
          "Chevron": { $count: 480 },
          "Shell": { $count: 460 }
        },
        "استكشاف وإنتاج النفط والغاز": {
          "ConocoPhillips": { $count: 350 },
          "EOG Resources": { $count: 320 },
          "Occidental Petroleum": { $count: 310 }
        },
        "تكرير وتسويق النفط والغاز": {
          "Marathon Petroleum": { $count: 280 },
          "Valero Energy": { $count: 270 },
          "Phillips 66": { $count: 260 }
        },
        "تخزين ونقل النفط والغاز": {
          "Enbridge": { $count: 240 },
          "Enterprise Products": { $count: 230 },
          "Kinder Morgan": { $count: 220 }
        },
        "الفحم والوقود الاستهلاكي": {
          "Peabody Energy": { $count: 150 },
          "Arch Resources": { $count: 140 },
          "Warrior Met Coal": { $count: 130 }
        }
      }
    }
  },
  "2. قطاع المواد": {
    "مجموعة المواد": {
      "المواد الكيميائية": {
        "المواد الكيميائية الأساسية": {
          "Dow Inc.": { $count: 200 },
          "LyondellBasell": { $count: 190 },
          "Westlake": { $count: 180 }
        },
        "المواد الكيميائية المتنوعة": {
          "BASF": { $count: 220 },
          "DuPont": { $count: 210 },
          "PPG Industries": { $count: 200 }
        },
        "الأسمدة والمواد الكيميائية الزراعية": {
          "Nutrien": { $count: 180 },
          "Mosaic": { $count: 170 },
          "CF Industries": { $count: 160 }
        },
        "الغازات الصناعية": {
          "Linde": { $count: 250 },
          "Air Liquide": { $count: 240 },
          "Air Products": { $count: 230 }
        },
        "المواد الكيميائية المتخصصة": {
          "Albemarle": { $count: 170 },
          "Ecolab": { $count: 165 },
          "Sherwin-Williams": { $count: 160 }
        }
      },
      "مواد البناء": {
        "مواد البناء": {
          "Holcim": { $count: 190 },
          "CRH plc": { $count: 185 },
          "Martin Marietta": { $count: 180 }
        }
      },
      "الحاويات والتغليف": {
        "الحاويات المعدنية والزجاجية والبلاستيكية": {
          "Ball Corporation": { $count: 150 },
          "Crown Holdings": { $count: 145 },
          "Berry Global": { $count: 140 }
        },
        "منتجات ومواد التغليف الورقية والبلاستيكية": {
          "International Paper": { $count: 160 },
          "WestRock": { $count: 155 },
          "Amcor": { $count: 150 }
        }
      },
      "المعادن والتعدين": {
        "الألومنيوم": {
          "Alcoa": { $count: 140 },
          "Rio Tinto": { $count: 135 },
          "Norsk Hydro": { $count: 130 }
        },
        "المعادن والتعدين المتنوعة": {
          "BHP": { $count: 300 },
          "Freeport-McMoRan": { $count: 280 },
          "Anglo American": { $count: 260 }
        },
        "النحاس": {
          "Southern Copper": { $count: 160 },
          "Antofagasta": { $count: 155 },
          "First Quantum": { $count: 150 }
        },
        "الذهب": {
          "Newmont": { $count: 200 },
          "Barrick Gold": { $count: 190 },
          "Agnico Eagle": { $count: 180 }
        },
        "المعادن الثمينة والمعادن": {
          "Wheaton Precious Metals": { $count: 150 },
          "Franco-Nevada": { $count: 145 },
          "Royal Gold": { $count: 140 }
        },
        "الفضة": {
          "Pan American Silver": { $count: 130 },
          "First Majestic": { $count: 125 },
          "Hecla Mining": { $count: 120 }
        },
        "الصلب": {
          "Nucor": { $count: 180 },
          "ArcelorMittal": { $count: 175 },
          "U.S. Steel": { $count: 170 }
        }
      },
      "منتجات الورق والغابات": {
        "منتجات الغابات": {
          "Weyerhaeuser": { $count: 140 },
          "Rayonier": { $count: 135 },
          "PotlatchDeltic": { $count: 130 }
        },
        "المنتجات الورقية": {
          "Sylvamo": { $count: 120 },
          "Packaging Corp": { $count: 115 },
          "Stora Enso": { $count: 110 }
        }
      }
    }
  },
  "3. قطاع الصناعات": {
    "مجموعة السلع الرأسمالية": {
      "الفضاء والدفاع": {
        "Boeing": { $count: 400 },
        "Lockheed Martin": { $count: 380 },
        "Airbus": { $count: 370 }
      },
      "منتجات البناء": {
        "Johnson Controls": { $count: 200 },
        "Carrier Global": { $count: 190 },
        "Trane Technologies": { $count: 180 }
      },
      "البناء والهندسة": {
        "Quanta Services": { $count: 170 },
        "AECOM": { $count: 165 },
        "Jacobs Solutions": { $count: 160 }
      },
      "المعدات الكهربائية": {
        "Schneider Electric": { $count: 250 },
        "Eaton": { $count: 240 },
        "Emerson Electric": { $count: 230 }
      },
      "التكتلات الصناعية": {
        "General Electric": { $count: 350 },
        "3M": { $count: 330 },
        "Honeywell": { $count: 320 }
      },
      "الآلات": {
        "Caterpillar": { $count: 300 },
        "Deere & Company": { $count: 280 },
        "Cummins": { $count: 260 }
      },
      "شركات التجارة والموزعين": {
        "Fastenal": { $count: 150 },
        "W.W. Grainger": { $count: 145 },
        "United Rentals": { $count: 140 }
      }
    },
    "مجموعة الخدمات التجارية والمهنية": {
      "الخدمات والإمدادات التجارية": {
        "Waste Management": { $count: 220 },
        "Republic Services": { $count: 210 },
        "Cintas": { $count: 200 }
      },
      "الخدمات المهنية": {
        "Accenture": { $count: 400 },
        "Automatic Data Processing": { $count: 380 },
        "Paychex": { $count: 360 }
      }
    },
    "مجموعة النقل": {
      "الشحن الجوي والخدمات اللوجستية": {
        "UPS": { $count: 350 },
        "FedEx": { $count: 330 },
        "DHL": { $count: 310 }
      },
      "شركات الطيران للركاب": {
        "Delta Air Lines": { $count: 250 },
        "United Airlines": { $count: 240 },
        "American Airlines": { $count: 230 }
      },
      "النقل البحري": {
        "Maersk": { $count: 200 },
        "Hapag-Lloyd": { $count: 190 },
        "Evergreen Marine": { $count: 180 }
      },
      "النقل البري": {
        "Union Pacific": { $count: 280 },
        "CSX Corp": { $count: 270 },
        "Norfolk Southern": { $count: 260 }
      },
      "البنية التحتية للنقل": {
        "Aena": { $count: 150 },
        "Fraport": { $count: 145 },
        "Grupo Aeroportuario": { $count: 140 }
      }
    }
  },
  "4. قطاع السلع الاستهلاكية الكمالية": {
    "مجموعة السيارات ومكوناتها": {
      "مكونات السيارات": {
        "Aptiv": { $count: 160 },
        "BorgWarner": { $count: 155 },
        "Magna International": { $count: 150 }
      },
      "السيارات": {
        "Tesla": { $count: 600 },
        "Toyota": { $count: 550 },
        "Volkswagen": { $count: 500 }
      }
    },
    "مجموعة السلع المعمرة والملابس": {
      "السلع المعمرة المنزلية": {
        "Sony": { $count: 300 },
        "Whirlpool": { $count: 280 },
        "Garmin": { $count: 260 }
      },
      "منتجات ترفيهية": {
        "Hasbro": { $count: 140 },
        "Mattel": { $count: 135 },
        "Peloton": { $count: 130 }
      },
      "المنسوجات والملابس والسلع الفاخرة": {
        "Nike": { $count: 450 },
        "LVMH": { $count: 430 },
        "Adidas": { $count: 410 }
      }
    },
    "مجموعة الخدمات الاستهلاكية": {
      "الفنادق والمطاعم والترفيه": {
        "McDonald's": { $count: 500 },
        "Starbucks": { $count: 480 },
        "Marriott": { $count: 460 }
      },
      "خدمات المستهلك المتنوعة": {
        "H&R Block": { $count: 120 },
        "Chegg": { $count: 115 },
        "Bright Horizons": { $count: 110 }
      }
    },
    "مجموعة توزيع وتجزئة السلع الكمالية": {
      "الموزعون": {
        "Genuine Parts": { $count: 140 },
        "LKQ Corp": { $count: 135 },
        "Pool Corp": { $count: 130 }
      },
      "تجارة التجزئة واسعة النطاق": {
        "Amazon": { $count: 700 },
        "eBay": { $count: 650 },
        "MercadoLibre": { $count: 600 }
      },
      "تجارة التجزئة المتخصصة": {
        "Home Depot": { $count: 400 },
        "Lowe's": { $count: 380 },
        "TJX Companies": { $count: 360 }
      }
    }
  },
  "5. قطاع السلع الاستهلاكية الأساسية": {
    "مجموعة توزيع وتجزئة السلع الأساسية": {
      "تجزئة الأدوية والأغذية": {
        "Walmart": { $count: 600 },
        "Costco": { $count: 580 },
        "CVS Health": { $count: 550 }
      }
    },
    "مجموعة الأغذية والمشروبات والتبغ": {
      "المشروبات": {
        "Coca-Cola": { $count: 450 },
        "PepsiCo": { $count: 440 },
        "Monster Beverage": { $count: 420 }
      },
      "المنتجات الغذائية": {
        "Nestle": { $count: 400 },
        "Mondelez": { $count: 380 },
        "General Mills": { $count: 360 }
      },
      "التبغ": {
        "Philip Morris": { $count: 300 },
        "Altria Group": { $count: 280 },
        "British American Tobacco": { $count: 260 }
      }
    },
    "مجموعة المنتجات المنزلية والشخصية": {
      "المنتجات المنزلية": {
        "Procter & Gamble": { $count: 500 },
        "Colgate-Palmolive": { $count: 480 },
        "Clorox": { $count: 460 }
      },
      "منتجات العناية الشخصية": {
        "Estee Lauder": { $count: 250 },
        "L'Oreal": { $count: 240 },
        "Unilever": { $count: 230 }
      }
    }
  },
  "6. قطاع الرعاية الصحية": {
    "مجموعة معدات وخدمات الرعاية الصحية": {
      "معدات ومستلزمات الرعاية الصحية": {
        "Medtronic": { $count: 300 },
        "Abbott Laboratories": { $count: 290 },
        "Stryker": { $count: 280 }
      },
      "مقدمو خدمات الرعاية الصحية": {
        "UnitedHealth Group": { $count: 500 },
        "Elevance Health": { $count: 480 },
        "Cigna": { $count: 460 }
      },
      "تكنولوجيا الرعاية الصحية": {
        "Veeva Systems": { $count: 180 },
        "Teladoc Health": { $count: 170 },
        "Doximity": { $count: 160 }
      }
    },
    "مجموعة الأدوية والتكنولوجيا الحيوية": {
      "التكنولوجيا الحيوية": {
        "Amgen": { $count: 350 },
        "Gilead Sciences": { $count: 340 },
        "Vertex Pharmaceuticals": { $count: 330 }
      },
      "المستحضرات الصيدلانية": {
        "Johnson & Johnson": { $count: 600 },
        "Pfizer": { $count: 580 },
        "Eli Lilly": { $count: 560 }
      },
      "أدوات وخدمات علوم الحياة": {
        "Thermo Fisher": { $count: 320 },
        "Danaher": { $count: 310 },
        "Agilent Technologies": { $count: 300 }
      }
    }
  },
  "7. قطاع المالية": {
    "مجموعة البنوك": {
      "البنوك المتنوعة والإقليمية": {
        "JPMorgan Chase": { $count: 600 },
        "Bank of America": { $count: 580 },
        "Wells Fargo": { $count: 550 }
      }
    },
    "مجموعة الخدمات المالية": {
      "الخدمات المالية المتنوعة": {
        "Visa": { $count: 500 },
        "Mastercard": { $count: 480 },
        "Goldman Sachs": { $count: 460 }
      },
      "صناديق الاستثمار العقاري للرهن العقاري": {
        "Annaly Capital": { $count: 150 },
        "AGNC Investment": { $count: 145 },
        "Starwood Property": { $count: 140 }
      }
    },
    "مجموعة التأمين": {
      "وسطاء وشركات التأمين": {
        "Berkshire Hathaway": { $count: 700 },
        "Chubb": { $count: 650 },
        "MetLife": { $count: 600 }
      }
    }
  },
  "8. قطاع تكنولوجيا المعلومات": {
    "مجموعة البرمجيات والخدمات": {
      "خدمات تكنولوجيا المعلومات": {
        "IBM": { $count: 350 },
        "Infosys": { $count: 330 },
        "Cognizant": { $count: 310 }
      },
      "البرمجيات": {
        "Microsoft": { $count: 800 },
        "Oracle": { $count: 750 },
        "Salesforce": { $count: 700 }
      }
    },
    "مجموعة الأجهزة والمعدات التكنولوجية": {
      "الأجهزة والمكونات الإلكترونية": {
        "Apple": { $count: 900 },
        "Cisco Systems": { $count: 850 },
        "HP Inc.": { $count: 800 }
      }
    },
    "مجموعة أشباه الموصلات": {
      "أشباه الموصلات": {
        "NVIDIA": { $count: 850 },
        "Intel": { $count: 800 },
        "TSMC": { $count: 750 }
      }
    }
  },
  "9. قطاع خدمات الاتصالات": {
    "مجموعة خدمات الاتصالات": {
      "خدمات الاتصالات اللاسلكية": {
        "AT&T": { $count: 400 },
        "Verizon": { $count: 380 },
        "T-Mobile": { $count: 360 }
      }
    },
    "مجموعة الإعلام والترفيه": {
      "الوسائط": {
        "Disney": { $count: 500 },
        "Netflix": { $count: 480 },
        "Comcast": { $count: 460 }
      },
      "الترفيه والوسائط التفاعلية": {
        "Alphabet (Google)": { $count: 800 },
        "Meta (Facebook)": { $count: 750 },
        "Tencent": { $count: 700 }
      }
    }
  },
  "10. قطاع المرافق": {
    "مجموعة المرافق": {
      "شركات الكهرباء والغاز والمياه": {
        "NextEra Energy": { $count: 300 },
        "Duke Energy": { $count: 280 },
        "Southern Company": { $count: 260 }
      },
      "منتجو الطاقة المتجددة": {
        "Brookfield Renewable": { $count: 180 },
        "AES Corp": { $count: 170 },
        "Vistra Corp": { $count: 160 }
      }
    }
  },
  "11. قطاع العقارات": {
    "مجموعة صناديق الاستثمار العقاري": {
      "صناديق الاستثمار العقاري": {
        "American Tower": { $count: 250 },
        "Prologis": { $count: 240 },
        "Equinix": { $count: 230 }
      }
    },
    "مجموعة إدارة وتطوير العقارات": {
      "إدارة وتطوير العقارات": {
        "CBRE Group": { $count: 220 },
        "Jones Lang LaSalle": { $count: 210 },
        "Zillow Group": { $count: 200 }
      }
    }
  }
};

// Search and Filter Component
function SearchAndFilters({
  companies,
  onFilterChange,
  activeFilter
}: {
  companies: CompanyData[];
  onFilterChange: (filtered: CompanyData[], filter: FilterType) => void;
  activeFilter: FilterType;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredCompanies = useMemo(() => {
    let filtered = companies;

    // Apply search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(term) ||
        c.sector.toLowerCase().includes(term) ||
        c.industry.toLowerCase().includes(term)
      );
    }

    // Apply filter
    if (activeFilter === 'top10') {
      filtered = [...companies].sort((a, b) => b.value - a.value).slice(0, 10);
    } else if (activeFilter === 'largest') {
      filtered = [...companies].sort((a, b) => b.value - a.value).slice(0, 20);
    }

    return filtered;
  }, [companies, searchTerm, activeFilter]);

  useEffect(() => {
    onFilterChange(filteredCompanies, activeFilter);
  }, [filteredCompanies, activeFilter, onFilterChange]);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-10"
    >
      {/* Search Bar */}
      <div className="relative">
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700/50 p-3 shadow-2xl">
          <Search className="w-5 h-5 text-sky-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث عن شركة أو قطاع..."
            className="flex-1 bg-transparent border-none outline-none text-white placeholder-slate-400 text-sm font-['IBM_Plex_Sans_Arabic']"
            dir="rtl"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-1.5 rounded-lg transition-all ${
              isExpanded ? 'bg-sky-500/20 text-sky-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Expanded Filters */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 bg-slate-900/95 backdrop-blur-md rounded-xl border border-slate-700/50 overflow-hidden shadow-2xl"
            >
              <div className="p-3 space-y-2">
                <button
                  onClick={() => onFilterChange(companies, 'all')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-['IBM_Plex_Sans_Arabic'] ${
                    activeFilter === 'all'
                      ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                      : 'text-slate-300 hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>عرض الكل ({companies.length} شركة)</span>
                </button>
                <button
                  onClick={() => onFilterChange(
                    [...companies].sort((a, b) => b.value - a.value).slice(0, 10),
                    'top10'
                  )}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-['IBM_Plex_Sans_Arabic'] ${
                    activeFilter === 'top10'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-300 hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>أفضل 10 شركات أداءً</span>
                </button>
                <button
                  onClick={() => onFilterChange(
                    [...companies].sort((a, b) => b.value - a.value).slice(0, 20),
                    'largest'
                  )}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-['IBM_Plex_Sans_Arabic'] ${
                    activeFilter === 'largest'
                      ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                      : 'text-slate-300 hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>أكبر 20 شركة (القيمة السوقية)</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Active Filter Badge */}
      <AnimatePresence>
        {activeFilter !== 'all' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mt-2 flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 rounded-full text-xs text-slate-300 font-['IBM_Plex_Sans_Arabic']"
          >
            {activeFilter === 'top10' ? (
              <>
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                <span>أفضل 10 شركات أداءً</span>
              </>
            ) : (
              <>
                <BarChart3 className="w-3 h-3 text-violet-400" />
                <span>أكبر 20 شركة</span>
              </>
            )}
            <button
              onClick={() => onFilterChange(companies, 'all')}
              className="mr-1 text-slate-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function App() {
  const [filteredCompanies, setFilteredCompanies] = useState<CompanyData[] | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const echartsRef = useRef<any>(null);

  const allCompanies = useMemo(() => flattenCompanies(MOCK_RAW_DATA), []);

  const handleFilterChange = useCallback((companies: CompanyData[], filter: FilterType) => {
    setFilteredCompanies(companies);
    setActiveFilter(filter);
  }, []);

  // Build tree from filtered or all companies
  const data = useMemo(() => {
    const companies = filteredCompanies || allCompanies;
    
    // Build hierarchical tree structure
    const treeMap: Record<string, any> = {};
    
    companies.forEach(company => {
      const sector = company.sector;
      const group = company.group;
      const industry = company.industry;
      const subIndustry = company.subIndustry;
      
      if (!treeMap[sector]) {
        treeMap[sector] = { $children: {} };
      }
      if (group && !treeMap[sector].$children[group]) {
        treeMap[sector].$children[group] = { $children: {} };
      }
      if (industry && !treeMap[sector].$children[group].$children[industry]) {
        treeMap[sector].$children[group].$children[industry] = { $children: {} };
      }
      if (subIndustry && !treeMap[sector].$children[group].$children[industry].$children[subIndustry]) {
        treeMap[sector].$children[group].$children[industry].$children[subIndustry] = {};
      }
      
      // Assign company to the deepest level
      const target = subIndustry 
        ? treeMap[sector].$children[group].$children[industry].$children[subIndustry]
        : industry 
          ? treeMap[sector].$children[group].$children[industry]
          : group 
            ? treeMap[sector].$children[group]
            : treeMap[sector];
      
      target[company.name] = { $count: company.value };
    });
    
    function buildTree(source: any, name: string): any {
      const node: any = { name };

      if (source && typeof source === 'object') {
        const keys = Object.keys(source).filter(k => k !== '$children' && k !== '$count');
        const childrenKeys = Object.keys(source).filter(k => k === '$children');
        
        if (childrenKeys.length > 0) {
          const childObj = source.$children;
          node.children = Object.keys(childObj)
            .map(key => buildTree(childObj[key], key))
            .filter(n => n);
        } else if (keys.length > 0) {
          node.children = keys.map(key => buildTree(source[key], key));
        } else {
          node.value = source.$count || 100;
        }
      } else {
        node.value = source || 100;
      }

      return node;
    }

    return Object.keys(treeMap)
      .filter(key => key !== '$count')
      .map(key => buildTree(treeMap[key], key));
  }, [filteredCompanies, allCompanies]);

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      borderColor: 'rgba(56, 189, 248, 0.2)',
      borderWidth: 1,
      padding: [12, 16],
      textStyle: { 
        color: '#f8fafc',
        fontFamily: 'IBM Plex Sans Arabic',
      },
      formatter: (params: any) => {
        const path = params.treePathInfo
          .map((p: any) => p.name)
          .filter((n: string) => n && n !== '')
          .join(' ← ');
        return `
          <div style="direction: rtl; text-align: right; min-width: 180px; font-family: 'IBM Plex Sans Arabic', sans-serif;">
            <div style="font-size: 11px; color: #94a3b8; font-weight: 500; margin-bottom: 6px;">${path}</div>
            <div style="font-size: 16px; font-weight: 700; color: #f8fafc; margin-bottom: 8px;">${params.name}</div>
            <div style="height: 1px; background: rgba(255,255,255,0.1); margin: 8px 0;"></div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 8px;">
              <span style="color: #38bdf8; font-weight: 700; font-size: 15px;">${params.value.toLocaleString()}</span>
              <span style="color: #94a3b8; font-size: 12px; font-weight: 500;">القيمة</span>
            </div>
          </div>
        `;
      }
    },
    series: [
      {
        name: 'القطاعات',
        type: 'treemap',
        visibleMin: 0,
        data: data,
        leafDepth: 1,
        drillDownIcon: '', // Removed default icon as we use custom UI
        roam: 'move',
        nodeClick: 'zoomToNode',
        breadcrumb: {
          show: true,
          left: 'center',
          bottom: 25,
          height: 32,
          itemStyle: {
            color: 'rgba(30, 41, 59, 0.7)',
            borderColor: 'rgba(56, 189, 248, 0.3)',
            borderWidth: 1,
            textStyle: {
              fontFamily: 'IBM Plex Sans Arabic',
              fontSize: 12,
              color: '#94a3b8',
              fontWeight: '500'
            }
          }
        },
        label: {
          show: true,
          formatter: '{b}',
          fontSize: 14,
          fontFamily: 'IBM Plex Sans Arabic',
          fontWeight: '600',
          color: '#fff',
          overflow: 'break',
          lineHeight: 18
        },
        upperLabel: {
          show: true,
          height: 35,
          color: '#fff',
          fontWeight: '700',
          fontSize: 14,
          fontFamily: 'IBM Plex Sans Arabic',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          overflow: 'break',
          formatter: '  {b}'
        },
        levels: [
          {
            itemStyle: {
              borderColor: '#0f172a',
              borderWidth: 4,
              gapWidth: 4
            },
            upperLabel: { show: false },
            color: [
              '#ef4444', // الطاقة
              '#f97316', // المواد
              '#f59e0b', // الصناعات
              '#eab308', // السلع الكمالية
              '#84cc16', // السلع الأساسية
              '#10b981', // الرعاية الصحية
              '#06b6d4', // المالية
              '#3b82f6', // تكنولوجيا المعلومات
              '#6366f1', // خدمات الاتصالات
              '#8b5cf6', // المرافق
              '#d946ef'  // العقارات
            ]
          },
          {
            itemStyle: {
              borderColor: 'rgba(255,255,255,0.1)',
              borderWidth: 2,
              gapWidth: 2
            },
            colorSaturation: [0.3, 0.5]
          },
          {
            itemStyle: {
              borderColor: 'rgba(255,255,255,0.05)',
              borderWidth: 1,
              gapWidth: 1
            }
          }
        ]
      }
    ]
  };

  return (
    <div className="w-screen h-screen bg-slate-950 overflow-hidden relative" dir="rtl">
      {/* Search and Filters */}
      <SearchAndFilters
        companies={allCompanies}
        onFilterChange={handleFilterChange}
        activeFilter={activeFilter}
      />

      {/* Results Count */}
      {filteredCompanies && activeFilter !== 'all' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-slate-800/90 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700/50 text-sm text-slate-300 font-['IBM_Plex_Sans_Arabic'] z-10"
        >
          عرض {filteredCompanies.length} شركة
        </motion.div>
      )}

      <ReactECharts
        ref={echartsRef}
        option={{
          ...option,
          series: [{
            ...option.series[0],
            data
          }]
        }}
        style={{ height: '100%', width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />

      {/* Minimalist Floating Hint - subtle and non-intrusive */}
      <div className="absolute bottom-6 right-6 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-[10px] text-white/40 uppercase tracking-widest pointer-events-none">
        انقر للتكبير • استخدم شريط المسار للعودة
      </div>
    </div>
  );
}
