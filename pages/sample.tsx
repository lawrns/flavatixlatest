import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function SamplePage() {
  return (
    <div className="bg-bg dark:bg-bg font-sans text-fg dark:text-fg min-h-screen pb-20">
      <div className="flex min-h-screen flex-col">
        {/* Header */}
        <header className="flex items-center border-b border-line dark:border-line p-4">
          <button className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-bg-inset dark:hover:bg-bg-surface">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="flex-1 text-center text-xl font-bold">Design System Sample</h1>
          <div className="w-10"></div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-8">

            {/* Hero Section */}
            <section className="text-center">
              <div className="relative h-64 w-full mb-6">
                <div className="absolute inset-0 bg-cover bg-center rounded-soft" style={{backgroundImage: "url('/generated-images/hero/hero-background.webp')"}}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-bg from-0% rounded-soft"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="h-24 w-24 text-white" fill="none" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="4"></circle>
                    <path d="M50 20 L50 80 M20 50 L80 50" stroke="currentColor" strokeLinecap="round" strokeWidth="4"></path>
                    <circle cx="50" cy="50" fill="currentColor" r="10"></circle>
                  </svg>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-fg dark:text-fg mb-2">Flavatix México</h1>
              <p className="text-fg-muted dark:text-fg-muted">Taste, analyze, and share your reviews of México&apos;s finest beverages.</p>
            </section>

            {/* Buttons Section */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Buttons</h2>
              <div className="space-y-4">
                <button className="flex w-full items-center justify-center gap-3 rounded-soft bg-primary px-4 py-3 text-white font-bold">
                  <span className="material-symbols-outlined">local_bar</span>
                  <span>Primary Button</span>
                </button>

                <div className="flex gap-4">
                  <button className="flex w-full items-center justify-center gap-3 rounded-soft bg-bg px-4 py-3 font-bold text-fg dark:text-fg ring-1 ring-line">
                    <span className="material-symbols-outlined">login</span>
                    <span>Google</span>
                  </button>
                  <button className="flex w-full items-center justify-center gap-3 rounded-soft bg-bg px-4 py-3 font-bold text-fg dark:text-fg ring-1 ring-line">
                    <span className="material-symbols-outlined">phone_iphone</span>
                    <span>Apple</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Cards Section */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Cards</h2>
              <div className="space-y-4">
                <div className="bg-white dark:bg-bg-surface p-4 rounded-soft">
                  <h3 className="text-lg font-bold text-fg dark:text-fg mb-2">Your Tasting</h3>
                  <div className="flex items-baseline gap-2 mb-4">
                    <p className="text-4xl font-bold text-primary">85%</p>
                    <span className="text-green-500 font-medium">+10% vs Community</span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'Fruity', value: 70 },
                      { label: 'Earthy', value: 90 },
                      { label: 'Spicy', value: 10 },
                      { label: 'Floral', value: 100 },
                      { label: 'Woody', value: 50 }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center">
                        <span className="w-16 text-sm font-medium text-fg-muted dark:text-fg-muted">{item.label}</span>
                        <div className="flex-1 h-2 rounded-full bg-line">
                          <div className="bg-primary h-2 rounded-full" style={{width: `${item.value}%`}}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-bg-surface p-4 rounded-soft">
                  <h3 className="text-lg font-bold text-fg dark:text-fg mb-2">Community Average</h3>
                  <div className="flex items-baseline gap-2 mb-4">
                    <p className="text-4xl font-bold text-fg-muted dark:text-fg-muted">75%</p>
                    <span className="text-red-500 font-medium">-5% vs You</span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'Fruity', value: 40 },
                      { label: 'Earthy', value: 20 },
                      { label: 'Spicy', value: 50 },
                      { label: 'Floral', value: 10 },
                      { label: 'Woody', value: 10 }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center">
                        <span className="w-16 text-sm font-medium text-fg-muted dark:text-fg-muted">{item.label}</span>
                        <div className="flex-1 h-2 rounded-full bg-line">
                          <div className="bg-primary/50 h-2 rounded-full" style={{width: `${item.value}%`}}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Form Elements */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Form Elements</h2>
              <div className="bg-white dark:bg-bg-surface p-4 rounded-soft space-y-4">
                <div>
                  <label className="block text-sm font-medium text-fg-muted dark:text-fg-muted mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-line dark:border-line-strong rounded-soft bg-white dark:bg-bg-surface text-fg dark:text-fg"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-fg-muted dark:text-fg-muted mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-line dark:border-line-strong rounded-soft bg-white dark:bg-bg-surface text-fg dark:text-fg"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-fg-muted dark:text-fg-muted mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-line dark:border-line-strong rounded-soft bg-white dark:bg-bg-surface text-fg dark:text-fg"
                    placeholder="Enter your password"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-fg-muted dark:text-fg-muted">Notifications</span>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input className="peer sr-only" type="checkbox" defaultChecked />
                    <div className="peer h-6 w-11 rounded-full bg-line after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-line dark:border-line-strong after:bg-white dark:bg-bg-surface after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                  </label>
                </div>
              </div>
            </section>

            {/* Profile Section */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Profile Section</h2>
              <div className="bg-white dark:bg-bg-surface p-4 rounded-soft">
                <div className="flex flex-col items-center gap-4 mb-6">
                  <div className="relative">
                    <Image
                      alt="Profile avatar"
                      className="h-28 w-28 rounded-full object-cover"
                      src="/generated-images/onboarding/onboarding-discover.webp"
                      width={112}
                      height={112}
                    />
                    <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-md transition-transform hover:scale-110">
                      <span className="material-symbols-outlined text-base">edit</span>
                    </button>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">Alejandro</p>
                    <p className="text-fg-subtle dark:text-fg-muted">@alejandro_mx</p>
                    <p className="text-sm text-fg-subtle dark:text-fg-muted">Joined 2021</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="mb-2 px-2 text-lg font-bold">Personal Information</h3>
                  <div className="divide-y divide-line rounded-soft bg-bg-inset">
                    {[
                      { label: 'Name', value: 'Alejandro' },
                      { label: 'Nationality', value: 'Mexico' },
                      { label: 'Tasting Experience', value: 'Intermediate' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 transition-colors hover:bg-bg-inset dark:hover:bg-bg-inset">
                        <div>
                          <p className="font-medium">{item.label}</p>
                          <p className="text-sm text-fg-subtle dark:text-fg-muted">{item.value}</p>
                        </div>
                        <span className="material-symbols-outlined text-fg-subtle">chevron_right</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Stats Section */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Statistics</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-bg-surface p-4 rounded-soft text-center">
                  <div className="text-3xl font-bold text-primary">24</div>
                  <div className="text-sm text-fg-muted dark:text-fg-muted">Total Tastings</div>
                </div>
                <div className="bg-white dark:bg-bg-surface p-4 rounded-soft text-center">
                  <div className="text-3xl font-bold text-primary">4.2</div>
                  <div className="text-sm text-fg-muted dark:text-fg-muted">Average Score</div>
                </div>
              </div>
            </section>

            {/* Typography Section */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Typography</h2>
              <div className="bg-white dark:bg-bg-surface p-4 rounded-soft space-y-4">
                <div>
                  <h1 className="text-4xl font-bold text-fg dark:text-fg">Heading 1</h1>
                  <p className="text-fg-muted dark:text-fg-muted">Large display text for main headings</p>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-fg dark:text-fg">Heading 2</h2>
                  <p className="text-fg-muted dark:text-fg-muted">Section headings</p>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-fg dark:text-fg">Heading 3</h3>
                  <p className="text-fg-muted dark:text-fg-muted">Card titles and subsections</p>
                </div>
                <div>
                  <p className="text-base text-fg dark:text-fg">Body text - Regular paragraph content</p>
                  <p className="text-sm text-fg-muted dark:text-fg-muted">Small text - Secondary information</p>
                </div>
              </div>
            </section>
          </div>
        </main>

        {/* Bottom Navigation */}
        <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-line dark:border-line bg-bg dark:bg-bg">
          <nav className="flex justify-around p-2">
            <Link className="flex flex-col items-center gap-1 p-2 text-primary" href="/dashboard">
              <span className="material-symbols-outlined">home</span>
              <span className="text-xs font-bold">Home</span>
            </Link>
            <Link className="flex flex-col items-center gap-1 p-2 text-fg-subtle dark:text-fg-muted" href="/taste">
              <span className="material-symbols-outlined">restaurant</span>
              <span className="text-xs font-medium">Taste</span>
            </Link>
            <Link className="flex flex-col items-center gap-1 p-2 text-fg-subtle dark:text-fg-muted" href="/review">
              <span className="material-symbols-outlined">reviews</span>
              <span className="text-xs font-medium">Review</span>
            </Link>
            <Link className="flex flex-col items-center gap-1 p-2 text-fg-subtle dark:text-fg-muted" href="/flavor-wheels">
              <span className="material-symbols-outlined">donut_small</span>
              <span className="text-xs font-medium">Wheels</span>
            </Link>
          </nav>
        </footer>
      </div>
    </div>
  );
}
