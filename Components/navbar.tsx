"use client";

import { useState } from "react";
import Image from "next/image";
import EnquiryModal from "./EnquiryModal";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuClosing, setMenuClosing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const handleCloseMenu = () => {
    setMenuClosing(true);
    setTimeout(() => {
      setMenuOpen(false);
      setMenuClosing(false);
    }, 600); // Match animation duration
  };

  const handleContactClick = () => {
    handleCloseMenu(); // Close hamburger with animation
    setTimeout(() => {
      setModalOpen(true); // Open enquiry modal after menu closes
    }, 600);
  };

  const handleProjectsClick = () => {
    handleCloseMenu(); // Close hamburger with animation
    setTimeout(() => {
      const projectsSection = document.getElementById('projects');
      if (projectsSection) {
        projectsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 600);
  };

  return (
    <>
      {/* Navbar */}
      <nav className="header top-0 left-0 w-full z-50">
        <div className="header-sub flex justify-between items-center px-6 md:px-12 py-[28px]">
          {/* Logo */}
          <div className="text-xl font-semibold tracking-wide">
            <a href="/" className="block">
              <Image
                src="/headerLogo.svg"
                alt="Logo"
                width={72}
                height={58}
                className="h-[59px] w-[143px] logo"
              />
            </a>
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(true)}
            className="flex flex-col justify-center items-center gap-1 group cursor-pointer"
          >
            <Image src="/images/MENU.svg" alt="Logo" width={42} height={49}                 className="h-[49px] w-[42px] menu-icon"
 />
          </button>
        </div>
      </nav>

      {/* Fullscreen Menu */}
      {menuOpen && (
        <div className={`fixed inset-0 bg-[#f1efef] z-50 flex flex-col ${menuClosing ? 'animate-slideOutRight' : 'animate-slideInRight'}`}>
          {/* Close Button */}
          <button
            onClick={handleCloseMenu}
            className={`close-button absolute top-6 right-6 w-10 h-10 
                 bg-[#e0e0e0] rounded-lg 
                 flex items-center justify-center 
                 text-xl text-gray-700 hover:bg-gray-300  transition-colors cursor-pointer ${menuClosing ? 'animate-fadeOut' : 'animate-fadeIn'}`}
            style={{ animationDelay: menuClosing ? '0ms' : '300ms' }}
          >
            ✕
          </button>

          {/* Center Menu Links */}
          <div className="flex-1 flex flex-col justify-center items-center gap-8">
            {/* Active Link */}
            <a
              href="/"
              onClick={handleCloseMenu}
              className={`text-xl font-light text-[#000000] relative ${menuClosing ? 'animate-fadeOutLeft' : 'animate-fadeInLeft'}`}
              style={{ animationDelay: menuClosing ? '0ms' : '400ms' }}
            >
              Home
              <span className="absolute left-0 -bottom-1 w-full h-[2px] bg-green-500" />
            </a>

            <a
              href="#projects"
              onClick={handleProjectsClick}
              className={`text-xl font-light text-[#000000] ${menuClosing ? 'animate-fadeOutLeft' : 'animate-fadeInLeft'}`}
              style={{ animationDelay: menuClosing ? '0ms' : '500ms' }}
            >
              Projects
            </a>

            <a
              href="/blog"
              onClick={handleCloseMenu}
              className={`text-xl font-light text-[#000000] ${menuClosing ? 'animate-fadeOutLeft' : 'animate-fadeInLeft'}`}
              style={{ animationDelay: menuClosing ? '0ms' : '600ms' }}
            >
              Blog
            </a>

            <a
              href="/privacy-policy"
              onClick={handleCloseMenu}
              className={`text-xl font-light text-[#000000] ${menuClosing ? 'animate-fadeOutLeft' : 'animate-fadeInLeft'}`}
              style={{ animationDelay: menuClosing ? '0ms' : '700ms' }}
            >
              Privacy Policy
            </a>

            <button
              onClick={handleContactClick}
              className={`text-xl font-light text-[#000000] ${menuClosing ? 'animate-fadeOutLeft' : 'animate-fadeInLeft'}`}
              style={{ animationDelay: menuClosing ? '0ms' : '800ms' }}
            >
              Contact
            </button>
          </div>

          {/* Bottom Logo Section */}
          <div className={`pb-10 flex flex-col items-center ${menuClosing ? 'animate-fadeOut' : 'animate-fadeIn'}`} style={{ animationDelay: menuClosing ? '0ms' : '900ms' }}>
            <Image
              src="/hamburgerLogo.svg"
              alt="SZ Developers"
              width={130}
              height={50}
            />

            <p className="text-[10px] text-[#4B4B4B] mt-4 text-center">
              SZ Developers © 2026 <br />
              All Rights Reserved
            </p>
          </div>
        </div>
      )}
      <EnquiryModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
