import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Route } from '../../types';
import styles from './RouteMap.module.css';

// Fix default marker icons (webpack/vite issue)
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface Props {
  route: Route;
}

export default function RouteMap({ route }: Props) {
  const origin: [number, number] = route.originCoords;
  const dest: [number, number] = route.destCoords;
  const center: [number, number] = [
    (origin[0] + dest[0]) / 2,
    (origin[1] + dest[1]) / 2,
  ];

  return (
    <div className={styles.wrap}>
      <MapContainer center={center} zoom={12} scrollWheelZoom={false} className={styles.map}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={origin}>
          <Popup>{route.origin}</Popup>
        </Marker>
        <Marker position={dest}>
          <Popup>{route.destination}</Popup>
        </Marker>
        <Polyline
          positions={[origin, dest]}
          pathOptions={{ color: '#6366f1', weight: 4, dashArray: '8 6' }}
        />
      </MapContainer>
    </div>
  );
}
