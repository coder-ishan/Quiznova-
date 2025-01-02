import React from 'react';
import 'tailwindcss/tailwind.css';

const ThankYouPage: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-gray-300 p-8 rounded-lg shadow-lg text-center">
            <h1 className="text-6xl font-bold text-blue-600 mb-4">Your Test has been submitted !!</h1>
            <p className="text-2xl text-gray">You can now close the window</p>
            </div>
        </div>
    );
};

export default ThankYouPage;