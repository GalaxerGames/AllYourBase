'use client'

import 'mapbox-gl/dist/mapbox-gl.css'

import features from '@/data/features.json'
import throwIfUndefined from '@/utils/throwIfUndefined'
import booleanPointInPolygon from '@turf/boolean-point-in-polygon'
import { Coord } from '@turf/helpers'
import { FeatureCollection } from 'geojson'
import mapboxgl, { GeoJSONSource, Map as MapboxMap } from 'mapbox-gl'
import { useEffect, useRef, useState } from 'react'
import { useAccount } from 'wagmi'

import ActionButton from './ActionsButton'
import { EAS_SCHEMA_UIDs } from '@/consts'
import { zeroAddress } from 'viem'
import usePolygonsData from '@/hooks/usePolygonsData'
import MapLegend from './MapLegend'
import { Toaster } from 'sonner'
import useIsMounted from '@/hooks/useIsMounted'

mapboxgl.accessToken = throwIfUndefined(
  process.env.NEXT_PUBLIC_MAP_API_KEY,
  'Missing env MAP_API_KEY'
)

const MapComponent: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<MapboxMap | null>(null)
  const [lat, setLat] = useState(43.64)
  const [lng, setLng] = useState(-79.35)
  const [zoom, setZoom] = useState(15)
  const [userLatitute, setUserLatitude] = useState<number>(0)
  const [userLongitude, setUserLongitude] = useState<number>(0)
  const [currentFeature, setCurrentFeature] = useState<
    GeoJSON.Feature<GeoJSON.Geometry> | undefined
  >()
  const { address } = useAccount()
  const isMounted = useIsMounted()

  const { owned, rest, refetch } = usePolygonsData(
    EAS_SCHEMA_UIDs.end,
    address ?? zeroAddress
  )
  const ownedPolygonIDs = owned.map((x) => x.polygonID)
  const enemiesPolygonIDs = rest.map((x) => x.polygonID)

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
        id: 'neutral',
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

      mapRef.current?.addSource('owned', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      })
      mapRef.current?.addSource('enemy', {
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

  useEffect(() => {
    if (!mapRef.current?.isStyleLoaded()) return

    setCurrentFeature(undefined)
    checkIfInsidePolygon([userLongitude, userLatitute])

    const ownedFeatures: FeatureCollection = {
      type: 'FeatureCollection',
      features: (features as FeatureCollection).features.filter((x) =>
        ownedPolygonIDs.includes(x.id?.toString() ?? '')
      ),
    }
    const ownedSource = mapRef.current?.getSource('owned') as GeoJSONSource

    ownedSource?.setData(ownedFeatures)

    if (mapRef.current?.getLayer('owned')) {
      mapRef.current?.removeLayer('owned')
    }
    mapRef.current?.addLayer({
      id: 'owned',
      type: 'fill',
      source: 'owned',
      layout: {},
      paint: { 'fill-color': '#008000', 'fill-opacity': 0.5 },
    })

    const enemyFeatures: FeatureCollection = {
      type: 'FeatureCollection',
      features: (features as FeatureCollection).features.filter((x) =>
        enemiesPolygonIDs.includes(x.id?.toString() ?? '')
      ),
    }

    const enemySource = mapRef.current?.getSource('enemy') as GeoJSONSource

    enemySource?.setData(enemyFeatures)

    if (mapRef.current?.getLayer('enemy')) {
      mapRef.current?.removeLayer('enemy')
    }

    mapRef.current?.addLayer({
      id: 'enemy',
      type: 'fill',
      source: 'enemy',
      layout: {},
      paint: { 'fill-color': '#FF0000', 'fill-opacity': 0.5 },
    })
  }, [enemiesPolygonIDs, ownedPolygonIDs])

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
      if (
        isPointInPolygon &&
        mapRef.current?.isStyleLoaded() &&
        !ownedPolygonIDs.includes(feature.id)
      ) {
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

        // mapRef.current?.addLayer({
        //   id: 'current-polygon',
        //   type: 'fill',
        //   source: 'current-polygon',
        //   layout: {},
        //   paint: { 'fill-color': '#FFFF00', 'fill-opacity': 0.5 },
        // })
      }
    })
  }

  return (
    <>
      <section className="flex flex-col justify-center items-center w-full h-3/4 relative gap-5">
        <div className="absolute top-0 left-0 rounded py-1 px-2 z-10 m-3">
          <span>
            Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
          </span>
        </div>
        <div ref={mapContainerRef} style={{ width: '100%', height: '80dvh' }} />
        <MapLegend />
        {isMounted && address && currentFeature && (
          <ActionButton
            currentFeature={currentFeature}
            userLatitute={userLatitute}
            userLongitude={userLongitude}
            refetch={refetch}
          />
        )}
      </section>
      <Toaster />
    </>
  )
}
export default MapComponent
