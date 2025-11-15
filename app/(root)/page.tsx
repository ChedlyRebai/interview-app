import InterviewCard from "@/compnents/InterviewCard";
import { Button } from "@/components/ui/button";
import { dummyInterviews } from "@/constants";
import { getCurrentUser, getInterviewByUserId, getLatestInterviews } from "@/lib/action/auth.action";
import { get } from "http";
import Image from "next/image";
import Link from "next/link";

export default async function Home() {
  const currentUser = await getCurrentUser();

  const [userInterviews, lastesInterviews] = await Promise.all([
    await getInterviewByUserId(currentUser?.uid || ""),
    await getLatestInterviews({ userId: currentUser?.uid || "", limit: 5 }),
  ])

  const hasPastInterviews = userInterviews?.length || 0 > 0;

  const hasUpcomingnterviews = lastesInterviews?.length || 0 > 0;
  return (
    <>
      <section className="card-cta">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2>
            Get interview-ready with AI-powered mock interviews
            <p className="text-lg">
              Practice your interview skills with AI-generated questions and
              personalized feedback. Whether you're preparing for a job
              interview or just want to improve your communication skills, our
              app has you covered.
            </p>
            <Button asChild className="btn-primary max-sm:w-full">
              <Link href="/interview">Get Started</Link>
            </Button>
          </h2>
        </div>
        <Image
          className="max-sm:hidden"
          src="/robot.png"
          alt="Interview Illustration"
          width={500}
          height={500}
        />
      </section>
      <section className="flex flex-col gap-6 mt-6">
        <h2> Your interviews</h2>
        <div className="interviews-section">
          {dummyInterviews.map((interview) => (
            <InterviewCard key={interview.id} {...interview} />
          ))}
        </div>
      </section>

      {/* <div className="flex flex-col gap-6 mt-8">
        <h2>Take an Interview</h2>
        {hasPastInterviews ? (
          userInterviews?.map((interview) => {
            return <InterviewCard key={interview.id} {...interview} />;
          })
        ) : (
          <p>
            You have no past interviews. Take your first interview now to get
            started!
          </p>
        )}
      </div> */}

      <section className="flex flex-col gap-6 mt-6">
        <h2> Your interviews</h2>
        <div className="interviews-section">
          {hasPastInterviews ? (lastesInterviews?.map((interview) => (
            <InterviewCard key={interview.id} {...interview} />
          ))):(
            <p>
              You have no past interviews. Take your first interview now to get
              started!
            </p>
          )}
        </div>
      </section>
    </>
  );
}
