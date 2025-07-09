export default function Resources() {
  return (
    <div className="min-h-screen bg-[#EDF6F2] p-8">
      <h1 className="text-2xl font-bold mb-4">Resource Library</h1>

      <div className="flex gap-4 items-center mb-6">
        <button className="w-16 h-16 bg-[#C7E1D3] rounded-full flex items-center justify-center text-2xl">
          🎤
        </button>
        <input
          type="text"
          placeholder="What subsidies does the government give?"
          className="flex-1 p-4 rounded-xl border border-gray-300 bg-white"
        />
        <button className="text-xl">🔍</button>
      </div>

      {/* Result Cards */}
      <div className="bg-white rounded-xl shadow-md p-6 space-y-2">
        <p className="text-sm text-gray-500">Last updated: 1:48PM, 10/06/25</p>
        <h2 className="text-lg font-semibold">Seniors' Mobility and Enabling Fund</h2>
        <ul className="list-disc ml-5 text-gray-700">
          <li>Up to 90% subsidy for mobility aid (wheelchair, hearing aids)</li>
          <li>Up to 80% subsidy for home healthcare items (milk feeds, diapers)</li>
        </ul>
        <div className="flex justify-between items-center pt-2">
          <span className="text-gray-600 text-sm">👍 10</span>
          <button className="bg-[#C7E1D3] p-2 rounded-full text-lg">🔊</button>
        </div>
      </div>
    </div>
  )
}
