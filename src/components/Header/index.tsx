"use client";
import Link from "next/link";

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md border-b border-gray-300">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-indigo-600">
          DocAgent V3
        </Link>
        <nav>
          <ul className="flex space-x-6">
            {/* <li>
              <Link
                href="/input"
                className="text-gray-600 hover:text-indigo-600 transition-colors"
              >
                Input Page
              </Link>
            </li> */}
            <li>
              <Link
                href="/output"
                className="text-gray-600 hover:text-indigo-600 transition-colors"
              >
                Output Page
              </Link>
            </li>
            <li>
              <Link
                href="/rules"
                className="text-gray-600 hover:text-indigo-600 transition-colors"
              >
                Rules Page
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};
