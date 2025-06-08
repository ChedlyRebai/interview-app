"use client"
import React from "react";
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
    Form,
} from "@/components/ui/form"
import Image from "next/image";
import FormField from "./FormField";
import Link from "next/link";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebasee/client";
import { signIn, signUp } from "@/lib/action/auth.action";


const formSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    password: z.string().min(8, {
        message: "Password must be at least 8 characters.",
    }),
})


const AuthForm = ({ type }: { type: string }) => {
    const router = useRouter();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
       if(type == 'sign-in') {
            const { email, password } = values;
            const userCredential= await signInWithEmailAndPassword(auth, email, password);
            const idToken=await userCredential.user.getIdToken();
            if(!userCredential.user) {
                toast.error("Invalid email or password. Please try again.");
                return;
            }

            await signIn({
                email,
                idToken,
            })
            router.push("/")
       }
       else {
            const { name, email, password } = values;
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const result = await signUp({
                uid: userCredential.user.uid,
                email,
                password,
                name: name,
            })

            if(!result?.success) {
                toast.error(result?.message || "Failed to create account. Please try again.");
                return;
            }

            toast.success("Account created successfully!");
            router.push("/sign-in")
       }
    }

    const isSignIn = type === "sign-in"
    return (
        <div className="card-border lg:min-w-[566px]">
            <div className="flex flex-col gap-6 card py-16 px-10">
                <div className="flex flex-row gap-2 justify-center">
                    <Image
                        src="/logo.svg"
                        alt="logo"
                        height={32}
                        width={32}
                    />
                    <h2 className="text-primary-100">AiInterview</h2>
                </div>
                <h3>Practice job interview</h3>


                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}
                        className="w-full space-y-6 mt-4 form">
                        {!isSignIn && (
                            <FormField
                                name="name"
                                label="Name"
                                control={form.control}
                                type="text"
                                placeholder="Enter your name"
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="email"
                            label="Email"
                            placeholder="Your email address"
                            type="email"
                        />

                        <FormField
                            name="password"
                            label="Password"
                            control={form.control}
                            type="password"
                            placeholder="Enter your password"
                        />
                        <Button className="btn" type="submit">
                            {isSignIn ? "Sign In" : "Create an Account"}
                        </Button>
                    </form>
                </Form>
                <p className="text-center">
                    {isSignIn ? "No account yet?" : "Have an account already?"}
                    <Link
                        href={!isSignIn ? "/sign-in" : "/sign-up"}
                        className="font-bold text-user-primary ml-1"
                    >
                        {!isSignIn ? "Sign In" : "Sign Up"}
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default AuthForm;
