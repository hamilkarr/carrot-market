export default function Home() {
    return (
        <main className="bg-gray-100 h-screen flex items-center justify-center p-5">
            <div className="bg-white shadow-lg p-5 w-full rounded-3xl max-w-screen-sm flex flex-col gap-4">
                <div className="group">
                    <input className="bg-gray-100 w-full" placeholder="Write your email" type="text" />
                    <span className="group-focus-within:block hidden">Make sure it is a valid email...</span>
                    <button>submit</button>
                </div>
            </div>
        </main>
    );
}
