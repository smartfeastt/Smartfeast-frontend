import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'react-feather';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyBf52RdrtPkb4hT_OYEU52q7eOMns4eHtg';

export default function GoogleMap({ outlets, onOutletClick, userLocation }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load Google Maps script
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setIsLoaded(true);
      document.head.appendChild(script);
    } else {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded || !window.google || !mapRef.current) return;

    // Initialize map
    const map = new window.google.maps.Map(mapRef.current, {
      center: userLocation || { lat: 28.6139, lng: 77.2090 }, // Default to Delhi
      zoom: userLocation ? 12 : 10,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
      ],
    });

    mapInstanceRef.current = map;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add markers for each outlet
    outlets.forEach((outlet) => {
      if (outlet.coordinates?.latitude && outlet.coordinates?.longitude) {
        const marker = new window.google.maps.Marker({
          position: {
            lat: outlet.coordinates.latitude,
            lng: outlet.coordinates.longitude,
          },
          map: map,
          title: outlet.name,
          icon: {
            url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
            scaledSize: new window.google.maps.Size(40, 40),
          },
        });

        // Info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; min-width: 200px;">
              <h3 style="margin: 0 0 8px 0; font-weight: 600; font-size: 16px;">${outlet.name}</h3>
              <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">${outlet.location || outlet.address?.fullAddress || ''}</p>
              <button 
                id="view-menu-${outlet._id}"
                style="margin-top: 8px; padding: 6px 12px; background: #000; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; width: 100%;"
              >
                View Menu
              </button>
            </div>
          `,
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
          
          // Add click listener to button after info window opens
          setTimeout(() => {
            const button = document.getElementById(`view-menu-${outlet._id}`);
            if (button) {
              button.addEventListener('click', () => {
                if (onOutletClick) {
                  onOutletClick(outlet);
                }
              });
            }
          }, 100);
        });

        markersRef.current.push(marker);
      }
    });

    // Fit bounds to show all markers
    if (markersRef.current.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      markersRef.current.forEach(marker => {
        bounds.extend(marker.getPosition());
      });
      if (userLocation) {
        bounds.extend(new window.google.maps.LatLng(userLocation.lat, userLocation.lng));
      }
      map.fitBounds(bounds);
    }

    // Add user location marker if available
    if (userLocation) {
      const userMarker = new window.google.maps.Marker({
        position: userLocation,
        map: map,
        title: 'Your Location',
        icon: {
          url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          scaledSize: new window.google.maps.Size(40, 40),
        },
      });
      markersRef.current.push(userMarker);
    }
  }, [isLoaded, outlets, userLocation, onOutletClick]);

  return (
    <div className="w-full h-full rounded-lg overflow-hidden shadow-lg">
      <div ref={mapRef} className="w-full h-full" style={{ minHeight: '500px' }} />
    </div>
  );
}

