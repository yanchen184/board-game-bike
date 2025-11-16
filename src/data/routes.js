import { TERRAIN_TYPES } from '../utils/constants';

// Route segments for Taipei to Kaohsiung (380km total)
export const routeSegments = [
  {
    id: 'seg_1',
    name: '台北市區',
    startKm: 0,
    endKm: 20,
    distance: 20,
    terrain: TERRAIN_TYPES.FLAT,
    elevation: 50,
    difficulty: 1,
    description: '起點台北，市區平坦路段',
    landmark: '台北車站',
  },
  {
    id: 'seg_2',
    name: '新北郊區',
    startKm: 20,
    endKm: 50,
    distance: 30,
    terrain: TERRAIN_TYPES.FLAT,
    elevation: 100,
    difficulty: 2,
    description: '新北郊區，緩坡路段',
    landmark: '板橋',
  },
  {
    id: 'seg_3',
    name: '桃園台地',
    startKm: 50,
    endKm: 90,
    distance: 40,
    terrain: TERRAIN_TYPES.UPHILL,
    elevation: 250,
    difficulty: 4,
    description: '桃園台地，持續爬升',
    landmark: '中壢',
  },
  {
    id: 'seg_4',
    name: '新竹平原',
    startKm: 90,
    endKm: 130,
    distance: 40,
    terrain: TERRAIN_TYPES.FLAT,
    elevation: 100,
    difficulty: 3,
    description: '新竹平原，但風勢較大',
    landmark: '新竹市',
  },
  {
    id: 'seg_5',
    name: '苗栗丘陵',
    startKm: 130,
    endKm: 170,
    distance: 40,
    terrain: TERRAIN_TYPES.UPHILL,
    elevation: 400,
    difficulty: 5,
    description: '苗栗山區，連續爬坡',
    landmark: '苗栗',
  },
  {
    id: 'seg_6',
    name: '台中盆地',
    startKm: 170,
    endKm: 220,
    distance: 50,
    terrain: TERRAIN_TYPES.FLAT,
    elevation: 150,
    difficulty: 2,
    description: '台中盆地，相對平坦',
    landmark: '台中市',
  },
  {
    id: 'seg_7',
    name: '彰化平原',
    startKm: 220,
    endKm: 260,
    distance: 40,
    terrain: TERRAIN_TYPES.FLAT,
    elevation: 50,
    difficulty: 2,
    description: '彰化平原，平坦快速',
    landmark: '彰化',
  },
  {
    id: 'seg_8',
    name: '雲林農村',
    startKm: 260,
    endKm: 300,
    distance: 40,
    terrain: TERRAIN_TYPES.FLAT,
    elevation: 80,
    difficulty: 2,
    description: '雲林農村，平坦路段',
    landmark: '斗六',
  },
  {
    id: 'seg_9',
    name: '嘉義市區',
    startKm: 300,
    endKm: 330,
    distance: 30,
    terrain: TERRAIN_TYPES.FLAT,
    elevation: 100,
    difficulty: 3,
    description: '嘉義市區，接近尾聲',
    landmark: '嘉義市',
  },
  {
    id: 'seg_10',
    name: '台南平原',
    startKm: 330,
    endKm: 360,
    distance: 30,
    terrain: TERRAIN_TYPES.FLAT,
    elevation: 50,
    difficulty: 2,
    description: '台南平原，最後衝刺',
    landmark: '台南市',
  },
  {
    id: 'seg_11',
    name: '高雄市區',
    startKm: 360,
    endKm: 380,
    distance: 20,
    terrain: TERRAIN_TYPES.FLAT,
    elevation: 30,
    difficulty: 1,
    description: '終點高雄，市區平路',
    landmark: '高雄車站',
  },
];

// Supply stations along the route
export const supplyStations = [
  { km: 50, name: '中壢補給站', supplies: ['water', 'food', 'repair'] },
  { km: 130, name: '新竹補給站', supplies: ['water', 'food', 'energy'] },
  { km: 220, name: '台中補給站', supplies: ['water', 'food', 'repair', 'rest'] },
  { km: 300, name: '雲林補給站', supplies: ['water', 'food'] },
  { km: 360, name: '台南補給站', supplies: ['water', 'food', 'energy'] },
];

// Helper functions
export const getSegmentAtDistance = distance => {
  return routeSegments.find(seg => distance >= seg.startKm && distance < seg.endKm);
};

export const getNextSupplyStation = currentDistance => {
  return supplyStations.find(station => station.km > currentDistance);
};

export const getTotalElevation = () => {
  return routeSegments.reduce((sum, seg) => sum + seg.elevation, 0);
};
