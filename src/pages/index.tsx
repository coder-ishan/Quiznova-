import Link from "next/link";
import { useRouter } from 'next/router';
import 'tailwindcss/tailwind.css';

const Home = () => {
  const router = useRouter();

  const startQuiz = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      if (stream) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        } else if ((document.documentElement as any).webkitRequestFullscreen) { /* Safari */
          await (document.documentElement as any).webkitRequestFullscreen();
        }
        router.push('/studentInfo');

        // Periodically check the stream to keep it active
        setInterval(() => {
          if (stream.getVideoTracks().length === 0) {
            alert("Screen sharing has been stopped. Please restart the quiz.");
            router.push('/');
          }
        }, 5000);
      }
    } catch (err) {
      console.error("Error: " + err);
      alert("Screen recording permission is required to start the quiz.");
    }
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
