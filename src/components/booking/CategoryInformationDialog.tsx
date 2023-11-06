import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { Tab } from '@headlessui/react'

const tabs = [
  { name: 'Beginner', current: true },
  { name: 'Jr Champion', current: false },
  { name: 'Champion', current: false },
]
const panels = [
  {
    name: 'Beginner',
    content: (
      <div className="prose prose-sm">
        <p className="font-bold">
          Unser Beginner Kurs richtet sich an Kinder, …
        </p>
        <ul>
          <li>
            die bisher noch keine Erfahrungen mit dem Skifahren gemacht haben.
          </li>
          <li>die am Tag des Kurses zum ersten Mal auf dem Ski stehen.</li>
          <li>die Spaß daran haben, sich im Schnee zu bewegen.</li>
        </ul>

        <p className="font-bold">Im Beginner Kurs lernt das Kind</p>
        <ul>
          <li>Sich sicher auf dem Ski zu bewegen</li>
          <li>Punktuell und sicher zu bremsen.</li>
          <li>Die ersten Pflugkurven im flachen Gelände zu fahren.</li>
        </ul>
      </div>
    ),
  },
  {
    name: 'Junior Champion',
    content: (
      <div className="prose prose-sm">
        <p className="font-bold">
          Unser Junior Champion Kurs richtet sich an Kinder,
        </p>
        <ul>
          <li>
            die sich bereits sicher auf dem Ski (fort)bewegen können. die
            sicher.
          </li>
          <li>die bremsen können.</li>
          <li>
            für die aneinanderhängende Pflugkurven im flachen Gelände kein
            Problem sind.
          </li>
        </ul>

        <p className="font-bold">Im Junior Champion Kurs lernt das Kind</p>
        <ul>
          <li>Zu liften.</li>
          <li>Kurven in paralleler Skistellung zu fahren.</li>
          <li>In unterschiedlichen Hangneigungen parallel Ski zufahren.</li>
        </ul>
      </div>
    ),
  },
  {
    name: 'Champion',
    content: (
      <div className="prose prose-sm">
        <p className="font-bold">Unser Champion Kurs richtet sich an Kinder,</p>
        <ul>
          <li>die sicher liften können.</li>
          <li>
            die Kurven überwiegend mit einer parallelen Skistellung fahren.
          </li>
          <li>die sicher an unterschiedlichen Hangneigungen bremsen können.</li>
          <li>
            die einen längeren Pistenabschnitt am Stück, ohne Pausen fahren
            können.
          </li>
          <li>
            die sich beim Fahren in unterschiedlichen Hangneigungen sicher
            fühlen.
          </li>
        </ul>

        <p className="font-bold">Im Champion Kurs lernt das Kind</p>
        <ul>
          <li>In unterschiedlichen Geländeformen sicher zu fahren.</li>
          <li>
            Durch den gezielten Einsatz komplexer Übungsformen, variabel Ski zu
            fahren.
          </li>
          <li>Den Ski sportlich auf der Kante zu fahren (Carving).</li>
        </ul>
      </div>
    ),
  },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Example(props) {
  const { open, setOpen } = props

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="z-overlays relative" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <Tab.Group>
                    <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                      <div className="p-6">
                        <div className="flex items-start justify-between">
                          <Dialog.Title className="text-base font-semibold leading-6 text-gray-900">
                            Skikurs Könnenstufen
                          </Dialog.Title>
                          <div className="ml-3 flex h-7 items-center">
                            <button
                              type="button"
                              className="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-sky-500"
                              onClick={() => setOpen(false)}
                            >
                              <span className="absolute -inset-2.5" />
                              <span className="sr-only">
                                Könnenstufen Informationen schließen
                              </span>
                              <XMarkIcon
                                className="h-6 w-6"
                                aria-hidden="true"
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="border-b border-gray-200">
                        <div className="px-6">
                          <Tab.List>
                            <nav className="-mb-px flex space-x-4">
                              {tabs.map((tab) => (
                                <Tab key={tab.name} as={Fragment}>
                                  {({ selected }) => (
                                    <button
                                      type="button"
                                      className={classNames(
                                        selected
                                          ? 'border-sky-500 text-sky-600'
                                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                                        'whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium',
                                      )}
                                    >
                                      {tab.name}
                                    </button>
                                  )}
                                </Tab>
                              ))}
                            </nav>
                          </Tab.List>
                        </div>
                      </div>
                      <Tab.Panels>
                        <div className="flex-1 divide-y divide-gray-200 overflow-y-auto">
                          {panels.map((panel) => (
                            <Tab.Panel key={panel.name}>
                              <div className="px-5 py-6">{panel.content}</div>
                            </Tab.Panel>
                          ))}
                        </div>
                      </Tab.Panels>
                    </div>
                  </Tab.Group>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
