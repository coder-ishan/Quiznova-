import Link from "next/link";
import { useRouter } from 'next/router';
import 'tailwindcss/tailwind.css';

const Home = () => {
  const router = useRouter();

  const startQuiz = () => {
    router.push('/studentInfo');
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold mb-6">Welcome to the Quiz App</h1>
      <button onClick={startQuiz} className="px-4 py-2 bg-blue-500 text-white rounded">
        Start Quiz
      </button>
    </div>
  );
};

export default Home;
