import DisplayTechIcons from '@/compnents/Forms/DisplayTechIcons';
import Agent from '@/components/Agent';
import { getCurrentUser, getInterviewById } from '@/lib/action/auth.action';
import { getRandomInterviewCover } from '@/lib/utils';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import React from 'react'

const page = async({params}:RouteParams) => {
    const {id}=await params;
    const interview =await getInterviewById(id);

    const user=await getCurrentUser();
    if(!interview) redirect('/interview');

  
    return (
        <>
    <div className='flex flex-row gap-4 justify-between'>
        
        <div className="flex flex-row gap-4 items-center max-sm:flex-col">
            <div className="flex flex-row gap-4 items-center">
                <Image
                    src={getRandomInterviewCover()}
                    alt="Interview Cover"
                    width={40}
                    height={40}
                    className='rounded-full object-cover size-[40px]'
                />
                <h3 className="capitalize">
                    {interview.role}
                </h3>
            </div>

            <DisplayTechIcons techStack={interview.techstack}/>
        </div>

        <p className='bg-dark-200 px-4 py-2 rounded-lg capitalize h-fit'>{interview.type} </p>
    </div>
        <p className='bg-dark-200 px-4 py-2 rounded-lg h-fit capitalize'>
            {interview.type}
        </p>

        <Agent
            userName={user?.name || 'User'}
            interviewId={id}
            type="interview"
            questions={interview.questions}
        />

    </>
  )
}

export default page