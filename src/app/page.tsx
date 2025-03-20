import Link from 'next/link'; 

export default function Home() {
  return (
    <div className="bg-[#0E0F1C] text-white min-h-screen">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-6">
      <h1 className="text-2xl sm:text-4xl font-semibold">
            Journal me <span className="text-green-500">●</span>
          </h1>
        <div className="space-x-4">
         <Link href="/login">
          <button className="px-4 py-2 bg-gray-800 rounded-lg">Log in</button>
          </Link>
          <Link href="/register">
          <button className="px-4 py-2 bg-blue-600 rounded-lg">Create account</button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="text-center mt-12 px-6">
        <h2 className="text-4xl sm:text-6xl font-bold">
          A thousand little <span className="text-blue-400">daily moments</span> that make <br/>you... well you.
        </h2>
        <p className="text-white-1000 mt-6">
          Capture the ups and downs, the laughs and tears, the moments of hope and sorrow and <br/> everything in between in a way only you can.
        </p>
        <button className="mt-10 px-6 py-3 bg-blue-800 rounded-lg">
          Start writing today
        </button>
      </section>

      {/* Journal Entries */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 px-6">
        {/* Journal Card 1 */}
        <div className="bg-blue-700 p-6 rounded-br-[150px] w-full sm w-[750px] h-[450px]">
          <p className="text-sm text-white-800">March 10th 2025</p>
          <h3 className="text-4xl font-semibold mt-2">Manifesting a new high paying job 💰</h3>
          <p className="text-white-700 mt-2 text-sm">
            I need a new joooooob. I’m putting this out there to the universe...
          </p>
        </div>

        {/* Journal Card 2 */}
        <div className="bg-green-700 p-6 rounded-bl-[150px] w-full sm w-[750px] h-[450px]">
          <p className="text-sm text-white-800">March 11th 2025</p>
          <h3 className="text-4xl font-semibold mt-2">The girls and I slaaaaaayed today. 🔥💃🏽🎉</h3>
          <p className="text-white-700 mt-2 text-sm">
            NEW BAR, NEW DRESS, NEW MEEEEEEEE...
          </p>
        </div>

        {/* Journal Card 3 */}
        <div className="bg-gray-700 p-6 rounded-tr-[150px] w-full sm w-[750px] h-[450px]">
          <p className="text-sm text-white-800">March 12th 2025</p>
          <h3 className="text-4xl font-semibold mt-2">Cry session complete... back to the grind 💪💪💪</h3>
          <p className="text-white-1000 mt-2 text-sm">
            Today has been such a frustrating day...
          </p>
        </div>
      </section>
    </div>
  );
}
