import type { NextApiRequest, NextApiResponse } from "next";
import { Question } from "../../types";
import questions from "../../data/Dev-XR-Questions.json" assert { type: "json" };


export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Question[]>
) {
  res.status(200).json(questions as Question[]);
}
