import { useState, useEffect } from "react";
import { Question, Response } from "../types";
import 'tailwindcss/tailwind.css';
import { useStudent } from './StudentContext';
import { useRouter } from 'next/router';

const Quiz = () => {
    const { studentData } = useStudent();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [responses, setResponses] = useState<Response>({});
    const [reviews, setReviews] = useState<Response>({});
    const [score, setScore] = useState<number | null>(null);
    const [timeLeft, setTimeLeft] = useState<number>(1800);
    const [hasStarted, setHasStarted] = useState(false);
    const router = useRouter();
    let calculatedScore = 0;

    useEffect(() => {
        const fetchQuestions = async () => {
            const res = await fetch("/api/questions");
            const data: Question[] = await res.json();
            setQuestions(data);
        };

        fetchQuestions();
    }, []);

    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => e.preventDefault();
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                e.key === "F12" ||
                (e.ctrlKey && e.shiftKey && e.key === "I") ||
                (e.ctrlKey && e.shiftKey && e.key === "J") ||
                (e.ctrlKey && e.key === "U")
            ) {
                e.preventDefault();
            }
        };

        const handleTouchMove = (e: TouchEvent) => e.preventDefault();

        document.addEventListener("contextmenu", handleContextMenu);
        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("touchmove", handleTouchMove, { passive: false });

        return () => {
            document.removeEventListener("contextmenu", handleContextMenu);
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("touchmove", handleTouchMove);
        };
    }, []);

    const startQuiz = () => {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen()
                .then(() => setHasStarted(true))
                .catch(err => {
                    console.error('Fullscreen error:', err);
                    setHasStarted(false); // Continue anyway
                });
        } else {
            setHasStarted(true);
        }
    };

    const handleOptionSelect = (questionId: number, optionIndex: number) => {
        setResponses((prev) => ({
            ...prev,
            [questionId]: prev[questionId]
                ? Array.from(new Set([...prev[questionId], optionIndex]))
                : [optionIndex],
        }));
    };

    const handleInputChange = (questionId: number, value: string) => {
        const numericalValue = parseInt(value, 10);
        if (!isNaN(numericalValue)) {
            setResponses((prev) => ({
                ...prev,
                [questionId]: [numericalValue],
            }));
        }
    };

    const handleSubmit = async () => {
        questions.forEach((question) => {
            const userAnswer = responses[question.id] || [];
            if(question.type != "numerical"){
             
                if (
                    JSON.stringify(userAnswer.sort()) ===
                    JSON.stringify(question.correctAnswers.sort())
                ) {
                    calculatedScore += 1;
                }
            }else{
                if (userAnswer[0] === question.correctAnswer) {
                    calculatedScore += 1;
                }
            }

        });

        setScore(calculatedScore);

        await sendQuizData();
        router.push("/thankyou");
        setTimeout(() => {
            if (document.fullscreenElement) {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else {
                    console.error('Fullscreen exit not supported');
                }
            }
        }, 2000);
    };

    const sendQuizData = async () => {
        const QAndAnswers = questions.map(question => ({
          
            Question: question.question,
            UserAnswer: responses[question.id] || null,
            CorrectAns: question.type != "numerical" ? question.correctAnswers.sort() : question.correctAnswer,
        }));

        const finalData = {
            student: studentData,
            QsnAndAnswers: QAndAnswers,
            FinalScore: calculatedScore,
        };

        try {
            const response = await fetch('https://aries-test-f33a3-default-rtdb.firebaseio.com/userdataAndResponses.json', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(finalData)
            });

            if (!response.ok) throw new Error('Failed to save');
            console.log('Data saved successfully');
        } catch (error) {
            console.error('Error:', error);
        }
    };

    useEffect(() => {
        if (timeLeft > 0 && hasStarted) {
            const timerId = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(timerId);
        } else if (timeLeft <= 0) {
            handleSubmit();
        }
    }, [timeLeft, hasStarted]);

    if (!hasStarted) {
        return (
            <div className="flex flex-col items-center justify-center h-screen p-6">
                <h2 className="text-2xl mb-4">Quiz Instructions</h2>
                <p className="mb-6">Please read the instructions before starting the quiz.</p>
                <button 
                    onClick={startQuiz}
                    className="py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg"
                >
                    Start Quiz
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 h-screen w-screen flex flex-col items-center justify-center bg-gray-100">
            <div className="flex flex-row items-center justify-center">
                <h1 className="text-3xl font-bold text-center mb-6 mt-10">ArIES Recruitment Test</h1>
            </div>

            <div className="text-lg font-medium mb-6 text-center">
                Time Left: {Math.floor(timeLeft / 60)}:{timeLeft % 60 < 10 ? `0${timeLeft % 60}` : timeLeft % 60}
            </div>

            <div className="w-full max-w-3xl bg-white shadow-md rounded-lg p-8 overflow-y-auto" style={{ maxHeight: '90vh' }}>
                {questions.length === 0 ? (
                    <p className="text-center">Loading questions...</p>
                ) : (
                    questions.map((question) => (
                        <div key={question.id} id={`question-${question.id}`} className="my-4 box-content">
                            {question.type === "image" ? (
                                <div>
                                    <h3 className="font-medium mb-2">{question.id}. {question.question}</h3>
                                    <img src={question.questionLink} alt="Question" className="mb-4" />
                                </div>
                            ) : question.type === "numerical" ? (
                                <div>
                                    <h3 className="font-medium mb-2">{question.id}. {question.question}</h3>
                                    <input
                                        type="text"
                                        className="w-full p-2 border border-gray-300 rounded"
                                        onChange={(e) => handleInputChange(question.id, e.target.value)}
                                        value={responses[question.id]?.[0] || ""}
                                    />
                                </div>
                            ) : (
                                <h3 className="font-medium mb-2" style={{ whiteSpace: 'pre-line' }}>{question.id}. {question.question}</h3>
                            )}
                            
                            {question.options && question.options.map((option, index) => (
                                <label key={index} className="block mb-2 cursor-pointer items-center" onClick={() => handleOptionSelect(question.id, index)}>
                                    <input
                                        type="checkbox"
                                        className="mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        onChange={() => handleOptionSelect(question.id, index)}
                                        checked={responses[question.id]?.includes(index) || false}
                                    />
                                    <span className="text-gray-700">{option}</span>
                                </label>
                            ))}
                            <button
                                className="mt-2 mb-10 py-1 px-2 bg-red-500 text-white font-medium rounded hover:bg-red-600 transition duration-300 text-sm"
                                onClick={() => setResponses((prev) => {
                                    const newResponses = { ...prev };
                                    delete newResponses[question.id];
                                    delete reviews[question.id];
                                    return newResponses;
                                })}
                            >
                                Clear
                            </button>
                            <button
                                className="mt-2 mb-10 ml-4 py-1 px-2 bg-purple-500 text-white font-medium rounded hover:bg-yellow-600 transition duration-300 text-sm"
                                onClick={() => setReviews((prev) => {
                                    const newReviews = { ...prev };
                                    if (newReviews[question.id]) {
                                        delete newReviews[question.id];
                                    } else {
                                        newReviews[question.id] = [1];
                                    }
                                    return newReviews;
                                })}
                            >
                                {reviews[question.id] ? "Unmark Review" : "Mark for Review"}
                            </button>
                        </div>
                    ))
                )}

                <button
                    className="mt-6 w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300"
                    onClick={() => {
                        handleSubmit();
                       
                    }}
                >
                    Submit
                </button>
            </div>
            <div className="w-full mt-3" style={{ position: 'relative', maxHeight: '90vh' }}>
                <div className="flex overflow-x-auto space-x-4 scrollbar-hide">
                    {questions.map((question) => (
                        <div
                            key={question.id}
                            className={`flex items-center justify-center min-w-[40px] min-h-[40px] rounded-lg border-2 text-cyan-50 ${
                                  responses[question.id] ? ( reviews[question.id] ?'bg-yellow-300':'bg-green-600')
                                   : (reviews[question.id] ?'bg-purple-600':'bg-gray-600')
                            } cursor-pointer`}
                            onClick={() => {
                                const questionElement = document.getElementById(`question-${question.id}`);
                                if (questionElement) {
                                    questionElement.scrollIntoView({ behavior: 'smooth' });
                                }
                            }}
                        >
                            {question.id}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Quiz;
