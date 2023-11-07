import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import Logo from './Logo'
import clsx from 'clsx'

const navigation = [
  {
    href: '/skischule/',
    name: 'DSV-Skischule',
  },
  {
    href: '/brettlemarkt/',
    name: 'Brettlemarkt',
  },
  {
    href: '/fitness/',
    name: 'Fitness',
  },
  {
    href: '/wanderungen/',
    name: 'Wanderungen',
  },
  {
    href: '/verein/',
    name: 'Verein',
  },
]

const footerNavigation = [
  {
    href: '/jahreshauptversammlung/',
    name: 'Jahreshauptversammlung',
  },
  {
    href: '/kontakt/',
    name: 'Kontakt',
  },
  {
    href: '/datenschutz/',
    name: 'Datenschutz',
  },
  {
    href: '/agb/',
    name: 'AGB',
  },
]

export default function HeaderNew() {
  const [mobileMenuOpen, setMobileMenuOpen2] = useState(false)

  const setMobileMenuOpen = (open) => {
    setMobileMenuOpen2(open)
  }

  return (
    <header className="relative z-header bg-white">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between gap-x-6 p-6 lg:px-8"
        aria-label="Global"
      >
        <div className="flex lg:flex-1">
          <a href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">Skizunft Kollnau</span>
            <Logo className="h-18 w-auto text-brandblue-800" />
          </a>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-base text-brandblue-800 hover:text-brandblue-500"
            >
              {item.name}
            </a>
          ))}
        </div>
        <div className="flex flex-1 items-center justify-end gap-x-6">
          <a href="/buchung/" className="block">
            <div
              className={clsx(
                'font-hero_ text-xl_ rounded-full px-4 py-1.5 text-sm font-semibold shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 md:text-base',
                'bg-brandred-600 text-white  focus-visible:outline-brandred-600',
                'transition ease-in-out',
                'hovers:hover:-translate-y-0.5 hovers:hover:bg-brandred-500 hovers:hover:shadow-lg',
              )}
            >
              Kurs buchen
            </div>
          </a>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Navigation öffnen</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </nav>
      <Dialog
        as="div"
        className="lg:hidden"
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
      >
        <div className="fixed inset-0 z-10" />
        <Dialog.Panel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center gap-x-6">
            <a href="/" className="-m-1.5 p-1.5">
              <span className="sr-only">Skizunft Kollnau</span>
              <Logo className="h-18 w-auto text-brandblue-800" />
            </a>
            <a href="/buchung/" className="block">
              <div
                className={clsx(
                  'font-hero_ text-xl_ rounded-full px-4 py-1.5 text-sm font-semibold shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 md:text-base',
                  'bg-brandred-600 text-white  focus-visible:outline-brandred-600',
                  'transition ease-in-out',
                  'hovers:hover:-translate-y-0.5 hovers:hover:bg-brandred-500 hovers:hover:shadow-lg',
                )}
              >
                Kurs buchen
              </div>
            </a>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Navigation schließen</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  >
                    {item.name}
                  </a>
                ))}
              </div>
              {/* <div className="py-6">
                <a href="/buchung/" className="block">
                  <div
                    className={clsx(
                      'font-hero_ text-xl_ rounded-full px-4 py-1.5 text-sm font-semibold shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 md:text-base',
                      'bg-brandred-600 text-white  focus-visible:outline-brandred-600',
                      'transition ease-in-out',
                      'hovers:hover:-translate-y-0.5 hovers:hover:bg-brandred-500 hovers:hover:shadow-lg',
                    )}
                  >
                    Kurs buchen
                  </div>
                </a>
              </div> */}
              <div className="mt-3 space-y-1 pt-3">
                {footerNavigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="-mx-3 block rounded-lg px-3 py-2 text-base leading-7 text-gray-700  hover:bg-gray-50"
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  )
}
