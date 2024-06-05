'use client';
import { supabase } from "@/lib/api";
import useUserStore from "@/lib/useStore";
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

export default function AdminHome() {
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
    user_name: string;
    status: boolean;
    borrow_date: Date;
    due_date: Date;
    actual_date: Date;
  }

  const [content, setContent] = useState('default');
  const [activeItem, setActiveItem] = useState<string>('');
  const [books, setBooks] = useState<Book[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [orderId, setOrderId] = useState('');
  const [actualDate, setActualDate] = useState('');
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
      .from('admin') 
      .update({ password: password.value })
      .eq('id', user.id);

    if (error) {
      alert(`Error updating password: ${error.message}`);
    } else {
      alert("The password is changed successfully and takes effect at the next login!");
    }
  }

  // 根据 id 查找订单
  async function findOrderById(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()  // 禁止刷新界面
    const form = event.target as HTMLFormElement;
    const orderId = form.elements.namedItem('orderId') as HTMLInputElement;

    const { data, error } = await supabase
    .from('orders')  // 确保你是从正确的表中查询
    .select('*')     // 选择所有列，或者指定你需要的列
    .eq('id', orderId.value);

    
  }

  // 修改订单状态和图书状态
  async function handleChangeStatus(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!orderId || !actualDate) {
      alert("Please fill in all fields.");
      return;
    }

    const { data: orderData, error: orderError } = await supabase
      .from('order')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !orderData) {
      alert("Order not found.");
      return;
    }

    const updatedOrderStatus = !orderData.status;
    const updatedBookStatus = !orderData.status;

    const { error: updateOrderError } = await supabase
      .from('order')
      .update({ status: updatedOrderStatus, actual_date: actualDate })
      .eq('id', orderId);

    const { error: updateBookError } = await supabase
      .from('book')
      .update({ status: updatedBookStatus })
      .eq('id', orderData.book_id);

    if (updateOrderError || updateBookError) {
      alert("Error updating order or book status.");
    } else {
      alert("Order and book status updated successfully.");
      fetchOrders();
      fetchBooks();
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
            onClick={() => handleNavClick('manageOrders')} 
            className={`w-full flex items-center text-white opacity-75 hover:opacity-100 py-4 pl-6 nav-item ${activeItem === 'manageOrders' ? 'bg-blue-800' : ''}`}
          >
            <i className="fas fa-table mr-3"></i>
            Manage Orders
          </button>
        </nav>
        <Link href="/signIn" className="absolute w-full upgrade-btn bottom-0 active-nav-link text-white flex items-center justify-center py-4" onClick={() => logout()}>Log Out</Link>
      </aside>

       {/* 主内容区 */}
       <div className="flex flex-1 p-10 justify-center">
        {/* Default */}
        {content === 'default' && 
        <div className="flex-col justify-center text-4xl">
          Welcome, {user?.name}!
        </div>}

        {/* Account Info */}
        {content === 'accountInfo' && 
        <div className="flex-col items-center justify-center">
          <table className="flex-1 justify-center items-center table-auto border border-separate border-slate-400">
          <thead>
            <tr>
              <th className="border border-slate-300 bg-slate-300 p-3">Mode</th>
              <th className="border border-slate-300 bg-slate-300 p-3">ID</th>
              <th className="border border-slate-300 bg-slate-300 p-3">Name</th>
              <th className="border border-slate-300 bg-slate-300 p-3">Password</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-slate-300 flex-col">Admin</td>
              <td className="border border-slate-300 flex-col">{user?.id}</td>
              <td className="border border-slate-300 flex-col">{user?.name}</td>
              <td className="border border-slate-300 flex-col">{user?.password}</td>
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
              <th className="border border-slate-300 bg-slate-300 p-3">ID</th>
              <th className="border border-slate-300 bg-slate-300 p-3">Name</th>
              <th className="border border-slate-300 bg-slate-300 p-3">Author</th>
              <th className="border border-slate-300 bg-slate-300 p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id}>
                <td className="border border-slate-300 p-2">{book.id}</td>
                <td className="border border-slate-300 p-2">{book.name}</td>
                <td className="border border-slate-300 p-2">{book.author}</td>
                <td className="border border-slate-300 p-2">{book.status ? '空闲' : '已借阅'}</td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>}

        {/* Manage Orders */}
        {content === 'manageOrders' && 
        <div className="flex-col items-center justify-center">
          <div className="flex flex-1 items-center justify-center">
            <div className="bg-slate-300 p-5 rounded-lg shadow-lg w-1/2 self-center mb-4">
              <form onSubmit={handleChangeStatus} className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Order ID"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    className="block w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  />
                </div>
                <div>
                  <input
                    type="date"
                    value={actualDate}
                    onChange={(e) => setActualDate(e.target.value)}
                    className="block w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  />
                </div>
                <div>
                  <button type="submit" className="bg-green-500 hover:bg-green-700 text-white py-1 px-4 rounded inline-block w-full">
                    Change Order Status
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          <div className="h-8"></div>

          <table className="flex-1 justify-center items-center table-auto border border-separate border-slate-400">
          <thead>
          <tr>
            <th className="border border-slate-300 bg-slate-300 p-3">ID</th>
            <th className="border border-slate-300 bg-slate-300 p-3">Book ID</th>
            <th className="border border-slate-300 bg-slate-300 p-3">Book Name</th>
            <th className="border border-slate-300 bg-slate-300 p-3">User ID</th>
            <th className="border border-slate-300 bg-slate-300 p-3">Status</th>
            <th className="border border-slate-300 bg-slate-300 p-3">Borrow Date</th>
            <th className="border border-slate-300 bg-slate-300 p-3">Due Date</th>
            <th className="border border-slate-300 bg-slate-300 p-3">Actual Date</th>
          </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
                <tr key={order.id}>
                  <td className="border border-slate-300 p-2">{order.id}</td>
                  <td className="border border-slate-300 p-2">{order.book_id}</td>
                  <td className="border border-slate-300 p-2">{order.book_name}</td>
                  <td className="border border-slate-300 p-2">{order.user_id}</td> 
                  <td className="border border-slate-300 p-2">{order.status ? '已归还' : '借阅中'}</td>
                  <td className="border border-slate-300 p-2">{order.borrow_date?.valueOf()}</td>
                  <td className="border border-slate-300 p-2">{order.due_date?.valueOf()}</td>
                  <td className="border border-slate-300 p-2">{order.actual_date?.valueOf()}</td>
                </tr>
              )
            )}
          </tbody>
          </table>
        </div>}
      </div>
    </div>
  );
}
