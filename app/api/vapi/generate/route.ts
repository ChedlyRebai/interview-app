import {generateText} from 'ai'
import {google} from "@ai-sdk/google"
import { getRandomInterviewCover } from '@/lib/utils';
import { db } from '@/firebasee/admin';
import { success } from 'zod/v4';

export async function GET(){
    return Response.json({success:true,data:'hello'},{status:200});
}

export async function POST(request:Request){
    const {type,role,level,techstack,amount,userid,} = await request.json();
    try {
        const {text} = await generateText({
            model:google('gemini-2.0-flash-001'),
            prompt:`
            Prepare questions for a ${role} interview at ${level} level focusing on ${techstack}.
            Generate ${amount} questions.
            Provide the output as a JSON array of questions only, without any additional text.
            Please return only the questions, without any numbering or bullet points.
            these questions should be open-ended and designed to assess both technical skills and problem-solving abilities.
            these questions are going to be read by an AI interviewer during a simulated interview session do not use '/' or any special characters.    
            Example:
            [
                "Question 1",
                "Question 2",
            `

        });

        const interview ={
            role,type,level
            ,techstack:techstack.split(','),
            questions:JSON.parse(text),
            userId:userid,
            finalized:true,
            coverImage:getRandomInterviewCover(),
            createdAt:new Date().toISOString()
        }

        await db.collection("interviwes").add(interview);

        return Response.json({success:true},{status:200});

    } catch (error) {
        console.log(error)
        return Response.json({success:false,error},{status:500})
    }
} 