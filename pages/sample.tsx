import React from 'react';

export default function SamplePage() {
  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-zinc-900 dark:text-zinc-50 min-h-screen pb-20">
      <div className="flex min-h-screen flex-col">
        {/* Header */}
        <header className="flex items-center border-b border-zinc-200 dark:border-zinc-700 p-4">
          <button className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-zinc-100:bg-zinc-800">
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
                <div className="absolute inset-0 bg-cover bg-center rounded-lg" style={{backgroundImage: "url('https://images.unsplash.com/photo-1558221525-4b07c87c713b?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')"}}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-background-light from-0% rounded-lg"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="h-24 w-24 text-white" fill="none" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="4"></circle>
                    <path d="M50 20 L50 80 M20 50 L80 50" stroke="currentColor" strokeLinecap="round" strokeWidth="4"></path>
                    <circle cx="50" cy="50" fill="currentColor" r="10"></circle>
                  </svg>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">Flavatix México</h1>
              <p className="text-zinc-600 dark:text-zinc-300">Taste, analyze, and share your reviews of México's finest beverages.</p>
            </section>

            {/* Buttons Section */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Buttons</h2>
              <div className="space-y-4">
                <button className="flex w-full items-center justify-center gap-3 rounded-lg bg-primary px-4 py-3 text-white font-bold">
                  <span className="material-symbols-outlined">local_bar</span>
                  <span>Primary Button</span>
                </button>

                <div className="flex gap-4">
                  <button className="flex w-full items-center justify-center gap-3 rounded-lg bg-background-light px-4 py-3 font-bold text-zinc-900 dark:text-zinc-50 ring-1 ring-zinc-200">
                    <span className="material-symbols-outlined">login</span>
                    <span>Google</span>
                  </button>
                  <button className="flex w-full items-center justify-center gap-3 rounded-lg bg-background-light px-4 py-3 font-bold text-zinc-900 dark:text-zinc-50 ring-1 ring-zinc-200">
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
                <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">Your Tasting</h3>
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
                        <span className="w-16 text-sm font-medium text-zinc-700 dark:text-zinc-200">{item.label}</span>
                        <div className="flex-1 h-2 rounded-full bg-zinc-200">
                          <div className="bg-primary h-2 rounded-full" style={{width: `${item.value}%`}}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">Community Average</h3>
                  <div className="flex items-baseline gap-2 mb-4">
                    <p className="text-4xl font-bold text-zinc-700 dark:text-zinc-200">75%</p>
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
                        <span className="w-16 text-sm font-medium text-zinc-700 dark:text-zinc-200">{item.label}</span>
                        <div className="flex-1 h-2 rounded-full bg-zinc-200">
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
              <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
                    placeholder="Enter your password"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Notifications</span>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input className="peer sr-only" type="checkbox" defaultChecked />
                    <div className="peer h-6 w-11 rounded-full bg-zinc-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-zinc-300 dark:border-zinc-600 after:bg-white dark:bg-zinc-800 after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                  </label>
                </div>
              </div>
            </section>

            {/* Profile Section */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Profile Section</h2>
              <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg">
                <div className="flex flex-col items-center gap-4 mb-6">
                  <div className="relative">
                    <img
                      alt="Profile avatar"
                      className="h-28 w-28 rounded-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSm5L3p6blsbUuAYpXRwOUXiE9ky-AG-Sz02psWS4h2zpw708v3wxwh3vpP_kxSkiZLVPIVbc50Sum9TFvXaGx34RR_d75YveTw6iFE2CLka45Fnl0xDoMmyNF5jFTHB-eCJmuUtzL2cbc7gpDVJEx8twzlWe0CTe5K8PoK1rq2M4oTnueMIIUovn1mLFQ9lokszpggl6N3QhvWXt3E1GS2LLRfFY7VjXZtc9kb7EGzg9JNruX2yADzNn-jHP12ks41kRFQprNbeM"
                    />
                    <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-md transition-transform hover:scale-110">
                      <span className="material-symbols-outlined text-base">edit</span>
                    </button>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">Alejandro</p>
                    <p className="text-zinc-500 dark:text-zinc-300">@alejandro_mx</p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-300">Joined 2021</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="mb-2 px-2 text-lg font-bold">Personal Information</h3>
                  <div className="divide-y divide-zinc-200 rounded-lg bg-zinc-50">
                    {[
                      { label: 'Name', value: 'Alejandro' },
                      { label: 'Nationality', value: 'Mexico' },
                      { label: 'Tasting Experience', value: 'Intermediate' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 transition-colors hover:bg-zinc-100:bg-zinc-700">
                        <div>
                          <p className="font-medium">{item.label}</p>
                          <p className="text-sm text-zinc-500 dark:text-zinc-300">{item.value}</p>
                        </div>
                        <span className="material-symbols-outlined text-zinc-400">chevron_right</span>
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
                <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-primary">24</div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-300">Total Tastings</div>
                </div>
                <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-primary">4.2</div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-300">Average Score</div>
                </div>
              </div>
            </section>

            {/* Typography Section */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Typography</h2>
              <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg space-y-4">
                <div>
                  <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">Heading 1</h1>
                  <p className="text-zinc-600 dark:text-zinc-300">Large display text for main headings</p>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Heading 2</h2>
                  <p className="text-zinc-600 dark:text-zinc-300">Section headings</p>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Heading 3</h3>
                  <p className="text-zinc-600 dark:text-zinc-300">Card titles and subsections</p>
                </div>
                <div>
                  <p className="text-base text-zinc-900 dark:text-zinc-50">Body text - Regular paragraph content</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300">Small text - Secondary information</p>
                </div>
              </div>
            </section>
          </div>
        </main>

        {/* Bottom Navigation */}
        <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 dark:border-zinc-700 bg-background-light dark:bg-background-dark">
          <nav className="flex justify-around p-2">
            <a className="flex flex-col items-center gap-1 p-2 text-primary" href="/dashboard">
              <span className="material-symbols-outlined">home</span>
              <span className="text-xs font-bold">Home</span>
            </a>
            <a className="flex flex-col items-center gap-1 p-2 text-zinc-500 dark:text-zinc-300" href="/taste">
              <span className="material-symbols-outlined">restaurant</span>
              <span className="text-xs font-medium">Taste</span>
            </a>
            <a className="flex flex-col items-center gap-1 p-2 text-zinc-500 dark:text-zinc-300" href="/review">
              <span className="material-symbols-outlined">reviews</span>
              <span className="text-xs font-medium">Review</span>
            </a>
            <a className="flex flex-col items-center gap-1 p-2 text-zinc-500 dark:text-zinc-300" href="/flavor-wheels">
              <span className="material-symbols-outlined">donut_small</span>
              <span className="text-xs font-medium">Wheels</span>
            </a>
          </nav>
        </footer>
      </div>
    </div>
  );
}
