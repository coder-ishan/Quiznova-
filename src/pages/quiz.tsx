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
    const [showWarning, setShowWarning] = useState(false);
    const [warningTimeout, setWarningTimeout] = useState<NodeJS.Timeout | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [countdown, setCountdown] = useState(10);
    const router = useRouter();
    let calculatedScore = 0;

    useEffect(() => {
        const fetchQuestions = async () => {
            const res = await fetch(`/api/${studentData?.securityCode}`);
            const data: Question[] = await res.json();
            setQuestions(data);
        };

        fetchQuestions();
    }, [studentData]);

    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => e.preventDefault();
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                e.key === "F12" ||
                (e.ctrlKey && e.shiftKey && e.key === "I") ||
                (e.ctrlKey && e.shiftKey && e.key === "J") ||
                (e.ctrlKey && e.key === "U") ||
                e.key === "Escape"
            ) {
                e.preventDefault();
                if (e.key === "Escape") {
                    handleEscKeyPress();
                }
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

    useEffect(() => {
        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                handleEscKeyPress();
            }
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);

        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
        };
    }, []);
    
    const handleEscKeyPress = () => {
        setShowWarning(true);
        const interval = setInterval(() => {
            setCountdown((prevCountdown) => {
                if (prevCountdown > 0) {
                    console.log(prevCountdown); // You can replace this with any UI update logic
                    return prevCountdown - 1;
                } else {
                    clearInterval(interval);
                    handleSubmit();
                    return prevCountdown;
                }
            });
        }, 1000);
        setWarningTimeout(interval);
    };

    const handleReturnToFullScreen = () => {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen()
                .then(() => {
                    setShowWarning(false);
                    if (warningTimeout) {
                        clearTimeout(warningTimeout);
                        setWarningTimeout(null);
                    }
                })
                .catch(err => {
                    console.error('Fullscreen error:', err);
                });
        }
    };

    const startQuiz = () => {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen()
                .then(() => setHasStarted(true))
                .catch(err => {
                    console.error('Fullscreen error:', err);
                    setHasStarted(false);
                });
        } else {
            setHasStarted(true);
        }
    };

    const handleOptionSelect = (questionId: number, optionIndex: number) => {
        setResponses((prev) => {
            const currentResponses = prev[questionId] || [];
            const updatedResponses = currentResponses.includes(optionIndex)
                ? currentResponses.filter(index => index !== optionIndex)
                : [...currentResponses, optionIndex];
            
            return {
                ...prev,
                [questionId]: updatedResponses
            };
        });
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
        if (isSubmitting) return;
        setIsSubmitting(true);

        questions.forEach((question) => {
            const userAnswer = responses[question.id] || [];
            if (question.type !== "numerical"&&question.type !== "numerical-image") {
                if (
                    question.correctAnswers &&
                    JSON.stringify(userAnswer.sort()) ===
                    JSON.stringify(question.correctAnswers.sort())
                ) {
                    calculatedScore += 1;
                }
            } else {
                if (userAnswer[0] === question.correctAnswer) {
                    calculatedScore += 1;
                }
            }
        });

        setScore(calculatedScore);

        try {
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
        } catch (error) {
            console.error('Error submitting quiz:', error);
            setIsSubmitting(false);
        }
    };

    const sendQuizData = async () => {
        const QAndAnswers = questions.map(question => ({
            Question: question.question,
            UserAnswer: responses[question.id] || null,
            CorrectAns: question.type != "numerical"&& question.type!="numerical-image" ? question.correctAnswers?.sort() : question.correctAnswer,
        }));

        const finalData = {
            student: studentData,
            QsnAndAnswers: QAndAnswers,
            FinalScore: calculatedScore,
            SubmissionTime: new Date().toLocaleString(),
        };

        try {
            const response = await fetch(`https://aries-test-f33a3-default-rtdb.firebaseio.com/${studentData?.securityCode}.json`, {
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
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
                <h4 className="text-3xl font-bold mb-6 text-gray-800">Quiz Instructions</h4>
                <ul className="space-y-4 text-gray-700 text-left max-w-lg list-disc list-inside">
                    <li>It is recommended to use Google Chrome for the Test</li>
                    <li>Your Screen is being recorded during the test</li>
                    <li>Do not refresh the page or exit the fullscreen during the test</li>
                    <li>Each Question is of 1 mark, with no negative marking</li>
                    <li>You have 30 minutes to complete the test, it will be auto submitted after that</li>
                    <li>Vertical wise questions may have more than 1 correct answer</li>
                    <li>For numerical questions, only integer values are accepted</li>
                </ul>
                <h1 className="font-semibold mt-4">All the best</h1>
                <button 
                    onClick={startQuiz}
                    className="mt-8 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                    Start Quiz
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 h-screen w-screen flex flex-col items-center justify-center bg-gray-100">
            {showWarning && (
                <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                        <h2 className="text-2xl font-bold mb-4">Warning</h2>
                        <p className="mb-6">Return to full screen within {countdown} seconds or the test will be auto-submitted.</p>
                        <button 
                            onClick={handleReturnToFullScreen}
                            className="py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg"
                        >
                            Return to Full Screen
                        </button>
                    </div>
                </div>
            )}
            <div className="fixed top-4 right-4 bg-white p-4 rounded-lg shadow-lg">
                <h3 className="text-lg font-bold mb-2">Student Info</h3>
                <p><strong>Name:</strong> {studentData?.name}</p>
                <p><strong>Enroll No:</strong> {studentData?.enrollmentId}</p>
                <p><strong>Email:</strong> {studentData?.email}</p>
                <p><strong>Phone:</strong> {studentData?.mobileNumber}</p>
            </div>
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
                                        onCopy={(e) => e.preventDefault()}
                                        onPaste={(e) => e.preventDefault()}
                                        onCut={(e) => e.preventDefault()}
                                        onContextMenu={(e) => e.preventDefault()}
                                    />
                                </div>
                            ) : question.type === "numerical-image" ? (
                                <div>
                                    <h3 className="font-medium mb-2">{question.id}. {question.question}</h3>
                                    <img src={question.questionLink} alt="Question" className="mb-4" />
                                    <input
                                        type="text"
                                        className="w-full p-2 border border-gray-300 rounded"
                                        onChange={(e) => handleInputChange(question.id, e.target.value)}
                                        value={responses[question.id]?.[0] || ""}
                                        onCopy={(e) => e.preventDefault()}
                                        onPaste={(e) => e.preventDefault()}
                                        onCut={(e) => e.preventDefault()}
                                        onContextMenu={(e) => e.preventDefault()}
                                    />
                                </div>
                            ) : (
                                <h3 className="font-medium mb-2" style={{ whiteSpace: 'pre-line' }}>{question.id}. {question.question}</h3>
                            )}
                            
                            {question.options && question.options.map((option, index) => (
                                <label key={index} className="block mb-2 cursor-pointer items-center">
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
                    className={`mt-6 w-full py-3 ${
                        isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                    } text-white font-semibold rounded-lg transition duration-300`}
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
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
