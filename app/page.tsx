export default function Home() {
    return (
        <main className="bg-gray-100 h-screen flex items-center justify-center p-5">
            <div className="bg-white shadow-lg p-5 w-full rounded-3xl max-w-screen-sm flex flex-col  md:flex-row gap-3 *:outline-none ring ring-transparent transition-shadow has-[:invalid]:bg-green-100">
                <input
                    className="w-full rounded-full h-12 bg-gray-200 pl-5 ring ring-transparent focus:ring-green-500 focus:ring-offset-2 transition-shadow invalid:focus:ring-red-500 peer"
                    type="text"
                    required
                    placeholder="Email address"
                />
                <span className='text-red-500 font-medium hidden peer-invalid:block'>Email is required</span>
                <button className="bg-blue-500 text-white py-2 rounded-full active:scale-90 transition-transform font-medium md:px-10 peer-invalid:bg-black">
                    Login
                </button>
            </div>
        </main>
    );
}
