'use client'

import { useEffect, useRef, useState } from 'react'
import { useAccount } from 'wagmi'
import 'mapbox-gl/dist/mapbox-gl.css'
import mapboxgl, { Map as MapboxMap } from 'mapbox-gl'
import polygons from '@/data/polygons.json'
import type { Position } from 'geojson'
import throwIfUndefined from '@/utils/throwIfUndefined'

mapboxgl.accessToken = throwIfUndefined(
  process.env.NEXT_PUBLIC_MAP_API_KEY,
  'Missing env MAP_API_KEY'
)

const Map: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<MapboxMap | null>(null)
  const account = useAccount()
  const [lat, setLat] = useState(43.640879813830125)
  const [lng, setLng] = useState(-79.35509656466336)
  const [zoom, setZoom] = useState(15)
  const [timeSpent, setTimeSpent] = useState(0) //in seconds
  const timeRef = useRef<any | null>(null)
  const [userLatitute, setUserLatitude] = useState<number>(0)
  const [userLongitude, setUserLongitude] = useState<number>(0)

  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return // initialize map only once
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: process.env.NEXT_PUBLIC_MAP_STYLE,
      center: [lng, lat],
      zoom: zoom,
    })
    mapRef.current.on('move', () => {
      setLng(+mapRef.current!.getCenter().lng.toFixed(4))
      setLat(+mapRef.current!.getCenter().lat.toFixed(4))
      setZoom(+mapRef.current!.getZoom().toFixed(2))
    })

    mapRef.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        // When active the map will receive updates to the device's location as it changes.
        trackUserLocation: true,
        // Draw an arrow next to the location dot to indicate which direction the device is heading.
        showUserHeading: true,
      })
    )
    mapRef.current?.on('load', () => {
      polygons.forEach((pol) => {
        mapRef.current?.addSource(pol.id, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Polygon',
              coordinates: pol.coords as Position[][],
            },
          },
        })
        mapRef.current?.addLayer({
          id: pol.id,
          type: 'fill',
          source: pol.id, // reference the data source
          layout: {},
          paint: {
            'fill-color': '#0080ff',
            'fill-opacity': 0.5,
          },
        })
      })
    })
    if (navigator) navigator?.geolocation?.watchPosition(checkUserPostion)
  }, [])

  // called every time a new user position is determined
  function checkUserPostion(position: GeolocationPosition) {
    const { latitude, longitude } = position.coords
    setUserLatitude(latitude)
    setUserLongitude(longitude)
  }

  return (
    <div className="flex justify-center items-start w-full h-3/4 relative">
      <div className="absolute top-0 left-0 rounded py-1 px-2 z-10 m-3">
        <span>
          Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
        </span>
      </div>
      <div ref={mapContainerRef} style={{ width: '100%', height: '80dvh' }} />
    </div>
  )
}
export default Map
