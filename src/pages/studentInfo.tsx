import React, { useState } from 'react';
import Link from "next/link";
import 'tailwindcss/tailwind.css';

const StudentInfo: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [enrollmentId, setEnrollmentId] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [securityCode, setSecurityCode] = useState('');
    const [error, setError] = useState(false);

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-3xl font-bold mb-6">Student Information</h1>
            <form className="w-full max-w-sm">
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Name:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Institute Email ID:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Enrollment ID:</label>
                    <input
                        type="text"
                        value={enrollmentId}
                        onChange={(e) => setEnrollmentId(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Mobile Number:</label>
                    <input
                        type="text"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Security Code:</label>
                    <input
                        type="password"
                        value={securityCode}
                        onChange={(e) => setSecurityCode(e.target.value)}
                        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${error ? 'border-red-500' : ''}`}
                        title={error ? 'Enter the correct security code' : ''}
                    />
                </div>
                <Link href="/quiz">
                    <button className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
                        Start Quiz
                    </button>
                </Link>
            </form>
        </div>
    );
};

export default StudentInfo;