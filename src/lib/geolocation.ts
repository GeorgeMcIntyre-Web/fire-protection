/**
 * Geolocation Utilities
 * Provides location tracking for mobile devices
 */

import { useState, useEffect } from 'react';

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
  timestamp: number;
}

export interface GeoError {
  code: number;
  message: string;
}

/**
 * Check if geolocation is available
 */
export function isGeolocationAvailable(): boolean {
  return 'geolocation' in navigator;
}

/**
 * Get current position
 */
export function getCurrentPosition(): Promise<GeoLocation> {
  return new Promise((resolve, reject) => {
    if (!isGeolocationAvailable()) {
      reject({
        code: 0,
        message: 'Geolocation is not supported by this browser',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp,
        });
      },
      (error) => {
        reject({
          code: error.code,
          message: error.message,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

/**
 * Watch position changes
 */
export function watchPosition(
  callback: (location: GeoLocation) => void,
  errorCallback?: (error: GeoError) => void
): number {
  if (!isGeolocationAvailable()) {
    if (errorCallback) {
      errorCallback({
        code: 0,
        message: 'Geolocation is not supported',
      });
    }
    return -1;
  }

  return navigator.geolocation.watchPosition(
    (position) => {
      callback({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        altitudeAccuracy: position.coords.altitudeAccuracy,
        heading: position.coords.heading,
        speed: position.coords.speed,
        timestamp: position.timestamp,
      });
    },
    (error) => {
      if (errorCallback) {
        errorCallback({
          code: error.code,
          message: error.message,
        });
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
  );
}

/**
 * Clear position watch
 */
export function clearWatch(watchId: number): void {
  if (isGeolocationAvailable() && watchId !== -1) {
    navigator.geolocation.clearWatch(watchId);
  }
}

/**
 * Calculate distance between two coordinates (in meters)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Format location for display
 */
export function formatLocation(location: GeoLocation): string {
  return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
}

/**
 * Get Google Maps URL for location
 */
export function getGoogleMapsUrl(location: GeoLocation): string {
  return `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
}

/**
 * React hook for geolocation
 */
export function useGeolocation() {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [error, setError] = useState<GeoError | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const getCurrentLocation = async () => {
    setLoading(true);
    setError(null);

    try {
      const position = await getCurrentPosition();
      setLocation(position);
    } catch (err) {
      setError(err as GeoError);
    } finally {
      setLoading(false);
    }
  };

  return {
    location,
    error,
    loading,
    isAvailable: isGeolocationAvailable(),
    getCurrentLocation,
  };
}

/**
 * React hook for continuous location tracking
 */
export function useGeolocationWatch() {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [error, setError] = useState<GeoError | null>(null);
  const [watching, setWatching] = useState<boolean>(false);

  useEffect(() => {
    let watchId: number = -1;

    if (watching) {
      watchId = watchPosition(
        (newLocation) => {
          setLocation(newLocation);
          setError(null);
        },
        (err) => {
          setError(err);
        }
      );
    }

    return () => {
      if (watchId !== -1) {
        clearWatch(watchId);
      }
    };
  }, [watching]);

  const startWatching = () => setWatching(true);
  const stopWatching = () => setWatching(false);

  return {
    location,
    error,
    watching,
    isAvailable: isGeolocationAvailable(),
    startWatching,
    stopWatching,
  };
}
