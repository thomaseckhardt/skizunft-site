import clsx from 'clsx'
import Icon from '../Icon'

export default function BookingSteps({ steps, currentStep, ...props }) {
  return (
    <nav aria-label="Progress" {...props}>
      <ol role="list" className="flex items-center justify-center">
        {steps.map((step, index) => (
          <li
            key={index}
            className={clsx(
              'relative',
              index < steps.length - 1 && 'pr-16 sm:pr-24',
            )}
          >
            {index < steps.length - 1 && (
              <div
                className="absolute left-0 right-0 top-4 flex items-center"
                aria-hidden="true"
              >
                <div
                  className={clsx(
                    'h-0.5 w-full',
                    index < currentStep.index
                      ? 'bg-brandblue-600'
                      : 'bg-gray-200',
                  )}
                ></div>
              </div>
            )}
            <div
              className={clsx(
                'relative',
                index >= currentStep.index && 'cursor-default',
              )}
              aria-current={step.slug == currentStep.slug}
            >
              {index < currentStep.index && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brandblue-600 text-white transition">
                  <Icon name="checkmark-20-regular" width={20} height={20} />
                </div>
              )}
              {index == currentStep.index && (
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-brandblue-600 bg-white">
                  <span
                    className="h-2.5 w-2.5 rounded-full bg-brandblue-600"
                    aria-hidden="true"
                  ></span>
                </div>
              )}
              {index > currentStep.index && (
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white"></div>
              )}
              <div className="absolute left-1/2 top-full -translate-x-1/2 pt-1 text-center text-xs leading-tight md:whitespace-nowrap md:text-sm">
                <div>{step.label}</div>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  )
}
