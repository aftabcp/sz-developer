"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import EnquiryModal from "./EnquiryModal";

export default function FooterMobile() {
  const [modalOpen, setModalOpen] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const scrollToProjects = () => {
    const projectsSection = document.getElementById("projects");
    if (projectsSection) {
      projectsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleContactClick = () => {
    setModalOpen(true);
  };

  return (
    <footer className="relative text-white px-6 py-14 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="/footer-bg.jpg"
          alt="Footer Background"
          fill
          className="object-cover"
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10">
        {/* ===== FLEX WRAPPER ===== */}
        <div className="flex flex-wrap gap-y-12">
          
          {/* ===== ROW 1 ===== */}
          <div className="w-1/2">
            <h3 className="text-green-500 text-lg mb-5">Services</h3>
            <div className="space-y-4 text-[11px] leading-6">
              <div>Real Estate Development</div>
              <div>Property Management</div>
              <div>Project Conceptualization & Planning</div>
            </div>
          </div>

          <div className="w-1/2 relative">
            <div className="flex justify-between items-start">
              <h3 className="text-green-500 text-lg mb-5">About</h3>

              {/* Scroll Button (First Row) */}
              <button
                onClick={scrollToTop}
                className="bg-green-500 w-10 h-10 flex items-center justify-center hover:bg-green-600 transition-colors"
              >
                <Image
                  src="/footerArrow.svg"
                  alt="Scroll to top"
                  width={16}
                  height={16}
                />
              </button>
            </div>

            <div className="space-y-4 text-[11px] leading-6">
              <button
                onClick={scrollToProjects}
                className="block text-left hover:text-[#00CC61] transition-colors"
              >
                Our Projects
              </button>

              <Link
                href="/blog"
                className="block text-left hover:text-[#00CC61] transition-colors"
              >
                Blog
              </Link>

              <Link
                href="/privacy-policy"
                className="block text-left hover:text-[#00CC61] transition-colors"
              >
                Privacy Policy
              </Link>

              <button
                onClick={handleContactClick}
                className="block text-left hover:text-[#00CC61] transition-colors"
              >
                Contact
              </button>

              {/* Social Icons */}
            
            </div>
          </div>

          {/* ===== ROW 2 ===== */}
          <div className="w-1/2">
            <h3 className="text-green-500 text-lg mb-5">Contact</h3>
            <div className="space-y-4 text-[11px]">
              <div className="flex items-center gap-3">
                <Image
                  src="/phoneIcon.png"
                  alt="Phone"
                  width={16}
                  height={16}
                />
                <span>+91 86060 02281</span>
              </div>

              <div className="flex items-center gap-3">
                <Image
                  src="/emailIcon.png"
                  alt="Email"
                  width={16}
                  height={16}
                />
                <span>info@szdevelopers.com</span>
              </div>
                <div className="flex gap-4 mt-6">
                <a
                  href="https://www.linkedin.com/company/szdevelopers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-all duration-300 hover:scale-110 hover:opacity-80"
                >
                  <Image
                    src="/linkedin.svg"
                    alt="LinkedIn"
                    width={20}
                    height={20}
                  />
                </a>

                <a
                  href="https://www.instagram.com/szdevelopers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-all duration-300 hover:scale-110 hover:opacity-80"
                >
                  <Image
                    src="/instagram.svg"
                    alt="Instagram"
                    width={20}
                    height={20}
                  />
                </a>

                <a
                  href="https://www.facebook.com/szhomes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-all duration-300 hover:scale-110 hover:opacity-80"
                >
                  <Image
                    src="/fb.svg"
                    alt="Facebook"
                    width={10}
                    height={16}
                  />
                </a>
              </div>
            </div>
          </div>

          <div className="w-1/2">
            <h3 className="text-green-500 text-lg mb-5">Office</h3>
            <p className="text-[11px] leading-6">
              3rd Floor, Nechikkadan Tower,
              <br />
              Mini Bypass Road,
              <br />
              Opp. Swapna Nagari, Eranhipalam,
              <br />
              P.O. Kozhikode, Kerala 673006
            </p>
          </div>
        </div>

        {/* Logo */}
        <div className="flex justify-center pt-16">
          <Image
            src="/footerLogo.svg"
            alt="SZ Developers"
            width={150}
            height={60}
          />
        </div>

        {/* Copyright */}
        <div className="text-center text-[11px] text-[#8A8A8A] pt-6">
          SZ Developers © 2026
          <br />
          All Rights Reserved
        </div>
      </div>

      <EnquiryModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </footer>
  );
}