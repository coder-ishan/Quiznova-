import Link from "next/link";
import 'tailwindcss/tailwind.css';


const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold mb-6">Welcome to the Quiz App</h1>
      <Link href="/studentInfo">
        <div className="px-4 py-2 bg-blue-500 text-white rounded">Start Quiz</div>
      </Link>
    </div>
  );
};

export default Home;
