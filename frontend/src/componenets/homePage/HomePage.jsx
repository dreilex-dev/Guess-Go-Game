import React from "react";

const HomePage = () => {
    return (
        <div className="bg-blue-lighter h-screen w-screen">
            <p>How to play</p>
            <div>
                <h1>LOGO</h1>
                <span className="">
                    Where every guess brings you closer to the truth.
                </span>
            </div>
            <div>
                <button onClick={handleNavigate} className="">
                    Get Started
                </button>
            </div>
        </div>
    )
}

export default HomePage