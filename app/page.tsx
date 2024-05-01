export default function Home() {
    return (
        <main className="bg-gray-100 h-screen flex items-center justify-center p-5">
            <div className="bg-white shadow-lg p-5 w-full rounded-3xl max-w-screen-sm flex flex-col gap-4">
                {['Nico', 'Me', 'You', 'Yourself'].map((person, index) => (
                    <div key={index} className="flex items-center gap-3 group">
                        <div className="size-10 bg-blue-400 rounded-full"/>
                        <span className="text-lg font-medium empty:w-24 empty:h-4 empty:rounded-full empty:animate-pulse empty:bg-gray-300 group-hover:text-red-500">{person}</span>
                        <div className="size-6 bg-red-500 text-white flex justify-center items-center rounded-full relative">
                            <span className="z-10">{index}</span>
                            <div className="size-6 bg-red-500 rounded-full absolute animate-ping"/>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}
