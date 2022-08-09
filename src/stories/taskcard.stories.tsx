import * as React from 'react'

import { ComponentMeta, ComponentStory } from '@storybook/react'

import { TaskCard } from '../components/taskcard'

export default {
  title: 'Todo/TaskCard',
  component: TaskCard,
} as ComponentMeta<typeof TaskCard>

const Template: ComponentStory<typeof TaskCard> = (args) => (
  <TaskCard {...args} />
)

export const Primary = Template.bind({})

Primary.args = {
  title: 'TaskCard format',
  description: 'Make up some shit to do',
  dueDate: new Date(),
}
