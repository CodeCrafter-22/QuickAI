import { Menu, X } from 'lucide-react'
import React, { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import Sidebar from '../components/Sidebar'
import { SignIn, useUser } from '@clerk/clerk-react'

const Layout = () => {
    const navigate = useNavigate()
    const [sidebar, setSidebar] = useState(false)
    const {user} = useUser()

    return user ? (
        <div className="flex flex-col items-start justify-start h-screen">
            <nav className="w-full flex items-center justify-between px-8 min-h-14 border-b border-gray-200">
                <img src={assets.logo} alt=""
                    className="w-32 sm:w-44 cursor-pointer mb-2"
                    onClick={() => navigate('/')}
                />
                <div className="block lg:hidden">
                    {sidebar ? (
                        <X onClick={() => setSidebar(false)}
                            className="w-6 h-6 text-gray-600 cursor-pointer"
                        />
                    ) : (
                        <Menu
                            onClick={() => setSidebar(true)}
                            className="w-6 h-6 text-gray-600 cursor-pointer"
                        />
                    )}
                </div>
            </nav>
            <div className='flex-1 w-full flex h-[calc(100vh-64px)]'>
                <Sidebar sidebar={sidebar} setSidebar={setSidebar}/>
                <div className='flex-1 bg-[#F4F7FB]'>
                    <Outlet />
                </div>

            </div>
            
        </div>
    ) : (
        <div className='flex items-center justify-center h-screen'>
            <SignIn />
        </div>
    )
}

export default Layout
