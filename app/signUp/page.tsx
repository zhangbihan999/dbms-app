'use client'
import Link from 'next/link';
import React, { useState } from 'react';
import { supabase } from "@/lib/api";

export default function Home() {
  const [mode, setMode] = useState('User')
  const [authorityCode, setAuthorityCode] = useState('')

  // 生成八位随机 id
  function generateEightDigitId() {
    return Math.floor(Math.random() * 90000000) + 10000000;
  } 

  // 函数用于向 'user' 表添加新用户
  async function handleSignUp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()  // 禁止刷新界面
    const form = event.target as HTMLFormElement;
    const name = form.elements.namedItem('name') as HTMLInputElement;
    const password = form.elements.namedItem('password') as HTMLInputElement;
    const check = form.elements.namedItem('check') as HTMLInputElement;
    const table = mode === 'Admin' ? 'admin' : 'user';
    const id = generateEightDigitId();

    if (mode === 'Admin' && authorityCode !== 'zhangbihan999') {
        alert("Authority code is wrong!");
        return;
    }

    if (check.value !== password.value) {
        alert("The two passwords are different")
        return
    }

    const { data, error } = await supabase
        .from(table)
        .insert([
            { 
                id: id,
                name: name.value,
                password: password.value,
            }
        ]);

    if (error) {
        console.error('Error inserting data: ', error);
        alert("Error creating account.");
    } else {
        console.log('Data inserted: ', data);
        alert("Account Created! Let's sign in!");
        window.location.href = '/signIn'; // 导航到登录界面
    }
}

    return (
        <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">Create a new account</h2>
        </div>
  
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" action="#" method="POST" onSubmit={handleSignUp}>
            
            <div>
              <label htmlFor="mode" className="block text-sm font-medium leading-6 text-gray-900">Account Mode</label>
              <div className="mt-2">
                <select id="mode" name="mode" required onChange={(e) => setMode(e.target.value)} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
                <option value="User">User</option>
                <option value="Admin">Admin</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">User/Admin Name</label>
              </div>
              <div className="mt-2">
                <input id="name" name="name" type="text" autoComplete="name" required className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"/>
              </div>
            </div>
  
            <div>
                <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">Password</label>
              <div className="mt-2">
                <input id="password" name="password" type="password" autoComplete="current-password" required className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"/>
              </div>
            </div>

            <div>
                <label htmlFor="check" className="block text-sm font-medium leading-6 text-gray-900">Check Your Password</label>
              <div className="mt-2">
                <input id="check" name="check" type="password" autoComplete="check" required className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"/>
              </div>
            </div>

            <div>
                <label htmlFor="admin-authority-code" className="block text-sm font-medium leading-6 text-gray-900">Authority Code</label>
                <label className="block text-xs font-medium leading-6 text-gray-500">Tip: Only needed for &apos;Admin&apos; account</label>
              <div className="mt-2">
                <input id="admin-authority-code" name="admin-authority-code" type="password" autoComplete="admin-authority-code" required  disabled={mode !== 'Admin'} onChange={(e) => setAuthorityCode(e.target.value)} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"/>
              </div>
            </div>
  
            <div>
              <button type="submit" className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Sign Up</button>
            </div>
          </form>
  
        </div>
      </div>
    )
}