'use client'
import { supabase } from "@/lib/api";
import useUserStore from "@/lib/useStore";
import Link from 'next/link';
import React, { DataHTMLAttributes, useEffect, useState } from 'react';

export default function Home() {
  interface Book {
    id: number;
    name: string;
    author: string;
    status: boolean;
  }

  interface Order {
    id: number;
    book_id: number;
    book_name: string;
    user_id: number;
    status: boolean;
    borrow_date: Date;
    due_date: Date;
    actual_date: Date;
  }

  const [content, setContent] = useState('default');
  const [activeItem, setActiveItem] = useState<string>('');
  const [books, setBooks] = useState<Book[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [showForm, setShowForm] = useState(false);
  const [currentBook, setCurrentBook] = useState({ id: 0, name: '', borrowDate: new Date(), dueDate: new Date() });

  const { user, logout } = useUserStore()   /* 用户状态 */

  // 更新内容并设置当前活跃的导航条目
  const handleNavClick = (item: string) => {
    setContent(item);
    setActiveItem(item);
    console.log(user)
  };

  // 修改密码
  async function handleChangePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()  // 禁止刷新界面
    const form = event.target as HTMLFormElement;
    const password = form.elements.namedItem('password') as HTMLInputElement;
    const check = form.elements.namedItem('check') as HTMLInputElement;

    if (check.value !== password.value) {
        alert("The two passwords are different")
        return
    }

    const { error } = await supabase
      .from('user') 
      .update({ password: password.value })
      .eq('id', user.id);

    if (error) {
      alert(`Error updating password: ${error.message}`);
    } else {
      alert("The password is changed successfully and takes effect at the next login!");
    }
  }

  useEffect(() => {
    fetchBooks();
    fetchOrders()
  }, []);

  /* 从数据库中获取 book 表单的内容 */
  async function fetchBooks() {
    const { data, error } = await supabase
      .from('book')
      .select('*');

    if (error) {
      console.error('Error fetching books:', error);
    } else {
      setBooks(data);
    }
  }

  /* 从数据库中获取 order 表单的内容 */
  async function fetchOrders() {
    const { data, error } = await supabase
      .from('order')
      .select('*');

    if (error) {
      console.error('Error fetching orders:', error);
    } else {
      setOrders(data);
    }
  }

  // 开启弹窗并设置当前书籍信息
  const openForm = (book: Book) => {
    setCurrentBook({
      id: book.id,
      name: book.name,
      borrowDate: new Date(),
      dueDate: new Date() // 默认设置为当前日期，用户可以修改
    });
    setShowForm(true);
  };

  // 关闭弹窗
  const closeForm = () => {
    setShowForm(false);
  };

  // 提交借阅表单
  async function handleBorrow(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()  // 禁止刷新界面
    const form = event.target as HTMLFormElement;
    /* const bookId = form.elements.namedItem('bookId') as HTMLLabelElement;
    const bookName = form.elements.namedItem('bookName') as HTMLLabelElement;
    const userId = user.id; */
    const borrowDate = new Date().toISOString().substring(0, 10);  // 取 YYYY-MM-DD 部分
    const dueDate = form.elements.namedItem('DueDate') as HTMLInputElement;

    const { data, error } = await supabase
        .from('order')
        .insert([
            { 
                book_id: currentBook.id,
                book_name: currentBook.name,
                user_id: user.id,
                status: false,
                borrow_date: borrowDate,
                due_date: currentBook.dueDate,
            }
        ]);

    updateBook()

    if (error) {
        console.error('Error inserting data: ', error);
        alert("Error inserting data.");
    } else {
        console.log('Data inserted: ', data);
        alert("Successfully borrowed! Remember to return it in time!");
        closeForm()
    }
  }

  // 修改书籍信息
  async function updateBook() {
    const { error } = await supabase
        .from('book') 
        .update({ status: false })
        .eq('id', currentBook.id);
  }

  return (
    <div className="flex min-h-screen">
      {/* 侧边栏 */}
      <aside className="relative bg-sidebar h-screen w-64 hidden sm:block shadow-xl bg-blue-600">
        <div className="p-6">
            <label className="text-white text-4xl font-semibold justify-center flex">{user?.name}</label>
        </div>
        <nav className="text-white text-base font-semibold pt-3">
            <button 
              onClick={() => handleNavClick('accountInfo')} 
              className={`w-full flex items-center text-white opacity-75 hover:opacity-100 py-4 pl-6 nav-item ${activeItem === 'accountInfo' ? 'bg-blue-800' : ''}`}
            >
                <i className="fas fa-tachometer-alt mr-3"></i>
                Account Info
            </button>
            <button 
              onClick={() => handleNavClick('bookInfo')} 
              className={`w-full flex items-center text-white opacity-75 hover:opacity-100 py-4 pl-6 nav-item ${activeItem === 'bookInfo' ? 'bg-blue-800' : ''}`}
            >
                <i className="fas fa-sticky-note mr-3"></i>
                Book Info
            </button>
            <button 
              onClick={() => handleNavClick('myOrders')} 
              className={`w-full flex items-center text-white opacity-75 hover:opacity-100 py-4 pl-6 nav-item ${activeItem === 'myOrders' ? 'bg-blue-800' : ''}`}
            >
                <i className="fas fa-table mr-3"></i>
                My Orders
            </button>
        </nav>
        <Link href="/signIn" className="absolute w-full upgrade-btn bottom-0 active-nav-link text-white flex items-center justify-center py-4" onClick={() => logout()}>Log Out</Link>
      </aside>

      {/* 主内容区 */}
      <div className="flex flex-1 p-10 justify-center">
        {/* Default */}
        {content === 'default' && 
        <div className=" flex-col justify-center text-4xl ">
        Welcome, {user?.name}!
        </div>}

        {/* Account Info */}
        {content === 'accountInfo' && 
        <div className="flex-col items-center justify-center">
          <table className="flex-1 justify-center items-center table-auto border border-separate border-slate-400">
          <thead>
            <tr>
              <th className="border border-slate-300 bg-slate-300 p-3">mode</th>
              <th className="border border-slate-300 bg-slate-300 p-3">id</th>
              <th className="border border-slate-300 bg-slate-300 p-3">name</th>
              <th className="border border-slate-300 bg-slate-300 p-3">password</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-slate-300 flex-col ">user</td>
              <td className="border border-slate-300 flex-col ">{ user?.id }</td>
              <td className="border border-slate-300 flex-col ">{ user?.name }</td>
              <td className="border border-slate-300 flex-col ">{ user?.password }</td>
            </tr>
          </tbody>
          </table>    

          <div className="h-8"></div>

          <form className="space-y-3 border border-slate-500 flex-col flex-1 bg-slate-300 p-4 rounded justify-center items-center"
            onSubmit={handleChangePassword}>
            <div>
                <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">New Password</label>
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

            <div className="w-full flex justify-center"> 
              <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Change Password</button>
            </div>
          </form>

          
          
        </div>}

        {/* Book Info */}
        {content === 'bookInfo' && 
        <div className="flex-col items-center justify-center">
          <table className="flex-1 justify-center items-center table-auto border border-separate border-slate-400">
          <thead>
            <tr>
              <th className="border border-slate-300 bg-slate-300 p-3">id</th>
              <th className="border border-slate-300 bg-slate-300 p-3">name</th>
              <th className="border border-slate-300 bg-slate-300 p-3">author</th>
              <th className="border border-slate-300 bg-slate-300 p-3">status</th>
              <th className="border border-slate-300 bg-slate-300 p-3">operate</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id}>
                <td className="border border-slate-300 p-2">{book.id}</td>
                <td className="border border-slate-300 p-2">{book.name}</td>
                <td className="border border-slate-300 p-2">{book.author}</td>
                <td className="border border-slate-300 p-2">{book.status ? '空闲' : '已借出'}</td>
                <td className="border border-slate-300 p-2 flex-1 justify-center">
                  {book.status && 
                  <button className="bg-green-500 hover:bg-green-700 text-white py-1 px-4 rounded inline-block"
                  onClick={() => openForm(book)}>
                    Borrow
                  </button>}
                </td>
              </tr>
            ))}
          </tbody>
          </table>  
          {showForm && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
              <div className=" p-4 rounded">
              <form className="space-y-4 bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
              onSubmit={handleBorrow}
              >
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="bookId" id="bookId">
                    Book Id: {currentBook.id}
                  </label>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="bookName" id="bookName">
                    Book Name: {currentBook.name}
                  </label>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="borrowDate" id="borrowDate">
                    Borrow Date:
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    type="date"
                    id="dueDate"
                    value={currentBook.borrowDate.toISOString().substring(0, 10)}
                    readOnly
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dueDate">
                    Due Date:
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    type="date"
                    value={currentBook.dueDate.toISOString().substring(0, 10)}
                    onChange={e => setCurrentBook({...currentBook, dueDate: new Date(e.target.value)})}
                  />
                </div>
                <div className="flex items-center justify-between space-x-2">
                  <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    type="submit"
                  >
                    Submit
                  </button>
                  <button
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    type="button"
                    onClick={closeForm}
                  >
                    Cancel
                  </button>
                </div>
              </form>
              </div>
            </div>
          )}
        </div>}

        {/* My Orders */}
        {content === 'myOrders' && 
        <div className="flex-col items-center justify-center">
        <table className="flex-1 justify-center items-center table-auto border border-separate border-slate-400">
        <thead>
          <tr>
            <th className="border border-slate-300 bg-slate-300 p-3">id</th>
            <th className="border border-slate-300 bg-slate-300 p-3">book_id</th>
            <th className="border border-slate-300 bg-slate-300 p-3">book_name</th>
            {/* <th className="border border-slate-300 bg-slate-300 p-3">user_id</th> */}
            <th className="border border-slate-300 bg-slate-300 p-3">status</th>
            <th className="border border-slate-300 bg-slate-300 p-3">borrow date</th>
            <th className="border border-slate-300 bg-slate-300 p-3">due date</th>
            <th className="border border-slate-300 bg-slate-300 p-3">actual date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            order.user_id === user?.id && ( // 只展示该用户的订单
              <tr key={order.id}>
                <td className="border border-slate-300 p-2">{order.id}</td>
                <td className="border border-slate-300 p-2">{order.book_id}</td>
                <td className="border border-slate-300 p-2">{order.book_name}</td>
                {/* <td className="border border-slate-300 p-2">{order.user_id}</td> */}
                <td className="border border-slate-300 p-2">{order.status ? '已归还' : '借阅中'}</td>
                <td className="border border-slate-300 p-2">{order.borrow_date?.valueOf()}</td>
                <td className="border border-slate-300 p-2">{order.due_date?.valueOf()}</td>
                <td className="border border-slate-300 p-2">{order.actual_date?.valueOf()}</td>
              </tr>
            )
          ))}
        </tbody>
        </table>  
      </div>}
      </div>
    </div>
  );
};
