"use client";
import Link from "next/link";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 border-t">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <p className="text-gray-600">© 2024 DocAgent. All rights reserved.</p>
          <div className="flex space-x-4">
            <Link
              href="/"
              className="text-gray-600 hover:text-indigo-600 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/"
              className="text-gray-600 hover:text-indigo-600 transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
