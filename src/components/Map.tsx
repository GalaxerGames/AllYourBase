'use client'
import 'mapbox-gl/dist/mapbox-gl.css'

import { useEffect, useRef, useState } from 'react'
import { useAccount } from 'wagmi'
import mapboxgl, { GeoJSONSource, Map as MapboxMap } from 'mapbox-gl'
import throwIfUndefined from '@/utils/throwIfUndefined'
import features from '@/data/features.json'
import { FeatureCollection } from 'geojson'
import booleanPointInPolygon from '@turf/boolean-point-in-polygon'

import createStartAttestation from '@/lib/createStartAttestation'
import { useEthersSigner } from '@/hooks/useEthersSigner'
import createEndAttestation from '@/lib/createEndAttestation'
import { Coord } from '@turf/helpers'
import Timer from './Timer'
mapboxgl.accessToken = throwIfUndefined(
  process.env.NEXT_PUBLIC_MAP_API_KEY,
  'Missing env MAP_API_KEY'
)

const MapComponent: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<MapboxMap | null>(null)
  const { address } = useAccount()
  const [lat, setLat] = useState(38.7629)
  const [lng, setLng] = useState(-9.18)
  const [zoom, setZoom] = useState(15)
  const [userLatitute, setUserLatitude] = useState<number>(0)
  const [userLongitude, setUserLongitude] = useState<number>(0)
  const [currentAttestation, setCurrentAttestation] = useState<
    string | undefined
  >()
  const [time, setTime] = useState<number>(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const [currentFeature, setCurrentFeature] = useState<
    GeoJSON.Feature<GeoJSON.Geometry> | undefined
  >()

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

    mapRef.current.on('load', () => {
      mapRef.current?.addLayer({
        id: 'polygons',
        type: 'fill',
        source: {
          type: 'geojson',
          data: features as FeatureCollection,
        },
        layout: {},
        paint: { 'fill-color': '#0080ff', 'fill-opacity': 0.5 },
      })

      mapRef.current?.addSource('current-polygon', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      })
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

    if (navigator) navigator?.geolocation?.watchPosition(checkUserPostion)
  }, [])

  // called every time a new user position is determined
  const checkUserPostion = (position: GeolocationPosition) => {
    const { latitude, longitude } = position.coords
    setUserLatitude(latitude)
    setUserLongitude(longitude)
    checkIfInsidePolygon([longitude, latitude])
  }

  const checkIfInsidePolygon = (point: Coord) => {
    features.features.forEach((feature) => {
      const isPointInPolygon = booleanPointInPolygon(point, feature.geometry)

      if (isPointInPolygon && mapRef.current?.isStyleLoaded()) {
        // Handle your logic here when the point is within a polygon
        console.log('User point is within polygon:', feature.properties.name)
        setCurrentFeature(feature as GeoJSON.Feature<GeoJSON.Geometry>)

        const source = mapRef.current?.getSource(
          'current-polygon'
        ) as GeoJSONSource

        source?.setData({
          type: 'FeatureCollection',
          features: [feature as GeoJSON.Feature<GeoJSON.Geometry>],
        })

        if (mapRef.current?.getLayer('current-polygon')) {
          mapRef.current?.removeLayer('current-polygon')
        }

        mapRef.current?.addLayer({
          id: 'current-polygon',
          type: 'fill',
          source: 'current-polygon',
          layout: {},
          paint: { 'fill-color': '#FFFF00', 'fill-opacity': 0.5 },
        })
      }
    })
  }
  const signer = useEthersSigner()

  const start = async () => {
    if (!address || !signer || !currentFeature?.id) return //TODO: error toast

    const startAttestationID = await createStartAttestation(
      address,
      userLatitute.toString(),
      userLongitude.toString(),
      signer,
      currentFeature.id.toString()
    )

    setCurrentAttestation(startAttestationID)
  }

  const end = async () => {
    if (!address || !signer || !currentAttestation || !currentFeature?.id)
      return //TODO: error toast

    await createEndAttestation(
      address,
      userLatitute.toString(),
      userLongitude.toString(),
      time,
      signer,
      currentAttestation,
      currentFeature.id.toString()
    )

    setCurrentAttestation(undefined)
    clearInterval(intervalRef.current as NodeJS.Timeout)
  }

  return (
    <div className="flex flex-col justify-center items-center w-full h-3/4 relative gap-5">
      <div className="absolute top-0 left-0 rounded py-1 px-2 z-10 m-3">
        <span>
          Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
        </span>
      </div>
      <div ref={mapContainerRef} style={{ width: '100%', height: '80dvh' }} />
      {currentFeature && (
        <div className="flex gap-10 items-center justify-center">
          {currentAttestation && (
            <Timer intervalRef={intervalRef} time={time} setTime={setTime} />
          )}
          <button
            className="px-3 py-1 rounded text-white bg-yellow-600"
            onClick={currentAttestation ? end : start}
          >
            {currentAttestation ? 'END' : 'START'}
          </button>
        </div>
      )}
    </div>
  )
}
export default MapComponent
