import React from "react";
import Image from "next/image";

const Footer = () => {
  return (
    <footer className="w-full bg-white">
      <Image
        src="/bott.png" // place your image in public/footer-banner.jpg
        alt="Footer Banner"
        width={1920} // adjust based on your image size
        height={200} // adjust based on your image size
        className="w-full h-auto object-cover my-3 px-3"
        priority
      />
    </footer>
  );
};

export default Footer;
