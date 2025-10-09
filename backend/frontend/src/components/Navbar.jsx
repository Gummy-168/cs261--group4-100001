import React, {useState} from 'react'
import Logo from '../assets/img/TULogo-02.png'
import { FaBars } from 'react-icons/fa'

function Navbar() {
  const [toggl, setToggle] = useState(false);

  const updateToggle = () => {
    setToggle(!toggl);
  }

  return (
    <nav className='bg-[#D9D9D9]'>
    <div className='container mx-auto max-w-[1320px] relative h-auto px-4 py-2 flex flex-col md:flex-row md:justify-between md:items-center md:h-[80px]'>
            <div className='logo flex items-center'>
                <a href='#' >
                  <img src={Logo} alt='TU Logo' className="h-[60px] w-auto object-contain" />

                </a>
            </div>
            
            <ul className='flex flex-col md:flex-row my-5'>
                <li className='my-2 md:mx-4'><a href='#'>Service</a></li>
                <li className='my-2 md:mx-4'><a href='#'>Feature</a></li>
                <li className='my-2 md:mx-4'><a href='#'></a>TU Activity</li>
                <li className='my-2 md:mx-4'><a href='#'>Home</a></li>
                <li className='my-2 md:mx-4'><a href='#'></a>What are you looking</li>
                <li className='my-2 md:mx-4'><a href='#'>FAQ</a></li>
            </ul>

            <ul className='flex flex-col my-5 md:flex-row'>
                <li className='my-2 md:mx-4'><a className='inline-flex justify-center items-center py-2 px-4 bg-[#FFCE47] text-black rounded-md' href='#'>Login</a></li>
            </ul>

            {/* Hamburger Icon */}
        </div>
    </nav>
  )
}

export default Navbar