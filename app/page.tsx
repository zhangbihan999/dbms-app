'use client'
import { supabase } from "../lib/api"
import Link from 'next/link';

export default function Home() {

  return (
    <div className={"font-serif flex-col justify-center items-center"}>
        <div className={'text-center text-4xl'}>Welcome to Book Management System!</div>
        <div className={'h-4'}></div>
        <div className={'text-center text-slate-600 text-sm italic'}>Chen Zhang & Zhengyang Huang @ Sichuan University</div>
        <img src="/cover.png" alt="" className="mx-auto"/>
        <div h-16></div>
        <div className="flex justify-center space-x-4">
            <Link href="/signIn" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-block">
                Sign In
            </Link>
            <Link href="/signUp" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded inline-block">
                Sign Up
            </Link>
        </div>
    </div>
  );
}
