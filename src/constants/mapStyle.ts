import { MapStyleElement } from 'react-native-maps';

export const DARK_MAP_STYLE: MapStyleElement[] = [
  { elementType: 'geometry', stylers: [{ color: '#0A0A0A' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#7A7870' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0A0A0A' }] },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#202020' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#7A7870' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#2a2a2a' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#111111' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#7A7870' }],
  },
  {
    featureType: 'poi',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'transit',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'administrative',
    elementType: 'geometry',
    stylers: [{ color: '#202020' }],
  },
  {
    featureType: 'administrative.country',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#7A7870' }],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#7A7870' }],
  },
];
