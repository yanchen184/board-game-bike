// Bike parts catalog based on PLANNING.md

export const bikeParts = {
  frames: [
    {
      id: 'frame_carbon_race',
      name: '碳纖維競賽車架',
      weight: 6.8,
      aero: 90,
      durability: 75,
      cost: 3000,
      description: '頂級碳纖維材質，極致輕量化，最佳空氣動力學',
    },
    {
      id: 'frame_carbon_endurance',
      name: '碳纖維耐久車架',
      weight: 7.5,
      aero: 85,
      durability: 90,
      cost: 2500,
      description: '碳纖維打造，兼顧輕量與耐用性',
    },
    {
      id: 'frame_aluminum_sport',
      name: '鋁合金運動車架',
      weight: 8.5,
      aero: 70,
      durability: 85,
      cost: 1500,
      description: '輕量化鋁合金，性價比高',
    },
    {
      id: 'frame_steel_classic',
      name: '鋼管經典車架',
      weight: 10.0,
      aero: 60,
      durability: 95,
      cost: 800,
      description: '傳統鋼管車架，堅固耐用，適合長途',
    },
  ],

  wheels: [
    {
      id: 'wheels_carbon_disc',
      name: '碳纖維板輪組',
      weight: 1.2,
      aero: 95,
      stability: 60,
      cost: 2500,
      description: '碳纖維板輪，空氣動力學最佳，但橫風穩定性較低',
    },
    {
      id: 'wheels_carbon_deep',
      name: '碳纖維深框輪組',
      weight: 1.4,
      aero: 88,
      stability: 70,
      cost: 2000,
      description: '50mm 深框碳輪，速度與穩定性兼顧',
    },
    {
      id: 'wheels_aluminum_climbing',
      name: '鋁合金爬坡輪組',
      weight: 1.5,
      aero: 75,
      stability: 85,
      cost: 1200,
      description: '輕量化設計，適合爬坡路段',
    },
    {
      id: 'wheels_aluminum_training',
      name: '鋁合金訓練輪組',
      weight: 1.8,
      aero: 65,
      stability: 95,
      cost: 600,
      description: '耐用型訓練輪，穩定可靠',
    },
  ],

  gears: [
    {
      id: 'gears_electronic_12speed',
      name: '電子變速系統 (12速)',
      precision: 95,
      weight: 0.25,
      durability: 85,
      cost: 1800,
      description: '最新電子變速，精準快速，換檔順暢',
    },
    {
      id: 'gears_electronic_11speed',
      name: '電子變速系統 (11速)',
      precision: 90,
      weight: 0.28,
      durability: 88,
      cost: 1400,
      description: '電子變速，可靠性高',
    },
    {
      id: 'gears_mechanical_12speed',
      name: '機械變速系統 (12速)',
      precision: 80,
      weight: 0.35,
      durability: 95,
      cost: 900,
      description: '傳統機械變速，耐用可靠，易於維護',
    },
    {
      id: 'gears_mechanical_11speed',
      name: '機械變速系統 (11速)',
      precision: 75,
      weight: 0.38,
      durability: 98,
      cost: 500,
      description: '經典機械變速，簡單耐用',
    },
  ],

  accessories: [
    {
      id: 'acc_power_meter',
      name: '功率計',
      benefit: 'data_tracking',
      effect: '提供即時功率數據，優化騎乘效率',
      cost: 600,
      description: '監測踩踏功率，幫助控制節奏',
    },
    {
      id: 'acc_aero_bars',
      name: '空力把手',
      benefit: 'aerodynamics',
      effect: '減少 5% 風阻',
      cost: 400,
      description: '改善空氣動力學，降低風阻',
    },
    {
      id: 'acc_hydration_system',
      name: '水袋系統',
      benefit: 'hydration',
      effect: '延長補給間隔時間',
      cost: 200,
      description: '方便補水，減少停站次數',
    },
  ],
};

// Helper functions
export const getPartById = (category, id) => {
  return bikeParts[category]?.find(part => part.id === id);
};

export const getPartsInBudget = (category, budget) => {
  return bikeParts[category]?.filter(part => part.cost <= budget) || [];
};

export const calculateTotalCost = parts => {
  return Object.values(parts).reduce((sum, part) => {
    if (Array.isArray(part)) {
      return sum + part.reduce((s, p) => s + (p?.cost || 0), 0);
    }
    return sum + (part?.cost || 0);
  }, 0);
};
