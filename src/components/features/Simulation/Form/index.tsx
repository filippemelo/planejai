import { simulationFormSteps } from '@/data/simulation'

import { FormStep } from '../FormStep'
import { FormProgress } from '../Progress'

export const SimulationForm = () => {
  const currentStep = simulationFormSteps[0]

  return (
    <>
      <FormProgress currentStep={1} totalSteps={6} />
      <FormStep key={currentStep.id} {...currentStep} />
    </>
  )
}
