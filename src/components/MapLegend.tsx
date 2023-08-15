const MapLegend: React.FC = () => {
  return (
    <div className="absolute p-5 bg-black rounded m-2 bottom-20 left-0 text-sm gap-2 flex flex-col">
      <p className="font-semibold">Territory Legend</p>
      <ul>
        <li className="flex gap-2 items-center justify-start ">
          <div className="w-2 h-2 bg-green-700" /> Yours
        </li>
        <li className="flex gap-2 items-center justify-start">
          <div className="w-2 h-2 bg-red-500" /> Enemy
        </li>
        <li className="flex gap-2 items-center justify-start">
          <div className="w-2 h-2 bg-blue-600" /> Neutral
        </li>
      </ul>
    </div>
  )
}

export default MapLegend
