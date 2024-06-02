'use client'
import { supabase } from "@/lib/api";
import Link from 'next/link';
import useUserStore from '@/lib/useStore'
import { useRouter } from 'next/navigation';

export default function Home() {
  const { setUser, user } = useUserStore();  /* 记录用户状态 */
  const router = useRouter()
  
  async function handleSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();  // 阻止表单的默认提交行为
    const form = event.target as HTMLFormElement;
    const name = form.elements.namedItem('name') as HTMLInputElement;
    const password = form.elements.namedItem('password') as HTMLInputElement;
    const mode = form.elements.namedItem('mode') as HTMLSelectElement;
    const table = mode.value === 'Admin' ? 'admin' : 'user';

    // 从数据库中查询是否存在该用户名
    const { data: userData, error: userError } = await supabase
        .from(table)
        .select("*")
        .eq('name', name.value)
        .single(); // Assuming 'name' should be unique

    if (userError || !userData) {
        console.error('Error fetching user:', userError);
        alert("Account not exists.");
        return;
    }

    // 检查密码是否匹配
    if (userData.password !== password.value) {
        alert("Password is wrong.");
        return;
    }

    setUser({id: userData.id, name: userData.name, password: userData.password})   /* 设置用户信息 */
    // 导航到相应的页面
    if (mode.value === 'Admin') {
        router.push('/admin') 
    } else {
        router.push('/user')
    } 
  }

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">Sign in to your account</h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" action="#" method="POST" onSubmit={handleSignIn}>
          <div>
              <label htmlFor="mode" className="block text-sm font-medium leading-6 text-gray-900">Account Mode</label>
              <div className="mt-2">
                <select id="mode" name="mode" required className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
                <option value="User">User</option>
                <option value="Admin">Admin</option>
                </select>
              </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">User/Admin Name</label>
              <div className="text-sm">
                  <Link href="/signUp" className="font-semibold text-indigo-600 hover:text-indigo-500">Create a new account?</Link>
              </div>
              </div>
            <div className="mt-2">
              <input id="name" name="name" type="name" autoComplete="name" required className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"/>
            </div>
          </div>

          <div>
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">Password</label>
            <div className="mt-2">
              <input id="password" name="password" type="password" autoComplete="current-password" required className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"/>
            </div>
          </div>

          <div>
            <button type="submit" className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Sign in</button>
          </div>
        </form>

      </div>
    </div>
    
  );
};